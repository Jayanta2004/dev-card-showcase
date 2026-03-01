function saveLocal() {
  localStorage.setItem("data", text.value);
  output.innerText = "Saved in LocalStorage";
}

function saveSession() {
  sessionStorage.setItem("data", text.value);
  output.innerText = "Saved in SessionStorage";
}

function clearAll() {
  localStorage.clear();
  sessionStorage.clear();
  output.innerText = "Cleared";
}