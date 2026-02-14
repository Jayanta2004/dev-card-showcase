let chart;

function forecastRevenue() {
  let initialRevenue = parseFloat(document.getElementById("initialRevenue").value);
  let growthRate = parseFloat(document.getElementById("growthRate").value) / 100;
  let months = parseInt(document.getElementById("months").value);
  let seasonality = parseFloat(document.getElementById("seasonality").value) || 1;

  if (!initialRevenue || !growthRate || !months) {
    alert("Please enter all required fields.");
    return;
  }

  let revenueData = [];
  let labels = [];
  let currentRevenue = initialRevenue;
  let totalRevenue = 0;

  for (let i = 1; i <= months; i++) {
    currentRevenue = currentRevenue * (1 + growthRate);
    let seasonalRevenue = currentRevenue * seasonality;

    revenueData.push(seasonalRevenue.toFixed(2));
    labels.push("Month " + i);
    totalRevenue += seasonalRevenue;
  }

  document.getElementById("totalRevenue").innerText = totalRevenue.toFixed(2);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("revenueChart"), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "Forecasted Revenue",
        data: revenueData,
        borderColor: "#007bff",
        fill: false
      }]
    },
    options: {
      responsive: true
    }
  });
}
