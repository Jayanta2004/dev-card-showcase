let queue = [];
let servedCount = 0;
let level = 1;

// Render Queue
function renderQueue() {
    const queueList = document.getElementById("queueList");
    queueList.innerHTML = "";
    queue.forEach((person, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${person}`;
        queueList.appendChild(li);
    });
    document.getElementById("queueLength").textContent = queue.length;
}

// Level Up
function checkLevelUp() {
    if (servedCount > 0 && servedCount % 5 === 0) {
        level++;
        const levelUpDiv = document.getElementById("levelUp");
        levelUpDiv.textContent = `🎉 Level Up! Level ${level} 🎉`;
        levelUpDiv.style.display = "block";
        setTimeout(() => levelUpDiv.style.display = "none", 3000);
    }
}

// Add person
function addPerson() {
    const nameInput = document.getElementById("personName");
    const name = nameInput.value.trim();
    if (!name) {
        alert("Enter a name!");
        return;
    }
    queue.push(name);
    nameInput.value = "";
    renderQueue();
}

// Serve person
function servePerson() {
    if (queue.length === 0) {
        alert("Queue is empty!");
        return;
    }
    const served = queue.shift();
    servedCount++;
    alert(`${served} has been served!`);
    document.getElementById("servedCount").textContent = servedCount;
    renderQueue();
    checkLevelUp();
}

// Remove last
function removeLast() {
    if (queue.length === 0) {
        alert("Queue is empty!");
        return;
    }
    const removed = queue.pop();
    alert(`${removed} removed from queue!`);
    renderQueue();
}

// Random event
function randomEvent() {
    if (queue.length === 0) {
        alert("Queue is empty!");
        return;
    }
    const eventType = Math.floor(Math.random() * 3);
    switch (eventType) {
        case 0: // VIP
            const vip = `VIP-${Math.floor(Math.random()*100)}`;
            queue.unshift(vip);
            alert(`VIP ${vip} jumped to front!`);
            break;
        case 1: // Leaves
            const randIndex = Math.floor(Math.random()*queue.length);
            const left = queue.splice(randIndex,1)[0];
            alert(`${left} left the queue!`);
            break;
        case 2: // Extra joins
            const guest = `Guest-${Math.floor(Math.random()*100)}`;
            queue.push(guest);
            alert(`${guest} joined the queue!`);
            break;
    }
    renderQueue();
}

// Initial render
renderQueue();
