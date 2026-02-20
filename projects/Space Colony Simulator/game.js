function build(type) {
  if (gameOver) {
    log("❌ Colony inactive");
    return;
  }

  if (state.energy < 10) {
    log("⚡ Not enough energy to build");
    return;
  }

  // cost + reward
  state.energy -= 10;
  state[type] = Math.min(100, state[type] + 25);

  buildCount++;

  log(`🔧 ${type.toUpperCase()} system upgraded (${buildCount}/${BUILD_LIMIT})`);

  randomEvent();

  // Check planet completion
  if (buildCount >= BUILD_LIMIT) {
    advancePlanet();
  }

  updateUI();
}

function advancePlanet() {
  buildCount = 0;
  currentPlanet++;

  if (currentPlanet >= planets.length) {
    gameOver = true;
    log("🏆 All planets colonized! YOU WIN!");
    return;
  }

  // Reset resources & increase difficulty
  state.oxygen = 100;
  state.food   = 100;
  state.water  = 100;
  state.energy = 100 - currentPlanet * 5;

  log(`🚀 Traveling to Planet ${currentPlanet + 1}: ${planets[currentPlanet]}`);
  updateUI();
}
