// ===============================
// ⚡ HENRY-X LUXURY SERVER v3.0 ⚡
// Thread Manager + Luxury Panel
// ===============================

const fs = require("fs")
const path = require("path")
const express = require("express")
const http = require("http")
const WebSocket = require("ws")
const fca = require("fca-mafiya")

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// ---------------- WEBSOCKET ----------------

const wss = new WebSocket.Server({server})

function broadcast(data){
wss.clients.forEach(c=>{
if(c.readyState===WebSocket.OPEN){
c.send(JSON.stringify(data))
}
})
}

wss.on("connection",ws=>{
ws.send(JSON.stringify({message:"💜 HENRY-X Connected"}))
})

// ---------------- THREAD STORE ----------------

const activeSessions = new Map()

// ---------------- LOGIN ----------------

function loginWithCookie(cookie,cb){

try{

const appState = JSON.parse(cookie)

fca.login({appState},(err,api)=>{
if(err) return cb(null)
cb(api)
})

}catch(e){

fca.login(cookie,{},(err,api)=>{
if(err) return cb(null)
cb(api)
})

}

}

// ---------------- HATERNAME ----------------

function applyHatername(msg, name) {
    if (!name || !msg) return msg || "HENRY-X";
    
    // OPTION 1: PREFIX STYLE (RECOMMENDED)
    return `${name.toUpperCase()}: ${msg}`;
    
    // OPTION 2: INTERLEAVE STYLE (UNCOMMENT if you want mixed)
    // let result = "";
    // let nameLen = name.length;
    // for (let i = 0; i < msg.length; i++) {
    //     result += name[i % nameLen] + msg[i];
    // }
    // return result;
}

// ---------------- MAIN PANEL ----------------

app.get("/",(req,res)=>{

res.send(`

<!DOCTYPE html>
<html>

<head>

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>HENRY-X PANEL</title>

<style>

body{
background:linear-gradient(to top,#0a1f44,#2b6cb0);
font-family:Arial;
display:flex;
justify-content:center;
align-items:center;
min-height:100vh;
color:white;
}

.box{
width:350px;
background:#0b1c38;
padding:20px;
border-radius:20px;
}

img{
width:100%;
border-radius:20px;
margin-bottom:20px;
}

input,textarea{
width:100%;
padding:12px;
border:none;
border-radius:10px;
margin-bottom:10px;
background:#111;
color:white;
}

button{
width:100%;
padding:14px;
border:none;
border-radius:12px;
margin-top:12px;
font-weight:bold;
font-size:16px;
color:white;
background:linear-gradient(90deg,#7b2ff7,#00c853);
position:relative;
overflow:hidden;
}

#threadBtn::before{
content:'';
position:absolute;
top:0;
left:0;
height:100%;
width:0%;
background:#00ff88;
transition:width 3s linear;
z-index:0;
}

#threadBtn span{
position:relative;
z-index:1;
}

.title{
text-align:center;
font-size:38px;
font-weight:bold;
margin-bottom:20px;
letter-spacing:2px;
}
</style>

</head>

<body>

<div class="box">

<img src="https://raw.githubusercontent.com/yuvi-x-henry/Pf/refs/heads/main/e632c4ddfeae7def55bc5f43688e8cf4.jpg">

<h1 class="title">COOKIE'X</h1>

<textarea id="cookies" placeholder="Cookies"></textarea>

<input id="group" placeholder="Thread ID">

<input id="delay" value="10">

<input id="hater" placeholder="Hatername">

<textarea id="messages" placeholder="Messages (line by line)"></textarea>

<button onclick="startBot()">START SPAM</button>

<button id="threadBtn" onclick="openThreads()">
<span>THREAD'X</span>
</button>

</div>

<script>

function startBot(){

let cookies=document.getElementById("cookies").value
let group=document.getElementById("group").value
let delay=document.getElementById("delay").value
let messages=document.getElementById("messages").value.split("\\n")
let hater=document.getElementById("hater").value

fetch("/start",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({

cookies:cookies,

group:group,

delay:delay*1000,

messages:messages,

hatername:hater

})

})

}

function openThreads(){

let btn=document.getElementById("threadBtn")

btn.querySelector("span").innerText="LOADING..."

btn.style.pointerEvents="none"

btn.querySelector("span").style.color="black"

btn.style.background="#7b2ff7"

btn.querySelector("span").style.fontWeight="bold"

btn.style.position="relative"

btn.style.overflow="hidden"

btn.style.background="linear-gradient(90deg,#7b2ff7,#00c853)"

btn.style.color="white"

btn.style.setProperty("--width","100%")

btn.querySelector("span").style.zIndex="2"

btn.style.setProperty("width","100%")

btn.style.setProperty("transition","3s")

btn.style.setProperty("background","#00ff88")

setTimeout(()=>{

location="/threads"

},3000)

}
</script>

</body>
</html>

`)

})

