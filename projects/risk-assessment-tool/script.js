const themeToggle = document.getElementById("theme-toggle");
const exportBtn = document.getElementById("export-btn");
const addRiskBtn = document.getElementById("add-risk");
const riskCards = document.getElementById("risk-cards");
let risks = [];

// Dark mode toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Add new risk
addRiskBtn.addEventListener("click", () => {
  const name = document.getElementById("risk-name").value.trim();
  const likelihood = parseInt(document.getElementById("risk-likelihood").value);
  const impact = parseInt(document.getElementById("risk-impact").value);
  if(!name || !likelihood || !impact) return alert("Fill all fields!");
  const score = likelihood * impact;
  let level = score <= 6 ? "low" : score <= 15 ? "medium" : "high";
  const risk = {name, likelihood, impact, score, level};
  risks.push(risk);
  renderRiskCards();
  updateChart();
  document.getElementById("risk-name").value = "";
  document.getElementById("risk-likelihood").value = "";
  document.getElementById("risk-impact").value = "";
});

// Render risk cards
function renderRiskCards(){
  riskCards.innerHTML = "";
  risks.forEach((r,i)=>{
    const card = document.createElement("div");
    card.classList.add("risk-card", r.level);
    card.innerHTML = `<span>${r.name} (Score: ${r.score})</span> <button onclick="deleteRisk(${i})">❌</button>`;
    riskCards.appendChild(card);
  });
}

// Delete risk
function deleteRisk(index){
  risks.splice(index,1);
  renderRiskCards();
  updateChart();
}

// Chart.js
const ctx = document.getElementById('risk-chart').getContext('2d');
const riskChart = new Chart(ctx,{
  type:'bar',
  data:{
    labels:['Low','Medium','High'],
    datasets:[{label:'Risk Count',data:[0,0,0],backgroundColor:['#28a745','#ffc107','#dc3545']}]
  },
  options:{responsive:true,plugins:{legend:{display:false}}}
});

function updateChart(){
  const low = risks.filter(r=>r.level==='low').length;
  const medium = risks.filter(r=>r.level==='medium').length;
  const high = risks.filter(r=>r.level==='high').length;
  riskChart.data.datasets[0].data = [low,medium,high];
  riskChart.update();
}

// Export JSON
exportBtn.addEventListener("click", ()=>{
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(risks,null,2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href",dataStr);
  dlAnchor.setAttribute("download","risk-assessment.json");
  dlAnchor.click();
});