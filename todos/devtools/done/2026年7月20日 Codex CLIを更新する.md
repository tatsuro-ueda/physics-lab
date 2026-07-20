---
status: done
format: rough
priority: normal
scheduled: 2026-07-20T08:48:39+00:00
dateCreated: 2026-07-20T08:48:39+00:00
dateModified: 2026-07-20T08:48:39+00:00
tags:
  - task
  - archived
---

# 2026年7月20日 Codex CLIを更新する

> 状態：done
> 次のゲート：なし

## 概要

- When: 2026年7月20日
- Where: `/home/exedev/physics-lab`
- Who: AIエージェント
- What: Linux VM 上の `codex-cli` を旧版から最新版へ更新し、実際に新しい実行ファイルが優先される状態を確認する
- Why: `codex-cli 0.128.0` が古く、現在の機能や挙動とずれていたため

## 成果物

- 旧版の実体を確認した
  - `/usr/local/bin/codex`
  - `codex-cli 0.128.0`
- 公式 docs で `codex update` が安定コマンドであることと、changelog 上の最新版が `0.144.6` であることを確認した
- `codex update` は `Could not detect the Codex installation method` で失敗し、自動更新できないことを確認した
- `npm config get prefix` が `/home/linuxbrew/.linuxbrew`、`PATH` も Linuxbrew 側が先頭であることを確認した
- `npm install -g @openai/codex@0.144.6` を実行した
- 更新後の有効版を確認した
  - 有効パス: `/home/linuxbrew/.linuxbrew/bin/codex`
  - バージョン: `codex-cli 0.144.6`
- 旧 `/usr/local/bin/codex` は残っているが、`/usr/local/bin` は非 writable で削除できないことを記録した

## Closing

- 状態: done
- 次のゲート: なし
- close 条件:
  - [x] 旧版と新版の実体・バージョンが記録されている
  - [x] 自動更新失敗の理由と手動更新手順が記録されている
  - [x] 実際にどの `codex` が使われるか確認できている
