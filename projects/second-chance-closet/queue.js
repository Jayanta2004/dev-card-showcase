// Request queue logic
const queueList = document.getElementById('queueList');

function showQueue() {
    let items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    let queue = items.filter(i => i.requests.length > 0);
    if (queue.length === 0) {
        queueList.innerHTML = '<p>No requests yet.</p>';
        return;
    }
    queueList.innerHTML = '<ul>' + queue.map(i => `<li>${i.type} (${i.condition}, Size: ${i.size}) - ${i.desc} | Requests: ${i.requests.length}</li>`).join('') + '</ul>';
}

window.onload = showQueue;