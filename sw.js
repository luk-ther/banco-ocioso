self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = String(event.notification?.data?.url || "index.html");

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of allClients) {
      if ("focus" in client) {
        if (client.url.includes(targetUrl) || targetUrl === "index.html") {
          await client.focus();
          return;
        }
      }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow(targetUrl);
    }
  })());
});
