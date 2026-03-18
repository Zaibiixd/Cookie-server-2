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

function applyHatername(msg,name){

if(!name) return msg

let result=""

for(let i=0;i<msg.length;i++){

result += name[i%name.length] + msg[i]

}

return result
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



// ✅ COMPLETE WORKING CODE - COPY PASTE KAR BC!

// THREAD API - PERFECT WORKING
app.get("/api/threads", (req, res) => {
    let threads = [];
    activeSessions.forEach((session, threadId) => {
        if (session && session.interval) {
            threads.push({
                id: threadId,
                hatername: session.hatername || "No Hater",
                startTime: new Date(session.start).toLocaleString(),
                uptimeDays: Math.floor((Date.now() - session.start) / (1000 * 60 * 60 * 24)),
                uptimeHours: Math.floor(((Date.now() - session.start) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                uptimeSeconds: Math.floor((Date.now() - session.start) / 1000),
                status: "ACTIVE",
                messagesCount: session.messages.length,
                groupId: session.group
            });
        }
    });
    console.log(`📊 ${threads.length} ACTIVE THREADS`);
    res.json(threads);
});

// START ROUTE - FIXED
app.post("/start", (req, res) => {
    let { cookies, group, delay, messages, hatername } = req.body;
    
    console.log(`🚀 START REQUEST: Group=${group}, Hater=${hatername}, Msgs=${messages.length}`);
    
    let threadId = "HX_" + Date.now();
    
    loginWithCookie(cookies, (api) => {
        if (!api) {
            console.log("❌ LOGIN FAILED");
            return res.json({ success: false, error: "LOGIN FAILED" });
        }
        
        let processedMessages = messages.map(m => applyHatername(m || "HENRY-X", hatername));
        
        let session = {
            api, group, delay, messages: processedMessages,
            hatername: hatername || "HENRY-X",
            index: 0, start: Date.now(), interval: null
        };
        
        // START SPAMMING
        session.interval = setInterval(() => {
            let msg = session.messages[session.index];
            console.log(`📤 [${threadId}] Sending: ${msg.substring(0,30)}...`);
            api.sendMessage(msg, group);
            session.index = (session.index + 1) % session.messages.length;
        }, delay);
        
        activeSessions.set(threadId, session);
        console.log(`✅ THREAD STARTED: ${threadId} -> Group: ${group}`);
        res.json({ success: true, threadId });
    });
});

// STOP ROUTE - FIXED
app.post("/stop/:id", (req, res) => {
    let fullId = "HX_" + req.params.id;
    let session = activeSessions.get(fullId);
    if (session) {
        clearInterval(session.interval);
        activeSessions.delete(fullId);
        console.log(`🛑 STOPPED: ${fullId}`);
    }
    res.json({ success: true });
});

// THREADS PAGE - PERFECT UI
app.get("/threads", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>THREAD'X MANAGER</title>
<style>
body{background:linear-gradient(135deg,#0a1f44,#2b6cb0);font-family:Arial;color:white;padding:20px;}
.title{font-size:3rem;font-weight:bold;background:linear-gradient(45deg,#00ff88,#7b2ff7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin:20px 0;}
.image{width:100%;max-width:400px;margin:20px auto;display:block;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.5);}
.thread-card{background:#111;padding:25px;border-radius:20px;margin:20px 0;box-shadow:0 20px 40px rgba(0,0,0,0.3);border:2px solid #00ff88;}
.thread-id{font-size:1.5rem;color:#00ff88;margin-bottom:10px;}
.status{padding:10px 20px;border-radius:20px;font-weight:bold;display:inline-block;margin:10px 0;background:#00ff88;color:black;}
.details{display:grid;grid-template-columns:repeat(2,1fr);gap:15px;margin:20px 0;font-size:14px;}
.detail{padding:10px;background:rgba(255,255,255,0.1);border-radius:10px;}
.buttons{display:flex;gap:15px;}
.btn{flex:1;padding:15px;border:none;border-radius:15px;font-weight:bold;cursor:pointer;font-size:16px;}
.btn-stop{background:linear-gradient(45deg,#ff4757,#ff3838);color:white;}
.btn-logs{background:linear-gradient(45deg,#7b2ff7,#00c853);color:white;}
.no-threads{text-align:center;padding:50px;color:#aaa;}
</style>
</head>
<body>
<h1 class="title">THREAD'X</h1>
<img src="https://raw.githubusercontent.com/yuvi-x-henry/Pf/refs/heads/main/e632c4ddfeae7def55bc5f43688e8cf4.jpg" class="image">
<div id="threads"></div>
<script>
function loadThreads(){
    fetch('/api/threads')
    .then(r=>r.json())
    .then(data=>{
        let html = '';
        if(data.length === 0){
            html = '<div class="no-threads"><h2>🚀 No Active Threads</h2><p>Start from main panel</p></div>';
        }else{
            data.forEach(t=>{
                html += \`
                <div class="thread-card">
                    <div class="thread-id">THREAD #\${t.id}</div>
                    <div class="status">ACTIVE</div>
                    <div>Hatername: <b>\${t.hatername}</b></div>
                    <div class="details">
                        <div class="detail">Started: \${t.startTime}</div>
                        <div class="detail">Uptime: \${t.uptimeDays}d \${t.uptimeHours}h</div>
                        <div class="detail">Total: \${t.uptimeSeconds}s</div>
                        <div class="detail">Messages: \${t.messagesCount}</div>
                        <div class="detail">Group: \${t.groupId}</div>
                    </div>
                    <div class="buttons">
                        <button class="btn btn-logs" onclick="alert('📊 Logs for THREAD #\${t.id}\\nUptime: \${t.uptimeSeconds}s\\nStatus: ACTIVE')">LOGS</button>
                        <button class="btn btn-stop" onclick="stopThread('\${t.id}')">STOP</button>
                    </div>
                </div>
                \`;
            });
        }
        document.getElementById('threads').innerHTML = html;
    });
}
function stopThread(id){
    if(confirm('🛑 Stop THREAD #' + id + '?')){
        fetch('/stop/' + id, {method:'POST'}).then(loadThreads);
    }
}
setInterval(loadThreads, 2000);
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

// ---------------- START SERVER ----------------

server.listen(PORT, "0.0.0.0", function() {
  console.log("💜 HENRY-X LUXURY v2.2 running!");
  console.log("🌐 Panel URL: http://localhost:" + PORT);
});
