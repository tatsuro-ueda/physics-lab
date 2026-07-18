// ============================================================
// 🔰チュートリアル共通エンジン（正本はこのファイル1つ）
// ------------------------------------------------------------
// 進捗ドット・「あと◯つ」・完了/もっとやる・localStorage・🔰トグル・
// 見た目(CSS)・パネルDOM を全部ここが持つ。加速度・音響SW など各ページは
// createTutorial({...}) を1回呼び、ステップ定義と入力の与え方だけ書く。
//
// 入力の与え方（どちらでも可・併用可）:
//   tut.tick(e)          … 動き駆動（毎フレーム呼ぶ。加速度の devicemotion）
//   tut.event(name, data)… イベント駆動（音響SWの armed/measuring/done）
//
// ステップ定義（factory は api を受け取り、ステップ実体を返す）:
//   (api) => ({
//     html: () => '文言',
//     tick?: (e)=>bool,          // 動き駆動でクリア判定（true でクリア）
//     needsActive?: true,        // 計測中(cfg.isActive)のときだけ tick する
//     on?: 'done', check?, fail?,// イベント駆動。check偽なら api.note(fail(data))
//     observe?: true,            // 「見えた！つぎへ」ボタンで進むステップ
//     guess?: true, onGuess?:(g)=>void,  // 予想ボタン（cfg.guessOptions 必須）
//   })
//   api = { note(t), markGuess(g), setQuestion(t), isActive() }
// ============================================================
(function () {
  const CSS = `
  .missions { max-width: 760px; margin: 0 auto 10px; background:#22261c; border:1px solid #4a5334; border-radius:6px; padding:10px 14px; font-size:0.95rem; text-align:left; }
  .m-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .m-head .m-title { color:#a8c26a; font-weight:bold; }
  .m-dots { letter-spacing:3px; font-size:0.9rem; color:#4a5334; }
  .m-dots .on { color:#ffe000; } .m-dots .now { color:#a8c26a; } .m-dots .m-remain { color:#a8c26a; font-size:0.8rem; }
  .m-body { color:#eee; padding:4px 0; min-height:1.5rem; }
  .m-body.cleared { animation:m-flash 0.9s; }
  @keyframes m-flash { 0%{background:#4a5334;} 100%{background:transparent;} }
  .m-guess { margin-top:8px; }
  .m-guess button { background:#333; color:#eee; border:1px solid #555; border-radius:6px; padding:5px 16px; margin:0 3px; cursor:pointer; font-size:0.95rem; }
  .m-guess button.picked { background:#ffe000; color:#1a1a1a; border-color:#ffe000; }
  .m-next { background:#ffe000; color:#1a1a1a; border:none; border-radius:6px; padding:6px 18px; margin-top:8px; cursor:pointer; font-size:0.95rem; }
  .m-note { color:#e8a56a; margin-top:6px; font-size:0.85rem; min-height:1rem; }
  .m-done-btns { text-align:right; margin-top:8px; }
  .m-done-btns button { background:#333; color:#eee; border:1px solid #555; border-radius:6px; padding:6px 18px; margin-left:8px; cursor:pointer; font-size:0.95rem; }
  .m-done-btns button.m-more { background:#ffe000; color:#1a1a1a; border-color:#ffe000; }
  .tut-pulse { animation:m-pulse 1.1s ease-in-out 4; }
  @keyframes m-pulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.35);} }
  /* 完了バッジ：アイコンの右下隅に小さく重ねる（下に折り返して巨大表示されるのを防ぐ） */
  .tut-done-badge { position:absolute; right:3px; bottom:4px; pointer-events:none; display:block; }
  .tut-ico { vertical-align:-3px; }
  `;
  // 完了バッジはヘッダーのSVGアイコン群と揃えたフラットなSVG（緑丸＋白チェック）
  const DONE_BADGE_SVG =
    '<svg class="tut-done-badge" viewBox="0 0 16 16" width="12" height="12" aria-label="完了">' +
    '<circle cx="8" cy="8" r="8" fill="#2fae4a"/>' +
    '<path d="M4.4 8.4l2.4 2.4 4.8-5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  // チュートリアル文中で使う小さなフラットSVGアイコン（絵文字の代わり）。
  // ページ側のステップ文・completeText からも window.TUT_ICONS で使える。
  const ico = (path) =>
    '<svg class="tut-ico" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">' + path + '</svg>';
  window.TUT_ICONS = {
    play: ico('<path d="M8 5v14l11-7z"/>'),
    pause: ico('<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>'),
    trash: ico('<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>'),
    cap: ico('<path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>'),
    phone: ico('<path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/>'),
    repeat: ico('<path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>'),
    mic: ico('<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>'),
    timer: ico('<path d="M15 1H9v2h6V1zm-2 13h-2V8h2v6zm6.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>'),
    check:
      '<svg class="tut-ico" viewBox="0 0 16 16" width="16" height="16">' +
      '<circle cx="8" cy="8" r="8" fill="#2fae4a"/>' +
      '<path d="M4.4 8.4l2.4 2.4 4.8-5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>',
  };
  const PANEL =
    '<div class="missions" hidden>' +
    '<div class="m-head"><span class="m-title">' + window.TUT_ICONS.cap + ' チュートリアル</span><span class="m-dots"></span></div>' +
    '<div class="m-body"></div>' +
    '<div class="m-guess" hidden></div>' +
    '<button class="m-next" hidden>見えた！つぎへ</button>' +
    '<div class="m-note"></div>' +
    '<div class="m-done-btns" hidden>' +
    '<button class="m-restart">最初から</button>' +
    '<button class="m-more">もっとやる</button>' +
    '<button class="m-close">閉じる</button>' +
    '</div></div>';

  window.createTutorial = function (cfg) {
    // cfg: { keyPrefix, mountId, toggleBtnId, steps[], moreSteps[]?, completeText?,
    //        guessOptions?, isActive?, inactiveNote? }
    if (!document.getElementById('tutorial-css')) {
      const st = document.createElement('style');
      st.id = 'tutorial-css'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    const mount = document.getElementById(cfg.mountId);
    mount.innerHTML = PANEL;
    const panel = mount.querySelector('.missions');
    const mDots = panel.querySelector('.m-dots');
    const mBody = panel.querySelector('.m-body');
    const mGuess = panel.querySelector('.m-guess');
    const mNext = panel.querySelector('.m-next');
    const mNote = panel.querySelector('.m-note');
    const mDoneBtns = panel.querySelector('.m-done-btns');
    const mRestart = panel.querySelector('.m-restart');
    const mMore = panel.querySelector('.m-more');
    const mClose = panel.querySelector('.m-close');
    const toggleBtn = document.getElementById(cfg.toggleBtnId);

    const M_KEY = cfg.keyPrefix + '-step';
    const SEEN_KEY = cfg.keyPrefix + '-seen';
    // ボタンの中身（絵文字でもSVGアイコンでも）を保存して、完了時は✅を添えるだけにする。
    // innerHTML を '🔰' 固定で上書きすると、ページ側がSVGアイコンにしたとき壊れるため。
    const baseIcon = toggleBtn.innerHTML;
    const hasMore = cfg.moreSteps && cfg.moreSteps.length > 0;
    const rand = (a) => a[Math.floor(Math.random() * a.length)];

    if (cfg.guessOptions) {
      mGuess.innerHTML = '予想：' +
        cfg.guessOptions.map(g => '<button data-g="' + g + '">' + g + '</button>').join('');
    }
    function markGuess(picked) {
      mGuess.querySelectorAll('button').forEach(b => b.classList.toggle('picked', b.dataset.g === picked));
    }

    // ステップに渡す小さなAPI（DOMを直接触らせない）
    const api = {
      note: (t) => { mNote.innerHTML = t; },   // ステップ文と同様にSVGアイコンを混ぜられるようinnerHTML
      markGuess,
      setQuestion: (t) => { mBody.innerHTML = prefix() + t; },
      isActive: () => (cfg.isActive ? cfg.isActive() : true),
    };

    let mode = 'tutorial';
    let current = null;
    let stepIndex = 0;
    try { stepIndex = Math.max(0, Math.min(cfg.steps.length, parseInt(localStorage.getItem(M_KEY) || '0', 10))); } catch (e) {}
    function save() { try { localStorage.setItem(M_KEY, String(stepIndex)); } catch (e) {} }
    function prefix() { return mode === 'tutorial' ? '(' + (stepIndex + 1) + ') ' : window.TUT_ICONS.repeat + ' '; }

    function renderDots() {
      if (mode !== 'tutorial') { mDots.innerHTML = ''; return; }
      let s = '';
      for (let i = 0; i < cfg.steps.length; i++) {
        const cls = i < stepIndex ? 'on' : (i === stepIndex ? 'now' : '');
        s += '<span class="' + cls + '">●</span>';
      }
      const remain = cfg.steps.length - stepIndex;
      mDots.innerHTML = s + (remain > 0 ? ' <span class="m-remain">あと' + remain + 'つ</span>' : '');
    }

    function showComplete() {
      current = null; renderDots();
      mBody.innerHTML = cfg.completeText || (window.TUT_ICONS.check + ' チュートリアル完了！');
      mNote.textContent = ''; mGuess.hidden = true; mNext.hidden = true;
      mDoneBtns.hidden = false; mRestart.hidden = false; mClose.hidden = false; mMore.hidden = !hasMore;
      toggleBtn.style.position = 'relative';
      toggleBtn.innerHTML = baseIcon + DONE_BADGE_SVG;
    }

    function load() {
      mNote.textContent = ''; markGuess(null);
      mNext.hidden = true; mDoneBtns.hidden = true; mGuess.hidden = true;
      if (mode === 'tutorial') {
        renderDots();
        if (stepIndex >= cfg.steps.length) { showComplete(); return; }
        current = cfg.steps[stepIndex](api);
        toggleBtn.innerHTML = baseIcon;
      } else {
        mDots.innerHTML = '';
        current = rand(cfg.moreSteps)(api);
        mDoneBtns.hidden = false; mRestart.hidden = false; mClose.hidden = false; mMore.hidden = true;
      }
      mBody.innerHTML = prefix() + current.html();
      if (current.guess) mGuess.hidden = false;
      if (current.observe) mNext.hidden = false;
    }

    function clear() {
      mBody.classList.remove('cleared'); void mBody.offsetWidth; mBody.classList.add('cleared');
      current = null;
      if (mode === 'tutorial') { stepIndex++; save(); }
      setTimeout(load, 900);
    }

    // 入力: 動き駆動
    function tick(e) {
      if (!current || !current.tick) return;
      if (current.needsActive && !api.isActive()) {
        if (cfg.inactiveNote) mNote.textContent = cfg.inactiveNote;
        return;
      }
      if (current.tick(e)) clear();
    }
    // 入力: イベント駆動
    function event(name, data) {
      if (!current || current.observe || !current.on || current.on !== name) return;
      if (current.check && !current.check(data)) { mNote.textContent = current.fail ? current.fail(data) : 'もう一度'; return; }
      if (current.check) mNote.textContent = 'ぴったり！✅';
      clear();
    }

    mGuess.addEventListener('click', (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      markGuess(b.dataset.g);
      if (current && current.onGuess) current.onGuess(b.dataset.g);
    });
    mNext.addEventListener('click', () => { if (current && current.observe) clear(); });
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.remove('tut-pulse');
      panel.hidden = !panel.hidden;
      try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    });
    mRestart.addEventListener('click', () => { mode = 'tutorial'; stepIndex = 0; save(); load(); });
    mMore.addEventListener('click', () => { mode = 'more'; load(); });
    mClose.addEventListener('click', () => { panel.hidden = true; });

    load();
    let seen = false; try { seen = !!localStorage.getItem(SEEN_KEY); } catch (e) {}
    if (!seen) toggleBtn.classList.add('tut-pulse');

    return { tick, event };
  };
})();
