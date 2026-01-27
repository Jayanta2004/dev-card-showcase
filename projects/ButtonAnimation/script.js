// Ripple Effect
document.querySelectorAll(".btn4").forEach(btn => {
  btn.addEventListener("click", function(e){
    const span = document.createElement("span");
    span.style.left = e.offsetX + "px";
    span.style.top = e.offsetY + "px";
    this.appendChild(span);
    setTimeout(()=> span.remove(),600);
  });
});

// Loading Button
const loadBtn = document.querySelector(".btn17");
loadBtn.addEventListener("click", ()=>{
  loadBtn.textContent = "Loading...";
  loadBtn.classList.add("loading");

  setTimeout(()=>{
    loadBtn.textContent = "Done!";
    loadBtn.classList.remove("loading");
    loadBtn.classList.add("success");
  },2000);
});

// Heart Button
const heartBtn = document.querySelector(".btn19");
heartBtn.addEventListener("click",()=>{
  heartBtn.textContent = "❤️ Liked";
});
