const CACHE_NAME = "training-app-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./cloud-sync.js",
  "./plan-data.js",
  "./exercise-catalog.js",
  "./meal-presets.js",
  "./exercise-calories.js",
  "./charts.js",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(ASSETS.map((url) => fetch(url, { cache: "no-store" }).then((res) => cache.put(url, res)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネットワーク優先: オンライン時は常に最新を取得してキャッシュを更新し、
// オフライン時のみキャッシュへフォールバックします（更新の取りこぼしを防ぐため）。
// cache: "no-store" で、GitHub Pages等のHTTPキャッシュ(Cache-Control: max-age)を
// 経由した古い応答を掴まないようにしています。
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const networkRequest = new Request(event.request, { cache: "no-store" });
  event.respondWith(
    fetch(networkRequest)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
