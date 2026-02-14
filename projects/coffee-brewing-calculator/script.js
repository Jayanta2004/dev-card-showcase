        // Brewing methods database
        const brewingMethods = {
            "pourOver": {
                name: "Pour Over",
                ratio: { min: 15, max: 17, default: 16 },
                time: { min: 120, max: 240, default: 240 },
                temp: { min: 90, max: 96, default: 93 },
                coffeeUnit: "g",
                waterUnit: "ml",
                grind: "Medium",
                icon: "fa-filter"
            },
            "frenchPress": {
                name: "French Press",
                ratio: { min: 12, max: 15, default: 13 },
                time: { min: 240, max: 300, default: 240 },
                temp: { min: 92, max: 96, default: 94 },
                coffeeUnit: "g",
                waterUnit: "ml",
                grind: "Coarse",
                icon: "fa-coffee"
            },
            "aeropress": {
                name: "AeroPress",
                ratio: { min: 10, max: 16, default: 12 },
                time: { min: 60, max: 120, default: 90 },
                temp: { min: 80, max: 90, default: 85 },
                coffeeUnit: "g",
                waterUnit: "ml",
                grind: "Fine to Medium",
                icon: "fa-tint"
            },
            "espresso": {
                name: "Espresso",
                ratio: { min: 1.5, max: 3, default: 2 },
                time: { min: 25, max: 35, default: 30 },
                temp: { min: 90, max: 96, default: 93 },
                coffeeUnit: "g",
                waterUnit: "ml",
                grind: "Very Fine",
                icon: "fa-bolt"
            },
            "coldBrew": {
                name: "Cold Brew",
                ratio: { min: 4, max: 8, default: 5 },
                time: { min: 720, max: 1440, default: 1080 },
                temp: { min: 20, max: 25, default: 22 },
                coffeeUnit: "g",
                waterUnit: "ml",
                grind: "Coarse",
                icon: "fa-snowflake"
            }
        };
        
        // DOM Elements
        const methodButtons = document.querySelectorAll('.method-btn');
        const coffeeAmountInput = document.getElementById('coffeeAmount');
        const coffeeRangeInput = document.getElementById('coffeeRange');
        const waterAmountInput = document.getElementById('waterAmount');
        const waterRangeInput = document.getElementById('waterRange');
        const brewTimeInput = document.getElementById('brewTime');
        const timeRangeInput = document.getElementById('timeRange');
        const waterTempInput = document.getElementById('waterTemp');
        const tempRangeInput = document.getElementById('tempRange');
        const ratioDisplay = document.getElementById('ratioDisplay');
        const strengthMarker = document.getElementById('strengthMarker');
        const coffeeUnitSpan = document.getElementById('coffeeUnit');
        const waterUnitSpan = document.getElementById('waterUnit');
        
        const calculateBtn = document.getElementById('calculateBtn');
        const saveBtn = document.getElementById('saveBtn');
        const resetBtn = document.getElementById('resetBtn');
        const notification = document.getElementById('notification');
        const historySection = document.getElementById('historySection');
        const historyList = document.getElementById('historyList');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // Current brewing method
        let currentMethod = 'pourOver';
        let savedRecipes = JSON.parse(localStorage.getItem('coffeeRecipes')) || [];
        
        // Initialize the calculator
        function initializeCalculator() {
            updateMethod(currentMethod);
            calculateResults();
            updateHistoryDisplay();
        }
        
        // Update method and adjust parameters
        function updateMethod(method) {
            currentMethod = method;
            const methodData = brewingMethods[method];
            
            // Update UI for selected method
            methodButtons.forEach(btn => {
                if (btn.getAttribute('data-method') === method) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Update units
            coffeeUnitSpan.textContent = methodData.coffeeUnit;
            waterUnitSpan.textContent = methodData.waterUnit;
            
            // Update ranges and values based on method
            if (method === 'espresso') {
                // Espresso uses different ranges
                coffeeRangeInput.min = 7;
                coffeeRangeInput.max = 22;
                coffeeRangeInput.value = 18;
                coffeeAmountInput.min = 7;
                coffeeAmountInput.max = 22;
                coffeeAmountInput.value = 18;
                
                waterRangeInput.min = 20;
                waterRangeInput.max = 66;
                waterRangeInput.value = 36;
                waterAmountInput.min = 20;
                waterAmountInput.max = 66;
                waterAmountInput.value = 36;
            } else if (method === 'coldBrew') {
                // Cold brew uses different ranges
                coffeeRangeInput.min = 20;
                coffeeRangeInput.max = 200;
                coffeeRangeInput.value = 50;
                coffeeAmountInput.min = 20;
                coffeeAmountInput.max = 200;
                coffeeAmountInput.value = 50;
                
                waterRangeInput.min = 100;
                waterRangeInput.max = 1000;
                waterRangeInput.value = 250;
                waterAmountInput.min = 100;
                waterAmountInput.max = 1000;
                waterAmountInput.value = 250;
            } else {
                // Standard ranges for other methods
                coffeeRangeInput.min = 5;
                coffeeRangeInput.max = 60;
                coffeeRangeInput.value = 20;
                coffeeAmountInput.min = 5;
                coffeeAmountInput.max = 60;
                coffeeAmountInput.value = 20;
                
                waterRangeInput.min = 100;
                waterRangeInput.max = 1000;
                waterRangeInput.value = 320;
                waterAmountInput.min = 100;
                waterAmountInput.max = 1000;
                waterAmountInput.value = 320;
            }
            
            // Update time and temperature based on method
            timeRangeInput.min = methodData.time.min;
            timeRangeInput.max = methodData.time.max;
            timeRangeInput.value = methodData.time.default;
            brewTimeInput.min = methodData.time.min;
            brewTimeInput.max = methodData.time.max;
            brewTimeInput.value = methodData.time.default;
            
            tempRangeInput.min = methodData.temp.min;
            tempRangeInput.max = methodData.temp.max;
            tempRangeInput.value = methodData.temp.default;
            waterTempInput.min = methodData.temp.min;
            waterTempInput.max = methodData.temp.max;
            waterTempInput.value = methodData.temp.default;
            
            // Calculate initial ratio
            updateRatioDisplay();
        }
        
        // Update ratio display
        function updateRatioDisplay() {
            const coffee = parseFloat(coffeeAmountInput.value);
            const water = parseFloat(waterAmountInput.value);
            
            if (coffee > 0) {
                const ratio = (water / coffee).toFixed(1);
                ratioDisplay.textContent = `Coffee to Water Ratio: 1:${ratio}`;
                
                // Update strength marker position
                updateStrengthMarker(ratio);
            }
        }
        
        // Update strength marker position
        function updateStrengthMarker(ratio) {
            const ratioNum = parseFloat(ratio);
            let position = 50; // Default to middle
            
            if (currentMethod === 'espresso') {
                // Espresso ratios are different (1:1.5 to 1:3)
                if (ratioNum <= 1.5) position = 90;
                else if (ratioNum <= 2) position = 70;
                else if (ratioNum <= 2.5) position = 30;
                else position = 10;
            } else if (currentMethod === 'coldBrew') {
                // Cold brew ratios (1:4 to 1:8)
                if (ratioNum <= 4) position = 90;
                else if (ratioNum <= 5) position = 70;
                else if (ratioNum <= 6) position = 50;
                else if (ratioNum <= 7) position = 30;
                else position = 10;
            } else {
                // Standard ratios for other methods
                if (ratioNum <= 13) position = 90;
                else if (ratioNum <= 15) position = 70;
                else if (ratioNum <= 17) position = 50;
                else if (ratioNum <= 19) position = 30;
                else position = 10;
            }
            
            strengthMarker.style.left = `${position}%`;
        }
        
        // Calculate and display results
        function calculateResults() {
            const coffee = parseFloat(coffeeAmountInput.value);
            const water = parseFloat(waterAmountInput.value);
            const ratio = water / coffee;
            
            // Update ratio display
            updateRatioDisplay();
            
            // Calculate cups (assuming 150ml per cup, or 30ml for espresso)
            const cupSize = currentMethod === 'espresso' ? 30 : 150;
            const totalCups = Math.round((water / cupSize) * 10) / 10;
            
            // Calculate coffee and water per cup
            const coffeePerCup = Math.round((coffee / totalCups) * 10) / 10;
            const waterPerCup = Math.round((water / totalCups) * 10) / 10;
            
            // Calculate extraction yield (simplified calculation)
            const extractionYield = 18 + (Math.random() * 3 - 1.5); // Simulated value
            const tds = 1.1 + (Math.random() * 0.4 - 0.2); // Simulated value
            
            // Update results display
            document.querySelectorAll('.result-item')[0].innerHTML = `
                <div class="result-label">Total Cups</div>
                <div class="result-value">${totalCups.toFixed(1)} <span class="result-unit">cups</span></div>
            `;
            
            document.querySelectorAll('.result-item')[1].innerHTML = `
                <div class="result-label">Coffee per Cup</div>
                <div class="result-value">${coffeePerCup.toFixed(1)} <span class="result-unit">g</span></div>
            `;
            
            document.querySelectorAll('.result-item')[2].innerHTML = `
                <div class="result-label">Water per Cup</div>
                <div class="result-value">${waterPerCup.toFixed(0)} <span class="result-unit">ml</span></div>
            `;
            
            document.querySelectorAll('.result-item')[3].innerHTML = `
                <div class="result-label">Extraction Yield</div>
                <div class="result-value">${extractionYield.toFixed(1)} <span class="result-unit">%</span></div>
            `;
            
            document.querySelectorAll('.result-item')[4].innerHTML = `
                <div class="result-label">Total Dissolved Solids</div>
                <div class="result-value">${tds.toFixed(1)} <span class="result-unit">%</span></div>
            `;
        }
        
        // Save recipe to history
        function saveRecipe() {
            const coffee = parseFloat(coffeeAmountInput.value);
            const water = parseFloat(waterAmountInput.value);
            const time = parseFloat(brewTimeInput.value);
            const temp = parseFloat(waterTempInput.value);
            const ratio = (water / coffee).toFixed(1);
            const methodName = brewingMethods[currentMethod].name;
            
            const recipe = {
                id: Date.now(),
                method: currentMethod,
                methodName: methodName,
                coffee: coffee,
                water: water,
                time: time,
                temp: temp,
                ratio: ratio,
                date: new Date().toLocaleDateString()
            };
            
            savedRecipes.unshift(recipe);
            
            // Keep only last 10 recipes
            if (savedRecipes.length > 10) {
                savedRecipes = savedRecipes.slice(0, 10);
            }
            
            // Save to localStorage
            localStorage.setItem('coffeeRecipes', JSON.stringify(savedRecipes));
            
            // Update history display
            updateHistoryDisplay();
            
            // Show notification
            showNotification('Recipe saved successfully!');
            
            // Show history section
            historySection.style.display = 'block';
        }
        
        // Update history display
        function updateHistoryDisplay() {
            if (savedRecipes.length === 0) {
                historyList.innerHTML = '<li class="history-item">No saved recipes yet.</li>';
                historySection.style.display = 'none';
                return;
            }
            
            historyList.innerHTML = '';
            savedRecipes.forEach(recipe => {
                const timeDisplay = recipe.time > 60 ? `${(recipe.time / 60).toFixed(0)} min` : `${recipe.time} sec`;
                
                const historyItem = document.createElement('li');
                historyItem.className = 'history-item';
                historyItem.innerHTML = `
                    <div><span class="history-method">${recipe.methodName}</span> - ${recipe.date}</div>
                    <div>${recipe.coffee}g coffee : ${recipe.water}ml water (1:${recipe.ratio})</div>
                    <div>${timeDisplay} at ${recipe.temp}°C</div>
                `;
                
                // Add click event to load recipe
                historyItem.addEventListener('click', () => {
                    loadRecipe(recipe);
                });
                
                historyList.appendChild(historyItem);
            });
        }
        
        // Load a saved recipe
        function loadRecipe(recipe) {
            // Set the method
            updateMethod(recipe.method);
            
            // Set the values
            coffeeAmountInput.value = recipe.coffee;
            coffeeRangeInput.value = recipe.coffee;
            waterAmountInput.value = recipe.water;
            waterRangeInput.value = recipe.water;
            brewTimeInput.value = recipe.time;
            timeRangeInput.value = recipe.time;
            waterTempInput.value = recipe.temp;
            tempRangeInput.value = recipe.temp;
            
            // Calculate results
            calculateResults();
            
            // Show notification
            showNotification(`Loaded ${recipe.methodName} recipe from ${recipe.date}`);
        }
        
        // Reset calculator to default values
        function resetCalculator() {
            updateMethod(currentMethod);
            calculateResults();
            showNotification('Calculator reset to default values');
        }
        
        // Show notification
        function showNotification(message) {
            notification.textContent = message;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        // Event Listeners
        methodButtons.forEach(button => {
            button.addEventListener('click', function() {
                const method = this.getAttribute('data-method');
                updateMethod(method);
                calculateResults();
            });
        });
        
        // Sync range and number inputs
        coffeeAmountInput.addEventListener('input', function() {
            coffeeRangeInput.value = this.value;
            calculateResults();
        });
        
        coffeeRangeInput.addEventListener('input', function() {
            coffeeAmountInput.value = this.value;
            calculateResults();
        });
        
        waterAmountInput.addEventListener('input', function() {
            waterRangeInput.value = this.value;
            calculateResults();
        });
        
        waterRangeInput.addEventListener('input', function() {
            waterAmountInput.value = this.value;
            calculateResults();
        });
        
        brewTimeInput.addEventListener('input', function() {
            timeRangeInput.value = this.value;
        });
        
        timeRangeInput.addEventListener('input', function() {
            brewTimeInput.value = this.value;
        });
        
        waterTempInput.addEventListener('input', function() {
            tempRangeInput.value = this.value;
        });
        
        tempRangeInput.addEventListener('input', function() {
            waterTempInput.value = this.value;
        });
        
        // Button events
        calculateBtn.addEventListener('click', calculateResults);
        
        saveBtn.addEventListener('click', saveRecipe);
        
        resetBtn.addEventListener('click', resetCalculator);
        
        clearHistoryBtn.addEventListener('click', function() {
            savedRecipes = [];
            localStorage.setItem('coffeeRecipes', JSON.stringify(savedRecipes));
            updateHistoryDisplay();
            showNotification('History cleared');
        });
        
        // Initialize calculator on load
        window.addEventListener('load', initializeCalculator);