---
status: latest
dateCreated: 2026-07-19
dateModified: 2026-09-28
checklist_provenance: {"body_sha256": "6a6a53fd97e46fb5858fc24a093a9ed65d4ec998981d9b79b6480b2b242ac4f6", "fingerprint": "068231fbacea651ed906a9131a7e3a22bcd2a2e0a03055f4cf2973afd43fece0", "source_sha256": {"docs/UX-policy.md": "efdf85c59ce5544ed64bd319ab1f283c5e36c01c0644f00108e90920c688b7dd", "docs/architecture.md": "a235fcf9aeafb65bc7a215f5adb931a4f265d7fc975197bcb89721371c1db734", "docs/coding-rules.md": "1af17c6c8df149498bde5f784d2e0fe6a8e3388a08ae3729eae7353ea1b178a4", "docs/repository-structure.md": "c4977dba5132c044ce703acf63cb73fba0005454c12f5d2807753cd0e2b62276"}, "version": 3}
---

# 開発チェックリスト

生成元docsから抽出した確認項目です。対象外の章は理由を付けて扱ってください。

## サイト共通の物差し

- [ ] ヘッダーは高さ52px基準、黄色 #ffe000 と暗色文字で統一し、必要な操作だけを置いている。（根拠：docs/UX-policy.md:15）
- [ ] 本文幅を抑え、計測値には tabular-nums を使い、関連する調整はカード単位にまとまっている。（根拠：docs/UX-policy.md:16）
- [ ] 3軸色は X青 #4C8DF0、Y緑 #4FC96B、Z黄 #F2C744 を使い、色だけに意味を持たせていない。（根拠：docs/UX-policy.md:17）
- [ ] 同じ操作には全ページで同じSVGを使い、title と必要な aria-label を付けている。（根拠：docs/UX-policy.md:18）
- [ ] CSSや画面を触った変更では、代表ページを広い画面と狭い画面で並べ、別サイトに見えないか実測確認した。（根拠：docs/UX-policy.md:12）

## A. アーキテクチャ

- [ ] 同じ仕様、状態、部品を複数箇所へ写さず、正本を一か所に保っている。（根拠：docs/architecture.md:6）
- [ ] ページ固有コードは入力取得、物理量変換、ページ固有文言と課題だけを持っている。（根拠：docs/architecture.md:7）
- [ ] 画面上の成功とチュートリアルの合格判定は、同じ状態またはイベントへ接続している。（根拠：docs/architecture.md:8）
- [ ] センサーとマイクは必要な間だけ確保し、画面を離れたら解放している。（根拠：docs/architecture.md:9）
- [ ] 実行時に外部ネットワークへ依存せず、学校端末で単独実行できる構造にしている。（根拠：docs/architecture.md:10）
- [ ] src の正本から配布用の単一HTMLを再現可能に生成する流れを保っている。（根拠：docs/architecture.md:11）
- [ ] センサー型ページは開始操作、許可取得、入力補正、lab.push、UI更新、tut.tick の順で流している。（根拠：docs/architecture.md:22）
- [ ] イベント型ページは idle、armed、running、paused をページ固有コードで持ち、表示更新と同時に tut.event へ通知している。（根拠：docs/architecture.md:23）
- [ ] 表示だけ更新してチュートリアルへ通知しない実装を入れていない。（根拠：docs/architecture.md:24）
- [ ] チュートリアルが見る状態を仮値で返していない。（根拠：docs/architecture.md:25）
- [ ] 権限要求は利用者のクリックまたはタップを起点にしている。（根拠：docs/architecture.md:29）
- [ ] visibilitychange でページが隠れたら計測を停止し、リスナー、MediaStream、AudioContextを解放している。（根拠：docs/architecture.md:30）
- [ ] 別タブや別アプリからの復帰時に、計測を自動再開していない。（根拠：docs/architecture.md:31）
- [ ] オンボーディング既読とチュートリアル進捗は、ページごとに一意な localStorage キーへ保存している。（根拠：docs/architecture.md:32）
- [ ] 計測データのリセットと学習進捗の保持を分けて扱っている。（根拠：docs/architecture.md:33）
- [ ] git diff --check を通している。（根拠：docs/architecture.md:37）
- [ ] python3 -m unittest discover -s tests -v を実行している。（根拠：docs/architecture.md:38）
- [ ] python3 build.py を実行している。（根拠：docs/architecture.md:39）
- [ ] 共通部品の変更は、利用する全ページへ反映されていることを確認している。（根拠：docs/architecture.md:40）
- [ ] センサー、マイク、権限変更は、対象実機とHTTPSで手動確認している。（根拠：docs/architecture.md:41）
- [ ] 複数ページで同じ変更が必要な場合、先に共通部品へ置けないか検討している。（根拠：docs/architecture.md:44）
- [ ] 共通部品へ責務を足すとき、既存ページを壊さないAPI境界を先に決めている。（根拠：docs/architecture.md:45）
- [ ] ページ固有の物理的意味を、共通部品へ押し込みすぎていない。（根拠：docs/architecture.md:46）
- [ ] ルートHTMLだけに存在する修正を作っていない。（根拠：docs/architecture.md:47）

