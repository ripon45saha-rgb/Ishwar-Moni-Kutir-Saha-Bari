const CACHE_NAME = "ishwarmani-kutir-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.add("/")
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        return (await caches.match("/")) ||
          new Response("ইন্টারনেট সংযোগ নেই।");
      }

      return new Response("", { status: 503 });
    })
  );
});
