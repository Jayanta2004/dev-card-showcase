let timer=null, time=0, seq=[], hints=2;

function switchScreen(a,b){
  document.getElementById(a).classList.remove("active");
  document.getElementById(b).classList.add("active");
}

function startTimer(sec){
  clearInterval(timer); time=sec;
  updateTimer();
  timer=setInterval(()=>{
    time--; updateTimer();
    if(time<=0){ clearInterval(timer); alert("Time Over!"); backHub(); }
  },1000);
}
function updateTimer(){
  const m=String(Math.floor(time/60)).padStart(2,"0");
  const s=String(time%60).padStart(2,"0");
  document.getElementById("timer").innerText=`${m}:${s}`;
}

function openCyber(){
  hints=2; seq=[];
  document.querySelectorAll('.node').forEach(n=>n.classList.remove('active'));
  document.getElementById('cy2').style.display='none';
  document.getElementById('cyWin').style.display='none';
  document.getElementById('c1').innerHTML='';
  document.getElementById('c2').innerHTML='';
  switchScreen("hub","cyber");
  startTimer(120);
}

function backHub(){
  clearInterval(timer);
  document.getElementById("timer").innerText="--:--";
  switchScreen("cyber","hub");
}

/* Puzzle 1 */
function tapNode(el){
  seq.push(el.dataset.n);
  el.classList.add('active');
  if(seq.join('')==="241"){
    document.getElementById('c1').innerHTML="<div class='success'>Access Granted</div>";
    document.getElementById('cy2').style.display='block';
  }
  if(seq.length>=3 && seq.join('')!=="241"){
    seq=[];
    document.querySelectorAll('.node').forEach(n=>n.classList.remove('active'));
    document.getElementById('c1').innerHTML="<div class='error'>Sequence Reset</div>";
  }
}

/* Puzzle 2 */
function solveCyber2(){
  if(cyb.value.trim().toLowerCase()==="computer"){
    clearInterval(timer);
    document.getElementById('cyWin').style.display='block';
  } else {
    document.getElementById('c2').innerHTML="<div class='error'>Decryption Failed</div>";
  }
}

function hint(n){
  if(hints<=0) return;
  hints--;
  if(n===1) document.getElementById('c1').innerHTML="<div class='hint'>Start from the second node.</div>";
  if(n===2) document.getElementById('c2').innerHTML="<div class='hint'>It’s a machine.</div>";
}

function openTemple(){
  hints=2;
  document.getElementById('temple2').style.display='none';
  document.getElementById('templeWin').style.display='none';
  document.getElementById('t1').innerHTML='';
  document.getElementById('t2').innerHTML='';
  switchScreen("hub","temple");
  startTimer(120);
}

function backHubFromTemple(){
  clearInterval(timer);
  document.getElementById("timer").innerText="--:--";
  switchScreen("temple","hub");
}

/* Temple Puzzle 1 */
function correctRune(el){
  el.classList.add("active");
  document.getElementById("t1").innerHTML="<div class='success'>The Rune Glows!</div>";
  document.getElementById("temple2").style.display="block";
}
function wrongRune(el){
  el.classList.add("active");
  document.getElementById("t1").innerHTML="<div class='error'>Stone Crumbles…</div>";
}

/* Temple Puzzle 2 */
function solveTemple2(){
  if(templeAns.value.trim().toLowerCase()==="keyboard"){
    clearInterval(timer);
    document.getElementById("templeWin").style.display="block";
  } else {
    document.getElementById("t2").innerHTML="<div class='error'>Relic Rejects You</div>";
  }
}

function templeHint(n){
  if(hints<=0) return;
  hints--;
  if(n===1) t1.innerHTML="<div class='hint'>Second stone is older.</div>";
  if(n===2) t2.innerHTML="<div class='hint'>You type with it.</div>";
}


let spaceSeq = [];

function openSpace(){
  hints=2;
  spaceSeq = [];
  document.getElementById('space2').style.display='none';
  document.getElementById('spaceWin').style.display='none';
  document.getElementById('s1').innerHTML='';
  document.getElementById('s2').innerHTML='';
  switchScreen("hub","space");
  startTimer(120);
}

function backHubFromSpace(){
  clearInterval(timer);
  document.getElementById("timer").innerText="--:--";
  switchScreen("space","hub");
}

/* Space Puzzle 1 */
function tapOrb(color){
  spaceSeq.push(color);
  if(spaceSeq.join("-")==="blue-red-green"){
    document.getElementById("s1").innerHTML="<div class='success'>Power Restored!</div>";
    document.getElementById("space2").style.display="block";
  } else if(spaceSeq.length>=3){
    spaceSeq=[];
    document.getElementById("s1").innerHTML="<div class='error'>System Reset</div>";
  }
}

/* Space Puzzle 2 */
function solveSpace2(){
  if(spaceAns.value.trim().toLowerCase()==="mars"){
    clearInterval(timer);
    document.getElementById("spaceWin").style.display="block";
  } else {
    document.getElementById("s2").innerHTML="<div class='error'>Wrong Code</div>";
  }
}

function spaceHint(n){
  if(hints<=0) return;
  hints--;
  if(n===1) s1.innerHTML="<div class='hint'>Cool colors go first.</div>";
  if(n===2) s2.innerHTML="<div class='hint'>It’s named after a Roman god.</div>";
}


function openHaunted(){
  hints=2;
  document.getElementById("h1").value="";
  document.getElementById("h1msg").innerHTML="";
  document.getElementById("h2msg").innerHTML="";
  document.getElementById("haunted2").style.display="none";
  document.getElementById("hauntedWin").style.display="none";
  document.getElementById("ghostBox").innerHTML="";
  switchScreen("hub","haunted");
  startTimer(120);
}

function backHubFromHaunted(){
  clearInterval(timer);
  document.getElementById("timer").innerText="--:--";
  switchScreen("haunted","hub");
}

function solveHaunted1(){
  if(h1.value==="1500"){
    h1msg.innerHTML="<div class='success'>Locker Opened!</div>";
    haunted2.style.display="block";
  } else {
    h1msg.innerHTML="<div class='error'>Wrong Code</div>";
  }
}

/* Drag & Drop */
function allow(e){ e.preventDefault(); }
function drag(e){ e.dataTransfer.setData("text", e.target.id); }
function drop(e){
  e.preventDefault();
  let data = e.dataTransfer.getData("text");
  e.target.appendChild(document.getElementById(data));
}

function checkGhost(){
  if(ghostBox.innerText==="GHOST"){
    clearInterval(timer);
    hauntedWin.style.display="block";
  } else {
    h2msg.innerHTML="<div class='error'>Spirits Unhappy...</div>";
  }
}

function hauntedHint(n){
  if(hints<=0) return;
  hints--;
  if(n===1) h1msg.innerHTML="<div class='hint'>Use 24-hour format.</div>";
  if(n===2) h2msg.innerHTML="<div class='hint'>Spell what you fear.</div>";
}
