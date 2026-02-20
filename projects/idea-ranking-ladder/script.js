const input = document.getElementById("ideaInput");
const addBtn = document.getElementById("addIdea");
const ladder = document.getElementById("ladder");
const saveBtn = document.getElementById("saveRanking");
const resultCard = document.getElementById("resultCard");
const resultList = document.getElementById("resultList");

let ideas = [];

addBtn.onclick = () => {
    const text = input.value.trim();
    if (!text) return;

    ideas.push(text);
    input.value = "";
    renderLadder();
};

function renderLadder() {
    ladder.innerHTML = "";
    ideas.forEach((idea, index) => {
        const li = document.createElement("li");
        li.draggable = true;
        li.innerHTML = `<span class="rank">#${index + 1}</span> ${idea}`;
        addDragEvents(li);
        ladder.appendChild(li);
    });
}

function addDragEvents(item) {
    item.addEventListener("dragstart", () => {
        item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        updateIdeas();
    });
}

ladder.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const after = getDragAfterElement(ladder, e.clientY);
    if (after == null) {
        ladder.appendChild(dragging);
    } else {
        ladder.insertBefore(dragging, after);
    }
});

function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll("li:not(.dragging)")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function updateIdeas() {
    const items = ladder.querySelectorAll("li");
    ideas = [...items].map(li => li.textContent.replace(/^#\d+\s*/, ""));
    renderLadder();
}

saveBtn.onclick = () => {
    if (ideas.length === 0) return;

    resultList.innerHTML = "";
    ideas.forEach(idea => {
        const li = document.createElement("li");
        li.textContent = idea;
        resultList.appendChild(li);
    });

    resultCard.style.display = "block";
};
