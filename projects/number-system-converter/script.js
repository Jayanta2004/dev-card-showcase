function convert() {
  const value = document.getElementById("inputValue").value.trim();
  const base = parseInt(document.getElementById("fromBase").value);

  if (!value) return clearOutputs();

  let decimal;
  try {
    decimal = parseInt(value, base);
    if (isNaN(decimal)) throw new Error();
  } catch {
    clearOutputs();
    return;
  }

  document.getElementById("bin").innerText = decimal.toString(2);
  document.getElementById("dec").innerText = decimal.toString(10);
  document.getElementById("oct").innerText = decimal.toString(8);
  document.getElementById("hex").innerText = decimal.toString(16).toUpperCase();
}

function clearOutputs() {
  ["bin", "dec", "oct", "hex"].forEach(id => {
    document.getElementById(id).innerText = "—";
  });
}
