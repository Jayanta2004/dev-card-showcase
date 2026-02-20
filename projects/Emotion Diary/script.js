const currentDate = document.getElementById("current-date");
const moodButtons = document.querySelectorAll(".mood-btn");
const sheetArea = document.getElementById("sheet-area");
const storageArea = document.getElementById("storage-area");
const savedSheetsDiv = document.getElementById("saved-sheets");
const createBtn = document.getElementById("create-sheet-btn");
const viewBtn = document.getElementById("view-storage-btn");

// Display today's date
const today = new Date();
currentDate.textContent = today.toDateString();

// Load saved sheets
let savedSheets = JSON.parse(localStorage.getItem("savedSheets")) || [];

// Function to render storage area
function renderStorage() {
  savedSheetsDiv.innerHTML = "";
  savedSheets.forEach(sheet => {
    const div = document.createElement("div");
    div.classList.add("saved-sheet");
    div.style.background = `linear-gradient(45deg, ${sheet.color1}, ${sheet.color2})`;

    div.innerHTML = `
      <span class="saved-sheet-emoji saved-sheet-emoji-top-left">${sheet.emoji1}</span>
      <span class="saved-sheet-emoji saved-sheet-emoji-bottom-right">${sheet.emoji2}</span>
      <p><strong>${sheet.date}</strong></p>
      <p>${sheet.note}</p>
    `;
    savedSheetsDiv.appendChild(div);
  });
}

// Show storage area
viewBtn.addEventListener("click", () => {
  storageArea.style.display = "block";
  sheetArea.style.display = "none";
  renderStorage();
});

// Show sheet creation area
createBtn.addEventListener("click", () => {
  storageArea.style.display = "none";
  sheetArea.style.display = "flex";
  sheetArea.innerHTML = "";
  selectedMoods = [];
});

// Handle mood selection (max 2 moods)
let selectedMoods = [];
moodButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (selectedMoods.length < 2 && !selectedMoods.includes(btn)) {
      selectedMoods.push(btn);
    }
    if (selectedMoods.length === 2) {
      createSheet(selectedMoods[0], selectedMoods[1]);
      selectedMoods = [];
    }
  });
});

// Function to create a new sheet
function createSheet(mood1, mood2) {
  const color1 = mood1.getAttribute("data-color");
  const color2 = mood2.getAttribute("data-color");
  const emoji1 = mood1.getAttribute("data-emoji");
  const emoji2 = mood2.getAttribute("data-emoji");

  const sheetDiv = document.createElement("div");
  sheetDiv.classList.add("mood-sheet");
  sheetDiv.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;

  sheetDiv.innerHTML = `
    <span class="sheet-emoji-top-left">${emoji1}</span>
    <span class="sheet-emoji-bottom-right">${emoji2}</span>
    <textarea class="mood-textarea" placeholder="Write your thoughts..."></textarea>
    <button class="save-btn">Save</button>
  `;

  sheetArea.innerHTML = "";
  sheetArea.appendChild(sheetDiv);

  // Save button
  sheetDiv.querySelector(".save-btn").addEventListener("click", () => {
    const note = sheetDiv.querySelector(".mood-textarea").value;
    const sheetData = {
      date: today.toDateString(),
      color1,
      color2,
      emoji1,
      emoji2,
      note
    };
    savedSheets.push(sheetData);
    localStorage.setItem("savedSheets", JSON.stringify(savedSheets));
    alert("Sheet saved!");
    sheetArea.innerHTML = "";
  });
}
