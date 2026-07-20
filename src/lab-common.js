// =====================================================================
// タブレット物理実験ラボ 共通部品（正本はこのファイル1つだけ）
// ---------------------------------------------------------------------
// 3軸センサーページと位置ページで共有する、時系列グラフの土台。
// uPlot による描画、タップ値読み、拡大縮小、ピンチ/パンをここへ集約する。
// 各ページは createTimeSeriesCharts(...) か createXYZLab(...) を呼び、
// 入力取得と物理量の変換だけをページ側へ残す。
// =====================================================================

function injectLabUplotStyle() {
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
    '.uplot-mount{width:100%;height:var(--lab-plot-height,180px);background:#000;position:relative;touch-action:none}' +
    'body.zoom .card.zoomed .uplot-mount{height:60vh}' +
    '.lab-tip{position:absolute;pointer-events:none;background:rgba(0,0,0,0.85);color:#fff;' +
    'font:bold 13px system-ui,sans-serif;padding:3px 7px;border-radius:4px;' +
    'transform:translate(-50%,-140%);white-space:nowrap;display:none;z-index:5;' +
    'box-shadow:0 1px 3px rgba(0,0,0,0.6)}' +
    '.lab-tip.show{display:block}' +
    '.lab-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
    'padding:16px;color:#666;font:16px system-ui,sans-serif;text-align:center;pointer-events:none}';
  document.head.appendChild(st);
}

function toggleCardZoom(card) {
  const alreadyZoomed = document.body.classList.contains('zoom') && card.classList.contains('zoomed');
  document.querySelectorAll('.card.zoomed').forEach((el) => el.classList.remove('zoomed'));
  if (alreadyZoomed) {
    document.body.classList.remove('zoom');
    return false;
  }
  document.body.classList.add('zoom');
  card.classList.add('zoomed');
  return true;
}

