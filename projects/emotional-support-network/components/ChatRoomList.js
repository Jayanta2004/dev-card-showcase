// ChatRoomList Component
class ChatRoomList {
    constructor(container, onSelect) {
        this.container = container;
        this.rooms = ['main', 'support', 'motivation', 'grief', 'anxiety', 'relationships'];
        this.onSelect = onSelect;
        this.render();
    }

    render() {
        this.container.innerHTML = '<div class="chatroom-list-header">Available Chat Rooms</div>';
        const list = document.createElement('ul');
        list.className = 'chatroom-list';
        this.rooms.forEach(room => {
            const li = document.createElement('li');
            li.textContent = room.charAt(0).toUpperCase() + room.slice(1);
            li.className = 'chatroom-list-item';
            li.addEventListener('click', () => this.onSelect(room));
            list.appendChild(li);
        });
        this.container.appendChild(list);
    }
}

export default ChatRoomList;
