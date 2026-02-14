const categorySelect = document.getElementById("category");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const inputValue = document.getElementById("inputValue");
const output = document.getElementById("output");
const historyList = document.getElementById("historyList");
const binaryMode = document.getElementById("binaryMode");

const convertBtn = document.getElementById("convertBtn");
const copyBtn = document.getElementById("copyBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const swapBtn = document.getElementById("swapBtn");
const themeToggle = document.getElementById("themeToggle");

const UNIT_MAP = {
  data: ["B", "KB", "MB", "GB"],
  time: ["ms", "s", "min", "hr"],
  speed: ["Kbps", "Mbps", "Gbps"]
};

const FACTORS = {
  data: unit => {
    const base = binaryMode.checked ? 1024 : 1000;
    return {
      B: 1,
      KB: base,
      MB: base ** 2,
      GB: base ** 3
    }[unit];
  },
  time: {
    ms: 1,
    s: 1000,
    min: 60000,
    hr: 3600000
  },
  speed: {
    Kbps: 1,
    Mbps: 1000,
    Gbps: 1000 ** 2
  }
};

function populateUnits() {
  const units = UNIT_MAP[categorySelect.value];
  fromUnit.innerHTML = "";
  toUnit.innerHTML = "";
  units.forEach(u => {
    fromUnit.innerHTML += `<option>${u}</option>`;
    toUnit.innerHTML += `<option>${u}</option>`;
  });
}

function convert() {
  const value = Number(inputValue.value);
  if (isNaN(value)) {
    output.innerText = "⚠️ Invalid input";
    return;
  }

  const cat = categorySelect.value;
  let baseValue;

  if (cat === "data") {
    baseValue = value * FACTORS.data(fromUnit.value);
    var result = baseValue / FACTORS.data(toUnit.value);
  } else {
    baseValue = value * FACTORS[cat][fromUnit.value];
    var result = baseValue / FACTORS[cat][toUnit.value];
  }

  output.innerText = result.toFixed(4);
  saveHistory(value, fromUnit.value, result, toUnit.value);
}

function saveHistory(v1, u1, v2, u2) {
  const li = document.createElement("li");
  li.innerText = `${v1} ${u1} → ${v2.toFixed(4)} ${u2}`;
  historyList.prepend(li);
}

swapBtn.onclick = () => {
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
};

copyBtn.onclick = () => {
  navigator.clipboard.writeText(output.innerText);
};

clearHistoryBtn.onclick = () => {
  historyList.innerHTML = "";
};

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
};

categorySelect.onchange = populateUnits;
convertBtn.onclick = convert;

populateUnits();