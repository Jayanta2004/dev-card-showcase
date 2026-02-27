let totalRuns = 0;
let successCount = 0;
let failCount = 0;
let totalDuration = 0;

const stages = ["build", "test", "scan", "deploy"];

async function startPipeline() {
  resetStages();
  totalRuns++;
  document.getElementById("runs").textContent = totalRuns;

  const startTime = Date.now();
  let failed = false;

  for (let stage of stages) {
    await runStage(stage);

    if (Math.random() < 0.2) { // 20% failure chance
      markFail(stage);
      failed = true;
      break;
    }

    markSuccess(stage);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  totalDuration += parseFloat(duration);

  if (failed) {
    failCount++;
  } else {
    successCount++;
  }

  updateStats();
  logDeployment(!failed, duration);
}

function runStage(stage) {
  return new Promise(resolve => {
    const el = document.getElementById(stage);
    el.classList.add("active");
    setTimeout(() => {
      el.classList.remove("active");
      resolve();
    }, 1000);
  });
}

function markSuccess(stage) {
  document.getElementById(stage).classList.add("success");
}

function markFail(stage) {
  document.getElementById(stage).classList.add("fail");
}

function resetStages() {
  stages.forEach(stage => {
    const el = document.getElementById(stage);
    el.className = "stage";
  });
}

function updateStats() {
  document.getElementById("success").textContent = successCount;
  document.getElementById("fail").textContent = failCount;

  const rate = ((successCount / totalRuns) * 100).toFixed(1);
  document.getElementById("rate").textContent = rate + "%";

  const avg = (totalDuration / totalRuns).toFixed(2);
  document.getElementById("avgTime").textContent = avg + "s";
}

function logDeployment(success, duration) {
  const history = document.getElementById("history");
  const entry = document.createElement("div");
  entry.textContent =
    `${success ? "✅ Success" : "❌ Failed"} - ${duration}s`;
  history.prepend(entry);
}
