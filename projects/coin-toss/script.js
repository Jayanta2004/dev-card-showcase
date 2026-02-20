const tossBtn = document.getElementById("tossBtn");
const coin = document.getElementById("coin");
const result = document.getElementById("result");

tossBtn.addEventListener("click", () => {
    // Randomly select Heads or Tails
    const sides = ["Heads", "Tails"];
    const tossResult = sides[Math.floor(Math.random() * 2)];

    // Animate coin
    coin.style.transform = "rotateY(1800deg)";
    
    setTimeout(() => {
        coin.textContent = tossResult;
        coin.style.transform = "rotateY(0deg)";
        result.textContent = `You got ${tossResult}! 🎉`;
    }, 600); // match with transition duration
});
