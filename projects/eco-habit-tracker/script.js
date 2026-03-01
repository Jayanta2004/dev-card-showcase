const checkboxes = document.querySelectorAll("input[type='checkbox']");
const progressText = document.getElementById("progress");

function updateProgress() {
  let completed = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) completed++;
    localStorage.setItem(cb.id, cb.checked);
  });

  const percentage = Math.round((completed / checkboxes.length) * 100);
  progressText.innerText = `Progress: ${percentage}%`;
}

checkboxes.forEach(cb => {
  const savedState = localStorage.getItem(cb.id);
  cb.checked = savedState === "true";
  cb.addEventListener("change", updateProgress);
});

updateProgress();