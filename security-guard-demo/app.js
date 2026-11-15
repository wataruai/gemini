/* ==========================================================
   青葉銀行 セキュリティ攻防シミュレーター メインロジック
   ========================================================== */

const appState = {
  authMode: 'weak',
  balance: 3500000,
  testedModes: new Set(),
  phishCleared: false,
  isBusy: false,
  tutIndex: 0,
  tutCharIndex: 0,
  tutTypingTimer: null,
  tutIsTyping: false
};

const modeNames = {
  weak: '① 弱いパスワードのみ',
  strong: '② 強いパスワード（使い回し）',
  sms: '③ パスワード ＋ SMS認証',
  passkey: '④ パスキー（生体認証＋秘密鍵）'
};

// 初期化
window.addEventListener('DOMContentLoaded', () => {
  initPassbook();
  startTutorial();
});

/* ----------------------------------------------------------
   アプリ内トースト通知（ブラウザのalert不使用）
   ---------------------------------------------------------- */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, 3400);
}

/* ----------------------------------------------------------
   チュートリアル制御（1文字ずつ表示＆タップ送り）
   ---------------------------------------------------------- */
function startTutorial() {
  appState.tutIndex = 0;
  document.getElementById('tutorial-overlay').classList.add('active');
  renderTutorialStep();
}

function skipTutorial() {
  clearInterval(appState.tutTypingTimer);
  appState.tutIsTyping = false;
  document.getElementById('tutorial-overlay').classList.remove('active');
  showToast('チュートリアルを完了しました。自由にモードを切り替えて実験しよう！', 'info');
}

function renderTutorialStep() {
  const script = window.GAME_DATA.tutorialScript;
  if (appState.tutIndex >= script.length) {
    skipTutorial();
    return;
  }

  const line = script[appState.tutIndex];
  const charInfo = window.GAME_DATA.characters[line.speaker];

  const speakerEl = document.getElementById('tut-speaker');
  speakerEl.textContent = charInfo.name;
  speakerEl.className = 'tut-speaker-tag ' + charInfo.cssClass;

  document.getElementById('tut-char-art').innerHTML = charInfo.svg;

  const textEl = document.getElementById('tut-text');
  textEl.textContent = '';
  appState.tutCharIndex = 0;
  appState.tutIsTyping = true;

  clearInterval(appState.tutTypingTimer);
  appState.tutTypingTimer = setInterval(() => {
    appState.tutCharIndex++;
    textEl.textContent = line.text.slice(0, appState.tutCharIndex);
    if (appState.tutCharIndex >= line.text.length) {
      clearInterval(appState.tutTypingTimer);
      appState.tutIsTyping = false;
    }
  }, 28);
}

function advanceTutorial() {
  const script = window.GAME_DATA.tutorialScript;
  const currentLine = script[appState.tutIndex];

  // 文字送り中なら全文を一気に表示
  if (appState.tutIsTyping) {
    clearInterval(appState.tutTypingTimer);
    document.getElementById('tut-text').textContent = currentLine.text;
    appState.tutIsTyping = false;
    return;
  }

  appState.tutIndex++;
  renderTutorialStep();
}

/* ----------------------------------------------------------
   モード切り替え（利用者 / 攻撃者 / 警察）
   ---------------------------------------------------------- */
