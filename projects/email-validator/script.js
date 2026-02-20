const emailInput = document.getElementById("emailInput");
const validateBtn = document.getElementById("validateBtn");
const result = document.getElementById("result");

// Simple but effective email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

validateBtn.addEventListener("click", () => {
  const email = emailInput.value.trim();

  if (!email) {
    result.textContent = "Please enter an email address.";
    result.style.color = "orange";
    return;
  }

  if (emailRegex.test(email)) {
    result.textContent = "✅ Valid email address";
    result.style.color = "green";
  } else {
    result.textContent = "❌ Invalid email address";
    result.style.color = "red";
  }
});
