---
status: done
format: rough
priority: normal
scheduled: 2026-07-20T18:00:00.000+09:00
dateCreated: 2026-07-20T22:10:00.000+09:00
dateModified: 2026-07-20T22:10:00.000+09:00
tags:
  - task
  - backfill
  - archived
---

# 2026年7月20日 physics-labを専用VMへ切り出す

> 状態：done（backfill）
> 次のゲート：なし（2026年7月27日の旧VM削除は別tasknoteへ分離済み）

## 概要

- When: 2026年7月20日
- Where: `newtons-challenge.exe.xyz`（旧）→ `physics-lab.exe.xyz`（新設）
- Who: Feelさん＋AIエージェント
- What: physics-labの開発環境を同居VMから専用VMへ切り出す
- Why: exe.devの「1マシン=1プロジェクト=ホスト名」原則に合わせ、認知負荷とホスト名前提のズレを解消するため

## 作業ログ（実績）

- [x] 前提整理：レビューブランチの未コミット6ファイル（グラフタップ判定改良＋テスト）をコミット（`f97178e`）
- [x] `review/checklists-2026-07-19` をmainへff合流（15コミット）→ GitHub push → ブランチ削除
- [x] exe.devホスト鍵を公式フィンガープリントと照合して登録
- [x] （Feelさん）Mac側で新VM作成 `new --name=physics-lab` と、旧VM鍵の `ssh-key add` 登録
- [x] 新VMへ `git clone`（https、最新`f97178e`）。既存ひな型は `~/physics-lab.init-backup` へ退避
- [x] Caddy 2.6.2 導入、`/etc/caddy/Caddyfile` で `:8000` → `/srv/www/physics-lab` 配信
- [x] `install-deploy-helper.sh` → `deploy-physics-lab` 初回デプロイ → local 200
- [x] `share set-public physics-lab` で旧VMと同じPUBLICへ → 外部DNS経由で200・タイトル「タブレット物理実験ラボ」確認
- [x] 新VM上でテスト `python3 -m unittest discover -s tests` → 36件OK
- [x] README開発用URLを `https://physics-lab.exe.xyz/` へ更新（`22d09bf`）→ push → 新VMへpull反映
- [x] 新VMのGitHub認証：`gh auth login`（device flow、tatsuro-ueda）＋ `gh auth setup-git` → `git push --dry-run` 認証通過
- [x] 旧VM残骸の削除を1週間後に予約（tasknote『2026年7月27日 旧VM(newtons-challenge)のphysics-lab環境を削除する』、`e65bf64`）

## Result（事実）

- 開発用URLが https://physics-lab.exe.xyz/ に変わり、外部から200で配信されている
- 学校用URL（GitHub Pages）は変更なし・影響なし
- 新VMは clone / pull / push / deploy / 公開配信 が単独で完結する
- chezmoiは新VM作成時点で導入済み・最新だった（追加作業なし）
- 旧VM側の環境は未削除のまま残っている（2026年7月27日削除予定、別tasknote）

## Discussion（判断と次回ルール化）

- 判断：正本がGitHubにある静的プロジェクトだったため、移行は「clone＋repo同梱スクリプト実行」で済んだ。deploy手順をrepoに同梱しておく設計が移行コストを下げた
- 判断：旧VMの即削除は避け、1週間の様子見期間を置いた（新VM運用の確認をゲートにする）
- 次回ルール化候補：VM間ssh・exe.dev CLIは「マシンの鍵をアカウントへ `ssh-key add`」が前提。新マシンで `Please complete registration` が出たら、登録済み端末から公開鍵を追加するのが最短
- 次回ルール化候補：`ssh exe.dev ssh-key add "鍵" < /dev/null` のように標準入力を塞ぐ（引数とstdinの二重渡しで弾かれるため）

## open_questions

- 新VMの `~/physics-lab.init-backup`（ひな型1ファイル）をいつ消すか（旧VM削除と同時でよさそう）

## Closing

- 状態: done
- 次のゲート: なし
- close 条件:
  - [x] 未記録の作業ログが記録済み
  - [x] 実績が作業ログとResultに事実として記録されている
  - [x] 残課題（旧VM削除）が別tasknoteへ分離されている
  - [x] 判断・ルール化候補がDiscussionに残されている
