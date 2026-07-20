# AGENTS.md

## tn-close 後の退避（送信箱方式・2026-07-20）

- `P0`: この repo で tasknote を `tn-close` したら、`done/` サブフォルダへは移さず、shared helper で送信箱へ出す：
  ```bash
  cd ~/physics-lab
  uv run --no-project --with pyyaml python3 \
    ~/.local/share/chezmoi/shared/llm-wiki-core/python/llm_wiki_tasknote_ship_helper.py \
    "todos/<閉じたノート>.md"
  ```
- `P0`: `status: done` → `todos/files-to-fetch/`（git管理外の送信箱）へ移動し、元ファイルは残さない。知識の正本は business-docs の llm-wiki に一本化する（SSoT）。
- `P0`: `status: wont` → `todos/wont/` へローカル退避する（知識価値が無いので送らない）。
- `P0`: 送信箱の中身を手で消さない。business-docs 側の fetch が回収し、bd での commit 確認後に自動で消える。
- 注意: bd の fetch（`scripts/fetch_satellite_tasknotes.py`）を非対話 ssh から手動実行するときは、`export PATH="$HOME/.local/bin:$PATH"` を先に付ける。pre-commit が非対話 PATH に無く commit だけ失敗するため（2026-07-20 実測。失敗しても送信箱は温存される設計なので実害は出ない。復旧は bd で手動 commit → 再fetch の duplicate 検出で送信箱が自動クリア）。
- 理由: bdのllm-wikiを全マシンの頭脳として鍛えるため、完了ノートの知見はすべてbdへ集約する。
