// Sample branching story data
const stories = {
  start: {
    text: "You wake up in a mysterious forest, the trees shrouded in mist. Two paths lie ahead.",
    choices: [
      { text: "Take the left path", next: "leftPath" },
      { text: "Take the right path", next: "rightPath" }
    ]
  },
  leftPath: {
    text: "The left path leads you to a sparkling river. You see a boat and a bridge.",
    choices: [
      { text: "Cross the bridge", next: "bridge" },
      { text: "Take the boat", next: "boat" }
    ]
  },
  rightPath: {
    text: "The right path winds deeper into the forest. You hear a howl and see a cave.",
    choices: [
      { text: "Enter the cave", next: "cave" },
      { text: "Run back", next: "start" }
    ]
  },
  bridge: {
    text: "The bridge creaks but holds. On the other side, you find a treasure chest!",
    choices: [
      { text: "Open the chest", next: "chest" },
      { text: "Leave it alone", next: "endForest" }
    ]
  },
  boat: {
    text: "The boat drifts gently. Suddenly, a storm hits! You must decide quickly.",
    choices: [
      { text: "Row to shore", next: "shore" },
      { text: "Ride out the storm", next: "storm" }
    ]
  },
  cave: {
    text: "Inside the cave, you find glowing crystals and a sleeping dragon.",
    choices: [
      { text: "Sneak past the dragon", next: "dragonSneak" },
      { text: "Leave quietly", next: "endForest" }
    ]
  },
  chest: {
    text: "You open the chest and find a map to a hidden city. Adventure awaits!",
    choices: []
  },
  endForest: {
    text: "You leave the forest, the mystery unsolved. Maybe next time you'll discover more.",
    choices: []
  },
  shore: {
    text: "You reach the shore safely and find friendly villagers who offer you food.",
    choices: []
  },
  storm: {
    text: "The storm is fierce, but you hold on. When it passes, you see a rainbow and feel hopeful.",
    choices: []
  },
  dragonSneak: {
    text: "You sneak past the dragon and find a pile of gold. You are rich!",
    choices: []
  }
};
