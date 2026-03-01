/* ===========================
   STATE
=========================== */

let habits = JSON.parse(localStorage.getItem("habits")) || [];
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

const habitList = document.getElementById("habitList");
const levelDisplay = document.getElementById("level");
const xpBar = document.getElementById("xpBar");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitInput = document.getElementById("habitInput");

/* ===========================
   ADD HABIT
=========================== */

addHabitBtn.addEventListener("click", addHabit);

function addHabit(){
const name = habitInput.value.trim();
if(!name) return;

habits.push({
id:Date.now(),
name:name,
streak:0,
completed:false,
history:[]
});

habitInput.value="";
saveData();
renderHabits();
}

/* ===========================
   RENDER HABITS
=========================== */

function renderHabits(){
habitList.innerHTML="";

habits.forEach(habit=>{
const div = document.createElement("div");
div.className="habit"+(habit.completed?" completed":"");

const span = document.createElement("span");
span.textContent=`${habit.name} | 🔥 ${habit.streak}`;

const completeBtn = document.createElement("button");
completeBtn.textContent="Complete";
completeBtn.className="complete-btn";
completeBtn.onclick=()=>completeHabit(habit.id);

const deleteBtn = document.createElement("button");
deleteBtn.textContent="Delete";
deleteBtn.className="delete-btn";
deleteBtn.onclick=()=>deleteHabit(habit.id);

div.appendChild(span);
div.appendChild(completeBtn);
div.appendChild(deleteBtn);

habitList.appendChild(div);
});

updateXPUI();
drawChart();
}

/* ===========================
   COMPLETE HABIT
=========================== */

function completeHabit(id){
const today = new Date().toDateString();

habits = habits.map(habit=>{
if(habit.id===id && !habit.completed){
habit.completed=true;
habit.streak++;
habit.history.push({date:today});
xp+=10;
checkLevelUp();
}
return habit;
});

saveData();
renderHabits();
}

/* ===========================
   DELETE HABIT
=========================== */

function deleteHabit(id){
habits = habits.filter(h=>h.id!==id);
saveData();
renderHabits();
}

/* ===========================
   XP SYSTEM
=========================== */

function checkLevelUp(){
const required = level*100;
if(xp>=required){
xp-=required;
level++;
}
}

function updateXPUI(){
levelDisplay.textContent=level;
const required = level*100;
const percent = (xp/required)*100;
xpBar.style.width=percent+"%";
}

/* ===========================
   CHART
=========================== */

function drawChart(){
const canvas=document.getElementById("chart");
const ctx=canvas.getContext("2d");
ctx.clearRect(0,0,canvas.width,canvas.height);

let data={};

habits.forEach(h=>{
h.history.forEach(entry=>{
data[entry.date]=(data[entry.date]||0)+1;
});
});

const labels=Object.keys(data).slice(-7);
const values=labels.map(l=>data[l]);

const max=Math.max(...values,5);
const barWidth=canvas.width/(labels.length*2);

labels.forEach((label,i)=>{
const height=(values[i]/max)*150;
ctx.fillStyle="#6c63ff";
ctx.fillRect(i*barWidth*2+20,180-height,barWidth,height);
});
}

/* ===========================
   DAILY RESET
=========================== */

function resetDaily(){
const today = new Date().toDateString();
habits.forEach(habit=>{
if(habit.history.length>0){
const last=habit.history[habit.history.length-1].date;
if(last!==today){
habit.completed=false;
}
}
});
}

/* ===========================
   STORAGE
=========================== */

function saveData(){
localStorage.setItem("habits",JSON.stringify(habits));
localStorage.setItem("xp",xp);
localStorage.setItem("level",level);
}

/* ===========================
   INIT
=========================== */

resetDaily();
renderHabits();
