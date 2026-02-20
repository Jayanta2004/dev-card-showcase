function calculate() {
  const travel = document.getElementById("travel").value;
  const electricity = document.getElementById("electricity").value;
  const diet = document.getElementById("diet").value;
  const resultDiv = document.getElementById("result");

  if (travel === "" || electricity === "") {
    resultDiv.textContent = "⚠️ Please fill all fields";
    return;
  }

  // Simple emission factors (approx)
  const travelEmission = travel * 0.21;      // per km
  const electricityEmission = electricity * 0.82; // per unit
  const dietEmission = diet * 30;            // monthly estimate

  const total = travelEmission + electricityEmission + dietEmission;

  resultDiv.innerHTML = `
    🌍 Your Monthly Carbon Footprint: <br><br>
    <strong>${total.toFixed(2)} kg CO₂</strong><br><br>
    ${total < 100 ? "Great job! Keep it eco-friendly 🌱" : "Try reducing travel & electricity usage 🚲💡"}
  `;
}
