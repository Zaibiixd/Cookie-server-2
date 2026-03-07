// ===============================
// ⚡ HENRY-X LUXURY SERVER v2.1 ⚡
// Fixed Syntax + Hatername Feature Added
// Render FREE Compatible | Pink + Purple Theme
// ===============================

const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- WEBSOCKET ----------------
const wss = new WebSocket.Server({ server });

function broadcast(data) {
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", ws => {
  ws.send(JSON.stringify({
    type: "status",
    message: "💜 HENRY-X LUXURY v2.1 Connected 💖"
  }));
});

// ---------------- SESSION STORE ----------------
const activeSessions = new Map();

// ---------------- SESSION SAVE / LOAD ----------------
function saveSession(id, api) {
  try {
    const file = path.join(__dirname, `session_${id}.json`);
    fs.writeFileSync(file, JSON.stringify(api.getAppState(), null, 2));
    console.log("💾 Session saved:", id);
  } catch (e) {
    console.log("❌ Save error:", e.message);
  }
}

function loadSession(id) {
  try {
    const file = path.join(__dirname, `session_${id}.json`);
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    }
  } catch {}
  return null;
}

// ---------------- LOGIN WITH COOKIES ----------------
function loginWithCookie(cookieString, cb) {
  const methods = [
    next => {
      try {
        const appState = JSON.parse(cookieString);
        fca.login({ appState }, (e, api) => next(api));
      } catch { next(null); }
    },
    next => fca.login({ appState: cookieString }, (e, api) => next(api)),
    next => fca.login(cookieString, {}, (e, api) => next(api)),
  ];

  let i = 0;
  (function run() {
    if (i >= methods.length) return cb(null);
    methods[i++](api => api ? cb(api) : setTimeout(run, 2000));
  })();
}

// ---------------- KEEP ALIVE ----------------
function keepAlive(id, api) {
  return setInterval(() => {
    api.getCurrentUserID((e, uid) => {
      if (!e) {
        console.log("💎 Alive:", uid);
        saveSession(id, api);
      }
    });
  }, 300000);
}

// ---------------- HATERNAME FUNCTION ----------------
function applyHatername(message, hatername) {
  if (!hatername || !message) return message;
  
  // Alternate characters: Henry + Hello = Heelllnnru yHloelo
  let result = "";
  const hLen = hatername.length;
  const mLen = message.length;
  
  for (let i = 0; i < mLen; i++) {
    const hIndex = i % hLen;
    result += hatername[hIndex] + message[i];
  }
  
  return result;
}

