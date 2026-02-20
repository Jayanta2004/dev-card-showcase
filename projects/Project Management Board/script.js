// Initial main cards
let mainCards = JSON.parse(localStorage.getItem("mainCards")) || [
  {title:"To-Do", color:"#ff6b6b", tasks:[]},
  {title:"Doing", color:"#feca57", tasks:[]},
  {title:"Done", color:"#1dd1a1", tasks:[]}
];

// Save to localStorage
function saveData(){ 
    localStorage.setItem("mainCards", JSON.stringify(mainCards)); 
}

const mainBoard = document.getElementById("mainBoard");

// Render the board
function renderBoard(){
  mainBoard.innerHTML = "";

  mainCards.forEach((card,i)=>{
    const mainCard = document.createElement("div");
    mainCard.className = "main-card";
    mainCard.style.background = card.color;

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.className = "delete-card-btn";
    delBtn.innerHTML = "🗑️"; 
    delBtn.onclick = (e)=>{
        e.stopPropagation(); 
        if(confirm(`Delete column "${card.title}"?`)){
            mainCards.splice(i,1);
            saveData();
            renderBoard();
        }
    };
    mainCard.appendChild(delBtn);

    // Column title
    const titleInput = document.createElement("input");
    titleInput.className = "column-title";
    titleInput.value = card.title;
    titleInput.onchange = ()=>{ mainCards[i].title = titleInput.value; saveData(); };
    mainCard.appendChild(titleInput);

    // Tasks container
    const tasksDiv = document.createElement("div");
    tasksDiv.className = "tasks";

    card.tasks.forEach((t,idx)=>{
      const task = document.createElement("div");
      task.className = "task";
      task.textContent = t.text || t;
      task.draggable = true;

      // Click to open modal
      task.onclick = ()=>{
        openTaskModal(i, idx);
      }

      task.addEventListener("dragstart",()=>{task.classList.add("dragging")});
      task.addEventListener("dragend",()=>{task.classList.remove("dragging")});

      // Show assigned user and due date if exist
      if(t.user || t.dueDate){
        const infoDiv = document.createElement("div");
        infoDiv.style.fontSize="12px";
        infoDiv.style.marginTop="4px";
        infoDiv.style.opacity="0.8";
        infoDiv.innerHTML = 
          (t.user?`👤 ${t.user} `:"") +
          (t.dueDate?`⏰ ${new Date(t.dueDate).toLocaleString()}`:"");
        task.appendChild(infoDiv);
      }

      tasksDiv.appendChild(task);
    });

    mainCard.appendChild(tasksDiv);

    // Add task button
    const addTaskBtn = document.createElement("button");
    addTaskBtn.className = "add-task-btn";
    addTaskBtn.textContent = "+ Add Task";
    addTaskBtn.onclick = ()=>{
      const t = prompt("Enter task:");
      if(t){ 
        mainCards[i].tasks.push({text:t, user:"", dueDate:""});
        saveData(); 
        renderBoard(); 
        enableDragDrop(); 
      }
    }
    mainCard.appendChild(addTaskBtn);

    mainBoard.appendChild(mainCard);

    // Arrow except last
    if(i<mainCards.length-1){
      const arrow = document.createElement("div");
      arrow.className = "arrow";
      arrow.innerHTML = "➡️";
      mainBoard.appendChild(arrow);
    }
  });

  enableDragDrop();
  updateGridWidth();
}

// Add new main card
function addMainCard(){
  const title = prompt("Enter column title:");
  if(title){
    const color = prompt("Enter color in hex (#xxxxxx):","#ff9ff3");
    mainCards.push({title:title, color:color||"#ff9ff3", tasks:[]});
    saveData();
    renderBoard();
  }
}

// Drag & Drop tasks between main cards
function enableDragDrop(){
  const taskContainers = document.querySelectorAll(".tasks");
  taskContainers.forEach(container=>{
    container.addEventListener("dragover",e=>{
      e.preventDefault();
      const dragging = document.querySelector(".dragging");
      const afterElement = getDragAfter(container,e.clientY);
      if(afterElement==null) container.appendChild(dragging);
      else container.insertBefore(dragging,afterElement);
    });
    container.addEventListener("drop",e=>{
      mainCards.forEach((card,index)=>{
        const containerDiv = document.querySelectorAll(".tasks")[index];
        card.tasks = Array.from(containerDiv.children).map(t=>{
          // If task already object, preserve it
          return t.__taskObj ? t.__taskObj : {text:t.textContent, user:"", dueDate:""};
        });
      });
      saveData();
    });
  });
}

function getDragAfter(container,y){
  const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];
  return draggableElements.reduce((closest,child)=>{
    const box = child.getBoundingClientRect();
    const offset = y-box.top-box.height/2;
    if(offset<0 && offset>closest.offset) return {offset:offset,element:child};
    else return closest;
  },{offset:Number.NEGATIVE_INFINITY}).element;
}

// Update notebook grid width dynamically
function updateGridWidth(){
  const mainBoardWidth = mainCards.length * 350 + (mainCards.length-1)*60; 
  mainBoard.style.setProperty('--grid-width', `${mainBoardWidth}px`);
}

// ------------------ TASK MODAL ------------------

const taskModal = document.getElementById("taskModal");
const modalTaskText = document.getElementById("modalTaskText");
const modalTaskUser = document.getElementById("modalTaskUser");
const modalTaskDate = document.getElementById("modalTaskDate");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const closeBtn = document.querySelector(".close-btn");

let currentCardIndex = null;
let currentTaskIndex = null;

function openTaskModal(cardIdx, taskIdx){
  currentCardIndex = cardIdx;
  currentTaskIndex = taskIdx;
  const task = mainCards[cardIdx].tasks[taskIdx];
  modalTaskText.value = task.text || "";
  modalTaskUser.value = task.user || "";
  modalTaskDate.value = task.dueDate || "";
  taskModal.style.display = "flex";
}

// Close modal
closeBtn.onclick = ()=> taskModal.style.display="none";
window.onclick = e => { if(e.target==taskModal) taskModal.style.display="none"; }

// Save modal changes
saveTaskBtn.onclick = ()=>{
  const updatedTask = {
    text: modalTaskText.value,
    user: modalTaskUser.value,
    dueDate: modalTaskDate.value
  };
  mainCards[currentCardIndex].tasks[currentTaskIndex] = updatedTask;
  saveData();
  renderBoard();
  taskModal.style.display="none";
}

const deleteTaskBtn = document.getElementById("deleteTaskBtn");

deleteTaskBtn.onclick = ()=>{
  if(confirm("Are you sure you want to delete this task?")){
    mainCards[currentCardIndex].tasks.splice(currentTaskIndex,1);
    saveData();
    renderBoard();
    taskModal.style.display = "none";
  }
}

// Initial render
renderBoard();
