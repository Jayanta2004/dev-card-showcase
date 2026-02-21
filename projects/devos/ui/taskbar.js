export function initTaskbar() {
    const taskbar = document.getElementById("taskbar");

    const button = document.createElement("div");
    button.classList.add("task-button");
    button.textContent = "Terminal";

    button.onclick = () => location.reload();

    taskbar.appendChild(button);
}