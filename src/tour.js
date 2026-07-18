// オンボーディングツアー（driver.js 利用）。初回訪問時だけ自動で始まり、
// UIの場所を8ステップで案内する。グラフの読み方の「体験」は🔰チュートリアル（tutorial.js）の役割で、
// このツアーは「どこに何があるか」だけを30秒で伝える。
// 正本はこのファイル。driver.js / driver.css は vendor（無改変）。
(function () {
  const SEEN_KEY = 'phylab-acc-tour-seen';

  // phyphox風テーマ（黒地＋黄色）。vendor の driver.css は触らず、ここで上書きする。
  const style = document.createElement('style');
  style.textContent =
    '.driver-popover { background: #222; color: #eee; border: 1px solid #444; }' +
    // 注意：driver.jsのタイトルは<header>要素。ページ側の header{} スタイル
    // （黄色背景・高さ52px・sticky）が当たってしまうため、ここで全て打ち消す。
    '.driver-popover-title { background: none; color: var(--phx-orange); font-size: 1rem;' +
    '  height: auto; padding: 0; position: static; display: block; z-index: auto; }' +
    '.driver-popover-description { color: #ccc; font-size: 0.9rem; }' +
    '.driver-popover-progress-text { color: #999; }' +
    '.driver-popover-close-btn { color: #999; }' +
    '.driver-popover-footer button.driver-popover-footer-btn {' +
    '  background: var(--phx-orange); color: #1a1a1a; border: none; border-radius: 4px;' +
    '  padding: 4px 10px; font-weight: bold; text-shadow: none; }' +
    '.driver-popover-footer button.driver-popover-btn-disabled { background: #444; color: #888; }' +
    '.driver-popover-arrow-side-top { border-top-color: #222; }' +
    '.driver-popover-arrow-side-bottom { border-bottom-color: #222; }' +
    '.driver-popover-arrow-side-left { border-left-color: #222; }' +
    '.driver-popover-arrow-side-right { border-right-color: #222; }';
  document.head.appendChild(style);

  // ▶🗑🔰の3ボタンはヘッダー内でバラバラの要素なので、まとめて指すための
  // 透明アンカー（3ボタンを囲む矩形）をヘッダーの上に重ねて、それをツアーの対象にする。
  function placeButtonsAnchor() {
    const first = document.getElementById('playBtn');
    const last = document.getElementById('missionBtn');
    if (!first || !last) return;
    const r1 = first.getBoundingClientRect(), r2 = last.getBoundingClientRect();
    const sx = window.scrollX, sy = window.scrollY;
    let el = document.getElementById('tour-anchor-buttons');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tour-anchor-buttons';
      el.style.position = 'absolute';
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
    }
    el.style.left = (r1.left + sx) + 'px';
    el.style.top = (Math.min(r1.top, r2.top) + sy) + 'px';
    el.style.width = (r2.right - r1.left) + 'px';
    el.style.height = Math.max(r1.height, r2.height) + 'px';
  }
  function removeButtonsAnchor() {
    document.getElementById('tour-anchor-buttons')?.remove();
  }

  function startTour() {
    placeButtonsAnchor();
    const d = window.driver.js.driver({
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: '次へ',
      prevBtnText: '戻る',
      doneBtnText: 'おわり',
      overlayOpacity: 0.7,
      stagePadding: 6,
      onDestroyed: () => {
        removeButtonsAnchor();
        try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
      },
      // 説明は各20文字以内（読む負担を最小にする）
      steps: [
        { element: '.tabs',
          popover: { title: '表示の切りかえ', description: '3つの見方を切りかえられるよ', side: 'bottom' } },
        { element: '#card-x',
          popover: { title: 'グラフ', description: '縦軸はm/s²、横軸は秒だよ', side: 'bottom' } },
        { element: '#tour-anchor-buttons',
          popover: { title: 'ボタン', description: '▶計測、🗑削除、🔰ミッション', side: 'bottom' } },
      ],
    });
    d.drive();
  }

  // 初回訪問のときだけ、レイアウト確定後に自動で開始する
  let seen = false;
  try { seen = !!localStorage.getItem(SEEN_KEY); } catch (e) {}
  if (!seen) {
    window.addEventListener('load', () => setTimeout(startTour, 500));
  }
})();
