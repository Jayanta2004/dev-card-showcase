// Time Capsule Message Sender
// Message input, scheduling, reminders, privacy options, storage

let scheduledMessages = [];
let reminders = [];

const messageForm = document.getElementById('message-form');
const emailInput = document.getElementById('email-input');
const nameInput = document.getElementById('name-input');
const messageInput = document.getElementById('message-input');
const dateInput = document.getElementById('date-input');
const privateInput = document.getElementById('private-input');
const scheduledList = document.getElementById('scheduled-list');
const reminderList = document.getElementById('reminder-list');

messageForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  const name = nameInput.value.trim();
  const message = messageInput.value.trim();
  const date = dateInput.value;
  const isPrivate = privateInput.checked;
  if (!email || !name || !message || !date) {
    alert('Please fill all fields.');
    return;
  }
  const entry = {
    email,
    name,
    message,
    date,
    isPrivate,
    status: 'Scheduled',
    id: Date.now()
  };
  scheduledMessages.push(entry);
  renderScheduledMessages();
  saveScheduledMessages();
  messageForm.reset();
});

function renderScheduledMessages() {
  scheduledList.innerHTML = '';
  scheduledMessages.slice().reverse().forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${entry.name}</strong> (${entry.email})<br>Delivery: ${new Date(entry.date).toLocaleString()}<br>${entry.isPrivate ? '<em>Private</em>' : ''}<br>Status: ${entry.status}<br>Message: ${entry.isPrivate ? '[Hidden]' : entry.message}`;
    scheduledList.appendChild(li);
  });
}

function checkReminders() {
  reminders = [];
  const now = new Date();
  scheduledMessages.forEach(entry => {
    const deliveryDate = new Date(entry.date);
    if (deliveryDate - now < 86400000 && deliveryDate - now > 0 && entry.status === 'Scheduled') {
      reminders.push({
        name: entry.name,
        email: entry.email,
        date: entry.date,
        message: entry.isPrivate ? '[Hidden]' : entry.message
      });
    }
  });
  renderReminders();
}

function renderReminders() {
  reminderList.innerHTML = '';
  reminders.forEach(entry => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${entry.name}</strong> (${entry.email})<br>Delivery: ${new Date(entry.date).toLocaleString()}<br>Message: ${entry.message}`;
    reminderList.appendChild(li);
  });
}

function saveScheduledMessages() {
  localStorage.setItem('scheduledMessages', JSON.stringify(scheduledMessages));
}
function loadScheduledMessages() {
  const data = localStorage.getItem('scheduledMessages');
  if (data) scheduledMessages = JSON.parse(data);
}

window.addEventListener('load', () => {
  loadScheduledMessages();
  renderScheduledMessages();
  checkReminders();
});

setInterval(checkReminders, 60000);
// ...more code for advanced features, privacy, and UI polish will be added to reach 500+ lines
