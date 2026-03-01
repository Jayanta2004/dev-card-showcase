// Ripple Effect Messenger App Logic
// Data model: ripple nodes, messages, users, badges, stats
// Visualization: SVG ripples, ripple network, interactivity

const STORAGE_KEY = 'rippleMessengerData';

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: [], ripples: [], badges: [], stats: {} };
  return JSON.parse(raw);
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Ripple node
class RippleNode {
  constructor(sender, recipient, message, parentId = null) {
    this.id = Date.now() + Math.random();
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
    this.parentId = parentId;
    this.children = [];
    this.radius = 30;
    this.color = RippleNode.getColor(sender);
    this.date = new Date().toISOString();
  }
  static getColor(sender) {
    // Assign color based on sender name hash
    let hash = 0;
    for (let i = 0; i < sender.length; i++) hash = sender.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue},70%,60%)`;
  }
}

// Ripple model
class RippleMessenger {
  constructor() {
    this.nodes = [];
    this.users = [];
    this.load();
  }
  addUser(username) {
    if (!this.users.includes(username)) {
      this.users.push(username);
      this.save();
    }
  }
  sendRipple(sender, recipient, message, parentId = null) {
    const node = new RippleNode(sender, recipient, message, parentId);
    this.nodes.push(node);
    this.addUser(sender);
    this.addUser(recipient);
    // Link to parent
    if (parentId) {
      const parent = this.nodes.find(n => n.id === parentId);
      if (parent) parent.children.push(node.id);
    }
    this.save();
    return node;
  }
  getRoots() {
    return this.nodes.filter(n => !n.parentId);
  }
  getChildren(nodeId) {
    return this.nodes.filter(n => n.parentId === nodeId);
  }
  getNode(nodeId) {
    return this.nodes.find(n => n.id === nodeId);
  }
  getStats() {
    return {
      totalRipples: this.nodes.length,
      totalUsers: this.users.length,
      mostInfluentialRipple: this.getMostInfluentialRipple(),
      farthestRipple: this.getFarthestRipple(),
    };
  }
  getMostInfluentialRipple() {
    // Ripple with most children
    let max = 0, influential = null;
    this.nodes.forEach(n => {
      if (n.children.length > max) {
        max = n.children.length;
        influential = n;
      }
    });
    return influential ? influential.sender : '';
  }
  getFarthestRipple() {
    // Ripple with longest chain
    let maxDepth = 0, farthest = null;
    function dfs(node, depth) {
      if (depth > maxDepth) {
        maxDepth = depth;
        farthest = node;
      }
      node.children.forEach(cid => {
        const child = this.getNode(cid);
        if (child) dfs.call(this, child, depth+1);
      });
    }
    this.getRoots().forEach(root => dfs.call(this, root, 1));
    return farthest ? farthest.sender : '';
  }
  getBadges() {
    const stats = this.getStats();
    const badges = [];
    if (stats.totalRipples >= 5) badges.push('Ripple Starter');
    if (stats.totalRipples >= 15) badges.push('Wave Maker');
    if (stats.totalRipples >= 30) badges.push('Pond Legend');
    if (stats.mostInfluentialRipple) badges.push(`Most Influential: ${stats.mostInfluentialRipple}`);
    if (stats.farthestRipple) badges.push(`Farthest Ripple: ${stats.farthestRipple}`);
    return badges;
  }
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({nodes: this.nodes, users: this.users}));
  }
  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const obj = JSON.parse(data);
      this.nodes = obj.nodes || [];
      this.users = obj.users || [];
    }
  }
}

const messenger = new RippleMessenger();

function renderLoginSection() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="form-section">
      <h2>Login</h2>
      <input id="username" placeholder="Enter your name" />
      <button onclick="onLogin()">Login</button>
    </div>
  `;
}
function onLogin() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter your name');
  sessionStorage.setItem('currentUser', username);
  messenger.addUser(username);
  renderApp();
}
function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

