let water = 70;
let sun = 70;
let food = 70;

const plantEl = document.getElementById("plant");
const stageText = document.getElementById("stageText");
const statusText = document.getElementById("statusText");

function updateBars(){
  document.getElementById("waterBar").style.width = water + "%";
  document.getElementById("sunBar").style.width = sun + "%";
  document.getElementById("foodBar").style.width = food + "%";
}

function clamp(){
  water = Math.max(0, Math.min(100, water));
  sun = Math.max(0, Math.min(100, sun));
  food = Math.max(0, Math.min(100, food));
}

// ---------- GROWTH ----------
function updatePlantStage(){
  const avg = (water + sun + food) / 3;

  if(avg > 80){
    plantEl.textContent = "🌳";
    stageText.textContent = "Stage: Tree";
  } else if(avg > 50){
    plantEl.textContent = "🌿";
    stageText.textContent = "Stage: Growing Plant";
  } else {
    plantEl.textContent = "🌱";
    stageText.textContent = "Stage: Seedling";
  }

  plantEl.classList.add("grow");
  setTimeout(()=>plantEl.classList.remove("grow"),300);
}

// ---------- STATUS ----------
function updateStatus(){
  const avg = (water + sun + food) / 3;

  if(avg < 30){
    statusText.textContent = "⚠️ Plant is unhealthy!";
  } else if(avg < 60){
    statusText.textContent = "🙂 Plant needs care.";
  } else {
    statusText.textContent = "😊 Your plant is happy!";
  }
}

// ---------- ACTIONS ----------
function waterPlant(){
  water += 15;
  sun -= 5;
  food -= 3;
  refresh();
}

function giveSun(){
  sun += 15;
  water -= 5;
  refresh();
}

function fertilize(){
  food += 15;
  water -= 3;
  refresh();
}

// ---------- AUTO DECAY ----------
setInterval(()=>{
  water -= 2;
  sun -= 2;
  food -= 1;
  refresh();
}, 3000);

// ---------- REFRESH ----------
function refresh(){
  clamp();
  updateBars();
  updatePlantStage();
  updateStatus();
}

refresh();