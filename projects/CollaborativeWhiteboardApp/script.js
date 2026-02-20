const canvas = document.getElementById("boardCanvas");
const board = document.getElementById("board");
const stickyLayer = document.getElementById("stickyLayer");
const joinButton = document.getElementById("joinRoom");
const roomInput = document.getElementById("roomId");
const nameInput = document.getElementById("userName");
const participantList = document.getElementById("participantList");
const brushSizeInput = document.getElementById("brushSize");
const brushOpacityInput = document.getElementById("brushOpacity");
const brushColorInput = document.getElementById("brushColor");

const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const clearBtn = document.getElementById("clearBtn");
const addStickyBtn = document.getElementById("addSticky");
const exportPngBtn = document.getElementById("exportPng");
const exportPdfBtn = document.getElementById("exportPdf");

const toolButtons = document.querySelectorAll(".tool-button");

const ctx = canvas.getContext("2d");

let isDrawing = false;
let currentTool = "pen";
let currentStroke = null;
let scale = 1;
let offset = { x: 0, y: 0 };
let isPanning = false;
let lastPan = { x: 0, y: 0 };
let channel = null;

const user = {
  id: crypto.randomUUID(),
  name: "Guest",
  color: "#2563eb",
  room: "default-room",
};

const state = {
  strokes: [],
  undoStack: [],
  redoStack: [],
  notes: [],
  participants: new Map(),
};

const storageKey = () => `whiteboard-${user.room}`;

const resizeCanvas = () => {
  canvas.width = board.clientWidth * devicePixelRatio;
  canvas.height = board.clientHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  redraw();
};

const setTool = (tool) => {
  currentTool = tool;
  toolButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tool === tool);
  });
};

const getPoint = (event) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left - offset.x) / scale,
    y: (event.clientY - rect.top - offset.y) / scale,
  };
};

const drawStroke = (stroke) => {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.globalAlpha = stroke.opacity;
  ctx.beginPath();
  stroke.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.restore();
};

const redraw = () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, offset.x, offset.y);
  state.strokes.forEach(drawStroke);
};

const broadcast = (message) => {
  if (!channel) return;
  channel.postMessage({
    ...message,
    sender: user.id,
    room: user.room,
  });
};

const saveState = () => {
  const data = {
    strokes: state.strokes,
    notes: state.notes,
  };
  localStorage.setItem(storageKey(), JSON.stringify(data));
};

const loadState = () => {
  const saved = localStorage.getItem(storageKey());
  if (!saved) return;
  const data = JSON.parse(saved);
  state.strokes = data.strokes || [];
  state.notes = data.notes || [];
};

const addStroke = (stroke, pushUndo = true) => {
  state.strokes.push(stroke);
  if (pushUndo) {
    state.undoStack.push({ type: "stroke", payload: stroke });
    state.redoStack = [];
  }
  drawStroke(stroke);
  saveState();
};

const renderParticipants = () => {
  participantList.innerHTML = "";
  const values = Array.from(state.participants.values());
  values.forEach((participant) => {
    const item = document.createElement("div");
    item.className = "participant";
    item.innerHTML = `<span style="background:${participant.color}"></span>${participant.name}`;
    participantList.appendChild(item);
  });
};

const addParticipant = (payload) => {
  state.participants.set(payload.id, payload);
  renderParticipants();
};

const removeParticipant = (id) => {
  state.participants.delete(id);
  renderParticipants();
};

const createSticky = (note) => {
  const sticky = document.createElement("div");
  sticky.className = "sticky";
  sticky.style.left = `${note.x}px`;
  sticky.style.top = `${note.y}px`;
  sticky.dataset.id = note.id;
  sticky.innerHTML = `
    <div class="sticky-header">
      <span>${note.author}</span>
      <button aria-label="Delete">✕</button>
    </div>
    <textarea>${note.text}</textarea>
  `;
  const header = sticky.querySelector(".sticky-header");
  const textArea = sticky.querySelector("textarea");
  const deleteBtn = sticky.querySelector("button");

  let dragOffset = { x: 0, y: 0 };
  const onMouseDown = (event) => {
    dragOffset = { x: event.offsetX, y: event.offsetY };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  const onMouseMove = (event) => {
    const rect = board.getBoundingClientRect();
    const x = event.clientX - rect.left - dragOffset.x;
    const y = event.clientY - rect.top - dragOffset.y;
    sticky.style.left = `${x}px`;
    sticky.style.top = `${y}px`;
  };
  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    const updated = state.notes.find((n) => n.id === note.id);
    if (updated) {
      updated.x = parseFloat(sticky.style.left);
      updated.y = parseFloat(sticky.style.top);
      saveState();
      broadcast({ type: "sticky-move", payload: updated });
    }
  };

  header.addEventListener("mousedown", onMouseDown);

  textArea.addEventListener("input", () => {
    const updated = state.notes.find((n) => n.id === note.id);
    if (updated) {
      updated.text = textArea.value;
      saveState();
      broadcast({ type: "sticky-update", payload: updated });
    }
  });

  deleteBtn.addEventListener("click", () => {
    state.notes = state.notes.filter((n) => n.id !== note.id);
    sticky.remove();
    saveState();
    broadcast({ type: "sticky-delete", payload: { id: note.id } });
  });

  stickyLayer.appendChild(sticky);
};

const renderNotes = () => {
  stickyLayer.innerHTML = "";
  state.notes.forEach(createSticky);
};

