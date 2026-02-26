const planets = document.querySelectorAll(".planet");
const planetName = document.getElementById("planetName");
const planetInfo = document.getElementById("planetInfo");

planets.forEach(planet => {
  planet.addEventListener("click", () => {
    planetName.textContent = planet.dataset.name;
    planetInfo.textContent = planet.dataset.info;
  });
});