// ---------------- THREAD PAGE ----------------

// 🔥 BULLETPROOF v2 - ERROR-PROOF 🔥
const SESSIONS_FILE = './persistent_sessions.json';
const THREAD_LOGS_DIR = './thread_logs';

if (!fs.existsSync(THREAD_LOGS_DIR)) fs.mkdirSync(THREAD_LOGS_DIR);

function loadPersistentSessions() {
    try {
        if (fs.existsSync(SESSIONS_FILE)) {
            return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
        }
    } catch(e) {}
    return {};
}

function savePersistentSessions(sessions) {
    try {
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
    } catch(e) {}
}

let persistentSessions = loadPersistentSessions();
const threadLogs = new Map();

function restoreSessions() {
    Object.entries(persistentSessions).forEach(([threadId, sessionData]) => {
        if (sessionData.cookies && sessionData.group) {
            loginWithCookie(sessionData.cookies, (api) => {
                if (api) {
                    let session = {
                        api, group: sessionData.group, delay: sessionData.delay || 10000,
                        messages: sessionData.messages, hatername: sessionData.hatername,
                        index: sessionData.index || 0, start: sessionData.start || Date.now()
                    };
                    session.interval = setInterval(() => runMessageLoop(session, threadId), session.delay);
                    activeSessions.set(threadId, session);
                    console.log(`✅ RESTORED: ${threadId}`);
                }
            });
        }
    });
}

function runMessageLoop(session, threadId) {
    if (!session || !session.messages || session.index === undefined) return;
    
    let msg = session.messages[session.index];
    let logId = session.index + 1;
    
    try {
        if (!session.api || typeof session.api.sendMessage !== 'function') {
            addLog(threadId, `#${logId} API DEAD ❌ RESTART NEEDED`);
            return;
        }
        session.api.sendMessage(msg, session.group);
        addLog(threadId, `#${logId} SENT ✅ "${msg.substring(0,30)}..."`);
    } catch (error) {
        addLog(threadId, `#${logId} ERROR ❌ ${error.message}`);
    }
    
    session.index = (session.index + 1) % session.messages.length;
    persistentSessions[threadId] = { 
        ...session, interval: null, cookies: persistentSessions[threadId]?.cookies 
    };
    savePersistentSessions(persistentSessions);
}

function addLog(threadId, log) {
    let logs = threadLogs.get(threadId) || [];
    logs.push(`${new Date().toLocaleTimeString()} | ${log}`);
    threadLogs.set(threadId, logs.slice(-1000));
    
    try {
        let logFile = path.join(THREAD_LOGS_DIR, `${threadId}.json`);
        fs.writeFileSync(logFile, JSON.stringify(logs.slice(-1000)));
    } catch(e) {}
}

// APIs WITH ERROR HANDLING
app.get("/api/threads", (req, res) => {
    try {
        let threads = [];
        activeSessions.forEach((session, threadId) => {
            if (session) {
                let logs = threadLogs.get(threadId) || [];
                threads.push({
                    id: threadId, hatername: session.hatername || "Unknown",
                    startTime: new Date(session.start || Date.now()).toLocaleString(),
                    uptimeDays: Math.floor((Date.now() - (session.start || Date.now())) / (1000*60*60*24)),
                    uptimeHours: Math.floor(((Date.now() - (session.start || Date.now())) % (1000*60*60*24)) / (1000*60*60)),
                    uptimeSeconds: Math.floor((Date.now() - (session.start || Date.now())) / 1000),
                    status: session.interval ? "ACTIVE" : "STOPPED",
                    messagesCount: session.messages?.length || 0,
                    sentCount: logs.filter(l => l.includes("SENT ✅")).length,
                    totalLogs: logs.length, 
                    groupId: session.group || "Unknown",
                    latestLog: logs[logs.length-1]?.substring(0,50) || "No logs"
                });
            }
        });
        res.json(threads);
    } catch(e) {
        res.json([]);
    }
});

