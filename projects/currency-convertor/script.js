const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");

// Free exchange rate API
const API_URL = "https://api.exchangerate.host/latest";

// Common currencies
const currencies = [
  "USD", "EUR", "INR", "GBP", "JPY", "AUD", "CAD", "CNY"
];

// Populate dropdowns
currencies.forEach(currency => {
  const option1 = document.createElement("option");
  option1.value = currency;
  option1.textContent = currency;

  const option2 = option1.cloneNode(true);

  fromCurrency.appendChild(option1);
  toCurrency.appendChild(option2);
});

fromCurrency.value = "USD";
toCurrency.value = "INR";

async function convertCurrency() {
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    result.textContent = "Enter a valid amount.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}?base=${fromCurrency.value}`);
    const data = await response.json();

    const rate = data.rates[toCurrency.value];
    const converted = (amount * rate).toFixed(2);

    result.textContent = 
      `${amount} ${fromCurrency.value} = ${converted} ${toCurrency.value}`;
  } catch (error) {
    result.textContent = "Conversion failed. Internet probably betrayed you.";
  }
}

convertBtn.addEventListener("click", convertCurrency);
