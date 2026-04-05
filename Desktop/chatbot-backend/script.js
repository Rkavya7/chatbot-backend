const emojis = [
  "😀","😁","😂","🤣","😊","😍","😎","😢","😭","👍",
  "🙏","🔥","💯","❤️","😡","🎉","😴","🤔","👏","😜"
];
const chatBox = document.getElementById("chat-box");

// Load chat + theme on page load
window.onload = () => {
  loadChat();
  loadEmojiPicker(); // 👈 ADD THIS LINE

  if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
  }
};

// 📤 Send message
async function sendMessage() {

  // ✅ Hide emoji picker when sending message
  document.getElementById("emoji-picker").classList.add("hidden");
  document.addEventListener("click", function (e) {
  const picker = document.getElementById("emoji-picker");
  const button = e.target.closest("button");

  if (!picker.contains(e.target) && !button) {
    picker.classList.add("hidden");
  }
});

  // rest of your code...
  const input = document.getElementById("user-input");
  const message = input.value.trim();

  if (!message) return;

  // 🔴 Stop any ongoing voice before sending new message
  window.speechSynthesis.cancel();

  addMessage("user", message);
  saveChat("user", message);

  input.value = "";

  const typing = addMessage("bot", "Typing...");

  const response = await fetch("http://localhost:5001/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();

  typing.remove();

  addMessage("bot", data.reply);
  saveChat("bot", data.reply);

  // 🔊 Speak response
  speakText(data.reply);
}

// 💬 Add message to chat UI
function loadEmojiPicker() {
  const picker = document.getElementById("emoji-picker");

  picker.innerHTML = "";

  emojis.forEach(emoji => {
    const span = document.createElement("span");
    span.innerText = emoji;

    span.onclick = () => {
  document.getElementById("user-input").value += emoji;

  // ✅ Hide emoji picker after selection
  document.getElementById("emoji-picker").classList.add("hidden");
};
    picker.appendChild(span);
  });
}
function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  const time = new Date().toLocaleTimeString();

  msg.innerHTML = `
    ${text}
    <div class="time">${time}</div>
  `;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  return msg;
}

// 💾 Save chat in localStorage
function saveChat(sender, text) {
  let chat = JSON.parse(localStorage.getItem("chat")) || [];
  chat.push({ sender, text });
  localStorage.setItem("chat", JSON.stringify(chat));
}

// 📥 Load chat history
function loadChat() {
  let chat = JSON.parse(localStorage.getItem("chat")) || [];
  chat.forEach(msg => {
    addMessage(msg.sender, msg.text);
  });
}

// 🌙 Toggle theme
function toggleEmojiPicker() {
  const picker = document.getElementById("emoji-picker");
  picker.classList.toggle("hidden");
}
function toggleTheme() {
  document.body.classList.toggle("light");

  if (document.body.classList.contains("light")) {
    localStorage.setItem("theme", "light");
  } else {
    localStorage.setItem("theme", "dark");
  }
}

// 🎤 Voice Input (Speech to Text)
function startVoice() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();

  recognition.interimResults = false;
  recognition.continuous = false; // better for mobile
  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;

    document.getElementById("user-input").value = text;

    sendMessage(); // auto send
  };

  recognition.onerror = (err) => {
    console.error("Voice error:", err);
  };
}

// 🔊 Text to Speech (FIXED)
function speakText(text) {
  // 🔴 Stop previous speech first
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  speech.rate = 1;

  window.speechSynthesis.speak(speech);
}