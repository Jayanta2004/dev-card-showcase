const secretInput = document.getElementById("secretInput");
const unlockTimeInput = document.getElementById("unlockTime");
const lockBtn = document.getElementById("lockBtn");
const clearBtn = document.getElementById("clearBtn");
const vaultContainer = document.getElementById("vaultContainer");

let vault = JSON.parse(localStorage.getItem("vault")) || [];

function saveVault() {
    localStorage.setItem("vault", JSON.stringify(vault));
}

function renderVault() {
    vaultContainer.innerHTML = "";

    const now = new Date().getTime();

    vault.forEach(item => {

        const div = document.createElement("div");
        div.className = "vault-item";

        if (now >= item.unlockTime) {
            div.innerHTML = `
                <div>UNLOCKED</div>
                <div>${item.secret}</div>
            `;
        } else {
            const remaining = Math.floor((item.unlockTime - now) / 1000);
            div.innerHTML = `
                <div>LOCKED</div>
                <div>Unlocks in ${remaining}s</div>
            `;
        }

        vaultContainer.appendChild(div);
    });
}

lockBtn.addEventListener("click", () => {

    const secret = secretInput.value;
    const unlockTime = new Date(unlockTimeInput.value).getTime();

    if (!secret || !unlockTime) {
        alert("Enter secret and time");
        return;
    }

    vault.push({
        secret,
        unlockTime
    });

    saveVault();
    renderVault();

    secretInput.value = "";
    unlockTimeInput.value = "";
});

clearBtn.addEventListener("click", () => {

    vault = [];
    saveVault();
    renderVault();

});

renderVault();

setInterval(renderVault, 1000);
