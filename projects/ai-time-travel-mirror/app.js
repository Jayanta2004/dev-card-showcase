// AI Time-Travel Mirror Frontend Logic
const { createFutureAvatar, createLifestylePlan, createActionPlan, createDashboard } = window.Components;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mirrorForm');
  const profile = document.getElementById('future-profile');
  let photoURL = '';

  form.photo.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        photoURL = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const path = form.path.value;
    if (!path) return;
    profile.innerHTML = `
      <div class="future-section">
        <h2>Your Future Self</h2>
        ${createFutureAvatar(path, photoURL)}
      </div>
      <div class="future-section">
        <h3>Lifestyle Plan</h3>
        ${createLifestylePlan(path)}
      </div>
      <div class="future-section">
        ${createActionPlan(path)}
      </div>
      <div class="future-section">
        ${createDashboard(path)}
      </div>
    `;
  });
});
