const height = document.getElementById("height");
const weight = document.getElementById("weight");
const heightValue = document.getElementById("heightValue");
const bmiValue = document.getElementById("bmiValue");
const bmiStatus = document.getElementById("bmiStatus");
const btn = document.getElementById("calculateBtn");

height.addEventListener("input", () => {
  heightValue.textContent = `${height.value} cm`;
});

btn.addEventListener("click", () => {
  const h = height.value / 100;
  const w = weight.value;

  if (!w || w <= 0) {
    bmiStatus.textContent = "Please enter valid weight";
    return;
  }

  const bmi = (w / (h * h)).toFixed(1);
  bmiValue.textContent = bmi;

  if (bmi < 18.5) {
    bmiStatus.textContent = "Underweight";
  } else if (bmi < 25) {
    bmiStatus.textContent = "Normal weight";
  } else if (bmi < 30) {
    bmiStatus.textContent = "Overweight";
  } else {
    bmiStatus.textContent = "Obese";
  }
});
