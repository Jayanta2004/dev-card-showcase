// Journal entry and achievement logic
let journalEntries = [];
let achievements = [
  {
    id: 1,
    title: "First Entry!",
    desc: "Logged your first mood and thoughts.",
    unlocked: false
  },
  {
    id: 2,
    title: "Streak Starter",
    desc: "Logged entries for 3 consecutive days.",
    unlocked: false
  },
  {
    id: 3,
    title: "Mood Explorer",
    desc: "Logged 5 different moods.",
    unlocked: false
  },
  {
    id: 4,
    title: "Thoughtful Writer",
    desc: "Wrote 10 journal entries.",
    unlocked: false
  },
  {
    id: 5,
    title: "Weekly Winner",
    desc: "Logged entries every day for a week.",
    unlocked: false
  }
];
let userProfile = {
  name: "Guest",
  streak: 0,
  moodsLogged: new Set(),
  entriesCount: 0
};

// Navigation
const journalBtn = document.getElementById("journalBtn");
const achievementsBtn = document.getElementById("achievementsBtn");
const profileBtn = document.getElementById("profileBtn");
const journalSection = document.getElementById("journalSection");
const achievementsSection = document.getElementById("achievementsSection");
const profileSection = document.getElementById("profileSection");
const entryForm = document.getElementById("entryForm");
const moodSelect = document.getElementById("mood");
const thoughtsInput = document.getElementById("thoughts");
const entriesList = document.getElementById("entriesList");
const achievementsList = document.getElementById("achievementsList");
const profileInfo = document.getElementById("profileInfo");

function showSection(section) {
  journalSection.style.display = section === "journal" ? "block" : "none";
  achievementsSection.style.display = section === "achievements" ? "block" : "none";
  profileSection.style.display = section === "profile" ? "block" : "none";
}

journalBtn.addEventListener("click", () => showSection("journal"));
achievementsBtn.addEventListener("click", () => {
  showSection("achievements");
  renderAchievements();
});
profileBtn.addEventListener("click", () => {
  showSection("profile");
  renderProfile();
});

// Add journal entry
entryForm.addEventListener("submit", e => {
  e.preventDefault();
  const mood = moodSelect.value;
  const thoughts = thoughtsInput.value.trim();
  if (!mood || !thoughts) return;
  const date = new Date().toLocaleDateString();
  journalEntries.push({ mood, thoughts, date });
  userProfile.entriesCount++;
  userProfile.moodsLogged.add(mood);
  updateStreak(date);
  unlockAchievements();
  renderEntries();
  entryForm.reset();
});

function updateStreak(currentDate) {
  // Check if entry is for today
  if (journalEntries.length < 2) {
    userProfile.streak = 1;
    return;
  }
  const prevDate = journalEntries[journalEntries.length - 2].date;
  if (prevDate === currentDate) {
    // Same day, streak unchanged
    return;
  }
  const prev = new Date(prevDate);
  const curr = new Date(currentDate);
  const diff = (curr - prev) / (1000 * 60 * 60 * 24);
  if (diff === 1) {
    userProfile.streak++;
  } else {
    userProfile.streak = 1;
  }
}

function unlockAchievements() {
  // First Entry
  if (journalEntries.length === 1) achievements[0].unlocked = true;
  // Streak Starter
  if (userProfile.streak >= 3) achievements[1].unlocked = true;
  // Mood Explorer
  if (userProfile.moodsLogged.size >= 5) achievements[2].unlocked = true;
  // Thoughtful Writer
  if (userProfile.entriesCount >= 10) achievements[3].unlocked = true;
  // Weekly Winner
  if (userProfile.streak >= 7) achievements[4].unlocked = true;
}

function renderEntries() {
  entriesList.innerHTML = "";
  journalEntries.slice().reverse().forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <div class="entry-mood">Mood: ${entry.mood}</div>
      <div class="entry-date">Date: ${entry.date}</div>
      <div class="entry-thoughts">${entry.thoughts}</div>
    `;
    entriesList.appendChild(card);
  });
}

function renderAchievements() {
  achievementsList.innerHTML = "";
  achievements.forEach(ach => {
    const card = document.createElement("div");
    card.className = "achievement-card";
    card.innerHTML = `
      <div class="achievement-title">${ach.title}</div>
      <div class="achievement-desc">${ach.desc}</div>
      <div>${ach.unlocked ? "<span style='color:#16a085;'>Unlocked!</span>" : "<span style='color:#e74c3c;'>Locked</span>"}</div>
    `;
    achievementsList.appendChild(card);
  });
}

function renderProfile() {
  profileInfo.innerHTML = `
    <strong>Name:</strong> ${userProfile.name}<br>
    <strong>Entries:</strong> ${userProfile.entriesCount}<br>
    <strong>Current Streak:</strong> ${userProfile.streak} days<br>
    <strong>Moods Logged:</strong> ${Array.from(userProfile.moodsLogged).join(", ")}
  `;
}

// Initial render
showSection("journal");
renderEntries();
