/* ホーム画面から起動できるようにするための最小の Service Worker。
 *
 * このサイトは1ページ＝1枚の自己完結HTML（build.py がJS/CSSを全部埋め込む）なので、
 * 後追いキャッシュする「静的資産」が存在しない。だから何もキャッシュしない。
 * 計測ページを中途半端にキャッシュすると「直したのに古い画面が出る」という
 * 分かりにくい壊れ方をするので、HTMLは常にネットワークから取る。
 *
 * やることは1つだけ：ページを開こうとして通信に失敗したとき offline.html を返す。
 *
 * GitHub Pages のサブパス配信（/physics-lab/）なので、パスは絶対で書かず
 * この sw.js 自身の位置から解決する。
 */

const CACHE = "shell-v1";
const OFFLINE_URL = new URL("offline.html", self.location.href).href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  // ページ遷移だけを見る。センサー計測・画像・その他はすべて素通し。
  if (request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(() => caches.match(OFFLINE_URL))
  );
});
