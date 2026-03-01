document.addEventListener("DOMContentLoaded", () => {

  // ===== Magnetic Button =====
  const magnetic = document.querySelector(".magnetic");
  if (magnetic) {
    magnetic.addEventListener("mousemove", (e) => {
      const rect = magnetic.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      magnetic.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });

    magnetic.addEventListener("mouseleave", () => {
      magnetic.style.transform = "translate(0,0)";
    });
  }

  // ===== Ripple Effect =====
  const rippleBtn = document.querySelector(".ripple");
  if (rippleBtn) {
    rippleBtn.addEventListener("click", function (e) {
      const circle = document.createElement("span");
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const rect = this.getBoundingClientRect();

      circle.style.width = circle.style.height = diameter + "px";
      circle.style.left = e.clientX - rect.left - diameter / 2 + "px";
      circle.style.top = e.clientY - rect.top - diameter / 2 + "px";
      circle.style.position = "absolute";
      circle.style.background = "rgba(255,255,255,0.5)";
      circle.style.borderRadius = "50%";
      circle.style.transform = "scale(0)";
      circle.style.animation = "rippleAnim 0.6s linear";

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  }

  // ===== 3D Tilt =====
  const tiltCard = document.querySelector(".tilt");
  if (tiltCard) {
    tiltCard.addEventListener("mousemove", (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const rotateX = (y / rect.height - 0.5) * 20;
      const rotateY = (x / rect.width - 0.5) * -20;

      tiltCard.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  }

  // ===== Toast =====
  const toast = document.getElementById("toast");
  const showToastBtn = document.getElementById("showToast");

  if (toast && showToastBtn) {
    showToastBtn.addEventListener("click", () => {
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2000);
    });
  }

  // ===== Theme Toggle =====
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("light");
    });
  }

  // ===== Cursor Spotlight =====
  const cursor = document.querySelector(".cursor-light");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
  }

});