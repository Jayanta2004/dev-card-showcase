document.addEventListener('DOMContentLoaded', function() {
    const glassCountInput = document.getElementById('glassCount');
    const addGlassBtn = document.getElementById('addGlass');
    const resetBtn = document.getElementById('reset');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const tipElement = document.getElementById('tip');
    
    const dailyGoal = 8; // 8 glasses per day
    let currentGlasses = 0;
    
    const tips = [
        "Drink water regularly throughout the day to maintain optimal hydration.",
        "Carry a reusable water bottle with you wherever you go.",
        "Set reminders on your phone to drink water at regular intervals.",
        "Eat water-rich foods like cucumbers, watermelon, and oranges.",
        "Drink a glass of water before each meal to help with digestion.",
        "If you feel thirsty, you're already dehydrated - drink up!",
        "Replace sugary drinks with water for better health.",
        "During exercise, drink water before, during, and after to stay hydrated."
    ];
    
    function updateProgress() {
        const percentage = (currentGlasses / dailyGoal) * 100;
        progressFill.style.width = Math.min(percentage, 100) + '%';
        progressText.textContent = `${currentGlasses} / ${dailyGoal} glasses`;
        
        // Change color based on progress
        if (percentage >= 100) {
            progressFill.style.background = 'linear-gradient(90deg, #00b894, #00a085)';
        } else if (percentage >= 50) {
            progressFill.style.background = 'linear-gradient(90deg, #74b9ff, #0984e3)';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, #fdcb6e, #e17055)';
        }
        
        // Update tip
        const tipIndex = Math.min(Math.floor(currentGlasses / 2), tips.length - 1);
        tipElement.textContent = tips[tipIndex];
    }
    
    addGlassBtn.addEventListener('click', function() {
        currentGlasses = parseInt(glassCountInput.value) || 0;
        if (currentGlasses < dailyGoal) {
            currentGlasses++;
            glassCountInput.value = currentGlasses;
            updateProgress();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        currentGlasses = 0;
        glassCountInput.value = 0;
        updateProgress();
    });
    
    glassCountInput.addEventListener('input', function() {
        currentGlasses = parseInt(this.value) || 0;
        updateProgress();
    });
    
    // Initialize
    updateProgress();
});