// --- DOM Elements ---
const canvas = document.getElementById('armCanvas');
const ctx = canvas.getContext('2d');
const uiTargetX = document.getElementById('target-x');
const uiTargetY = document.getElementById('target-y');
const uiAngleX = document.getElementById('angle-x');
const uiAngleY = document.getElementById('angle-y');
const uiStatus = document.getElementById('reach-status');
const slideJoints = document.getElementById('joint-count');
const slideLen = document.getElementById('link-len');
const nodeDisplay = document.getElementById('node-display');
const lenDisplay = document.getElementById('len-display');
const btnGuide = document.getElementById('btn-guide');
const btnCloseGuide = document.getElementById('close-guide');
const modal = document.getElementById('guide-modal');

// --- Arm Configuration ---
const baseX = canvas.width / 2;
const baseY = canvas.height / 2; 

let numLinks = parseInt(slideJoints.value);
let linkLength = parseInt(slideLen.value);
let joints = []; 

let targetX = baseX;
let targetY = baseY - (numLinks * linkLength);
let isDragging = false;

// Initialize the joint array
function initArm() {
    joints = [];
    for (let i = 0; i <= numLinks; i++) {
        joints.push({ x: baseX, y: baseY - (i * linkLength) });
    }
    solveFABRIK();
}

// --- Event Listeners ---
slideJoints.addEventListener('input', (e) => {
    numLinks = parseInt(e.target.value);
    nodeDisplay.textContent = numLinks;
    initArm();
});

slideLen.addEventListener('input', (e) => {
    linkLength = parseInt(e.target.value);
    lenDisplay.textContent = linkLength;
    initArm();
});

btnGuide.addEventListener('click', () => modal.classList.remove('hidden'));
btnCloseGuide.addEventListener('click', () => modal.classList.add('hidden'));

// Canvas Interaction
canvas.addEventListener('mousedown', (e) => { isDragging = true; updateTarget(e); });
canvas.addEventListener('mousemove', (e) => { if (isDragging) updateTarget(e); });
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

function updateTarget(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    targetX = (e.clientX - rect.left) * scaleX;
    targetY = (e.clientY - rect.top) * scaleY;
    solveFABRIK();
}

// --- FABRIK Inverse Kinematics Engine ---
function solveFABRIK() {
    let totalLength = numLinks * linkLength;
    let distToTarget = Math.hypot(targetX - baseX, targetY - baseY);

    // Update XY Telemetry
    uiTargetX.textContent = Math.round(targetX - baseX);
    uiTargetY.textContent = Math.round(baseY - targetY); 

    if (distToTarget > totalLength) {
        
        uiStatus.textContent = "OUT OF BOUNDS";
        uiStatus.className = "status-error";
        
        for (let i = 1; i <= numLinks; i++) {
            let prev = joints[i - 1];
            let angle = Math.atan2(targetY - prev.y, targetX - prev.x);
            joints[i].x = prev.x + Math.cos(angle) * linkLength;
            joints[i].y = prev.y + Math.sin(angle) * linkLength;
        }
    } else {
        
        uiStatus.textContent = "REACHABLE";
        uiStatus.className = "";
        
        let tolerance = 0.1;
        let iter = 0;
        let maxIter = 20;

        while (Math.hypot(joints[numLinks].x - targetX, joints[numLinks].y - targetY) > tolerance && iter < maxIter) {
            
            // 1. FORWARD PASS
            joints[numLinks].x = targetX;
            joints[numLinks].y = targetY;
            for (let i = numLinks - 1; i >= 0; i--) {
                let next = joints[i + 1];
                let curr = joints[i];
                let angle = Math.atan2(curr.y - next.y, curr.x - next.x);
                joints[i].x = next.x + Math.cos(angle) * linkLength;
                joints[i].y = next.y + Math.sin(angle) * linkLength;
            }

            // 2. BACKWARD PASS
            joints[0].x = baseX;
            joints[0].y = baseY;
            for (let i = 1; i <= numLinks; i++) {
                let prev = joints[i - 1];
                let curr = joints[i];
                let angle = Math.atan2(curr.y - prev.y, curr.x - prev.x);
                joints[i].x = prev.x + Math.cos(angle) * linkLength;
                joints[i].y = prev.y + Math.sin(angle) * linkLength;
            }
            iter++;
        }
    }

    calculateTelemetryAngles();
    render();
}

// Calculate Angles from Axes
function calculateTelemetryAngles() {
    let tipX = joints[numLinks].x;
    let tipY = joints[numLinks].y;

    // Delta from origin (base)
    let dx = tipX - baseX;
    let dy = baseY - tipY; // Standard Cartesian (Up is positive)

    // Calculate angle from X-Axis (0 to 360)
    let degX = Math.atan2(dy, dx) * 180 / Math.PI;
    if (degX < 0) degX += 360;

    // Calculate angle from Y-Axis (0 to 360)
    let degY = Math.atan2(dx, dy) * 180 / Math.PI;
    if (degY < 0) degY += 360;

    // Update UI Elements
    uiAngleX.textContent = degX.toFixed(1);
    uiAngleY.textContent = degY.toFixed(1);
}

// --- Rendering Engine ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw X and Y Axes (Dashed Lines)
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    ctx.lineTo(canvas.width, baseY); 
    ctx.moveTo(baseX, 0);
    ctx.lineTo(baseX, canvas.height); 
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'; 
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); 
    ctx.stroke();
    ctx.setLineDash([]); 

    // Draw Links
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(joints[0].x, joints[0].y);
    for (let i = 1; i <= numLinks; i++) {
        ctx.lineTo(joints[i].x, joints[i].y);
    }
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    // Draw Joints
    for (let i = 0; i <= numLinks; i++) {
        let color = (i === 0) ? '#10b981' : (i === numLinks) ? '#f59e0b' : '#3b82f6';
        let radius = (i === 0) ? 12 : 8;
        
        ctx.beginPath();
        ctx.arc(joints[i].x, joints[i].y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw Target Reticle
    ctx.beginPath();
    ctx.arc(targetX, targetY, 15, 0, Math.PI * 2);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Start
initArm();