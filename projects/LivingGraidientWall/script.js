const wall = document.querySelector(".gradient-wall");

document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;

  wall.style.backgroundPosition = `${x}% ${y}%`;
});