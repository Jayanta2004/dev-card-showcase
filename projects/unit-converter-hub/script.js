const units = {
  length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    mile: 1609.34
  },
  weight: {
    gram: 1,
    kilogram: 1000,
    pound: 453.592
  }
};

function loadUnits() {
  const category = document.getElementById("category").value;
  const fromUnit = document.getElementById("fromUnit");
  const toUnit = document.getElementById("toUnit");

  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";

  if (category === "temperature") {
    ["Celsius", "Fahrenheit", "Kelvin"].forEach(unit => {
      fromUnit.add(new Option(unit, unit));
      toUnit.add(new Option(unit, unit));
    });
    return;
  }

  for (let unit in units[category]) {
    fromUnit.add(new Option(unit, unit));
    toUnit.add(new Option(unit, unit));
  }
}

function convert() {
  const category = document.getElementById("category").value;
  const value = parseFloat(document.getElementById("inputValue").value);
  const from = document.getElementById("fromUnit").value;
  const to = document.getElementById("toUnit").value;

  if (isNaN(value)) return;

  let result;

  if (category === "temperature") {
    result = convertTemperature(value, from, to);
  } else {
    result = value * (units[category][from] / units[category][to]);
  }

  document.getElementById("outputValue").value = result.toFixed(2);
}

function convertTemperature(value, from, to) {
  if (from === to) return value;

  let celsius;
  if (from === "Fahrenheit") celsius = (value - 32) * 5 / 9;
  else if (from === "Kelvin") celsius = value - 273.15;
  else celsius = value;

  if (to === "Fahrenheit") return (celsius * 9 / 5) + 32;
  if (to === "Kelvin") return celsius + 273.15;
  return celsius;
}

loadUnits();
