document.addEventListener("mousemove", (e) => {
  const dot = document.createElement("div");
  dot.style.position = "fixed";
  dot.style.left = e.clientX + "px";
  dot.style.top = e.clientY + "px";
  dot.style.width = "6px";
  dot.style.height = "6px";
  dot.style.borderRadius = "50%";
  dot.style.pointerEvents = "none";
  dot.style.background = "rgba(255,255,255,0.35)";
  dot.style.filter = "blur(1px)";
  dot.style.zIndex = "9999";
  document.body.appendChild(dot);

  setTimeout(() => dot.remove(), 400);
});
