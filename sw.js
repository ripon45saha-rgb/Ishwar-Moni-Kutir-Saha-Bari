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

/* ঈশ্বরমনি কুঠির Web Push service worker */

self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = {
      body: event.data ? event.data.text() : ''
    };
  }

  const title = data.title || 'ঈশ্বরমনি কুঠির';

  const options = {
    body: data.body || 'নতুন ঘোষণা প্রকাশিত হয়েছে।',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {
      url: data.url || '/'
    },
    tag: data.tag || 'ishwarmani-announcement',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || '/',
    self.location.origin
  ).href;

  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of clientsList) {
      if (
        client.url.startsWith(self.location.origin) &&
        'focus' in client
      ) {
        await client.focus();

        if ('navigate' in client && client.url !== target) {
          await client.navigate(target);
        }

        return;
      }
    }

    if (clients.openWindow) {
      await clients.openWindow(target);
    }
  })());
});
