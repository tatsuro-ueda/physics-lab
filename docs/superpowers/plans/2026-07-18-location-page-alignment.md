# Location Page Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/location.html` を `docs` の導線規約へ合わせ、位置タブ中心のチュートリアル、初回オンボーディング、位置ベースの速度・加速度地図、明確な状態案内を備えたGPSページへ更新する。

**Architecture:** GPSの取得、数値微分、グラフ描画は `src/location.html` に残し、学習導線だけ `tutorial.js` と `tour.js` へ寄せる。下部地図は `track` を唯一の位置基盤データとして使い、速度・加速度タブでは同じ移動軌跡へ強調表示だけを重ねる。

**Tech Stack:** HTML/CSS/JavaScript、`src/tutorial.js`、`src/tour.js`、`src/driver.js` / `src/driver.css`、Python標準ライブラリの `build.py`、Python `unittest`

---

## File Map

- Modify: `src/location.html`
  - ヘッダー、タブ直下の導線DOM、ページローカルCSS、GPS取得ライフサイクル、チュートリアル・オンボーディング定義、位置ベース地図描画を持つ正本。
- Create: `tests/test_location_page.py`
  - `location` ページ固有の回帰テスト。DOMフック、共通導線の接続、位置ベース地図、状態案内を文字列・構造として固定する。
- Verify: `location.html`
  - `python3 build.py` で生成される配布用HTML。直接編集しない。

### Task 1: 学習導線の土台DOMと共有アセットを追加する

**Files:**
- Create: `tests/test_location_page.py`
- Modify: `src/location.html`
- Verify: `location.html`

- [ ] **Step 1: 学習導線シェルの回帰テストを書く**

