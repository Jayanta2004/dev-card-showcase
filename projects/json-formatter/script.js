const input = document.getElementById("jsonInput");
const output = document.getElementById("output");

function formatJSON() {
  const value = input.value.trim();

  if (!value) {
    output.innerText = "⚠️ Please enter JSON data.";
    return;
  }

  try {
    const parsed = JSON.parse(value);
    const formatted = JSON.stringify(parsed, null, 2);
    output.innerText = formatted;
  } catch (error) {
    output.innerText = "❌ Invalid JSON:\n" + error.message;
  }
}

function clearAll() {
  input.value = "";
  output.innerText = "";
}