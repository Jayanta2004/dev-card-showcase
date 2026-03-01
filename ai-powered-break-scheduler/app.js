// AI-Powered Break Scheduler
// ...existing code...
class BreakScheduler {
  constructor() {
    this.workLog = [];
    this.breaks = [];
    this.energyLevels = [];
    this.deadlines = [];
    this.tracking = false;
    this.suggestions = [];
    this.analysis = '';
    this.energy = 100;
    this.lastBreak = Date.now();
    this.breakInterval = 60 * 60 * 1000; // 1 hour
    this.microBreakInterval = 15 * 60 * 1000; // 15 min
    this.deadlineAdaptation = true;
    this.energyDecayRate = 0.5;
    this.energyBoost = 20;
    this.init();
  }
  init() {
    this.loadData();
    this.render();
    this.setupListeners();
  }
  loadData() {
    // ...existing code...
    if (localStorage.getItem('workLog')) {
      this.workLog = JSON.parse(localStorage.getItem('workLog'));
    }
    if (localStorage.getItem('breaks')) {
      this.breaks = JSON.parse(localStorage.getItem('breaks'));
    }
    if (localStorage.getItem('energyLevels')) {
      this.energyLevels = JSON.parse(localStorage.getItem('energyLevels'));
    }
    if (localStorage.getItem('deadlines')) {
      this.deadlines = JSON.parse(localStorage.getItem('deadlines'));
    }
  }
  saveData() {
    localStorage.setItem('workLog', JSON.stringify(this.workLog));
    localStorage.setItem('breaks', JSON.stringify(this.breaks));
    localStorage.setItem('energyLevels', JSON.stringify(this.energyLevels));
    localStorage.setItem('deadlines', JSON.stringify(this.deadlines));
  }
  startTracking() {
    this.tracking = true;
    this.trackWork();
    this.renderStatus('Tracking started.');
  }
  stopTracking() {
    this.tracking = false;
    this.renderStatus('Tracking stopped.');
  }
  trackWork() {
    if (!this.tracking) return;
    const now = Date.now();
    this.workLog.push({ time: now, action: 'work' });
    this.energy -= this.energyDecayRate;
    this.energyLevels.push({ time: now, energy: this.energy });
    this.saveData();
    this.scheduleBreaks();
    setTimeout(() => this.trackWork(), 5 * 60 * 1000); // every 5 min
  }
  scheduleBreaks() {
    const now = Date.now();
    if (now - this.lastBreak > this.microBreakInterval) {
      this.suggestBreak('micro');
      this.lastBreak = now;
    }
    if (now - this.lastBreak > this.breakInterval) {
      this.suggestBreak('full');
      this.lastBreak = now;
    }
    this.adaptToDeadlines();
    this.adaptToEnergyLevels();
    this.renderBreaks();
    this.renderSuggestions();
    this.renderAnalysis();
  }
  suggestBreak(type) {
    let suggestion = '';
    if (type === 'micro') {
      suggestion = 'Take a 2-min microbreak: stretch, look away from screen.';
      this.energy += this.energyBoost / 2;
    } else {
      suggestion = 'Take a 10-min full break: walk, hydrate, relax.';
      this.energy += this.energyBoost;
    }
    this.breaks.push({ time: Date.now(), type, suggestion });
    this.suggestions.push(suggestion);
    this.energyLevels.push({ time: Date.now(), energy: this.energy });
    this.saveData();
  }
  adaptToDeadlines() {
    if (!this.deadlineAdaptation || this.deadlines.length === 0) return;
    const now = Date.now();
    for (let d of this.deadlines) {
      if (d.time - now < 60 * 60 * 1000) {
        this.breakInterval = 90 * 60 * 1000; // delay breaks near deadline
      } else {
        this.breakInterval = 60 * 60 * 1000;
      }
    }
  }
  adaptToEnergyLevels() {
    if (this.energy < 40) {
      this.suggestions.push('Energy low: take a longer break or rest.');
    }
    if (this.energy > 120) {
      this.suggestions.push('Energy high: focus on deep work.');
    }
  }
  addDeadline(time, label) {
    this.deadlines.push({ time, label });
    this.saveData();
    this.renderDeadlines();
  }
  render() {
    this.renderStatus();
    this.renderBreaks();
    this.renderEnergy();
    this.renderDeadlines();
    this.renderSuggestions();
    this.renderAnalysis();
  }
  renderStatus(msg) {
    document.getElementById('status').textContent = msg || (this.tracking ? 'Tracking...' : 'Not tracking');
  }
  renderBreaks() {
    const breaksDiv = document.getElementById('breaks');
    breaksDiv.innerHTML = this.breaks.slice(-5).map(b => `<li>${new Date(b.time).toLocaleTimeString()} - ${b.suggestion}</li>`).join('');
  }
  renderEnergy() {
    const energyDiv = document.getElementById('energy');
    energyDiv.textContent = `Current energy: ${Math.round(this.energy)}`;
  }
  renderDeadlines() {
    const deadlinesDiv = document.getElementById('deadlines');
    deadlinesDiv.innerHTML = this.deadlines.map(d => `<li>${d.label}: ${new Date(d.time).toLocaleString()}</li>`).join('');
  }
  renderSuggestions() {
    const suggestionsList = document.getElementById('suggestions');
    suggestionsList.innerHTML = this.suggestions.slice(-5).map(s => `<li>${s}</li>`).join('');
  }
  renderAnalysis() {
    const analysisDiv = document.getElementById('analysis');
    this.analysis = this.analyzeWorkPatterns();
    analysisDiv.textContent = this.analysis;
  }
  analyzeWorkPatterns() {
    if (this.workLog.length < 2) return 'Not enough data.';
    let totalWork = 0;
    let totalBreaks = 0;
    let lastTime = this.workLog[0].time;
    for (let i = 1; i < this.workLog.length; i++) {
      totalWork += (this.workLog[i].time - lastTime);
      lastTime = this.workLog[i].time;
    }
    for (let b of this.breaks) {
      totalBreaks += b.type === 'full' ? 10 : 2;
    }
    return `Total work: ${(totalWork/3600000).toFixed(2)} hrs, Total breaks: ${totalBreaks} min.`;
  }
}

const scheduler = new BreakScheduler();
document.getElementById('start').addEventListener('click', () => scheduler.startTracking());
document.getElementById('stop').addEventListener('click', () => scheduler.stopTracking());
