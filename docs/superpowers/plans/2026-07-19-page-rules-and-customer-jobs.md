# Page Rules and Customer Jobs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 加速度・音響ストップウォッチで得たページ設計規約を3つの正本文書と開発チェックリストへ整理し、先生のCustomer Jobsをwikiの根拠境界付きで残す。

**Architecture:** 責務境界、配置規則、UX規則をそれぞれ `architecture.md`、`repository-structure.md`、`UX-policy.md` の正本へ分離する。チェックリストは3文書だけから派生させ、Customer Jobsはリモートwikiの隣接証拠と未検証仮説を明確に分ける。

**Tech Stack:** Markdown、HTML/CSS/JavaScript、Python標準ライブラリによる `build.py`、Python `unittest`

---

### Task 1: READMEを現行実装へ同期する

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 現行コードの値を再確認する**

Run: `rg -n "toPrecision|COLORS|driver.js|uplot.js" README.md src/lab-common.js src/acceleration.html`

Expected: タップ値は `toPrecision(3)`、軸色は `#4C8DF0 / #4FC96B / #F2C744`、ライブラリはリポジトリ内同梱と確認できる。

- [ ] **Step 2: READMEの3か所を修正する**

タップ値を有効数字3桁へ、軸色を現行色へ、依存方針を「実行時に外部ネットワークへ依存しない」へ変更する。

- [ ] **Step 3: 古い記述が残っていないことを確認する**

Run: `rg -n "有効数字2桁|#ff9500|#d4c400|#e04040|外部JSライブラリは使わない" README.md`

Expected: 該当なし。

### Task 2: 3つの正本文書を作成する

**Files:**
- Create: `docs/architecture.md`
- Create: `docs/repository-structure.md`
- Create: `docs/UX-policy.md`

- [ ] **Step 1: architecture.mdを書く**

共通エンジンとページ固有コードの境界、入力から表示・チュートリアルまでの流れ、端末資源の解放、単一HTMLビルド、検証規約を書く。

- [ ] **Step 2: repository-structure.mdを書く**

リポジトリツリーと、各パスの責務・正本・生成物・編集可否を書く。

- [ ] **Step 3: UX-policy.mdを書く**

教育体験、画面操作、縦向き、状態表示、権限、初回ツアー、体験チュートリアル、エラー、アクセシビリティを書く。

- [ ] **Step 4: 文書間の重複と不足を確認する**

Run: `rg -n "正本|生成物|30秒|最大3|20文字|visibilitychange|build.py" docs/architecture.md docs/repository-structure.md docs/UX-policy.md`

Expected: 各規則が意図した責務の文書に存在し、相互参照がある。

### Task 3: 3文書から開発チェックリストを生成する

**Files:**
- Create: `docs/development-checklist.md`

- [ ] **Step 1: チェック項目を抽出する**

3文書に明記された検査可能な規則だけを、アーキテクチャ・構成・UXの3章へ割り当てる。

- [ ] **Step 2: 根拠付きの単一事実へ整形する**

各行を `- [ ] 規則（根拠：docs/<文書>「節名」）` とし、複数条件を一行へ詰めない。

- [ ] **Step 3: フロントマターと件数を確認する**

Run: `rg -c "^- \[ \]" docs/development-checklist.md && sed -n '1,12p' docs/development-checklist.md`

Expected: 1件以上のチェック項目と、`status: latest`、`dateCreated: 2026-07-19`、`dateModified: 2026-07-19` がある。

### Task 4: Customer Jobsを作成する

**Files:**
- Create: `docs/customer-jobs.md`

- [ ] **Step 1: Bob Moesta式の構造を書く**

主人公、状況、Job statement、望む進歩、Push、Pull、Anxiety、Habit、機能的・感情的・社会的Job、採用タイムライン、設計への含意を書く。

- [ ] **Step 2: 主張を証拠レベルで分離する**

wikiの隣接証拠、既存アプリから得た設計仮説、未検証事項を混ぜずにラベル付けする。

- [ ] **Step 3: 境界を確認する**

Run: `rg -n "中高|直接証拠|隣接証拠|未検証|Boundary Note" docs/customer-jobs.md`

Expected: 中高教師×生徒端末×物理計測の直接証拠がないことと、事実として扱わない境界が明記されている。

### Task 5: 全体を検証する

**Files:**
- Verify: `README.md`
- Verify: `docs/architecture.md`
- Verify: `docs/repository-structure.md`
- Verify: `docs/UX-policy.md`
- Verify: `docs/development-checklist.md`
- Verify: `docs/customer-jobs.md`

- [ ] **Step 1: プレースホルダーと古い記述を検査する**

Run: `rg -n "TBD|TODO|有効数字2桁|#ff9500|#d4c400|#e04040|外部JSライブラリは使わない" README.md docs/*.md`

Expected: 該当なし。

- [ ] **Step 2: 差分の形式を検査する**

Run: `git diff --check`

Expected: 終了コード0。

- [ ] **Step 3: 既存テストを実行する**

Run: `python3 -m unittest discover -s tests -v`

Expected: 全テスト成功。

- [ ] **Step 4: 単一HTMLを再生成する**

Run: `python3 build.py`

Expected: 全ページが `生成OK`。

- [ ] **Step 5: 文書変更が生成物を変えていないことを確認する**

Run: `git status --short`

Expected: README、計画書、5つの対象文書だけが変更または追加され、ルートHTMLに差分がない。
