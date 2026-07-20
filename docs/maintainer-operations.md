# 保守担当者向け運用手順

この文書は、GitHub Pagesと専用VMの配信を管理する保守担当者向けです。
アプリを利用する先生・生徒や、一般の外部コントリビューターは読む必要がありません。

## 配信環境

| URL | 役割 |
|---|---|
| https://tatsuro-ueda.github.io/physics-lab/ | 学校用の本番環境。`main` へpushすると自動更新 |
| https://physics-lab.exe.xyz/ | 専用VMのCaddyによる開発・検証環境。デプロイスクリプトで即時反映 |

## 同期方針

**scpでリポジトリ内のファイルを同期しない。**

scpは履歴が残らず、送り先の未コミット変更を上書きする危険があります。
Mac・VM間の同期には必ずgitを使い、GitHubの`main`を合流点にします。
scpを使えるのは、リポジトリ管理外のファイルを一度だけ送る場合に限ります。

## VMの初期設定

専用VMで最初の1回だけ実行します。

```bash
sudo ./scripts/install-deploy-helper.sh
```

これにより、`/usr/local/bin/physics-lab-publish`と必要最小限のsudoers設定が追加されます。
以後は、通常ユーザーからデプロイスクリプトを実行できます。

## 通常の更新手順

```bash
# 1) 編集前に最新のmainを取り込む
git pull origin main

# 2) src/を編集したら単一HTMLを再生成する
python3 build.py

# 3) commitしてGitHub Pagesへ反映する
git add -A
git commit -m "..."
git push

# 4) 専用VMで開発・検証環境へ反映する
./scripts/deploy-physics-lab
```

並行作業中は、pullの前に手元の変更をcommitします。編集途中でも、小さくcommitして構いません。

## 作業場所

- 合流点：GitHub `github.com/tatsuro-ueda/physics-lab` の `main`
- 専用VM：`exedev@physics-lab.exe.xyz` の `~/physics-lab`
- Mac：`~/work/physics-lab/`
