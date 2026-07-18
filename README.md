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
| **グラフ描画**（時間軸圧縮・目盛り・自動スケール） | `lab-common.js` | 3軸ページ共通の正本 |
| **タップ操作**（線タップ=値 / 線外タップ=拡大） | `lab-common.js` | 同上 |
| **▶⏸ / 🗑 / ⬇ の挙動** | `lab-common.js` | 同上 |
| タップ値の桁数（有効数字2桁） | `lab-common.js` の `toPrecision(2)` | |
| ヘッダー現在値の桁数 | 各ページの `digits:` 設定 | 現在は全ページ小数1桁 |
| 加速度センサーとの接続・iOS符号補正 | `acceleration.html` の `<script>`（約40行） | |
| ジャイロとの接続 | `gyroscope.html` の `<script>`（約30行） | |
| 磁気センサーとの接続・非対応案内 | `magnetometer.html` の `<script>`（約35行) | |
| メニュー（並び・説明文・テーマ色） | `index.html` | |
| GPS（変位/速度/加速度タブ） | `location.html` | ※まだ独自実装（下記「今後の整理」） |
| 音響ストップウォッチ | `stopwatch.html` | ※まだ独自実装 |
| 音のスペクトル | `sound.html` | ※まだ独自実装（メニュー非表示） |
| コンパス | `compass.html` | ※まだ独自実装（メニュー非表示） |

### 3軸センサーページのしくみ

`acceleration / gyroscope / magnetometer` の3ページは同じ形。
各ページは `createXYZLab({unit, digits, padMin, noDataMsg, start})` を1回呼ぶだけで、
グラフも操作も `lab-common.js` が面倒を見る。ページ側に残っているのは
「そのセンサーからどうデータを取るか（start関数）」だけ。

### ⬇ ダウンロードのしくみ

⬇を押すと、そのページのHTMLと `lab-common.js` をブラウザ内で合体させ、
**単一HTMLファイル**として保存する（配布・改造用）。
※ダウンロードしたファイルを file:// で開くとセンサー・マイクは動かない（HTTPS必須）。

## 今後の整理（同型散在の残り）

- `location.html` の drawGraph は lab-common.js とほぼ同型 → 系列型（t/v分離）対応を共通側に入れて統合する
- `stopwatch.html` / `sound.html` / `compass.html` は旧デザインの独自実装 → 使う判断が固まったら共通ヘッダー様式に寄せる

## デプロイ手順（毎回同じ操作）

```bash
# 1) Macの作業コピーからVMへ
scp ~/work/physics-lab/*.html ~/work/physics-lab/*.js ~/work/physics-lab/README.md \
    exedev@newtons-challenge.exe.xyz:~/physics-lab/

# 2) VMで commit ＋ 検証環境へ配置
ssh exedev@newtons-challenge.exe.xyz \
  'cd ~/physics-lab && git add -A && git commit -m "..." && sudo cp *.html *.js /srv/www/physics-lab/'

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
