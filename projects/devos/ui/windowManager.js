let zIndexCounter = 1;

export function createWindow(title) {
    const desktop = document.getElementById("desktop");

    const windowEl = document.createElement("div");
    windowEl.classList.add("window");
    windowEl.style.top = "100px";
    windowEl.style.left = "100px";
    windowEl.style.zIndex = zIndexCounter++;

    const header = document.createElement("div");
    header.classList.add("window-header");
    header.innerHTML = `
        <span>${title}</span>
        <span class="close-btn" style="cursor:pointer">✖</span>
    `;

    const content = document.createElement("div");
    content.classList.add("window-content");

    windowEl.appendChild(header);
    windowEl.appendChild(content);
    desktop.appendChild(windowEl);

    makeDraggable(windowEl, header);

    // Bring to front on click
    windowEl.addEventListener("mousedown", () => {
        windowEl.style.zIndex = zIndexCounter++;
    });

    // Close button
    header.querySelector(".close-btn").onclick = () => {
        windowEl.remove();
    };

    return { element: windowEl, content };
}

function makeDraggable(win, header) {
    let offsetX, offsetY;

    header.onmousedown = (e) => {
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;

        document.onmousemove = (e) => {
            win.style.left = e.clientX - offsetX + "px";
            win.style.top = e.clientY - offsetY + "px";
        };

        document.onmouseup = () => {
            document.onmousemove = null;
        };
    };
}