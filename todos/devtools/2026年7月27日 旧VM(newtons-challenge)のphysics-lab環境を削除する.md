---
status: done
format: rough
priority: normal
scheduled: 2026-07-27T09:00:00.000+09:00
dateCreated: 2026-07-20T22:00:53.000+09:00
dateModified: 2026-08-27T06:50:00.000+09:00
tags:
  - task
  - archived
---

# 2026年7月27日 旧VM(newtons-challenge)のphysics-lab環境を削除する

> 状態：done（2026年8月27日実施。予定より1ヶ月遅れだが新VM運用は問題なしとユーザー確認済み）
> 次のゲート：なし

## 概要

- When: 2026年7月27日（切り出し完了の2026年7月20日から1週間後）
- Where: `exedev@newtons-challenge.exe.xyz`（旧VM）
- What: 専用VM `physics-lab.exe.xyz` へ切り出し済みのphysics-lab環境の残骸を、旧VMから全部削除する
- Why: 「1マシン=1プロジェクト」に合わせて旧VMを整理する。1週間は新VMの様子見期間として残す

## 削除対象と手順（旧VM上で実行）

```bash
# 1. 未pushの変更が残っていないか最終確認（cleanであること）
git -C ~/physics-lab status --short && git -C ~/physics-lab log origin/main..main --oneline

# 2. 配信を止める
sudo rm /etc/caddy/conf.d/physics-lab.caddy
sudo systemctl reload caddy
sudo rm -rf /srv/www/physics-lab

# 3. deploy helperを消す
sudo rm /usr/local/bin/physics-lab-publish /etc/sudoers.d/physics-lab-publish

# 4. repo複製を消す（正本はGitHub main、新VMにも複製あり）
rm -rf ~/physics-lab
```

## 前提（2026年7月20日時点の確認済み事実）

- 新VM `physics-lab.exe.xyz` は clone・Caddy配信・deploy helper・PUBLIC公開まで完了し、外部から200を確認した
- 旧VMの `~/physics-lab` はpush済みでclean（f97178e以降の変更なし）
- 学校用URL（GitHub Pages）はこの削除の影響を受けない

## 成果物

- 削除実行ログ（2026年8月27日、旧VM上で実行）:
  - 事前確認: `git status` clean、`origin/main..main` 未pushコミット0件（pull --ff-onlyでd631cddまで同期後）
  - `/etc/caddy/conf.d/physics-lab.caddy` 削除 → `systemctl reload caddy` → active維持
  - `/srv/www/physics-lab` 削除
  - `/usr/local/bin/physics-lab-publish` と `/etc/sudoers.d/physics-lab-publish` 削除
  - `~/physics-lab`（repo複製）削除は、このtasknoteのclose commit・push後に最終手順として実行
- 旧URL https://newtons-challenge.exe.xyz/physics-lab/ が404になったことの確認: 外部DNS経由curlで404。同居アプリのトップ（/）は200のまま巻き添えなし
- 補足: 新VMの開発用URLは非公開（ログイン要求）になっているが、ユーザー確認により意図的とのこと。学校用URL（GitHub Pages）は影響なし

## Closing

- 状態: done
- 次のゲート: なし
- close 条件:
  - [x] 未記録の作業ログが記録済み
  - [x] 削除対象4点がすべて削除されている（repo複製はpush後に削除）
  - [x] 旧URLの404と同居アプリの無事を外部から確認した
  - [x] 削除前にユーザーへ新VM運用に問題なかったか確認した