function createTimeSeriesCharts(cfg) {
  const series = cfg.series;
  const KEYS = Object.keys(series);
  const minSpanSeconds = cfg.minSpanSeconds || 2;
  const defaultHeight = cfg.defaultHeight || '180px';
  const noDataText = cfg.noDataText || 'データ待ち…';
  const mounts = {};
  const uplots = {};
  const tips = {};
  const emptyEls = {};
  const viewT = { autoFollow: true, min: 0, max: minSpanSeconds };
  const viewV = {};
  let hasMarker = false;

  KEYS.forEach((key) => {
    if (!series[key].t) series[key].t = [];
    if (!series[key].v) series[key].v = [];
    viewV[key] = { autoScale: true, min: 0, max: 1 };
  });

  injectLabUplotStyle();
  KEYS.forEach(setupChart);
  window.addEventListener('resize', () => refreshVisible());

  function isCardShown(key) {
    const card = document.getElementById('card-' + key);
    return !!card && card.getClientRects().length > 0;
  }

  function visibleKeys() {
    const requested = typeof cfg.getVisibleKeys === 'function' ? (cfg.getVisibleKeys() || []) : KEYS;
    return requested.filter((key) => uplots[key] && isCardShown(key));
  }

  function latestTime() {
    let max = 0;
    KEYS.forEach((key) => {
      const tArr = series[key].t;
      if (tArr.length) max = Math.max(max, tArr[tArr.length - 1]);
    });
    return max;
  }

  function updateViewFollow() {
    if (!viewT.autoFollow) return;
    const span = Math.max(latestTime(), minSpanSeconds);
    viewT.min = 0;
    viewT.max = span;
  }

  function padFor(key) {
    return series[key].padMin ?? series[key].pad ?? 0.5;
  }

  function setLatestValue(key) {
    const el = document.getElementById('val-' + key);
    if (!el) return;
    const values = series[key].v;
    if (!values.length) {
      el.textContent = '--';
      return;
    }
    el.textContent = values[values.length - 1].toFixed(series[key].digits) + ' ' + series[key].unit;
  }

  function syncEmpty(key) {
    const emptyEl = emptyEls[key];
    if (!emptyEl) return;
    emptyEl.style.display = series[key].v.length < 2 ? 'flex' : 'none';
  }

  function yRangeFor(key, dataMin, dataMax) {
    const v = viewV[key];
    if (!v.autoScale) return [v.min, v.max];
    if (dataMin == null || dataMax == null) return [-1, 1];
    let min = series[key].minZero ? 0 : dataMin;
    let max = dataMax;
    const pad = Math.max((max - min) * 0.15, padFor(key));
    if (!series[key].minZero) min -= pad;
    max += pad;
    if (min === max) max = min + 1;
    return [min, max];
  }

  function resizePlot(key) {
    const mount = mounts[key];
    const plot = uplots[key];
    if (!mount || !plot) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    if (width > 0 && height > 0) plot.setSize({ width, height });
  }

  function applyTimeScale(keys) {
    keys.forEach((key) => {
      const plot = uplots[key];
      if (plot) plot.setScale('x', { min: viewT.min, max: viewT.max });
    });
  }

  function syncPlot(key) {
    const plot = uplots[key];
    if (!plot) return;
    resizePlot(key);
    plot.setData([series[key].t, series[key].v]);
    plot.setScale('x', { min: viewT.min, max: viewT.max });
    syncEmpty(key);
  }

  function refreshAll() {
    updateViewFollow();
    KEYS.forEach(syncPlot);
  }

  function scheduleZoomRefresh() {
    setTimeout(() => refreshVisible(), 60);
  }

  function clearCursor(plot) {
    plot.setCursor({ left: -10, top: -10 });
  }

  function setupChart(key) {
    const card = document.getElementById('card-' + key);
    if (!card) return;
    const oldCanvas = card.querySelector('#cv-' + key) || card.querySelector('canvas');
    const mount = document.createElement('div');
    mount.className = 'uplot-mount';
    mount.id = 'cv-' + key;
    mount.style.setProperty('--lab-plot-height', oldCanvas && oldCanvas.style.height ? oldCanvas.style.height : defaultHeight);
    if (oldCanvas) oldCanvas.replaceWith(mount);
    else card.appendChild(mount);
    mounts[key] = mount;

    const plot = new uPlot({
      width: mount.clientWidth || 720,
      height: mount.clientHeight || 180,
      pxAlign: false,
      padding: [32, 8, 0, 0],
      scales: {
        x: { time: false, auto: false, range: () => [viewT.min, viewT.max] },
        y: { auto: true, range: (u, dataMin, dataMax) => yRangeFor(key, dataMin, dataMax) },
      },
      axes: [
        {
          stroke: '#aaa',
          ticks: { stroke: '#444', size: 4 },
          grid: { stroke: '#3a3a3a' },
          font: '13px sans-serif',
          values: (u, ticks) => ticks.map((value) => value.toFixed(value < 1 ? 1 : 0) + 's'),
        },
        {
          stroke: '#aaa',
          ticks: { stroke: '#444', size: 4 },
          grid: { stroke: '#3a3a3a' },
          font: '13px sans-serif',
          size: 46,
        },
      ],
      series: [
        {},
        { stroke: series[key].color, width: 2, points: { show: false } },
      ],
      cursor: {
        drag: { setScale: false },
        x: false,
        y: false,
        points: { show: true, size: 10 },
      },
      legend: { show: false },
      hooks: {
        setCursor: [u => {
          const valEl = document.getElementById('val-' + key);
          const tip = tips[key];
          const idx = u.cursor.idx;
          const zoomed = document.body.classList.contains('zoom');
          if (!zoomed || idx == null || u.data[1][idx] == null) {
            if (tip) tip.classList.remove('show');
            setLatestValue(key);
            return;
          }
          const value = u.data[1][idx];
          const time = u.data[0][idx];
          if (valEl) {
            valEl.textContent =
              value.toFixed(series[key].digits) + ' ' + series[key].unit + ' @ ' + time.toFixed(2) + 's';
          }
          if (tip) {
            tip.style.left = u.valToPos(time, 'x') + 'px';
            tip.style.top = u.valToPos(value, 'y') + 'px';
            tip.textContent = Number(value.toPrecision(3)) + ' ' + series[key].unit;
            tip.classList.add('show');
          }
        }],
      },
    }, [series[key].t, series[key].v], mount);

    uplots[key] = plot;

    const tip = document.createElement('div');
    tip.className = 'lab-tip';
    plot.over.appendChild(tip);
    tips[key] = tip;

    const emptyEl = document.createElement('div');
    emptyEl.className = 'lab-empty';
    emptyEl.textContent = noDataText;
    mount.appendChild(emptyEl);
    emptyEls[key] = emptyEl;
    syncEmpty(key);

    attachInteractions(mount, key, card);

    setTimeout(() => resizePlot(key), 30);
  }

  function attachInteractions(el, key, card) {
    const cache = new Map();
    let prevDist = 0;
    let panPrevX = 0;
    let lastTapTime = 0;
    let tapStart = null;
    const TAP_SLOP_PX = 8;

    el.addEventListener('pointerdown', (e) => {
      cache.set(e.pointerId, e);
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      if (cache.size === 2) {
        const pts = Array.from(cache.values());
        prevDist = Math.abs(pts[1].clientX - pts[0].clientX);
        tapStart = null;
      } else if (cache.size === 1) {
        panPrevX = e.clientX;
        tapStart = { t: performance.now(), x: e.clientX, y: e.clientY };
        const now = performance.now();
        if (now - lastTapTime < 300) {
          viewT.autoFollow = true;
          KEYS.forEach((name) => { viewV[name].autoScale = true; });
          refreshVisible();
        }
        lastTapTime = now;
      }
    });

    el.addEventListener('pointermove', (e) => {
      if (!cache.has(e.pointerId)) return;
      cache.set(e.pointerId, e);
      const plot = uplots[key];
      if (!plot) return;
      const rect = el.getBoundingClientRect();

      if (cache.size === 2) {
        const zoomed = document.body.classList.contains('zoom');
        if (!zoomed) return;
        const pts = Array.from(cache.values());
        const dist = Math.hypot(pts[1].clientX - pts[0].clientX, pts[1].clientY - pts[0].clientY);
        const centerX = (pts[0].clientX + pts[1].clientX) / 2;
        const centerY = (pts[0].clientY + pts[1].clientY) / 2;
        if (prevDist > 5 && dist > 5) {
          const scale = dist / prevDist;
          const tc = viewT.min + (centerX - rect.left) / rect.width * (viewT.max - viewT.min);
          const newMin = tc - (tc - viewT.min) / scale;
          const newMax = tc + (viewT.max - tc) / scale;
          if (newMax - newMin >= 0.05) {
            viewT.min = newMin;
            viewT.max = newMax;
            viewT.autoFollow = false;
            applyTimeScale(visibleKeys());
          }
          const yScale = plot.scales.y;
          if (Number.isFinite(yScale.min) && Number.isFinite(yScale.max) && yScale.max > yScale.min) {
            const vc = yScale.max - (centerY - rect.top) / rect.height * (yScale.max - yScale.min);
            const newYMin = vc - (vc - yScale.min) / scale;
            const newYMax = vc + (yScale.max - vc) / scale;
            if (newYMax - newYMin > 1e-9) {
              viewV[key].autoScale = false;
              viewV[key].min = newYMin;
              viewV[key].max = newYMax;
              plot.setScale('y', { min: newYMin, max: newYMax });
            }
          }
        }
        prevDist = dist;
      } else if (cache.size === 1) {
        const zoomed = document.body.classList.contains('zoom');
        if (!zoomed) return;
        const dx = e.clientX - panPrevX;
        if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) < TAP_SLOP_PX) return;
        if (Math.abs(dx) < 2) return;
        panPrevX = e.clientX;
        tapStart = null;
        const dt = -dx / rect.width * (viewT.max - viewT.min);
        viewT.min += dt;
        viewT.max += dt;
        viewT.autoFollow = false;
        applyTimeScale(visibleKeys());
      }
    });

    const endPointer = (e) => {
      cache.delete(e.pointerId);
      if (cache.size < 2) prevDist = 0;
      if (tapStart && performance.now() - tapStart.t < 300 && cache.size === 0) {
        const zoomed = document.body.classList.contains('zoom');
        if (!zoomed) {
          const nextZoom = toggleCardZoom(card);
          clearMarkers();
          refreshVisible();
          scheduleZoomRefresh();
          if (cfg.onZoomChange) cfg.onZoomChange({ key, zoomed: nextZoom });
        } else {
          const plot = uplots[key];
          let onLine = false;
          if (plot && series[key].t.length) {
            const plotRect = plot.over.getBoundingClientRect();
            const tapX = tapStart.x - plotRect.left;
            const tapY = tapStart.y - plotRect.top;
            const t = viewT.min + tapX / plotRect.width * (viewT.max - viewT.min);
            let idx = 0;
            let best = Infinity;
            for (let i = 0; i < series[key].t.length; i++) {
              const diff = Math.abs(series[key].t[i] - t);
              if (diff < best) {
                best = diff;
                idx = i;
              }
            }
            const value = series[key].v[idx];
            if (value != null) {
              const ptX = plot.valToPos(series[key].t[idx], 'x');
              const ptY = plot.valToPos(value, 'y');
              const dist = Math.hypot(tapX - ptX, tapY - ptY);
              if (dist < 30) {
                onLine = true;
                hasMarker = true;
                plot.setCursor({ left: ptX, top: ptY });
                if (cfg.onMarker) {
                  cfg.onMarker({ key, idx, t: series[key].t[idx], v: value });
                }
              }
            }
          }
          if (!onLine) {
            const nextZoom = toggleCardZoom(card);
            clearMarkers();
            refreshVisible();
            scheduleZoomRefresh();
            if (cfg.onZoomChange) cfg.onZoomChange({ key, zoomed: nextZoom });
          }
        }
      }
      tapStart = null;
    };

    el.addEventListener('pointerup', endPointer);
    el.addEventListener('pointercancel', endPointer);
  }

  return {
    pushPoint: (key, t, v) => {
      const s = series[key];
      if (!s) return;
      s.t.push(t);
      s.v.push(v);
      setLatestValue(key);
    },
    clear: () => {
      viewT.autoFollow = true;
      viewT.min = 0;
      viewT.max = minSpanSeconds;
      KEYS.forEach((key) => {
        series[key].t.length = 0;
        series[key].v.length = 0;
        viewV[key].autoScale = true;
        setLatestValue(key);
        if (uplots[key]) {
          uplots[key].setData([[], []]);
          clearCursor(uplots[key]);
        }
        syncEmpty(key);
      });
      hasMarker = false;
      refreshAll();
    },
    clearMarkers: () => {
      hasMarker = false;
      KEYS.forEach((key) => {
        if (tips[key]) tips[key].classList.remove('show');
        if (uplots[key]) clearCursor(uplots[key]);
        setLatestValue(key);
      });
    },
    refreshVisible: () => {
      updateViewFollow();
      visibleKeys().forEach(syncPlot);
    },
    refreshAll: () => {
      refreshAll();
    },
    hasMarker: () => hasMarker,
    isZoomed: () => document.body.classList.contains('zoom'),
  };
}

