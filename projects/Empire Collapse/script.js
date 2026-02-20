/* INITIAL RESOURCES */
let economy=70, stability=70, opinion=70;
let stageIndex=0;
let turn=0;

/* STAGES WITH HINTS */
const stages=[
  {name:"Ancient Era", desc:"Your empire is born.", threshold:{economy:80,stability:80,opinion:80}, hint:"💡 Focus on boosting Economy first."},
  {name:"Medieval Era", desc:"Kingdom grows.", threshold:{economy:85,stability:85,opinion:85}, hint:"💡 Balance Stability and Opinion carefully."},
  {name:"Industrial Era", desc:"Industry rises.", threshold:{economy:90,stability:90,opinion:90}, hint:"💡 Economy is key; avoid wars unless necessary."},
  {name:"Modern Era", desc:"Technology advances.", threshold:{economy:95,stability:95,opinion:95}, hint:"💡 Public Opinion is critical now."},
  {name:"Futuristic Era", desc:"Empire reaches peak.", threshold:{economy:100,stability:100,opinion:100}, hint:"💡 Maintain all resources in harmony."}
];

/* RANDOM EVENTS */
const events=[
  {msg:"🌾 Famine reduces economy and stability", economy:-10, stability:-10, opinion:0},
  {msg:"⚡ Revolution! Public opinion drops", economy:0, stability:-10, opinion:-15},
  {msg:"💎 Discovery boosts economy", economy:15, stability:0, opinion:5},
  {msg:"🧨 Conflict reduces stability", economy:-5, stability:-15, opinion:-5},
  {msg:"🎉 Festival improves opinion", economy:-5, stability:5, opinion:15},
];

function updateUI(){
  setRing(economyProgress,economy);
  setRing(stabilityProgress,stability);
  setRing(opinionProgress,opinion);
  loadStage();
}

function setRing(el,value){
  const radius=50;
  const circumference=2*Math.PI*radius;
  el.style.strokeDasharray=circumference;
  el.style.strokeDashoffset=circumference - (value/100)*circumference;
}

/* LOG */
function logMsg(msg){
  const p=document.createElement("p");
  p.textContent=msg;
  log.prepend(p);
}

/* LOAD STAGE AND HINT */
function loadStage(){
  const s = stages[stageIndex];
  stageTitle.textContent = `Stage ${stageIndex+1}: ${s.name}`;
  stageDesc.textContent = s.desc;
  stageHint.textContent = s.hint;
}

/* DECISIONS */
function makeDecision(action){
  turn++;
  switch(action){
    case 'tax':
      economy+=10; opinion-=15; stability-=10;
      logMsg("💰 Taxes: +Economy, -Opinion & Stability");
      break;
    case 'spend':
      economy-=10; stability+=10; opinion+=5;
      logMsg("🏛️ Spending: +Stability & Opinion, -Economy");
      break;
    case 'war':
      economy-=15; stability-=20; opinion-=10;
      logMsg("⚔️ War: -All resources");
      break;
    case 'reform':
      stability+=15; opinion+=15; economy-=5;
      logMsg("📝 Reform: +Stability & Opinion, -Economy");
      break;
  }

  clampResources();

  /* Random event every 3 turns */
  if(turn%3===0){
    const ev=events[Math.floor(Math.random()*events.length)];
    economy+=ev.economy; stability+=ev.stability; opinion+=ev.opinion;
    clampResources();
    logMsg(ev.msg);
  }

  checkCollapse();
  checkStageProgress();
  updateUI();
}

function clampResources(){
  economy=Math.max(0,Math.min(100,economy));
  stability=Math.max(0,Math.min(100,stability));
  opinion=Math.max(0,Math.min(100,opinion));
}

/* COLLAPSE */
function checkCollapse(){
  if(economy<=0 || stability<=0 || opinion<=0){
    logMsg("💥 Your empire has collapsed!");
    document.querySelectorAll('.decision').forEach(b=>b.classList.add('disabled'));
    document.getElementById("nextStageBtn").style.display="none";
  }
}

/* STAGE PROGRESSION */
function checkStageProgress(){
  const s=stages[stageIndex];
  if(economy>=s.threshold.economy && stability>=s.threshold.stability && opinion>=s.threshold.opinion){
    // show next stage button
    document.getElementById("nextStageBtn").style.display="inline-block";
    document.querySelectorAll('.decision').forEach(b=>b.classList.add('disabled'));
    stageHint.textContent = "🎯 Stage cleared! Click Next Stage to continue.";
  }
}

/* NEXT STAGE */
function nextStage(){
  if(stageIndex < stages.length-1){
    stageIndex++;
    economy=70; stability=70; opinion=70;
    turn=0;
    document.querySelectorAll('.decision').forEach(b=>b.classList.remove('disabled'));
    document.getElementById("nextStageBtn").style.display="none";
    logMsg(`✨ Moved to ${stages[stageIndex].name}!`);
    loadStage();
    updateUI();
  } else {
    logMsg("🏆 Your empire has reached its peak!");
    document.querySelectorAll('.decision').forEach(b=>b.classList.add('disabled'));
    document.getElementById("nextStageBtn").style.display="none";
  }
}

updateUI();