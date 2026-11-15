/* ==========================================================
   キャラクターSVGイラスト＆発言データ専用ファイル
   ========================================================== */

window.GAME_DATA = {
  // キャラクター名とSVGイラスト定義
  characters: {
    teacher: {
      name: "情報科の先生",
      cssClass: "",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#0ea5e9" opacity="0.2" stroke="#38bdf8" stroke-width="3"/>
        <path d="M25 112 C25 85, 95 85, 95 112" fill="#1e3a8a"/>
        <polygon points="60,88 53,108 67,108" fill="#ef4444"/>
        <circle cx="60" cy="52" r="24" fill="#fde68a"/>
        <path d="M36 48 C36 26, 84 26, 84 48 C76 38, 44 38, 36 48 Z" fill="#1e293b"/>
        <rect x="42" y="48" width="14" height="10" rx="2" fill="none" stroke="#0f172a" stroke-width="2.5"/>
        <rect x="64" y="48" width="14" height="10" rx="2" fill="none" stroke="#0f172a" stroke-width="2.5"/>
        <line x1="56" y1="53" x2="64" y2="53" stroke="#0f172a" stroke-width="2.5"/>
        <path d="M52 65 Q60 71 68 65" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    },
    researcher: {
      name: "セキュリティ研究員",
      cssClass: "researcher",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#10b981" opacity="0.2" stroke="#34d399" stroke-width="3"/>
        <path d="M25 112 C25 84, 95 84, 95 112" fill="#f8fafc"/>
        <path d="M50 86 L60 108 L70 86" fill="#059669"/>
        <circle cx="60" cy="52" r="24" fill="#fed7aa"/>
        <path d="M35 46 C38 22, 82 22, 85 46" fill="#334155"/>
        <rect x="40" y="46" width="40" height="12" rx="6" fill="#0284c7" opacity="0.85"/>
        <circle cx="50" cy="52" r="3" fill="#e0f2fe"/>
        <circle cx="70" cy="52" r="3" fill="#e0f2fe"/>
        <path d="M53 66 Q60 70 67 66" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`
    },
    hacker: {
      name: "謎のハッカー",
      cssClass: "hacker",
      svg: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="56" fill="#ef4444" opacity="0.2" stroke="#f87171" stroke-width="3"/>
        <path d="M20 112 C22 65, 35 22, 60 22 C85 22, 98 65, 100 112 Z" fill="#111827"/>
        <ellipse cx="60" cy="56" rx="22" ry="26" fill="#030712"/>
        <path d="M44 50 L54 53 L44 56 Z" fill="#22c55e"/>
        <path d="M76 50 L66 53 L76 56 Z" fill="#22c55e"/>
        <path d="M48 68 L60 72 L72 68" fill="none" stroke="#ef4444" stroke-width="2.5"/>
      </svg>`
    }
  },

  // チュートリアル全画面会話スクリプト
  tutorialScript: [
    {
      speaker: "teacher",
      text: "ようこそ！これから架空の金融システム「青葉銀行」のデモを使って、サイバー攻撃とセキュリティ対策のリアルを体験してもらいます。"
    },
    {
      speaker: "researcher",
      text: "あなたのデモ口座には、今ちょうど【3,500,000円】の預金が入っています。この大金を守れるかどうかは、認証方式の設定とあなたの判断にかかっています！"
    },
    {
      speaker: "hacker",
      text: "フフフ……甘いパスワードや使い回し、それに人間の油断さえあれば、その350万円をいただくのに1分もかからないぜ？"
    },
    {
      speaker: "teacher",
      text: "さあ、画面上部の「利用者モード」と「攻撃者モード」を切り替えながら、4つの認証方式すべてへの攻撃テストと、詐欺メールの見破りに挑戦してみよう！"
    },
    {
      speaker: "researcher",
      text: "すべてのミッションを正しく学び終えると、サイバー警察の特別な認定画面が解放されます。準備ができたらスタートです！"
    }
  ],

  // 攻撃結果ごとの解説＆キャラコメント
  attackOutcomes: {
    brute_weak: {
      breached: true,
      title: "総当たり攻撃により一瞬で突破！",
      body: "「123456」のような短いパスワードは、攻撃ツールを使えば <strong>1秒未満</strong> で解読されてしまいます。その結果、通帳から一気に全額が引き落とされてしまいました。",
      comment: "💀 ハッカー：「あまりにも簡単すぎて拍子抜けだな。数字だけの短いパスワードはカモ同然だ！」"
    },
    brute_strong: {
      breached: false,
      title: "総当たり攻撃をブロック！",
      body: "長く複雑なパスワードは、総当たり攻撃で解読するのに数百年かかるため安全です。<strong>ただし、「他サイトと使い回している」場合は別の攻撃に弱い</strong> ため油断は禁物です。",
      comment: "🔬 研究員：「総当たりには耐えましたね！次は『リスト型攻撃』も試してみましょう。」"
    },
    brute_sms: {
      breached: false,
      title: "2要素認証（SMS）が突破を阻止！",
      body: "仮にパスワードが推測されても、利用者のスマートフォンに届くSMS認証コードがなければログインを完了できません。",
      comment: "🔬 研究員：「2つ目の壁がしっかり機能しました！しかしフィッシング詐欺には注意が必要です。」"
    },
    brute_passkey: {
      breached: false,
      title: "パスワードが存在しないため完全防御！",
      body: "パスキーはサーバーにパスワードを保存しない仕組みのため、総当たり攻撃で照合する対象そのものが存在しません。",
      comment: "👨‍🏫 先生：「そもそも『狙われるパスワード』がないのがパスキーの強みですね！」"
    },
    list_breach: {
      breached: true,
      title: "リスト型攻撃で突破！使い回しの代償！",
      body: "どれほど複雑なパスワードを設定していても、別のサイトから流出したパスワードを使い回していれば、攻撃者は一発でログインできてしまいます。",
      comment: "💀 ハッカー：「別の通販サイトから盗んだリストがそのまま使えたぜ。毎度あり！」"
    },
    list_sms: {
      breached: false,
      title: "流出パスワード一致も、SMS認証で阻止！",
      body: "他サイトと使い回したパスワードは突破されましたが、2段階目のSMS認証コードが最後の砦となり不正出金を食い止めました。",
      comment: "🔬 研究員：「使い回しは危険ですが、2要素認証のおかげで資産は守られました！」"
    },
    list_passkey: {
      breached: false,
      title: "サイト固有の秘密鍵で完全防御！",
      body: "パスキーはサービスごとに異なる暗号鍵のペアを生成するため、他サイトで情報漏洩が起きても一切悪用できません。",
      comment: "👨‍🏫 先生：「これなら他のサービスの流出事件に巻き込まれる心配もありませんね。」"
    },
    phish_breach_pw: {
      breached: true,
      title: "フィッシング詐欺に騙され、資金流出！",
      body: "「口座凍結」という言葉に焦り、偽サイト（a0ba）に自らパスワードを入力してしまったため、システムをすり抜けて乗っ取られました。",
      comment: "💀 ハッカー：「システムを攻撃するより、人間を騙して入力させる方がずっと楽だぜ！」"
    },
    phish_breach_sms: {
      breached: true,
      title: "リアルタイム・フィッシングでSMSも突破！",
      body: "偽サイトにID・パスだけでなくSMSコードまで入力すると、攻撃者が即座に本物の銀行へ入力して突破してしまいます。技術だけでなく <strong>人的対策（警戒心）</strong> が不可欠です。",
      comment: "🔬 研究員：「SMS認証の弱点です。URLを確認する『人の目』がなければ防げません！」"
    },
    phish_defend_passkey: {
      breached: false,
      title: "パスキーがドメインの違いを検知し自動防御！",
      body: "人間がうっかり偽サイトを開いてしまっても、パスキーは「正規のドメイン」と一致しない限り認証を発動しないため、技術的に詐欺をブロックしました！",
      comment: "👨‍🏫 先生：「技術（パスキー）が人間のうっかりミスをカバーしてくれた好例ですね！」"
    },
    phish_report_success: {
      breached: false,
      title: "人的対策（リテラシー）で詐欺を完全撃退！",
      body: "「a0ba（数字のゼロ）」という偽ドメインや「緊急」と煽る手口を見抜き、リンクを開かずに通報できました。技術と人の両輪が揃いましたね！",
      comment: "👨‍🏫 先生：「素晴らしい観察眼です！これで技術的対策と人的対策の両方を体得しましたね。」"
    }
  }
};