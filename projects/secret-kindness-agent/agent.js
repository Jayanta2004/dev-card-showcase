// Secret Kindness Agent App Logic
// Data model: agents, missions, gadgets, leaderboard, chains
// Visualization: profile, missions, gadgets, leaderboard, interactivity

const STORAGE_KEY = 'secretKindnessAgentData';

function getData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { agents: [], missions: [], gadgets: [], leaderboard: [] };
  return JSON.parse(raw);
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Agent profile
class Agent {
  constructor(username) {
    this.username = username;
    this.level = 1;
    this.points = 0;
    this.gadgets = [];
    this.completedMissions = [];
    this.activeMissions = [];
  }
}
// Mission
class Mission {
  constructor(description, chainId = null) {
    this.id = Date.now() + Math.random();
    this.description = description;
    this.chainId = chainId;
    this.completedBy = [];
    this.reports = [];
  }
}
// Gadget
class Gadget {
  constructor(name, unlockLevel) {
    this.name = name;
    this.unlockLevel = unlockLevel;
  }
}

// App model
class KindnessAgency {
  constructor() {
    this.agents = [];
    this.missions = [];
    this.gadgets = [];
    this.leaderboard = [];
    this.load();
    if (this.missions.length === 0) this.seedMissions();
    if (this.gadgets.length === 0) this.seedGadgets();
  }
  addAgent(username) {
    let agent = this.agents.find(a => a.username === username);
    if (!agent) {
      agent = new Agent(username);
      this.agents.push(agent);
      this.save();
    }
    return agent;
  }
  assignMission(username) {
    const agent = this.agents.find(a => a.username === username);
    if (!agent) return;
    // Assign random mission not already completed
    const available = this.missions.filter(m => !agent.completedMissions.includes(m.id) && !agent.activeMissions.includes(m.id));
    if (available.length === 0) return;
    const mission = available[Math.floor(Math.random() * available.length)];
    agent.activeMissions.push(mission.id);
    this.save();
    return mission;
  }
  reportMission(username, missionId, proofType, proofValue, story) {
    const agent = this.agents.find(a => a.username === username);
    const mission = this.missions.find(m => m.id === missionId);
    if (!agent || !mission) return false;
    if (!agent.activeMissions.includes(missionId)) return false;
    mission.completedBy.push(username);
    mission.reports.push({username, proofType, proofValue, story, date: new Date().toISOString()});
    agent.completedMissions.push(missionId);
    agent.activeMissions = agent.activeMissions.filter(id => id !== missionId);
    agent.points += 10;
    // Level up and unlock gadgets
    if (agent.points >= agent.level * 30) {
      agent.level++;
      this.gadgets.forEach(g => {
        if (g.unlockLevel === agent.level && !agent.gadgets.includes(g.name)) {
          agent.gadgets.push(g.name);
        }
      });
    }
    this.updateLeaderboard();
    this.save();
    return true;
  }
  chainMission(username, missionId) {
    // Assign a new mission in the same chain for bonus
    const mission = this.missions.find(m => m.id === missionId);
    if (!mission) return;
    const chainMissions = this.missions.filter(m => m.chainId === mission.chainId && m.id !== missionId);
    if (chainMissions.length === 0) return;
    const agent = this.agents.find(a => a.username === username);
    if (!agent) return;
    const nextMission = chainMissions[Math.floor(Math.random() * chainMissions.length)];
    agent.activeMissions.push(nextMission.id);
    this.save();
    return nextMission;
  }
  updateLeaderboard() {
    this.leaderboard = this.agents.slice().sort((a,b) => b.points - a.points);
  }
  getLeaderboard() {
    return this.leaderboard.slice(0, 10);
  }
  seedMissions() {
    this.missions = [
      new Mission('Leave a kind note for a stranger.'),
      new Mission('Help someone carry their groceries.'),
      new Mission('Donate unused clothes to charity.'),
      new Mission('Compliment three people today.'),
      new Mission('Plant a tree in your neighborhood.'),
      new Mission('Share a positive story online.'),
      new Mission('Volunteer for a local cause.'),
      new Mission('Send a thank you message to a teacher.'),
      new Mission('Pick up litter in a public space.'),
      new Mission('Support a friend in need.'),
      // Chained missions
      new Mission('Start a kindness chain: do something nice and ask the recipient to pay it forward.', 1),
      new Mission('Continue the kindness chain: encourage another act of kindness.', 1),
      new Mission('Document the chain and share the story.', 1),
    ];
    this.save();
  }
  seedGadgets() {
    this.gadgets = [
      new Gadget('Kindness Decoder', 2),
      new Gadget('Secret Mission Briefcase', 3),
      new Gadget('Invisible Cloak of Empathy', 4),
      new Gadget('Global Kindness Tracker', 5),
    ];
    this.save();
  }
  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({agents: this.agents, missions: this.missions, gadgets: this.gadgets, leaderboard: this.leaderboard}));
  }
  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const obj = JSON.parse(data);
      this.agents = obj.agents || [];
      this.missions = obj.missions || [];
      this.gadgets = obj.gadgets || [];
      this.leaderboard = obj.leaderboard || [];
    }
  }
}

