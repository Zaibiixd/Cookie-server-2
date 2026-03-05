const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// In-memory storage for threads and logs
let activeThreads = {};
let threadCounter = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Static files

// --- TRIPLE-METHOD LOGIC (Most Stable for your cookies) ---
function loginWithCookie(cookieString, cb) {
  const methods = [
    next => { try { const appState = JSON.parse(cookieString); fca.login({ appState }, (e, api) => next(api)); } catch { next(null); } },
    next => { fca.login({ appState: cookieString }, (e, api) => next(api)); },
    next => { fca.login(cookieString, {}, (e, api) => next(api)); }
  ];
  let i = 0;
  (function run() {
    if (i >= methods.length) return cb(null);
    methods[i++](api => api ? cb(api) : setTimeout(run, 2000));
  })();
}

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>HENRY-X LUXURY</title>
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: linear-gradient(45deg, #000, #1a0000); color: #ff003c; font-family: 'Arial Black', sans-serif; padding: 20px; min-height: 100vh; }
  .box { width: 100%; max-width: 1100px; background: rgba(17,17,17,0.95); backdrop-filter: blur(20px); padding: 60px; border-radius: 40px; border: 5px solid #ff003c; box-shadow: 0 0 80px #ff003c; margin: 0 auto; }
  h1 { text-align: center; font-size: 80px; text-transform: uppercase; margin-bottom: 50px; color: #ff003c; text-shadow: 0 0 40px #ff003c, 0 0 80px #ff003c; animation: glow 2s ease-in-out infinite alternate; }
  @keyframes glow { from { text-shadow: 0 0 40px #ff003c, 0 0 80px #ff003c; } to { text-shadow: 0 0 60px #ff003c, 0 0 120px #ff003c; } }
  textarea, input { width: 100%; font-size: 28px; padding: 30px; margin: 25px 0; background: rgba(0,0,0,0.8); border: 4px solid #ff003c; color: #fff; border-radius: 25px; font-family: monospace; resize: vertical; }
  textarea:focus, input:focus { outline: none; box-shadow: 0 0 30px #ff003c; border-color: #ff66aa; }
  button { width: 100%; font-size: 35px; padding: 35px; background: linear-gradient(45deg, #ff003c, #ff0066); border: none; border-radius: 25px; color: #fff; font-weight: bold; cursor: pointer; margin: 10px 0; transition: all 0.3s; font-family: 'Arial Black'; text-transform: uppercase; }
  button:hover { background: linear-gradient(45deg, #ff0066, #ff3399); transform: scale(1.05); box-shadow: 0 0 50px #ff003c; }
  button:active { transform: scale(0.98); }
  .threads-panel { display: none; background: rgba(17,17,17,0.98); backdrop-filter: blur(20px); border-radius: 40px; padding: 60px; margin-top: 30px; border: 5px solid #00ff88; box-shadow: 0 0 80px #00ff88; }
  .threads-panel.active { display: block; animation: slideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
  @keyframes slideIn { from { opacity: 0; transform: translateY(100px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .thread-item { background: rgba(34,34,34,0.9); padding: 50px; margin: 30px 0; border-radius: 30px; border: 4px solid #00ff88; box-shadow: 0 0 50px #00ff88; cursor: pointer; transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); position: relative; overflow: hidden; }
  .thread-item::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(0,255,136,0.3), transparent); transition: left 0.5s; }
  .thread-item:hover::before { left: 100%; }
  .thread-item:hover { transform: scale(1.05) translateY(-10px); box-shadow: 0 20px 60px #00ff88; }
  .thread-header { font-size: 40px; margin-bottom: 25px; color: #00ff88; text-shadow: 0 0 20px #00ff88; }
  .thread-status { font-size: 28px; color: #fff; line-height: 1.6; }
  .status-running { color: #00ff88 !important; }
  .status-failed { color: #ff4444 !important; }
  .logs-panel { display: none; background: rgba(0,0,0,0.95); backdrop-filter: blur(30px); border-radius: 40px; padding: 60px; margin-top: 30px; border: 5px solid #ffaa00; box-shadow: 0 0 80px #ffaa00; min-height: 600px; }
  .logs-panel.active { display: block; animation: fadeInUp 0.5s ease-out; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
  #logsContent { height: 500px; overflow-y: auto; background: rgba(17,17,17,0.8); border-radius: 20px; padding: 30px; font-size: 26px; line-height: 1.6; font-family: monospace; border: 2px solid #ffaa00; }
  .log-entry { padding: 20px; margin: 15px 0; background: rgba(255,170,0,0.1); border-radius: 20px; border-left: 6px solid #ffaa00; box-shadow: 0 5px 20px rgba(255,170,0,0.2); animation: logSlide 0.3s ease-out; }
  @keyframes logSlide { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
  .log-success { border-left-color: #00ff88 !important; background: rgba(0,255,136,0.1) !important; }
  .log-error { border-left-color: #ff4444 !important; background: rgba(255,68,68,0.1) !important; }
  .back-btn { background: linear-gradient(45deg, #00ff88, #00ffaa) !important; color: #000 !important; font-size: 32px !important; box-shadow: 0 0 40px #00ff88 !important; }
  img { width: 100%; height: auto; border-radius: 25px; margin: 40px 0; box-shadow: 0 0 60px #ff003c; }
  .loading { animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .no-threads { text-align: center; font-size: 32px; color: #888; padding: 60px; }
</style>
</head>
<body>
<div class="box" id="mainPanel">
  <h1>🔥 HENRY-X LUXURY 🔥</h1>
  <img src="https://i.imgur.com/0QlAP8b.jpeg" alt="HENRY-X">
  
  <textarea id="cookies" placeholder="📋 Paste your Facebook Cookie/AppState JSON here..." rows="6"></textarea>
  <input id="group" placeholder="🎯 Group/Thread ID (e.g., 123456789012345)">
  <input id="hater" placeholder="💀 Hater Name (Optional)">
  <input id="delay" placeholder="⏱️ Delay between messages (seconds)" value="10">
  <textarea id="msgs" placeholder="💬 Messages (one per line):
@target ratio karo
@target chutiya hai
@target gya bhad me
@target bakwas band kar" rows="8"></textarea>
  
  <button onclick="startOperation()" class="loading" id="startBtn">🚀 START MASS ATTACK</button>
  <button onclick="showThreads()" class="back-btn">📊 LIVE THREADS DASHBOARD</button>
</div>

<div class="threads-panel" id="threadsPanel">
  <h1 style="font-size: 70px; text-align: center; margin-bottom: 50px; color: #00ff88;">⚡ LIVE THREADS DASHBOARD ⚡</h1>
  <div id="threadsList" style="min-height: 400px;">
    <div class="no-threads">No active threads. Start an operation! 🚀</div>
  </div>
  <button onclick="showMain()" class="back-btn">⬅️ MAIN PANEL</button>
</div>

<div class="logs-panel" id="logsPanel">
  <h1 style="font-size: 50px; text-align: center; margin-bottom: 30px; color: #ffaa00;">📋 REAL-TIME LOGS</h1>
  <div id="logsContent">Loading logs...</div>
  <button onclick="showThreads()" class="back-btn">⬅️ BACK TO THREADS</button>
</div>

<script>
let currentThreadId = null;
let refreshInterval;

// Disable cache for real-time updates
fetch('/threads?_=' + Date.now());

function showMain() {
  document.getElementById('mainPanel').style.display = 'block';
  document.getElementById('threadsPanel').classList.remove('active');
  document.getElementById('logsPanel').classList.remove('active');
  if(refreshInterval) clearInterval(refreshInterval);
}

function showThreads() {
  document.getElementById('mainPanel').style.display = 'none';
  document.getElementById('threadsPanel').classList.add('active');
  document.getElementById('logsPanel').classList.remove('active');
  loadThreads();
  refreshInterval = setInterval(loadThreads, 1500);
}

function showLogs(threadId) {
  currentThreadId = threadId;
  document.getElementById('threadsPanel').classList.remove('active');
  document.getElementById('logsPanel').classList.add('active');
  loadLogs(threadId);
}

function loadThreads() {
  fetch('/threads?_=' + Date.now())
    .then(r => r.json())
    .then(data => {
      const threadsList = document.getElementById('threadsList');
      if(data.threads.length === 0) {
        threadsList.innerHTML = '<div class="no-threads">No active threads. Start an operation! 🚀</div>';
        return;
      }
      
      threadsList.innerHTML = '';
      data.threads.forEach(thread => {
        const threadDiv = document.createElement('div');
        threadDiv.className = 'thread-item';
        threadDiv.onclick = () => showLogs(thread.id);
        const statusClass = thread.status === 'running' ? 'status-running' : 'status-failed';
        threadDiv.innerHTML = \`
          <div class="thread-header">Thread #\${thread.id} ⚡</div>
          <div class="thread-status">
            <strong>🎯 Target:</strong> \${thread.group}<br>
            <strong>📊 Status:</strong> <span class="\${statusClass}">\${thread.status.toUpperCase()}</span><br>
            <strong>💬 Messages:</strong> \${thread.messagesSent}<br>
            <strong>⏰ Started:</strong> \${new Date(thread.startTime).toLocaleString('en-IN')}<br>
            <strong>👤 Hater:</strong> \${thread.hater || 'None'}
          </div>
        \`;
        threadsList.appendChild(threadDiv);
      });
    })
    .catch(() => console.log('Threads refresh error'));
}

function loadLogs(threadId) {
  fetch(\`/logs/\${threadId}?_=\${Date.now()}\`)
    .then(r => r.json())
    .then(data => {
      const logsContent = document.getElementById('logsContent');
      if(data.logs.length === 0) {
        logsContent.innerHTML = '<div style="text-align:center;color:#888;font-size:28px;padding:50px;">No logs yet...</div>';
        return;
      }
      
      logsContent.innerHTML = data.logs.map(log => {
        const logClass = log.type === 'success' ? 'log-success' : 
                        log.type === 'error' ? 'log-error' : '';
        return \`<div class="log-entry \${logClass}">
          <strong>\${new Date(log.timestamp).toLocaleTimeString('en-IN')} |</strong> \${log.message}
        </div>\`;
      }).join('');
      
      // Auto scroll to bottom
      logsContent.scrollTop = logsContent.scrollHeight;
    });
}

function startOperation() {
  const btn = document.getElementById('startBtn');
  btn.innerHTML = '⏳ STARTING...';
  btn.disabled = true;
  
  const data = {
    cookies: document.getElementById("cookies").value.trim(),
    group: document.getElementById("group").value.trim(),
    hater: document.getElementById("hater").value.trim(),
    delay: parseInt(document.getElementById("delay").value) || 10,
    messages: document.getElementById("msgs").value.split('\\n').map(m=>m.trim()).filter(m=>m)
  };
  
  if(!data.cookies || !data.group || data.messages.length === 0) {
    alert('❌ Please fill all required fields!');
    btn.innerHTML = '🚀 START MASS ATTACK';
    btn.disabled = false;
    return;
  }
  
  fetch("/start", { 
    method: "POST", 
    headers: {"Content-Type": "application/json"}, 
    body: JSON.stringify(data) 
  })
  .then(r => r.json())
  .then(d => {
    btn.innerHTML = '🚀 START MASS ATTACK';
    btn.disabled = false;
    if(d.success) {
      alert(`✅ THREAD #\${d.threadId} STARTED SUCCESSFULLY! Check LIVE THREADS!`);
      setTimeout(() => {
        showThreads();
      }, 500);
    } else {
      alert("❌ LOGIN FAILED - CHECK YOUR COOKIES!");
    }
  })
  .catch(() => {
    btn.innerHTML = '🚀 START MASS ATTACK';
    btn.disabled = false;
  });
}

// Auto refresh every 2 seconds when on threads/logs
setInterval(() => {
  if(currentThreadId) {
    loadLogs(currentThreadId);
  } else if(document.getElementById('threadsPanel').classList.contains('active')) {
    loadThreads();
  }
}, 2000);

// Load threads on page load
window.onload = () => loadThreads();
</script>
</body>
</html>
`);
});

// FIXED API endpoints with proper caching prevention
app.get('/threads', (req, res) => {
  console.log('📊 Threads requested. Active threads:', Object.keys(activeThreads).length);
  res.json({ threads: Object.values(activeThreads).sort((a,b) => b.id - a.id) });
});

app.get('/logs/:threadId', (req, res) => {
  const threadId = req.params.threadId;
  console.log(`📋 Logs requested for thread #${threadId}`);
  
  const thread = activeThreads[threadId];
  if(thread && thread.logs) {
    res.json({ logs: thread.logs.slice(-100) }); // Last 100 logs
  } else {
    res.json({ logs: [] });
  }
});

app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hater } = req.body;
  console.log(`🚀 New operation started for group: ${group}`);
  
  // Create new thread
  const threadId = ++threadCounter;
  activeThreads[threadId] = {
    id: threadId,
    group,
    hater: hater || '',
    delay,
    messages,
    status: 'starting',
    messagesSent: 0,
    startTime: Date.now(),
    logs: []
  };

  // Initial logs
  const logEntry = (type, msg) => ({
    timestamp: new Date().toISOString(),
    message: msg,
    type
  });

  activeThreads[threadId].logs.push(logEntry('info', `🔥 THREAD #${threadId} INITIALIZED`));
  activeThreads[threadId].logs.push(logEntry('info', `🎯 TARGET GROUP: ${group}`));
  activeThreads[threadId].logs.push(logEntry('info', `⏱️ DELAY: ${delay} seconds`));
  activeThreads[threadId].logs.push(logEntry('info', `💬 TOTAL MESSAGES: ${messages.length}`));

  loginWithCookie(cookies, api => {
    if (!api) {
      activeThreads[threadId].status = 'failed';
      activeThreads[threadId].logs.push(logEntry('error', '❌ LOGIN FAILED - Invalid cookies!'));
      console.log(`❌ Thread #${threadId} login failed`);
      return res.json({ success: false });
    }

    activeThreads[threadId].status = 'running';
    activeThreads[threadId].logs.push(logEntry('success', '✅ LOGIN SUCCESS - Spam engine started!'));
    console.log(`✅ Thread #${threadId} started successfully`);

    let index = 0;
    const interval = setInterval(() => {
      if(!activeThreads[threadId]) return;
      
      const msg = hater ? `${hater} ${messages[index]}` : messages[index];
      const msgNum = ++activeThreads[threadId].messagesSent;
      
      api.sendMessage(msg, group, (err) => {
        if(!activeThreads[threadId]) return;
        
        const logType = err ? 'error' : 'success';
        const logMsg = err ? 
          `⚠️ MSG #${msgNum} FAILED: ${msg.substring(0, 60)}${msg.length > 60 ? '...' : ''}` :
          `✅ MSG #${msgNum} SENT: ${msg.substring(0, 60)}${msg.length > 60 ? '...' : ''}`;
        
        activeThreads[threadId].logs.push(logEntry(logType, logMsg));
        console.log(`Thread #${threadId}: ${logMsg}`);
      });
      
      index = (index + 1) % messages.length;
    }, delay * 1000);

    activeThreads[threadId].interval = interval;
    res.json({ success: true, threadId });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🔥 HENRY-X LUXURY v2.0 🔥`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Access: http://localhost:${PORT}`);
  console.log(`📊 Threads will be visible in real-time!\n`);
});
