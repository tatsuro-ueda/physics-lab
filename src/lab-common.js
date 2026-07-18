// =====================================================================
// タブレット物理実験ラボ 共通部品（正本はこのファイル1つだけ）
// ---------------------------------------------------------------------
// 3軸センサーページ（acceleration / gyroscope / magnetometer）の
// グラフ描画・タップ操作・拡大縮小・▶⏸・🗑 を全部ここで引き受ける。
// 各ページは createXYZLab({...}) を1回呼び、センサー固有の処理だけ書く。
// どこに何があるかは README.md の「部品対応表」を参照。
//
// 描画は uPlot（Canvas 2D）に載せて、時間軸・値軸をピンチ/パン拡大できる。
// phyphox の「自由落下区間だけを切り出して拡大」相当が学校端末（iPad/Chromebook）で可能。
// ピンチ/パンは自前の Pointer Events 実装（外部プラグイン非依存）。
// =====================================================================

function createXYZLab(cfg) {
  // cfg.unit      : 表示単位（例 'm/s²'）
  // cfg.digits    : ヘッダー現在値の小数桁数
  // cfg.padMin    : 縦軸autoスケールの最小余白（グラフが平らな時の見た目を決める）
  // cfg.noDataMsg : 3秒待ってもデータが来ないときの案内（HTML可）
  // cfg.start     : async (lab) => エラーメッセージ or null。許可取得とリスナー登録を行う
  // cfg.onReset   : （任意）🗑時のページ固有の後始末

  const AXES = ['x', 'y', 'z'];
  const COLORS = { x: '#4C8DF0', y: '#4FC96B', z: '#F2C744', abs: '#eeeeee' };
  const MAX_SAMPLES = 150000;

  // ページに card-abs があれば |a| モードを扱う。無ければxyzのみ（gyroscope/magnetometerは従来通り）。
  const hasAbs = !!document.getElementById('card-abs');
  const KEYS = hasAbs ? ['x', 'y', 'z', 'abs'] : AXES;

  const buf = { x: [], y: [], z: [], abs: [] };  // 値（全履歴を保持）
  const tbuf = [];                                // 経過時間（秒）
  let t0 = null;
  let running = false;
  let started = false;
  let gotData = false;
  let mode = 'xyz';           // 'xyz' | 'abs'（hasAbs=falseなら常にxyz）
  function activeKeys() { return mode === 'abs' ? ['abs'] : AXES; }

  // 時間軸の表示ウィンドウ。autoFollow=true のときは新データが来るたびに右端に追従する。
  // ユーザーがピンチ/パンで動かしたら autoFollow=false になり、明示的にリセットするまで固定。
  const viewT = { autoFollow: true, min: 0, max: 2 };
  const viewV = {};   // key -> { autoScale, min, max }
  KEYS.forEach(k => viewV[k] = { autoScale: true, min: 0, max: 1 });

  const uplots = {};  // key -> uPlot instance
  const mounts = {};  // key -> mount div
  const tips = {};    // key -> tooltip div（タップした点の値を吹き出しで表示）

  const playBtn = document.getElementById('playBtn');
  const errEl = document.getElementById('err');

  injectStyleOnce();
  KEYS.forEach(setupChart);

  // uPlot の必須CSSを1回だけhead に注入（build.py が JS しか埋め込まないため、CSSはここで注入）。
  function injectStyleOnce() {
    if (document.getElementById('lab-uplot-style')) return;
    const st = document.createElement('style');
    st.id = 'lab-uplot-style';
    st.textContent =
      '.uplot,.uplot *,.uplot *::before,.uplot *::after{box-sizing:border-box}' +
      '.uplot{font-family:system-ui,-apple-system,sans-serif;line-height:1.5;width:min-content}' +
      '.u-wrap{position:relative;user-select:none}' +
      '.u-over,.u-under{position:absolute}' +
      '.u-under{overflow:hidden}' +
      '.uplot canvas{display:block;position:relative;width:100%;height:100%}' +
      '.u-axis{position:absolute}' +
      '.u-cursor-x,.u-cursor-y{position:absolute;left:0;top:0;pointer-events:none;will-change:transform}' +
      '.u-hz .u-cursor-x{height:100%;border-right:1px dashed #607D8B}' +
      '.u-hz .u-cursor-y{width:100%;border-bottom:1px dashed #607D8B}' +
      '.u-cursor-pt{position:absolute;top:0;left:0;border-radius:50%;border:0 solid;pointer-events:none;will-change:transform;background-clip:padding-box!important}' +
      '.u-select{background:rgba(255,224,0,0.15);position:absolute;pointer-events:none}' +
      '.u-axis.u-off,.u-select.u-off,.u-cursor-x.u-off,.u-cursor-y.u-off,.u-cursor-pt.u-off{display:none}' +
      // タブレット物理実験ラボ 側の追加：uPlot マウント枠と、拡大時のサイズ
      '.uplot-mount{width:100%;height:180px;background:#000;position:relative;touch-action:none}' +
      'body.zoom .card.zoomed .uplot-mount{height:60vh}' +
      // タップした点の値をグラフ内に浮かべる吹き出し（phyphox風）。u.over（描画エリア）にDOMで載せる。
      '.lab-tip{position:absolute;pointer-events:none;background:rgba(0,0,0,0.85);color:#fff;' +
      'font:bold 13px system-ui,sans-serif;padding:3px 7px;border-radius:4px;' +
      'transform:translate(-50%,-140%);white-space:nowrap;display:none;z-index:5;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.6)}' +
      '.lab-tip.show{display:block}';
    document.head.appendChild(st);
  }

  function setupChart(key) {
    const card = document.getElementById('card-' + key);
    if (!card) return;
    // 既存のHTMLに残っている <canvas id="cv-XXX"> を、uPlotが自分のcanvasを作るためのdivに置き換える
    const oldCanvas = card.querySelector('canvas');
    const mount = document.createElement('div');
    mount.className = 'uplot-mount';
    mount.id = 'cv-' + key;   // 既存のIDを引き継ぐ（onClick等の判定は使わないが将来のため）
    if (oldCanvas) oldCanvas.replaceWith(mount);
    else card.appendChild(mount);
    mounts[key] = mount;

    const opts = {
      width: mount.clientWidth || 720,
      height: mount.clientHeight || 180,
      pxAlign: false,
      // 上端はタイトルをグラフ内に重ねる領域（カード側 .head が absolute で載る）。
      // 最上段の目盛りラベルがタイトルに隠れない高さを確保する。
      padding: [32, 8, 0, 0],
      scales: {
        // x軸は自動追従・ピンチで制御するので auto:false + viewT 直参照
        x: { time: false, auto: false, range: () => [viewT.min, viewT.max] },
        // y軸は uPlot に data の min/max を計算させ、range 関数で余白・|a|の下限0を後処理
        y: { auto: true, range: (u, dataMin, dataMax) => yRangeFor(key, dataMin, dataMax) },
      },
      axes: [
        {
          stroke: '#aaa', ticks: { stroke: '#444', size: 4 }, grid: { stroke: '#3a3a3a' },
          font: '13px sans-serif',
          values: (u, ticks) => ticks.map(v => v.toFixed(v < 1 ? 1 : 0) + 's'),
        },
        {
          stroke: '#aaa', ticks: { stroke: '#444', size: 4 }, grid: { stroke: '#3a3a3a' },
          font: '13px sans-serif', size: 46,
        },
      ],
      series: [
        {},
        { stroke: COLORS[key], width: 2, points: { show: false } },
      ],
      cursor: {
        drag: { setScale: false },   // uPlot内蔵のドラッグ選択ズームは切って、自前のpinch/panに任せる
        x: false, y: false,           // 十字カーソル（縦横の点線）を消す。値は val-key に出す。
        points: { show: true, size: 10 },
      },
      legend: { show: false },
      hooks: {
        // cursor（タップ位置）が動くたびに、値を見出し右の val-key と、グラフ内の吹き出しの両方に反映する。
        // cursor が線から離れた（idxがnull）なら、val-keyは最新値、吹き出しは隠す。
        setCursor: [u => {
          const el = document.getElementById('val-' + key);
          const tip = tips[key];
          const idx = u.cursor.idx;
          // 拡大表示中でなければ吹き出しは出さない（phyphox流：小グラフでは値吹き出しなし）
          const zoomed = document.body.classList.contains('zoom');
          if (!zoomed || idx == null || u.data[1][idx] == null) {
            if (tip) tip.classList.remove('show');
            if (el) {
              const a = buf[key];
              el.textContent = a.length ? a[a.length - 1].toFixed(cfg.digits) + ' ' + cfg.unit : '--';
            }
            return;
          }
          const v = u.data[1][idx], t = u.data[0][idx];
          if (el) el.textContent = v.toFixed(cfg.digits) + ' ' + cfg.unit + ' @ ' + t.toFixed(2) + 's';
          if (tip) {
            const xPx = u.valToPos(t, 'x');
            const yPx = u.valToPos(v, 'y');
            tip.style.left = xPx + 'px';
            tip.style.top = yPx + 'px';
            // 値は有効数字3桁で phyphox に近い読みやすさに
            tip.textContent = Number(v.toPrecision(3)) + ' ' + cfg.unit;
            tip.classList.add('show');
          }
        }],
      },
    };
    uplots[key] = new uPlot(opts, [[], []], mount);
    // 吹き出しは overlay 層（描画エリア）に載せる。plot 内座標で valToPos が返す値そのままで置ける。
    const tip = document.createElement('div');
    tip.className = 'lab-tip';
    uplots[key].over.appendChild(tip);
    tips[key] = tip;
    attachPinchPan(mount, key, card);
    // 初期サイズ再計測（display:noneのカードは clientWidth==0 で作られるのを補正）
    setTimeout(() => resizePlot(key), 30);
  }

  // uPlot が渡してくる dataMin/dataMax（auto:true の副産物）を使い、|a|は下限0固定、余白と潰れ対策を後処理。
  // ユーザーが値軸を明示的にズームした場合（viewV[key].autoScale=false）はそちらを優先。
  function yRangeFor(key, dataMin, dataMax) {
    const v = viewV[key];
    if (!v.autoScale) return [v.min, v.max];
    if (dataMin == null || dataMax == null) return [-1, 1];
    const minZero = (key === 'abs');
    let mn = minZero ? 0 : dataMin;
    let mx = dataMax;
    const pad = Math.max((mx - mn) * 0.15, cfg.padMin);
    if (!minZero) mn -= pad;
    mx += pad;
    if (mn === mx) mx = mn + 1;
    return [mn, mx];
  }

  function resizePlot(key) {
    const m = mounts[key];
    if (!m || !uplots[key]) return;
    const w = m.clientWidth, h = m.clientHeight;
    if (w > 0 && h > 0) uplots[key].setSize({ width: w, height: h });
  }
  window.addEventListener('resize', () => KEYS.forEach(resizePlot));

  // ---- ピンチ/パン（Pointer Events） ----
  // 2本指 → 時間軸のピンチ拡大（ピンチ中心の t 座標を軸に指数スケール）
  // 1本指ドラッグ → 時間軸方向のパン（自動追従OFF）
  // ダブルタップ → 表示ウィンドウをリセットして自動追従復帰
  function attachPinchPan(el, key, card) {
    const cache = new Map();
    let prevDist = 0, prevCenterX = 0;
    let panPrevX = 0;
    let lastTapTime = 0;
    let tapStart = null;   // 「動きなし短時間」の判定用（グラフ内タップでカード拡大/解除）

    el.addEventListener('pointerdown', e => {
      cache.set(e.pointerId, e);
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      if (cache.size === 2) {
        const pts = Array.from(cache.values());
        prevDist = Math.abs(pts[1].clientX - pts[0].clientX);
        prevCenterX = (pts[0].clientX + pts[1].clientX) / 2;
        tapStart = null;   // 2本指入ったらタップ判定は打ち切り
      } else if (cache.size === 1) {
        panPrevX = e.clientX;
        tapStart = { t: performance.now(), x: e.clientX, y: e.clientY };
        // ダブルタップ検知
        const now = performance.now();
        if (now - lastTapTime < 300) resetView();
        lastTapTime = now;
      }
    });

    el.addEventListener('pointermove', e => {
      if (!cache.has(e.pointerId)) return;
      cache.set(e.pointerId, e);
      const u = uplots[key];
      if (!u) return;
      const rect = el.getBoundingClientRect();

      if (cache.size === 2) {
        const pts = Array.from(cache.values());
        const dist = Math.abs(pts[1].clientX - pts[0].clientX);
        const centerX = (pts[0].clientX + pts[1].clientX) / 2;
        if (prevDist > 5 && dist > 5) {
          const scale = dist / prevDist;
          // ピンチ中心のピクセル→時間座標
          const tc = viewT.min + (centerX - rect.left) / rect.width * (viewT.max - viewT.min);
          const newMin = tc - (tc - viewT.min) / scale;
          const newMax = tc + (viewT.max - tc) / scale;
          // 最小幅0.05秒までに制限
          if (newMax - newMin >= 0.05) {
            viewT.min = newMin;
            viewT.max = newMax;
            viewT.autoFollow = false;
            u.setScale('x', { min: viewT.min, max: viewT.max });
          }
        }
        prevDist = dist;
        prevCenterX = centerX;
      } else if (cache.size === 1) {
        // ダブルタップ判定中は少しの動きでpan扱いにしない
        const dx = e.clientX - panPrevX;
        if (Math.abs(dx) < 2) return;
        panPrevX = e.clientX;
        // 動いたらタップではない
        if (tapStart) tapStart = null;
        const dt = -dx / rect.width * (viewT.max - viewT.min);
        viewT.min += dt;
        viewT.max += dt;
        viewT.autoFollow = false;
        u.setScale('x', { min: viewT.min, max: viewT.max });
      }
    });

    const endPointer = e => {
      cache.delete(e.pointerId);
      if (cache.size < 2) prevDist = 0;
      // タップと判定できるとき（動きなし・300ms以内・指1本）
      if (tapStart && performance.now() - tapStart.t < 300 && cache.size === 0) {
        const zoomed = document.body.classList.contains('zoom');
        if (!zoomed) {
          // 通常時：どこをタップしても拡大へ
          toggleCardZoom(card);
        } else {
          // 拡大時：線の近くをタップ=値の吹き出し、線から離れた場所のタップ=元のサイズへ戻る。
          // setPointerCaptureで uPlot 側の cursor が動いていない可能性があるため、
          // 自前で最寄りの点を探し、u.setCursor で明示的に位置決めする。
          // 座標系は uPlot の plot area（u.over 要素）を基準に揃える（valToPos の返り値と一致）。
          const u = uplots[key];
          let onLine = false;
          if (u && tbuf.length) {
            const plotRect = u.over.getBoundingClientRect();
            const tapX = tapStart.x - plotRect.left;
            const tapY = tapStart.y - plotRect.top;
            // タップ位置の時間座標
            const t = viewT.min + tapX / plotRect.width * (viewT.max - viewT.min);
            // 最寄りindexを線形サーチ（数百〜数千点なら十分速い）
            let idx = 0, best = Infinity;
            for (let i = 0; i < tbuf.length; i++) {
              const d = Math.abs(tbuf[i] - t);
              if (d < best) { best = d; idx = i; }
            }
            const v = buf[key][idx];
            if (v != null) {
              const ptX = u.valToPos(tbuf[idx], 'x');
              const ptY = u.valToPos(v, 'y');
              const dist = Math.hypot(tapX - ptX, tapY - ptY);
              if (dist < 30) {
                onLine = true;
                // uPlotのcursorを明示的にその点へ動かす → setCursor hook が発火して吹き出し表示
                u.setCursor({ left: ptX, top: ptY });
              }
            }
          }
          if (!onLine) toggleCardZoom(card);
        }
      }
      tapStart = null;
    };
    el.addEventListener('pointerup', endPointer);
    el.addEventListener('pointercancel', endPointer);
  }

  function resetView() {
    viewT.autoFollow = true;
    KEYS.forEach(k => viewV[k].autoScale = true);
    updateViewFollow();
    KEYS.forEach(k => {
      if (!uplots[k]) return;
      // y軸は auto:true+range関数 なので setData で dataMin/dataMax を再走査させる
      uplots[k].setData([tbuf, buf[k]]);
      uplots[k].setScale('x', { min: viewT.min, max: viewT.max });
    });
  }

  function updateViewFollow() {
    if (!viewT.autoFollow) return;
    const span = Math.max(tbuf.length ? tbuf[tbuf.length - 1] : 0, 2);
    viewT.min = 0;
    viewT.max = span;
  }

  // ---- カード拡大（div、既存UX） ----
  function toggleCardZoom(card) {
    if (document.body.classList.contains('zoom')) {
      document.body.classList.remove('zoom');
      card.classList.remove('zoomed');
    } else {
      document.body.classList.add('zoom');
      card.classList.add('zoomed');
    }
    // uPlot の canvas に新しいサイズを反映
    setTimeout(() => KEYS.forEach(resizePlot), 60);
  }

  // ---- ▶⏸：計測の開始・一時停止 ----
  // ヘッダーは絵文字ではなくラインSVGアイコン（index.htmlのリデザインと同じ言語）。
  // currentColor で描くので、ボタンの color がそのままアイコン色になる。
  const PLAY_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="計測開始"><path d="M8 5v14l11-7z"/></svg>';
  const PAUSE_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="一時停止"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  function setPlayIcon(playing) { playBtn.innerHTML = playing ? PAUSE_SVG : PLAY_SVG; }
  setPlayIcon(false);
  playBtn.addEventListener('click', async () => {
    if (running) {
      running = false;
      setPlayIcon(false);
      return;
    }
    if (!started) {
      const err = await cfg.start(api);
      if (err) { errEl.innerHTML = err; return; }
      started = true;
      setTimeout(() => { if (!gotData) errEl.innerHTML = cfg.noDataMsg; }, 3000);
    }
    if (tbuf.length) t0 = performance.now() / 1000 - tbuf[tbuf.length - 1];
    running = true;
    errEl.textContent = '';
    setPlayIcon(true);
  });

  // ---- 🗑：計測を止めてデータを消す（phyphoxのデータ削除と同じ） ----
  document.getElementById('resetBtn').addEventListener('click', () => {
    running = false;
    setPlayIcon(false);
    t0 = null;
    tbuf.length = 0;
    KEYS.forEach(key => {
      buf[key].length = 0;
      const valEl = document.getElementById('val-' + key);
      if (valEl) valEl.textContent = '--';
      if (uplots[key]) uplots[key].setData([[], []]);
    });
    resetView();
    if (cfg.onReset) cfg.onReset();
  });

  // ---- データ受け入れ口（ページ固有リスナーから呼ばれる） ----
  function push(x, y, z) {
    if (!running) return;
    gotData = true;
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    tbuf.push(now - t0);
    buf.x.push(x); buf.y.push(y); buf.z.push(z);
    if (hasAbs) buf.abs.push(Math.sqrt(x * x + y * y + z * z));
    activeKeys().forEach(key => {
      const el = document.getElementById('val-' + key);
      if (el) el.textContent = buf[key][buf[key].length - 1].toFixed(cfg.digits) + ' ' + cfg.unit;
    });
    updateViewFollow();
    // 表示中のグラフだけ更新（非表示側は setData をスキップしても、モード切替時にまとめて追いつく）
    activeKeys().forEach(k => {
      if (uplots[k]) uplots[k].setData([tbuf, buf[k]]);
    });
    if (tbuf.length > MAX_SAMPLES) {
      running = false;
      setPlayIcon(false);
      errEl.textContent = '記録が長くなったので自動停止しました（🗑 で消去できます）';
    }
  }

  const api = {
    push,
    isRunning: () => running,
    // 🔰ミッション用（既存互換）
    hasMarker: () => false,
    isZoomed: () => document.body.classList.contains('zoom'),
    // タブ離脱などで計測を止め、センサーを手放す
    release: () => {
      running = false;
      started = false;
      setPlayIcon(false);
      if (cfg.stop) cfg.stop();
    },
    // 表示モード切替（'xyz' | 'abs'）。ページ側のUIから呼ぶ。
    setMode: (m) => {
      if (!hasAbs || (m !== 'xyz' && m !== 'abs')) return;
      mode = m;
      if (document.body.classList.contains('zoom')) {
        document.body.classList.remove('zoom');
        document.querySelectorAll('.card.zoomed').forEach(c => c.classList.remove('zoomed'));
      }
      const setDisp = (key, on) => {
        const el = document.getElementById('card-' + key);
        if (el) el.style.display = on ? '' : 'none';
      };
      AXES.forEach(ax => setDisp(ax, mode === 'xyz'));
      setDisp('abs', mode === 'abs');
      activeKeys().forEach(key => {
        const el = document.getElementById('val-' + key);
        if (!el) return;
        const a = buf[key];
        el.textContent = a.length ? a[a.length - 1].toFixed(cfg.digits) + ' ' + cfg.unit : '--';
      });
      // 表示に切り替わった uPlot にサイズ再計測とデータ再同期
      setTimeout(() => {
        activeKeys().forEach(k => {
          resizePlot(k);
          if (uplots[k]) uplots[k].setData([tbuf, buf[k]]);
        });
      }, 60);
    },
    getMode: () => mode,
  };
  return api;
}
