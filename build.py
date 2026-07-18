#!/usr/bin/env python3
"""単一HTML生成ビルド。

src/ の各HTMLにある <script src="X.js"></script> と
<link rel="stylesheet" href="X.css"> のうち、src/ に実体があるものを
中身に置き換え、リポジトリ直下へ配布用の単一HTMLを生成する。
（lab-common.js・tutorial.js・driver.css など複数の共有JS/CSSに対応。存在しない外部参照は触らない。）
依存はPython標準ライブラリのみ。使い方:  python3 build.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
TAG_RE = re.compile(r'<script src="([^"]+\.js)"></script>')
CSS_RE = re.compile(r'<link rel="stylesheet" href="([^"]+\.css)">')


def inline(html):
    def repl(m):
        p = ROOT / 'src' / m.group(1)
        if p.exists():
            return '<script>\n' + p.read_text(encoding='utf-8') + '</script>'
        return m.group(0)   # src/ に無い外部srcはそのまま残す
    def repl_css(m):
        p = ROOT / 'src' / m.group(1)
        if p.exists():
            return '<style>\n' + p.read_text(encoding='utf-8') + '</style>'
        return m.group(0)   # src/ に無い外部cssはそのまま残す
    return CSS_RE.sub(repl_css, TAG_RE.sub(repl, html))


for page in sorted((ROOT / 'src').glob('*.html')):
    out = inline(page.read_text(encoding='utf-8'))
    (ROOT / page.name).write_text(out, encoding='utf-8')
    print(f'{page.name}: 生成OK（{len(out):,} bytes）')
