let tasks = JSON.parse(localStorage.getItem("dashboardTasks")) || [];
const addBtn = document.getElementById("addTask");
const taskText = document.getElementById("taskText");
const taskDate = document.getElementById("taskDate");
const voiceBtn = document.getElementById("voiceBtn");

function saveTasks(){
  localStorage.setItem("dashboardTasks",JSON.stringify(tasks));
}

function renderTasks(){
  document.querySelectorAll(".task-list").forEach(list=>list.innerHTML="");

  tasks.forEach((task,index)=>{
    const card=document.createElement("div");
    card.className="task-card";
    card.draggable=true;
    card.innerHTML=`
      ${task.text}
      <small>${task.date || "No Date"}</small>
    `;

    card.ondragstart=e=>{
      e.dataTransfer.setData("index",index);
    };

    document.querySelector(`[data-status="${task.status}"] .task-list`)
      .appendChild(card);
  });

  renderCalendar();
}

addBtn.onclick=()=>{
  if(taskText.value.trim()==="") return;

  tasks.push({
    text:taskText.value,
    date:taskDate.value,
    status:"todo"
  });

  taskText.value="";
  taskDate.value="";
  saveTasks();
  renderTasks();
  notify("New task added!");
};

document.querySelectorAll(".column").forEach(column=>{
  column.ondragover=e=>e.preventDefault();

  column.ondrop=e=>{
    const index=e.dataTransfer.getData("index");
    tasks[index].status=column.dataset.status;
    saveTasks();
    renderTasks();
  };
});

/* CALENDAR */
function renderCalendar(){
  const calendar=document.getElementById("calendar");
  calendar.innerHTML="";
  const days=30;

  for(let i=1;i<=days;i++){
    const day=document.createElement("div");
    day.className="day";
    day.innerText=i;

    const hasTask=tasks.some(t=>{
      if(!t.date) return false;
      return new Date(t.date).getDate()===i;
    });

    if(hasTask) day.classList.add("has-task");
    calendar.appendChild(day);
  }
}

/* POMODORO */
let time=1500;
let interval=null;
const timerDisplay=document.getElementById("timer");

function updateTimer(){
  const minutes=Math.floor(time/60);
  const seconds=time%60;
  timerDisplay.innerText=
    `${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}`;
}

document.getElementById("startPomodoro").onclick=()=>{
  if(interval) return;

  interval=setInterval(()=>{
    time--;
    updateTimer();
    if(time<=0){
      clearInterval(interval);
      interval=null;
      notify("Pomodoro Completed!");
    }
  },1000);
};

document.getElementById("resetPomodoro").onclick=()=>{
  clearInterval(interval);
  interval=null;
  time=1500;
  updateTimer();
};

updateTimer();

/* NOTIFICATIONS */
function notify(message){
  if(Notification.permission==="granted"){
    new Notification(message);
  }else if(Notification.permission!=="denied"){
    Notification.requestPermission();
  }
}

/* VOICE ADD */
voiceBtn.onclick=()=>{
  const SpeechRecognition=
    window.SpeechRecognition||window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    alert("Voice not supported in this browser");
    return;
  }

  const recognition=new SpeechRecognition();
  recognition.start();

  recognition.onresult=function(event){
    taskText.value=event.results[0][0].transcript;
  };
};

renderTasks();
