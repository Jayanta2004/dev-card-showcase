// Time Capsule Messenger JavaScript
// Handles message scheduling, delivery, export/import, accessibility, and sharing

const messageForm = document.getElementById('message-form');
const scheduledMessages = document.getElementById('scheduled-messages');
const shareBtn = document.getElementById('share-btn');
const shareLink = document.getElementById('share-link');
let messages = [];
let accessibilityEnabled = false;

messageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const recipient = document.getElementById('recipient').value;
    const content = document.getElementById('message-content').value;
    const deliveryDate = document.getElementById('delivery-date').value;
    if (recipient && content && deliveryDate) {
        messages.push({ recipient, content, deliveryDate, delivered: false });
        renderMessages();
        messageForm.reset();
    }
});

function renderMessages() {
    scheduledMessages.innerHTML = '';
    messages.forEach((msg, idx) => {
        const div = document.createElement('div');
        div.className = 'message-item';
        div.innerHTML = `<strong>To:</strong> ${msg.recipient}<br><strong>Delivery:</strong> ${msg.deliveryDate}<br><strong>Message:</strong> ${msg.content}<br><strong>Status:</strong> ${msg.delivered ? 'Delivered' : 'Scheduled'}`;
        scheduledMessages.appendChild(div);
    });
}

function checkDelivery() {
    const today = new Date().toISOString().split('T')[0];
    messages.forEach(msg => {
        if (!msg.delivered && msg.deliveryDate <= today) {
            msg.delivered = true;
        }
    });
    renderMessages();
}

setInterval(checkDelivery, 60000); // Check every minute

// Export/import message data
function exportMessages() {
    const dataStr = JSON.stringify(messages);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'messages.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importMessages(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                messages = imported;
                renderMessages();
            }
        } catch (err) {
            alert('Invalid messages file.');
        }
    };
    reader.readAsText(file);
}

// Accessibility features
function toggleAccessibility() {
    accessibilityEnabled = !accessibilityEnabled;
    document.body.style.fontSize = accessibilityEnabled ? '20px' : '16px';
    document.body.style.background = accessibilityEnabled ? '#fffbe6' : '#f5f7fa';
}

// Sharing messenger
shareBtn.addEventListener('click', function() {
    const url = window.location.href;
    shareLink.innerHTML = `<p>Share this link: <a href="${url}">${url}</a></p>`;
});

// UI event bindings
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-btn');
    const importInput = document.getElementById('import-input');
    const accessibilityBtn = document.getElementById('accessibility-btn');
    if (exportBtn) exportBtn.addEventListener('click', exportMessages);
    if (importInput) importInput.addEventListener('change', e => importMessages(e.target.files[0]));
    if (accessibilityBtn) accessibilityBtn.addEventListener('click', toggleAccessibility);
    renderMessages();
});
