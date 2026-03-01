const steps = document.querySelectorAll(".step");
const contents = document.querySelectorAll(".step-content");

function goToStep(n) {
    steps.forEach((s, i) => s.classList.toggle("active", i === n));
    contents.forEach((c, i) => c.classList.toggle("active", i === n));
}

let generatedCode = "";

// Step 1
document.getElementById("sendCode").onclick = () => {
    const email = document.getElementById("email").value;
    if (!email.includes("@")) {
        status.textContent = "INVALID EMAIL";
        return;
    }
    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("status").textContent =
        "CODE SENT: " + generatedCode;
    document.getElementById("code").disabled = false;
    document.getElementById("verify").disabled = false;
};

document.getElementById("verify").onclick = () => {
    const inputCode = document.getElementById("code").value;
    if (inputCode === generatedCode) {
        goToStep(1);
    } else {
        document.getElementById("status").textContent =
            "ACCESS DENIED";
    }
};

// Step 2
document.getElementById("toReview").onclick = () => {
    const reason = document.getElementById("reason").value;
    if (!reason) {
        alert("SELECT REASON");
        return;
    }

    document.getElementById("reviewEmail").textContent =
        document.getElementById("email").value;
    document.getElementById("reviewReason").textContent = reason;
    document.getElementById("reviewDetails").textContent =
        document.getElementById("details").value || "NONE";

    goToStep(2);
};

// Step 3
document.getElementById("submit").onclick = () => {
    const ticketId = "CYB-" + Math.floor(Math.random() * 90000 + 10000);
    document.getElementById("ticket").textContent =
        "TICKET ID: " + ticketId;
    goToStep(3);
};
