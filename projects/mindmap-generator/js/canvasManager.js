let scale = 1;
let originX = 0;
let originY = 0;
let isPanning = false;
let startX, startY;

const board = document.getElementById("board");
const container = document.querySelector(".board-container");

export function initCanvasControls() {

    // Zoom with mouse wheel
    container.addEventListener("wheel", (e) => {
        e.preventDefault();

        const zoomIntensity = 0.1;
        scale += e.deltaY < 0 ? zoomIntensity : -zoomIntensity;

        scale = Math.min(Math.max(0.5, scale), 2);

        board.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
    });

    // Start panning
    container.addEventListener("mousedown", (e) => {
        if (e.target !== container) return;

        isPanning = true;
        startX = e.clientX - originX;
        startY = e.clientY - originY;
        container.style.cursor = "grabbing";
    });

    // Move board
    container.addEventListener("mousemove", (e) => {
        if (!isPanning) return;

        originX = e.clientX - startX;
        originY = e.clientY - startY;

        board.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
    });

    // Stop panning
    container.addEventListener("mouseup", () => {
        isPanning = false;
        container.style.cursor = "default";
    });

    container.addEventListener("mouseleave", () => {
        isPanning = false;
    });
}