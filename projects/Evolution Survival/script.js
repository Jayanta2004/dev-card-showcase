/* INITIAL RESOURCES */
let food=10, health=10, intel=10;
let stageIndex=0;

/* STAGES (15) */
const stages=[
 {n:"Early Hominid",d:"Primitive survival.",r:{food:20,health:15,intel:10},h:"Focus on food first."},
 {n:"Tool User",d:"Stone tools emerge.",r:{food:25,health:20,intel:15},h:"Balance food & learning."},
 {n:"Fire User",d:"Fire discovered.",r:{food:30,health:25,intel:20},h:"Exploration boosts intel."},
 {n:"Hunter",d:"Organized hunting.",r:{food:35,health:25,intel:25},h:"Don't overhunt."},
 {n:"Gatherer",d:"Plant knowledge.",r:{food:30,health:30,intel:25},h:"Gathering stabilizes health."},
 {n:"Tribe",d:"Social groups.",r:{food:35,health:30,intel:30},h:"Avoid excess food."},
 {n:"Language",d:"Communication forms.",r:{food:30,health:35,intel:35},h:"Learning matters most."},
 {n:"Farmer",d:"Agriculture starts.",r:{food:40,health:35,intel:30},h:"Food becomes critical."},
 {n:"Village",d:"Settlements.",r:{food:35,health:40,intel:35},h:"Health imbalance blocks progress."},
 {n:"Trader",d:"Trade networks.",r:{food:30,health:35,intel:40},h:"Explore wisely."},
 {n:"Craftsman",d:"Specialization.",r:{food:30,health:35,intel:45},h:"Avoid wasting food."},
 {n:"City",d:"Urban life.",r:{food:35,health:40,intel:45},h:"Everything must align."},
 {n:"Scholar",d:"Knowledge age.",r:{food:30,health:35,intel:50},h:"Think before acting."},
 {n:"Innovator",d:"Technology.",r:{food:35,health:40,intel:55},h:"Small mistakes matter."},
 {n:"Modern Human",d:"Peak evolution.",r:{food:40,health:45,intel:60},h:"Perfect balance required."}
];

function updateUI(){
  foodBar.style.width=food+"%";
  healthBar.style.width=health+"%";
  intelBar.style.width=intel+"%";
  checkButtons();
}

function loadStage(){
  const s=stages[stageIndex];
  stageTitle.textContent=`Stage ${stageIndex+1}: ${s.n}`;
  stageDesc.textContent=s.d;
  hint.textContent="💡 Hint: "+s.h;
  document.querySelectorAll(".action").forEach(b=>b.classList.remove("disabled"));
  logMsg("➡️ Entered "+s.n);
  updateUI();
}

function logMsg(msg){
  const p=document.createElement("p");
  p.textContent=msg;
  log.prepend(p);
}

/* ACTIONS */
function hunt(){
  food+=5; health-=2;
  logMsg("🪓 Hunting increased food.");
  updateUI();
}
function gather(){
  food+=4; health+=3;
  logMsg("🌿 Gathering helped health.");
  updateUI();
}
function explore(){
  intel+=5; food-=2;
  logMsg("🔥 Exploration increased intelligence.");
  updateUI();
}
function think(){
  intel+=7; food-=3;
  logMsg("🧠 Learning boosted intelligence.");
  updateUI();
}

/* DISABLE BUTTONS WHEN SUFFICIENT */
function checkButtons(){
  const r=stages[stageIndex].r;

  toggle(huntBtn,food>=r.food,"Food sufficient");
  toggle(gatherBtn,food>=r.food && health>=r.health,"Food & health sufficient");
  toggle(exploreBtn,intel>=r.intel,"Intelligence sufficient");
  toggle(thinkBtn,intel>=r.intel,"Intelligence sufficient");
}

function toggle(btn,condition,msg){
  if(condition && !btn.classList.contains("disabled")){
    btn.classList.add("disabled");
    logMsg("ℹ️ "+msg+" for this stage.");
  }
  if(!condition){
    btn.classList.remove("disabled");
  }
}

/* EVOLUTION CHECK */
function tryEvolve(){
  const r=stages[stageIndex].r;

  console.log("food:",food,health,intel);
  if(food < r.food || health < r.health || intel < r.intel){
    logMsg("❌ Evolution failed: exact balance required.");
    return;
  }

  if(stageIndex<stages.length-1){
    stageIndex++;
    food=10; health=10; intel=10;
    logMsg("✨ Evolution successful!");
    loadStage();
  }else{
    logMsg("🏆 Evolution completed!");
  }
}

loadStage();
updateUI();