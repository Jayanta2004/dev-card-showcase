const themeToggle = document.getElementById("theme-toggle");
const dataInput = document.getElementById("data-input");
const sortBtn = document.getElementById("sort-btn");
const orderSelect = document.getElementById("order");
const barsContainer = document.getElementById("bars-container");
const sortedOutput = document.getElementById("sorted-output");
const exportBtn = document.getElementById("export-btn");

let darkMode = false;
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
});

// Render data (bars for numbers, cards for strings)
function renderData(arr){
  barsContainer.innerHTML = "";
  arr.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("bar");
    if(!isNaN(item)){
      div.style.height = `${item*2}px`;
      div.textContent = item;
      div.style.background = "linear-gradient(to top,#ff00ff,#00ffff)";
    } else {
      div.style.height = `40px`;
      div.style.width = `${item.length*12}px`;
      div.style.background = "#00ff7f";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      div.textContent = item;
      div.style.borderRadius = "6px";
    }
    barsContainer.appendChild(div);
  });
}

// Sort button
sortBtn.addEventListener("click", () => {
  let arr = dataInput.value.split(",").map(x=>x.trim());
  let numbers = arr.filter(x=>!isNaN(x)).map(Number);
  let strings = arr.filter(x=>isNaN(x));

  const order = document.getElementById("order").value;

  // Sort numbers
  if(numbers.length){
    numbers.sort((a,b)=>order==="asc"?a-b:b-a);
  }

  // Sort strings
  if(strings.length){
    strings.sort((a,b)=>order==="asc"?a.localeCompare(b):b.localeCompare(a));
  }

  const sortedArr = [...numbers,...strings];
  sortedOutput.textContent = sortedArr.join(", ");
  renderData(sortedArr);
});

// Export JSON
exportBtn.addEventListener("click", ()=>{
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(sortedOutput.textContent.split(",").map(x=>x.trim()),null,2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href",dataStr);
  dlAnchor.setAttribute("download","sorted-data.json");
  dlAnchor.click();
});