```python
import unittest
from pathlib import Path


LOCATION_SOURCE = Path(__file__).parents[1] / "src" / "location.html"


class LocationPageSourceTest(unittest.TestCase):
    def test_location_page_wires_learning_ui(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn('<link rel="stylesheet" href="driver.css">', source)
        self.assertIn('id="missionBtn"', source)
        self.assertIn('id="tutorialMount"', source)
        self.assertIn('<script src="driver.js"></script>', source)
        self.assertIn('<script src="tutorial.js"></script>', source)
        self.assertIn('<script src="tour.js"></script>', source)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: テストを実行して失敗を確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`id="missionBtn"` と `id="tutorialMount"` がまだ無く、共有アセットの `<link>` / `<script>` も見つからない。

- [ ] **Step 3: ヘッダー、パネルマウント、共有アセットを追加する**

`src/location.html` の `<head>`、`<header>`、`<main>`、末尾のスクリプト群を次の形へ更新する。

```html
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>位置（GPS） | タブレット物理実験ラボ</title>
<link rel="stylesheet" href="driver.css">
<style>
  :root { --phx-orange: #ffe000; --ax-x: #4C8DF0; --ax-y: #4FC96B; --ax-z: #F2C744; }
  /* 既存CSSは残しつつ、このTaskでは共有アセット導線だけ通す */
</style>
</head>
<body>
<header>
  <a class="back" href="index.html">←</a>
  <div class="title">位置（GPS）</div>
  <button id="playBtn" title="計測開始"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="計測開始"><path d="M8 5v14l11-7z"/></svg></button>
  <button id="resetBtn" title="計測を止めてデータを消す"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="削除"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button>
  <button id="missionBtn" title="チュートリアル（位置の見方を体験で学ぶ）"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-label="チュートリアル"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg></button>
</header>

<main>
  <div id="tutorialMount"></div>
  <!-- 既存の values / card 群はそのまま残す -->
</main>

<script src="driver.js"></script>
<script src="tutorial.js"></script>
<script src="tour.js"></script>
<script>
// 既存の location ページスクリプト本体
</script>
<script src="orientation-guard.js"></script>
```

- [ ] **Step 4: 学習導線シェルのテストが通ることを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: PASS。`test_location_page_wires_learning_ui` が成功する。

- [ ] **Step 5: 生成物も更新してコミットする**

Run:

```bash
python3 build.py
git add src/location.html location.html tests/test_location_page.py
git commit -m "feat: wire location page learning UI"
```

Expected: `location.html: 生成OK` が表示され、`feat: wire location page learning UI` のコミットが作られる。

### Task 2: 位置タブ中心のチュートリアルと初回ツアーを配線する

**Files:**
- Modify: `src/location.html`
- Modify: `tests/test_location_page.py`
- Verify: `location.html`

- [ ] **Step 1: チュートリアルとオンボーディングの回帰テストを追加する**

`tests/test_location_page.py` の `LocationPageSourceTest` へ次のメソッドを追加する。

```python
    def test_location_page_defines_tutorial_and_onboarding(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("createTutorial({", source)
        self.assertIn("keyPrefix: 'phylab-location'", source)
        self.assertIn("mountId: 'tutorialMount'", source)
        self.assertIn("toggleBtnId: 'missionBtn'", source)
        self.assertIn("createOnboardingTour({", source)
        self.assertIn("key: 'location-onboarding-seen'", source)
        self.assertIn("tut.event('started')", source)
        self.assertIn("tut.event('zoomed')", source)
        self.assertIn("tut.event('marker')", source)
```

- [ ] **Step 2: 新しいテストが失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`createTutorial({` と `createOnboardingTour({`、`tut.event(...)` の接続がまだ無い。

- [ ] **Step 3: `tutorial.js` / `tour.js` を使う導線定義を実装する**

`src/location.html` のスクリプト冒頭で `tut` を生成し、既存クリック処理へイベントを差し込む。オンボーディングはページ末尾で起動する。

```javascript
const TUTORIAL_MOVE_METERS = 5;

function isRunning() {
  return watchId !== null;
}

const tut = createTutorial({
  keyPrefix: 'phylab-location',
  mountId: 'tutorialMount',
  toggleBtnId: 'missionBtn',
  isActive: isRunning,
  inactiveNote: '▶を押すと進められるよ',
  steps: [
    () => ({
      html: () => window.TUT_ICONS.play + ' を押して記録を始めよう',
      on: 'started',
    }),
    () => ({
      html: () => '少し歩いて、線や地図が動くのを見よう',
      needsActive: true,
      tick: (state) => state.totalDist >= TUTORIAL_MOVE_METERS || state.trackLength >= 3,
    }),
    () => ({
      html: () => '地図で、どちらへ動いたか見てみよう',
      observe: true,
    }),
  ],
  moreSteps: [
    () => ({
      html: () => 'グラフをタップして拡大してみよう',
      on: 'zoomed',
    }),
    () => ({
      html: () => '線をタップして値を読んでみよう',
      on: 'marker',
    }),
  ],
  completeText: window.TUT_ICONS.check + ' チュートリアル完了！位置の見方をつかめたね',
});

createOnboardingTour({
  key: 'location-onboarding-seen',
  steps: [
    {
      element: '#card-map',
      popover: { title: '移動のようす', description: 'ここで動きを見るよ', side: 'bottom', align: 'center' },
    },
    {
      element: '#playBtn',
      popover: { title: '開始ボタン', description: '押すと記録が始まるよ', side: 'bottom' },
    },
    {
      element: '#missionBtn',
      popover: { title: 'チュートリアル', description: '押して使い方を体験してみてね', side: 'bottom' },
    },
  ],
});
```

既存イベント処理にも次を差し込む。

```javascript
if (Math.abs(cy - ly) < HIT_PX) {
  marker[key] = i;
  tut.event('marker');
  return;
}
toggleZoom(card);
if (document.body.classList.contains('zoom')) tut.event('zoomed');
```

```javascript
playBtn.addEventListener('click', () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    playBtn.innerHTML = PLAY_SVG;
    return;
  }
  // ... watchPosition を開始した直後
  tut.event('started');
});
```

```javascript
tut.tick({ totalDist, trackLength: track.length });
```

- [ ] **Step 4: チュートリアル配線テストを再実行する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: PASS。既存テストと `test_location_page_defines_tutorial_and_onboarding` が両方成功する。

- [ ] **Step 5: 生成物も更新してコミットする**

Run:

```bash
python3 build.py
git add src/location.html location.html tests/test_location_page.py
git commit -m "feat: add location onboarding and tutorial"
```

Expected: `location.html` に `location-onboarding-seen` と `phylab-location` が埋め込まれた状態でコミットできる。

### Task 3: 速度・加速度地図を位置ベースの強調表示へ置き換える

**Files:**
- Modify: `src/location.html`
- Modify: `tests/test_location_page.py`
- Verify: `location.html`

- [ ] **Step 1: 位置ベース地図への置換を固定するテストを追加する**

`tests/test_location_page.py` の `LocationPageSourceTest` へ次のメソッドを追加する。

```python
    def test_location_page_uses_position_based_route_maps(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertNotIn("const vtrack =", source)
        self.assertNotIn("const atrack =", source)
        self.assertIn("track.push({ x: xE, y: yN, speed: null, accel: null })", source)
        self.assertIn("track[track.length - 1].speed = speedMag", source)
        self.assertIn("track[track.length - 1].accel = accelMag", source)
        self.assertIn("metricKey: 'speed'", source)
        self.assertIn("metricKey: 'accel'", source)
```

- [ ] **Step 2: 追加したテストが失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`vtrack` / `atrack` がまだ残っており、`track` に速度・加速度の付帯値を載せていない。

- [ ] **Step 3: `track` を唯一の地図基盤にし、速度・加速度は強調表示へ変える**

`src/location.html` のデータ構造、`onPos()`、`draw()`、`drawTrack()` を次の方針で更新する。

```javascript
const track = [];   // { x, y, speed, accel } を積む唯一の位置基盤
```

```javascript
pushS('x', t, xE); pushS('y', t, yN); pushS('z', t, zU);
track.push({ x: xE, y: yN, speed: null, accel: null });

if (prevI >= 0) {
  const dt = t - sx.t[prevI];
  if (dt > 0) {
    const vX = (xE - sx.v[prevI]) / dt;
    const vY = (yN - SERIES.y.v[prevI]) / dt;
    const vZ = (zU - SERIES.z.v[prevI]) / dt;
    const speedMag = Math.hypot(vX, vY, vZ);

    pushS('vx', t, vX); pushS('vy', t, vY); pushS('vz', t, vZ);
    track[track.length - 1].speed = speedMag;
    document.getElementById('spdMag').innerHTML = speedMag.toFixed(2) + ' <small>m/s</small>';

    if (prevVI >= 0) {
      const dtv = t - SERIES.vx.t[prevVI];
      if (dtv > 0) {
        const aX = (vX - SERIES.vx.v[prevVI]) / dtv;
        const aY = (vY - SERIES.vy.v[prevVI]) / dtv;
        const aZ = (vZ - SERIES.vz.v[prevVI]) / dtv;
        const accelMag = Math.hypot(aX, aY, aZ);

        pushS('ax', t, aX); pushS('ay', t, aY); pushS('az', t, aZ);
        track[track.length - 1].accel = accelMag;
        document.getElementById('accMag').innerHTML = accelMag.toFixed(2) + ' <small>m/s²</small>';
      }
    }
  }
}
```

```javascript
function draw() {
  if (watchId === null) return;
  requestAnimationFrame(draw);
  KEYS.forEach(k => drawGraph(document.getElementById('cv-' + k), SERIES[k], marker[k]));
  drawTrack('cv-map', 'map-span', track, 10, {
    startRing: true,
    spanUnit: 'm',
    metricKey: null,
  });
  drawTrack('cv-vmap', 'vmap-span', track, 10, {
    startRing: true,
    spanUnit: 'm',
    metricKey: 'speed',
    metricUnit: 'm/s',
    metricColor: '#4C8DF0',
  });
  drawTrack('cv-amap', 'amap-span', track, 10, {
    startRing: true,
    spanUnit: 'm',
    metricKey: 'accel',
    metricUnit: 'm/s²',
    metricColor: '#F2C744',
  });
}
```

`drawTrack()` は、基底の軌跡を緑で描き、その上に `metricKey` があるときだけ区間ごとの色・線幅を重ねる。

```javascript
function drawTrack(cvId, spanId, pts, minSpan, opts) {
  // ... 既存の toX / toY / span 計算
  const metricValues = opts.metricKey
    ? pts.map((p) => p[opts.metricKey]).filter((v) => Number.isFinite(v))
    : [];
  const maxMetric = metricValues.length ? Math.max(...metricValues) : 0;

  document.getElementById(spanId).textContent =
    'はば 約' + Number((W / scale).toPrecision(2)) + opts.spanUnit +
    (opts.metricKey && maxMetric > 0 ? ' / 最大 ' + maxMetric.toFixed(2) + ' ' + opts.metricUnit : '');

  ctx.strokeStyle = '#5f7a50';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(toX(pts[0].x), toY(pts[0].y));
  for (let i = 1; i < pts.length; i++) ctx.lineTo(toX(pts[i].x), toY(pts[i].y));
  ctx.stroke();

  if (opts.metricKey && maxMetric > 0) {
    for (let i = 1; i < pts.length; i++) {
      const metric = pts[i][opts.metricKey];
      if (!Number.isFinite(metric)) continue;
      const norm = Math.min(metric / maxMetric, 1);
      ctx.globalAlpha = 0.25 + norm * 0.75;
      ctx.strokeStyle = opts.metricColor;
      ctx.lineWidth = 2 + norm * 4;
      ctx.beginPath();
      ctx.moveTo(toX(pts[i - 1].x), toY(pts[i - 1].y));
      ctx.lineTo(toX(pts[i].x), toY(pts[i].y));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}
```

- [ ] **Step 4: 位置ベース地図テストを再実行する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: PASS。`vtrack` / `atrack` が消え、`metricKey: 'speed'` と `metricKey: 'accel'` が使われている。

- [ ] **Step 5: 生成物も更新してコミットする**

Run:

```bash
python3 build.py
git add src/location.html location.html tests/test_location_page.py
git commit -m "feat: show route-based speed and acceleration maps"
```

Expected: 速度・加速度タブでも位置軌跡ベースの地図が生成物へ反映されたコミットになる。

### Task 4: 状態案内、ヒント切替、エラー回復導線を整える

**Files:**
- Modify: `src/location.html`
- Modify: `tests/test_location_page.py`
- Verify: `location.html`

- [ ] **Step 1: 状態と回復導線の回帰テストを追加する**

`tests/test_location_page.py` の `LocationPageSourceTest` へ次のメソッドを追加する。

```python
    def test_location_page_has_actionable_status_and_error_copy(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn('id="status"', source)
        self.assertIn("document.addEventListener('visibilitychange'", source)
        self.assertIn("stopWatching('hidden')", source)
        self.assertIn("このタブを離れたので停止しました。▶で再開できます", source)
        self.assertIn("位置情報の使用が許可されませんでした。ブラウザの設定で許可してから、もう一度▶を押してね", source)
        self.assertIn("位置の取得がタイムアウトしました。空が開けた場所で、もう一度▶を押してね", source)
        self.assertIn('<span class="hint-plain">', source)
        self.assertIn('<span class="hint-zoom">', source)
```

- [ ] **Step 2: 新しい状態案内テストが失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`status` 要素、`stopWatching('hidden')`、行動付きエラー文、拡大時ヒント切替がまだ不足している。

- [ ] **Step 3: 状態・エラー・ヒント切替の最小実装を入れる**

`src/location.html` に状態表示行、ヒント切替CSS、`startWatching()` / `stopWatching()`、行動付きエラー文を追加する。

```html
<div id="tutorialMount"></div>
<p id="status" class="status-note">▶を押すと位置の記録を始めます</p>
```

```css
.status-note { text-align: center; color: #bbb; font-size: 0.9rem; margin: 8px 0 12px; }
.hint .hint-zoom { display: none; }
body.zoom .hint .hint-plain { display: none; }
body.zoom .hint .hint-zoom { display: inline; }
```

```html
<p class="hint" id="hint">
  <span class="hint-plain"><b>グラフをタップ</b>＝拡大</span>
  <span class="hint-zoom"><b>線をタップ</b>＝値、<b>まわりをタップ</b>＝縮小</span>
</p>
```

```javascript
const statusEl = document.getElementById('status');

function setStatus(text) {
  statusEl.textContent = text;
}

function stopWatching(reason) {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  playBtn.innerHTML = PLAY_SVG;
  if (reason === 'paused') setStatus('一時停止中。▶で再開できます');
  if (reason === 'hidden') setStatus('このタブを離れたので停止しました。▶で再開できます');
  if (reason === 'reset') setStatus('▶を押すと位置の記録を始めます');
  if (reason === 'error') setStatus('記録は停止しました。原因を確認してから、▶でやり直せます');
}

function startWatching() {
  if (!('geolocation' in navigator)) {
    errEl.textContent = 'この端末・ブラウザでは位置情報が使えません。別の端末かブラウザを試してね';
    setStatus('位置情報を使えないため、記録を始められません');
    return;
  }
  watchId = navigator.geolocation.watchPosition(onPos, onErr, {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 15000,
  });
  // 再開時の t0 補正は既存ロジックを残す
  playBtn.innerHTML = PAUSE_SVG;
  errEl.textContent = '';
  setStatus('記録中。少し歩いて、線や地図の変化を見よう');
  tut.event('started');
  draw();
}

playBtn.addEventListener('click', () => {
  if (isRunning()) {
    stopWatching('paused');
    return;
  }
  startWatching();
});

function onErr(e) {
  stopWatching('error');
  const msg = {
    1: '位置情報の使用が許可されませんでした。ブラウザの設定で許可してから、もう一度▶を押してね',
    2: '位置を取得できませんでした。屋外へ移動するか、少し待ってからもう一度▶を押してね',
    3: '位置の取得がタイムアウトしました。空が開けた場所で、もう一度▶を押してね',
  };
  errEl.textContent = msg[e.code] || '位置の取得で問題が起きました。少し待ってから、もう一度▶を押してね';
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && isRunning()) stopWatching('hidden');
});

document.getElementById('resetBtn').addEventListener('click', () => {
  stopWatching('reset');
  // 既存の配列・表示クリア処理を続ける
});
```

- [ ] **Step 4: 位置ページ回帰テスト全体を再実行する**

Run: `python3 -m unittest discover -s tests -v`

Expected: 既存の `test_lab_common.py` を含めて全PASS。

- [ ] **Step 5: 生成物も更新してコミットする**

Run:

```bash
python3 build.py
git add src/location.html location.html tests/test_location_page.py
git commit -m "fix: align location page status guidance"
```

Expected: 状態表示、行動付きエラー、拡大時ヒント切替、hidden停止が生成物込みでコミットされる。

### Task 5: ビルド生成物とHTTPS手動確認の入口を固める

**Files:**
- Verify: `src/location.html`
- Verify: `tests/test_location_page.py`
- Verify: `location.html`

- [ ] **Step 1: 差分形式とプレースホルダーを確認する**

Run:

```bash
git diff --check
python3 - <<'PY'
from pathlib import Path

files = [Path("src/location.html"), Path("tests/test_location_page.py")]
markers = ("TB" + "D", "TO" + "DO")

for path in files:
    text = path.read_text(encoding="utf-8")
    for marker in markers:
        if marker in text:
            raise SystemExit(f"{path}: found placeholder marker {marker}")

print("placeholder markers: none")
PY
```

Expected: `git diff --check` は終了コード0、Pythonスクリプトは `placeholder markers: none` を表示する。

- [ ] **Step 2: 全テストを再実行する**

Run: `python3 -m unittest discover -s tests -v`

Expected: `test_lab_common.py` と `test_location_page.py` を含めて全PASS。

- [ ] **Step 3: 配布用HTMLを再生成する**

Run: `python3 build.py`

Expected: `location.html: 生成OK` を含め、全ページで `生成OK` が並ぶ。

- [ ] **Step 4: 生成物に導線が入っていることを確認する**

Run:

```bash
rg -n 'id="missionBtn"|id="tutorialMount"|location-onboarding-seen|phylab-location|driver-popover' location.html
```

Expected: `location.html` にチュートリアルボタン、マウント、オンボーディングキー、チュートリアルキー、driverテーマCSS由来の文字列が見つかる。

- [ ] **Step 5: HTTPS実機確認のチェックリストを実施する**

手動で次を確認する。

```text
1. 初回だけツアーが自動で出る
2. 最終ステップが #missionBtn を指す
3. ▶ → 少し歩く → 地図観察 の3課題が順に進む
4. 速度タブと加速度タブの下地図が位置ベースで理解できる
5. タブ離脱で停止し、戻っても自動再開しない
6. 権限拒否・取得失敗・タイムアウトがページ内で区別表示される
```

Expected: 実機HTTPS上で6項目すべて確認できる。問題があれば該当Taskへ戻って追加の回帰テストを書いてから修正する。
