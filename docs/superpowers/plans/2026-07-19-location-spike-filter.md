# Location Spike Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/location.html` の速度・加速度表示に 3点中央値フィルタを入れ、GPS の単発ぶれによる単発スパイクだけを落とす。

**Architecture:** 変位グラフと位置タブの軌跡地図は生データのまま残し、速度と加速度だけを 1 サンプル遅れで確定する。`src/location.html` に純粋な中央値ヘルパーと短いバッファ処理を追加し、`tests/` から Node を呼んでそのヘルパーの挙動を直接検証する。

**Tech Stack:** HTML/CSS/JavaScript、`src/location.html`、Python標準ライブラリの `unittest`、Node.js、`build.py`

---

## File Map

- Modify: `src/location.html`
  - GPS から変位を作る既存ロジックは維持しつつ、速度・加速度の確定タイミングだけを 3点中央値ベースへ置き換える正本。
- Create: `tests/test_location_spike_filter.py`
  - `src/location.html` から純粋ヘルパー部を抜き出し、Node で 3点中央値の挙動を直接確認する新規テスト。
- Modify: `tests/test_location_page.py`
  - 速度・加速度が直接 `pushS(...)` されなくなること、フィルタ用ウィンドウと確定関数が配線されることを回帰として固定する。
- Verify: `location.html`
  - `python3 build.py` で再生成される配布用HTML。直接編集しない。

### Task 1: 3点中央値ヘルパーをテスト駆動で追加する

**Files:**
- Create: `tests/test_location_spike_filter.py`
- Modify: `src/location.html`

- [ ] **Step 1: Node で純粋ヘルパーを検証する失敗テストを書く**

`tests/test_location_spike_filter.py` を次の内容で作成する。

```python
import json
import subprocess
import unittest
from pathlib import Path


LOCATION_SOURCE = Path(__file__).parents[1] / "src" / "location.html"


def extract_filter_block() -> str:
    source = LOCATION_SOURCE.read_text(encoding="utf-8")
    start = source.index("// ---- spike filter helpers ----")
    end = source.index("// ---- タブ切り替え ----", start)
    return source[start:end]


def run_filter_script(script: str) -> dict:
    completed = subprocess.run(
        ["node", "-e", script],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(completed.stdout)


class LocationSpikeFilterTest(unittest.TestCase):
    def test_push_median_window_returns_medianized_center_velocity(self):
        helpers = extract_filter_block()
        script = f"""
{helpers}
const buffer = [];
const first = pushMedianWindow(buffer, {{ t: 1, trackIndex: 1, vx: 1.0, vy: 0.0, vz: 0.0 }}, ['vx', 'vy', 'vz']);
const second = pushMedianWindow(buffer, {{ t: 2, trackIndex: 2, vx: 12.0, vy: 0.0, vz: 0.0 }}, ['vx', 'vy', 'vz']);
const third = pushMedianWindow(buffer, {{ t: 3, trackIndex: 3, vx: 1.2, vy: 0.0, vz: 0.0 }}, ['vx', 'vy', 'vz']);
console.log(JSON.stringify({{
  first,
  second,
  third,
  bufferLength: buffer.length,
}}));
"""
        payload = run_filter_script(script)

        self.assertIsNone(payload["first"])
        self.assertIsNone(payload["second"])
        self.assertEqual(payload["third"]["t"], 2)
        self.assertEqual(payload["third"]["trackIndex"], 2)
        self.assertAlmostEqual(payload["third"]["vx"], 1.2)
        self.assertEqual(payload["bufferLength"], 2)

    def test_push_median_window_is_generic_for_acceleration_axes(self):
        helpers = extract_filter_block()
        script = f"""
{helpers}
const buffer = [];
pushMedianWindow(buffer, {{ t: 4, trackIndex: 4, ax: 0.5, ay: 0.2, az: 0.0 }}, ['ax', 'ay', 'az']);
pushMedianWindow(buffer, {{ t: 5, trackIndex: 5, ax: 9.0, ay: 0.3, az: 0.0 }}, ['ax', 'ay', 'az']);
const settled = pushMedianWindow(buffer, {{ t: 6, trackIndex: 6, ax: 0.6, ay: 0.4, az: 0.0 }}, ['ax', 'ay', 'az']);
console.log(JSON.stringify(settled));
"""
        payload = run_filter_script(script)

        self.assertEqual(payload["t"], 5)
        self.assertAlmostEqual(payload["ax"], 0.6)
        self.assertAlmostEqual(payload["ay"], 0.3)
        self.assertAlmostEqual(payload["az"], 0.0)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 新規テストが正しく失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_spike_filter.py' -v`