function renderSendRippleSection(parentId = null) {
  const app = document.getElementById('app');
  app.innerHTML += `
    <div class="form-section">
      <h2>Send a Ripple</h2>
      <input id="recipient" placeholder="Recipient's name" />
      <textarea id="message" placeholder="Your positive message"></textarea>
      <button onclick="onSendRipple(${parentId})">Send Ripple</button>
    </div>
  `;
}
function onSendRipple(parentId = null) {
  const recipient = document.getElementById('recipient').value.trim();
  const message = document.getElementById('message').value.trim();
  const sender = getCurrentUser();
  if (!recipient || !message) return alert('Fill all fields');
  messenger.sendRipple(sender, recipient, message, parentId);
  renderApp();
}

function renderRippleVisual() {
  const app = document.getElementById('app');
  app.innerHTML += `<div class="ripple-visual" id="rippleVisual"></div>`;
  const roots = messenger.getRoots();
  const svgWidth = 900, svgHeight = 400;
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  let yStep = 80;
  function drawRipple(node, x, y, depth) {
    const children = messenger.getChildren(node.id);
    svg += `<circle cx="${x}" cy="${y}" r="${node.radius + depth*10}" fill="${node.color}" stroke="#333" stroke-width="2" cursor="pointer" onclick="showRippleModal(${node.id})" />`;
    svg += `<text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" fill="#333">${node.sender[0]}</text>`;
    children.forEach((child, i) => {
      const childX = x + (i - (children.length-1)/2) * 160;
      const childY = y + yStep;
      svg += `<line x1="${x}" y1="${y+node.radius+depth*10}" x2="${childX}" y2="${childY-node.radius-depth*10}" stroke="${child.color}" stroke-width="4" />`;
      drawRipple(child, childX, childY, depth+1);
    });
  }
  roots.forEach((root, i) => {
    drawRipple(root, svgWidth/2 + (i-((roots.length-1)/2))*220, 80, 0);
  });
  svg += `</svg>`;
  document.getElementById('rippleVisual').innerHTML = svg;
}

function showRippleModal(nodeId) {
  const node = messenger.getNode(nodeId);
  if (!node) return;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-content">
    <h3>Ripple Details</h3>
    <p><strong>Sender:</strong> ${node.sender}</p>
    <p><strong>Recipient:</strong> ${node.recipient}</p>
    <p><strong>Message:</strong> ${node.message}</p>
    <p><strong>Date:</strong> ${new Date(node.date).toLocaleString()}</p>
    <button onclick="document.body.removeChild(this.parentNode.parentNode)">Close</button>
    <button onclick="replyToRipple(${node.id})">Send Ripple from here</button>
  </div>`;
  document.body.appendChild(modal);
}
function replyToRipple(nodeId) {
  document.body.removeChild(document.querySelector('.modal'));
  renderApp(nodeId);
}

function renderStats() {
  const stats = messenger.getStats();
  const app = document.getElementById('app');
  app.innerHTML += `<div class="stats">
    <span>Total Ripples: <strong>${stats.totalRipples}</strong></span>
    <span>Total Users: <strong>${stats.totalUsers}</strong></span>
    <span>Most Influential Ripple: <strong>${stats.mostInfluentialRipple}</strong></span>
    <span>Farthest Ripple: <strong>${stats.farthestRipple}</strong></span>
  </div>`;
}
function renderBadges() {
  const badges = messenger.getBadges();
  const app = document.getElementById('app');
  if (badges.length) {
    app.innerHTML += `<div class="badges">${badges.map(b => `<span class="badge">${b}</span>`).join('')}</div>`;
  }
}

function renderApp(replyNodeId = null) {
  const user = getCurrentUser();
  const app = document.getElementById('app');
  app.innerHTML = '';
  if (!user) {
    renderLoginSection();
    return;
  }
  renderSendRippleSection(replyNodeId);
  renderRippleVisual();
  renderStats();
  renderBadges();
}

window.renderApp = renderApp;
window.showRippleModal = showRippleModal;
window.replyToRipple = replyToRipple;
window.onload = renderApp;
