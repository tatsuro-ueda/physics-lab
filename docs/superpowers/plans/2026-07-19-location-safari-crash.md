# Location Safari Crash Mitigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/location.html` の描画負荷を下げ、iOS Safari が画面ロックや復帰の前後で落ちにくい状態へ改善する。

**Architecture:** 常時 `requestAnimationFrame` ループをやめ、描画は必要時だけ `scheduleDraw()` で 1 回ずつ予約する。グラフの縦軸計算とタップ当たり判定で使う最小値・最大値は、`Math.min(...array)` / `Math.max(...array)` ではなく純粋な単一ループ集計関数へ置き換える。

**Tech Stack:** HTML/CSS/JavaScript、`src/location.html`、Python標準ライブラリの `unittest`、`build.py`

---

## File Map

- Modify: `src/location.html`
  - GPS計測、描画、タップ操作、状態管理を持つ正本。描画スケジューラと軽量な集計関数を追加する。
- Modify: `tests/test_location_page.py`
  - `location` ページの回帰テスト。常時ループ除去、`scheduleDraw()` 導入、spread集計除去を固定する。
- Verify: `location.html`
  - `python3 build.py` で再生成される配布用HTML。直接編集しない。

### Task 1: 描画スケジューラ導入の失敗テストを先に書く

**Files:**
- Modify: `tests/test_location_page.py`
- Modify: `src/location.html`

- [ ] **Step 1: 描画負荷軽減の回帰テストを追加する**

`tests/test_location_page.py` の `LocationPageSourceTest` へ次のメソッドを追加する。

```python
    def test_location_page_schedules_draws_instead_of_looping_forever(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("let drawScheduled = false;", source)
        self.assertIn("function scheduleDraw()", source)
        self.assertIn("if (drawScheduled) return;", source)
        self.assertIn("drawScheduled = true;", source)
        self.assertIn("requestAnimationFrame(() => {", source)
        self.assertIn("drawScheduled = false;", source)
        self.assertIn("scheduleDraw();", source)
        self.assertNotIn("requestAnimationFrame(draw);", source)
        self.assertNotIn("if (watchId === null) return;", source)
```

- [ ] **Step 2: 新しいテストが失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`drawScheduled` と `scheduleDraw()` がまだ無く、`requestAnimationFrame(draw);` が残っている。

- [ ] **Step 3: `scheduleDraw()` を追加して常時描画をやめる**

`src/location.html` の `track` 宣言付近に次を追加する。

```javascript
let drawScheduled = false;
```

`draw()` を次の形へ更新する。

```javascript
function scheduleDraw() {
  if (drawScheduled) return;
  drawScheduled = true;
  requestAnimationFrame(() => {
    drawScheduled = false;
    draw();
  });
}

function draw() {
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

`startWatching()` の末尾の `draw();` を `scheduleDraw();` に変える。

- [ ] **Step 4: 描画スケジューラの回帰テストを再実行する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: PASS。`test_location_page_schedules_draws_instead_of_looping_forever` を含む既存テストが成功する。

- [ ] **Step 5: スケジューラ導入をコミットする**

Run:

```bash
git add src/location.html tests/test_location_page.py
git commit -m "feat: schedule location redraws"
```

Expected: `feat: schedule location redraws` のコミットが作られる。

### Task 2: spread集計を単一ループへ置き換えて描画トリガーを整理する

**Files:**
- Modify: `src/location.html`
- Modify: `tests/test_location_page.py`

- [ ] **Step 1: 配列展開除去と描画トリガーの回帰を追加する**

`tests/test_location_page.py` の `LocationPageSourceTest` へ次のメソッドを追加する。

```python
    def test_location_page_avoids_spread_minmax_and_draws_on_state_changes(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("function seriesMinMax(values)", source)
        self.assertIn("const stats = seriesMinMax(s.v);", source)
        self.assertIn("scheduleDraw();", source)
        self.assertIn("document.querySelectorAll('.tab').forEach(tab => {", source)
        self.assertIn("toggleZoom(card);", source)
        self.assertNotIn("Math.min(...s.v)", source)
        self.assertNotIn("Math.max(...s.v)", source)
```

- [ ] **Step 2: 新しい回帰テストが失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`seriesMinMax(values)` がまだ無く、`Math.min(...s.v)` / `Math.max(...s.v)` が残っている。

- [ ] **Step 3: 単一ループ集計関数と必要時描画トリガーへ置き換える**

`src/location.html` に次の純粋関数を追加する。

```javascript
function seriesMinMax(values) {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
}
```

クリック当たり判定部と `drawGraph()` の縦軸計算は次の形へ置き換える。

```javascript
      const stats = seriesMinMax(s.v);
      let min = stats.min;
      let max = stats.max;
```

次の場所でも `scheduleDraw();` を呼ぶ。

```javascript
    document.querySelectorAll('.values').forEach(v =>
      v.classList.toggle('visible', v.id === 'values-' + name));
    scheduleDraw();
```

```javascript
    toggleZoom(card);
    scheduleDraw();
```

```javascript
      confirmVelocitySample({
        t,
        trackIndex: track.length - 1,
        vx: vX,
        vy: vY,
        vz: vZ,
      });
      scheduleDraw();
```

リセット処理の末尾にも次を追加する。

```javascript
  scheduleDraw();
```

- [ ] **Step 4: 回帰テストを再実行する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: PASS。新しい2件を含む `test_location_page.py` の全テストが成功する。

- [ ] **Step 5: 軽量集計と描画トリガー整理をコミットする**

Run:

```bash
git add src/location.html tests/test_location_page.py
git commit -m "feat: reduce location graph draw cost"
```

Expected: `feat: reduce location graph draw cost` のコミットが作られる。

### Task 3: 配布用HTMLを再生成して最終確認する

**Files:**
- Verify: `src/location.html`
- Verify: `tests/test_location_page.py`
- Verify: `tests/test_location_spike_filter.py`
- Verify: `location.html`

- [ ] **Step 1: 差分整合を確認する**

Run: `git diff --check`

Expected: 出力なし。空白崩れや conflict marker が無い。

- [ ] **Step 2: テストをフルで実行する**

Run: `python3 -m unittest discover -s tests -v`

Expected: 全テスト PASS。`test_location_page.py` と `test_location_spike_filter.py` の両方が通る。

- [ ] **Step 3: 配布用HTMLを再生成する**

Run: `python3 build.py`

Expected: `location.html: 生成OK` を含め、各ページに `生成OK` が並ぶ。

- [ ] **Step 4: 生成物に軽量化の配線が入ったことを確認する**

Run: `rg -n "scheduleDraw|drawScheduled|seriesMinMax" location.html`

Expected: `location.html` に `scheduleDraw`、`drawScheduled`、`seriesMinMax` が見つかる。

- [ ] **Step 5: 生成物込みでコミットする**

Run:

```bash
git add location.html
git commit -m "build: regenerate location page after safari crash mitigation"
```

Expected: `build: regenerate location page after safari crash mitigation` のコミットが作られる。
