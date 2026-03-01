// Compliment Tree App Logic
// Data model: tree nodes, compliments, users, badges, stats
// Visualization: SVG tree, color-coded branches, interactivity

const STORAGE_KEY = 'complimentTreeData';

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: [], compliments: [], tree: [], badges: [], stats: {} };
  return JSON.parse(raw);
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Compliment node
class ComplimentNode {
  constructor(sender, recipient, message, parentId = null) {
    this.id = Date.now() + Math.random();
    this.sender = sender;
    this.recipient = recipient;
    this.message = message;
    this.parentId = parentId;
    this.children = [];
    this.color = ComplimentNode.getColor(sender);
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

// Tree model
class ComplimentTree {
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
  sendCompliment(sender, recipient, message, parentId = null) {
    const node = new ComplimentNode(sender, recipient, message, parentId);
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
      totalCompliments: this.nodes.length,
      totalUsers: this.users.length,
      mostActiveSender: this.getMostActiveSender(),
      mostActiveBranch: this.getMostActiveBranch(),
    };
  }
  getMostActiveSender() {
    const counts = {};
    this.nodes.forEach(n => { counts[n.sender] = (counts[n.sender] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '';
  }
  getMostActiveBranch() {
    // Branch with most compliments
    const branchCounts = {};
    this.nodes.forEach(n => {
      branchCounts[n.sender] = (branchCounts[n.sender] || 0) + 1;
    });
    return Object.entries(branchCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || '';
  }
  getBadges() {
    const stats = this.getStats();
    const badges = [];
    if (stats.totalCompliments >= 5) badges.push('Tree Sprout');
    if (stats.totalCompliments >= 15) badges.push('Branch Builder');
    if (stats.totalCompliments >= 30) badges.push('Kindness Forest');
    if (stats.mostActiveSender) badges.push(`Most Active: ${stats.mostActiveSender}`);
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

const tree = new ComplimentTree();

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
  tree.addUser(username);
  renderApp();
}
function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

function renderSendComplimentSection(parentId = null) {
  const app = document.getElementById('app');
  app.innerHTML += `
    <div class="form-section">
      <h2>Send a Compliment</h2>
      <input id="recipient" placeholder="Recipient's name" />
      <textarea id="message" placeholder="Your compliment"></textarea>
      <button onclick="onSendCompliment(${parentId})">Send Compliment</button>
    </div>
  `;
}
function onSendCompliment(parentId = null) {
  const recipient = document.getElementById('recipient').value.trim();
  const message = document.getElementById('message').value.trim();
  const sender = getCurrentUser();
  if (!recipient || !message) return alert('Fill all fields');
  tree.sendCompliment(sender, recipient, message, parentId);
  renderApp();
}

function renderTreeVisual() {
  const app = document.getElementById('app');
  app.innerHTML += `<div class="tree-visual" id="treeVisual"></div>`;
  const roots = tree.getRoots();
  const svgWidth = 900, svgHeight = 400;
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
  let yStep = 60;
  function drawNode(node, x, y, depth) {
    const children = tree.getChildren(node.id);
    svg += `<circle cx="${x}" cy="${y}" r="22" fill="${node.color}" stroke="#333" stroke-width="2" cursor="pointer" onclick="showComplimentModal(${node.id})" />`;
    svg += `<text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" fill="#333">${node.sender[0]}</text>`;
    children.forEach((child, i) => {
      const childX = x + (i - (children.length-1)/2) * 120;
      const childY = y + yStep;
      svg += `<line x1="${x}" y1="${y+22}" x2="${childX}" y2="${childY-22}" stroke="${child.color}" stroke-width="4" />`;
      drawNode(child, childX, childY, depth+1);
    });
  }
  roots.forEach((root, i) => {
    drawNode(root, svgWidth/2 + (i-((roots.length-1)/2))*180, 60, 0);
  });
  svg += `</svg>`;
  document.getElementById('treeVisual').innerHTML = svg;
}

function showComplimentModal(nodeId) {
  const node = tree.getNode(nodeId);
  if (!node) return;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `<div class="modal-content">
    <h3>Compliment Details</h3>
    <p><strong>Sender:</strong> ${node.sender}</p>
    <p><strong>Recipient:</strong> ${node.recipient}</p>
    <p><strong>Message:</strong> ${node.message}</p>
    <p><strong>Date:</strong> ${new Date(node.date).toLocaleString()}</p>
    <button onclick="document.body.removeChild(this.parentNode.parentNode)">Close</button>
    <button onclick="replyToCompliment(${node.id})">Send Compliment from here</button>
  </div>`;
  document.body.appendChild(modal);
}
function replyToCompliment(nodeId) {
  document.body.removeChild(document.querySelector('.modal'));
  renderApp(nodeId);
}

function renderStats() {
  const stats = tree.getStats();
  const app = document.getElementById('app');
  app.innerHTML += `<div class="stats">
    <span>Total Compliments: <strong>${stats.totalCompliments}</strong></span>
    <span>Total Users: <strong>${stats.totalUsers}</strong></span>
    <span>Most Active Sender: <strong>${stats.mostActiveSender}</strong></span>
    <span>Most Active Branch: <strong>${stats.mostActiveBranch}</strong></span>
  </div>`;
}
function renderBadges() {
  const badges = tree.getBadges();
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
  renderSendComplimentSection(replyNodeId);
  renderTreeVisual();
  renderStats();
  renderBadges();
}

window.renderApp = renderApp;
window.showComplimentModal = showComplimentModal;
window.replyToCompliment = replyToCompliment;
window.onload = renderApp;
