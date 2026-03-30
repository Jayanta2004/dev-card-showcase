// Uplift Reminder Service - JavaScript Implementation
// Data Storage
let reminders = JSON.parse(localStorage.getItem('upliftReminders')) || [];
let activities = JSON.parse(localStorage.getItem('upliftActivities')) || [];
let stats = JSON.parse(localStorage.getItem('upliftStats')) || {
  sent: 0,
  received: 0,
  streak: 0,
  lastSentDate: null
};

// Top uplifters (simulated leaderboard data)
let topUplifters = JSON.parse(localStorage.getItem('topUplifters')) || [
  { name: 'Sarah Chen', messages: 127, badge: '🌟' },
  { name: 'Alex Rivera', messages: 98, badge: '💫' },
  { name: 'Jordan Kim', messages: 85, badge: '✨' },
  { name: 'Maya Patel', messages: 72, badge: '🎯' },
  { name: 'Chris Johnson', messages: 64, badge: '🚀' },
  { name: 'You', messages: stats.sent, badge: '💖' }
];

// DOM Elements
const reminderForm = document.getElementById('reminderForm');
const recipientName = document.getElementById('recipientName');
const messageTemplate = document.getElementById('messageTemplate');
const messageContent = document.getElementById('messageContent');
const scheduleDate = document.getElementById('scheduleDate');
const scheduleTime = document.getElementById('scheduleTime');
const repeatReminder = document.getElementById('repeatReminder');
const remindersList = document.getElementById('remindersList');
const activityFeed = document.getElementById('activityFeed');
const celebrateBtn = document.getElementById('celebrateBtn');
const celebrationModal = document.getElementById('celebrationModal');
const closeModal = document.getElementById('closeModal');
const toast = document.getElementById('toast');

// Template cards
const templateCards = document.querySelectorAll('.template-card');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  renderReminders();
  renderActivities();
  setMinDateTime();
  checkDueReminders();
  
  // Check for due reminders every minute
  setInterval(checkDueReminders, 60000);
});

// Set minimum date/time to now
function setMinDateTime() {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  scheduleDate.min = dateString;
  
  // If today is selected, set min time to current time
  scheduleDate.addEventListener('change', () => {
    if (scheduleDate.value === dateString) {
      const timeString = now.toTimeString().slice(0, 5);
      scheduleTime.min = timeString;
    } else {
      scheduleTime.min = '';
    }
  });
}

// Template selection
messageTemplate.addEventListener('change', (e) => {
  const value = e.target.value;
  if (value && value !== 'custom') {
    messageContent.value = value;
    messageContent.readOnly = false;
  } else if (value === 'custom') {
    messageContent.value = '';
    messageContent.placeholder = 'Write your custom uplifting message...';
    messageContent.readOnly = false;
  }
});

// Quick template cards
templateCards.forEach(card => {
  card.addEventListener('click', () => {
    const message = card.dataset.message;
    messageContent.value = message;
    messageTemplate.value = 'custom';
    messageContent.focus();
    showToast('Template applied! ✨', 'success');
  });
});

// Form submission
reminderForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const reminder = {
    id: Date.now(),
    recipient: recipientName.value.trim(),
    message: messageContent.value.trim(),
    date: scheduleDate.value,
    time: scheduleTime.value,
    repeat: repeatReminder.checked,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  
  reminders.push(reminder);
  saveData();
  
  // Add activity
  addActivity('sent', `Scheduled message for ${reminder.recipient}`, reminder.message);
  
  showToast('✅ Reminder scheduled successfully!', 'success');
  reminderForm.reset();
  messageContent.readOnly = false;
  renderReminders();
  updateStats();
});

