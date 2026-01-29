const prompts = [
  "What made today meaningful?",
  "What are you avoiding?",
  "What can you let go of?",
  "What deserves your focus?"
];

function start() {
  let time = 60;
  question.innerText = prompts[Math.floor(Math.random() * prompts.length)];

  const interval = setInterval(() => {
    timer.innerText = `Time left: ${time}s`;
    time--;
    if (time < 0) {
      clearInterval(interval);
      question.innerText = "";
      timer.innerText = "Reflection ended.";
    }
  }, 1000);
}