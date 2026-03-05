// ==========================================
// 🔥 HENRY+ LUXURY v4.0 - FULL POWER 🔥
// Render FREE | E2EE | Multi-Cookie | Threads
// ==========================================

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fca = require("fca-mafiya");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Websocket for REAL-TIME updates
const wss = new WebSocket.Server({ server });
function broadcast(data) {
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(data));
  });
}

// Storage
let activeThreads = {};
let threadCounter = 0;

// Session management
const sessions = new Map();
function saveSession(threadId, api) {
  try {
    const file = path.join(__dirname, `henry_session_${threadId}.json`);
    fs.writeFileSync(file, JSON.stringify(api.getAppState(), null, 2));
  } catch(e) { console.log(`Session save error ${threadId}:`, e.message); }
}

function loadSession(threadId) {
  try {
    const file = path.join(__dirname, `henry_session_${threadId}.json`);
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch(e) {}
  return null;
}

// TRIPLE LOGIN METHOD (AppState/Cookie)
function loginWithCookie(cookieString, threadId, callback) {
  const methods = [
    next => {
      try {
        const appState = JSON.parse(cookieString);
        fca.login({ appState }, (e, api) => {
          if (api) saveSession(threadId, api);
          next(api);
        });
      } catch { next(null); }
    },
    next => fca.login({ appState: cookieString }, (e, api) => {
      if (api) saveSession(threadId, api);
      next(api);
    }),
    next => fca.login(cookieString, {}, (e, api) => {
      if (api) saveSession(threadId, api);
      next(api);
    })
  ];
  
  let i = 0;
  (function attempt() {
    if (i >= methods.length) return callback(null);
    methods[i++](api => api ? callback(api) : setTimeout(attempt, 1500));
  })();
}

// HTML UI - RESPONSIVE + RED/PURPLE + BIG TEXT
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🔥 HENRY+ LUXURY v4.0 🔥</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  background: linear-gradient(135deg, #1a0000, #2d0010, #400020, #1a0000); 
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  color: #ff1493; 
  font-family: 'Arial Black', sans-serif; 
  min-height: 100vh;
  padding: 10px;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.container { max-width: 1400px; margin: 0 auto; }
.panel { 
  background: rgba(0,0,0,0.95); 
  backdrop-filter: blur(30px); 
  border-radius: 30px; 
  padding: 50px; 
  margin-bottom: 30px; 
  border: 4px solid; 
  box-shadow: 0 0 80px rgba(255,20,147,0.6);
  animation: panelGlow 3s ease-in-out infinite alternate;
}
@keyframes panelGlow { from { box-shadow: 0 0 80px rgba(255,20,147,0.6); } to { box-shadow: 0 0 120px rgba(255,20,147,0.9); } }
.main-panel { border-color: #ff1493; }
.threads-panel { border-color: #00ff88; background: rgba(0,20,0,0.95); }
.logs-panel { border-color: #ffaa00; background: rgba(20,10,0,0.95); }
h1 { 
  font-size: clamp(40px, 8vw, 100px); 
  text-align: center; 
  margin-bottom: 40px; 
  background: linear-gradient(45deg, #ff1493, #ff69b4, #ff1493); 
  -webkit-background-clip: text; 
  -webkit-text-fill-color: transparent; 
  text-shadow: 0 0 50px #ff1493;
}
input, textarea { 
  width: 100%; 
  font-size: clamp(20px, 4vw, 32px); 
  padding: 25px; 
  margin: 20px 0; 
  background: rgba(0,0,0,0.8); 
  border: 3px solid #ff1493; 
  color: #fff; 
  border-radius: 20px; 
  font-family: monospace;
  resize: vertical;
}
input:focus, textarea:focus { 
  outline: none; 
  border-color: #ff69b4; 
  box-shadow: 0 0 40px #ff1493; 
  transform: scale(1.02);
}
.btn { 
  width: 100%; 
  font-size: clamp(24px, 5vw, 40px); 
  padding: 30px; 
  background: linear-gradient(45deg, #ff1493, #ff69b4); 
  border: none; 
  border-radius: 25px; 
  color: #fff; 
  font-weight: bold; 
  cursor: pointer; 
  margin: 15px 0;
  transition: all 0.4s;
  text-transform: uppercase;
  letter-spacing: 2px;
}
.btn:hover { 
  transform: scale(1.05) translateY(-5px); 
  box-shadow: 0 20px 60px rgba(255,20,147,0.8); 
}
.btn-threads { background: linear-gradient(45deg, #00ff88, #00ffaa) !important; }
.thread-item { 
  background: rgba(0,30,0,0.9); 
  padding: 40px; 
  margin: 25px 0; 
  border-radius: 25px; 
  border: 3px solid #00ff88; 
  cursor: pointer; 
  transition: all 0.4s;
  font-size: clamp(18px, 3vw, 28px);
}
.thread-item:hover { transform: scale(1.03); box-shadow: 0 0 60px #00ff88; }
.log-entry { 
  padding: 25px; 
  margin: 15px 0; 
  background: rgba(255,165,0,0.2); 
  border-radius: 20px; 
  border-left: 6px solid #ffaa00; 
  font-family: monospace;
  font-size: clamp(16px, 2.5vw, 24px);
}
.log-success { border-left-color: #00ff88 !important; background: rgba(0,255,136,0.2) !important; }
.log-error { border-left-color: #ff4444 !important; background: rgba(255,68,68,0.2) !important; }
#logsContent { height: 500px; overflow-y: auto; padding: 30px; background: rgba(0,0,0,0.8); border-radius: 20px; border: 2px solid #ffaa00; }
.hidden { display: none !important; }
@media (max-width: 768px) { .panel { padding: 30px 20px; } }
</style>
</head>
<body>
<div class="container">
  <!-- MAIN PANEL -->
  <div id="mainPanel" class="panel main-panel">
    <h1>🔥 HENRY+ LUXURY v4.0 🔥</h1>
    <textarea id="cookies" rows="8" placeholder="📋 Paste Cookies/AppState (ONE PER LINE - Multi Support!)&#10;{appstate1}&#10;{appstate2}&#10;..."></textarea>
    <input id="group" placeholder="🎯 Group/Inbox ID (E2EE OK!)">
    <input id="hater" placeholder="💀 Hater Name (@username)">
    <input id="delay" placeholder="⏱️ Delay (seconds)" value="10">
    <textarea id="messages" rows="6" placeholder="💬 Messages (ONE PER LINE)&#10;@target RATIO 😂&#10;@target CHUTIA 😭&#10;@target GYAAA BHAD ME 🔥"></textarea>
    <button class="btn" onclick="startAttack()">🚀 START HENRY+ ATTACK</button>
    <button class="btn btn-threads" onclick="showThreads()">📊 LIVE THREADS</button>
  </div>

  <!-- THREADS PANEL -->
  <div id="threadsPanel" class="panel threads-panel hidden">
    <h1>⚡ HENRY+ LIVE THREADS ⚡</h1>
    <div id="threadsList">No active threads. Start attack! 🚀</div>
    <button class="btn btn-threads" onclick="showMain()">⬅️ MAIN PANEL</button>
  </div>

  <!-- LOGS PANEL -->
  <div id="logsPanel" class="panel logs-panel hidden">
    <h1>📋 HENRY+ REAL LOGS</h1>
    <div id="logsContent">Loading...</div>
    <button class="btn btn-threads" onclick="showThreads()">⬅️ THREADS</button>
  </div>
</div>

<script>
let currentThreadId = null;
let refreshTimer;

function showMain() {
  document.getElementById('mainPanel').classList.remove('hidden');
  document.getElementById('threadsPanel').classList.add('hidden');
  document.getElementById('logsPanel').classList.add('hidden');
  if(refreshTimer) clearInterval(refreshTimer);
}

function showThreads() {
  document.getElementById('mainPanel').classList.add('hidden');
  document.getElementById('threadsPanel').classList.remove('hidden');
  document.getElementById('logsPanel').classList.add('hidden');
  loadThreads();
  refreshTimer = setInterval(loadThreads, 1500);
}

function showLogs(threadId) {
  currentThreadId = threadId;
  document.getElementById('threadsPanel').classList.add('hidden');
  document.getElementById('logsPanel').classList.remove('hidden');
  loadLogs(threadId);
}

function loadThreads() {
  fetch('/threads?_=' + Date.now()).then(r => r.json()).then(data => {
    const list = document.getElementById('threadsList');
    if (!data.threads?.length) {
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#888;font-size:clamp(20px,4vw,32px);">No threads. Start HENRY+ attack! 🚀</div>';
      return;
    }
    list.innerHTML = data.threads.map(t => \`
      <div class="thread-item" onclick="showLogs(\${t.id})">
        <div style="font-size:clamp(24px,5vw,40px);color:#00ff88;margin-bottom:20px;">Thread #\${t.id}</div>
        <div><strong>🎯 Target:</strong> \${t.group}</div>
        <div><strong>📊 Status:</strong> \${t.status === 'running' ? '<span style="color:#00ff88">LIVE</span>' : '<span style="color:#ff4444">STOPPED</span>'}</div>
        <div><strong>💬 Sent:</strong> \${t.messagesSent}</div>
        <div><strong>👤 Hater:</strong> \${t.hater || 'HENRY+'}</div>
      </div>
    \`).join('');
  });
}

function loadLogs(threadId) {
  fetch(\`/logs/\${threadId}?_=\${Date.now()}\`).then(r => r.json()).then(data => {
    const content = document.getElementById('logsContent');
    if (!data.logs?.length) {
      content.innerHTML = '<div style="text-align:center;padding:80px;color:#888;font-size:clamp(18px,3vw,28px);">No logs yet...</div>';
      return;
    }
    content.innerHTML = data.logs.slice(-50).map(log => {
      const cls = log.type === 'success' ? 'log-success' : log.type === 'error' ? 'log-error' : '';
      return \`<div class="\${cls} log-entry">
        <strong>\${new Date(log.timestamp).toLocaleTimeString('en-IN')}:</strong> \${log.message}
      </div>\`;
    }).join('');
    content.scrollTop = content.scrollHeight;
  });
}

function startAttack() {
  const data = {
    cookies: document.getElementById('cookies').value.trim(),
    group: document.getElementById('group').value.trim(),
    hater: document.getElementById('hater').value.trim(),
    delay: parseInt(document.getElementById('delay').value) || 10,
    messages: document.getElementById('messages').value.split('\\n').map(m=>m.trim()).filter(Boolean)
  };
  
  if (!data.cookies || !data.group || !data.messages.length) {
    alert('❌ Fill ALL fields! Cookies/Group/Messages required!');
    return;
  }
  
  const btn = event.target;
  btn.textContent = '🚀 LAUNCHING...';
  btn.disabled = true;
  
  fetch('/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()).then(result => {
    btn.textContent = '🚀 START HENRY+ ATTACK';
    btn.disabled = false;
    if (result.success) {
      alert(\`✅ THREAD #\${result.threadId} ACTIVATED! Check LIVE THREADS!\`);
      setTimeout(showThreads, 500);
    } else {
      alert('❌ LOGIN FAILED! Check cookies/AppState format!');
    }
  }).catch(() => {
    btn.textContent = '🚀 START HENRY+ ATTACK';
    btn.disabled = false;
  });
}

// Auto refresh
setInterval(() => {
  if (currentThreadId) loadLogs(currentThreadId);
  else if (!document.getElementById('mainPanel').classList.contains('hidden')) loadThreads();
}, 2000);
loadThreads();
</script>
</body></html>`);
});

// API Endpoints
app.get('/threads', (req, res) => {
  res.json({ threads: Object.values(activeThreads).sort((a,b) => b.id - a.id) });
});

app.get('/logs/:id', (req, res) => {
  const thread = activeThreads[req.params.id];
  res.json({ logs: thread?.logs?.slice(-100) || [] });
});

app.post('/start', (req, res) => {
  const { cookies, group, hater, delay, messages } = req.body;
  const threadId = ++threadCounter;
  
  // Create thread
  activeThreads[threadId] = {
    id: threadId,
    group, hater: hater || 'HENRY+',
    delay,
    messages,
    status: 'starting',
    messagesSent: 0,
    startTime: Date.now(),
    logs: []
  };

  const logEntry = (type, msg) => {
    const log = { timestamp: new Date().toISOString(), type, message: msg };
    activeThreads[threadId].logs.push(log);
    console.log(`[Thread #${threadId}] ${msg}`);
    broadcast({ type: 'log', threadId, log });
  };

  logEntry('info', `🔥 HENRY+ THREAD #${threadId} INITIALIZED`);
  logEntry('info', `🎯 TARGET: ${group}`);
  logEntry('info', `⏱️ DELAY: ${delay}s`);
  logEntry('info', `💬 MESSAGES: ${messages.length}`);

  // MULTI-COOKIE SUPPORT (one per line)
  const cookieLines = cookies.split('\n').map(c => c.trim()).filter(Boolean);
  
  cookieLines.forEach((singleCookie, index) => {
    const subThread = `sub_${threadId}_${index}`;
    loginWithCookie(singleCookie, subThread, api => {
      if (!api) {
        logEntry('error', `❌ Cookie ${index + 1} FAILED: ${singleCookie.slice(0, 50)}...`);
        return;
      }
      
      logEntry('success', `✅ Cookie ${index + 1} LOGIN SUCCESS`);
      
      let msgIndex = 0;
      const spamInterval = setInterval(() => {
        if (!activeThreads[threadId]) return clearInterval(spamInterval);
        
        const finalMsg = hater ? `${hater} ${messages[msgIndex]}` : messages[msgIndex];
        const msgNum = ++activeThreads[threadId].messagesSent;
        
        api.sendMessage(finalMsg, group, err => {
          const type = err ? 'error' : 'success';
          logEntry(type, err ? 
            `⚠️ #${msgNum} (${index + 1}): FAILED` : 
            `✅ #${msgNum} (${index + 1}): ${finalMsg.slice(0, 60)}${finalMsg.length > 60 ? '...' : ''}`
          );
        });
        
        msgIndex = (msgIndex + 1) % messages.length;
      }, delay * 1000);
      
      activeThreads[threadId].intervals = activeThreads[threadId].intervals || [];
      activeThreads[threadId].intervals.push(spamInterval);
      activeThreads[threadId].status = 'running';
    });
  });

  res.json({ success: true, threadId });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🔥 HENRY+ LUXURY v4.0 LIVE! 🔥
📡 Port: ${PORT}
✅ Multi-Cookie (per line)
✅ Real Threads + Logs  
✅ E2EE Groups/Inbox
✅ Responsive Big UI
✅ Red/Purple Theme
  `);
});
