---
status: latest
dateCreated: 2026-07-19
dateModified: 2026-07-19
---

# 開発チェックリスト

このチェックリストは `architecture.md`、`repository-structure.md`、`UX-policy.md` から生成した派生物である。規則を変更するときは正本文書を先に更新し、本書を再生成する。

## A. アーキテクチャ（32件）

- [ ] 同じ形の部品を一か所の正本に集約している（根拠：docs/architecture.md「設計原則」）
- [ ] ページ固有コードが計測対象固有の入力・変換・課題だけを持っている（根拠：docs/architecture.md「設計原則」）
- [ ] 実行時に外部ネットワークへ依存していない（根拠：docs/architecture.md「実行時依存」）
- [ ] 共通部品の描画・進捗・保存・共通操作をページ内へ複製していない（根拠：docs/architecture.md「ページ固有コード」）
- [ ] 3軸ページのデータ保持とグラフ描画を `lab-common.js` に置いている（根拠：docs/architecture.md「3軸計測共通部品」）
- [ ] 3軸ページのタップ・拡大・パン・ピンチを `lab-common.js` に置いている（根拠：docs/architecture.md「3軸計測共通部品」）
- [ ] 開始・停止・削除の共通操作を `lab-common.js` に置いている（根拠：docs/architecture.md「3軸計測共通部品」）
- [ ] チュートリアルへ公開する状態が仮値ではなく実際のUI状態へ接続されている（根拠：docs/architecture.md「3軸計測共通部品」）
- [ ] チュートリアルのDOM・CSS・進捗・保存を `tutorial.js` に置いている（根拠：docs/architecture.md「体験チュートリアル」）
- [ ] ページはチュートリアルへ `tick` または `event` で入力を渡している（根拠：docs/architecture.md「体験チュートリアル」）
- [ ] 初回オンボーディングの初回判定とテーマを `tour.js` に置いている（根拠：docs/architecture.md「初回オンボーディング」）
- [ ] driver.jsとdriver.cssへプロジェクト固有の変更を加えていない（根拠：docs/architecture.md「初回オンボーディング」）
- [ ] 横向きタッチ端末の判定とCSSをページ内へ複製していない（根拠：docs/architecture.md「縦向きガード」）
- [ ] 利用者の開始操作を権限要求の起点にしている（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] センサー値を入力境界で符号・単位補正している（根拠：docs/architecture.md「入力から表示までの流れ」）
- [ ] 画面表示とチュートリアルへ同じ成功イベントまたは状態を渡している（根拠：docs/architecture.md「入力から表示までの流れ」）
- [ ] ページが隠れたら計測を停止している（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] ページが隠れたらセンサーイベントリスナーを解除している（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] ページが隠れたらMediaStreamの全トラックを停止している（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] ページが隠れたらAudioContextを閉じている（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] ページへ戻ったときに計測を自動再開していない（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] イベントループやリスナーを二重起動していない（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] リセットで学習進捗を消していない（根拠：docs/architecture.md「端末資源のライフサイクル」）
- [ ] OS差をユーザーエージェントだけでなく機能検出でも判定している（根拠：docs/architecture.md「端末差の吸収」）
- [ ] 非対応端末や権限拒否を日本語の画面表示で扱っている（根拠：docs/architecture.md「端末差の吸収」）
- [ ] 必要なライブラリを `src/` に同梱している（根拠：docs/architecture.md「実行時依存」）
- [ ] `src/` の変更後に `python3 build.py` を実行している（根拠：docs/architecture.md「ビルド」）
- [ ] 生成物もソース変更と同じコミットへ含めている（根拠：docs/architecture.md「ビルド」）
- [ ] センサー・マイクをHTTPS上の実機で確認している（根拠：docs/architecture.md「検証規約」）
- [ ] `git diff --check` が成功している（根拠：docs/architecture.md「検証規約」）
- [ ] 既存の自動テストが成功している（根拠：docs/architecture.md「検証規約」）
- [ ] 不具合修正に原因を再現する回帰テストまたは手動再現手順がある（根拠：docs/architecture.md「検証規約」）

## B. リポジトリ構成（23件）

