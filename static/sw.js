const CACHE_VERSION = 7;
const CACHE_NAME = `content-v${CACHE_VERSION}`;
const CACHE_FILES = [
  "/css/font-awesome.min.css",
  "/css/main.min.css",
  "/img/sourcerer.jpg",
  "/img/sourcerer_hov.jpg",
  "/fonts/fontawesome-webfont.woff2",
  "/offline/index.html",
  "/404.html",
  "/apple-touch-icon.png",
  "/bundle.min.js",
  "/favicon.ico",
  "/index.json",
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

function preCacheUrl(url) {
  if (!isBlacklisted(url)) {
    return caches.match(url).then(cachedResponse => {
      return cachedResponse
        ? null
        : fetch(url).then(response => {
            if (response) {
              return event.waitUntil(
                caches
                  .open(CACHE_NAME)
                  .then(cache => cache.put(url, response.clone()))
              );
            } else {
              return null;
            }
          });
    });
  }
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

function cacheRequest(event) {
  const { request } = event;
  return caches.open(CACHE_NAME).then(cache => {
    return cache.match(request).then(cachedResponse => {
      if (cachedResponse != undefined) {
        console.log("Returning item from cache");
        return cachedResponse;
      }
      console.log("Cache contains no match, requesting URL");
      fetch(request).then(response => {
        cache.put(request, response.clone());
        console.log("Successfully requested URL and put response in cache.")
        return response;
      })
    });
  });
}

self.addEventListener("fetch", function fetchHandler(event) {
  console.log(`Intercepted request for URL: ${event.request.url}`);
  if (!SUPPORTED_METHODS.includes(event.request.method)) return;
  event.respondWith(cacheRequest(event).catch(defaultResponse));
});

self.addEventListener("message", event => {
  if (typeof event.data === "object" && typeof event.data.action === "string") {
    switch (event.data.action) {
      case "cache":
        precacheUrl(event.data.url);
        break;
      default:
        console.log("Unknown action: " + event.data.action);
        break;
    }
  }
});
