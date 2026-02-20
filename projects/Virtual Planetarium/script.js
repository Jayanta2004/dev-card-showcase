const planets = [
  {
    name: "Mercury",
    size: 6,
    color: "#9ca3af",
    orbit: 120,
    speed: 10,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/18_mercury_new.png",
    details: {
      Overview: "Mercury is the smallest planet and closest to the Sun.",
      Distance: "57.9 million km from the Sun",
      DayLength: "1 day = 59 Earth days",
      Atmosphere: "Thin exosphere made of oxygen, sodium, hydrogen",
      FunFact: "A year on Mercury is shorter than a day on Mercury!"
    }
  },

  {
    name: "Venus",
    size: 10,
    color: "#fbbf24",
    orbit: 160,
    speed: 18,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/27_venus_jg.png",
    details: {
      Overview: "Venus is the hottest planet in our solar system.",
      Distance: "108.2 million km from the Sun",
      DayLength: "1 day = 243 Earth days",
      Atmosphere: "Thick CO₂ clouds with sulfuric acid",
      FunFact: "Venus spins backward compared to most planets."
    }
  },

  {
    name: "Earth",
    size: 10,
    color: "#3b82f6",
    orbit: 200,
    speed: 22,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/17_earth.png",
    details: {
      Overview: "Earth is the only planet known to support life.",
      Distance: "149.6 million km from the Sun",
      DayLength: "24 hours",
      Atmosphere: "Nitrogen, Oxygen, Argon",
      FunFact: "71% of Earth’s surface is covered by water."
    }
  },

  {
    name: "Mars",
    size: 8,
    color: "#ef4444",
    orbit: 240,
    speed: 26,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/19_mars.png",
    details: {
      Overview: "Mars is known as the Red Planet.",
      Distance: "227.9 million km from the Sun",
      DayLength: "24.6 hours",
      Atmosphere: "Thin CO₂ atmosphere",
      FunFact: "Mars has the tallest volcano in the solar system."
    }
  },

  {
    name: "Jupiter",
    size: 18,
    color: "#facc15",
    orbit: 300,
    speed: 40,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/16_jupiter_new.png",
    details: {
      Overview: "Jupiter is the largest planet.",
      Distance: "778.5 million km from the Sun",
      DayLength: "10 hours",
      Atmosphere: "Hydrogen and Helium",
      FunFact: "Its Great Red Spot is a massive storm."
    }
  },

  {
    name: "Saturn",
    size: 16,
    color: "#fde68a",
    orbit: 360,
    speed: 50,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/28_saturn.png",
    details: {
      Overview: "Saturn is famous for its rings.",
      Distance: "1.43 billion km from the Sun",
      DayLength: "10.7 hours",
      Atmosphere: "Hydrogen and Helium",
      FunFact: "Saturn could float in water (theoretically!)."
    }
  },

  {
    name: "Uranus",
    size: 14,
    color: "#67e8f9",
    orbit: 420,
    speed: 60,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/29_uranus.png",
    details: {
      Overview: "Uranus is an ice giant with a tilted axis.",
      Distance: "2.87 billion km from the Sun",
      DayLength: "17 hours",
      Atmosphere: "Hydrogen, Helium, Methane",
      FunFact: "Uranus rotates on its side."
    }
  },

  {
    name: "Neptune",
    size: 14,
    color: "#60a5fa",
    orbit: 480,
    speed: 70,
    img: "https://solarsystem.nasa.gov/system/feature_items/images/30_neptune.png",
    details: {
      Overview: "Neptune is the farthest planet from the Sun.",
      Distance: "4.5 billion km from the Sun",
      DayLength: "16 hours",
      Atmosphere: "Hydrogen, Helium, Methane",
      FunFact: "Neptune has the fastest winds in the solar system."
    }
  }
];


const solarSystem = document.querySelector(".solar-system");
const planetList = document.getElementById("planetList");

/* Create planets & EXACTLY 8 orbits */
planets.forEach(p => {
  const orbit = document.createElement("div");
  orbit.className = "orbit";
  orbit.style.width = orbit.style.height = `${p.orbit}px`;
  orbit.style.animationDuration = `${p.speed}s`;

  const planet = document.createElement("div");
  planet.className = "planet";
  planet.style.width = planet.style.height = `${p.size}px`;
  planet.style.background = p.color;

  planet.onclick = () => showInfo(p);

  orbit.appendChild(planet);
  solarSystem.appendChild(orbit);

  const li = document.createElement("li");
  li.innerText = p.name;
  li.onclick = () => showInfo(p);
  planetList.appendChild(li);
});

/* Info Panel */
function showInfo(planet) {
  planetName.innerText = planet.name;
  planetImg.src = planet.img;

  planetInfo.innerHTML = "";
  for (const [heading, content] of Object.entries(planet.details)) {
    planetInfo.innerHTML += `<strong>${heading}:</strong> ${content}<br><br>`;
  }
}


/* Stars */
const stars = document.querySelector(".stars");
for (let i = 0; i < 150; i++) {
  const s = document.createElement("span");
  s.style.width = s.style.height = Math.random() * 2 + "px";
  s.style.top = Math.random() * 100 + "%";
  s.style.left = Math.random() * 100 + "%";
  stars.appendChild(s);
}

/* Asteroids */
const asteroids = document.querySelector(".asteroids");
for (let i = 0; i < 60; i++) {
  const a = document.createElement("span");
  a.style.top = Math.random() * 100 + "%";
  a.style.left = Math.random() * 100 + "%";
  asteroids.appendChild(a);
}

let scale = 1;
const minZoom = 0.6;
const maxZoom = 2;

const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const solar = document.querySelector(".solar-system");

function applyZoom() {
  solar.style.transform = `scale(${scale})`;
}

/* Button zoom */
zoomInBtn.onclick = () => {
  if (scale < maxZoom) {
    scale += 0.1;
    applyZoom();
  }
};

zoomOutBtn.onclick = () => {
  if (scale > minZoom) {
    scale -= 0.1;
    applyZoom();
  }
};

/* Mouse wheel zoom */
document.querySelector(".space").addEventListener("wheel", (e) => {
  e.preventDefault();
  if (e.deltaY < 0 && scale < maxZoom) scale += 0.05;
  if (e.deltaY > 0 && scale > minZoom) scale -= 0.05;
  applyZoom();
}, { passive: false });
