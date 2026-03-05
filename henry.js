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
<title>HENRY-X</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #000; color: #ff003c; font-family: sans-serif; padding: 20px; }
  .box { width: 100%; max-width: 1000px; background: #111; padding: 60px; border-radius: 40px; border: 5px solid #ff003c; box-shadow: 0 0 60px #ff003c; margin: 0 auto; }
  h1 { text-align: center; font-size: 70px; text-transform: uppercase; margin-bottom: 50px; color: #ff003c; text-shadow: 0 0 30px #ff003c; }
  textarea, input { width: 100%; font-size: 28px; padding: 30px; margin: 25px 0; background: #000; border: 4px solid #ff003c; color: #fff; border-radius: 25px; }
  button { width: 100%; font-size: 35px; padding: 35px; background: #ff003c; border: none; border-radius: 25px; color: #fff; font-weight: bold; cursor: pointer; margin: 10px 0; transition: all 0.3s; }
  button:hover { background: #ff0066; transform: scale(1.02); box-shadow: 0 0 30px #ff003c; }
  .threads-panel { display: none; background: #111; border-radius: 40px; padding: 50px; margin-top: 30px; border: 5px solid #00ff88; box-shadow: 0 0 60px #00ff88; }
  .threads-panel.active { display: block; animation: slideIn 0.5s ease-out; }
  @keyframes slideIn { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
  .thread-item { background: #222; padding: 40px; margin: 30px 0; border-radius: 25px; border: 3px solid #00ff88; box-shadow: 0 0 40px #00ff88; cursor: pointer; transition: all 0.3s; }
  .thread-item:hover { transform: scale(1.02); box-shadow: 0 0 60px #00ff88; }
  .thread-header { font-size: 32px; margin-bottom: 20px; color: #00ff88; }
  .thread-status { font-size: 24px; color: #fff; }
  .logs-panel { display: none; background: #000; border-radius: 30px; padding: 40px; margin-top: 30px; border: 4px solid #ffaa00; box-shadow: 0 0 50px #ffaa00; height: 500px; overflow-y: auto; font-size: 24px; line-height: 1.6; }
  .logs-panel.active { display: block; animation: fadeIn 0.3s ease-out; }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .log-entry { padding: 15px; margin: 10px 0; background: #111; border-radius: 15px; border-left: 5px solid #ffaa00; }
  .back-btn { background: #00ff88 !important; color: #000 !important; font-size: 28px !important; }
  img { width: 100%; height: auto; border-radius: 20px; margin: 30px 0; box-shadow: 0 0 40px #ff003c; }
</style>
</head>
<body>
<div class="box" id="mainPanel">
  <h1> HENRY-X </h1>
  <img src="https://i.imgur.com/0QlAP8b.jpeg">
  
  <textarea id="cookies" placeholder="Paste Cookie String Here..." rows="5"></textarea>
  <input id="group" placeholder="Group / Thread ID">
  <input id="hater" placeholder="Hater Name">
  <input id="delay" placeholder="Delay (Seconds)" value="10">
  <textarea id="msgs" placeholder="Messages (One per line)" rows="8"></textarea>
  <button onclick="startOperation()">🚀 START OPERATION</button>
  <button onclick="showThreads()" class="back-btn">📋 VIEW THREADS</button>
</div>

<div class="threads-panel" id="threadsPanel">
  <h1 style="font-size: 60px; text-align: center; margin-bottom: 40px;">ACTIVE THREADS</h1>
  <div id="threadsList"></div>
  <button onclick="showMain()" class="back-btn">⬅️ BACK TO MAIN</button>
</div>

<div class="logs-panel" id="logsPanel">
  <div id="logsContent"></div>
  <button onclick="showThreads()" class="back-btn">⬅️ BACK TO THREADS</button>
</div>

<script>
let currentThreadId = null;

function showMain() {
  document.getElementById('mainPanel').style.display = 'block';
  document.getElementById('threadsPanel').classList.remove('active');
  document.getElementById('logsPanel').classList.remove('active');
}

function showThreads() {
  document.getElementById('mainPanel').style.display = 'none';
  document.getElementById('threadsPanel').classList.add('active');
  document.getElementById('logsPanel').classList.remove('active');
  loadThreads();
}

function showLogs(threadId) {
  currentThreadId = threadId;
  document.getElementById('threadsPanel').classList.remove('active');
  document.getElementById('logsPanel').classList.add('active');
  loadLogs(threadId);
}

function loadThreads() {
  fetch('/threads').then(r=>r.json()).then(data => {
    const threadsList = document.getElementById('threadsList');
    threadsList.innerHTML = '';
    data.threads.forEach(thread => {
      const threadDiv = document.createElement('div');
      threadDiv.className = 'thread-item';
      threadDiv.onclick = () => showLogs(thread.id);
      threadDiv.innerHTML = \`
        <div class="thread-header">Thread #\${thread.id}</div>
        <div class="thread-status">
          Group: \${thread.group}<br>
          Status: \${thread.status}<br>
          Messages Sent: \${thread.messagesSent}<br>
          Started: \${new Date(thread.startTime).toLocaleString()}
        </div>
      \`;
      threadsList.appendChild(threadDiv);
    });
  });
}

function loadLogs(threadId) {
  fetch(\`/logs/\${threadId}\`).then(r=>r.json()).then(data => {
    const logsContent = document.getElementById('logsContent');
    logsContent.innerHTML = data.logs.map(log => 
      \`<div class="log-entry">\${log.timestamp} | \${log.message}</div>\`
    ).join('');
    logsContent.scrollTop = logsContent.scrollHeight;
  });
}

function startOperation(){
  const data = {
    cookies: document.getElementById("cookies").value,
    group: document.getElementById("group").value,
    hater: document.getElementById("hater").value,
    delay: document.getElementById("delay").value,
    messages: document.getElementById("msgs").value.split('\\n').filter(m=>m.trim())
  };
  
  fetch("/start", { 
    method:"POST", 
    headers:{"Content-Type":"application/json"}, 
    body: JSON.stringify(data) 
  })
  .then(r=>r.json()).then(d=> {
    if(d.success) {
      alert("🚀 OPERATION STARTED! Check THREADS panel for real-time logs");
      showThreads();
      setInterval(loadThreads, 2000); // Auto refresh threads
    } else {
      alert("❌ LOGIN FAILED - CHECK COOKIES!");
    }
  });
}

// Auto refresh logs when viewing
setInterval(() => {
  if(currentThreadId) loadLogs(currentThreadId);
}, 1000);
</script>
</body>
</html>
`);
});

// API endpoints for threads and logs
app.get('/threads', (req, res) => {
  res.json({ threads: Object.values(activeThreads) });
});

app.get('/logs/:threadId', (req, res) => {
  const threadId = req.params.threadId;
  const thread = activeThreads[threadId];
  if(thread && thread.logs) {
    res.json({ logs: thread.logs.slice(-50) }); // Last 50 logs
  } else {
    res.json({ logs: [] });
  }
});

app.post("/start", (req, res) => {
  const { cookies, group, delay, messages, hater } = req.body;
  
  // Create new thread
  const threadId = ++threadCounter;
  activeThreads[threadId] = {
    id: threadId,
    group,
    hater,
    delay,
    messages,
    status: 'starting',
    messagesSent: 0,
    startTime: Date.now(),
    logs: []
  };

  // Add initial log
  activeThreads[threadId].logs.push({
    timestamp: new Date().toISOString(),
    message: `🔥 Thread #${threadId} STARTED - Target: ${group}`
  });

  loginWithCookie(cookies, api => {
    if (!api) {
      activeThreads[threadId].status = 'failed';
      activeThreads[threadId].logs.push({
        timestamp: new Date().toISOString(),
        message: '❌ LOGIN FAILED - Invalid cookies!'
      });
      return res.json({ success: false });
    }

    activeThreads[threadId].status = 'running';
    activeThreads[threadId].logs.push({
      timestamp: new Date().toISOString(),
      message: '✅ LOGIN SUCCESSFUL - Spamming started!'
    });

    let index = 0;
    const interval = setInterval(() => {
      const msg = hater ? `${hater} ${messages[index]}` : messages[index];
      const currentMsgCount = ++activeThreads[threadId].messagesSent;
      
      api.sendMessage(msg, group, (err) => {
        const logMsg = err ? 
          `⚠️ Message ${currentMsgCount} FAILED: ${msg.substring(0, 50)}...` :
          `✅ Message ${currentMsgCount} SENT: ${msg.substring(0, 50)}...`;
        
        activeThreads[threadId].logs.push({
          timestamp: new Date().toISOString(),
          message: logMsg
        });
      });
      
      index = (index + 1) % messages.length;
    }, delay * 1000);

    // Store interval for potential cleanup later
    activeThreads[threadId].interval = interval;
    
    res.json({ success: true, threadId });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HENRY-X LUXURY running on port ${PORT}`);
});