- [ ] ページの変更を `src/<page>.html` に加えている（根拠：docs/repository-structure.md「正本と生成物」）
- [ ] ルートのHTMLを直接編集していない（根拠：docs/repository-structure.md「ルートHTML」）
- [ ] 3軸グラフの共通変更を `src/lab-common.js` に置いている（根拠：docs/repository-structure.md「共通ファイル」）
- [ ] 体験チュートリアルの共通変更を `src/tutorial.js` に置いている（根拠：docs/repository-structure.md「共通ファイル」）
- [ ] 初回オンボーディングの共通変更を `src/tour.js` に置いている（根拠：docs/repository-structure.md「共通ファイル」）
- [ ] 縦向き制約の共通変更を `src/orientation-guard.js` に置いている（根拠：docs/repository-structure.md「共通ファイル」）
- [ ] 共有JS・CSSをページへ手作業でコピーしていない（根拠：docs/repository-structure.md「ページHTML」）
- [ ] uPlotを無改変で保持している（根拠：docs/repository-structure.md「ベンダー資産」）
- [ ] driver.jsを無改変で保持している（根拠：docs/repository-structure.md「ベンダー資産」）
- [ ] driver.cssを無改変で保持している（根拠：docs/repository-structure.md「ベンダー資産」）
- [ ] ベンダー資産の調整を共通ラッパーまたはページ側へ置いている（根拠：docs/repository-structure.md「ベンダー資産」）
- [ ] ルートHTMLを `python3 build.py` で再生成している（根拠：docs/repository-structure.md「ルートHTML」）
- [ ] 生成物だけに存在する修正を作っていない（根拠：docs/repository-structure.md「ルートHTML」）
- [ ] 現行の責務規則を `docs/architecture.md` に記録している（根拠：docs/repository-structure.md「現行規約」）
- [ ] 現行の配置規則を `docs/repository-structure.md` に記録している（根拠：docs/repository-structure.md「現行規約」）
- [ ] 現行の利用体験規則を `docs/UX-policy.md` に記録している（根拠：docs/repository-structure.md「現行規約」）
- [ ] `development-checklist.md` を3つの正本文書から派生させている（根拠：docs/repository-structure.md「現行規約」）
- [ ] 個別機能の設計を `docs/specs/` または `docs/superpowers/specs/` に置いている（根拠：docs/repository-structure.md「補助文書」）
- [ ] 回帰テストを `tests/` に置いている（根拠：docs/repository-structure.md「tests/ の責務」）
- [ ] 新しいページを `src/<page>.html` として追加している（根拠：docs/repository-structure.md「新しいページを追加する場所」）
- [ ] メニュー公開が必要なページでは `src/index.html` を更新している（根拠：docs/repository-structure.md「新しいページを追加する場所」）
- [ ] CDNなど外部接続必須の参照を追加していない（根拠：docs/repository-structure.md「禁止事項」）
- [ ] 作業コピー間をscpで上書きしていない（根拠：docs/repository-structure.md「禁止事項」）

## C. UX（45件）

