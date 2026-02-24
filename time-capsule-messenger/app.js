// Virtual Time Capsule Messenger
// Author: EWOC Contributors
// Description: Users send messages to their future selves or friends, delivered on a chosen date.

const form = document.getElementById('messageForm');
const confirmation = document.getElementById('confirmation');
const scheduledMessagesDiv = document.getElementById('scheduledMessages');
const deliveredMessagesDiv = document.getElementById('deliveredMessages');

const STORAGE_KEY = 'timeCapsuleMessages';

function getMessages() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveMessages(messages) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function renderMessages() {
    const messages = getMessages();
    const today = new Date().toISOString().split('T')[0];
    let scheduled = '';
    let delivered = '';
    messages.forEach(msg => {
        if (msg.deliveryDate > today && !msg.delivered) {
            scheduled += `<div class="message-card">
                <div class="meta">To: <b>${escapeHtml(msg.recipient)}</b> | Deliver On: <b>${msg.deliveryDate}</b></div>
                <div>${escapeHtml(msg.message)}</div>
            </div>`;
        } else {
            delivered += `<div class="message-card">
                <div class="meta">To: <b>${escapeHtml(msg.recipient)}</b> | Delivered: <span class="delivered">${msg.deliveryDate}</span></div>
                <div>${escapeHtml(msg.message)}</div>
            </div>`;
        }
    });
    scheduledMessagesDiv.innerHTML = scheduled || '<em>No scheduled messages.</em>';
    deliveredMessagesDiv.innerHTML = delivered || '<em>No delivered messages yet.</em>';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function checkAndDeliverMessages() {
    const messages = getMessages();
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    messages.forEach(msg => {
        if (msg.deliveryDate <= today && !msg.delivered) {
            msg.delivered = true;
            updated = true;
        }
    });
    if (updated) saveMessages(messages);
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const recipient = form.recipient.value.trim();
    const message = form.message.value.trim();
    const deliveryDate = form.deliveryDate.value;
    if (!recipient || !message || !deliveryDate) return;
    const messages = getMessages();
    messages.push({
        recipient,
        message,
        deliveryDate,
        delivered: false
    });
    saveMessages(messages);
    confirmation.textContent = `Message scheduled for ${deliveryDate}!`;
    confirmation.classList.remove('hidden');
    form.reset();
    renderMessages();
    setTimeout(() => confirmation.classList.add('hidden'), 2500);
});

// Initial load
checkAndDeliverMessages();
renderMessages();

// Optionally, check for delivery every minute (for demo)
setInterval(() => {
    checkAndDeliverMessages();
    renderMessages();
}, 60000);