## B. 配置・責務分担

- [ ] 各ページの編集は src/<page>.html を正本とし、ルートの /<page>.html を正本にしていない。（根拠：docs/repository-structure.md:12）
- [ ] 3軸グラフと共通操作は src/lab-common.js に置いている。（根拠：docs/repository-structure.md:13）
- [ ] 体験チュートリアルは src/tutorial.js に置いている。（根拠：docs/repository-structure.md:14）
- [ ] 初回オンボーディングは src/tour.js に置いている。（根拠：docs/repository-structure.md:15）
- [ ] uplot.js、driver.js、driver.css はベンダー資産として無改変で保持している。（根拠：docs/repository-structure.md:16）
- [ ] src/*.html はページ固有のマークアップ、入力取得、単位・符号補正、課題、オンボーディング対象を持っている。（根拠：docs/repository-structure.md:19）
- [ ] 共通部品は script src や link で参照し、ページ内へ手作業で複製していない。（根拠：docs/repository-structure.md:20）
- [ ] 共通ファイルを直した変更では、そのファイルを参照している全ページを検証対象にしている。（根拠：docs/repository-structure.md:21）
- [ ] ルートの *.html は生成物として扱い、直接編集していない。（根拠：docs/repository-structure.md:24）
- [ ] ルートHTMLは python3 build.py で再生成している。（根拠：docs/repository-structure.md:25）
- [ ] src を変更したコミットには、対応する生成物を含めている。（根拠：docs/repository-structure.md:26）
- [ ] 生成物だけに存在する修正を作っていない。（根拠：docs/repository-structure.md:27）
- [ ] 配布と実機検証は file:// ではなくHTTPSで行っている。（根拠：docs/repository-structure.md:28）
- [ ] 恒久ルールの変更は architecture.md、repository-structure.md、UX-policy.md、coding-rules.md へ反映している。（根拠：docs/repository-structure.md:31）
- [ ] 個別機能の設計は docs/specs、承認済みの設計と実装計画は docs/superpowers に置いている。（根拠：docs/repository-structure.md:33）
- [ ] 恒久ルールと個別機能の設計を混ぜていない。（根拠：docs/repository-structure.md:34）
- [ ] 共通部品の不具合には、共通部品を検証するテストを追加している。（根拠：docs/repository-structure.md:37）
- [ ] 新しいページでは src/<page>.html を作り、必要に応じて src/index.html、tests、生成物を更新している。（根拠：docs/repository-structure.md:38）
- [ ] 複数ページが同じ理由で一緒に変わる処理は共通部品へ置き、計測対象だけの意味はページ固有コードへ置いている。（根拠：docs/repository-structure.md:39）
- [ ] 恒久ルールは docs、個別機能の設計は docs/specs、回帰防止は tests に置いている。（根拠：docs/repository-structure.md:40）
- [ ] ベンダー資産へプロジェクト固有の変更を直接加えていない。（根拠：docs/repository-structure.md:46）
- [ ] 授業中の外部接続がなければ動かない参照を追加していない。（根拠：docs/repository-structure.md:48）

## C. 開発規約

- [ ] 同じ仕様、状態、UI部品、判定条件を複数箇所へ写さず、正本を一か所に置いている。（根拠：docs/coding-rules.md:7）
- [ ] 複数ページで同じ処理が必要な場合、先に共通部品へ置けないか検討している。（根拠：docs/coding-rules.md:9）
- [ ] ページ固有コードは、入力取得、物理量変換、ページ固有の文言と課題だけを持っている。（根拠：docs/coding-rules.md:11）
- [ ] 見た目や操作が同じグラフは、分岐より共通化を優先している。（根拠：docs/coding-rules.md:13）
- [ ] 画面上の成功、内部状態、チュートリアルの合格判定は同じ状態源へ接続している。（根拠：docs/coding-rules.md:15）
- [ ] センサーとマイクは必要な間だけ確保し、画面を離れたら解放している。（根拠：docs/coding-rules.md:17）
- [ ] 編集対象は src の正本だけにし、ルートHTMLは python3 build.py の生成物として扱っている。（根拠：docs/coding-rules.md:19）
- [ ] 学校ネットワークを前提に、実行時に外部CDNへ依存していない。（根拠：docs/coding-rules.md:21）
- [ ] 共通部品へ新しい責務を足すとき、既存ページを壊さない入力と出力の境界を先に決めている。（根拠：docs/coding-rules.md:23）
- [ ] ページ固有の物理的意味を共通部品へ混ぜず、共通化対象を表示、操作、保存、進捗、状態管理に絞っている。（根拠：docs/coding-rules.md:25）

## D. UX方針

- [ ] 初見の利用者が30秒以内に、何を見るか、何を押すか、何が起きるかを理解できる。（根拠：docs/UX-policy.md:6）
- [ ] 説明を読むだけでなく、実際の操作と観察で理解できる体験になっている。（根拠：docs/UX-policy.md:7）
- [ ] 物理現象と計測結果を主役にし、設定や説明で画面を埋めていない。（根拠：docs/UX-policy.md:8）
- [ ] 授業で最もよく使う観察を初期状態にしている。（根拠：docs/UX-policy.md:9）
- [ ] 失敗時の文言は評価ではなく、次に取る行動を示している。（根拠：docs/UX-policy.md:10）
- [ ] スマホ・タブレットの縦向きを基本にレイアウトしつつ、横向きを妨げていない。（根拠：docs/UX-policy.md:14）
- [ ] 向きを強制する仕組み（縦向きガードなど）を再導入していない。（根拠：docs/UX-policy.md:14）
- [ ] 主要ボタンは指で押しやすく、タップ可能な場所が見て分かる。（根拠：docs/UX-policy.md:21）
- [ ] 通常表示のグラフタップは拡大、拡大表示では線から離れたタップで縮小する。（根拠：docs/UX-policy.md:22）
- [ ] 拡大表示での線タップによる値読み取りは、一時停止中だけ有効にしている。（根拠：docs/UX-policy.md:22）
- [ ] ヒント、見出し値、吹き出し値は画面の状態に合わせて切り替わっている。（根拠：docs/UX-policy.md:23）
- [ ] 待機中、計測中、一時停止、完了、中断、エラーを区別している。（根拠：docs/UX-policy.md:24）
- [ ] ボタンと状態文は、現在動作と次の待ち状態を表している。（根拠：docs/UX-policy.md:24）
- [ ] 値がない状態は -- など、数値と誤認しない表現にしている。（根拠：docs/UX-policy.md:25）
- [ ] センサー・マイクの権限要求は、利用者が開始を押した直後に行っている。（根拠：docs/UX-policy.md:29）
- [ ] 拒否、API非対応、センサー非搭載、データ未取得を区別できる範囲で案内している。（根拠：docs/UX-policy.md:30）
- [ ] エラー文は技術用語だけで終わらせず、次に確認することを書いている。（根拠：docs/UX-policy.md:31）
- [ ] 別タブや別アプリへ移ったら計測を止め、戻っても勝手に再開していない。（根拠：docs/UX-policy.md:32）
- [ ] マイク計測では自動ゲイン、ノイズ抑制、エコー除去を原則無効にしている。（根拠：docs/UX-policy.md:33）
- [ ] エラーはページ内に表示し、可能な範囲で再読み込みなしに再試行できる。（根拠：docs/UX-policy.md:34）
- [ ] 初回オンボーディングは画面の場所案内だけに使い、初回訪問時だけ自動開始し、最大3ステップにしている。（根拠：docs/UX-policy.md:38）
- [ ] オンボーディング最終ステップは必ず #missionBtn を指し、呼称はチュートリアルに統一している。（根拠：docs/UX-policy.md:39）
- [ ] 完了またはスキップは、ページごとに一意な localStorage キーへ保存している。（根拠：docs/UX-policy.md:40）
- [ ] チュートリアルボタンはヘッダーに置き、初回は短いパルスで存在を知らせている。（根拠：docs/UX-policy.md:41）
- [ ] 課題は一度に一つだけ表示し、進捗ドットと残り件数を出している。（根拠：docs/UX-policy.md:42）
- [ ] 自動判定できる操作は成功時点で自動的に進めている。（根拠：docs/UX-policy.md:43）
- [ ] 表示上の成功と合格判定は、同じイベントまたは状態を使っている。（根拠：docs/UX-policy.md:43）
- [ ] 進捗は再読み込み後も保持し、完了後に「最初から」「もっとやる」「閉じる」を提示している。（根拠：docs/UX-policy.md:44）
- [ ] 中学生が一度で理解できる日本語を使い、一文に複数の操作を詰め込んでいない。（根拠：docs/UX-policy.md:47）
- [ ] ボタン名と案内文で同じ用語を使い、「すぐ」「簡単」など利用者の状況を決めつける表現を避けている。（根拠：docs/UX-policy.md:48）
- [ ] レビューで30秒理解、状態矛盾、権限拒否時の行き止まり、チュートリアル完走、観察主役を確認している。（根拠：docs/UX-policy.md:49）
