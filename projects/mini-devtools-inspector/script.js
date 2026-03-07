const styleInspector = document.getElementById("styleInspector");
const boxModel = document.getElementById("boxModel");
const overlay = document.getElementById("highlightOverlay");
const perfCanvas = document.getElementById("perfCanvas");
const selectedElementDisplay = document.getElementById("selectedElement");

const ctx = perfCanvas.getContext("2d");
perfCanvas.width = 600;
perfCanvas.height = 150;

let inspectMode = false;
let paintMode = false;
let performanceData = [];
let currentElement = null;

/* ========================= */
/* INSPECT MODE */
/* ========================= */

document.getElementById("inspectMode").onclick = () => {
    inspectMode = !inspectMode;
};

document.addEventListener("mousemove", (e) => {
    if (!inspectMode) return;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element === overlay) return;

    highlightElement(element);
});

document.addEventListener("click", (e) => {
    if (!inspectMode) return;

    e.preventDefault();
    e.stopPropagation();

    inspectElement(e.target);
    inspectMode = false;
});

/* ========================= */
/* HIGHLIGHT */
/* ========================= */

function highlightElement(element) {
    const rect = element.getBoundingClientRect();
    overlay.style.display = "block";
    overlay.style.left = rect.left + "px";
    overlay.style.top = rect.top + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
}

/* ========================= */
/* INSPECT ELEMENT */
/* ========================= */

function inspectElement(element) {
    currentElement = element;
    selectedElementDisplay.innerText =
        element.tagName.toLowerCase() +
        (element.id ? "#" + element.id : "") +
        (element.className ? "." + element.className : "");

    showStyles(element);
    showBoxModel(element);
    simulatePerformance();
}

/* ========================= */
/* STYLE INSPECTOR (LIMITED SAFE PROPS) */
/* ========================= */

const allowedProps = [
    "width","height","margin","padding",
    "background","color","display",
    "position","top","left","right","bottom",
    "border","font-size","font-weight"
];

function showStyles(element) {
    styleInspector.innerHTML = "";
    const styles = getComputedStyle(element);

    allowedProps.forEach(prop => {
        const row = document.createElement("div");

        const label = document.createElement("span");
        label.textContent = prop + ": ";

        const input = document.createElement("input");
        input.value = styles[prop];

        input.oninput = (e) => {
            element.style[prop] = e.target.value;
            flashPaint(element);
        };

        row.appendChild(label);
        row.appendChild(input);
        styleInspector.appendChild(row);
    });
}

/* ========================= */
/* BOX MODEL */
/* ========================= */

function showBoxModel(element) {
    const rect = element.getBoundingClientRect();
    boxModel.innerHTML = `
        <div>Width: ${Math.round(rect.width)}px</div>
        <div>Height: ${Math.round(rect.height)}px</div>
        <div>Top: ${Math.round(rect.top)}px</div>
        <div>Left: ${Math.round(rect.left)}px</div>
    `;
}

/* ========================= */
/* PAINT FLASHING */
/* ========================= */

document.getElementById("paintMode").onclick = () => {
    paintMode = !paintMode;
};

function flashPaint(element) {
    if (!paintMode) return;

    const original = element.style.outline;
    element.style.outline = "3px solid red";

    setTimeout(() => {
        element.style.outline = original;
    }, 150);
}

/* ========================= */
/* PERFORMANCE GRAPH */
/* ========================= */

function simulatePerformance() {
    performanceData.push(Math.random() * 100);
    if (performanceData.length > 50) performanceData.shift();
}

function drawPerformanceGraph() {
    ctx.clearRect(0, 0, perfCanvas.width, perfCanvas.height);

    if (performanceData.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(0, perfCanvas.height - performanceData[0]);

    performanceData.forEach((value, index) => {
        ctx.lineTo(index * 12, perfCanvas.height - value);
    });

    ctx.strokeStyle = "#38bdf8";
    ctx.stroke();
}

/* ========================= */
/* FPS METER */
/* ========================= */

let lastTime = performance.now();
let fps = 0;

function calculateFPS() {
    const now = performance.now();
    fps = 1000 / (now - lastTime);
    lastTime = now;
    requestAnimationFrame(calculateFPS);
}

calculateFPS();

const fpsDisplay = document.createElement("div");
fpsDisplay.style.position = "fixed";
fpsDisplay.style.top = "10px";
fpsDisplay.style.right = "10px";
fpsDisplay.style.color = "lime";
document.body.appendChild(fpsDisplay);

setInterval(() => {
    fpsDisplay.innerText = "FPS: " + fps.toFixed(1);
}, 500);

/* ========================= */
/* LOOP */
/* ========================= */

function loop() {
    drawPerformanceGraph();
    requestAnimationFrame(loop);
}

loop();