Expected: FAIL。`src/location.html` に `// ---- spike filter helpers ----` ブロックと `pushMedianWindow` がまだ無いため、`extract_filter_block()` が落ちる。

- [ ] **Step 3: `src/location.html` に純粋ヘルパーとウィンドウ配列を追加する**

`src/location.html` の `const marker = {};` 直後から `// ---- タブ切り替え ----` の前までを次の形へ更新する。

```javascript
const marker = {};
KEYS.forEach(k => marker[k] = null);
const velocityWindow = [];
const accelWindow = [];

// ---- spike filter helpers ----
function median3(a, b, c) {
  return [a, b, c].sort((x, y) => x - y)[1];
}

function pushMedianWindow(buffer, sample, keys) {
  buffer.push(sample);
  if (buffer.length < 3) return null;
  const [first, middle, last] = buffer;
  const settled = { ...middle };
  keys.forEach((key) => {
    settled[key] = median3(first[key], middle[key], last[key]);
  });
  buffer.shift();
  return settled;
}
// ---- タブ切り替え ----
```

- [ ] **Step 4: 純粋ヘルパーのテストが通ることを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_spike_filter.py' -v`

Expected: PASS。`test_push_median_window_returns_medianized_center_velocity` と `test_push_median_window_is_generic_for_acceleration_axes` の両方が成功する。

- [ ] **Step 5: ヘルパー追加をコミットする**

Run:

```bash
git add src/location.html tests/test_location_spike_filter.py
git commit -m "feat: add location spike filter helpers"
```

Expected: `feat: add location spike filter helpers` のコミットが作られる。

### Task 2: 速度・加速度の配線をフィルタ済み確定値へ置き換える

**Files:**
- Modify: `src/location.html`
- Modify: `tests/test_location_page.py`

- [ ] **Step 1: 配線回帰テストを追加する**

`tests/test_location_page.py` の `LocationPageSourceTest` へ次のメソッドを追加する。

```python
    def test_location_page_filters_velocity_and_acceleration_spikes(self):
        source = LOCATION_SOURCE.read_text(encoding="utf-8")

        self.assertIn("const velocityWindow = []", source)
        self.assertIn("const accelWindow = []", source)
        self.assertIn("function confirmVelocitySample(rawSample)", source)
        self.assertIn("function confirmAccelerationSample(rawSample)", source)
        self.assertIn("const settledVelocity = pushMedianWindow(velocityWindow, rawSample, ['vx', 'vy', 'vz']);", source)
        self.assertIn("const settledAccel = pushMedianWindow(accelWindow, rawSample, ['ax', 'ay', 'az']);", source)
        self.assertIn("track[settledVelocity.trackIndex].speed = speedMag", source)
        self.assertIn("track[settledAccel.trackIndex].accel = accelMag", source)
        self.assertIn("velocityWindow.length = 0;", source)
        self.assertIn("accelWindow.length = 0;", source)
        self.assertNotIn(\"pushS('vx', t, vX); pushS('vy', t, vY); pushS('vz', t, vZ);\", source)
        self.assertNotIn(\"pushS('ax', t, aX); pushS('ay', t, aY); pushS('az', t, aZ);\", source)
```

- [ ] **Step 2: 配線回帰テストが失敗することを確認する**

Run: `python3 -m unittest discover -s tests -p 'test_location_page.py' -v`

Expected: FAIL。`confirmVelocitySample` / `confirmAccelerationSample` がまだ無く、速度・加速度はまだ `onPos()` から直接 `pushS(...)` されている。

- [ ] **Step 3: 速度・加速度の確定処理を実装する**

`src/location.html` に次の関数を追加し、`onPos()` 内の直接 `pushS('vx'...)` / `pushS('ax'...)` を置き換える。

