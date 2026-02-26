// GASのウェブアプリURL（デプロイ後に書き換えます）
const GAS_API_URL = "https://script.google.com/macros/s/YOUR_GAS_ID/exec";

const container = document.getElementById("ai-chat-container");
const fab = document.getElementById("chat-fab");
const closeBtn = document.getElementById("chat-close-btn");
const sendBtn = document.getElementById("chat-send-btn");
const inputFiled = document.getElementById("chat-input");
const messagesDiv = document.getElementById("chat-messages");

// 開閉ロジック
fab.addEventListener("click", () => container.classList.remove("chat-closed"));
closeBtn.addEventListener("click", () => container.classList.add("chat-closed"));

// メッセージ追加関数
const appendMessage = (text, sender) => {
  const msgEl = document.createElement("div");
  msgEl.className = `message ${sender}`;
  msgEl.textContent = text;
  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// メッセージ送信処理
const sendMessage = async () => {
  const text = inputFiled.value.trim();
  if (!text) return;

  // 1. ユーザーメッセージをUIに追加
  appendMessage(text, "user");
  inputFiled.value = "";
  
  // 思考中インジケータ（簡易版）
  const loadingId = Date.now();
  const loadingEl = document.createElement("div");
  loadingEl.className = "message ai";
  loadingEl.id = `load-${loadingId}`;
  loadingEl.textContent = "考え中...";
  messagesDiv.appendChild(loadingEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  // 2. localStorageから現在の学習状況を取得 (パーソナライズ用)
  const localData = localStorage.getItem("manabi_record_data");
  const studyData = localData ? JSON.parse(localData) : {};

  // 3. GASへ送信
  try {
    const response = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // GASのCORS制約回避のためtext/plain
      body: JSON.stringify({
        message: text,
        context: studyData.logs ||[] // 学習ログを文脈として渡す
      })
    });
    
    const result = await response.json();
    document.getElementById(`load-${loadingId}`).remove();
    appendMessage(result.reply || "すみません、エラーが発生しました。", "ai");

  } catch (error) {
    console.error("AI Error:", error);
    document.getElementById(`load-${loadingId}`).remove();
    appendMessage("通信エラーが発生しました。ネットワークを確認してください。", "ai");
  }
};

sendBtn.addEventListener("click", sendMessage);
inputFiled.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
