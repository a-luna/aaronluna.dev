const CACHE_VERSION = 8;
const CACHE_NAME = `content-v${CACHE_VERSION}`;
const CACHE_FILES = [
  "/offline/index.html",
  "/404.html",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/manifest.json"
];

const OFFLINE_PAGE = "/offline/index.html";
const NOT_FOUND_PAGE = "/404.html";

// Define MAX_TTL's in SECONDS for specific file extensions
const MAX_TTL = {
  "/": 3600,
  html: 3600,
  json: 86400,
  js: 86400,
  css: 86400
};

const CACHE_BLACKLIST = [
  str => {
    return !str.startsWith("http://localhost");
  }
];

const SUPPORTED_METHODS = ["GET"];
const SUPPORTED_URL_SCHEMES = ["http:", "https:"];

/**
 * isBlackListed
 * @param {string} url
 * @returns {boolean}
 */
function isBlacklisted(url) {
  return CACHE_BLACKLIST.length > 0
    ? !CACHE_BLACKLIST.filter(rule => {
        if (typeof rule === "function") {
          return !rule(url);
        } else {
          return false;
        }
      }).length
    : false;
}

/**
 * getFileExtension
 * @param {string} url
 * @returns {string}
 */
function getFileExtension(url) {
  let extension = url
    .split(".")
    .reverse()[0]
    .split("?")[0];
  return extension.endsWith("/") ? "/" : extension;
}

/**
 * getTTL
 * @param {string} url
 */
function getTTL(url) {
  if (typeof url === "string") {
    let extension = getFileExtension(url);
    if (typeof MAX_TTL[extension] === "number") {
      return MAX_TTL[extension];
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/**
 * installServiceWorker
 * @returns {Promise}
 */
function installServiceWorker() {
  return caches
    .open(CACHE_NAME)
    .then(cache => {
      return cache.addAll(CACHE_FILES);
    })
    .then(() => {
      return self.skipWaiting();
    });
}

/**
 * cleanupLegacyCache
 * @returns {Promise}
 */
function cleanupLegacyCache() {
  let currentCaches = [CACHE_NAME];
  return new Promise((resolve, reject) => {
    caches
      .keys()
      .then(keys => {
        return (legacyKeys = keys.filter(key => {
          return !~currentCaches.indexOf(key);
        }));
      })
      .then(legacy => {
        if (legacy.length) {
          Promise.all(
            legacy.map(legacyKey => {
              return caches.delete(legacyKey);
            })
          )
            .then(() => {
              resolve();
            })
            .catch(err => {
              reject(err);
            });
        } else {
          resolve();
        }
      })
      .catch(() => {
        reject();
      });
  });
}

self.addEventListener("install", event => {
  event.waitUntil(Promise.all([installServiceWorker(), self.skipWaiting()]));
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      cleanupLegacyCache(),
      self.clients.claim(),
      self.skipWaiting()
    ]).catch(err => {
      event.skipWaiting();
    })
  );
});

function defaultResponse() {
  return caches.match(OFFLINE_PAGE);
}

function isCachedResponseExpired(response, ttl) {
  const date = getRequestDateFromCachedResponse(response);
  if (!date) {
    return false;
  }
  let age = parseInt((new Date().getTime() - date.getTime()) / 1000);
  return ttl && age > ttl;
}

function getRequestDateFromCachedResponse(response) {
  let headers = response.headers.entries();
  for (let pair of headers) {
    if (pair[0] === "date") {
      return new Date(pair[1]);
    }
  }
  return null;
}

function getFromCache(request, url) {
  return caches.open(CACHE_NAME).then(cache => {
    return cache.match(request).then(cachedResponse => {
      return cachedResponse && !isCachedResponseExpired(cachedResponse, getTTL(url))
      ? cachedResponse
      : Promise.reject("no-match")
    });
  });
}

function updateCache(request) {
  return caches.open(CACHE_NAME).then(cache => {
    return fetch(request).then(response => {
      if (!response || response.status >= 400) return;
      return cache.put(request, response);
    });
  });
}

self.addEventListener("fetch", function fetchHandler(event) {
  const { request } = event;
  const url = new URL(request.url);
  if (!SUPPORTED_METHODS.includes(request.method)) {
    return Promise.reject("unsupported-request-type");
  }
  if (!SUPPORTED_URL_SCHEMES.includes(url.protocol)) {
    return Promise.reject("unsupported-url-scheme");
  }
  event.respondWith(getFromCache(request, url));
  event.waitUntil(updateCache(request).catch(defaultResponse));
});
