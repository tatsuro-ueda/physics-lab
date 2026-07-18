# リポジトリ構造定義

## 目的

ファイルの正本、生成物、責務、編集可否を明示し、「どのファイルを直すか」の判断負荷を下げる。本書は配置規則の正本である。責務の設計理由は [architecture.md](architecture.md)、利用者体験の規則は [UX-policy.md](UX-policy.md) を参照する。

## 全体構造

```text
physics-lab/
├── README.md
├── build.py
├── src/
│   ├── index.html
│   ├── acceleration.html
│   ├── stopwatch.html
│   ├── gyroscope.html
│   ├── magnetometer.html
│   ├── location.html
│   ├── sound.html
│   ├── compass.html
│   ├── qr.html
│   ├── lab-common.js
│   ├── tutorial.js
│   ├── tour.js
│   ├── orientation-guard.js
│   ├── uplot.js
│   ├── driver.js
│   └── driver.css
├── docs/
│   ├── architecture.md
│   ├── repository-structure.md
│   ├── UX-policy.md
│   ├── development-checklist.md
│   ├── customer-jobs.md
│   ├── specs/
│   └── superpowers/
├── tests/
│   └── test_lab_common.py
└── *.html
```

## 正本と生成物

| 対象 | 正本 | 生成物・利用先 | 直接編集 |
|---|---|---|---|
| 各ページ | `src/<page>.html` | `/<page>.html` | ルートHTMLは禁止 |
| 3軸グラフと共通操作 | `src/lab-common.js` | 対象HTMLへインライン化 | 正本だけ編集 |
| 体験チュートリアル | `src/tutorial.js` | 対象HTMLへインライン化 | 正本だけ編集 |
| 初回オンボーディング | `src/tour.js` | 対象HTMLへインライン化 | 正本だけ編集 |
| 縦向きガード | `src/orientation-guard.js` | 全ページへインライン化 | 正本だけ編集 |
| uPlot | `src/uplot.js` | 対象HTMLへインライン化 | ベンダー資産は無改変 |
| driver.js | `src/driver.js`、`src/driver.css` | 対象HTMLへインライン化 | ベンダー資産は無改変 |
| ビルド処理 | `build.py` | ルートの全HTML | `build.py`を編集 |
| ページ規約 | `docs/architecture.md`、`docs/repository-structure.md`、`docs/UX-policy.md` | 開発チェックリスト | 3文書を先に更新 |
| 開発チェックリスト | 上記3文書 | `docs/development-checklist.md` | 派生物として再生成 |

## `src/` の責務

### ページHTML

`src/*.html` は配布ページの正本である。ページ固有のマークアップ、スタイル、入力取得、物理量変換、チュートリアル課題、オンボーディング対象を置く。

共有JS・CSSは `<script src>` または `<link rel="stylesheet">` で参照し、ページへ手作業でコピーしない。

### 共通ファイル

- `lab-common.js`: 3軸計測のデータ、グラフ、タップ、拡大、開始・停止・削除
- `tutorial.js`: 体験チュートリアルの進捗、DOM、保存、共通アイコン
- `tour.js`: 初回オンボーディングの起動、テーマ、既読保存
- `orientation-guard.js`: 横向きタッチ端末への縦向き案内

共通ファイルを直すときは、参照している全ページを検証対象にする。

### ベンダー資産

- `uplot.js`
- `driver.js`
- `driver.css`

ベンダー資産は無改変で保持する。見た目や動作の調整は、それを利用する共通ファイルまたはページ側で行う。更新時はライセンス、バージョン、生成物への埋め込みを確認する。

## ルートHTML

ルートの `*.html` はGitHub Pagesと検証環境へ配る単一HTMLの生成物である。

- 直接編集しない。
- `python3 build.py` で再生成する。
- `src/` を変更したコミットには、対応する生成物を含める。
- 生成物だけに存在する修正を作らない。
- `file://` ではなくHTTPSで配信する。

## `docs/` の責務

### 現行規約

- `architecture.md`: 責務分担、データフロー、実装・ビルド・テスト規約
- `repository-structure.md`: 配置、正本、生成物、編集可否
- `UX-policy.md`: 教育体験と画面・操作の規範
- `development-checklist.md`: 上記3文書から生成するレビュー用派生物
- `customer-jobs.md`: 先生が求める進歩と採用を動かす力

### 補助文書

- `docs/specs/`: 個別機能の設計書
- `docs/superpowers/specs/`: 承認済みの作業設計
- `docs/superpowers/plans/`: 実装計画

現行規約と個別機能の設計を混ぜない。個別設計が恒久ルールになった場合は、3つの現行規約の該当文書へ昇格する。

## `tests/` の責務

回帰テストと自動検査を置く。テスト名は、守る利用者行動または不具合を表す。共通部品の不具合には、共通部品を検証するテストを追加する。

端末センサーの自動再現が困難な場合でも、JavaScript上の状態接続や生成物への反映は可能な範囲で自動検査する。実機だけで確認できる部分は手動手順を文書化する。

## 新しいページを追加する場所

1. `src/<page>.html` を作る。
2. メニューへ公開する場合は `src/index.html` を更新する。
3. 既存の共通部品を参照する。
4. ページ固有の入力と課題だけを書く。
5. `python3 build.py` で `/<page>.html` を生成する。
6. 必要な回帰テストを `tests/` に追加する。
7. 3つの規約でレビューする。

## 配置判断

| 変更内容 | 置き場所 |
|---|---|
| 複数の3軸ページで使う描画・操作 | `src/lab-common.js` |
| 複数ページで使う学習進捗・課題UI | `src/tutorial.js` |
| 初回の場所案内 | `src/tour.js` と各ページのステップ定義 |
| 全ページ共通の向き制約 | `src/orientation-guard.js` |
| センサーAPI、符号、単位、状態機械 | 対応する `src/<page>.html` |
| 恒久的な責務・実装規則 | `docs/architecture.md` |
| 恒久的な配置規則 | `docs/repository-structure.md` |
| 恒久的な利用体験規則 | `docs/UX-policy.md` |
| 個別機能の設計判断 | `docs/specs/` |
| 回帰防止 | `tests/` |

判断に迷う場合は、「複数ページが同じ理由で一緒に変わるか」を見る。一緒に変わるなら共通部品、計測対象だけの意味ならページ固有コードへ置く。

## 禁止事項

- ルートHTMLを直接編集する。
- 共通部品をページ内へ複製する。
- ベンダー資産へプロジェクト固有の変更を直接加える。
- `src/` の変更後に生成物を更新せず配布する。
- CDNなど、授業中の外部接続がなければ動かない参照を追加する。
- 作業コピー間を`scp`で上書きして同期する。
