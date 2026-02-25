// Habit tracker with social accountability logic
let habits = [];
let groups = [];
let userProfile = {
  name: "Guest",
  habitsCompleted: 0,
  currentGroup: null
};

// Navigation
const habitsBtn = document.getElementById("habitsBtn");
const groupsBtn = document.getElementById("groupsBtn");
const profileBtn = document.getElementById("profileBtn");
const habitsSection = document.getElementById("habitsSection");
const groupsSection = document.getElementById("groupsSection");
const profileSection = document.getElementById("profileSection");
const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const habitList = document.getElementById("habitList");
const groupForm = document.getElementById("groupForm");
const groupInput = document.getElementById("groupInput");
const groupList = document.getElementById("groupList");
const groupProgress = document.getElementById("groupProgress");
const profileInfo = document.getElementById("profileInfo");

function showSection(section) {
  habitsSection.style.display = section === "habits" ? "block" : "none";
  groupsSection.style.display = section === "groups" ? "block" : "none";
  profileSection.style.display = section === "profile" ? "block" : "none";
}

habitsBtn.addEventListener("click", () => showSection("habits"));
groupsBtn.addEventListener("click", () => {
  showSection("groups");
  renderGroups();
  renderGroupProgress();
});
profileBtn.addEventListener("click", () => {
  showSection("profile");
  renderProfile();
});

// Add habit
habitForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = habitInput.value.trim();
  if (!name) return;
  habits.push({ name, progress: 0 });
  renderHabits();
  habitForm.reset();
});

// Render habits
function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((habit, idx) => {
    const card = document.createElement("div");
    card.className = "habit-card";
    card.innerHTML = `
      <span class="habit-name">${habit.name}</span>
      <span class="habit-progress">Progress: ${habit.progress} days</span>
      <button class="complete-btn" data-idx="${idx}">Complete</button>
      <button class="delete-btn" data-idx="${idx}">Delete</button>
    `;
    card.querySelector(".complete-btn").addEventListener("click", () => {
      habit.progress++;
      userProfile.habitsCompleted++;
      renderHabits();
      renderGroupProgress();
    });
    card.querySelector(".delete-btn").addEventListener("click", () => {
      habits.splice(idx, 1);
      renderHabits();
      renderGroupProgress();
    });
    habitList.appendChild(card);
  });
}

// Add/join group
groupForm.addEventListener("submit", e => {
  e.preventDefault();
  const name = groupInput.value.trim();
  if (!name) return;
  let group = groups.find(g => g.name === name);
  if (!group) {
    group = { name, members: [userProfile.name], progress: 0 };
    groups.push(group);
  } else if (!group.members.includes(userProfile.name)) {
    group.members.push(userProfile.name);
  }
  userProfile.currentGroup = name;
  renderGroups();
  renderGroupProgress();
  groupForm.reset();
});

// Render groups
function renderGroups() {
  groupList.innerHTML = "";
  groups.forEach((group, idx) => {
    const card = document.createElement("div");
    card.className = "group-card";
    card.innerHTML = `
      <span class="group-name">${group.name}</span>
      <span class="group-members">Members: ${group.members.join(", ")}</span>
      <button class="leave-btn" data-idx="${idx}">Leave</button>
    `;
    card.querySelector(".leave-btn").addEventListener("click", () => {
      group.members = group.members.filter(m => m !== userProfile.name);
      if (group.members.length === 0) groups.splice(idx, 1);
      userProfile.currentGroup = null;
      renderGroups();
      renderGroupProgress();
    });
    groupList.appendChild(card);
  });
}

// Render group progress
function renderGroupProgress() {
  groupProgress.innerHTML = "";
  if (!userProfile.currentGroup) return;
  const group = groups.find(g => g.name === userProfile.currentGroup);
  if (!group) return;
  // Group progress: sum of all members' completed habits
  const totalProgress = userProfile.habitsCompleted;
  const maxProgress = habits.length * 30; // Assume 30 days goal
  const percent = maxProgress ? Math.min(100, Math.round((totalProgress / maxProgress) * 100)) : 0;
  groupProgress.innerHTML = `
    <div><strong>Group Progress:</strong> ${percent}%</div>
    <div class="progress-bar"><div class="progress-fill" style="width:${percent}%;"></div></div>
  `;
}

// Render profile
function renderProfile() {
  profileInfo.innerHTML = `
    <strong>Name:</strong> ${userProfile.name}<br>
    <strong>Habits Completed:</strong> ${userProfile.habitsCompleted}<br>
    <strong>Current Group:</strong> ${userProfile.currentGroup || "None"}
  `;
}

// Initial render
showSection("habits");
renderHabits();