- [ ] 初見の利用者が30秒以内に主要な値と開始操作を理解できる（根拠：docs/UX-policy.md「最上位原則」）
- [ ] 説明だけでなく実際の操作と観察を用意している（根拠：docs/UX-policy.md「最上位原則」）
- [ ] 授業で最もよく使う観察を初期状態にしている（根拠：docs/UX-policy.md「最上位原則」）
- [ ] 物理現象と計測結果が設定や説明より目立っている（根拠：docs/UX-policy.md「最上位原則」）
- [ ] 失敗時に次の行動を一つ示している（根拠：docs/UX-policy.md「最上位原則」）
- [ ] ページ名から計測対象が分かる（根拠：docs/UX-policy.md「教育体験」）
- [ ] 軸の意味を画面内に示している（根拠：docs/UX-policy.md「教育体験」）
- [ ] 単位を画面内に示している（根拠：docs/UX-policy.md「教育体験」）
- [ ] 軸の正方向を画面内に示している（根拠：docs/UX-policy.md「教育体験」）
- [ ] 入力後すぐに状態または値を更新している（根拠：docs/UX-policy.md「教育体験」）
- [ ] 追加課題を必須手順から分離している（根拠：docs/UX-policy.md「教育体験」）
- [ ] スマホ・タブレットの縦向きを基本にしている（根拠：docs/UX-policy.md「画面構成」）
- [ ] 横向きタッチ端末で縦向きガードが表示される（根拠：docs/UX-policy.md「画面構成」）
- [ ] 横長PCで縦向きガードが表示されない（根拠：docs/UX-policy.md「画面構成」）
- [ ] ヘッダーを高さ52px・黄色基調にしている（根拠：docs/UX-policy.md「画面構成」）
- [ ] 計測値にtabular-numsを使っている（根拠：docs/UX-policy.md「画面構成」）
- [ ] 関連する調整項目を一つのカードへまとめている（根拠：docs/UX-policy.md「画面構成」）
- [ ] 3軸の色をX＝青・Y＝緑・Z＝黄にしている（根拠：docs/UX-policy.md「色とアイコン」）
- [ ] 色の意味を文字でも示している（根拠：docs/UX-policy.md「色とアイコン」）
- [ ] 同じ操作に同じSVGアイコンを使っている（根拠：docs/UX-policy.md「色とアイコン」）
- [ ] アイコンボタンにtitleを付けている（根拠：docs/UX-policy.md「色とアイコン」）
- [ ] 意味を持つSVGにaria-labelを付けている（根拠：docs/UX-policy.md「色とアイコン」）
- [ ] チュートリアル文中でTUT_ICONSを使っている（根拠：docs/UX-policy.md「色とアイコン」）
- [ ] 主要ボタンに指で押せる余白がある（根拠：docs/UX-policy.md「タップと主要操作」）
- [ ] 通常表示のグラフタップで拡大できる（根拠：docs/UX-policy.md「タップと主要操作」）
- [ ] 拡大表示の線タップで値を読める（根拠：docs/UX-policy.md「タップと主要操作」）
- [ ] 拡大表示の線外タップで縮小できる（根拠：docs/UX-policy.md「タップと主要操作」）
- [ ] 画面状態に合わせて操作ヒントが変わる（根拠：docs/UX-policy.md「タップと主要操作」）
- [ ] タップ値を有効数字3桁で表示している（根拠：docs/UX-policy.md「タップと主要操作」）
- [ ] 待機・計測・一時停止・完了・中断・エラーを区別している（根拠：docs/UX-policy.md「状態表示」）
- [ ] 値がない状態を数値と誤認しない表現にしている（根拠：docs/UX-policy.md「状態表示」）
- [ ] 権限要求を開始操作の直後に行っている（根拠：docs/UX-policy.md「権限と端末差」）
- [ ] 権限案内を特定OSの全文へ依存させていない（根拠：docs/UX-policy.md「権限と端末差」）
- [ ] 別タブから戻っても計測が自動再開しない（根拠：docs/UX-policy.md「権限と端末差」）
- [ ] マイク計測で自動ゲイン・ノイズ抑制・エコー除去を原則無効にしている（根拠：docs/UX-policy.md「権限と端末差」）
- [ ] 初回オンボーディングを最大3ステップにしている（根拠：docs/UX-policy.md「初回オンボーディング」）
- [ ] オンボーディングの各説明を20文字程度にしている（根拠：docs/UX-policy.md「初回オンボーディング」）
- [ ] オンボーディングの最終ステップがチュートリアルを指している（根拠：docs/UX-policy.md「初回オンボーディング」）
- [ ] 呼称を「チュートリアル」に統一している（根拠：docs/UX-policy.md「初回オンボーディング」）
- [ ] オンボーディングの既読状態をページ固有キーへ保存している（根拠：docs/UX-policy.md「初回オンボーディング」）
- [ ] チュートリアルで課題を一度に一つだけ表示している（根拠：docs/UX-policy.md「体験チュートリアル」）
- [ ] 自動判定できる操作は成功時に自動で進む（根拠：docs/UX-policy.md「体験チュートリアル」）
- [ ] 表示上の成功とチュートリアル合格判定が同じ状態へ接続されている（根拠：docs/UX-policy.md「体験チュートリアル」）
- [ ] 完了後に「最初から」「もっとやる」「閉じる」を提示している（根拠：docs/UX-policy.md「体験チュートリアル」）
- [ ] エラーをページ内へ表示し、回復方法を示している（根拠：docs/UX-policy.md「エラーと回復」）
