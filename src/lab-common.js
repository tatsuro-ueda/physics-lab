// =====================================================================
// タブレット物理実験ラボ 共通部品（正本はこのファイル1つだけ）
// ---------------------------------------------------------------------
// 3軸センサーページ（acceleration / gyroscope / magnetometer）の
// グラフ描画・タップ操作・拡大縮小・▶⏸・🗑・⬇ を全部ここで引き受ける。
// 各ページは createXYZLab({...}) を1回呼び、センサー固有の処理だけ書く。
// どこに何があるかは README.md の「部品対応表」を参照。
// =====================================================================

function createXYZLab(cfg) {
  // cfg.unit      : 表示単位（例 'm/s²'）
  // cfg.digits    : ヘッダー現在値の小数桁数
  // cfg.padMin    : 縦軸autoスケールの最小余白（グラフが平らな時の見た目を決める）
  // cfg.noDataMsg : 3秒待ってもデータが来ないときの案内（HTML可）
  // cfg.start     : async (lab) => エラーメッセージ or null。許可取得とリスナー登録を行う
  // cfg.onReset   : （任意）🗑時のページ固有の後始末

  const AXES = ['x', 'y', 'z'];
  const COLORS = { x: '#ff9500', y: '#d4c400', z: '#e04040' };
  const HIT_PX = 30;          // 「線の上」とみなすタップ距離（canvas座標）
  const MAX_SAMPLES = 150000; // 安全上限（約40分ぶん）

  const buf = { x: [], y: [], z: [] };  // 値（全履歴を保持）
  const tbuf = [];                       // 経過時間（秒）。phyphox同様、時間軸を圧縮して全体を表示
  const marker = { x: null, y: null, z: null };
  let t0 = null;
  let running = false;
  let started = false;
  let gotData = false;

  const playBtn = document.getElementById('playBtn');
  const errEl = document.getElementById('err');

  // ---- 時間軸 ----
  function timeSpan() {
    return Math.max(tbuf.length ? tbuf[tbuf.length - 1] : 0, 2);
  }

  function pickTimeStep(span) {
    const steps = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    for (const s of steps) if (span / s <= 8) return s;
    return 1200;
  }

  // タップ位置の時刻に一番近いサンプルを探す
  function nearestIndex(targetT) {
    const len = tbuf.length;
    let i = Math.min(Math.max(Math.round(targetT / timeSpan() * (len - 1)), 0), len - 1);
    for (let j = Math.max(0, i - 30); j < Math.min(len, i + 30); j++) {
      if (Math.abs(tbuf[j] - targetT) < Math.abs(tbuf[i] - targetT)) i = j;
    }
    return i;
  }

  // ---- 拡大縮小 ----
  function toggleZoom(card) {
    if (document.body.classList.contains('zoom')) {
      document.body.classList.remove('zoom');
      card.classList.remove('zoomed');
    } else {
      document.body.classList.add('zoom');
      card.classList.add('zoomed');
    }
  }

  // ---- タップ操作：線の近く→値を表示／それ以外→拡大・縮小 ----
  AXES.forEach(ax => {
    const card = document.getElementById('card-' + ax);
    card.querySelector('.head').addEventListener('click', () => toggleZoom(card));
    const cvEl = document.getElementById('cv-' + ax);
    cvEl.addEventListener('click', (ev) => {
      const rect = cvEl.getBoundingClientRect();
      const cx = (ev.clientX - rect.left) / rect.width * cvEl.width;
      const cy = (ev.clientY - rect.top) / rect.height * cvEl.height;
      const arr = buf[ax];
      if (arr.length >= 2) {
        let min = Math.min(...arr), max = Math.max(...arr);
        const pad = Math.max((max - min) * 0.15, cfg.padMin);
        min -= pad; max += pad;
        const i = nearestIndex(cx / cvEl.width * timeSpan());
        const ly = cvEl.height - ((arr[i] - min) / (max - min)) * cvEl.height;
        if (Math.abs(cy - ly) < HIT_PX) { marker[ax] = i; return; }   // 線の上→値
      }
      toggleZoom(card);                                                // 線の外→拡大/縮小
    });
  });

  // ---- ▶⏸：計測の開始・一時停止 ----
  playBtn.addEventListener('click', async () => {
    if (running) {                    // 一時停止
      running = false;
      playBtn.textContent = '▶';
      return;
    }
    if (!started) {
      const err = await cfg.start(api);   // 許可取得＋リスナー登録（ページ固有）
      if (err) { errEl.innerHTML = err; return; }
      started = true;
      setTimeout(() => {
        if (!gotData) errEl.innerHTML = cfg.noDataMsg;
      }, 3000);
      draw();
    }
    // 再開時：ポーズしていた時間を除いて時間軸を連続させる
    if (tbuf.length) t0 = performance.now() / 1000 - tbuf[tbuf.length - 1];
    AXES.forEach(ax => marker[ax] = null);   // 再開時はタップ値の表示を消す
    running = true;
    errEl.textContent = '';
    playBtn.textContent = '⏸';
  });

  // ---- 🗑：計測を止めてデータを消す（phyphoxのデータ削除と同じ） ----
  document.getElementById('resetBtn').addEventListener('click', () => {
    running = false;
    playBtn.textContent = '▶';
    t0 = null;
    tbuf.length = 0;
    AXES.forEach(ax => {
      buf[ax].length = 0;
      marker[ax] = null;
      document.getElementById('val-' + ax).textContent = '--';
      const c = document.getElementById('cv-' + ax);
      c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
    if (cfg.onReset) cfg.onReset();
  });

  // ---- ⬇：ダウンロードは<a download>の標準動作に任せる ----
  // 配信されるHTMLは build.py が共通JSを埋め込んだ単一ファイルなので、そのまま保存すれば完結する。

  // ---- データ受け入れ口（ページ固有リスナーから呼ばれる） ----
  function push(x, y, z) {
    if (!running) return;
    gotData = true;
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    tbuf.push(now - t0);
    buf.x.push(x); buf.y.push(y); buf.z.push(z);
    AXES.forEach(ax => {
      document.getElementById('val-' + ax).textContent =
        buf[ax][buf[ax].length - 1].toFixed(cfg.digits) + ' ' + cfg.unit;
    });
    if (tbuf.length > MAX_SAMPLES) {
      running = false;
      playBtn.textContent = '▶';
      errEl.textContent = '記録が長くなったので自動停止しました（🗑 で消去できます）';
    }
  }

  // ---- 描画（phyphox方式：時間軸を圧縮して全履歴を表示） ----
  function draw() {
    requestAnimationFrame(draw);
    AXES.forEach(ax => drawGraph(
      document.getElementById('cv-' + ax), buf[ax], COLORS[ax], marker[ax]));
  }

  function drawGraph(cv, arr, color, mIdx) {
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    if (arr.length < 2) return;

    const span = timeSpan();

    // 縦の自動スケール
    let min = Math.min(...arr), max = Math.max(...arr);
    const pad = Math.max((max - min) * 0.15, cfg.padMin);
    min -= pad; max += pad;
    const toX = t => (t / span) * W;
    const toY = v => H - ((v - min) / (max - min)) * H;

    // 横グリッド（値）
    ctx.strokeStyle = '#2a2a2a';
    ctx.fillStyle = '#888';
    ctx.font = '13px sans-serif';
    for (let i = 0; i <= 4; i++) {
      const v = min + (max - min) * i / 4;
      const y = toY(v);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillText(v.toFixed(1), 6, Math.min(Math.max(y - 4, 14), H - 4));
    }
    // 縦グリッド（時間）
    const tStep = pickTimeStep(span);
    for (let t = tStep; t < span; t += tStep) {
      const x = toX(t);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.fillText((tStep < 1 ? t.toFixed(1) : Math.round(t)) + 's', x + 4, H - 6);
    }
    // ゼロ線を強調
    if (min < 0 && max > 0) {
      const y0 = toY(0);
      ctx.strokeStyle = '#555';
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
    }

    // データ線（サンプルが多いときは間引く）
    const len = arr.length;
    const stride = Math.max(1, Math.floor(len / W));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(tbuf[0]), toY(arr[0]));
    for (let i = stride; i < len; i += stride) {
      ctx.lineTo(toX(tbuf[i]), toY(arr[i]));
    }
    ctx.lineTo(toX(tbuf[len - 1]), toY(arr[len - 1]));
    ctx.stroke();

    // タップした点の値（有効数字2桁）
    if (mIdx !== null && mIdx < len) {
      const x = toX(tbuf[mIdx]);
      const y = toY(arr[mIdx]);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      const label = Number(arr[mIdx].toPrecision(2)).toString();
      ctx.font = 'bold 16px sans-serif';
      const tw = ctx.measureText(label).width;
      const lx = Math.min(Math.max(x - tw / 2, 4), W - tw - 4);
      const ly = y > 34 ? y - 14 : y + 28;
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(lx - 4, ly - 16, tw + 8, 22);
      ctx.fillStyle = '#fff';
      ctx.fillText(label, lx, ly);
    }
  }

  const api = {
    push,
    isRunning: () => running,
    // 🔰ミッション用フック（ページ固有スクリプトから拡大・数値表示を判定するため）
    hasMarker: () => AXES.some(ax => marker[ax] !== null),
    isZoomed: () => document.body.classList.contains('zoom'),
    // タブ離脱などで計測を止め、センサーを手放す（cfg.stop でページ固有リスナーを解除させる）。
    // started を戻すので、次に ▶ を押すと cfg.start が再度呼ばれてリスナーが張り直される。
    release: () => {
      running = false;
      started = false;
      playBtn.textContent = '▶';
      if (cfg.stop) cfg.stop();
    },
  };
  return api;
}
