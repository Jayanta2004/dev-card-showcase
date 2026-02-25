// joint-loading-pattern-tracker.js

let assessments = JSON.parse(localStorage.getItem('jointAssessments')) || [];
let currentAssessment = null;
let currentJoint = 'shoulder';

const jointData = {
    'shoulder': {
        name: 'Shoulder Joint',
        description: 'Glenohumeral and acromioclavicular joints. Primary movements: flexion/extension, abduction/adduction, internal/external rotation.',
        exercises: ['Overhead press', 'Lateral raises', 'Rows', 'Pull-ups', 'Push-ups'],
        commonIssues: 'Rotator cuff impingement, instability, bursitis'
    },
    'elbow': {
        name: 'Elbow Joint',
        description: 'Humeroulnar and humeroradial joints. Primary movements: flexion/extension, pronation/supination.',
        exercises: ['Bicep curls', 'Tricep extensions', 'Pushdowns', 'Dips'],
        commonIssues: 'Tennis elbow, golfer\'s elbow, bursitis'
    },
    'hip': {
        name: 'Hip Joint',
        description: 'Acetabulofemoral joint. Primary movements: flexion/extension, abduction/adduction, internal/external rotation.',
        exercises: ['Squats', 'Deadlifts', 'Lunges', 'Hip thrusts', 'Leg press'],
        commonIssues: 'Impingement, labral tears, osteoarthritis'
    },
    'knee': {
        name: 'Knee Joint',
        description: 'Tibiofemoral and patellofemoral joints. Primary movements: flexion/extension, slight rotation.',
        exercises: ['Squats', 'Leg press', 'Lunges', 'Deadlifts', 'Step-ups'],
        commonIssues: 'ACL/PCL tears, meniscus damage, patellar tendinitis'
    },
    'ankle': {
        name: 'Ankle Joint',
        description: 'Talocrural joint. Primary movements: dorsiflexion/plantarflexion, inversion/eversion.',
        exercises: ['Calf raises', 'Jumping exercises', 'Balance work', 'Running'],
        commonIssues: 'Sprains, Achilles tendinitis, plantar fasciitis'
    }
};