app.get("/api/logs/:id", (req, res) => {
    try {
        let threadId = req.params.id;
        let logFile = path.join(THREAD_LOGS_DIR, `${threadId}.json`);
        let logs = [];
        if (fs.existsSync(logFile)) {
            logs = JSON.parse(fs.readFileSync(logFile));
        } else {
            logs = threadLogs.get(threadId) || [];
        }
        res.json({ logs: logs.slice(-50) });
    } catch(e) {
        res.json({ logs: [] });
    }
});

// [BAKI ROUTES SAME - /start, /restart, /stop, /delete WALE SAME RAHO]

// START ROUTE - BULLETPROOF
app.post("/start", (req, res) => {
    let { cookies, group, delay, messages, hatername } = req.body;
    let threadId = "HX_" + Date.now();
    
    loginWithCookie(cookies, (api) => {
        if (!api) return res.json({ success: false, error: "LOGIN FAILED" });
        
        let processedMessages = messages.map(m => applyHatername(m || "HENRY-X", hatername));
        let session = {
            api, group, delay, messages: processedMessages, hatername,
            index: 0, start: Date.now()
        };
        
        session.interval = setInterval(() => runMessageLoop(session, threadId), delay);
        
        activeSessions.set(threadId, session);
        persistentSessions[threadId] = { ...session, cookies, interval: null };
        savePersistentSessions(persistentSessions);
        addLog(threadId, `#0 THREAD STARTED FOREVER ✅ Group: ${group}`);
        
        res.json({ success: true, threadId });
    });
});

// RESTART ROUTE
app.post("/restart/:id", (req, res) => {
    let threadId = req.params.id;
    let sessionData = persistentSessions[threadId];
    if (sessionData) {
        loginWithCookie(sessionData.cookies, (api) => {
            if (api) {
                let session = { ...sessionData, api, interval: null };
                session.interval = setInterval(() => runMessageLoop(session, threadId), session.delay);
                activeSessions.set(threadId, session);
                addLog(threadId, `🔄 RESTARTED ✅`);
                res.json({ success: true });
            } else {
                res.json({ success: false, error: "LOGIN FAILED" });
            }
        });
    } else {
        res.json({ success: false });
    }
});

app.post("/stop/:id", (req, res) => {
    let threadId = req.params.id;
    let session = activeSessions.get(threadId);
    if (session) {
        clearInterval(session.interval);
        activeSessions.delete(threadId);
    }
    addLog(threadId, `🛑 STOPPED`);
    res.json({ success: true });
});

app.post("/delete/:id", (req, res) => {
    let threadId = req.params.id;
    let session = activeSessions.get(threadId);
    if (session) clearInterval(session.interval);
    
    activeSessions.delete(threadId);
    threadLogs.delete(threadId);
    delete persistentSessions[threadId];
    let logFile = path.join(THREAD_LOGS_DIR, `${threadId}.json`);
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    savePersistentSessions(persistentSessions);
    res.json({ success: true });
});


