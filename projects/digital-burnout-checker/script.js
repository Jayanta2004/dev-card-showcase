function checkBurnout() {
  const hours = Number(document.getElementById("hours").value);
  const breaks = Number(document.getElementById("breaks").value);
  let score = hours * 2 - breaks;

  let message = "Low Burnout 🙂";
  if (score > 10) message = "High Burnout 😵";
  else if (score > 6) message = "Moderate Burnout 😐";

  document.getElementById("result").innerText = message;
}