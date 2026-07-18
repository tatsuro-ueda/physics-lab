#!/usr/bin/env python3
"""単一HTML生成ビルド。

src/ の各HTMLにある <script src="lab-common.js"></script> を
src/lab-common.js の実体に置き換え、リポジトリ直下へ配布用の
単一HTMLファイルを生成する。依存はPython標準ライブラリのみ。

使い方:  python3 build.py
"""
from pathlib import Path

ROOT = Path(__file__).parent
TAG = '<script src="lab-common.js"></script>'

common = (ROOT / 'src' / 'lab-common.js').read_text(encoding='utf-8')

for page in sorted((ROOT / 'src').glob('*.html')):
    html = page.read_text(encoding='utf-8')
    if TAG not in html:
        raise SystemExit(f'{page.name}: 置き換えタグ {TAG} が見つかりません')
    out = html.replace(TAG, '<script>\n' + common + '</script>')
    (ROOT / page.name).write_text(out, encoding='utf-8')
    print(f'{page.name}: 生成OK（{len(out):,} bytes）')
