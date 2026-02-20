/**
 * Enigma-Sim Engine
 * Simulates the Signal Path:
 * Key -> Plugboard -> Rotors (R->M->L) -> Reflector -> Rotors Inv (L->M->R) -> Plugboard -> Lamp
 */

// --- Configuration (Enigma I Standard) ---
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Rotor Wiring (Input A-Z maps to...)
const ROTORS = {
    I:   { wire: "EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch: "Q" },
    II:  { wire: "AJDKSIRUXBLHWTMCQGZNPYFVOE", notch: "E" },
    III: { wire: "BDFHJLCPRTXVZNYEIWGAKMUSQO", notch: "V" }
};

const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

// --- State ---
// 0: Left (I), 1: Middle (II), 2: Right (III)
// (Historically Enigma I used 3 rotors. We place them I-II-III L-to-R for simplicity)
let rotorSlots = [
    { type: 'I',   pos: 0 }, // Left
    { type: 'II',  pos: 0 }, // Middle
    { type: 'III', pos: 0 }  // Right
];

let plugboardMap = {}; // Maps 'A'->'Z', 'Z'->'A', etc.

// --- DOM ---
const lampboardEl = document.getElementById('lampboard');
const keyboardEl = document.getElementById('keyboard');
const rotorDisplays = [
    document.getElementById('rotor-0'),
    document.getElementById('rotor-1'),
    document.getElementById('rotor-2')
];
const tapeOutput = document.getElementById('tape-output');

// --- Initialization ---
function init() {
    createKeys();
    resetPlugboard();
}

function createKeys() {
    // QWERTZ layout (German Standard)
    const rows = [
        "QWERTZUIO",
        "ASDFGHJK",
        "PYXCVBNML"
    ];

    rows.forEach(row => {
        [lampboardEl, keyboardEl].forEach((container, isInput) => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';
            rowDiv.style.justifyContent = 'center';
            rowDiv.style.gap = '10px';
            rowDiv.style.width = '100%';

            for (let char of row) {
                const el = document.createElement('div');
                el.innerText = char;
                if (isInput) {
                    // Keyboard Key
                    container.appendChild(el); // Flex wrap handles rows better actually
                    el.className = 'key';
                    el.onmousedown = () => handleKeyDown(char);
                    el.onmouseup = () => handleKeyUp();
                    // Touch support
                    el.ontouchstart = (e) => { e.preventDefault(); handleKeyDown(char); };
                    el.ontouchend = (e) => { e.preventDefault(); handleKeyUp(); };
                } else {
                    // Lamp
                    container.appendChild(el);
                    el.className = 'lamp';
                    el.dataset.char = char;
                }
            }
        });
    });
}

// --- Core Logic ---

function handleKeyDown(inputChar) {
    stepRotors();
    const encryptedChar = processSignal(inputChar);
    
    lightLamp(encryptedChar);
    printTape(encryptedChar);
    updateRotorUI();
}

function handleKeyUp() {
    document.querySelectorAll('.lamp').forEach(l => l.classList.remove('active'));
}

// 1. Stepping Mechanism (Double Step Anomaly)
function stepRotors() {
    const right = rotorSlots[2];
    const mid   = rotorSlots[1];
    const left  = rotorSlots[0];

    // Notch positions (Converted to index 0-25)
    const rightNotch = ALPHABET.indexOf(ROTORS[right.type].notch);
    const midNotch   = ALPHABET.indexOf(ROTORS[mid.type].notch);

    let stepMid = false;
    let stepLeft = false;

    // Right rotor always steps
    // If Right is AT notch, it will trigger Middle next step
    if (right.pos === rightNotch) {
        stepMid = true;
    }
    
    // Double Step: If Middle is AT notch, it steps (pushing Left) AND steps itself again
    if (mid.pos === midNotch) {
        stepMid = true;
        stepLeft = true;
    }

    // Execute steps
    right.pos = (right.pos + 1) % 26;
    if (stepMid)  mid.pos  = (mid.pos + 1) % 26;
    if (stepLeft) left.pos = (left.pos + 1) % 26;
}

