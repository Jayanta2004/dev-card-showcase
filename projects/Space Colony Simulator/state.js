const planets = [
  "Aether-1","Cryon","Vulkar","Elios","Nerthus",
  "Zephra","Orion-X","Kryos","Nova Prime","Oblivion"
];

let currentPlanet = 0;
let buildCount = 0;
const BUILD_LIMIT = 5;

const state = {
  oxygen: 100,
  food: 100,
  water: 100,
  energy: 100
};

let gameOver = false;
