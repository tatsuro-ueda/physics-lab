// ============================================================
// 📱 縦向きガード（正本はこのファイル1つ）
// ------------------------------------------------------------
// タブレットを横向きにしたら、全面カバーで「たてに戻してね」と案内する。
// 発動条件は「横向き かつ タッチ端末（pointer: coarse）」。
//   ・iPad / タブレットモードのChromebook … 横向きで発動
//   ・先生のPC / クラムシェル型Chromebook（画面が常に横長・マウス操作）… 発動しない
// 各ページは script タグ（src="orientation-guard.js"）を1行書くだけ。
// ※このコメントに閉じタグを書いてはいけない。ビルドでHTMLへインライン化した
//   とき、コメント内でも閉じタグと解釈されて script が切断されるため。
// CSSだけで判定するのでリスナー不要。カバー中もセンサー計測は裏で続く
// （すぐ縦に戻す前提なので許容）。
// ============================================================
(function () {
  const st = document.createElement('style');
  st.textContent = `
  .rotate-guard { display: none; }
  @media (orientation: landscape) and (pointer: coarse) {
    .rotate-guard {
      display: flex;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #1a1a1a;
      color: #eee;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 18px;
      font-size: 1.3rem;
      text-align: center;
      font-family: -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif;
    }
    .rotate-guard .rg-icon {
      font-size: 3.5rem;
      animation: rg-rotate 1.8s ease-in-out infinite;
    }
    @keyframes rg-rotate {
      0%, 25%  { transform: rotate(90deg); }   /* 横向き（いまの状態） */
      65%, 100% { transform: rotate(0deg); }   /* 縦向き（こうしてね） */
    }
  }`;
  document.head.appendChild(st);

  const d = document.createElement('div');
  d.className = 'rotate-guard';
  d.innerHTML = '<div class="rg-icon">📱</div><div>タブレットを たてに もどしてね</div>';
  document.body.appendChild(d);
})();
