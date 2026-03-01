// autonomous-self-healing-deployment-pipeline.js

let pipelineRunning = false;
let currentStep = 0;
let issuesDetected = 0;
let autoHealed = 0;
let totalRuns = 0;
let successfulRuns = 0;

const steps = ['build', 'test', 'deploy', 'monitor'];
const stepElements = {
    build: { status: document.getElementById('buildStatus'), step: document.getElementById('buildStep') },
    test: { status: document.getElementById('testStatus'), step: document.getElementById('testStep') },
    deploy: { status: document.getElementById('deployStatus'), step: document.getElementById('deployStep') },
    monitor: { status: document.getElementById('monitorStatus'), step: document.getElementById('monitorStep') }
};

const logs = document.getElementById('logs');
const healBtn = document.getElementById('healBtn');

function log(message) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logs.appendChild(p);
    logs.scrollTop = logs.scrollHeight;
}

function updateStatus(step, status) {
    const element = stepElements[step].status;
    element.textContent = status;
    element.className = 'status ' + status.toLowerCase();
}

function startPipeline() {
    if (pipelineRunning) return;
    pipelineRunning = true;
    currentStep = 0;
    totalRuns++;
    document.getElementById('startPipelineBtn').disabled = true;
    healBtn.disabled = true;
    log('Starting deployment pipeline...');
    runStep();
}

function runStep() {
    if (currentStep >= steps.length) {
        pipelineRunning = false;
        successfulRuns++;
        updateSuccessRate();
        document.getElementById('startPipelineBtn').disabled = false;
        log('Pipeline completed successfully!');
        return;
    }

    const step = steps[currentStep];
    updateStatus(step, 'Running');
    log(`Running ${step}...`);

    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate
        if (success) {
            updateStatus(step, 'Success');
            log(`${step} completed successfully.`);
            currentStep++;
            runStep();
        } else {
            updateStatus(step, 'Failed');
            issuesDetected++;
            document.getElementById('issuesDetected').textContent = issuesDetected;
            log(`${step} failed. Initiating self-healing...`);
            healStep(step);
        }
    }, 2000 + Math.random() * 3000); // 2-5 seconds
}

function healStep(step) {
    updateStatus(step, 'Healing');
    healBtn.disabled = false;

    // Simulate healing
    setTimeout(() => {
        const healed = Math.random() > 0.2; // 80% heal success
        if (healed) {
            autoHealed++;
            document.getElementById('autoHealed').textContent = autoHealed;
            updateStatus(step, 'Success');
            log(`${step} healed successfully. Retrying...`);
            currentStep++;
            runStep();
        } else {
            log(`${step} healing failed. Manual intervention required.`);
            pipelineRunning = false;
            document.getElementById('startPipelineBtn').disabled = false;
        }
        healBtn.disabled = true;
    }, 3000);
}

function triggerHeal() {
    if (!pipelineRunning) return;
    log('Manual heal triggered...');
    // For demo, assume manual heal succeeds
    const step = steps[currentStep];
    autoHealed++;
    document.getElementById('autoHealed').textContent = autoHealed;
    updateStatus(step, 'Success');
    log(`${step} healed manually. Continuing...`);
    currentStep++;
    runStep();
    healBtn.disabled = true;
}

function resetPipeline() {
    pipelineRunning = false;
    currentStep = 0;
    steps.forEach(step => updateStatus(step, 'Pending'));
    logs.innerHTML = '<p>Pipeline logs will appear here...</p>';
    document.getElementById('startPipelineBtn').disabled = false;
    healBtn.disabled = true;
    log('Pipeline reset.');
}

function updateSuccessRate() {
    const rate = totalRuns > 0 ? Math.round((successfulRuns / totalRuns) * 100) : 100;
    document.getElementById('successRate').textContent = rate + '%';
}

// Initialize
updateSuccessRate();