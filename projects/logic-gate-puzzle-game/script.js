let A = 0;
let B = 0;
let selectedGate = "AND";
let xp = 0;
let level = 1;
let target = 1;

function toggleInput(input) {
    if (input === 'A') {
        A = A === 0 ? 1 : 0;
        document.getElementById("A").innerText = A;
    } else {
        B = B === 0 ? 1 : 0;
        document.getElementById("B").innerText = B;
    }
    updateOutput();
}

function selectGate(gate) {
    selectedGate = gate;
    updateOutput();
}

function logicOperation() {
    switch (selectedGate) {
        case "AND": return A & B;
        case "OR": return A | B;
        case "NOT": return A === 0 ? 1 : 0;
        case "XOR": return A ^ B;
        case "NAND": return !(A & B) ? 1 : 0;
        case "NOR": return !(A | B) ? 1 : 0;
    }
}

function updateOutput() {
    const result = logicOperation();
    document.getElementById("output").innerText = result;
}

function checkSolution() {
    const result = logicOperation();
    if (result == target) {
        xp += 10;
        level = Math.floor(xp / 50) + 1;
        document.getElementById("xp").innerText = xp;
        document.getElementById("level").innerText = level;
        document.getElementById("bulb").style.background = "lime";
    } else {
        document.getElementById("bulb").style.background = "red";
    }
}

function newPuzzle() {
    target = Math.round(Math.random());
    document.getElementById("target").innerText = target;
}