// Memory Palace Visualizer - Build and Explore Your Memory Palace

let selectedRoomIdx = null;

function getRooms() {
    return JSON.parse(localStorage.getItem('palaceRooms') || '[]');
}
function saveRoom(room) {
    const rooms = getRooms();
    rooms.push(room);
    localStorage.setItem('palaceRooms', JSON.stringify(rooms));
}
function getItems() {
    return JSON.parse(localStorage.getItem('palaceItems') || '[]');
}
function saveItem(item) {
    const items = getItems();
    items.push(item);
    localStorage.setItem('palaceItems', JSON.stringify(items));
}

function renderRooms() {
    const rooms = getRooms();
    const palaceMap = document.getElementById('palaceMap');
    const roomList = document.getElementById('roomList');
    const itemRoomSelect = document.getElementById('itemRoomSelect');
    palaceMap.innerHTML = '';
    roomList.innerHTML = '';
    itemRoomSelect.innerHTML = '';
    rooms.forEach((room, idx) => {
        // Palace Map Node
        const node = document.createElement('div');
        node.className = 'room-node' + (selectedRoomIdx === idx ? ' selected' : '');
        node.textContent = room.name;
        node.title = room.description;
        node.onclick = () => {
            selectedRoomIdx = idx;
            renderRooms();
            renderRoomDetails();
        };
        palaceMap.appendChild(node);
        // Room List
        const li = document.createElement('li');
        li.innerHTML = `<strong>${room.name}</strong><br><small>${room.description || ''}</small>`;
        roomList.appendChild(li);
        // Item Form Select
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = room.name;
        itemRoomSelect.appendChild(opt);
    });
    if (rooms.length && selectedRoomIdx === null) {
        selectedRoomIdx = 0;
    }
    renderRoomDetails();
}

function renderRoomDetails() {
    const rooms = getRooms();
    const items = getItems();
    const detailsDiv = document.getElementById('roomDetails');
    if (!rooms.length || selectedRoomIdx === null) {
        detailsDiv.innerHTML = '<em>No room selected.</em>';
        return;
    }
    const room = rooms[selectedRoomIdx];
    const roomItems = items.filter(i => i.roomIdx === selectedRoomIdx);
    let html = `<h3>${room.name}</h3><p>${room.description || ''}</p>`;
    if (roomItems.length === 0) {
        html += '<em>No items in this room yet.</em>';
    } else {
        html += '<ul>';
        roomItems.forEach(item => {
            html += `<li><strong>${item.name}</strong>: <span>${item.note || ''}</span></li>`;
        });
        html += '</ul>';
    }
    detailsDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    renderRooms();
    document.getElementById('roomForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('roomName').value.trim();
        const description = document.getElementById('roomDescription').value.trim();
        if (!name) return;
        saveRoom({ name, description });
        renderRooms();
        document.getElementById('roomForm').reset();
    });
    document.getElementById('itemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const roomIdx = parseInt(document.getElementById('itemRoomSelect').value);
        const name = document.getElementById('itemName').value.trim();
        const note = document.getElementById('itemNote').value.trim();
        if (!name || isNaN(roomIdx)) return;
        saveItem({ roomIdx, name, note });
        renderRoomDetails();
        document.getElementById('itemForm').reset();
    });
});
