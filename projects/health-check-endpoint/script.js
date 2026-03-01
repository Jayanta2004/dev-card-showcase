const statusDot = document.getElementById("statusDot");
const uptimeEl = document.getElementById("uptime");
const lastCheckedEl = document.getElementById("lastChecked");
const responseBar = document.getElementById("responseBar");
const responseTimeEl = document.getElementById("responseTime");
const checkBtn = document.getElementById("checkBtn");
const logContainer = document.getElementById("logContainer");

function checkHealth() {
    const start = Date.now();
    const isOnline = Math.random() > 0.1; // 90% chance online
    const responseTime = Math.floor(Math.random() * 200) + 50;

    setTimeout(() => {
        const now = new Date().toLocaleTimeString();
        lastCheckedEl.textContent = now;

        if (isOnline) {
            statusDot.style.background = '#00ff85';
            uptimeEl.textContent = (Math.random()*1000).toFixed(2) + " s";
        } else {
            statusDot.style.background = 'red';
            uptimeEl.textContent = "-";
        }

        responseTimeEl.textContent = responseTime + " ms";
        let percent = Math.min(responseTime / 300 * 100, 100);
        responseBar.style.width = percent + "%";

        // Log entry
        const logEntry = document.createElement("div");
        logEntry.className = "log-entry";
        logEntry.textContent = `[${now}] Status: ${isOnline ? 'Online':'Offline'}, Response: ${responseTime}ms`;
        logContainer.prepend(logEntry);
    }, responseTime);
}

setInterval(checkHealth, 30000);
checkBtn.addEventListener("click", checkHealth);
checkHealth(); // initial