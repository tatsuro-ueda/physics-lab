# Graph Gesture Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 加速度と位置の時系列グラフで、拡大後の2次元パン、2軸ピンチ、値読み、縮小を、docsのチェックリストを満たす同じ操作と案内で完結させる。

**Architecture:** ジェスチャー処理は `src/lab-common.js` の `createTimeSeriesCharts` に集約する。ページ側は共通処理の `onPan` / `onPinch` 通知をチュートリアルへ渡し、独自のポインター処理を持たない。

**Tech Stack:** JavaScript Pointer Events、uPlot、静的HTML生成、Python unittest

---

## Checklist Acceptance

- `development-checklist` A: ジェスチャー処理と状態は `src/lab-common.js` を正本とし、ページ側へ複製しない。
- `development-checklist` B: 画面で成立したパン・ピンチと、チュートリアル合格を同じ `onPan` / `onPinch` イベントへ接続する。
- `development-checklist` C: 通常時はタップ拡大だけ、拡大後は一課題一操作にして、設定や長文を増やさない。
- `customer-checklist`: 加速度と位置で操作を共通化し、教員のページ別説明を増やさない。
- `user-checklist`: 自分の指へグラフが追従する一般的な2次元操作にし、別ページでも同じ感覚で使えるようにする。
- `UX-policy`: 通常表示と拡大表示の役割を混ぜず、ヒントは現在状態で使える操作だけを短文で示す。
- `coding-rules`: ルートHTMLを直接編集せず、共通APIは任意コールバックとして既存ページとの互換性を保つ。
- `architecture`: `src/lab-common.js` を正本とし、`build.py` で各配布HTMLへインライン化して、Caddyでは単一HTMLだけで動作させる。

### Task 1: 回帰テストを追加する

**Files:**
- Modify: `tests/test_lab_common.py`
- Modify: `tests/test_acceleration_page.py`
- Modify: `tests/test_location_page.py`

- [ ] `test_lab_common.py` に、ドラッグが `dx` と `dy` を使って x/y 両軸を移動すること、ピンチ開始距離も2次元で測ること、`onPan` / `onPinch` を通知することを検査するテストを追加する。
- [ ] 仕様にないダブルタップの表示リセットが残っていないことを検査する。
- [ ] 加速度と位置のテストに、`panned` / `pinched` の必須チュートリアル手順と共通の操作案内を検査するテストを追加する。
- [ ] 生成後の加速度・位置・ジャイロ・磁気HTMLに共通ジェスチャー処理が埋め込まれ、`lab-common.js` の外部参照が残らないことを検査する。
- [ ] `python3 -m unittest tests.test_lab_common tests.test_acceleration_page tests.test_location_page -v` を実行し、不足要件によって失敗することを確認する。

### Task 2: 共通グラフのジェスチャーを完成させる

**Files:**
- Modify: `src/lab-common.js`
- Test: `tests/test_lab_common.py`

- [ ] ピンチ開始時の距離を `Math.hypot(dx, dy)` で保存し、最初の移動で縮尺が跳ねないようにする。
- [ ] 単指ドラッグで時間軸に加えて選択中グラフの値軸も移動し、グラフが指についてくる向きにする。
- [ ] 有効な操作後だけ `cfg.onPan` / `cfg.onPinch` を通知する。
- [ ] `createXYZLab` からページ設定の通知を共通グラフへ渡す。
- [ ] 状態遷移図にないダブルタップの自動リセットを削除し、タップの意味を拡大・値読み・縮小へ限定する。
- [ ] 対象テストを再実行して成功を確認する。

### Task 3: ページ案内とチュートリアルを揃える

**Files:**
- Modify: `src/acceleration.html`
- Modify: `src/location.html`
- Test: `tests/test_acceleration_page.py`
- Test: `tests/test_location_page.py`

- [ ] 両ページの拡大時ヒントを、`2本指で拡大縮小`、`1本指で移動`、`線をタップして値を読む`、`線から離れてタップして戻る` の状態別短文へ統一する。
- [ ] 加速度チュートリアルを `一時停止 → 拡大 → ピンチ → ドラッグ → 点選択 → 縮小` の順にする。
- [ ] 位置チュートリアルにも拡大・ピンチ・ドラッグ・点選択・縮小を必須手順として追加する。
- [ ] ページ側で共通グラフの通知を `tut.event('panned')` / `tut.event('pinched')` へ接続する。
- [ ] 各チュートリアル画面は一つの操作だけを指示し、初回オンボーディングは変更しない。
- [ ] 対象テストを再実行して成功を確認する。

### Task 4: 生成・検証・配信を完了する

**Files:**
- Modify (generated): `acceleration.html`
- Modify (generated): `location.html`
- Modify (generated): `gyroscope.html`
- Modify (generated): `magnetometer.html`

- [ ] `python3 build.py` で共有コードを各HTMLへ埋め込む。
- [ ] `python3 -m unittest discover -s tests -v` と `git diff --check` を実行する。
- [ ] HTTPSブラウザで加速度と位置の通常表示・拡大表示・ピンチ・2次元ドラッグ・値読み・縮小を確認する。
- [ ] `./scripts/deploy-physics-lab` でCaddyへ反映し、配信HTMLと生成HTMLが一致することを確認する。
