# Paused-Only Marker Values Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 時系列グラフで、線をタップした点の値を一時停止中だけ表示する。

**Architecture:** 値読み可否は `src/lab-common.js` の `createTimeSeriesCharts` が任意の `canReadValue` コールバックから判断する。`createXYZLab` と位置ページは各自の計測状態を渡し、ページ別のタップ処理は増やさない。共通JSは `build.py` で各配布HTMLへ埋め込む。

**Tech Stack:** JavaScript Pointer Events、uPlot、静的HTML生成、Python unittest、Playwright

---

### Task 1: 値読み制約の回帰テストを追加する

**Files:**
- Modify: `tests/test_lab_common.py`
- Modify: `tests/test_acceleration_page.py`
- Modify: `tests/test_location_page.py`

- [ ] `tests/test_lab_common.py` に、線の近くをタップした判定は保ちつつ、`canReadValue()` が真のときだけ `hasMarker`、カーソル、`onMarker` を更新する検査を追加する。
- [ ] uPlotのカーソル更新フックも `canReadValue()` でガードし、計測中はツールチップと選択時刻の数値を描画しないことを検査する。
- [ ] 同テストに、`createXYZLab` が `canReadValue: () => !running` を渡すことと、4つの生成グラフページへ判定が埋め込まれることを追加する。
- [ ] 加速度テストに「⏸で止めてから線をタップ」の案内と、既存の一時停止が値読みより先にあることを追加する。
- [ ] 位置テストに `canReadValue: () => !isRunning()`、`tut.event('paused')`、`on: 'paused'`、一時停止から値読みへの順序を追加する。
- [ ] 対象テストを実行し、未実装のため失敗することを確認する。

Run: `python3 -m unittest tests.test_lab_common tests.test_acceleration_page tests.test_location_page -v`
Expected: `canReadValue` と位置の `paused` がないため FAIL

### Task 2: 共通グラフで計測中の値読みを止める

**Files:**
- Modify: `src/lab-common.js`
- Test: `tests/test_lab_common.py`

- [ ] 線との距離が30px未満なら先に `onLine = true` とし、計測中の線タップが通常表示への復帰として扱われないようにする。
- [ ] 共通の `canReadValue()` を作り、uPlotのカーソル更新フックでは偽のときにツールチップを隠して現在値へ戻す。
- [ ] `canReadValue()` が真のときだけ、`hasMarker = true`、カーソル表示、`cfg.onMarker` を実行する。
- [ ] `createXYZLab` から `canReadValue: () => !running` を共通グラフへ渡す。
- [ ] 対象テストを再実行し、成功を確認する。

実装する条件分岐:

```javascript
if (dist < 30) {
  onLine = true;
  if (canReadValue()) {
    hasMarker = true;
    plot.setCursor({ left: ptX, top: ptY });
    if (cfg.onMarker) cfg.onMarker({ key, idx, t: series[key].t[idx], v: value });
  }
}
```

### Task 3: ページ案内と位置チュートリアルを状態制約へ合わせる

**Files:**
- Modify: `src/acceleration.html`
- Modify: `src/location.html`
- Modify: `src/gyroscope.html`
- Modify: `src/magnetometer.html`
- Modify: `docs/UX-policy.md`
- Test: `tests/test_acceleration_page.py`
- Test: `tests/test_location_page.py`

- [ ] 加速度と位置の拡大時ヒントを「⏸で止めてから線をタップして値を読む」へ変更する。
- [ ] ジャイロと磁気のヒントを「止めると読みやすい」から「止めてから値を読む」へ変更する。
- [ ] `docs/UX-policy.md` の値読み規則へ「一時停止中だけ」を反映する。
- [ ] 位置の `stopWatching('paused')` で `tut.event('paused')` を通知する。
- [ ] 位置チュートリアルのドラッグ後、値読み前へ `on: 'paused'` の一時停止ステップを追加する。
- [ ] 位置グラフへ `canReadValue: () => !isRunning()` を渡す。
- [ ] 対象テストを再実行し、成功を確認する。

位置へ追加するステップ:

```javascript
() => ({
  html: () => window.TUT_ICONS.pause + ' を押して記録を止めよう',
  on: 'paused',
}),
```

### Task 4: 生成、ブラウザ検証、配信を完了する

**Files:**
- Modify (generated): `acceleration.html`
- Modify (generated): `gyroscope.html`
- Modify (generated): `location.html`
- Modify (generated): `magnetometer.html`

- [ ] `python3 build.py` を実行し、共通判定を各HTMLへ埋め込む。
- [ ] `python3 -m unittest discover -s tests -v` と `git diff --check` を実行する。
- [ ] ブラウザで、計測中の線タップは値を出さず拡大状態を維持し、一時停止後は値を表示することを確認する。
- [ ] ブラウザで、拡大、ピンチ、ドラッグ、通常表示への復帰が計測中も使えることを確認する。
- [ ] `./scripts/deploy-physics-lab` を実行し、Caddy配信HTMLと生成HTMLの一致を確認する。
- [ ] 実装とテストをコミットする。
