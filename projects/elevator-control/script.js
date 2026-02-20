const totalFloors = 10;
let currentFloor = 1;
let direction = "Idle";
let callQueue = [];
let moving = false;

const elevator = document.getElementById("elevator");
const floorsContainer = document.getElementById("floors");
const floorButtonsContainer = document.getElementById("floorButtons");
const currentFloorDisplay = document.getElementById("currentFloor");
const directionDisplay = document.getElementById("direction");

// Create floors
for (let i = totalFloors; i >= 1; i--) {
    const floor = document.createElement("div");
    floor.className = "floor";
    const floorNum = document.createElement("span");
    floorNum.className = "floor-number";
    floorNum.textContent = i;
    floor.appendChild(floorNum);
    floorsContainer.appendChild(floor);

    const btn = document.createElement("button");
    btn.textContent = i;
    btn.addEventListener("click", () => callElevator(i));
    floorButtonsContainer.appendChild(btn);
}

// Elevator movement with doors
function moveElevator(targetFloor) {
    if (moving) {
        callQueue.push(targetFloor);
        return;
    }
    moving = true;

    direction = targetFloor > currentFloor ? "Up" : "Down";
    directionDisplay.textContent = direction;

    elevator.style.top = (totalFloors - targetFloor) * 50 + "px";

    setTimeout(() => {
        currentFloor = targetFloor;
        currentFloorDisplay.textContent = currentFloor;
        direction = "Idle";
        directionDisplay.textContent = direction;
        openDoors();
    }, 1000);
}

// Open doors for 1 second
function openDoors() {
    const leftDoor = elevator.querySelector(".door.left");
    const rightDoor = elevator.querySelector(".door.right");

    leftDoor.classList.add("open");
    rightDoor.classList.add("open");

    setTimeout(() => {
        leftDoor.classList.remove("open");
        rightDoor.classList.remove("open");
        moving = false;

        if (callQueue.length > 0) {
            const next = callQueue.shift();
            moveElevator(next);
        }
    }, 1000);
}

// Call elevator
function callElevator(floor) {
    if (floor === currentFloor && !moving) {
        alert(`Elevator is already at floor ${floor}`);
        return;
    }
    moveElevator(floor);
}

// Emergency stop
document.getElementById("emergencyBtn").addEventListener("click", () => {
    alert("🚨 Emergency Stop Activated!");
    callQueue = [];
    moving = false;
    direction = "Idle";
    directionDisplay.textContent = direction;
});
