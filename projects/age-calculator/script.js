const dobInput = document.getElementById("dob");
const calcBtn = document.getElementById("calcBtn");
const result = document.getElementById("result");

calcBtn.addEventListener("click", () => {
  const dobValue = dobInput.value;

  if (!dobValue) {
    result.textContent = "Please select your date of birth.";
    return;
  }

  const dob = new Date(dobValue);
  const today = new Date();

  if (dob > today) {
    result.textContent = "Date of birth cannot be in the future.";
    return;
  }

  let ageYears = today.getFullYear() - dob.getFullYear();
  let ageMonths = today.getMonth() - dob.getMonth();
  let ageDays = today.getDate() - dob.getDate();

  if (ageDays < 0) {
    ageMonths--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    ageDays += lastMonth.getDate();
  }

  if (ageMonths < 0) {
    ageYears--;
    ageMonths += 12;
  }

  result.textContent = 
    `You are ${ageYears} years, ${ageMonths} months, and ${ageDays} days old.`;
});
