const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// Load saved data
window.onload = () => {
  days.forEach(day => {
    const savedTask = localStorage.getItem(day);
    if (savedTask) {
      document.getElementById(day).value = savedTask;
    }
  });
};

// Save tasks
function saveTasks() {
  days.forEach(day => {
    const task = document.getElementById(day).value;
    localStorage.setItem(day, task);
  });
  alert("Weekly tasks saved successfully!");
}

// Reset week
function resetWeek() {
  if (confirm("Are you sure you want to reset the entire week?")) {
    days.forEach(day => {
      document.getElementById(day).value = "";
      localStorage.removeItem(day);
    });
  }
}