// ---------------- UI ----------------
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>💜 HENRY-X LUXURY v2.1 💖</title>
<style>
* {margin:0;padding:0;box-sizing:border-box;}
body {
  background: linear-gradient(45deg, #ff00ff, #8a2be2, #ff1493, #9932cc);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.box {
  max-width: 1000px;
  width: 90%;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 25px;
  border: 2px solid rgba(255, 0, 255, 0.5);
  box-shadow: 0 20px 40px rgba(255, 0, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.box::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

h1 {
  text-align: center;
  font-size: 2.5em;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 30px;
  text-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
}

.input-group {
  margin: 20px 0;
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  color: #ffd700;
  font-size: 1.1em;
}

textarea, input {
  width: 100%;
  padding: 18px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff88;
  border: 2px solid #ff00ff;
  border-radius: 15px;
  font-size: 16px;
  font-family: monospace;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 0, 255, 0.2);
}

textarea:focus, input:focus {
  outline: none;
  border-color: #00ffff;
  box-shadow: 0 0 25px rgba(0, 255, 255, 0.5);
  transform: translateY(-2px);
}

.btn-group {
  display: flex;
  gap: 15px;
  margin: 30px 0;
  flex-wrap: wrap;
}

button {
  flex: 1;
  min-width: 150px;
  padding: 18px 25px;
  background: linear-gradient(45deg, #ff00ff, #8a2be2);
  border: none;
  border-radius: 15px;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(255, 0, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(255, 0, 255, 0.6);
}

button.stop {
  background: linear-gradient(45deg, #ff1493, #dc143c);
}

.messages-input {
  min-height: 120px;
  resize: vertical;
}

.logs {
  background: rgba(0, 0, 0, 0.9);
  height: 350px;
  overflow: auto;
  color: #00ff88;
  padding: 25px;
  font-family: monospace;
  font-size: 14px;
  border-radius: 15px;
  border: 2px solid #ff00ff;
  line-height: 1.6;
  margin-top: 20px;
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.5);
}

.status {
  padding: 15px;
  background: rgba(138, 43, 226, 0.3);
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.hatername-preview {
  background: rgba(255, 20, 147, 0.3);
  padding: 15px;
  border-radius: 12px;
  margin-top: 10px;
  font-family: monospace;
  font-size: 14px;
  border: 2px solid #ff1493;
  word-break: break-all;
}

@media (max-width: 768px) {
  .box { padding: 20px; margin: 20px; }
  h1 { font-size: 2em; }
  .btn-group { flex-direction: column; }
}
</style>
</head>
<body>
<div class="box">
  <h1>💜 HENRY-X LUXURY v2.1 💖</h1>
  
  <div class="status" id="status">Ready to spam! 🚀</div>
  
  <div class="input-group">
    <label>📋 Facebook Cookies</label>
    <textarea id="cookies" placeholder="Paste your Facebook cookies/JSON here..."></textarea>
  </div>

  <div class="input-group">
    <label>🎯 Group/Thread ID</label>
    <input id="group" placeholder="Enter Group ID or Thread ID">
  </div>

  <div class="input-group">
    <label>⏱️ Delay (seconds)</label>
    <input id="delay" type="number" placeholder="10" value="10" min="1">
  </div>

  <div class="input-group">
    <label>👑 Hatername</label>
    <input id="hatername" placeholder="Henry" maxlength="20">
    <div id="hatername-preview" class="hatername-preview" style="display:none;"></div>
  </div>

  <div class="input-group">
    <label>💬 Messages (one per line)</label>
    <textarea id="messages" class="messages-input" placeholder="Hello
World
Test
HENRY-X"></textarea>
  </div>

  <div class="btn-group">
    <button onclick="startBot()">🚀 START SPAM</button>
    <button onclick="stopAll()" class="stop">🛑 STOP ALL</button>
    <button onclick="testHatername()">🧪 Test Hatername</button>
  </div>

  <div class="logs" id="logs"></div>
</div>

<script>
const logs = document.getElementById("logs");
const status = document.getElementById("status");
const haternameInput = document.getElementById("hatername");
const haternamePreview = document.getElementById("hatername-preview");
const messagesInput = document.getElementById("messages");
const ws = new WebSocket((location.protocol === "https:" ? "wss://" : "ws://") + location.host);

ws.onmessage = e => {
  const data = JSON.parse(e.data);
  logs.innerHTML += \`[\${new Date().toLocaleTimeString()}] \${data.message || e.data}<br>\`;
  logs.scrollTop = logs.scrollHeight;
  if (data.status) status.textContent = data.status;
};

let currentSessionId = null;

function log(msg) {
  logs.innerHTML += \`[\${new Date().toLocaleTimeString()}] \${msg}<br>\`;
  logs.scrollTop = logs.scrollHeight;
  ws.send(JSON.stringify({ message: msg }));
}

haternameInput.addEventListener('input', updatePreview);
messagesInput.addEventListener('input', updatePreview);

function updatePreview() {
  const hatername = haternameInput.value;
  const messages = messagesInput.value.split('\\n').map(m => m.trim()).filter(Boolean);
  
  if (hatername && messages.length > 0) {
    const firstMsg = messages[0];
    const preview = applyHaternameClient(firstMsg, hatername);
    haternamePreview.textContent = \`Preview: \${preview}\`;
    haternamePreview.style.display = 'block';
  } else {
    haternamePreview.style.display = 'none';
  }
}

function applyHaternameClient(message, hatername) {
  if (!hatername || !message) return message;
  let result = "";
  const hLen = hatername.length;
  const mLen = message.length;
  for (let i = 0; i < mLen; i++) {
    const hIndex = i % hLen;
    result += hatername[hIndex] + message[i];
  }
  return result;
}

function startBot() {
  const cookies = document.getElementById("cookies").value;
  const group = document.getElementById("group").value;
  const delay = parseInt(document.getElementById("delay").value) || 10;
  const messages = document.getElementById("messages").value.split('\\n').map(m => m.trim()).filter(Boolean);
  const hatername = document.getElementById("hatername").value;

  if (!cookies || !group || messages.length === 0) {
    alert("❌ Please fill all required fields!");
    return;
  }

  status.textContent = "🔄 Starting bot...";
  
  fetch("/start", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      cookies,
      group,
      delay: delay * 1000,
      messages,
      hatername
    })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      currentSessionId = data.sessionId;
      status.textContent = \`✅ Bot Started! ID: \${data.sessionId} | Hatername: \${hatername || 'OFF'}\`;
      log(\`🚀 Bot started! Session: \${data.sessionId} | Hatername: \${hatername || 'OFF'}\`);
    } else {
      status.textContent = "❌ Failed to start!";
      log(\`❌ Error: \${data.error}\`);
    }
  })
  .catch(err => {
    status.textContent = "❌ Network error!";
    log(\`❌ Network error: \${err}\`);
  });
}

function stopAll() {
  if (currentSessionId) {
    fetch(\`/stop/\${currentSessionId}\`, { method: "POST" })
    .then(() => {
      status.textContent = "🛑 All bots stopped!";
      log("🛑 All bots stopped!");
      currentSessionId = null;
    });
  }
}

function testHatername() {
  const hatername = document.getElementById("hatername").value;
  const messages = document.getElementById("messages").value.split('\\n').map(m => m.trim()).filter(Boolean);
  
  if (hatername && messages.length > 0) {
    const testMsg = applyHaternameClient(messages[0], hatername);
    log(\`🧪 Hatername Test: \${testMsg}\`);
  } else {
    log("❌ Enter hatername and messages first!");
  }
}
</script>
</body>
</html>
`);
});

// ---------------- START BOT (UPDATED WITH HATERNAME) ----------------
app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hatername } = req.body;
  const sessionId = "HX_" + Date.now();

  loginWithCookie(cookies, api => {
    if (!api) return res.json({ success: false, error: "Login failed" });

    // Apply hatername to ALL messages
    const processedMessages = messages.map(msg => applyHatername(msg, hatername));

    const session = {
      api,
      group,
      delay,
      messages: processedMessages,
      index: 0,
      sent: 0,
      hatername
    };

    session.interval = setInterval(() => {
      const msg = session.messages[session.index];
      api.sendMessage(msg, session.group, (err) => {
        if (!err) {
          session.sent++;
          broadcast({ 
            message: \`💜 Sent (\${session.sent}): \${msg.substring(0, 30)}...\`,
            status: \`Active | Sent: \${session.sent} | Hatername: \${hatername || 'OFF'}\`
          });
        }
      });
      session.index = (session.index + 1) % session.messages.length;
    }, session.delay);

    session.keep = keepAlive(sessionId, api);
    activeSessions.set(sessionId, session);
    saveSession(sessionId, api);

    broadcast({ 
      message: \`🚀 Session \${sessionId} started! Hatername: \${hatername || 'OFF'}\`,
      status: \`Active Sessions: \${activeSessions.size}\`
    });

    res.json({ success: true, sessionId });
  });
});

// ---------------- STOP BOT ----------------
app.post("/stop/:id", (req, res) => {
  const sessionId = req.params.id;
  const session = activeSessions.get(sessionId);
  
  if (session) {
    clearInterval(session.interval);
    clearInterval(session.keep);
    activeSessions.delete(sessionId);
    broadcast({ message: `🛑 Session ${sessionId} stopped!`, status: `Sessions: ${activeSessions.size}` });
  }
  
  res.json({ success: true });
});

// ---------------- START SERVER ----------------
server.listen(PORT, "0.0.0.0", () => {
  console.log("💜 HENRY-X LUXURY v2.1 running on port", PORT);
  console.log("🎨 Pink + Purple | Hatername Fixed!");
});
