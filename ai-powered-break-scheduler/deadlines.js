// Deadline management for Break Scheduler
// ...existing code...
class DeadlineManager {
  constructor(scheduler) {
    this.scheduler = scheduler;
    this.setupUI();
  }
  setupUI() {
    const deadlinesDiv = document.getElementById('deadlines');
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Deadline';
    addBtn.onclick = () => this.addDeadlinePrompt();
    deadlinesDiv.appendChild(addBtn);
  }
  addDeadlinePrompt() {
    const label = prompt('Enter deadline label:');
    const timeStr = prompt('Enter deadline time (YYYY-MM-DD HH:MM):');
    const time = new Date(timeStr).getTime();
    if (label && time) {
      this.scheduler.addDeadline(time, label);
    }
  }
}

const deadlineManager = new DeadlineManager(scheduler);
