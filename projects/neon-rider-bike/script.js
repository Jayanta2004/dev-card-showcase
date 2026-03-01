const bike = document.getElementById("bike");

const lanes = [120, 210, 300];
let currentLane = 1;

bike.style.left = lanes[currentLane] + "px";

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentLane > 0) {
        currentLane--;
        bike.style.left = lanes[currentLane] + "px";
        bike.style.transform = "rotate(-8deg)";
        setTimeout(() => bike.style.transform = "rotate(0deg)", 300);
    }

    if (e.key === "ArrowRight" && currentLane < lanes.length - 1) {
        currentLane++;
        bike.style.left = lanes[currentLane] + "px";
        bike.style.transform = "rotate(8deg)";
        setTimeout(() => bike.style.transform = "rotate(0deg)", 300);
    }
});