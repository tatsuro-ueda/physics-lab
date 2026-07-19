# リポジトリ構造定義
ファイルの正本、生成物、責務、編集可否を明示し、「どのファイルを直すか」の判断負荷を下げる。本書は配置規則の正本である。設計理由は [architecture.md](architecture.md)、体験規則は [UX-policy.md](UX-policy.md)、実装判断の短い規約は [coding-rules.md](coding-rules.md) を参照する。

## 全体構造
- `build.py`: `src/` の正本からルートHTMLを生成する。
- `src/`: 配布ページと共有JS・CSSの正本。
- `docs/`: 恒久ルール、チェックリスト、調査文書、設計書。
- `tests/`: 回帰テストと自動検査。
- `*.html`: 配布用の単一HTML生成物。

## 正本と生成物
- 各ページの正本は `src/<page>.html`、生成物は `/<page>.html`。
- 3軸グラフと共通操作は `src/lab-common.js`。
- 体験チュートリアルは `src/tutorial.js`。
- 初回オンボーディングは `src/tour.js`。
- 縦向きガードは `src/orientation-guard.js`。
- `uplot.js`、`driver.js`、`driver.css` はベンダー資産として無改変で保持する。

## `src/` の責務
- `src/*.html` はページ固有のマークアップ、入力取得、単位・符号補正、課題、オンボーディング対象を持つ。
- 共通部品は `<script src>` や `<link>` で参照し、ページへ手作業で複製しない。
- 共通ファイルを直したら、参照している全ページを検証対象にする。

## ルートHTML
- ルートの `*.html` は生成物であり、直接編集しない。
- `python3 build.py` で再生成する。
- `src/` を変更したコミットには、対応する生成物を含める。
- 生成物だけに存在する修正を作らない。
- 配布と実機検証は `file://` ではなくHTTPSで行う。

## `docs/` の責務
- `architecture.md`、`repository-structure.md`、`UX-policy.md`、`coding-rules.md` は現行規約の正本。
- `development-checklist.md` は現行規約から導くレビュー用派生物。
- `docs/specs/` は個別機能の設計、`docs/superpowers/` は承認済みの設計と実装計画を置く。
- 恒久ルールと個別機能の設計を混ぜない。

## `tests/` と追加判断
- 共通部品の不具合には、共通部品を検証するテストを追加する。
- 新しいページは `src/<page>.html` を作り、必要なら `src/index.html`、`tests/`、生成物を更新する。
- 複数ページが同じ理由で一緒に変わるなら共通部品、計測対象だけの意味ならページ固有コードへ置く。
- 恒久ルールは `docs/`、個別設計は `docs/specs/`、回帰防止は `tests/` に置く。

## 禁止事項

- ルートHTMLを直接編集する。
- 共通部品をページ内へ複製する。
- ベンダー資産へプロジェクト固有の変更を直接加える。
- `src/` の変更後に生成物を更新せず配布する。
- 授業中の外部接続がなければ動かない参照を追加する。
