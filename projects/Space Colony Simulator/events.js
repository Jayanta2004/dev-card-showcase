function randomEvent() {
  const roll = Math.random();

  if (roll < 0.25) {
    state.energy = Math.max(0, state.energy - 10);
    log("☀️ Solar instability drained energy");
  } 
  else if (roll < 0.5) {
    state.water = Math.max(0, state.water - 15);
    log("💧 Underground ice collapse");
  } 
  else if (roll < 0.75) {
    state.food = Math.min(100, state.food + 10);
    log("🌱 Soil mutation boosted food");
  } 
  else {
    state.oxygen = Math.max(0, state.oxygen - 8);
    log("🚨 Minor oxygen leak");
  }
}
