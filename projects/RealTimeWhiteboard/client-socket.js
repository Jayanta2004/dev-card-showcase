const socket = io();
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
let drawing = false;
let current = { color: '#000000', size: 2 };
let paths = [];
let undone = [];

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseout', endDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', endDraw);

function getPos(e) {
    if (e.touches) {
        return {
            x: e.touches[0].clientX - canvas.getBoundingClientRect().left,
            y: e.touches[0].clientY - canvas.getBoundingClientRect().top
        };
    } else {
        return {
            x: e.clientX - canvas.getBoundingClientRect().left,
            y: e.clientY - canvas.getBoundingClientRect().top
        };
    }
}

function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    current.path = [{ x: pos.x, y: pos.y }];
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    current.path.push({ x: pos.x, y: pos.y });
    redraw();
    socket.emit('draw', { ...current, path: [...current.path] });
}

function endDraw(e) {
    if (!drawing) return;
    drawing = false;
    paths.push({ ...current, path: [...current.path] });
    undone = [];
    redraw();
    socket.emit('draw', { ...current, path: [...current.path] });
}

function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of paths) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        for (let i = 0; i < p.path.length; i++) {
            const pt = p.path[i];
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
    }
    if (drawing && current.path) {
        ctx.strokeStyle = current.color;
        ctx.lineWidth = current.size;
        ctx.beginPath();
        for (let i = 0; i < current.path.length; i++) {
            const pt = current.path[i];
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
    }
}

document.getElementById('colorPicker').addEventListener('input', e => {
    current.color = e.target.value;
});
document.getElementById('brushSize').addEventListener('change', e => {
    current.size = parseInt(e.target.value);
});
document.getElementById('undoBtn').addEventListener('click', () => {
    if (paths.length > 0) {
        undone.push(paths.pop());
        redraw();
    }
});
document.getElementById('redoBtn').addEventListener('click', () => {
    if (undone.length > 0) {
        paths.push(undone.pop());
        redraw();
    }
});
document.getElementById('exportBtn').addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard.png';
    a.click();
});

// Collaborative drawing sync
socket.on('draw', data => {
    paths.push(data);
    redraw();
});

// Chat
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
document.getElementById('sendChatBtn').addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (msg) {
        socket.emit('chat', msg);
        chatInput.value = '';
    }
});
socket.on('chat', msg => {
    const div = document.createElement('div');
    div.textContent = msg;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
