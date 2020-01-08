const CACHE_VERSION = 9;
const CACHE_NAME = `content-v${CACHE_VERSION}`;
const OFFLINE_PAGE = "/offline/index.html";
const NOT_FOUND_PAGE = "/404.html";
const SUPPORTED_METHODS = ["GET"];
const SUPPORTED_URL_SCHEMES = ["http:", "https:"];

const CACHE_FILES = [
  "/offline/index.html",
  "/404.html",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/manifest.json"
];

const MAX_TTL = {
  "/": 3600,
  html: 3600,
  json: 86400,
  js: 86400,
  css: 86400
};

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

function getFileExtension(url) {
  let extension = url
    .split(".")
    .reverse()[0]
    .split("?")[0];
  return extension.endsWith("/") ? "/" : extension;
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

self.addEventListener("fetch", function fetchHandler(event) {
  const { request } = event;
  const url = new URL(request.url);
  if (!SUPPORTED_METHODS.includes(request.method)) {
    return Promise.reject(`unsupported-request-type: ${request.method} ${url}`);
  }
  if (!SUPPORTED_URL_SCHEMES.includes(url.protocol)) {
    return Promise.reject(`unsupported-url-scheme: ${url}`);
  }
  console.log(`intercepted fetch event for: ${url}`)
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse && !isCachedResponseExpired(cachedResponse, getTTL(url))) {
      console.log(`retrieved cached response for: ${url}`);
      console.log(`completed fetch event for: ${url}`);
      return cachedResponse;
    }
    if (cachedResponse) {
      console.log(`cached response for ${url} is expired`)
    }
    else {
      console.log(`cache contains no-match for: ${url}`);
    }
    console.log(`requesting ${url} from network...`);
    const response = await fetch(event.request);
    if (!response || response.status !== 200 || response.type !== 'basic') {
      console.log(`fetch-error: ${response.type} CODE: ${response.status} (${url})`);
      console.log(`completed fetch event for: ${url}`);
      return response;
    }
    console.log(`successfully retrieved: ${url}`);
    console.log(`adding response to cache: ${url}`);
    await cache.put(event.request, response.clone());
    console.log(`completed fetch event for: ${url}`);
    return response;
  })());
});
