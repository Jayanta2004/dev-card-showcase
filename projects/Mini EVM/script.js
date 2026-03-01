/**
 * Mini-EVM Engine
 * Simulates a Stack Machine with Opcode parsing and Memory management.
 */

// --- Constants ---
const OPCODES = {
    PUSH: 'PUSH',   // Pushes value to stack
    POP: 'POP',     // Removes top value
    ADD: 'ADD',     // Pops 2, Adds, Pushes result
    SUB: 'SUB',     // Pops 2, Subtracts, Pushes result
    MUL: 'MUL',     // Pops 2, Multiplies, Pushes result
    DIV: 'DIV',     // Pops 2, Divides, Pushes result
    STORE: 'STORE', // Pops val, Stores at Address (STORE 0)
    LOAD: 'LOAD',   // Loads from Address, Pushes to stack (LOAD 0)
    JUMP: 'JUMP',   // Moves PC to line
    PRINT: 'PRINT', // Logs top value (peek)
    STOP: 'STOP'    // Halts execution
};

// --- State ---
let stack = [];
let memory = {};
let program = []; // Array of parsed instructions
let pc = 0;       // Program Counter
let isRunning = false;
let gasUsed = 0;

// --- DOM Elements ---
const codeInput = document.getElementById('code-input');
const stackContainer = document.getElementById('stack-container');
const memGrid = document.getElementById('memory-grid');
const consoleEl = document.getElementById('console-output');
const lineNums = document.getElementById('line-numbers');
const pcDisplay = document.getElementById('val-pc');
const gasDisplay = document.getElementById('val-gas');
const stackCount = document.getElementById('stack-count');

const btnRun = document.getElementById('btn-run');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');
const exampleSelect = document.getElementById('example-select');

// --- Examples ---
const EXAMPLES = {
    simple: `// Simple Math: (10 + 20) * 2
PUSH 10
PUSH 20
ADD
PUSH 2
MUL
PRINT`,
    store: `// Memory Storage
PUSH 99
STORE 0
PUSH 50
STORE 1
LOAD 0
LOAD 1
SUB
PRINT`,
    loop: `// Infinite Loop (Crash Test)
PUSH 1
ADD
JUMP 0`
};

// --- Initialization ---
function init() {
    bindEvents();
    renderMemory(); // Empty state
}

function bindEvents() {
    btnRun.addEventListener('click', runAll);
    btnStep.addEventListener('click', step);
    btnReset.addEventListener('click', resetVM);
    
    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('scroll', () => {
        lineNums.scrollTop = codeInput.scrollTop;
    });

    exampleSelect.addEventListener('change', (e) => {
        if(EXAMPLES[e.target.value]) {
            codeInput.value = EXAMPLES[e.target.value];
            updateLineNumbers();
            resetVM();
        }
    });
}

// --- VM Logic ---

function parseCode() {
    const rawLines = codeInput.value.split('\n');
    program = rawLines.map(line => {
        const parts = line.trim().split(/\s+/);
        const op = parts[0].toUpperCase();
        
        // Skip comments and empty lines
        if (!op || op.startsWith('//')) return null;
        
        let arg = parts[1] ? parseInt(parts[1]) : null;
        
        // Validate Opcode
        if (!OPCODES[op]) return { op: 'ERROR', original: line };
        
        return { op, arg };
    });
    
    // Filter nulls but keep index alignment? No, real PCs map line-to-instruction.
    // For visual debugging, we need to map PC to Line Number.
    // Let's store line index.
    
    program = [];
    rawLines.forEach((line, idx) => {
        const parts = line.trim().split(/\s+/);
        const op = parts[0].toUpperCase();
        if (op && !op.startsWith('//')) {
            program.push({ 
                op: OPCODES[op] ? op : 'ERROR', 
                arg: parts[1] ? parseInt(parts[1]) : null,
                line: idx + 1
            });
        }
    });
}

function step() {
    if (program.length === 0) parseCode();
    
    if (pc >= program.length) {
        log("Program ended.", "system");
        return false;
    }

    const instr = program[pc];
    if (!instr) { pc++; return true; } // Safety skip

    if (instr.op === 'ERROR') {
        log(`Syntax Error at Line ${instr.line}`, "error");
        return false;
    }

    try {
        executeInstruction(instr);
        gasUsed++;
        pc++;
        updateUI();
        highlightLine(instr.line);
        return true;
    } catch (e) {
        log(`Runtime Error (Line ${instr.line}): ${e.message}`, "error");
        return false;
    }
}

async function runAll() {
    resetVM();
    parseCode();
    
    isRunning = true;
    btnRun.disabled = true;
    btnStep.disabled = true;
    
    // Async loop for animation visibility
    const loop = async () => {
        if (!isRunning) return;
        
        const success = step();
        if (success) {
            await new Promise(r => setTimeout(r, 400)); // 400ms delay for visual effect
            requestAnimationFrame(loop);
        } else {
            isRunning = false;
            btnRun.disabled = false;
            btnStep.disabled = false;
        }
    };
    loop();
}

