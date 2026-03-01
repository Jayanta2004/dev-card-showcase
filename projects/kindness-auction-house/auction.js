// Kindness Auction House App Logic
// Data model: items, bids, users, badges, ownership, chains
// Visualization: auction list, bid form, item actions, interactivity

const STORAGE_KEY = 'kindnessAuctionHouseData';

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: [], items: [], bids: [], badges: [], ownership: {}, chains: [] };
  return JSON.parse(raw);
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Auction item
class AuctionItem {
  constructor(name, description, startBid) {
    this.id = Date.now() + Math.random();
    this.name = name;
    this.description = description;
    this.startBid = startBid;
    this.highestBid = null;
    this.owner = null;
    this.completed = false;
  }
}
// Bid
class KindnessBid {
  constructor(username, itemId, act, amount) {
    this.id = Date.now() + Math.random();
    this.username = username;
    this.itemId = itemId;
    this.act = act;
    this.amount = amount;
    this.completed = false;
  }
}

// Auction model
class AuctionHouse {
  constructor() {
    this.items = [];
    this.bids = [];
    this.users = [];
    this.ownership = {};
    this.chains = [];
    this.load();
    if (this.items.length === 0) this.seedItems();
  }
  addUser(username) {
    if (!this.users.includes(username)) {
      this.users.push(username);
      this.save();
    }
  }
  placeBid(username, itemId, act, amount) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || item.completed) return false;
    if (item.highestBid && amount <= item.highestBid.amount) return false;
    const bid = new KindnessBid(username, itemId, act, amount);
    item.highestBid = bid;
    this.bids.push(bid);
    this.addUser(username);
    this.save();
    return true;
  }
  completeBid(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || !item.highestBid || item.completed) return false;
    item.completed = true;
    item.owner = item.highestBid.username;
    this.ownership[item.owner] = this.ownership[item.owner] || [];
    this.ownership[item.owner].push(item);
    this.save();
    return true;
  }
  donateItem(username, itemId, toUser) {
    if (!this.ownership[username]) return false;
    const idx = this.ownership[username].findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    const item = this.ownership[username][idx];
    item.owner = toUser;
    this.ownership[toUser] = this.ownership[toUser] || [];
    this.ownership[toUser].push(item);
    this.ownership[username].splice(idx, 1);
    this.save();
    return true;
  }
  tradeItem(username, itemId, toUser) {
    // Same as donate for demo
    return this.donateItem(username, itemId, toUser);
  }
  startKindnessChain(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || !item.owner) return false;
    this.chains.push({item: item.name, startedBy: item.owner, date: new Date().toISOString()});
    this.save();
    return true;
  }
  getOwnedItems(username) {
    return this.ownership[username] || [];
  }
  getBadges(username) {
    const owned = this.getOwnedItems(username);
    const badges = [];
    if (owned.length >= 1) badges.push('Auction Winner');
    if (owned.length >= 3) badges.push('Kindness Collector');
    if (owned.length >= 5) badges.push('Auction Legend');
    return badges;
  }
  seedItems() {
    this.items = [
      new AuctionItem('Virtual Garden', 'A beautiful digital garden to nurture.', 1),
      new AuctionItem('Kindness Cape', 'Wear your kindness with pride.', 2),
      new AuctionItem('Friendship Bracelet', 'Symbol of lasting friendship.', 1),
      new AuctionItem('Hope Lantern', 'Light up someone’s day.', 3),
      new AuctionItem('Generosity Gem', 'A rare gem for generous souls.', 2),
    ];
    this.save();
  }
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({items: this.items, bids: this.bids, users: this.users, ownership: this.ownership, chains: this.chains}));
  }
  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const obj = JSON.parse(data);
      this.items = obj.items || [];
      this.bids = obj.bids || [];
      this.users = obj.users || [];
      this.ownership = obj.ownership || {};
      this.chains = obj.chains || [];
    }
  }
}

const auction = new AuctionHouse();

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
  auction.addUser(username);
  renderApp();
}
function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

function renderAuctionList() {
  const app = document.getElementById('app');
  app.innerHTML += `<h2>Items Up for Auction</h2><ul class="auction-list">`;
  auction.items.forEach(item => {
    app.innerHTML += `<li class="auction-item">
      <strong>${item.name}</strong><br>${item.description}<br>
      <span>Starting Bid: ${item.startBid} kindness points</span><br>
      <span>Highest Bid: ${item.highestBid ? item.highestBid.amount : 'None'}</span><br>
      <span>Owner: ${item.owner ? item.owner : 'None'}</span><br>
      ${!item.completed ? `<form onsubmit="placeBid(event, ${item.id})">
        <input type="text" id="act-${item.id}" placeholder="Describe your act of kindness" required>
        <input type="number" id="amount-${item.id}" min="1" placeholder="Bid amount" required>
        <button type="submit">Place Bid</button>
      </form>
      ${item.highestBid ? `<button onclick="completeBid(${item.id})">Complete Kindness & Claim</button>` : ''}` : `<button onclick="startKindnessChain(${item.id})">Start Kindness Chain</button>`}
    </li>`;
  });
  app.innerHTML += `</ul>`;
}
function placeBid(e, itemId) {
  e.preventDefault();
  const username = getCurrentUser();
  const act = document.getElementById(`act-${itemId}`).value.trim();
  const amount = parseInt(document.getElementById(`amount-${itemId}`).value);
  if (!username || !act || !amount) return alert('Fill all fields');
  const success = auction.placeBid(username, itemId, act, amount);
  if (!success) return alert('Bid must be higher than current highest bid and item must be open.');
  renderApp();
}
function completeBid(itemId) {
  auction.completeBid(itemId);
  renderApp();
}
function startKindnessChain(itemId) {
  auction.startKindnessChain(itemId);
  renderApp();
}
function renderOwnedItems() {
  const username = getCurrentUser();
  const owned = auction.getOwnedItems(username);
  const app = document.getElementById('app');
  if (owned.length) {
    app.innerHTML += `<h2>Your Owned Items</h2><div class="owned-items">${owned.map(i => `<span class="owned-item">${i.name}</span>`).join('')}</div>`;
  }
}
function renderBadges() {
  const username = getCurrentUser();
  const badges = auction.getBadges(username);
  const app = document.getElementById('app');
  if (badges.length) {
    app.innerHTML += `<div class="badges">${badges.map(b => `<span class="badge">${b}</span>`).join('')}</div>`;
  }
}
function renderChains() {
  const app = document.getElementById('app');
  if (auction.chains.length) {
    app.innerHTML += `<h2>Kindness Chains Started</h2><ul>${auction.chains.map(c => `<li>${c.item} started by ${c.startedBy} on ${new Date(c.date).toLocaleDateString()}</li>`).join('')}</ul>`;
  }
}

function renderApp() {
  const user = getCurrentUser();
  const app = document.getElementById('app');
  app.innerHTML = '';
  if (!user) {
    renderLoginSection();
    return;
  }
  renderAuctionList();
  renderOwnedItems();
  renderBadges();
  renderChains();
}

window.renderApp = renderApp;
window.placeBid = placeBid;
window.completeBid = completeBid;
window.startKindnessChain = startKindnessChain;
window.onload = renderApp;
