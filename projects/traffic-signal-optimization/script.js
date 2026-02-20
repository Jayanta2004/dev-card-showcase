let nsGreen = 0;
let ewGreen = 0;
let cycleRunning = false;

function startSimulation() {
    if (cycleRunning) return;
    cycleRunning = true;

    const ns = Number(document.getElementById("nsTraffic").value);
    const ew = Number(document.getElementById("ewTraffic").value);
    const total = ns + ew;

    nsGreen = Math.round((ns / total) * 20) + 5;
    ewGreen = Math.round((ew / total) * 20) + 5;

    document.getElementById("nsTime").innerText = nsGreen;
    document.getElementById("ewTime").innerText = ewGreen;

    runCycle();
}

function runCycle() {
    const nsSignal = document.getElementById("nsSignal");
    const ewSignal = document.getElementById("ewSignal");
    const nsCar = document.querySelector(".ns-car");
    const ewCar = document.querySelector(".ew-car");

    // NS GREEN
    nsSignal.style.background = "lime";
    ewSignal.style.background = "red";
    moveCar(nsCar, "vertical");

    setTimeout(() => {
        nsSignal.style.background = "red";
        ewSignal.style.background = "lime";
        moveCar(ewCar, "horizontal");
    }, nsGreen * 1000);

    setTimeout(() => {
        cycleRunning = false;
    }, (nsGreen + ewGreen) * 1000);
}

function moveCar(car, direction) {
    car.style.transition = "none";
    if (direction === "vertical") car.style.top = "-20px";
    else car.style.left = "-20px";

    setTimeout(() => {
        car.style.transition = "all 4s linear";
        if (direction === "vertical") car.style.top = "380px";
        else car.style.left = "380px";
    }, 50);
}
