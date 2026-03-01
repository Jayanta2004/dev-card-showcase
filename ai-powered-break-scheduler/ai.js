// AI logic for analyzing work patterns and adapting break schedule
// ...existing code...
class WorkPatternAI {
  constructor(scheduler) {
    this.scheduler = scheduler;
  }
  analyzePatterns() {
    // ...existing code...
    const log = this.scheduler.workLog;
    if (log.length < 10) return 'Insufficient data for AI analysis.';
    let intervals = [];
    for (let i = 1; i < log.length; i++) {
      intervals.push(log[i].time - log[i-1].time);
    }
    const avgInterval = intervals.reduce((a,b) => a+b, 0) / intervals.length;
    if (avgInterval < 10 * 60 * 1000) {
      return 'You work in short bursts. Try longer focus sessions.';
    } else if (avgInterval > 30 * 60 * 1000) {
      return 'You work in long stretches. Microbreaks recommended.';
    } else {
      return 'Balanced work pattern detected.';
    }
  }
  recommendBreaks() {
    // ...existing code...
    const energy = this.scheduler.energy;
    if (energy < 30) {
      return 'AI recommends a 20-min rest.';
    } else if (energy > 110) {
      return 'AI recommends deep work session.';
    } else {
      return 'AI recommends a 5-min microbreak.';
    }
  }
}

const ai = new WorkPatternAI(scheduler);
setInterval(() => {
  document.getElementById('analysis').textContent += '\n' + ai.analyzePatterns();
  document.getElementById('suggestions').innerHTML += `<li>${ai.recommendBreaks()}</li>`;
}, 10 * 60 * 1000); // every 10 min