```javascript
function confirmAccelerationSample(rawSample) {
  const settledAccel = pushMedianWindow(accelWindow, rawSample, ['ax', 'ay', 'az']);
  if (!settledAccel) return;

  pushS('ax', settledAccel.t, settledAccel.ax);
  pushS('ay', settledAccel.t, settledAccel.ay);
  pushS('az', settledAccel.t, settledAccel.az);

  const accelMag = Math.hypot(settledAccel.ax, settledAccel.ay, settledAccel.az);
  track[settledAccel.trackIndex].accel = accelMag;
  document.getElementById('accMag').innerHTML =
    accelMag.toFixed(2) + ' <small>m/s²</small>';
}

function confirmVelocitySample(rawSample) {
  const settledVelocity = pushMedianWindow(velocityWindow, rawSample, ['vx', 'vy', 'vz']);
  if (!settledVelocity) return;

  const prevVI = SERIES.vx.v.length - 1;
  const prevVX = prevVI >= 0 ? SERIES.vx.v[prevVI] : null;
  const prevVY = prevVI >= 0 ? SERIES.vy.v[prevVI] : null;
  const prevVZ = prevVI >= 0 ? SERIES.vz.v[prevVI] : null;
  const prevVT = prevVI >= 0 ? SERIES.vx.t[prevVI] : null;

  pushS('vx', settledVelocity.t, settledVelocity.vx);
  pushS('vy', settledVelocity.t, settledVelocity.vy);
  pushS('vz', settledVelocity.t, settledVelocity.vz);

  const speedMag = Math.hypot(settledVelocity.vx, settledVelocity.vy, settledVelocity.vz);
  track[settledVelocity.trackIndex].speed = speedMag;
  document.getElementById('spdMag').innerHTML =
    speedMag.toFixed(2) + ' <small>m/s</small>';

  if (prevVI >= 0 && settledVelocity.t > prevVT) {
    const dtv = settledVelocity.t - prevVT;
    confirmAccelerationSample({
      t: settledVelocity.t,
      trackIndex: settledVelocity.trackIndex,
      ax: (settledVelocity.vx - prevVX) / dtv,
      ay: (settledVelocity.vy - prevVY) / dtv,
      az: (settledVelocity.vz - prevVZ) / dtv,
    });
  }
}
```

`onPos()` 側の速度・加速度計算部は次の形へ置き換える。

```javascript
  if (prevI >= 0) {
    const dt = t - sx.t[prevI];
    if (dt > 0) {
      const vX = (xE - sx.v[prevI]) / dt;
      const vY = (yN - SERIES.y.v[prevI]) / dt;
      const vZ = (zU - SERIES.z.v[prevI]) / dt;
      confirmVelocitySample({
        t,
        trackIndex: track.length - 1,
        vx: vX,
        vy: vY,
        vz: vZ,
      });
    }
  }
```

リセット処理の末尾にも次を追加する。

```javascript
  velocityWindow.length = 0;
  accelWindow.length = 0;
```

- [ ] **Step 4: 位置ページ回帰とスパイクヘルパーテストを再実行する**

Run: `python3 -m unittest discover -s tests -v`

Expected: PASS。既存の `test_location_page.py` と新規 `test_location_spike_filter.py` の両方が成功する。

- [ ] **Step 5: 配線置換をコミットする**

Run:

```bash
git add src/location.html tests/test_location_page.py tests/test_location_spike_filter.py
git commit -m "feat: filter location speed spikes"
```

Expected: `feat: filter location speed spikes` のコミットが作られる。

### Task 3: 配布用HTMLを再生成し、最終確認してコミットする

**Files:**
- Verify: `src/location.html`
- Verify: `tests/test_location_page.py`
- Verify: `tests/test_location_spike_filter.py`
- Verify: `location.html`

- [ ] **Step 1: 生成前の差分整合を確認する**

Run: `git diff --check`

Expected: 出力なし。空白崩れや conflict marker が無い。

- [ ] **Step 2: 単体テストをフルで実行する**

Run: `python3 -m unittest discover -s tests -v`

Expected: 全テスト PASS。`test_push_median_window_returns_medianized_center_velocity` を含む新規テストも通る。

- [ ] **Step 3: 配布用HTMLを再生成する**

Run: `python3 build.py`

Expected: `location.html: 生成OK` を含め、各ページに `生成OK` が並ぶ。

- [ ] **Step 4: 生成物にフィルタヘルパーが埋め込まれたことを確認する**

Run: `rg -n "pushMedianWindow|confirmVelocitySample|confirmAccelerationSample|velocityWindow|accelWindow" location.html`

Expected: `location.html` にフィルタヘルパー、確定関数、速度・加速度ウィンドウが見つかる。

- [ ] **Step 5: 生成物込みでコミットする**

Run:

```bash
git add location.html
git commit -m "build: regenerate location page with spike filter"
```

Expected: `build: regenerate location page with spike filter` のコミットが作られる。
