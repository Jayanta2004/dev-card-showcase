class WindowManager {
    constructor() {
        this.desktop = document.getElementById('window-area');
        this.taskList = document.getElementById('task-list');
        this.windows = [];
        this.activeWindow = null;
        this.zIndexCounter = 100;
    }

    createWindow(appId, title, componentClass) {
        // Create DOM from template
        const template = document.getElementById('window-template');
        const winNode = template.content.cloneNode(true).querySelector('.window');

        // Config ID
        const winId = `win-${Date.now()}`;
        winNode.id = winId;
        winNode.style.zIndex = ++this.zIndexCounter;

        // Random Position
        const left = 50 + Math.random() * 200;
        const top = 50 + Math.random() * 100;
        winNode.style.left = `${left}px`;
        winNode.style.top = `${top}px`;

        // Set Title
        winNode.querySelector('.window-title').textContent = title;

        // Instantiate App
        const contentArea = winNode.querySelector('.window-content');
        const appInstance = new componentClass(contentArea, winId);

        // State object
        const winState = {
            id: winId,
            node: winNode,
            app: appInstance,
            minimized: false
        };
        this.windows.push(winState);

        // Bind Controls
        this.bindControls(winNode, winState);

        // Drag Logic
        this.makeDraggable(winNode);

        // Add to DOM
        this.desktop.appendChild(winNode);

        // Add Taskbar Item
        this.addTaskbarItem(winState, title);

        // Focus
        this.focusWindow(winState);

        return appInstance;
    }

    bindControls(node, state) {
        const closeBtn = node.querySelector('.close');
        closeBtn.onclick = () => this.closeWindow(state);

        const minBtn = node.querySelector('.minimize');
        minBtn.onclick = () => this.minimizeWindow(state);

        const maxBtn = node.querySelector('.maximize');
        maxBtn.onclick = () => this.toggleMaximize(state); // Simple toggle for now

        // Focus on click
        node.addEventListener('mousedown', () => this.focusWindow(state));
    }

    closeWindow(state) {
        // Destroy app
        if (state.app.onDestroy) state.app.onDestroy();

        // Remove DOM
        state.node.remove();

        // Remove taskbar
        if (state.taskbarItem) state.taskbarItem.remove();

        // Remove from list
        this.windows = this.windows.filter(w => w.id !== state.id);
    }

    minimizeWindow(state) {
        state.minimized = true;
        state.node.style.display = 'none';
        state.taskbarItem.classList.remove('active');
    }

    restoreWindow(state) {
        state.minimized = false;
        state.node.style.display = 'flex';
        this.focusWindow(state);
    }

    focusWindow(state) {
        if (this.activeWindow === state) return;

        // Update Z-Index
        state.node.style.zIndex = ++this.zIndexCounter;

        // Update visuals
        if (this.activeWindow) {
            this.activeWindow.node.classList.remove('active');
            if (this.activeWindow.taskbarItem) this.activeWindow.taskbarItem.classList.remove('active');
        }
        state.node.classList.add('active');
        if (state.taskbarItem) state.taskbarItem.classList.add('active');

        this.activeWindow = state;
    }

    addTaskbarItem(state, title) {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.textContent = title;
        item.onclick = () => {
            if (state.minimized) this.restoreWindow(state);
            else this.focusWindow(state);
        };
        this.taskList.appendChild(item);
        state.taskbarItem = item;
    }

    makeDraggable(element) {
        const header = element.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            const rect = element.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            // Bring to front
            // handled by global mousedown on window
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            element.style.left = `${initialLeft + dx}px`;
            element.style.top = `${initialTop + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    toggleMaximize(state) {
        if (!state.maximized) {
            state.preRect = {
                left: state.node.style.left,
                top: state.node.style.top,
                width: state.node.style.width,
                height: state.node.style.height
            };
            state.node.style.left = '0';
            state.node.style.top = '0';
            state.node.style.width = '100%';
            state.node.style.height = '100%';
            state.maximized = true;
        } else {
            state.node.style.left = state.preRect.left;
            state.node.style.top = state.preRect.top;
            state.node.style.width = state.preRect.width;
            state.node.style.height = state.preRect.height;
            state.maximized = false;
        }
    }
}

window.WM = new WindowManager();
