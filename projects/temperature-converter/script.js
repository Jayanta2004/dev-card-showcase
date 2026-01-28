const slider = document.getElementById("tempSlider");
const celsiusText = document.getElementById("celsius");
const fahrenheitText = document.getElementById("fahrenheit");
const kelvinText = document.getElementById("kelvin");

function updateUI(celsius) {
  const fahrenheit = (celsius * 9) / 5 + 32;
  const kelvin = celsius + 273.15;

  celsiusText.textContent = `${celsius}°C`;
  fahrenheitText.textContent = `${fahrenheit.toFixed(1)}°F`;
  kelvinText.textContent = `${kelvin.toFixed(2)}K`;

  // Dynamic background
  if (celsius < 0) {
    document.body.style.background =
      "linear-gradient(135deg, #00c6ff, #0072ff)";
  } else if (celsius < 30) {
    document.body.style.background =
      "linear-gradient(135deg, #4facfe, #00f2fe)";
  } else {
    document.body.style.background =
      "linear-gradient(135deg, #f12711, #f5af19)";
  }
}

slider.addEventListener("input", () => {
  updateUI(parseInt(slider.value));
});

// Init
updateUI(parseInt(slider.value));
