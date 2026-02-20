const keyInput = $("keyInput");
const valueInput = $("valueInput");
const storageType = $("storageType");

const memoryOutput = $("memoryOutput");
const localOutput = $("localOutput");
const sessionOutput = $("sessionOutput");
const cookieOutput = $("cookieOutput");

const saveBtn = $("saveBtn");
const clearBtn = $("clearBtn");
const historyList = $("historyList");

// In-memory store
let memoryStore = {};

/* ===========================
   Render Output
=========================== */
function renderOutputs() {
  memoryOutput.textContent = JSON.stringify(memoryStore, null, 2);
  localOutput.textContent = formatStorage(localStorage);
  sessionOutput.textContent = formatStorage(sessionStorage);
  cookieOutput.textContent = JSON.stringify(getCookiesAsObject(), null, 2);
}

/* ===========================
   Save Action
=========================== */
saveBtn.addEventListener("click", () => {
  const key = keyInput.value.trim();
  const value = valueInput.value.trim();

  const error = validateInput(key, value);
  if (error) {
    alert(error);
    return;
  }

  switch (storageType.value) {
    case "memory":
      memoryStore[key] = value;
      logAction(historyList, `Saved "${key}" to In-Memory`);
      break;

    case "local":
      localStorage.setItem(key, value);
      logAction(historyList, `Saved "${key}" to localStorage`);
      break;

    case "session":
      sessionStorage.setItem(key, value);
      logAction(historyList, `Saved "${key}" to sessionStorage`);
      break;

    case "cookie":
      setCookie(key, value);
      logAction(historyList, `Saved "${key}" to Cookie`);
      break;
  }

  renderOutputs();
});

/* ===========================
   Clear All Action
=========================== */
clearBtn.addEventListener("click", () => {
  memoryStore = {};
  localStorage.clear();
  sessionStorage.clear();
  clearAllCookies();

  logAction(historyList, "Cleared all storage types");
  renderOutputs();
});

/* ===========================
   Initial Load
=========================== */
renderOutputs();