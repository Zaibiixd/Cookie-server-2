const fs = require("fs");
const path = require("path");
const express = require("express");
const http = require("http");
const fca = require("fca-mafiya");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const activeThreads = new Map();
const logs = [];

// --- MULTI-METHOD E2EE COMPATIBLE LOGIN ---
function loginWithCookie(cookieString, cb) {
  const options = { listenEvents: true, selfListen: true, forceLogin: true };
  const methods = [
    next => { try { const appState = JSON.parse(cookieString); fca.login({ appState }, options, (e, api) => next(api)); } catch { next(null); } },
    next => { fca.login({ appState: cookieString }, options, (e, api) => next(api)); },
    next => { fca.login(cookieString, options, (e, api) => next(api)); }
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
<style>
  html, body { 
    margin:0; 
    font-family: 'Arial Black', sans-serif; 
    color: #ff00ff; 
    background: linear-gradient(45deg, #ff1493, #8a2be2, #ff69b4, #9932cc); 
    background-size: 400% 400%;
    animation: gradientShift 8s ease infinite;
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .box { 
    width: 90%; 
    max-width: 900px; 
    margin: 40px auto; 
    background: linear-gradient(145deg, rgba(255,20,147,0.95), rgba(138,43,226,0.95)); 
    padding: 50px; 
    border-radius: 40px; 
    border: 6px solid #ff00ff; 
    box-shadow: 0 0 80px #ff00ff, inset 0 0 40px rgba(255,255,255,0.1); 
    backdrop-filter: blur(10px);
  }
  h1 { 
    text-align: center; 
    font-size: 60px; 
    text-transform: uppercase; 
    margin-bottom: 40px; 
    background: linear-gradient(45deg, #ff00ff, #ffff00, #00ffff); 
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 40px #ff00ff;
    animation: glow 2s ease-in-out infinite alternate;
  }
  @keyframes glow {
    from { filter: drop-shadow(0 0 10px #ff00ff); }
    to { filter: drop-shadow(0 0 30px #ff00ff); }
  }
  textarea, input { 
    width: 100%; 
    font-size: 24px; 
    padding: 25px; 
    margin: 15px 0; 
    background: rgba(0,0,0,0.8); 
    border: 4px solid #ff00ff; 
    color: #fff; 
    border-radius: 20px; 
    box-sizing: border-box; 
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(255,0,255,0.3);
  }
  textarea:focus, input:focus {
    outline: none;
    border-color: #ffff00;
    box-shadow: 0 0 30px #ff00ff;
    transform: scale(1.02);
  }
  button { 
    width: 100%; 
    font-size: 30px; 
    padding: 30px; 
    margin-top: 20px; 
    background: linear-gradient(45deg, #ff00ff, #8a2be2); 
    border: none; 
    border-radius: 20px; 
    color: #fff; 
    font-weight: 900; 
    cursor: pointer; 
    text-transform: uppercase;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(255,0,255,0.5);
  }
  button:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(255,0,255,0.8);
  }
  #threadModal, #logsModal { 
    display: none; 
    position: fixed; 
    top: 0; 
    left:0; 
    width: 100%; 
    height: 100%; 
    background: rgba(0,0,0,0.95); 
    padding: 50px; 
    overflow-y: auto; 
    z-index: 1000;
  }
  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin: 20px 0;
  }
  .status-card {
    background: linear-gradient(145deg, rgba(255,20,147,0.9), rgba(138,43,226,0.9));
    padding: 25px;
    border-radius: 20px;
    border: 3px solid #ff00ff;
    box-shadow: 0 0 30px rgba(255,0,255,0.5);
  }
  .log-entry {
    background: rgba(0,0,0,0.7);
    padding: 15px;
    margin: 10px 0;
    border-radius: 15px;
    border-left: 5px solid #ff00ff;
    font-family: monospace;
  }
</style>
</head>
<body>
<div class="box">
  <h1>⚡ HENRY-X LUXURY ⚡</h1>
  
  <div class="status-grid" id="statusGrid">
    <div class="status-card">
      <h3>🔥 LIVE STATUS</h3>
      <div id="liveStats">Active Tasks: 0 | Total Messages: 0</div>
    </div>
    <div class="status-card">
      <h3>💜 SERVER STATUS</h3>
      <div id="serverStats">Ready | Port: ${PORT}</div>
    </div>
  </div>

  <textarea id="cookies" placeholder="PASTE COOKIES..."></textarea>
  <input id="group" placeholder="GROUP / E2EE THREAD ID">
  <input id="hater" placeholder="HATER NAME">
  <input id="delay" placeholder="DELAY (seconds)" value="10">
  <textarea id="msgs" placeholder="MESSAGES (ONE PER LINE)" rows="6"></textarea>
  
  <button onclick="start()">🚀 START OPERATION</button>
  <button onclick="showThreads()" style="background: linear-gradient(45deg, #ff69b4, #9932cc);">📋 VIEW ACTIVE THREADS</button>
  <button onclick="showLogs()" style="background: linear-gradient(45deg, #ff1493, #8a2be2);">📊 LIVE LOGS</button>
  <button onclick="stopAll()" style="background: linear-gradient(45deg, #ff0000, #cc0000);">🛑 STOP ALL</button>
</div>

<div id="threadModal">
  <h1 style="color:#ff00ff">⚡ ACTIVE SESSIONS</h1>
  <div id="threadList" style="color:#ff00ff; font-size:20px"></div>
  <button onclick="document.getElementById('threadModal').style.display='none'" style="background:#550000;">CLOSE</button>
</div>

<div id="logsModal">
  <h1 style="color:#ff00ff">📊 LIVE LOGS</h1>
  <div id="logList"></div>
  <button onclick="document.getElementById('logsModal').style.display='none'" style="background:#550000;">CLOSE</button>
</div>

<script>
let totalMessages = 0;
let activeCount = 0;

function updateStats() {
  fetch('/stats').then(r=>r.json()).then(data => {
    document.getElementById('liveStats').innerHTML = 
      `Active Tasks: ${data.active} | Total Messages: ${data.total} | Uptime: ${data.uptime}`;
    document.getElementById('serverStats').innerHTML = 
      `Running | Active: ${data.active} | Port: ${PORT}`;
    activeCount = data.active;
    totalMessages = data.total;
  });
}

setInterval(updateStats, 2000);
updateStats();

async function showThreads(){
  const r = await fetch("/threads");
  const data = await r.json();
  document.getElementById('threadList').innerHTML = data.map(t => 
    `<div class="status-card">
      <p><strong>⚡ ID:</strong> ${t.id}</p>
      <p><strong>🎯 Target:</strong> ${t.group}</p>
      <p><strong>⏱️ Delay:</strong> ${t.delay}s</p>
      <button onclick="stopThread('${t.id}')" style="background:#ff0000; font-size:16px; padding:10px;">STOP</button>
    </div>`
  ).join('') || '<p style="color:#ff69b4">No active threads...</p>';
  document.getElementById('threadModal').style.display = 'block';
}

async function showLogs(){
  const r = await fetch("/logs");
  const data = await r.json();
  document.getElementById('logList').innerHTML = data.map(log => 
    `<div class="log-entry">${new Date(log.time).toLocaleTimeString()}: ${log.message}</div>`
  ).join('');
  document.getElementById('logsModal').style.display = 'block';
}

async function stopThread(threadId) {
  await fetch("/stop", { 
    method: "POST", 
    headers: {"Content-Type": "application/json"}, 
    body: JSON.stringify({threadId}) 
  });
  showThreads();
}

async function stopAll() {
  await fetch("/stop-all", { method: "POST" });
  alert("All operations stopped!");
  showThreads();
}

async function start(){
  const data = { 
    cookies: cookies.value, 
    group: group.value, 
    hater: hater.value, 
    delay: parseInt(delay.value) || 10, 
    messages: msgs.value.split('\\n').filter(m=>m.trim()) 
  };
  try {
    const r = await fetch("/start", { 
      method:"POST", 
      headers:{"Content-Type":"application/json"}, 
      body: JSON.stringify(data) 
    });
    const result = await r.json();
    if(result.success) {
      alert("🚀 Started! ID: " + result.threadId);
    } else {
      alert("❌ Login failed! Check cookies.");
    }
  } catch(e) {
    alert("❌ Error: " + e.message);
  }
}
</script>
</body>
</html>
`);
});

// Stats endpoint
app.get("/stats", (req, res) => {
  let totalMsg = 0;
  activeThreads.forEach(data => totalMsg += (data.msgCount || 0));
  res.json({
    active: activeThreads.size,
    total: totalMsg,
    uptime: process.uptime().toFixed(0) + 's'
  });
});

// Live logs endpoint
app.get("/logs", (req, res) => {
  res.json(logs.slice(-50)); // Last 50 logs
});

app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hater } = req.body;
  
  logs.push({ time: Date.now(), message: `🚀 Starting new operation for group: ${group}` });
  
  loginWithCookie(cookies, api => {
    if (!api) {
      logs.push({ time: Date.now(), message: `❌ Login failed for group: ${group}` });
      return res.json({ success: false });
    }
    
    const threadId = "HX_" + Date.now();
    let msgCount = 0;
    
    const interval = setInterval(() => {
      const msg = hater ? `${hater} ${messages[Math.floor(Math.random() * messages.length)]}` : 
                          messages[Math.floor(Math.random() * messages.length)];
      
      api.sendMessage({ body: msg }, group, (err, info) => {
        if (err) {
          logs.push({ time: Date.now(), message: `❌ Error in ${threadId}: ${err.message}` });
          console.error("E2EE Send Error:", err);
        } else {
          msgCount++;
          logs.push({ time: Date.now(), message: `✅ ${threadId} -> ${group}: ${msg.substring(0,50)}...` });
        }
      });
    }, delay * 1000);
    
    activeThreads.set(threadId, { 
      group, 
      interval, 
      delay,
      msgCount: 0,
      api,
      hater 
    });
    
    logs.push({ time: Date.now(), message: `⚡ ${threadId} started - Target: ${group} (Delay: ${delay}s)` });
    res.json({ success: true, threadId });
  });
});

app.get("/threads", (req, res) => {
  const list = Array.from(activeThreads.entries()).map(([id, d]) => ({
    id, 
    group: d.group,
    delay: d.delay
  }));
  res.json(list);
});

app.post("/stop", (req, res) => {
  const { threadId } = req.body;
  const thread = activeThreads.get(threadId);
  if (thread) {
    clearInterval(thread.interval);
    thread.api.logout(() => {});
    activeThreads.delete(threadId);
    logs.push({ time: Date.now(), message: `🛑 Stopped ${threadId} - Target: ${thread.group}` });
  }
  res.json({ success: true });
});

app.post("/stop-all", (req, res) => {
  activeThreads.forEach((thread, id) => {
    clearInterval(thread.interval);
    thread.api.logout(() => {});
  });
  activeThreads.clear();
  logs.push({ time: Date.now(), message: `💥 ALL OPERATIONS STOPPED` });
  res.json({ success: true });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HENRY-X LUXURY running on port ${PORT}`);
  logs.push({ time: Date.now(), message: `🎉 Server started on port ${PORT}` });
});
