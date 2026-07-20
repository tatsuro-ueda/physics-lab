# 開発ガイド

タブレット物理実験ラボを改造・保守する開発者向けの詳細資料です。

## リポジトリ構成と「部品対応表」

**方針：同じ形の部品は1か所にだけ置く（同型散在の禁止）。**
「この部品はどこを直せばいいか」は必ずこの表で引きます。

| 直したいもの | 触るファイル | 備考 |
|---|---|---|
| **グラフ描画**（時間軸圧縮・目盛り・自動スケール） | `src/lab-common.js` | 3軸ページ共通の正本 |
| **タップ操作**（線タップ=値 / 線外タップ=拡大） | `src/lab-common.js` | 同上 |
| **▶⏸ / 🗑 の挙動** | `src/lab-common.js` | 同上 |
| タップ値の桁数（有効数字3桁） | `src/lab-common.js` の `toPrecision(3)` | |
| ヘッダー現在値の桁数 | `src/` 各ページの `digits:` 設定 | 現在は全ページ小数1桁 |
| 加速度センサーとの接続・iOS符号補正 | `src/acceleration.html` の `<script>` | |
| ジャイロとの接続 | `src/gyroscope.html` の `<script>` | |
| 磁気センサーとの接続・非対応案内 | `src/magnetometer.html` の `<script>` | |
| **🔰チュートリアルの器**（進捗ドット・あと◯つ・完了/もっとやる・localStorage・🔰トグル・CSS） | `src/tutorial.js` | 加速度・音響SW共通の正本 |
| チュートリアルの**ステップ内容**（判定・文言・順序） | 各ページの `STEPS` / `MORE` 定義 | 加速度=`src/acceleration.html`、音響SW=`src/stopwatch.html` |
| メニュー（並び・説明文・テーマ色） | `src/index.html` | |
| GPS（変位/速度/加速度タブ） | `src/location.html` | まだ独自実装 |
| 音響ストップウォッチの計測ロジック | `src/stopwatch.html` の `<script>` | チュートリアルの器は `tutorial.js` |
| 音のスペクトル | `src/sound.html` | まだ独自実装（メニュー非表示） |
| コンパス | `src/compass.html` | まだ独自実装（メニュー非表示） |
| **📱 縦向きガード**（横向きにしたら全面カバーで案内） | `src/orientation-guard.js` | 全ページ共通の正本。発動＝横向き×タッチ端末 |

## 3軸センサーページのしくみ

`acceleration / gyroscope / magnetometer` の3ページは同じ形です。
各ページは `createXYZLab({unit, digits, padMin, noDataMsg, start})` を1回呼ぶだけで、
グラフも操作も `lab-common.js` が面倒を見ます。ページ側に残っているのは
「そのセンサーからどうデータを取るか（start関数）」だけです。

## 単一HTML化のしくみ（build.py）

**リポジトリ直下の `*.html` は全ページ生成物です。直接編集しません。**

編集するのは `src/` の方です。編集後に次を実行すると、共有JSを埋め込んだ単一HTMLが
リポジトリ直下に生成されます。依存はPython標準機能だけです。

```bash
python3 build.py
```

単一HTMLをローカル保存して `file://` で開いても、センサーとマイクは動きません。
安全なコンテキストであるHTTPSから開く必要があります。このため、ダウンロードボタンは撤去しています。

## チュートリアルのしくみ（共通エンジン）

チュートリアルの「器」（進捗ドット・あと◯つ・完了/もっとやる・localStorage・🔰トグル・見た目）は
`src/tutorial.js` の `createTutorial({...})` が持ちます。各ページは `STEPS`（順序固定）と
`MORE`（もっとやる用）のステップ定義を渡し、入力を `tut.tick(e)`（動き駆動＝加速度）または
`tut.event(name,data)`（イベント駆動＝音響SW）で与えます。器の変更先は `tutorial.js` の1ファイルです。

## 設計上の約束

- アプリのコードは実行時に外部CDNや外部APIへ依存しない。必要なライブラリ（uPlot・driver.js）は `src/` に同梱し、`build.py` で単一HTMLへ埋め込む。理由：学校ネット制限・長期保守
- テーマ色は黄色 `#ffe000`、軸色は X=`#4C8DF0`（青）/ Y=`#4FC96B`（緑）/ Z=`#F2C744`（黄）
- 軸ラベルには「正の向き」まで書く（例：アプリでは東を正）
- iOS Safariは加速度の符号がW3C仕様と逆なので、`IOS_SIGN` で補正する（phyphox-iOSの `kG=-9.81` と同じ考え方）

## 今後の整理（同型散在の残り）

- `location.html` の `drawGraph` は `lab-common.js` とほぼ同型。系列型（t/v分離）対応を共通側に入れて統合する
- `sound.html` / `compass.html` は旧デザインの独自実装（メニュー非表示）。使う判断が固まったら共通様式へ移す

## 関連資料

- [アーキテクチャ](architecture.md)
- [リポジトリ構造](repository-structure.md)
- [コーディングルール](coding-rules.md)
- [UX方針](UX-policy.md)
- [保守担当者向け運用手順](maintainer-operations.md)
