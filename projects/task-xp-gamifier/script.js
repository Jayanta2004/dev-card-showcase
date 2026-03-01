let level = 1, xp = 0, xpNext = 100, streak = 0;
const xpFill = document.getElementById('xp-fill');
const levelEl = document.getElementById('level');
const xpEl = document.getElementById('xp');
const xpNextEl = document.getElementById('xp-next');
const tasksContainer = document.getElementById('tasks-container');
const levelUpNotification = document.getElementById('level-up-notification');
const badgeNotification = document.getElementById('badge-notification');
const addTaskBtn = document.getElementById('add-task-btn');

// Task types
const taskTypes = [
    {name:'Routine', xp:10, class:'task-routine'},
    {name:'Challenge', xp:25, class:'task-challenge'},
    {name:'Bonus', xp:15, class:'task-bonus'},
    {name:'Timed', xp:30, class:'task-timed'},
    {name:'Special', xp:50, class:'task-special'}
];

function addTask() {
    const task = taskTypes[Math.floor(Math.random()*taskTypes.length)];
    const card = document.createElement('div');
    card.classList.add('task-card', task.class);
    card.innerHTML = `<strong>${task.name} Task</strong><br>XP: ${task.xp}`;
    card.addEventListener('click', ()=>completeTask(task.xp, card));
    tasksContainer.appendChild(card);
}

function completeTask(taskXP, card) {
    // Apply streak bonus
    streak++;
    const bonusXP = taskXP * (1 + streak*0.1);
    xp += Math.floor(bonusXP);
    xpEl.innerText = xp;
    card.remove();

    // Random badge pop for streaks
    if(streak % 5 === 0) showBadge(`Streak x${streak}!`);

    if(xp >= xpNext) levelUp();
    updateXpBar();
}

function updateXpBar() {
    const percentage = (xp/xpNext)*100;
    xpFill.style.width = percentage>100?'100%':percentage+'%';
}

function levelUp() {
    xp -= xpNext;
    level++;
    streak = 0; // reset streak
    levelEl.innerText = level;
    xpNext = Math.floor(xpNext*1.5);
    xpNextEl.innerText = xpNext;
    levelUpNotification.style.display='block';
    setTimeout(()=>levelUpNotification.style.display='none',1000);
    updateXpBar();
}

function showBadge(message){
    badgeNotification.innerText = message;
    badgeNotification.style.display='block';
    setTimeout(()=>badgeNotification.style.display='none',1200);
}

// Initial tasks
for(let i=0;i<5;i++) addTask();
addTaskBtn.addEventListener('click', addTask);