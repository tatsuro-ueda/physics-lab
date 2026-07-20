---
status: open
format: rough
priority: normal
scheduled: 2026-07-27T09:00:00.000+09:00
dateCreated: 2026-07-20T22:00:53.000+09:00
dateModified: 2026-07-20T22:00:53.000+09:00
tags:
  - task
---

# 2026年7月27日 旧VM(newtons-challenge)のphysics-lab環境を削除する

> 状態：未着手（2026年7月27日まで判断保留でよい）
> 次のゲート：（AIエージェント）新VMでの1週間運用に問題がなかったことをユーザーに確認してから削除する

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

- 削除実行ログ:
- 旧URL https://newtons-challenge.exe.xyz/physics-lab/ が404になったことの確認:
