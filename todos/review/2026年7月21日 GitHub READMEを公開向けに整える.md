---
status: done
format: rough-dev
devStage: closing
priority: normal
scheduled: 2026-07-21T01:31:39.000+09:00
dateCreated: 2026-07-21T01:31:39.000+09:00
dateModified: 2026-07-21T01:31:39.000+09:00
tags:
  - task
---

# 2026年7月21日 GitHub READMEを公開向けに整える

> 状態：devStage closing
> 次のゲート：なし

## 概要

- When: 2026年7月20日〜21日
- Where: physics-labリポジトリのGitHub公開READMEと関連docs
- Who: FeelさんとCodex（Claudeのローカル会話ログも参照）
- What: READMEを公開向けの短い案内板へ直し、詳しい情報を利用・開発・保守ガイドへ分離した
- Why: 物理が身近で、手元のスマホや学校端末が実験室になる価値を初見の人へ伝えるため

## Spec

### 決定事項

- README冒頭に「物理は難しそうだが実は身近で、手のひらの端末が実験室になる」というWhyを置く
- READMEは価値、試すURL・QR、主な実験、開発入口、ライセンスに絞る
- 授業手順・全アプリ・安全・プライバシー・他ツール比較は`docs/usage.md`へ分ける
- 部品対応表と共通機構は`docs/development.md`、VM運用は`docs/maintainer-operations.md`へ分ける
- MIT Licenseを追加し、誤った`master:main`手順、主観的な競合表現、「外部通信なし」という広すぎる表現を修正する
- README画像は表示幅240pxに対して3倍の横720pxを保ち、8-bit PNGへ軽量化する

### 却下案

- 211行または115行のREADMEへ全情報を残す案。初見の人に説明書全体を読ませる形になるため却下した
- Whyを独立した長い章にする案。クルーグ流の「ユーザーは流し見る」に反するため、タイトル直下の短い段落にした
- PhET・phyphox・Vernier・PASCOを「重い」「説明が多い」と評価する案。公開比較として主観的なため却下した
- VM固有の同期・デプロイ手順をREADMEへ残す案。外部利用者の入口を長くするため保守文書へ移した

### 未決事項

- なし

### 完了条件

- [x] READMEでWhyと試し方が初見で分かる
- [x] READMEの詳細情報が用途別docsへ移り、リンク切れがない
- [x] 安全、プライバシー、比較表現が事実に沿っている
- [x] LICENSEが追加されている
- [x] 画像が軽量化され、文字・グラフ・QRコードを判読できる
- [x] 意図したファイルだけがcommitされ、`origin/main`へpushされている

### 設計レビュー

- 原本 checklist: `docs/development-checklist.md`
- /tmp コピー: なし（作業後のbackfillのため、実装前の設計レビューは未実施）
- レビュー結果: 事後起票のため未実施。代わりにClosingの最終レビューで成果物を検証した
- 未通過時の扱い: backfillで事前レビューを実施済みとは記録しない

## 作業ログ

- `llm-log-query`でbusiness-docs中央索引を検索したが0件だったため、このVMのClaudeメイン会話ログを読み取り専用で確認した
- Claude会話から「先生・生徒向け→開発者向け」の意図と、ライセンス・内部情報・画像容量・主観比較の懸念を回収した
- READMEへMIT License、正しいmain push手順、落下実験の安全条件、計測データ非送信の正確な表現を追加した
- `recommend`と`research`で他ツールの公式情報を確認し、比較軸を実測方式・始め方・追加機器へ限定した
- スクリーンショット3枚を1284×2778から720×1558へ変更し、合計約1.1MBから約184KBへ削減した
- `krug`でREADMEの長さとWhyを議論し、READMEを56行へ縮めて詳細を用途別docsへ分離した
- `git diff --check`、Markdownのローカルリンク、画像の寸法と目視を確認した
- commit `34abb54`を作成し、`origin/main`へpushした。ローカルHEADと`origin/main`のSHA一致を確認した
- skill・tool・MCP確認済み: `llm-log-query`、`facial-expression`、`recommend`、`research`、`krug`、`discuss-with-adviser`、`github:yeet`

## Result

- `README.md`は公開向けの案内板として56行に整理された
- `docs/usage.md`、`docs/development.md`、`docs/maintainer-operations.md`へ詳細が用途別に保存された
- `LICENSE`と軽量化済みスクリーンショット3枚がGitHubへ反映された
- 成果コミット: `34abb54bbd16ba057f840480ff3c4154cbaa97b6`

## Discussion

- クルーグ流の「READMEは説明書ではなく案内板」という判断が、情報を捨てずに短くする基準として有効だった
- Whyは長い理念章にせず、「難しそう→実は身近→手のひらが実験室」の順で冒頭に置くと、価値と具体性を両立できた
- 公開READMEでは、内部運用の網羅性より、初見の人が次に何をすればよいかを優先する
- 外部製品との比較は、優劣の形容ではなく、確認できる利用条件だけを書く

## Closing

- 状態: done
- 次のゲート: なし
- close 条件:
  - [x] Specから外れていない
  - [x] 実装成果がResultに記録されている
  - [x] 最終レビューを実施した
  - [x] 未記録の作業ログが記録済み

### 最終レビュー

- 原本 checklist: `docs/development-checklist.md`
- /tmp コピー: `/tmp/development-final-checklist-20260721-0131.md`
- レビュー結果: README・Markdown・画像だけの変更として全項目を確認した。実行時コード固有の項目は変更なしで該当なし。`git diff --check`、リンク存在、画像寸法、push先SHAを確認済み
- 未通過時の扱い: 不一致があればcloseせず、READMEまたは関連docsを修正して再レビューする
