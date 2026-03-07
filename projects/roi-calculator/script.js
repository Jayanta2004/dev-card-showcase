const yearlyHoursEl = document.getElementById("yearlyHours");
const fiveYearEl = document.getElementById("fiveYear");
const opportunityCostEl = document.getElementById("opportunityCost");
const roiRatingEl = document.getElementById("roiRating");
const roiBar = document.getElementById("roiBar");
const historyList = document.getElementById("historyList");

let activities = JSON.parse(localStorage.getItem("lifeROI")) || [];

function calculateROI() {
  const name = document.getElementById("activityName").value;
  const hoursPerWeek = parseFloat(document.getElementById("hoursPerWeek").value);
  const impactScore = parseFloat(document.getElementById("impactScore").value);

  if (!name || !hoursPerWeek || !impactScore) return;

  const yearlyHours = hoursPerWeek * 52;
  const fiveYear = yearlyHours * 5;
  const opportunityCost = (yearlyHours / 24).toFixed(1);

  const roiValue = impactScore * (100 / hoursPerWeek);
  let rating = "Low Value";

  if (roiValue > 50) rating = "High Value";
  else if (roiValue > 25) rating = "Medium Value";

  yearlyHoursEl.textContent = yearlyHours + " hrs";
  fiveYearEl.textContent = fiveYear + " hrs";
  opportunityCostEl.textContent = opportunityCost + " days";
  roiRatingEl.textContent = rating;

  roiBar.style.width = Math.min(roiValue, 100) + "%";

  activities.push({ name, rating });
  localStorage.setItem("lifeROI", JSON.stringify(activities));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  activities.forEach(act => {
    const li = document.createElement("li");
    li.textContent = act.name + " - " + act.rating;
    historyList.appendChild(li);
  });
}

renderHistory();