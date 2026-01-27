document.addEventListener("DOMContentLoaded", () => {
  function initThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    const body = document.body;
    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") body.classList.add("light-mode");
    themeToggle.textContent = body.classList.contains("light-mode") ? "☀️" : "🌙";

    themeToggle.addEventListener("click", () => {
      const isLight = body.classList.toggle("light-mode");
      themeToggle.textContent = isLight ? "☀️" : "🌙";
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  const navbarObserver = new MutationObserver((mutations, observer) => {
    if (document.getElementById("themeToggle")) {
      initThemeToggle();
      observer.disconnect();
    }
  });
  navbarObserver.observe(document.body, { childList: true, subtree: true });

  const featureDescription = document.getElementById('featureDescription');
  const charCount = document.getElementById('charCount');
  featureDescription?.addEventListener('input', () => {
    const len = featureDescription.value.length;
    charCount.textContent = len;
    charCount.style.color = len > 900 ? 'orange' : '';
  });

  document.getElementById('featureRequestForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    btn.classList.add('loading');
    btn.innerHTML = '<i class="fas fa-spinner"></i> Submitting...';

    const formData = {
      title: document.getElementById('featureTitle').value,
      category: document.getElementById('category').value,
      priority: document.getElementById('priorityLevel').value,
      description: document.getElementById('featureDescription').value,
      useCases: document.getElementById('useCases').value,
      timestamp: new Date().toISOString()
    };

    await new Promise(r => setTimeout(r, 1000));

    const requests = JSON.parse(localStorage.getItem('featureRequests') || '[]');
    requests.push(formData);
    localStorage.setItem('featureRequests', JSON.stringify(requests));

    successMessage.classList.add('show');
    btn.classList.remove('loading');
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Request';
    e.target.reset();
    charCount.textContent = '0';
    setTimeout(() => successMessage.classList.remove('show'), 4000);
  });

  const scrollBtn = document.getElementById('scrollToTop');
  window.addEventListener('scroll', () => {
    scrollBtn?.classList.toggle('show', window.scrollY > 300);
  });
  scrollBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
