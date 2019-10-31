const CACHE_VERSION = 4;

const BASE_CACHE_FILES = [
  "/css/font-awesome.min.css",
  "/css/main.min.css",
  "/fonts/fontawesome-webfont.woff2",
  "/apple-touch-icon.png",
  "/bundle.min.js",
  "/favicon.ico",
  "/index.json"
];

const OFFLINE_CACHE_FILES = [
  "/css/font-awesome.min.css",
  "/css/main.min.css",
  "/fonts/fontawesome-webfont.woff2",
  "/offline/index.html",
  "/bundle.min.js"
];

const NOT_FOUND_CACHE_FILES = [
  "/css/font-awesome.min.css",
  "/css/main.min.css",
  "/fonts/fontawesome-webfont.woff2",
  "/404.html",
  "/bundle.min.js"
];

const OFFLINE_PAGE = "/offline/index.html";
const NOT_FOUND_PAGE = "/404.html";

const CACHE_VERSIONS = {
  assets: "assets-v" + CACHE_VERSION,
  content: "content-v" + CACHE_VERSION,
  offline: "offline-v" + CACHE_VERSION,
  notFound: "404-v" + CACHE_VERSION
};

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
  return Promise.all([
    caches.open(CACHE_VERSIONS.assets).then(cache => {
      return cache.addAll(BASE_CACHE_FILES);
    }),
    caches.open(CACHE_VERSIONS.offline).then(cache => {
      return cache.addAll(OFFLINE_CACHE_FILES);
    }),
    caches.open(CACHE_VERSIONS.notFound).then(cache => {
      return cache.addAll(NOT_FOUND_CACHE_FILES);
    })
  ]).then(() => {
    return self.skipWaiting();
  });
}

/**
 * cleanupLegacyCache
 * @returns {Promise}
 */
function cleanupLegacyCache() {
  let currentCaches = Object.keys(CACHE_VERSIONS).map(key => {
    return CACHE_VERSIONS[key];
  });

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
      return (
        cachedResponse ? null :
        fetch(url).then(response => {
          if (response) {
            return event.waitUntil(
              caches
                .open(CACHE_VERSIONS.content)
                .then(cache => cache.put(url, response.clone()))
            );
          } else {
            return null;
          }
        })
      );
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
  return caches.match(new Request(OFFLINE_PAGE).clone());
}

function cacheRequest(request, event) {
  return caches.match(request.clone()).then(cachedResponse => {
    return (
      cachedResponse ||
      fetch(request.clone()).then(response => {
        event.waitUntil(
          caches
            .open(CACHE_VERSIONS.content)
            .then(cache => cache.put(request, response))
        );
        return response.clone();
      })
    );
  });
}

self.addEventListener("fetch", function fetchHandler(event) {
  event.respondWith(cacheRequest(event.request, event).catch(defaultResponse));
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
