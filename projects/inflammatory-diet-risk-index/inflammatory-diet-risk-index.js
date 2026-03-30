// inflammatory-diet-risk-index.js

let dailyFoods = JSON.parse(localStorage.getItem('dailyFoods')) || [];
let weeklyData = JSON.parse(localStorage.getItem('weeklyDietData')) || [];

// Food database with inflammatory scores and omega ratios
const foodData = {
    fish: { score: -2, omega6: 0.5, omega3: 2.0, processed: false },
    meat: { score: 1, omega6: 2.0, omega3: 0.1, processed: false },
    dairy: { score: 0, omega6: 1.0, omega3: 0.1, processed: false },
    grains: { score: 0.5, omega6: 1.5, omega3: 0.1, processed: false },
    vegetables: { score: -1, omega6: 0.2, omega3: 0.1, processed: false },
    fruits: { score: -1, omega6: 0.1, omega3: 0.1, processed: false },
    nuts: { score: -0.5, omega6: 5.0, omega3: 1.0, processed: false },
    oils: { score: 1.5, omega6: 10.0, omega3: 0.1, processed: false },
    processed: { score: 2, omega6: 3.0, omega3: 0.1, processed: true },
    beverages: { score: 0.5, omega6: 0.1, omega3: 0.1, processed: true }
};

function addFood() {
    const name = document.getElementById('foodName').value.trim();
    const category = document.getElementById('category').value;
    const quantity = parseFloat(document.getElementById('quantity').value);

    if (!name || !quantity || quantity <= 0) {
        alert('Please enter valid food name and quantity.');
        return;
    }

    const food = {
        id: Date.now(),
        name,
        category,
        quantity
    };

    dailyFoods.push(food);
    localStorage.setItem('dailyFoods', JSON.stringify(dailyFoods));

    document.getElementById('foodName').value = '';
    document.getElementById('quantity').value = 100;

    updateFoodList();
}

function updateFoodList() {
    const list = document.getElementById('foodList');
    list.innerHTML = '';

    dailyFoods.forEach(food => {
        const item = document.createElement('div');
        item.className = 'food-item';
        item.innerHTML = `
            <span>${food.name} (${food.quantity}g) - ${food.category}</span>
            <button class="remove-btn" onclick="removeFood(${food.id})">Remove</button>
        `;
        list.appendChild(item);
    });
}

function removeFood(id) {
    dailyFoods = dailyFoods.filter(food => food.id !== id);
    localStorage.setItem('dailyFoods', JSON.stringify(dailyFoods));
    updateFoodList();
}

function calculateIndex() {
    if (dailyFoods.length === 0) {
        alert('Please add some foods first.');
        return;
    }

    let totalScore = 0;
    let totalOmega6 = 0;
    let totalOmega3 = 0;
    let totalProcessed = 0;
    let totalQuantity = 0;

    dailyFoods.forEach(food => {
        const data = foodData[food.category];
        const quantity = food.quantity / 100; // normalize to 100g portions

        totalScore += data.score * quantity;
        totalOmega6 += data.omega6 * quantity;
        totalOmega3 += data.omega3 * quantity;
        if (data.processed) totalProcessed += food.quantity;
        totalQuantity += food.quantity;
    });

    const omegaRatio = totalOmega3 > 0 ? totalOmega6 / totalOmega3 : totalOmega6;
    const processedPercent = totalQuantity > 0 ? (totalProcessed / totalQuantity) * 100 : 0;

    // Normalize score to 0-100 scale (lower is better)
    const normalizedScore = Math.max(0, Math.min(100, 50 + totalScore * 10));

    // Anti-inflammatory score (higher is better)
    const antiInflammatory = Math.max(0, 100 - normalizedScore);

    // Display results
    displayResults(normalizedScore, omegaRatio, processedPercent, antiInflammatory);

    // Save daily data
    saveDailyData(normalizedScore, omegaRatio, processedPercent, antiInflammatory);
}

function displayResults(score, omegaRatio, processedPercent, antiInflammatory) {
    const display = document.getElementById('scoreDisplay');
    const number = document.getElementById('scoreNumber');
    const label = document.getElementById('scoreLabel');

    number.textContent = score.toFixed(1);

    let bgColor = '';
    let textLabel = '';

    if (score <= 20) {
        bgColor = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        textLabel = 'Very Low Inflammation Risk';
    } else if (score <= 40) {
        bgColor = 'linear-gradient(135deg, #8BC34A 0%, #689F38 100%)';
        textLabel = 'Low Inflammation Risk';
    } else if (score <= 60) {
        bgColor = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
        textLabel = 'Moderate Inflammation Risk';
    } else if (score <= 80) {
        bgColor = 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)';
        textLabel = 'High Inflammation Risk';
    } else {
        bgColor = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        textLabel = 'Very High Inflammation Risk';
    }

    display.style.background = bgColor;
    label.textContent = textLabel;
    display.style.display = 'block';

    document.getElementById('omegaRatio').textContent = omegaRatio.toFixed(1);
    document.getElementById('processedPercent').textContent = processedPercent.toFixed(1) + '%';
    document.getElementById('antiInflammatory').textContent = antiInflammatory.toFixed(1);
}

function saveDailyData(score, omegaRatio, processedPercent, antiInflammatory) {
    const today = new Date().toISOString().split('T')[0];
    const data = {
        date: today,
        score,
        omegaRatio,
        processedPercent,
        antiInflammatory
    };

    // Update or add today's data
    const existingIndex = weeklyData.findIndex(d => d.date === today);
    if (existingIndex >= 0) {
        weeklyData[existingIndex] = data;
    } else {
        weeklyData.push(data);
    }

    // Keep only last 7 days
    weeklyData = weeklyData.slice(-7);
    localStorage.setItem('weeklyDietData', JSON.stringify(weeklyData));

    updateTrendsChart();
}

function updateTrendsChart() {
    const ctx = document.getElementById('trendsChart').getContext('2d');

    const sortedData = weeklyData.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(d => new Date(d.date).toLocaleDateString());
    const scores = sortedData.map(d => d.score);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Inflammatory Risk Score',
                data: scores,
                borderColor: '#4fd1ff',
                backgroundColor: 'rgba(79, 209, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Inflammatory Diet Risk Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Risk Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateFoodList();
    updateTrendsChart();
});