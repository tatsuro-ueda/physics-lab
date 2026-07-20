# タブレット物理実験ラボ（physics-lab）

> **インストールできなくても、実験はできる。**

物理は、数式が多くて難しい——そう思われがちです。でも本当は、「動く」「音が鳴る」「位置が変わる」など、
いつも身の回りにある現象を扱う、とても身近な分野です。誰もがポケットに入れているスマホや学校端末には、
その現象を測るセンサーが入っています。**いつでも、どこでも、手のひらの端末が実験室になる。**

学校端末（iPad / Chromebook）のブラウザだけで動く、無料の物理計測アプリ集です。
**インストール不要・アカウント不要・計測データをアプリから外部送信しません。**

<p>
  <img src="docs/screenshots/menu.png" alt="メニュー画面" width="240">
  <img src="docs/screenshots/acceleration.png" alt="加速度の計測画面" width="240">
  <img src="docs/screenshots/stopwatch.png" alt="音響ストップウォッチ" width="240">
</p>

## いますぐ試す

| 開き方 | |
|---|---|
| **URL** | https://tatsuro-ueda.github.io/physics-lab/ |
| **QRコード** | <img src="qr-code.png" alt="QRコード" width="120"> |
| **印刷して配りたい** | [印刷用QRポスター](講習会印刷用_タブレット物理実験ラボQR.png)（教室掲示・配布用） |

> センサーとマイクにはHTTPSが必要です。授業例・安全上の注意・対応アプリ・プライバシーの詳細は
> [利用ガイド](docs/usage.md)を確認してください。

## 主な実験

- **加速度** — ふって、動きの変化をグラフで見る
- **音響ストップウォッチ** — 音から音までの時間を測る
- **位置（GPS）** — 電車やバスの移動を、変位・速度・加速度で見る

[全アプリと授業での使い方を見る](docs/usage.md)

---

## 開発者向け

改造・貢献したい人は、`src/`を編集して単一HTMLを再生成します。
リポジトリ直下の`*.html`は生成物なので、直接編集しません。

```bash
python3 build.py
```

外部ライブラリは`src/`に同梱されており、Python標準機能だけでビルドできます。
部品対応表、共通機構、設計上の約束は[開発ガイド](docs/development.md)にまとめています。

詳細：[開発ガイド](docs/development.md)・[設計資料](docs/architecture.md)・
[保守担当者向け運用手順](docs/maintainer-operations.md)

## ライセンス

[MIT License](LICENSE)