function executeInstruction(instr) {
    log(`EXEC: ${instr.op} ${instr.arg !== null ? instr.arg : ''}`, "exec");

    switch (instr.op) {
        case 'PUSH':
            if (isNaN(instr.arg)) throw new Error("PUSH requires a number");
            stack.push(instr.arg);
            animatePush(instr.arg);
            break;
            
        case 'POP':
            if (stack.length === 0) throw new Error("Stack Underflow");
            const val = stack.pop();
            animatePop();
            break;
            
        case 'ADD':
            if (stack.length < 2) throw new Error("Stack Underflow");
            const a = stack.pop();
            const b = stack.pop();
            const res = a + b;
            stack.push(res);
            animateOp(res);
            break;

        case 'SUB':
            if (stack.length < 2) throw new Error("Stack Underflow");
            const subA = stack.pop();
            const subB = stack.pop();
            const subRes = subB - subA; // Order matters
            stack.push(subRes);
            animateOp(subRes);
            break;

        case 'MUL':
            if (stack.length < 2) throw new Error("Stack Underflow");
            const mulRes = stack.pop() * stack.pop();
            stack.push(mulRes);
            animateOp(mulRes);
            break;

        case 'STORE':
            if (stack.length === 0) throw new Error("Stack Underflow");
            if (instr.arg === null) throw new Error("STORE requires address");
            const storeVal = stack.pop();
            memory[instr.arg] = storeVal;
            animatePop();
            renderMemory();
            break;

        case 'LOAD':
            if (instr.arg === null) throw new Error("LOAD requires address");
            const loadVal = memory[instr.arg] || 0;
            stack.push(loadVal);
            animatePush(loadVal);
            break;
            
        case 'PRINT':
            if (stack.length === 0) throw new Error("Stack Empty");
            log(`>> OUTPUT: ${stack[stack.length-1]}`, "success");
            break;

        case 'JUMP':
            // PC is incremented after execute, so set to target - 1
            // But we map lines... jumping is tricky in this simplified map.
            // Advanced: use labels. Basic: jump to instruction index.
            // For now, ignore to prevent infinite loop complexity in this demo level.
            log("JUMP not fully implemented in Demo Mode", "system");
            break;
    }
}

// --- UI Updates ---

function resetVM() {
    stack = [];
    memory = {};
    pc = 0;
    gasUsed = 0;
    isRunning = false;
    
    // Clear UI
    stackContainer.innerHTML = '<div class="stack-base">BOTTOM</div>';
    consoleEl.innerHTML = '<span class="log-system">VM Reset.</span>';
    renderMemory();
    updateUI();
    
    // Reset highlights
    document.querySelectorAll('.active-line').forEach(el => el.classList.remove('active-line'));
}

function updateUI() {
    pcDisplay.innerText = pc.toString().padStart(2, '0');
    gasDisplay.innerText = gasUsed;
    stackCount.innerText = `Depth: ${stack.length}`;
}

function updateLineNumbers() {
    const lines = codeInput.value.split('\n').length;
    lineNums.innerHTML = Array(lines).fill(0).map((_, i) => `<div>${i + 1}</div>`).join('');
}

function highlightLine(lineNum) {
    // This is tricky with textarea. We can't highlight the textarea directly easily.
    // Instead we highlight the line number or use a backdrop overlay.
    // Simple approach: Highlight line number.
    const nums = lineNums.children;
    if (nums[lineNum - 1]) {
        document.querySelectorAll('.active-line').forEach(el => el.classList.remove('active-line'));
        nums[lineNum - 1].classList.add('active-line');
    }
}

function renderMemory() {
    memGrid.innerHTML = '';
    const keys = Object.keys(memory).sort((a,b) => a-b);
    
    if (keys.length === 0) {
        memGrid.innerHTML = '<div class="empty-mem">Memory Empty</div>';
        return;
    }

    keys.forEach(addr => {
        const div = document.createElement('div');
        div.className = 'mem-slot';
        div.innerHTML = `<span class="mem-addr">0x${parseInt(addr).toString(16).toUpperCase().padStart(2,'0')}</span> <span class="mem-val">${memory[addr]}</span>`;
        memGrid.appendChild(div);
    });
}

function log(msg, type) {
    const span = document.createElement('div');
    span.className = `log-${type}`;
    span.innerText = msg;
    consoleEl.appendChild(span);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// --- Animations ---
// We handle DOM updates manually here to sync with "Logic Stack"
function animatePush(val) {
    const el = document.createElement('div');
    el.className = 'stack-item';
    el.innerText = val;
    stackContainer.insertBefore(el, stackContainer.firstChild); // Prepend (Top is visual top)
    // Actually stackContainer grows DOWN in HTML but we use flex-col-reverse
    // So appendChild puts it at "Top" visually if reverse
    // With flex-direction: column-reverse, firstChild is at the bottom visually.
    // So we appendChild to put it at the "Top" (end of list)
    
    // Wait, let's check CSS. 
    // column-reverse: last element in DOM is at TOP.
    stackContainer.appendChild(el);
}

function animatePop() {
    const el = stackContainer.lastElementChild;
    if (el && !el.classList.contains('stack-base')) {
        el.classList.add('popping');
        setTimeout(() => el.remove(), 250);
    }
}

function animateOp(result) {
    // Pop animation handled by logic calling pop? 
    // Logic: ADD calls stack.pop() twice.
    // But we want to visualize the replacement.
    // The loop handles it: step() -> execute() -> logic updates array -> we should re-render or animate actions.
    
    // For smoother visuals in "Run" mode, we simplify:
    // Re-render stack from scratch is safest to match array state.
    
    // Clear visual stack (except base)
    stackContainer.innerHTML = '<div class="stack-base">BOTTOM</div>';
    
    stack.forEach(val => {
        const el = document.createElement('div');
        el.className = 'stack-item';
        el.innerText = val;
        stackContainer.appendChild(el);
    });
}

// Start
init();