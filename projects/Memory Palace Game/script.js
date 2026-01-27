const startBtn = document.getElementById('startBtn');
const gameBoard = document.getElementById('gameBoard');
const inputSection = document.getElementById('inputSection');
const userInput = document.getElementById('userInput');
const submitBtn = document.getElementById('submitBtn');
const timerEl = document.getElementById('timer');
const result = document.getElementById('result');

// Emoji list and names
const emojiList = [
  {emoji:"🍎", name:"apple"}, {emoji:"🚗", name:"car"}, {emoji:"🐶", name:"dog"}, {emoji:"🎸", name:"guitar"},
  {emoji:"🌻", name:"flower"}, {emoji:"⚽", name:"soccer"}, {emoji:"🍕", name:"pizza"}, {emoji:"🎈", name:"balloon"},
  {emoji:"📚", name:"books"}, {emoji:"🛩️", name:"plane"}, {emoji:"🐱", name:"cat"}, {emoji:"🍩", name:"donut"},
  {emoji:"🎮", name:"game"}, {emoji:"🏀", name:"basketball"}, {emoji:"🌙", name:"moon"}, {emoji:"🍇", name:"grapes"},
  {emoji:"🚀", name:"rocket"}, {emoji:"🐸", name:"frog"}, {emoji:"🎁", name:"gift"}, {emoji:"🦋", name:"butterfly"},
  {emoji:"🍓", name:"strawberry"}, {emoji:"🎤", name:"microphone"}, {emoji:"🧸", name:"teddy"}, {emoji:"🍔", name:"burger"},
  {emoji:"🏓", name:"pingpong"}, {emoji:"🎹", name:"piano"}, {emoji:"🦄", name:"unicorn"}, {emoji:"🌟", name:"star"},
  {emoji:"🍌", name:"banana"}, {emoji:"🚲", name:"bicycle"}, {emoji:"🐯", name:"tiger"}, {emoji:"🎨", name:"paint"},
  {emoji:"🍿", name:"popcorn"}, {emoji:"🛶", name:"boat"}, {emoji:"🌈", name:"rainbow"}, {emoji:"🎬", name:"movie"},
  {emoji:"🐘", name:"elephant"}, {emoji:"🍉", name:"watermelon"}, {emoji:"🏓", name:"tabletennis"}, {emoji:"🎯", name:"dart"},
  {emoji:"🐒", name:"monkey"}, {emoji:"🍪", name:"cookie"}, {emoji:"🚂", name:"train"}, {emoji:"🪁", name:"kite"},
  {emoji:"🦖", name:"dinosaur"}, {emoji:"🎻", name:"violin"}, {emoji:"🐳", name:"whale"}, {emoji:"🍋", name:"lemon"},
  {emoji:"🪐", name:"planet"}, {emoji:"🐍", name:"snake"}, {emoji:"🎺", name:"trumpet"}, {emoji:"🦔", name:"hedgehog"},
  {emoji:"🍒", name:"cherry"}, {emoji:"🛹", name:"skateboard"}, {emoji:"🐿️", name:"squirrel"}, {emoji:"🌺", name:"hibiscus"},
  {emoji:"🥑", name:"avocado"}, {emoji:"🎷", name:"saxophone"}, {emoji:"🦩", name:"flamingo"}, {emoji:"🍆", name:"eggplant"},
  {emoji:"🐢", name:"turtle"}, {emoji:"🎪", name:"circus"}, {emoji:"🦀", name:"crab"}, {emoji:"🥕", name:"carrot"},
  {emoji:"🛴", name:"scooter"}, {emoji:"🐧", name:"penguin"},{emoji:"🍍", name:"pineapple"},
  {emoji:"🦚", name:"peacock"}, {emoji:"🥨", name:"pretzel"}, {emoji:"🐳", name:"dolphin"}, {emoji:"🌵", name:"cactus"},
  {emoji:"🪅", name:"piñata"}, {emoji:"🥭", name:"mango"}, {emoji:"🦘", name:"kangaroo"}, {emoji:"🍑", name:"peach"},
  {emoji:"🐎", name:"horse"}, {emoji:"🎲", name:"dice"}, {emoji:"🦦", name:"otter"}, {emoji:"🥔", name:"potato"},
  {emoji:"🛶", name:"canoe"}, {emoji:"🍅", name:"tomato"}, {emoji:"🦢", name:"swan"}, {emoji:"🥐", name:"croissant"}, 
  {emoji:"🐴", name:"pony"}, {emoji:"🌹", name:"rose"}, {emoji:"🛷", name:"sled"}, {emoji:"🐋", name:"bigwhale"}, 
  {emoji:"🥥", name:"coconut"}, {emoji:"🦈", name:"shark"}, {emoji:"🪷", name:"lotus"}, {emoji:"🎯", name:"target"}, 
  {emoji:"🥝", name:"kiwi"}, {emoji:"🐂", name:"bull"}, {emoji:"🪀", name:"yo-yo"}, {emoji:"🐩", name:"poodle"},
  {emoji:"🎼", name:"sheetmusic"}, {emoji:"🦥", name:"sloth"}, {emoji:"🥒", name:"cucumber"}, {emoji:"🐓", name:"rooster"},
  {emoji:"🛵", name:"moped"},  {emoji:"🦑", name:"squid"}
];

// Shuffle function
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Start Game
startBtn.addEventListener('click', () => {
  result.textContent = '';
  userInput.value = '';
  inputSection.style.display = 'none';
  gameBoard.style.display = 'grid';
  gameBoard.innerHTML = '';
  
  // Pick 10 random emojis
  const selectedEmojis = shuffleArray(emojiList).slice(0, 10);
  
  // Display emojis
  selectedEmojis.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.emoji;
    gameBoard.appendChild(div);
  });

  // After 10 seconds, hide emojis & show input
  setTimeout(() => {
    gameBoard.style.display = 'none';
    inputSection.style.display = 'flex';

    // Start 1-minute countdown
    let time = 60;
    timerEl.textContent = `Time left: ${time}s`;
    const countdown = setInterval(() => {
      time--;
      timerEl.textContent = `Time left: ${time}s`;
      if(time <= 0){
        clearInterval(countdown);
        checkAnswers(selectedEmojis);
      }
    }, 1000);

    // Submit button can also check early
    submitBtn.onclick = () => {
      clearInterval(countdown);
      checkAnswers(selectedEmojis);
    }

  }, 10000); // 10 seconds to memorize
});

// Check answers
function checkAnswers(selectedEmojis){
  const answers = userInput.value
    .toLowerCase()
    .split(/[\n,]+/)
    .map(a => a.trim())
    .filter(a => a !== "");

  let score = 0;
  selectedEmojis.forEach(item => {
    if(answers.includes(item.name.toLowerCase())) score++;
  });

  inputSection.style.display = 'none';
  result.classList.remove('hidden');
  result.textContent = `🎉 You scored ${score} / ${selectedEmojis.length}!`;

  // Show correct answers
  let correctNames = selectedEmojis.map(e => e.name).join(', ');
  result.textContent += ` ✅ Correct: ${correctNames}`;
}