// 2. Signal Processing
function processSignal(char) {
    let signal = ALPHABET.indexOf(char);

    // A. Plugboard In
    signal = applyPlugboard(signal);

    // B. Rotors (Right -> Left)
    signal = passRotorForward(signal, rotorSlots[2]);
    signal = passRotorForward(signal, rotorSlots[1]);
    signal = passRotorForward(signal, rotorSlots[0]);

    // C. Reflector
    signal = applyReflector(signal);

    // D. Rotors (Left -> Right) INVERSE
    signal = passRotorReverse(signal, rotorSlots[0]);
    signal = passRotorReverse(signal, rotorSlots[1]);
    signal = passRotorReverse(signal, rotorSlots[2]);

    // E. Plugboard Out
    signal = applyPlugboard(signal);

    return ALPHABET[signal];
}

// --- Signal Path Helpers ---

function passRotorForward(signal, rotor) {
    const wiring = ROTORS[rotor.type].wire;
    const offset = rotor.pos;
    
    // Enter rotor (shifted by rotation)
    let index = (signal + offset) % 26;
    
    // Wiring mapping
    let char = wiring[index];
    let mappedIndex = ALPHABET.indexOf(char);
    
    // Exit rotor (unshift)
    let exitIndex = (mappedIndex - offset + 26) % 26;
    return exitIndex;
}

function passRotorReverse(signal, rotor) {
    const wiring = ROTORS[rotor.type].wire;
    const offset = rotor.pos;
    
    // Enter rotor (shifted)
    let index = (signal + offset) % 26;
    let charAtIndex = ALPHABET[index];
    
    // Reverse Wiring: Find where this char enters from the LEFT
    let wiredIndex = wiring.indexOf(charAtIndex);
    
    // Exit rotor (unshift)
    let exitIndex = (wiredIndex - offset + 26) % 26;
    return exitIndex;
}

function applyReflector(signal) {
    let char = REFLECTOR_B[signal];
    return ALPHABET.indexOf(char);
}

function applyPlugboard(signal) {
    let char = ALPHABET[signal];
    if (plugboardMap[char]) {
        return ALPHABET.indexOf(plugboardMap[char]);
    }
    return signal;
}

// --- UI Updates ---

function lightLamp(char) {
    const lamp = document.querySelector(`.lamp[data-char="${char}"]`);
    if (lamp) lamp.classList.add('active');
}

function printTape(char) {
    tapeOutput.innerText += char;
    // Auto-space groups of 5 (historical practice)
    if (tapeOutput.innerText.replace(/ /g, '').length % 5 === 0) {
        tapeOutput.innerText += " ";
    }
    // Scroll tape
    tapeOutput.parentElement.scrollLeft = tapeOutput.parentElement.scrollWidth;
}

function adjustRotor(index, delta) {
    let r = rotorSlots[index]; // 0=Left, 2=Right
    r.pos = (r.pos + delta + 26) % 26;
    updateRotorUI();
}

function updateRotorUI() {
    // UI is Left(0) - Mid(1) - Right(2)
    rotorDisplays[0].innerText = ALPHABET[rotorSlots[0].pos];
    rotorDisplays[1].innerText = ALPHABET[rotorSlots[1].pos];
    rotorDisplays[2].innerText = ALPHABET[rotorSlots[2].pos];
}

// --- Plugboard Logic ---

function togglePlugboard() {
    const content = document.querySelector('.drawer-content');
    content.classList.toggle('open');
}

function resetPlugboard() {
    plugboardMap = {};
}

function updatePlugboard() {
    resetPlugboard();
    const input = document.getElementById('plug-settings').value.toUpperCase();
    const pairs = input.split(' ').filter(p => p.length === 2);
    
    let used = new Set();
    let validCount = 0;

    pairs.forEach(pair => {
        const a = pair[0];
        const b = pair[1];

        // Validate: A-Z only, no duplicates
        if (ALPHABET.includes(a) && ALPHABET.includes(b) && a !== b) {
            if (!used.has(a) && !used.has(b)) {
                plugboardMap[a] = b;
                plugboardMap[b] = a;
                used.add(a);
                used.add(b);
                validCount++;
            }
        }
    });

    document.getElementById('plug-status').innerText = `Valid: ${validCount} pairs`;
}

// Start
init();
updateRotorUI();