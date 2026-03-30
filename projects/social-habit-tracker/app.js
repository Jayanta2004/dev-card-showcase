// Social Habit Tracker App
// ...existing code...
class User {
  constructor(name) {
    this.name = name;
    this.habits = [];
    this.groups = [];
    this.progress = [];
  }
  addHabit(habit) {
    this.habits.push(habit);
  }
  joinGroup(group) {
    this.groups.push(group);
    group.addMember(this);
  }
  shareProgress(habit, value) {
    this.progress.push({ habit, value, date: new Date() });
  }
}

class Group {
  constructor(name) {
    this.name = name;
    this.members = [];
    this.challenges = [];
    this.rewards = [];
  }
  addMember(user) {
    if (!this.members.includes(user)) {
      this.members.push(user);
    }
  }
  addChallenge(challenge) {
    this.challenges.push(challenge);
  }
  addReward(reward) {
    this.rewards.push(reward);
  }
}

class Habit {
  constructor(name, goal) {
    this.name = name;
    this.goal = goal;
    this.progress = 0;
  }
  updateProgress(value) {
    this.progress += value;
  }
}

class Challenge {
  constructor(name, description, reward) {
    this.name = name;
    this.description = description;
    this.reward = reward;
    this.participants = [];
    this.completed = false;
  }
  addParticipant(user) {
    if (!this.participants.includes(user)) {
      this.participants.push(user);
    }
  }
  complete() {
    this.completed = true;
  }
}

class Reward {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
}

// Demo Data
const user = new User('Ayaanshaikh');
const group = new Group('Morning Routine Warriors');
const habit = new Habit('Wake up at 6am', 30);
const challenge = new Challenge('7-Day Streak', 'Wake up at 6am for 7 days', new Reward('Group Badge', 'Awarded for 7-day streak'));
user.addHabit(habit);
user.joinGroup(group);
group.addChallenge(challenge);
group.addReward(challenge.reward);
challenge.addParticipant(user);

// UI Rendering
function renderUserSection() {
  const div = document.getElementById('user-section');
  div.innerHTML = `<h2>User</h2><p>Name: ${user.name}</p><p>Habits: ${user.habits.map(h => h.name).join(', ')}</p>`;
}
function renderGroupSection() {
  const div = document.getElementById('group-section');
  div.innerHTML = `<h2>Group</h2><p>Name: ${group.name}</p><p>Members: ${group.members.map(m => m.name).join(', ')}</p>`;
}
function renderHabitSection() {
  const div = document.getElementById('habit-section');
  div.innerHTML = `<h2>Habit</h2><p>${habit.name} (Goal: ${habit.goal} days)</p><p>Progress: ${habit.progress} days</p><button onclick="updateHabitProgress()">Mark as Done</button>`;
}
function renderChallengeSection() {
  const div = document.getElementById('challenge-section');
  div.innerHTML = `<h2>Challenge</h2><p>${challenge.name}: ${challenge.description}</p><p>Participants: ${challenge.participants.map(p => p.name).join(', ')}</p><p>Status: ${challenge.completed ? 'Completed' : 'Ongoing'}</p><button onclick="completeChallenge()">Complete Challenge</button>`;
}
function renderRewardSection() {
  const div = document.getElementById('reward-section');
  div.innerHTML = `<h2>Group Rewards</h2><ul>${group.rewards.map(r => `<li>${r.name}: ${r.description}</li>`).join('')}</ul>`;
}
function renderProgressSection() {
  const div = document.getElementById('progress-section');
  div.innerHTML = `<ul>${user.progress.map(p => `<li>${p.habit.name}: ${p.value} on ${p.date.toLocaleDateString()}</li>`).join('')}</ul>`;
}

function updateHabitProgress() {
  habit.updateProgress(1);
  user.shareProgress(habit, 1);
  renderHabitSection();
  renderProgressSection();
}
function completeChallenge() {
  challenge.complete();
  renderChallengeSection();
}

renderUserSection();
renderGroupSection();
renderHabitSection();
renderChallengeSection();
renderRewardSection();
renderProgressSection();
