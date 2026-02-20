const data = {
  patterns: [
    { q: "2, 4, 8, 16, ?", a: "32", e: "Each doubles." },
    { q: "1, 1, 2, 3, 5, ?", a: "8", e: "Fibonacci." },
    { q: "3, 6, 11, 18, ?", a: "27", e: "+3,+5,+7,+9" },
    { q: "5, 10, 20, ?", a: "40", e: "×2" },
    { q: "100, 90, 80, ?", a: "70", e: "-10" },
    { q: "1, 4, 9, 16, ?", a: "25", e: "Squares" },
    { q: "2, 6, 12, 20, ?", a: "30", e: "n²+n" },
    { q: "7, 14, 28, ?", a: "56", e: "×2" },
    { q: "9, 18, 27, ?", a: "36", e: "+9" },
    { q: "1, 3, 6, 10, ?", a: "15", e: "Triangular" },
    { q: "4, 8, 16, ?", a: "32", e: "×2" },
    { q: "2, 3, 5, 8, ?", a: "13", e: "Fibo-like" },
    { q: "1, 2, 4, 7, ?", a: "11", e: "+1,+2,+3" },
    { q: "50, 45, 40, ?", a: "35", e: "-5" },
    { q: "1, 8, 27, ?", a: "64", e: "Cubes" },
    { q: "10, 20, 40, ?", a: "80", e: "×2" },
    { q: "2, 5, 10, ?", a: "17", e: "+3,+5,+7" },
    { q: "6, 12, 18, ?", a: "24", e: "+6" },
    { q: "100, 50, 25, ?", a: "12.5", e: "÷2" },
    { q: "1, 5, 14, ?", a: "30", e: "+4,+9,+16" }
  ],
  riddles: [
  { q: "What has keys but can’t open locks?", a: "keyboard", e: "A keyboard has keys, not locks." },
  { q: "What has a heart but no organs?", a: "artichoke", e: "An artichoke has a heart." },
  { q: "What comes once in a minute, twice in a moment, but never in a thousand years?", a: "m", e: "The letter 'M'." },
  { q: "What can travel around the world while staying in a corner?", a: "stamp", e: "A postage stamp." },
  { q: "What has hands but can’t clap?", a: "clock", e: "A clock has hands." },
  { q: "What gets wetter the more it dries?", a: "towel", e: "A towel absorbs water." },
  { q: "What has an eye but cannot see?", a: "needle", e: "A needle has an eye." },
  { q: "What has a neck but no head?", a: "bottle", e: "A bottle has a neck." },
  { q: "What can you catch but not throw?", a: "cold", e: "You can catch a cold." },
  { q: "What has many teeth but can’t bite?", a: "comb", e: "A comb has teeth." },
  { q: "What runs but never walks?", a: "river", e: "A river runs." },
  { q: "What has a face and two hands but no arms or legs?", a: "clock", e: "A clock again!" },
  { q: "What has a ring but no finger?", a: "phone", e: "A phone rings." },
  { q: "What is always in front of you but can’t be seen?", a: "future", e: "The future is unseen." },
  { q: "What breaks when you say it?", a: "silence", e: "Speaking breaks silence." },
  { q: "What has a head and a tail but no body?", a: "coin", e: "A coin has head and tail." },
  { q: "What has one eye and one horn?", a: "unicorn", e: "A play on words: 'uni-corn'." },
  { q: "What can fill a room but takes no space?", a: "light", e: "Light fills space." },
  { q: "What goes up but never comes down?", a: "age", e: "Your age only increases." },
  { q: "What has words but never speaks?", a: "book", e: "A book contains words." }
],

logic: [
  { q: "All roses are flowers. Some flowers fade quickly. Do some roses fade quickly?", a: "maybe", e: "Not guaranteed—only possible." },
  { q: "All birds can fly. Penguins are birds. Can penguins fly?", a: "yes", e: "By the rule, yes (even if unrealistic)." },
  { q: "Some A are B. All B are C. Are some A C?", a: "yes", e: "Some A belong to B, and all B are C." },
  { q: "No cats are dogs. All dogs are animals. Are any cats animals?", a: "yes", e: "Cats can still be animals." },
  { q: "All squares are rectangles. Are all rectangles squares?", a: "no", e: "Only one direction is true." },
  { q: "Some cars are electric. All electric vehicles are eco-friendly. Are some cars eco-friendly?", a: "yes", e: "Some cars are electric." },
  { q: "All apples are fruits. Some fruits are sour. Are some apples sour?", a: "maybe", e: "Not certain." },
  { q: "No fish are mammals. All whales are mammals. Are whales fish?", a: "no", e: "Whales are mammals." },
  { q: "All teachers are educated. Ravi is educated. Is Ravi a teacher?", a: "no", e: "Being educated isn’t enough." },
  { q: "Some pens are blue. All blue things are colorful. Are some pens colorful?", a: "yes", e: "Some pens are blue." },
  { q: "All A are B. No B are C. Are any A C?", a: "no", e: "A cannot be in C." },
  { q: "Some fruits are red. All apples are fruits. Are some apples red?", a: "maybe", e: "Not guaranteed." },
  { q: "All lions are animals. All animals breathe. Do lions breathe?", a: "yes", e: "Direct chain." },
  { q: "No cars are boats. Some vehicles are boats. Are some vehicles not cars?", a: "yes", e: "Boats are vehicles, not cars." },
  { q: "All books have pages. This object has pages. Is it a book?", a: "no", e: "Other things have pages." },
  { q: "Some students are tall. All tall people are confident. Are some students confident?", a: "yes", e: "Some students are tall." },
  { q: "All planets orbit stars. Earth is a planet. Does Earth orbit a star?", a: "yes", e: "Earth orbits the Sun." },
  { q: "No birds are reptiles. Some reptiles are pets. Are any birds pets?", a: "maybe", e: "Birds could still be pets." },
  { q: "All programmers use computers. Anil uses a computer. Is Anil a programmer?", a: "no", e: "Using a computer isn’t enough." },
  { q: "Some phones are expensive. All expensive things are valuable. Are some phones valuable?", a: "yes", e: "Some phones are expensive." }
]
};

let set = [];
let i = 0;

const home = document.getElementById("home");
const game = document.getElementById("game");
const qEl = document.getElementById("question");
const aEl = document.getElementById("answer");
const fEl = document.getElementById("feedback");
const eEl = document.getElementById("explain");
const pEl = document.getElementById("progress");

document.querySelectorAll(".card").forEach(c => {
  c.onclick = () => start(c.dataset.type);
});

function start(type) {
  home.classList.add("hidden");
  game.classList.remove("hidden");

  set = [...data[type]].sort(() => 0.5 - Math.random()).slice(0, 10);
  i = 0;
  load();
}

function load() {
  const p = set[i];
  qEl.textContent = p.q;
  aEl.value = "";
  fEl.textContent = "";
  eEl.textContent = "";
  pEl.textContent = `${i + 1} / 10`;
}

document.getElementById("check").onclick = () => {
  if (aEl.value.trim().toLowerCase() === set[i].a.toLowerCase()) {
    fEl.textContent = "✅ Correct!";
    eEl.textContent = set[i].e;
  } else {
    fEl.textContent = "❌ Try again";
  }
};

document.getElementById("next").onclick = () => {
  i++;
  if (i < set.length) load();
  else alert("🎉 Completed!");
};

document.getElementById("back").onclick = () => {
  game.classList.add("hidden");
  home.classList.remove("hidden");
};
