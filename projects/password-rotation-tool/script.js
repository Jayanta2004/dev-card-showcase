const form = document.getElementById("passwordForm");
const accountList = document.getElementById("accountList");

let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

function saveAccounts() {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

function daysBetween(date1, date2) {
    const diff = date2 - date1;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function render() {
    accountList.innerHTML = "";

    const today = new Date();

    accounts.forEach((acc, index) => {
        const last = new Date(acc.lastChanged);
        const days = daysBetween(last, today);
        const remaining = acc.interval - days;

        const div = document.createElement("div");
        div.classList.add("account");

        if (remaining <= 0) {
            div.classList.add("due");
        } else {
            div.classList.add("safe");
        }

        div.innerHTML = `
            <span><strong>${acc.account}</strong></span>
            <span>${remaining <= 0 ? "Rotation Due!" : remaining + " days left"}</span>
            <button class="delete-btn" onclick="removeAccount(${index})">✖</button>
        `;

        accountList.appendChild(div);
    });
}

function removeAccount(index) {
    accounts.splice(index, 1);
    saveAccounts();
    render();
}

form.onsubmit = (e) => {
    e.preventDefault();

    const account = document.getElementById("account").value;
    const lastChanged = document.getElementById("lastChanged").value;
    const interval = parseInt(document.getElementById("interval").value);

    accounts.push({ account, lastChanged, interval });
    saveAccounts();

    form.reset();
    render();
};

render();