const applyMessage = (message) => {
  if (message.sender === user.id) return;
  switch (message.type) {
    case "join":
      addParticipant(message.payload);
      break;
    case "leave":
      removeParticipant(message.payload.id);
      break;
    case "stroke":
      addStroke(message.payload, false);
      break;
    case "undo":
      if (state.strokes.length) {
        state.redoStack.push(state.strokes.pop());
        redraw();
      }
      break;
    case "redo":
      if (state.redoStack.length) {
        state.strokes.push(state.redoStack.pop());
        redraw();
      }
      break;
    case "clear":
      state.strokes = [];
      state.undoStack = [];
      state.redoStack = [];
      redraw();
      break;
    case "sticky-add":
      state.notes.push(message.payload);
      renderNotes();
      saveState();
      break;
    case "sticky-update":
    case "sticky-move": {
      const idx = state.notes.findIndex((n) => n.id === message.payload.id);
      if (idx !== -1) state.notes[idx] = message.payload;
      renderNotes();
      saveState();
      break;
    }
    case "sticky-delete":
      state.notes = state.notes.filter((n) => n.id !== message.payload.id);
      renderNotes();
      saveState();
      break;
    default:
      break;
  }
};

const initChannel = () => {
  if (channel) channel.close();
  channel = new BroadcastChannel(`whiteboard-${user.room}`);
  channel.addEventListener("message", (event) => applyMessage(event.data));
  broadcast({ type: "join", payload: user });
  addParticipant(user);
};

const startDrawing = (event) => {
  if (currentTool === "pan") {
    isPanning = true;
    lastPan = { x: event.clientX, y: event.clientY };
    return;
  }
  if (currentTool === "pen" || currentTool === "eraser") {
    isDrawing = true;
    const point = getPoint(event);
    currentStroke = {
      id: crypto.randomUUID(),
      tool: currentTool,
      color: brushColorInput.value,
      size: Number(brushSizeInput.value),
      opacity: Number(brushOpacityInput.value),
      points: [point],
    };
  }
};

const draw = (event) => {
  if (isPanning) {
    const dx = event.clientX - lastPan.x;
    const dy = event.clientY - lastPan.y;
    offset.x += dx;
    offset.y += dy;
    lastPan = { x: event.clientX, y: event.clientY };
    redraw();
    return;
  }
  if (!isDrawing || !currentStroke) return;
  const point = getPoint(event);
  currentStroke.points.push(point);
  redraw();
  drawStroke(currentStroke);
};

const stopDrawing = () => {
  if (isPanning) {
    isPanning = false;
    return;
  }
  if (!isDrawing || !currentStroke) return;
  isDrawing = false;
  addStroke(currentStroke);
  broadcast({ type: "stroke", payload: currentStroke });
  currentStroke = null;
};

const addSticky = () => {
  const note = {
    id: crypto.randomUUID(),
    author: user.name,
    text: "New idea...",
    x: 40,
    y: 40,
  };
  state.notes.push(note);
  createSticky(note);
  saveState();
  broadcast({ type: "sticky-add", payload: note });
};

const handleUndo = () => {
  const last = state.undoStack.pop();
  if (!last || last.type !== "stroke") return;
  state.redoStack.push(last.payload);
  state.strokes = state.strokes.filter((stroke) => stroke.id !== last.payload.id);
  redraw();
  saveState();
  broadcast({ type: "undo" });
};

const handleRedo = () => {
  const redoStroke = state.redoStack.pop();
  if (!redoStroke) return;
  state.strokes.push(redoStroke);
  redraw();
  saveState();
  broadcast({ type: "redo" });
};

const clearBoard = () => {
  state.strokes = [];
  state.undoStack = [];
  state.redoStack = [];
  redraw();
  saveState();
  broadcast({ type: "clear" });
};

const exportBoard = async (asPdf) => {
  const canvasSnapshot = await html2canvas(board, {
    backgroundColor: "#ffffff",
    scale: 2,
  });
  if (!asPdf) {
    const link = document.createElement("a");
    link.href = canvasSnapshot.toDataURL("image/png");
    link.download = "whiteboard.png";
    link.click();
    return;
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvasSnapshot.width, canvasSnapshot.height],
  });
  pdf.addImage(canvasSnapshot.toDataURL("image/png"), "PNG", 0, 0, canvasSnapshot.width, canvasSnapshot.height);
  pdf.save("whiteboard.pdf");
};

const joinRoom = () => {
  user.room = roomInput.value.trim() || "default-room";
  user.name = nameInput.value.trim() || "Guest";
  user.color = brushColorInput.value;
  state.participants.clear();
  loadState();
  renderNotes();
  redraw();
  initChannel();
};

window.addEventListener("resize", resizeCanvas);
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

addStickyBtn.addEventListener("click", addSticky);
undoBtn.addEventListener("click", handleUndo);
redoBtn.addEventListener("click", handleRedo);
clearBtn.addEventListener("click", clearBoard);
exportPngBtn.addEventListener("click", () => exportBoard(false));
exportPdfBtn.addEventListener("click", () => exportBoard(true));
joinButton.addEventListener("click", joinRoom);

brushColorInput.addEventListener("change", () => {
  user.color = brushColorInput.value;
  if (state.participants.has(user.id)) {
    state.participants.set(user.id, user);
    renderParticipants();
  }
});

toolButtons.forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

setTool("pen");
joinRoom();
resizeCanvas();
