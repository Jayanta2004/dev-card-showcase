// federated-learning-collaboration-node.js

let clients = [];
let globalAccuracy = 0;
let globalLoss = 1.0;
let currentRound = 0;
let simulationRunning = false;
let simulationInterval = null;

let accuracyChart, lossChart;

const logs = document.getElementById('logs');

function initCharts() {
    const accuracyCtx = document.getElementById('accuracyChart').getContext('2d');
    accuracyChart = new Chart(accuracyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Global Accuracy',
                data: [],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const lossCtx = document.getElementById('lossChart').getContext('2d');
    lossChart = new Chart(lossCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Global Loss',
                data: [],
                borderColor: '#F44336',
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1.0
                }
            }
        }
    });
}

function initClients() {
    clients = [];
    const clientsGrid = document.getElementById('clientsGrid');
    clientsGrid.innerHTML = '';

    for (let i = 1; i <= 3; i++) {
        const client = {
            id: i,
            accuracy: Math.random() * 30 + 10, // 10-40%
            loss: Math.random() * 0.5 + 0.5, // 0.5-1.0
            status: 'idle',
            dataSize: Math.floor(Math.random() * 1000) + 100
        };
        clients.push(client);
        addClientToUI(client);
    }
    updateActiveClients();
}

function addClientToUI(client) {
    const clientsGrid = document.getElementById('clientsGrid');
    const clientDiv = document.createElement('div');
    clientDiv.className = 'client-node';
    clientDiv.id = `client-${client.id}`;
    clientDiv.innerHTML = `
        <i class="fas fa-laptop"></i>
        <h3>Client ${client.id}</h3>
        <p>Status: <span id="status-${client.id}">${client.status}</span></p>
        <div class="client-metrics">
            <p>Accuracy: <span id="acc-${client.id}">${client.accuracy.toFixed(1)}%</span></p>
            <p>Loss: <span id="loss-${client.id}">${client.loss.toFixed(2)}</span></p>
            <p>Data: ${client.dataSize} samples</p>
        </div>
    `;
    clientsGrid.appendChild(clientDiv);
}

function updateClientUI(client) {
    const statusEl = document.getElementById(`status-${client.id}`);
    const accEl = document.getElementById(`acc-${client.id}`);
    const lossEl = document.getElementById(`loss-${client.id}`);
    const clientDiv = document.getElementById(`client-${client.id}`);

    statusEl.textContent = client.status;
    accEl.textContent = client.accuracy.toFixed(1) + '%';
    lossEl.textContent = client.loss.toFixed(2);

    clientDiv.className = `client-node ${client.status}`;
}

function log(message) {
    const p = document.createElement('p');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logs.appendChild(p);
    logs.scrollTop = logs.scrollHeight;
}

function startSimulation() {
    if (simulationRunning) return;
    simulationRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('addClientBtn').disabled = true;
    log('Starting federated learning simulation...');
    simulationInterval = setInterval(runRound, 3000);
}

function stopSimulation() {
    simulationRunning = false;
    clearInterval(simulationInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('addClientBtn').disabled = false;
    log('Simulation stopped.');
}

function resetSimulation() {
    stopSimulation();
    currentRound = 0;
    globalAccuracy = 0;
    globalLoss = 1.0;
    document.getElementById('currentRound').textContent = currentRound;
    document.getElementById('globalAccuracy').textContent = globalAccuracy + '%';
    document.getElementById('serverParams').textContent = '0';
    document.getElementById('serverStatus').textContent = 'Ready to aggregate updates';
    document.getElementById('server-node').className = 'server-node';
    initClients();
    accuracyChart.data.labels = [];
    accuracyChart.data.datasets[0].data = [];
    accuracyChart.update();
    lossChart.data.labels = [];
    lossChart.data.datasets[0].data = [];
    lossChart.update();
    logs.innerHTML = '<p>Simulation logs will appear here...</p>';
    log('Simulation reset.');
}

function addClient() {
    const newId = clients.length + 1;
    const client = {
        id: newId,
        accuracy: Math.random() * 30 + 10,
        loss: Math.random() * 0.5 + 0.5,
        status: 'idle',
        dataSize: Math.floor(Math.random() * 1000) + 100
    };
    clients.push(client);
    addClientToUI(client);
    updateActiveClients();
    log(`Added new client ${newId} with ${client.dataSize} data samples.`);
}

function updateActiveClients() {
    document.getElementById('activeClients').textContent = clients.length;
}

async function runRound() {
    currentRound++;
    document.getElementById('currentRound').textContent = currentRound;
    log(`Starting round ${currentRound}`);

    // Phase 1: Local training
    document.getElementById('serverStatus').textContent = 'Clients training locally...';
    for (let client of clients) {
        client.status = 'training';
        updateClientUI(client);
    }

    await sleep(1000);

    for (let client of clients) {
        // Simulate local training improvement
        client.accuracy += Math.random() * 5 + 1; // Improve by 1-6%
        client.loss -= Math.random() * 0.1; // Reduce loss
        client.accuracy = Math.min(client.accuracy, 95); // Cap at 95%
        client.loss = Math.max(client.loss, 0.05); // Min loss 0.05
        updateClientUI(client);
    }

    log(`Local training completed for ${clients.length} clients`);

    // Phase 2: Send updates
    for (let client of clients) {
        client.status = 'sending';
        updateClientUI(client);
    }

    await sleep(500);

    for (let client of clients) {
        client.status = 'idle';
        updateClientUI(client);
    }

    log('Model updates sent to server');

    // Phase 3: Server aggregation
    document.getElementById('server-node').className = 'server-node aggregating';
    document.getElementById('serverStatus').textContent = 'Aggregating model updates...';

    await sleep(1000);

    // Simple averaging for demo
    const avgAccuracy = clients.reduce((sum, c) => sum + c.accuracy, 0) / clients.length;
    const avgLoss = clients.reduce((sum, c) => sum + c.loss, 0) / clients.length;

    globalAccuracy = Math.min(avgAccuracy + Math.random() * 2, 100);
    globalLoss = Math.max(avgLoss - Math.random() * 0.05, 0);

    document.getElementById('globalAccuracy').textContent = globalAccuracy.toFixed(1) + '%';
    document.getElementById('serverParams').textContent = (clients.length * 1000).toString();

    // Update charts
    accuracyChart.data.labels.push(`Round ${currentRound}`);
    accuracyChart.data.datasets[0].data.push(globalAccuracy);
    accuracyChart.update();

    lossChart.data.labels.push(`Round ${currentRound}`);
    lossChart.data.datasets[0].data.push(globalLoss);
    lossChart.update();

    // Phase 4: Distribute global model
    document.getElementById('serverStatus').textContent = 'Distributing updated global model...';

    await sleep(500);

    for (let client of clients) {
        client.accuracy = globalAccuracy + (Math.random() - 0.5) * 10; // Vary slightly
        client.loss = globalLoss + (Math.random() - 0.5) * 0.1;
        client.accuracy = Math.max(0, Math.min(client.accuracy, 100));
        client.loss = Math.max(0, client.loss);
        updateClientUI(client);
    }

    document.getElementById('server-node').className = 'server-node';
    document.getElementById('serverStatus').textContent = 'Ready for next round';

    log(`Round ${currentRound} completed. Global accuracy: ${globalAccuracy.toFixed(1)}%`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize
initCharts();
initClients();