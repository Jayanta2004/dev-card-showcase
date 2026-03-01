/* ================= VARIABLES ================= */
const scanLine = document.getElementById("scanLine");
const resultDiv = document.getElementById("result");
const progressBar = document.getElementById("progress");
const statusText = document.getElementById("status");
const questionInput = document.getElementById("question");
const scannerBox = document.getElementById("scanner");

let scanning = false;

/* ================= START SCAN ================= */
function startScan(){

  if(scanning) return;

  let question = questionInput.value.trim();

  if(question === ""){
    alert("Please type a question!");
    return;
  }

  scanning = true;
  resultDiv.innerText = "";
  statusText.innerText = "Analyzing brain waves...";
  progressBar.style.width = "0%";

  // Start animation
  scanLine.style.animation = "scan 1s linear infinite";

  let progress = 0;

  let interval = setInterval(()=>{
    progress += 5;
    progressBar.style.width = progress + "%";

    if(progress === 30){
      statusText.innerText = "Checking voice vibration...";
    }
    if(progress === 60){
      statusText.innerText = "Scanning eye movement...";
    }
    if(progress === 90){
      statusText.innerText = "Final decision...";
    }

    if(progress >= 100){
      clearInterval(interval);
      stopScan();
    }

  },100);
}

/* ================= STOP SCAN ================= */
function stopScan(){
  scanLine.style.animation = "none";
  scanning = false;

  showResult();
}

/* ================= SHOW RESULT ================= */
function showResult(){

  const outcomes = [
    "✅ TRUTH",
    "❌ LIE",
    "🤔 70% TRUTH",
    "😈 DEFINITELY LIE",
    "😇 ABSOLUTELY TRUE"
  ];

  let randomIndex = Math.floor(Math.random() * outcomes.length);
  let finalResult = outcomes[randomIndex];

  resultDiv.innerText = finalResult;

  if(finalResult.includes("LIE")){
    scannerBox.classList.add("glow");
    statusText.innerText = "Lie detected!";
  }else{
    scannerBox.classList.remove("glow");
    statusText.innerText = "Truth detected!";
  }
}

/* ================= RESET GAME ================= */
function resetGame(){
  resultDiv.innerText = "";
  progressBar.style.width = "0%";
  statusText.innerText = "Waiting for question...";
  questionInput.value = "";
  scanLine.style.animation = "none";
  scannerBox.classList.remove("glow");
  scanning = false;
}