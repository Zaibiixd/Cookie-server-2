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



app.get("/threads",(req,res)=>{

res.send(`

<!DOCTYPE html>
<html>

<head>

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>THREAD'X MANAGER</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
background:linear-gradient(135deg,#0a1f44 0%,#2b6cb0 50%,#1e3a8a 100%);
font-family:'Arial',sans-serif;
color:white;
min-height:100vh;
padding:20px;
overflow-x:hidden;
}

.header{
text-align:center;
margin-bottom:40px;
}

.title{
font-size:clamp(2.5rem,8vw,4rem);
font-weight:900;
background:linear-gradient(45deg,#00ff88,#7b2ff7,#00c853);
-webkit-background-clip:text;
background-clip:text;
-webkit-text-fill-color:transparent;
text-shadow:0 0 30px rgba(0,255,136,0.5);
letter-spacing:3px;
margin-bottom:10px;
animation:pulse 2s infinite;
}

@keyframes pulse{
0%,100%{transform:scale(1);}
50%{transform:scale(1.05);}
}

.image-card{
max-width:500px;
margin:0 auto 40px;
background:linear-gradient(145deg,#0b1c38,#1a2d5a);
padding:25px;
border-radius:25px;
box-shadow:0 25px 50px rgba(0,0,0,0.5);
backdrop-filter:blur(10px);
border:1px solid rgba(255,255,255,0.1);
}

.thread-image{
width:100%;
height:250px;
object-fit:cover;
border-radius:20px;
box-shadow:0 20px 40px rgba(0,123,255,0.3);
transition:transform 0.3s ease;
}

.thread-image:hover{
transform:scale(1.05);
}

.threads-container{
max-width:800px;
margin:0 auto;
}

.thread-card{
background:linear-gradient(145deg,#111827,#1f2937);
margin-bottom:25px;
padding:30px;
border-radius:25px;
box-shadow:0 20px 60px rgba(0,0,0,0.4);
border:1px solid rgba(120,119,198,0.2);
position:relative;
overflow:hidden;
transition:all 0.3s ease;
}

.thread-card::before{
content:'';
position:absolute;
top:0;
left:0;
right:0;
height:4px;
background:linear-gradient(90deg,#7b2ff7,#00c853,#00ff88);
}

.thread-card:hover{
transform:translateY(-10px);
box-shadow:0 30px 80px rgba(123,47,247,0.3);
}

.thread-title{
font-size:2rem;
font-weight:900;
background:linear-gradient(45deg,#7b2ff7,#00c853);
-webkit-background-clip:text;
background-clip:text;
-webkit-text-fill-color:transparent;
margin-bottom:15px;
letter-spacing:1px;
}

.status-badge{
display:inline-block;
padding:8px 20px;
border-radius:50px;
font-weight:bold;
font-size:14px;
text-transform:uppercase;
letter-spacing:1px;
margin-bottom:20px;
}

.active{
background:linear-gradient(90deg,#00ff88,#00c851);
color:black;
box-shadow:0 0 20px rgba(0,255,136,0.5);
animation:glow 2s infinite;
}

.inactive{
background:linear-gradient(90deg,#ff4757,#ff3838);
color:white;
box-shadow:0 0 15px rgba(255,71,87,0.4);
}

@keyframes glow{
0%,100%{box-shadow:0 0 20px rgba(0,255,136,0.5);}
50%{box-shadow:0 0 30px rgba(0,255,136,0.8);}
}

.details-grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
gap:15px;
margin-bottom:25px;
}

.detail-item{
background:rgba(255,255,255,0.05);
padding:15px;
border-radius:15px;
text-align:center;
backdrop-filter:blur(10px);
border:1px solid rgba(255,255,255,0.1);
}

.detail-label{
font-size:12px;
color:#a0a0a0;
text-transform:uppercase;
letter-spacing:1px;
margin-bottom:5px;
}

.detail-value{
font-size:1.2rem;
font-weight:bold;
color:#00ff88;
}

.buttons{
display:flex;
gap:15px;
}

.btn{
flex:1;
padding:18px 25px;
border:none;
border-radius:15px;
font-weight:bold;
font-size:16px;
cursor:pointer;
position:relative;
overflow:hidden;
transition:all 0.3s ease;
text-transform:uppercase;
letter-spacing:1px;
}

.btn::before{
content:'';
position:absolute;
top:0;
left:-100%;
width:100%;
height:100%;
background:linear-gradient(90deg,transparent, rgba(255,255,255,0.3),transparent);
transition:left 0.5s;
}

.btn:hover::before{
left:100%;
}

.btn-logs{
background:linear-gradient(45deg,#7b2ff7,#00c853);
color:white;
box-shadow:0 10px 30px rgba(123,47,247,0.4);
}

.btn-logs:hover{
transform:translateY(-3px);
box-shadow:0 15px 40px rgba(123,47,247,0.6);
}

.btn-stop{
background:linear-gradient(45deg,#ff4757,#ff3838);
color:white;
box-shadow:0 10px 30px rgba(255,71,87,0.4);
}

.btn-stop:hover{
transform:translateY(-3px);
box-shadow:0 15px 40px rgba(255,71,87,0.6);
}

.refresh-info{
text-align:center;
margin-top:30px;
padding:15px;
background:rgba(255,255,255,0.05);
border-radius:15px;
font-size:14px;
color:#a0a0a0;
}

@media (max-width:768px){
.buttons{
flex-direction:column;
}

.threads-container{
padding:0 10px;
}
}

</style>

</head>

<body>

<div class="header">
<h1 class="title">THREAD'X</h1>
</div>

<div class="image-card">
<img src="https://raw.githubusercontent.com/yuvi-x-henry/Pf/refs/heads/main/e632c4ddfeae7def55bc5f43688e8cf4.jpg" alt="THREAD'X" class="thread-image">
</div>

<div class="threads-container">
<div id="threads"></div>
<div class="refresh-info">🔄 Auto-refreshing every 2 seconds</div>
</div>

<script>

function load(){
fetch("/api/threads")
.then(r=>r.json())
.then(data=>{
let html=""
if(data.length === 0){
html = \`
<div style="text-align:center;padding:50px;color:#a0a0a0;">
<div style="font-size:3rem;margin-bottom:20px;">🚀</div>
<h3>No Active Threads</h3>
<p>Start a new thread from the main panel</p>
</div>
\`
}else{
data.forEach(t=>{
let runningDays = Math.floor((Date.now() - t.start) / (1000 * 60 * 60 * 24))
let runningHours = Math.floor(((Date.now() - t.start) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
let status = "active"
let statusClass = "active"

html+= \`
<div class="thread-card">
<div class="thread-title">THREAD #\${t.id}</div>
<div class="status-badge \${statusClass}">\${status.toUpperCase()}</div>
<div class="details-grid">
<div class="detail-item">
<div class="detail-label">Started</div>
<div class="detail-value">\${new Date(t.start).toLocaleString()}</div>
</div>
<div class="detail-item">
<div class="detail-label">Uptime</div>
<div class="detail-value">\${runningDays}d \${runningHours}h</div>
</div>
<div class="detail-item">
<div class="detail-label">Running</div>
<div class="detail-value">\${t.running}s</div>
</div>
</div>
<div class="buttons">
<button class="btn btn-logs" onclick="viewLogs('\${t.id}')">View Logs</button>
<button class="btn btn-stop" onclick="stopThread('\${t.id}')">STOP</button>
</div>
</div>
\`
})
}
document.getElementById("threads").innerHTML=html
})
.catch(err=>console.error(err))
}

function stopThread(id){
    fetch("/stop/HX_"+id,{method:"POST"})  // Add HX_ prefix
    .then(()=>load())
}

function viewLogs(id){
alert("📊 Live logs feature coming soon via WebSocket!\nThread ID: " + id)
}

setInterval(load,2000)
load()

</script>

</body>
</html>

`)

})
// ---------------- THREAD API ----------------

// /api/threads route ko exactly YEH replace kar:

app.get("/api/threads", (req, res) => {
    let list = []
    activeSessions.forEach((session, id) => {
        if (session && session.interval) {  // Check if still active
            list.push({
                id: id.replace("HX_", ""),  // Clean ID
                start: session.start,
                running: Math.floor((Date.now() - session.start) / 1000)
            })
        }
    })
    console.log("📊 Active threads:", list.length)  // Debug log
    res.json(list)
})

// API Route
app.get("/api/threads",(req,res)=>{
    let list=[]
    activeSessions.forEach((v,k)=>{
        list.push({
            id: k.substring(3),  // Remove "HX_"
            start: v.start,
            running: Math.floor((Date.now()-v.start)/1000)
        })
    })
    res.json(list)
})

// STOP Route mein bhi fix
app.post("/stop/:id",(req,res)=>{
    let id = "HX_" + req.params.id  // Add HX_ prefix
    let s = activeSessions.get(id)
    if(s){
        clearInterval(s.interval)
        activeSessions.delete(id)
        console.log("🛑 Stopped:", id)
    }
    res.json({success:true})
})

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
