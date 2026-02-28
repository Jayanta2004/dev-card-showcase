let time = 60;
let timer;
let combo = 0;
let score = 0;
let selectedItem = null;

function startGame() {
    time = 60;
    combo = 0;
    score = 0;

    document.getElementById("timer").innerText = time;
    document.getElementById("combo").innerText = combo;
    document.getElementById("score").innerText = score;

    generateItems();
    startTimer();
}

function generateItems() {
    const zone = document.getElementById("unsortedZone");
    zone.innerHTML = "";

    for (let i = 0; i < 12; i++) {
        const num = Math.floor(Math.random() * 100);

        const item = document.createElement("div");
        item.className = "item";
        item.innerText = num;
        item.dataset.value = num;

        item.addEventListener("click", () => selectItem(item));

        zone.appendChild(item);
    }
}

function selectItem(item) {
    if (selectedItem) {
        selectedItem.classList.remove("selected");
    }

    selectedItem = item;
    item.classList.add("selected");
}

document.querySelectorAll(".drop-zone").forEach(zone => {
    zone.addEventListener("click", () => {
        if (!selectedItem) return;

        const value = parseInt(selectedItem.dataset.value);
        const type = zone.dataset.type;

        if ((type === "low" && value < 50) ||
            (type === "high" && value >= 50)) {

            combo++;
            score += 10 * combo;

            zone.appendChild(selectedItem);
            selectedItem.classList.remove("selected");
            selectedItem = null;

        } else {
            combo = 0;
            selectedItem.classList.add("wrong");
            setTimeout(() => {
                selectedItem.classList.remove("wrong");
                selectedItem.classList.remove("selected");
                selectedItem = null;
            }, 400);
        }

        document.getElementById("combo").innerText = combo;
        document.getElementById("score").innerText = score;
    });
});

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        time--;
        document.getElementById("timer").innerText = time;

        if (time <= 10) {
            document.getElementById("timer").style.color = "red";
        }

        if (time <= 0) {
            clearInterval(timer);
            alert("Time Up! Final Score: " + score);
        }
    }, 1000);
}