// Render reminders
function renderReminders() {
  if (reminders.length === 0) {
    remindersList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-calendar-day"></i>
        <p>No scheduled reminders yet.<br/>Start spreading positivity!</p>
      </div>
    `;
    return;
  }
  
  // Sort by date and time
  const sortedReminders = [...reminders].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA - dateB;
  });
  
  remindersList.innerHTML = sortedReminders.map(reminder => {
    const scheduledDate = new Date(`${reminder.date}T${reminder.time}`);
    const formattedDate = scheduledDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
    
    return `
      <div class="reminder-item ${reminder.repeat ? 'repeat' : ''}" data-id="${reminder.id}">
        <div class="reminder-header">
          <div class="recipient">
            <i class="fa-solid fa-user"></i>
            ${reminder.recipient}
          </div>
          <div class="actions">
            <button onclick="sendNow(${reminder.id})" title="Send now">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
            <button onclick="deleteReminder(${reminder.id})" title="Delete">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="message">"${reminder.message}"</div>
        <div class="details">
          <span><i class="fa-solid fa-calendar"></i> ${formattedDate}</span>
          <span><i class="fa-solid fa-clock"></i> ${formattedTime}</span>
          ${reminder.repeat ? '<span><i class="fa-solid fa-repeat"></i> Weekly</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Check for due reminders
function checkDueReminders() {
  const now = new Date();
  
  reminders.forEach(reminder => {
    const scheduledTime = new Date(`${reminder.date}T${reminder.time}`);
    
    if (scheduledTime <= now && reminder.status === 'scheduled') {
      sendReminder(reminder);
    }
  });
}

// Send reminder
function sendReminder(reminder) {
  // Mark as sent
  reminder.status = 'sent';
  
  // Update stats
  stats.sent++;
  updateStreak();
  
  // If it's to yourself, also increment received
  if (reminder.recipient.toLowerCase() === 'me' || reminder.recipient.toLowerCase() === 'myself') {
    stats.received++;
    addActivity('received', 'You received a reminder from yourself', reminder.message);
  }
  
  // Add sent activity
  addActivity('sent', `Sent message to ${reminder.recipient}`, reminder.message);
  
  // Show notification
  showToast(`✨ Message sent to ${reminder.recipient}!`, 'success');
  
  // If repeat, create new reminder for next week
  if (reminder.repeat) {
    const nextDate = new Date(`${reminder.date}T${reminder.time}`);
    nextDate.setDate(nextDate.getDate() + 7);
    
    const newReminder = {
      ...reminder,
      id: Date.now(),
      date: nextDate.toISOString().split('T')[0],
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };
    
    reminders.push(newReminder);
  }
  
  // Remove original reminder (or keep if repeat)
  if (!reminder.repeat) {
    reminders = reminders.filter(r => r.id !== reminder.id);
  } else {
    reminders = reminders.filter(r => r.id !== reminder.id);
  }
  
  saveData();
  renderReminders();
  updateStats();
}

// Send now
function sendNow(id) {
  const reminder = reminders.find(r => r.id === id);
  if (reminder) {
    sendReminder(reminder);
  }
}

// Delete reminder
function deleteReminder(id) {
  if (confirm('Are you sure you want to delete this reminder?')) {
    reminders = reminders.filter(r => r.id !== id);
    saveData();
    renderReminders();
    updateStats();
    showToast('Reminder deleted', 'warning');
  }
}

// Add activity
function addActivity(type, text, message = '') {
  const activity = {
    id: Date.now(),
    type,
    text,
    message,
    timestamp: new Date().toISOString()
  };
  
  activities.unshift(activity);
  
  // Keep only last 50 activities
  if (activities.length > 50) {
    activities = activities.slice(0, 50);
  }
  
  saveData();
  renderActivities();
}

// Render activities
function renderActivities() {
  if (activities.length === 0) {
    activityFeed.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-heart-pulse"></i>
        <p>Your uplift activity will appear here</p>
      </div>
    `;
    return;
  }
  
  activityFeed.innerHTML = activities.slice(0, 20).map(activity => {
    const timeAgo = getTimeAgo(new Date(activity.timestamp));
    const icon = activity.type === 'sent' ? 'fa-paper-plane' : 'fa-heart';
    
    return `
      <div class="activity-item ${activity.type}">
        <div class="activity-icon">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-text">
            ${activity.text}
            ${activity.message ? `<br/><em>"${activity.message}"</em>` : ''}
          </div>
          <div class="activity-time">${timeAgo}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Update stats
function updateStats() {
  document.getElementById('messagesSent').textContent = stats.sent;
  document.getElementById('messagesReceived').textContent = stats.received;
  document.getElementById('scheduledReminders').textContent = reminders.filter(r => r.status === 'scheduled').length;
  document.getElementById('upliftStreak').textContent = stats.streak;
  
  // Update user in leaderboard
  const userIndex = topUplifters.findIndex(u => u.name === 'You');
  if (userIndex !== -1) {
    topUplifters[userIndex].messages = stats.sent;
  }
}

// Update streak
function updateStreak() {
  const today = new Date().toDateString();
  const lastSent = stats.lastSentDate ? new Date(stats.lastSentDate).toDateString() : null;
  
  if (!lastSent) {
    stats.streak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    if (lastSent === today) {
      // Already sent today, don't increment
    } else if (lastSent === yesterdayString) {
      // Sent yesterday, increment streak
      stats.streak++;
    } else {
      // Streak broken, reset
      stats.streak = 1;
    }
  }
  
  stats.lastSentDate = new Date().toISOString();
  saveData();
}

// Time ago helper
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

// Show toast
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Celebration modal
celebrateBtn.addEventListener('click', () => {
  renderLeaderboard();
  celebrationModal.classList.add('active');
});

closeModal.addEventListener('click', () => {
  celebrationModal.classList.remove('active');
});

celebrationModal.addEventListener('click', (e) => {
  if (e.target === celebrationModal) {
    celebrationModal.classList.remove('active');
  }
});

// Render leaderboard
function renderLeaderboard() {
  // Sort by messages sent
  const sortedUplifters = [...topUplifters].sort((a, b) => b.messages - a.messages);
  
  const topList = document.getElementById('topUpliftersList');
  topList.innerHTML = sortedUplifters.slice(0, 10).map((uplifter, index) => `
    <div class="leaderboard-item">
      <div class="rank">${index + 1}</div>
      <div class="info">
        <div class="name">${uplifter.name}</div>
        <div class="count">${uplifter.messages} messages sent</div>
      </div>
      <div class="badge">${uplifter.badge}</div>
    </div>
  `).join('');
  
  // Update user rank
  const userRank = sortedUplifters.findIndex(u => u.name === 'You') + 1;
  document.getElementById('userRank').textContent = userRank > 0 ? `#${userRank}` : 'Not ranked';
  document.getElementById('userMessages').textContent = stats.sent;
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('upliftReminders', JSON.stringify(reminders));
  localStorage.setItem('upliftActivities', JSON.stringify(activities));
  localStorage.setItem('upliftStats', JSON.stringify(stats));
  localStorage.setItem('topUplifters', JSON.stringify(topUplifters));
}

// Demo mode - Add some initial data if empty
if (activities.length === 0 && stats.sent === 0) {
  // Add demo activities
  const demoActivities = [
    {
      id: Date.now() - 3600000,
      type: 'sent',
      text: 'Welcome to Uplift Reminder Service!',
      message: 'Start spreading positivity today!',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];
  
  activities = demoActivities;
  saveData();
  renderActivities();
}