function createXYZLab(cfg) {
  // cfg.unit      : 表示単位（例 'm/s²'）
  // cfg.digits    : ヘッダー現在値の小数桁数
  // cfg.padMin    : 縦軸autoスケールの最小余白
  // cfg.noDataMsg : 3秒待ってもデータが来ないときの案内（HTML可）
  // cfg.start     : async (lab) => エラーメッセージ or null
  // cfg.stop      : （任意）センサー解放
  // cfg.onReset   : （任意）🗑時のページ固有の後始末

  const AXES = ['x', 'y', 'z'];
  const MAX_SAMPLES = 150000;
  const hasAbs = !!document.getElementById('card-abs');
  const activeKeys = () => mode === 'abs' ? ['abs'] : AXES;
  const series = {
    x: { t: [], v: [], color: '#4C8DF0', unit: cfg.unit, digits: cfg.digits, padMin: cfg.padMin },
    y: { t: [], v: [], color: '#4FC96B', unit: cfg.unit, digits: cfg.digits, padMin: cfg.padMin },
    z: { t: [], v: [], color: '#F2C744', unit: cfg.unit, digits: cfg.digits, padMin: cfg.padMin },
  };
  if (hasAbs) {
    series.abs = {
      t: [],
      v: [],
      color: '#eeeeee',
      unit: cfg.unit,
      digits: cfg.digits,
      padMin: cfg.padMin,
      minZero: true,
    };
  }

  let t0 = null;
  let running = false;
  let started = false;
  let gotData = false;
  let mode = 'xyz';

  const graphs = createTimeSeriesCharts({
    series,
    getVisibleKeys: () => activeKeys(),
    defaultHeight: '180px',
  });

  const playBtn = document.getElementById('playBtn');
  const errEl = document.getElementById('err');
  const PLAY_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="計測開始"><path d="M8 5v14l11-7z"/></svg>';
  const PAUSE_SVG = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="一時停止"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

  function setPlayIcon(playing) {
    playBtn.innerHTML = playing ? PAUSE_SVG : PLAY_SVG;
  }

  setPlayIcon(false);

  playBtn.addEventListener('click', async () => {
    if (running) {
      running = false;
      setPlayIcon(false);
      return;
    }
    if (!started) {
      gotData = false;
      const err = await cfg.start(api);
      if (err) {
        errEl.innerHTML = err;
        return;
      }
      started = true;
      setTimeout(() => {
        if (!gotData) errEl.innerHTML = cfg.noDataMsg;
      }, 3000);
    }
    if (series.x.t.length) t0 = performance.now() / 1000 - series.x.t[series.x.t.length - 1];
    running = true;
    errEl.textContent = '';
    setPlayIcon(true);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    running = false;
    setPlayIcon(false);
    t0 = null;
    graphs.clear();
    if (cfg.onReset) cfg.onReset();
  });

  function push(x, y, z) {
    if (!running) return;
    gotData = true;
    const now = performance.now() / 1000;
    if (t0 === null) t0 = now;
    const t = now - t0;
    graphs.pushPoint('x', t, x);
    graphs.pushPoint('y', t, y);
    graphs.pushPoint('z', t, z);
    if (hasAbs) graphs.pushPoint('abs', t, Math.sqrt(x * x + y * y + z * z));
    graphs.refreshVisible();
    if (series.x.t.length > MAX_SAMPLES) {
      running = false;
      setPlayIcon(false);
      errEl.textContent = '記録が長くなったので自動停止しました（🗑 で消去できます）';
    }
  }

  const api = {
    push,
    isRunning: () => running,
    hasMarker: () => graphs.hasMarker(),
    isZoomed: () => graphs.isZoomed(),
    release: () => {
      running = false;
      started = false;
      setPlayIcon(false);
      if (cfg.stop) cfg.stop();
    },
    setMode: (m) => {
      if (!hasAbs || (m !== 'xyz' && m !== 'abs')) return;
      mode = m;
      document.body.classList.remove('zoom');
      document.querySelectorAll('.card.zoomed').forEach((card) => card.classList.remove('zoomed'));
      const setDisp = (key, on) => {
        const el = document.getElementById('card-' + key);
        if (el) el.style.display = on ? '' : 'none';
      };
      AXES.forEach((key) => setDisp(key, mode === 'xyz'));
      setDisp('abs', mode === 'abs');
      graphs.clearMarkers();
      setTimeout(() => graphs.refreshVisible(), 60);
    },
    getMode: () => mode,
  };
  return api;
}
