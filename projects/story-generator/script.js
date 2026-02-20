function generateStory() {
  const input = document.getElementById("nounsInput").value;

  if (input.trim() === "") {
    alert("Please enter some nouns!");
    return;
  }

  const nouns = input.split(",").map(word => word.trim());

  const templates = [
    `Once upon a time, a ${nouns[0]} discovered a magical ${nouns[1]} hidden inside a ${nouns[2]}. This changed everything forever.`,
    
    `In a distant future, a brave ${nouns[0]} and a lonely ${nouns[1]} teamed up to save the world from a dangerous ${nouns[2]}.`,
    
    `Every night, the ${nouns[0]} would dream about owning a ${nouns[1]} while living inside a giant ${nouns[2]}.`,
    
    `The legend says that whoever finds the ${nouns[0]} will unlock the power of the ${nouns[1]} and control the ${nouns[2]}.`,
    
    `One strange morning, a ${nouns[0]} woke up next to a talking ${nouns[1]} inside a mysterious ${nouns[2]}.`
  ];

  const randomStory = templates[Math.floor(Math.random() * templates.length)];

  document.getElementById("storyBox").innerText = randomStory;
}
