let day = 1;
let money = 1000;
let savings = 0;
let health = 100;

const moneyEl = document.getElementById("money");
const savingsEl = document.getElementById("savings");
const dayEl = document.getElementById("day");
const healthBar = document.getElementById("healthBar");
const eventText = document.getElementById("eventText");

function updateUI() {
    moneyEl.textContent = money;
    savingsEl.textContent = savings;
    dayEl.textContent = day;
    healthBar.style.width = health + "%";
}

function showEvent(msg) {
    eventText.textContent = msg;
}

function nextDay() {
    day++;
    const expense = Math.floor(Math.random() * 150) + 50;
    money -= expense;

    if (money < 0) {
        money = 0;
        health -= 10;
        showEvent("Couldn't cover expenses. Health -10");
    } else {
        showEvent(`Daily expenses: ₹${expense}`);
    }

    checkGame();
    updateUI();
}

function work() {
    const income = Math.floor(Math.random() * 300) + 200;
    money += income;
    showEvent(`You worked and earned ₹${income}`);
    updateUI();
}

function addIncome() {
    const amount = parseInt(prompt("Enter income amount:"));
    if (isNaN(amount) || amount <= 0) {
        showEvent("Invalid income amount");
        return;
    }
    money += amount;
    showEvent(`Income added: ₹${amount}`);
    updateUI();
}

function saveMoney() {
    const amount = 200;
    if (money >= amount) {
        money -= amount;
        savings += amount;
        showEvent("₹200 moved to savings");
    } else {
        showEvent("Not enough cash to save");
    }
    updateUI();
}

function emergency() {
    const cost = 300;
    if (savings >= cost) {
        savings -= cost;
        health = Math.min(100, health + 15);
        showEvent("Emergency handled using savings. Health +15");
    } else {
        health -= 20;
        showEvent("No savings! Emergency hurt your health");
    }
    checkGame();
    updateUI();
}

function checkGame() {
    if (health <= 0) {
        alert("Game Over! You failed to survive financially.");
        location.reload();
    }
}

updateUI();
