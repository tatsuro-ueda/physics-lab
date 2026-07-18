# タブレット物理実験ラボ（physics-lab）

学校端末（iPad / Chromebook）のブラウザで動く物理実験アプリ集。
GIGA端末で「変位・速度・加速度」「音」の計測体験をさせるためのもの。

## URL（2本立て）

| URL | 役割 |
|---|---|
| https://tatsuro-ueda.github.io/physics-lab/ | **学校用の本命**（GitHub Pages。mainにpushすると自動更新） |
| https://newtons-challenge.exe.xyz/physics-lab/ | 開発・検証用（exe.dev VMのCaddyが配信。即時反映） |

## ファイル構成と「部品対応表」

**方針：同じ形の部品は1か所にだけ置く（同型散在の禁止）。**
「この部品はどこを直せばいいか」は必ずこの表で引く。

| 直したいもの | 触るファイル | 備考 |
|---|---|---|
| **グラフ描画**（時間軸圧縮・目盛り・自動スケール） | `src/lab-common.js` | 3軸ページ共通の正本 |
| **タップ操作**（線タップ=値 / 線外タップ=拡大） | `src/lab-common.js` | 同上 |
| **▶⏸ / 🗑 の挙動** | `src/lab-common.js` | 同上 |
| タップ値の桁数（有効数字2桁） | `src/lab-common.js` の `toPrecision(2)` | |
| ヘッダー現在値の桁数 | `src/` 各ページの `digits:` 設定 | 現在は全ページ小数1桁 |
| 加速度センサーとの接続・iOS符号補正 | `src/acceleration.html` の `<script>` | |
| ジャイロとの接続 | `src/gyroscope.html` の `<script>` | |
| 磁気センサーとの接続・非対応案内 | `src/magnetometer.html` の `<script>` | |
| **🔰チュートリアルの器**（進捗ドット・あと◯つ・完了/もっとやる・localStorage・🔰トグル・CSS） | `src/tutorial.js` | 加速度・音響SW共通の正本 |
| チュートリアルの**ステップ内容**（判定・文言・順序） | 各ページの `STEPS` / `MORE` 定義 | 加速度=`src/acceleration.html`、音響SW=`src/stopwatch.html` |
| メニュー（並び・説明文・テーマ色） | `src/index.html` | |
| GPS（変位/速度/加速度タブ） | `src/location.html` | ※まだ独自実装（下記「今後の整理」） |
| 音響ストップウォッチの計測ロジック | `src/stopwatch.html` の `<script>` | チュートリアルの器は tutorial.js |
| 音のスペクトル | `src/sound.html` | ※まだ独自実装（メニュー非表示） |
| コンパス | `src/compass.html` | ※まだ独自実装（メニュー非表示） |
| **📱 縦向きガード**（横向きにしたら全面カバーで案内） | `src/orientation-guard.js` | 全ページ共通の正本。発動＝横向き×タッチ端末 |

### 3軸センサーページのしくみ

`acceleration / gyroscope / magnetometer` の3ページは同じ形。
各ページは `createXYZLab({unit, digits, padMin, noDataMsg, start})` を1回呼ぶだけで、
グラフも操作も `lab-common.js` が面倒を見る。ページ側に残っているのは
「そのセンサーからどうデータを取るか（start関数）」だけ。

### 単一HTML化のしくみ（build.py）

**⚠️ リポジトリ直下の `*.html` は全ページ生成物。直接編集しない。**（2026-07-18に全9ページをsrc/経由へ統一）
編集するのは `src/` の方。編集したら `python3 build.py` を実行すると、
`src/` の共有JS（lab-common.js・tutorial.js・orientation-guard.js）を各ページに埋め込んだ
**単一HTML**が直下に生成される（依存はPython標準のみ）。
※単一HTMLをローカル保存して file:// で開くと、センサー・マイクは動かない（安全なコンテキスト=HTTPS必須。実機確認済み）。
このため⬇ダウンロードボタンは2026-07-18に撤去した。改造したい人向けにはソースをGitHubで公開している：https://github.com/tatsuro-ueda/physics-lab

### 🔰チュートリアルのしくみ（共通エンジン）

チュートリアルの「器」（進捗ドット・あと◯つ・完了/もっとやる・localStorage・🔰トグル・見た目）は
`src/tutorial.js` の `createTutorial({...})` が全部持つ。各ページは `STEPS`（順序固定）と
`MORE`（もっとやる用）のステップ定義を渡し、入力を `tut.tick(e)`（動き駆動＝加速度）または
`tut.event(name,data)`（イベント駆動＝音響SW）で与えるだけ。器を直すときは tutorial.js の1ファイル。

## 今後の整理（同型散在の残り）

- `location.html` の drawGraph は lab-common.js とほぼ同型 → 系列型（t/v分離）対応を共通側に入れて統合する
- `sound.html` / `compass.html` は旧デザインの独自実装（メニュー非表示）→ 使う判断が固まったら共通様式へ

## デプロイ手順（毎回同じ操作）

```bash
# 0) src/ を編集したら必ずビルド（単一HTMLを再生成）
cd ~/work/physics-lab && python3 build.py

# 1) Macの作業コピーからVMへ
scp -r ~/work/physics-lab/*.html ~/work/physics-lab/src ~/work/physics-lab/build.py \
    ~/work/physics-lab/README.md exedev@newtons-challenge.exe.xyz:~/physics-lab/

# 2) VMで commit ＋ 検証環境へ配置（配るのはHTMLだけ）
ssh exedev@newtons-challenge.exe.xyz \
  'cd ~/physics-lab && git add -A && git commit -m "..." && sudo cp *.html /srv/www/physics-lab/'

# 3) GitHubへ push（= GitHub Pages が自動更新）
#    Mac側のミラー clone から origin/master を GitHub main へ push する
```

## repoの場所

- 正本：VM `exedev@newtons-challenge.exe.xyz` の `~/physics-lab`
- GitHub：`github.com/tatsuro-ueda/physics-lab`（public、Pages有効）
- Mac作業コピー：`~/work/physics-lab/`（編集はここ→VMへscp）

## 設計上の約束

- 外部JSライブラリは使わない（Canvas 2D直描き）。理由：単一HTML配布・学校ネット制限・長期保守
- テーマ色は黄色 `#ffe000`、軸色は X=`#ff9500` / Y=`#d4c400` / Z=`#e04040`
- 軸ラベルには「正の向き」まで書く（例：アプリでは東を正）
- iOS Safariは加速度の符号がW3C仕様と逆 → `IOS_SIGN` で補正（phyphox-iOSの `kG=-9.81` と同じ考え方）