const agency = new KindnessAgency();

function renderLoginSection() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="form-section">
      <h2>Login</h2>
      <input id="username" placeholder="Enter your agent name" />
      <button onclick="onLogin()">Login</button>
    </div>
  `;
}
function onLogin() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert('Enter your agent name');
  sessionStorage.setItem('currentUser', username);
  agency.addAgent(username);
  renderApp();
}
function getCurrentUser() {
  return sessionStorage.getItem('currentUser');
}

function renderAgentProfile() {
  const username = getCurrentUser();
  const agent = agency.agents.find(a => a.username === username);
  if (!agent) return;
  const app = document.getElementById('app');
  app.innerHTML += `<div class="agent-profile">
    <h2>Agent Profile</h2>
    <strong>Name:</strong> ${agent.username}<br>
    <strong>Level:</strong> ${agent.level}<br>
    <strong>Points:</strong> ${agent.points}<br>
    <strong>Completed Missions:</strong> ${agent.completedMissions.length}<br>
    <div class="gadgets"><strong>Gadgets:</strong> ${agent.gadgets.map(g => `<span class="gadget">${g}</span>`).join('')}</div>
  </div>`;
}
function renderMissions() {
  const username = getCurrentUser();
  const agent = agency.agents.find(a => a.username === username);
  if (!agent) return;
  const app = document.getElementById('app');
  app.innerHTML += `<div class="missions"><h2>Active Missions</h2>`;
  agent.activeMissions.forEach(mid => {
    const mission = agency.missions.find(m => m.id === mid);
    if (!mission) return;
    app.innerHTML += `<div class="mission">
      <strong>Mission:</strong> ${mission.description}<br>
      <form onsubmit="reportMission(event, ${mission.id})">
        <select id="proofType-${mission.id}">
          <option value="photo">Photo</option>
          <option value="story">Story</option>
          <option value="message">Message</option>
        </select>
        <input type="text" id="proofValue-${mission.id}" placeholder="Proof (filename, story, or message)" required>
        <textarea id="story-${mission.id}" placeholder="Describe your experience"></textarea>
        <button type="submit">Report Mission</button>
      </form>
      <button onclick="chainMission(${mission.id})">Chain Mission for Bonus</button>
    </div>`;
  });
  app.innerHTML += `</div>`;
}
function reportMission(e, missionId) {
  e.preventDefault();
  const username = getCurrentUser();
  const proofType = document.getElementById(`proofType-${missionId}`).value;
  const proofValue = document.getElementById(`proofValue-${missionId}`).value.trim();
  const story = document.getElementById(`story-${missionId}`).value.trim();
  if (!username || !proofType || !proofValue) return alert('Fill all fields');
  const success = agency.reportMission(username, missionId, proofType, proofValue, story);
  if (!success) return alert('Mission report failed.');
  renderApp();
}
function chainMission(missionId) {
  const username = getCurrentUser();
  agency.chainMission(username, missionId);
  renderApp();
}
function renderLeaderboard() {
  const leaderboard = agency.getLeaderboard();
  const app = document.getElementById('app');
  app.innerHTML += `<div class="leaderboard"><h2>Global Leaderboard</h2><ol>${leaderboard.map(a => `<li>${a.username} - Level ${a.level}, Points ${a.points}</li>`).join('')}</ol></div>`;
}
function renderApp() {
  const user = getCurrentUser();
  const app = document.getElementById('app');
  app.innerHTML = '';
  if (!user) {
    renderLoginSection();
    return;
  }
  renderAgentProfile();
  renderMissions();
  renderLeaderboard();
  // Assign a mission if none active
  const agent = agency.agents.find(a => a.username === user);
  if (agent && agent.activeMissions.length === 0) {
    agency.assignMission(user);
    renderApp();
  }
}

window.renderApp = renderApp;
window.reportMission = reportMission;
window.chainMission = chainMission;
window.onload = renderApp;