function switchMode(targetMode) {
  if (appState.isBusy) {
    showToast('現在処理が進行中です。少しお待ちください。', 'info');
    return;
  }

  if (targetMode === 'police' && !(appState.testedModes.size === 4 && appState.phishCleared)) {
    showToast('4つの認証テストと詐欺メール見破りをすべて達成すると解放されます！', 'danger');
    return;
  }

  document.querySelectorAll('.main-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));

  document.getElementById('view-' + targetMode).classList.add('active');
  document.getElementById('mode-' + targetMode + '-btn').classList.add('active');
  window.scrollTo(0, 0);
}

function selectAuthMode(mode) {
  if (appState.isBusy) return;
  appState.authMode = mode;

  document.querySelectorAll('.auth-option').forEach(el => {
    el.classList.toggle('active', el.dataset.mode === mode);
  });

  document.getElementById('attacker-target-label').textContent = modeNames[mode];
  showToast(`設定を「${modeNames[mode]}」に変更しました。`, 'info');
}

/* ----------------------------------------------------------
   デジタル通帳初期化＆リアルタイム引き落とし演出
   ---------------------------------------------------------- */
function initPassbook() {
  appState.balance = 3500000;
  updateBalanceDisplay(3500000);

  const list = document.getElementById('passbook-list');
  list.innerHTML = `
    <div class="tx-row"><span>2026/04/01 定期預金満期振替</span><span style="color:#16a34a;">+2,000,000 円</span></div>
    <div class="tx-row"><span>2026/04/10 給与振込（アオバ商事）</span><span style="color:#16a34a;">+350,000 円</span></div>
    <div class="tx-row"><span>2026/04/15 公共料金引落し</span><span>-18,500 円</span></div>
    <div class="tx-row"><span>2026/04/20 ボーナス入金</span><span style="color:#16a34a;">+1,168,500 円</span></div>
  `;

  document.getElementById('balance-panel').classList.remove('danger-mode');
  document.getElementById('passbook-card').classList.remove('under-attack');
  document.getElementById('alert-flash-msg').textContent = '';
  const tag = document.getElementById('tx-status-tag');
  tag.textContent = '正常稼働中';
  tag.className = 'tx-status safe';
}

function resetAccount() {
  if (appState.isBusy) return;
  initPassbook();
  showToast('口座残高（3,500,000円）と取引履歴を復旧しました。', 'success');
}

function updateBalanceDisplay(val) {
  document.getElementById('balance-amount').innerHTML = `${val.toLocaleString()} <span>円</span>`;
}

// 攻撃開始後：利用者モードに切り替えて通帳から少しずつ引き落とすアニメーション
function triggerDrainAnimation(outcomeKey) {
  appState.isBusy = true;
  initPassbook(); // 一旦350万円をセットしてから減らす

  // 強制的に利用者モードへ切り替え
  document.querySelectorAll('.main-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-user').classList.add('active');
  document.getElementById('mode-user-btn').classList.add('active');

  const panel = document.getElementById('balance-panel');
  const card = document.getElementById('passbook-card');
  const alertMsg = document.getElementById('alert-flash-msg');
  const tag = document.getElementById('tx-status-tag');
  const list = document.getElementById('passbook-list');

  panel.classList.add('danger-mode');
  card.classList.add('under-attack');
  tag.textContent = '🚨 不正アクセス発生中！';
  tag.className = 'tx-status danger';
  alertMsg.textContent = '⚠️ 警告：第三者による不正送金が連続実行されています！';

  showToast('🚨 緊急警報：口座が乗っ取られました！資金が流出しています！', 'danger');

  const withdrawals = [
    { label: '🚨 不正出金（海外口座Aへ送金）', amount: 700000 },
    { label: '🚨 不正決済（高額電子マネー購入）', amount: 900000 },
    { label: '🚨 不正出金（暗号資産取引所へ送金）', amount: 1100000 },
    { label: '🚨 不正送金（匿名口座Zへ全額移動）', amount: 800000 }
  ];

  let idx = 0;
  const drainTimer = setInterval(() => {
    const item = withdrawals[idx];
    appState.balance -= item.amount;
    if (appState.balance < 0) appState.balance = 0;

    updateBalanceDisplay(appState.balance);

    const row = document.createElement('div');
    row.className = 'tx-row fraud';
    row.innerHTML = `<span>${item.label}</span><span>-${item.amount.toLocaleString()} 円</span>`;
    list.prepend(row);

    idx++;
    if (idx >= withdrawals.length) {
      clearInterval(drainTimer);
      alertMsg.textContent = '❌ 預金残高が 0円 になりました……';
      setTimeout(() => {
        appState.isBusy = false;
        recordMissionAndShowResult(outcomeKey);
      }, 900);
    }
  }, 650);
}

/* ----------------------------------------------------------
   全画面コマンドプロンプト演出（攻撃実行）
   ---------------------------------------------------------- */
function launchAttack(attackType) {
  if (appState.isBusy) return;
  appState.isBusy = true;

  const cmdOverlay = document.getElementById('cmd-overlay');
  const cmdBody = document.getElementById('cmd-body');
  const cmdStatus = document.getElementById('cmd-status');
  cmdBody.innerHTML = '';
  cmdStatus.textContent = 'RUNNING EXPLOIT...';
  cmdOverlay.classList.add('active');

  const mode = appState.authMode;
  const lines = [];
  let outcomeKey = '';

  if (attackType === 'brute') {
    lines.push({ text: '> initializing brute_force_engine.exe --target=aoba-bank.example', cls: '' });
    lines.push({ text: `> target auth configuration: ${modeNames[mode]}`, cls: 'warn' });

    if (mode === 'weak') {
      lines.push({ text: '> testing common dictionary: [000000] ... FAILED', cls: '' });
      lines.push({ text: '> testing common dictionary: [password] ... FAILED', cls: '' });
      lines.push({ text: '> testing common dictionary: [123456] ... MATCH FOUND!! (0.02s)', cls: 'err' });
      lines.push({ text: '> [CRITICAL] ACCESS GRANTED! INITIATING FUND TRANSFER...', cls: 'err' });
      outcomeKey = 'brute_weak';
    } else if (mode === 'strong') {
      lines.push({ text: '> testing 12-char alphanumeric+symbol combinations...', cls: '' });
      lines.push({ text: '> speed: 120,000 tries/sec | estimated time: 412 years', cls: 'warn' });
      lines.push({ text: '> [BLOCKED] ACCOUNT LOCKOUT TRIGGERED BY SERVER.', cls: 'ok' });
      outcomeKey = 'brute_strong';
    } else if (mode === 'sms') {
      lines.push({ text: '> checking login gate... 2-Factor SMS prompt detected.', cls: 'warn' });
      lines.push({ text: '> bypassing 6-digit one-time code... FAILED (3 tries limit).', cls: 'ok' });
      lines.push({ text: '> [BLOCKED] ATTACK TERMINATED.', cls: 'ok' });
      outcomeKey = 'brute_sms';
    } else {
      lines.push({ text: '> scanning for password input field...', cls: '' });
      lines.push({ text: '> [ERROR] NO PASSWORD FIELD FOUND. FIDO2 PASSKEY REQUIRED.', cls: 'ok' });
      lines.push({ text: '> [DEFENDED] IMPOSSIBLE TO BRUTE FORCE.', cls: 'ok' });
      outcomeKey = 'brute_passkey';
    }
  } else if (attackType === 'list') {
    lines.push({ text: '> loading leaked_credentials_2026.db (1,420,000 records)...', cls: '' });
    lines.push({ text: '> executing credential stuffing against target...', cls: 'warn' });

    if (mode === 'weak' || mode === 'strong') {
      lines.push({ text: '> match found in leaked shopping site database!', cls: 'warn' });
      lines.push({ text: '> [CRITICAL] PASSWORD REUSE DETECTED! LOGIN SUCCESSFUL!', cls: 'err' });
      lines.push({ text: '> [CRITICAL] HIJACKING SESSION & TRANSFERRING 3,500,000 JPY...', cls: 'err' });
      outcomeKey = 'list_breach';
    } else if (mode === 'sms') {
      lines.push({ text: '> password matched from leaked list... advancing to step 2...', cls: 'warn' });
      lines.push({ text: '> [STOPPED] SMS VERIFICATION CODE REQUIRED ON USER DEVICE.', cls: 'ok' });
      outcomeKey = 'list_sms';
    } else {
      lines.push({ text: '> attempting leaked password injection...', cls: '' });
      lines.push({ text: '> [DEFENDED] PASSKEY USES DOMAIN-BOUND CRYPTOGRAPHIC KEYS. REJECTED.', cls: 'ok' });
      outcomeKey = 'list_passkey';
    }
  }

  let i = 0;
  const cmdTimer = setInterval(() => {
    const item = lines[i];
    const div = document.createElement('div');
    div.className = 'cmd-line ' + item.cls;
    div.textContent = item.text;
    cmdBody.appendChild(div);
    i++;

    if (i >= lines.length) {
      clearInterval(cmdTimer);
      const outcome = window.GAME_DATA.attackOutcomes[outcomeKey];
      cmdStatus.textContent = outcome.breached ? 'SYSTEM BREACHED!' : 'ATTACK BLOCKED!';

      setTimeout(() => {
        cmdOverlay.classList.remove('active');
        if (outcome.breached) {
          triggerDrainAnimation(outcomeKey);
        } else {
          appState.isBusy = false;
          switchMode('user');
          initPassbook();
          showToast('🛡️ 攻撃をブロック！口座の3,500,000円は無事です！', 'success');
          recordMissionAndShowResult(outcomeKey);
        }
      }, 1100);
    }
  }, 550);
}

/* ----------------------------------------------------------
   フィッシング攻撃体験（すべてアプリ内UI）
   ---------------------------------------------------------- */
function launchPhishFromAttacker() {
  if (appState.isBusy) return;
  switchMode('user');
  showToast('📩 攻撃者から偽の緊急メールが送信されました！', 'danger');
  setTimeout(openPhishInbox, 500);
}

function openPhishInbox() {
  if (appState.isBusy) return;
  document.getElementById('phish-step-mail').style.display = 'block';
  document.getElementById('phish-step-browser').style.display = 'none';
  document.getElementById('phish-mode-display').textContent = modeNames[appState.authMode];
  document.getElementById('phish-modal').classList.add('open');
}

function closePhishModal() {
  document.getElementById('phish-modal').classList.remove('open');
}

function openFakeLoginScreen() {
  document.getElementById('phish-step-mail').style.display = 'none';
  document.getElementById('phish-step-browser').style.display = 'block';

  const authArea = document.getElementById('phish-auth-area');
  const mode = appState.authMode;

  if (mode === 'weak' || mode === 'strong') {
    authArea.innerHTML = `
      <input class="fake-input-box" type="text" value="aoba_taro" readonly />
      <input class="fake-input-box" type="password" value="••••••••••" readonly />
      <button class="btn-danger-fill" style="width:100%;" onclick="executePhishResult('pw')">
        偽サイトにパスワードを送信する
      </button>
    `;
  } else if (mode === 'sms') {
    authArea.innerHTML = `
      <input class="fake-input-box" type="text" value="aoba_taro / ••••••••••" readonly />
      <input class="fake-input-box" type="text" value="SMSコード: 482910" readonly />
      <button class="btn-danger-fill" style="width:100%;" onclick="executePhishResult('sms')">
        偽サイトにSMSコードまで入力して送信する
      </button>
    `;
  } else {
    authArea.innerHTML = `
      <div style="background:#eff6ff; padding:12px; border-radius:8px; margin-bottom:10px; font-size:0.88rem;">
        端末のパスキー（生体認証）を呼び出そうとしています...
      </div>
      <button class="btn-primary-action" style="width:100%;" onclick="executePhishResult('passkey')">
        👆 指紋・顔認証（パスキー）でログインを試みる
      </button>
    `;
  }
}

function executePhishResult(kind) {
  closePhishModal();
  if (kind === 'pw') {
    triggerDrainAnimation('phish_breach_pw');
  } else if (kind === 'sms') {
    triggerDrainAnimation('phish_breach_sms');
  } else {
    showToast('🛡️ パスキーが偽ドメインを自動検知しブロックしました！', 'success');
    recordMissionAndShowResult('phish_defend_passkey');
  }
}

function reportPhishingSuccess() {
  closePhishModal();
  appState.phishCleared = true;
  showToast('🎯 人的対策成功！詐欺メールを見破りました！', 'success');
  recordMissionAndShowResult('phish_report_success');
}

/* ----------------------------------------------------------
   ミッション更新＆解説モーダル表示
   ---------------------------------------------------------- */
function recordMissionAndShowResult(outcomeKey) {
  appState.testedModes.add(appState.authMode);

  ['weak', 'strong', 'sms', 'passkey'].forEach(m => {
    if (appState.testedModes.has(m)) {
      document.getElementById('badge-' + m).classList.add('done');
    }
  });

  if (appState.phishCleared) {
    document.getElementById('badge-phish').classList.add('done');
  }

  // 警察画面アンロック判定
  const policeBtn = document.getElementById('mode-police-btn');
  const allCleared = (appState.testedModes.size === 4 && appState.phishCleared);
  if (allCleared && policeBtn.classList.contains('locked')) {
    policeBtn.classList.remove('locked');
    policeBtn.classList.add('unlocked');
    policeBtn.textContent = '🚓 サイバー警察（解放！）';
    showToast('🎉 全ミッション達成！「サイバー警察」画面が解放されました！', 'gold');
  }

  // 解説モーダルを開く
  const data = window.GAME_DATA.attackOutcomes[outcomeKey];
  const header = document.getElementById('res-header');
  header.className = 'ui-modal-header ' + (data.breached ? 'breached' : 'defended');
  document.getElementById('res-badge').textContent = data.breached ? '🚨 乗っ取り被害発生' : '🛡️ 防御成功';
  document.getElementById('res-title').textContent = data.title;
  document.getElementById('res-body').innerHTML = data.body;
  document.getElementById('res-char-comment').textContent = data.comment;
  document.getElementById('result-modal').classList.add('open');
}

function closeResultModal() {
  document.getElementById('result-modal').classList.remove('open');
}

/* ----------------------------------------------------------
   サイバー警察画面の名前同期
   ---------------------------------------------------------- */
function syncOfficerName() {
  const val = document.getElementById('officer-name-input').value.trim();
  document.getElementById('cert-officer-display').textContent = val || '情報コース 捜査官';
}