// THREADS PAGE - ULTIMATE UI WITH REAL-TIME LOGS & DELETE
app.get("/threads", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>THREAD'X MANAGER - LIVE LOGS</title>
<style>
body{background:linear-gradient(135deg,#0a1f44,#2b6cb0);font-family:Arial;color:white;padding:20px;}
.title{font-size:3rem;font-weight:bold;background:linear-gradient(45deg,#00ff88,#7b2ff7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin:20px 0;}
.image{width:100%;max-width:400px;margin:20px auto;display:block;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.5);}
.thread-card{background:#111;padding:25px;border-radius:20px;margin:20px 0;box-shadow:0 20px 40px rgba(0,0,0,0.3);border:2px solid #00ff88;}
.thread-id{font-size:1.5rem;color:#00ff88;margin-bottom:10px;}
.status{padding:10px 20px;border-radius:20px;font-weight:bold;display:inline-block;margin:10px 0;}
.status-active{background:#00ff88;color:black;}
.status-inactive{background:#ff4757;color:white;}
.details{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin:20px 0;font-size:14px;}
.detail{padding:10px;background:rgba(255,255,255,0.1);border-radius:10px;}
.stats-row{display:flex;gap:15px;margin:15px 0;}
.stat-box{flex:1;padding:12px;text-align:center;background:rgba(0,255,136,0.2);border-radius:10px;border:1px solid #00ff88;}
.latest-log{padding:12px;background:rgba(255,255,255,0.05);border-radius:10px;margin:10px 0;font-family:monospace;font-size:12px;max-height:60px;overflow-y:auto;}
.buttons{display:flex;flex-wrap:wrap;gap:10px;}
.btn{flex:1;padding:12px;border:none;border-radius:15px;font-weight:bold;cursor:pointer;font-size:14px;min-width:100px;}
.btn-stop{background:linear-gradient(45deg,#ff4757,#ff3838);color:white;}
.btn-logs{background:linear-gradient(45deg,#7b2ff7,#00c853);color:white;}
.btn-delete{background:linear-gradient(45deg,#ff6b6b,#ee5a52);color:white;}
.log-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:none;z-index:1000;overflow-y:auto;}
.log-content{background:#111;max-width:800px;margin:50px auto;padding:30px;border-radius:20px;border:2px solid #00ff88;}
.log-lines{max-height:500px;overflow-y:auto;background:#000;padding:20px;border-radius:10px;font-family:monospace;font-size:13px;line-height:1.5;}
.log-line-success{color:#00ff88;}
.log-line-error{color:#ff4757;}
.close-btn{padding:10px 20px;background:#00ff88;color:black;border:none;border-radius:10px;cursor:pointer;font-weight:bold;}
.no-threads{text-align:center;padding:50px;color:#aaa;}
</style>
</head>
<body>
<h1 class="title">THREAD'X LIVE MANAGER</h1>
<img src="https://raw.githubusercontent.com/yuvi-x-henry/Pf/refs/heads/main/e632c4ddfeae7def55bc5f43688e8cf4.jpg" class="image">
<div id="threads"></div>

<!-- LIVE LOGS MODAL -->
<div id="logModal" class="log-modal">
    <div class="log-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h2 id="logTitle" style="margin:0;color:#00ff88;">LIVE LOGS</h2>
            <button class="close-btn" onclick="closeLogs()">CLOSE</button>
        </div>
        <div id="logLines" class="log-lines"></div>
    </div>
</div>


<script>
let currentThreadId = null;
function loadThreads(){
    fetch('/api/threads')
    .then(r=>r.json())
    .then(data=>{
        let html = '';
        if(data.length === 0){
            html = '<div class="no-threads"><h2>🚀 No Active Threads</h2><p>Start from main panel</p></div>';
        }else{
            data.forEach(t=>{
                let statusClass = t.status === 'ACTIVE' ? 'status-active' : 'status-inactive';
                let statusText = t.status === 'ACTIVE' ? 'ACTIVE' : 'PERSISTENT';  // ✅ FIXED
                html += `
                <div class="thread-card">
                    <div class="thread-id">THREAD #${t.id}</div>
                    <div class="status ${statusClass}">${statusText}</div>
                    <div>Hatername: <b>${t.hatername}</b></div>
                    <div class="stats-row">
                        <div class="stat-box">
                            <div style="font-size:20px;color:#00ff88">${t.sentCount}</div>
                            <div>SENT</div>
                        </div>
                        <div class="stat-box">
                            <div style="font-size:20px;color:#7b2ff7">${t.totalLogs}</div>
                            <div>TOTAL</div>
                        </div>
                        <div class="stat-box">
                            <div style="font-size:20px">${t.uptimeDays}d ${t.uptimeHours}h</div>
                            <div>UPTIME</div>
                        </div>
                    </div>
                    <div class="details">
                        <div class="detail">Started: ${t.startTime}</div>
                        <div class="detail">Messages: ${t.messagesCount}</div>
                        <div class="detail">Group: ${t.groupId}</div>
                        <div class="detail">Uptime: ${t.uptimeSeconds}s</div>
                    </div>
                    <div class="latest-log">Latest: ${t.latestLog}</div>
                    <div class="buttons">
                        <button class="btn btn-logs" onclick="showLogs('${t.id}')">📊 LIVE LOGS</button>
                        <button class="btn" style="background:linear-gradient(45deg,#ffaa00,#ff8800);color:white;" onclick="restartThread('${t.id}')">🔄 RESTART</button>
                        <button class="btn btn-stop" onclick="stopThread('${t.id}')">🛑 STOP</button>
                        <button class="btn btn-delete" onclick="deleteThread('${t.id}')">💀 DELETE</button>
                    </div>
                </div>
                `;
            });
        }
        document.getElementById('threads').innerHTML = html;
    });
}

function showLogs(id){
    currentThreadId = id;
    document.getElementById('logTitle').textContent = 'LIVE LOGS - THREAD #' + id;
    document.getElementById('logModal').style.display = 'block';
    loadLiveLogs();
}

function loadLiveLogs(){
    if(!currentThreadId) return;
    fetch('/api/logs/' + currentThreadId)
    .then(r=>r.json())
    .then(data=>{
        let html = '';
        data.logs.forEach(log=>{
            let className = log.includes('SENT') ? 'log-line-success' : 
                           log.includes('ERROR') ? 'log-line-error' : '';
            html += '<div class="' + className + '">' + log + '</div>';
        });
        document.getElementById('logLines').innerHTML = html;
        document.getElementById('logLines').scrollTop = document.getElementById('logLines').scrollHeight;
    });
}

function restartThread(id){
    if(confirm('🔄 RESTART THREAD #' + id + '?')){
        fetch('/restart/' + id, {method:'POST'})
        .then(r=>r.json())
        .then(data=>{
            if(data.success) alert('✅ RESTARTED!');
            else alert('❌ Failed to restart');
            loadThreads();
        });
    }
}

function stopThread(id){
    if(confirm('🛑 Stop THREAD #' + id + '?')){
        fetch('/stop/' + id, {method:'POST'}).then(loadThreads);
    }
}

function deleteThread(id){
    if(confirm('💀 DELETE THREAD #' + id + '?')){
        fetch('/delete/' + id, {method:'POST'}).then(loadThreads);
    }
}

function closeLogs(){
    document.getElementById('logModal').style.display = 'none';
    currentThreadId = null;
}

setInterval(loadThreads, 2000);
setInterval(()=>{if(currentThreadId) loadLiveLogs();}, 1000);
loadThreads();
</script>
</body>
</html>
    `);
});
// ---------------- START BOT ----------------

app.post("/start",(req,res)=>{

let {cookies,group,delay,messages,hatername}=req.body

let id="HX_"+Date.now()

loginWithCookie(cookies,(api)=>{

if(!api){

res.json({success:false})

return

}

let session={

api:api,

group:group,

delay:delay,

messages:messages.map(m=>applyHatername(m,hatername)),

index:0,

start:Date.now()

}

session.interval=setInterval(()=>{

let msg=session.messages[session.index]

api.sendMessage(msg,group)

session.index=(session.index+1)%session.messages.length

},delay)

activeSessions.set(id,session)

res.json({success:true})

})

})

// ---------------- STOP THREAD ----------------

app.post("/stop/:id",(req,res)=>{

let id=req.params.id

let s=activeSessions.get(id)

if(s){

clearInterval(s.interval)

activeSessions.delete(id)

}

res.json({success:true})

})

restoreSessions();
setInterval(() => savePersistentSessions(persistentSessions), 30000);

// ---------------- START SERVER ----------------

server.listen(PORT, "0.0.0.0", function() {
  console.log("💜 HENRY-X LUXURY v2.2 running!");
  console.log("🌐 Panel URL: http://localhost:" + PORT);
});
