// オンボーディングツアーの共通エンジン（driver.js 利用）。
// ページ側は createOnboardingTour({ key, steps, prepare?, cleanup? }) を呼ぶだけ。
// 初回訪問時だけ自動で始まり、完了・スキップで localStorage に記録して以後は出さない。
// UIの場所案内だけを担当し、「体験」は🔰チュートリアル（tutorial.js）の役割。
// 正本はこのファイル。driver.js / driver.css は vendor（無改変）。
(function () {
  // phyphox風テーマ（黒地＋黄色）。vendor の driver.css は触らず、ここで上書きする。
  const style = document.createElement('style');
  style.textContent =
    '.driver-popover { background: #222; color: #eee; border: 1px solid #444; }' +
    // 注意：driver.jsのタイトルは<header>要素。ページ側の header{} スタイル
    // （黄色背景・高さ52px・sticky）が当たってしまうため、ここで全て打ち消す。
    '.driver-popover-title { background: none; color: #ffe000; font-size: 1rem;' +
    '  height: auto; padding: 0; position: static; display: block; z-index: auto;' +
    '  margin: 0 0 4px; text-align: left; }' +
    '.driver-popover-description { color: #ccc; font-size: 0.9rem; }' +
    '.driver-popover-progress-text { color: #999; }' +
    '.driver-popover-close-btn { color: #999; }' +
    '.driver-popover-footer button.driver-popover-footer-btn {' +
    '  background: #ffe000; color: #1a1a1a; border: none; border-radius: 4px;' +
    '  padding: 4px 10px; font-weight: bold; text-shadow: none; }' +
    '.driver-popover-footer button.driver-popover-btn-disabled { background: #444; color: #888; }' +
    '.driver-popover-arrow-side-top { border-top-color: #222; }' +
    '.driver-popover-arrow-side-bottom { border-bottom-color: #222; }' +
    '.driver-popover-arrow-side-left { border-left-color: #222; }' +
    '.driver-popover-arrow-side-right { border-right-color: #222; }';
  document.head.appendChild(style);

  // cfg: {
  //   key:     localStorage の既読キー（ページごとに変える）
  //   steps:   driver.js のステップ配列（説明は各20文字以内が目安）
  //   prepare: ツアー開始直前の準備（アンカー要素の設置など。省略可）
  //   cleanup: ツアー終了時の後片付け（アンカー撤去など。省略可)
  // }
  window.createOnboardingTour = function (cfg) {
    function start() {
      if (cfg.prepare) cfg.prepare();
      const d = window.driver.js.driver({
        showProgress: true,
        progressText: '{{current}} / {{total}}',
        nextBtnText: '次へ',
        prevBtnText: '戻る',
        doneBtnText: 'おわり',
        overlayOpacity: 0.7,
        stagePadding: 6,
        onDestroyed: () => {
          if (cfg.cleanup) cfg.cleanup();
          try { localStorage.setItem(cfg.key, '1'); } catch (e) {}
        },
        steps: cfg.steps,
      });
      d.drive();
    }

    // 初回訪問のときだけ、レイアウト確定後に自動で開始する
    let seen = false;
    try { seen = !!localStorage.getItem(cfg.key); } catch (e) {}
    if (!seen) {
      if (document.readyState === 'complete') setTimeout(start, 500);
      else window.addEventListener('load', () => setTimeout(start, 500));
    }
    return { start };
  };
})();
