// Unified Notification System JS
function showNotification(message, type = 'info', duration = 4000) {
  const notif = document.getElementById('notification');
  notif.className = `notification ${type}`;
  notif.innerHTML = `<span>${message}</span><button class='close-btn' aria-label='Dismiss notification'>&times;</button>`;
  notif.style.display = 'flex';
  notif.focus();

  // Dismiss on close button
  notif.querySelector('.close-btn').onclick = () => {
    notif.style.display = 'none';
  };

  // Dismiss on Escape key
  notif.onkeydown = e => {
    if (e.key === 'Escape') notif.style.display = 'none';
  };

  // Auto-dismiss after duration
  if (duration > 0) {
    if (notif._timeout) clearTimeout(notif._timeout);
    notif._timeout = setTimeout(() => {
      notif.style.display = 'none';
    }, duration);
  }
}

// Optional: Theme toggle for demo
const themeBtn = document.createElement('button');
themeBtn.textContent = 'Toggle Theme';
themeBtn.style.position = 'fixed';
themeBtn.style.bottom = '1.5rem';
themeBtn.style.right = '1.5rem';
themeBtn.style.zIndex = 3000;
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
};
document.body.appendChild(themeBtn);
