const loanAmount = document.getElementById("loanAmount");
const interestRate = document.getElementById("interestRate");
const loanTenure = document.getElementById("loanTenure");
const calculateBtn = document.getElementById("calculateBtn");

const emiResult = document.getElementById("emiResult");
const totalInterest = document.getElementById("totalInterest");
const totalPayment = document.getElementById("totalPayment");

let chart;

calculateBtn.addEventListener("click", calculateEMI);

function calculateEMI() {
    const P = parseFloat(loanAmount.value);
    const annualRate = parseFloat(interestRate.value);
    const years = parseFloat(loanTenure.value);

    if (!P || !annualRate || !years) {
        alert("Please fill all fields!");
        return;
    }

    const R = annualRate / 12 / 100;
    const N = years * 12;

    const EMI = (P * R * Math.pow(1 + R, N)) / 
                (Math.pow(1 + R, N) - 1);

    const totalPay = EMI * N;
    const totalInt = totalPay - P;

    emiResult.textContent = `₹ ${EMI.toFixed(2)}`;
    totalInterest.textContent = `₹ ${totalInt.toFixed(2)}`;
    totalPayment.textContent = `₹ ${totalPay.toFixed(2)}`;

    updateChart(P, totalInt);
}

function updateChart(principal, interest) {
    const ctx = document.getElementById("emiChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Principal", "Interest"],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ["#4e73df", "#e74a3b"]
            }]
        }
    });
}