function selectJoint(joint) {
    currentJoint = joint;

    // Update button states
    document.querySelectorAll('.joint-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    loadAssessmentContent(joint);
}

function loadAssessmentContent(joint) {
    const data = jointData[joint];
    const contentDiv = document.getElementById('assessmentContent');

    contentDiv.innerHTML = `
        <div class="assessment-content">
            <h3>${data.name}</h3>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Common Exercises:</strong> ${data.exercises.join(', ')}</p>
            <p><strong>Common Issues:</strong> ${data.commonIssues}</p>

            <div class="loading-inputs">
                <div class="loading-input-group">
                    <label for="leftLoading">Left Side Loading (0-100%)</label>
                    <input type="number" id="leftLoading" placeholder="Enter loading %" min="0" max="100" step="1">
                </div>
                <div class="loading-input-group">
                    <label for="rightLoading">Right Side Loading (0-100%)</label>
                    <input type="number" id="rightLoading" placeholder="Enter loading %" min="0" max="100" step="1">
                </div>
            </div>

            <div class="balance-display">
                <h4>Loading Balance</h4>
                <div class="balance-percentage" id="balancePercentage">--%</div>
                <div class="balance-status" id="balanceStatus">Enter values to calculate</div>
            </div>
        </div>
    `;

    // Add input listeners for real-time calculation
    document.getElementById('leftLoading').addEventListener('input', calculateBalance);
    document.getElementById('rightLoading').addEventListener('input', calculateBalance);
}

function calculateBalance() {
    const leftLoading = parseFloat(document.getElementById('leftLoading').value) || 0;
    const rightLoading = parseFloat(document.getElementById('rightLoading').value) || 0;

    if (leftLoading === 0 && rightLoading === 0) {
        document.getElementById('balancePercentage').textContent = '--%';
        document.getElementById('balanceStatus').textContent = 'Enter values to calculate';
        document.getElementById('balanceStatus').className = 'balance-status';
        return;
    }

    // Calculate balance as the ratio of smaller to larger value
    const higher = Math.max(leftLoading, rightLoading);
    const lower = Math.min(leftLoading, rightLoading);
    const balance = higher > 0 ? Math.round((lower / higher) * 100) : 0;

    document.getElementById('balancePercentage').textContent = `${balance}%`;

    // Update status based on balance percentage
    const statusElement = document.getElementById('balanceStatus');
    statusElement.className = 'balance-status';

    if (balance >= 90) {
        statusElement.classList.add('excellent');
        statusElement.textContent = 'Excellent Balance';
    } else if (balance >= 80) {
        statusElement.classList.add('good');
        statusElement.textContent = 'Good Balance';
    } else if (balance >= 70) {
        statusElement.classList.add('fair');
        statusElement.textContent = 'Fair Balance';
    } else {
        statusElement.classList.add('poor');
        statusElement.textContent = 'Poor Balance - Needs Attention';
    }
}

function startAssessment() {
    const leftLoading = parseFloat(document.getElementById('leftLoading').value);
    const rightLoading = parseFloat(document.getElementById('rightLoading').value);

    if (isNaN(leftLoading) || isNaN(rightLoading) || leftLoading < 0 || rightLoading < 0 || leftLoading > 100 || rightLoading > 100) {
        alert('Please enter valid loading percentages (0-100) for both sides.');
        return;
    }

    currentAssessment = {
        id: Date.now(),
        joint: currentJoint,
        leftLoading: leftLoading,
        rightLoading: rightLoading,
        balance: calculateBalanceValue(leftLoading, rightLoading),
        date: new Date().toISOString(),
        notes: ''
    };

    document.getElementById('startAssessmentBtn').disabled = true;
    document.getElementById('saveAssessmentBtn').disabled = false;

    // Add notes input
    const contentDiv = document.getElementById('assessmentContent');
    contentDiv.innerHTML += `
        <div class="notes-input">
            <label for="assessmentNotes">Notes/Observations:</label>
            <textarea id="assessmentNotes" placeholder="Any observations about joint comfort, exercises performed, or concerns?"></textarea>
        </div>
    `;
}

function calculateBalanceValue(left, right) {
    const higher = Math.max(left, right);
    const lower = Math.min(left, right);
    return higher > 0 ? Math.round((lower / higher) * 100) : 0;
}

function saveAssessment() {
    if (!currentAssessment) return;

    const notes = document.getElementById('assessmentNotes').value.trim();
    currentAssessment.notes = notes;

    assessments.push(currentAssessment);

    // Keep only last 50 assessments
    if (assessments.length > 50) {
        assessments = assessments.slice(-50);
    }

    localStorage.setItem('jointAssessments', JSON.stringify(assessments));

    // Reset UI
    document.getElementById('startAssessmentBtn').disabled = false;
    document.getElementById('saveAssessmentBtn').disabled = true;
    document.getElementById('leftLoading').value = '';
    document.getElementById('rightLoading').value = '';
    calculateBalance();

    currentAssessment = null;

    updateStats();
    updateChart();
    updateHistory();
}

function updateStats() {
    if (assessments.length === 0) {
        document.getElementById('avgBalance').textContent = '0%';
        document.getElementById('riskJoint').textContent = '--';
        document.getElementById('totalAssessments').textContent = '0';
        document.getElementById('loadingTrend').textContent = '--';
        return;
    }

    const balances = assessments.map(a => a.balance);
    const avgBalance = Math.round(balances.reduce((a, b) => a + b, 0) / balances.length);

    // Find joint with lowest average balance (highest risk)
    const jointBalances = {};
    assessments.forEach(assessment => {
        if (!jointBalances[assessment.joint]) {
            jointBalances[assessment.joint] = [];
        }
        jointBalances[assessment.joint].push(assessment.balance);
    });

    let riskJoint = '--';
    let lowestAvgBalance = 100;

    Object.keys(jointBalances).forEach(joint => {
        const avg = jointBalances[joint].reduce((a, b) => a + b, 0) / jointBalances[joint].length;
        if (avg < lowestAvgBalance) {
            lowestAvgBalance = avg;
            riskJoint = jointData[joint].name;
        }
    });

    // Calculate improvement trend (comparing first half vs second half)
    let loadingTrend = '--';
    if (assessments.length >= 6) {
        const midPoint = Math.floor(assessments.length / 2);
        const firstHalf = assessments.slice(0, midPoint).map(a => a.balance);
        const secondHalf = assessments.slice(midPoint).map(a => a.balance);

        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const improvement = Math.round(((avgSecond - avgFirst) / avgFirst) * 100);
        loadingTrend = improvement > 0 ? `+${improvement}%` : `${improvement}%`;
    }

    document.getElementById('avgBalance').textContent = `${avgBalance}%`;
    document.getElementById('riskJoint').textContent = riskJoint;
    document.getElementById('totalAssessments').textContent = assessments.length;
    document.getElementById('loadingTrend').textContent = loadingTrend;
}

function updateChart() {
    const ctx = document.getElementById('loadingChart').getContext('2d');

    // Sort assessments by date
    const sortedAssessments = assessments.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedAssessments.map(a => new Date(a.date).toLocaleDateString());
    const balanceData = sortedAssessments.map(a => a.balance);
    const leftLoadingData = sortedAssessments.map(a => a.leftLoading);
    const rightLoadingData = sortedAssessments.map(a => a.rightLoading);

    // Create datasets for each joint type
    const jointColors = {
        'shoulder': '#FF6384',
        'elbow': '#36A2EB',
        'hip': '#FFCE56',
        'knee': '#4BC0C0',
        'ankle': '#9966FF'
    };

    const datasets = [{
        label: 'Balance %',
        data: balanceData,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
    }];

    // Add joint-specific datasets if we have multiple joints
    const joints = [...new Set(sortedAssessments.map(a => a.joint))];
    if (joints.length > 1) {
        joints.forEach(joint => {
            const jointAssessments = sortedAssessments.filter(a => a.joint === joint);
            datasets.push({
                label: `${jointData[joint].name} Balance`,
                data: sortedAssessments.map(a => a.joint === joint ? a.balance : null),
                borderColor: jointColors[joint],
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 4,
                yAxisID: 'y'
            });
        });
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Joint Loading Balance Trends'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Balance %'
                    },
                    max: 100
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('assessmentHistory');
    history.innerHTML = '';

    // Show last 10 assessments
    const recentAssessments = assessments.slice(-10).reverse();

    recentAssessments.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'assessment-entry';

        const date = new Date(assessment.date).toLocaleString();
        const jointName = jointData[assessment.joint].name;

        item.innerHTML = `
            <h4>${jointName} - ${date}</h4>
            <p><strong>Balance:</strong> <span class="balance">${assessment.balance}%</span></p>
            <p><strong>Left Loading:</strong> <span class="loading-left">${assessment.leftLoading}%</span> | <strong>Right Loading:</strong> <span class="loading-right">${assessment.rightLoading}%</span></p>
            ${assessment.notes ? `<p><strong>Notes:</strong> ${assessment.notes}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadAssessmentContent('shoulder');
    updateStats();
    updateChart();
    updateHistory();
});