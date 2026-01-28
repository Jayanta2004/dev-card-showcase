document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const makeDrinkBtn = document.getElementById('makeDrinkBtn');
    const cup = document.getElementById('cup');
    const liquid = document.getElementById('liquid');
    const toppingIcon = document.getElementById('toppingIcon');
    const steam = document.getElementById('steam');
    const sugarSlider = document.getElementById('sugar');
    const sugarValue = document.getElementById('sugarValue');
    const sugarIcons = document.querySelectorAll('.sugar-icon');
    const tempValue = document.getElementById('tempValue');
    const infoTemp = document.getElementById('infoTemp');
    const infoSugar = document.getElementById('infoSugar');
    const infoTopping = document.getElementById('infoTopping');
    const drinkName = document.getElementById('drinkName');
    const tempUpBtn = document.getElementById('tempUp');
    const tempDownBtn = document.getElementById('tempDown');
    
    // Drink data
    const drinks = {
        tea: {
            name: "Green Tea",
            color: "#c68642",
            temperature: 75,
            steam: true
        },
        coffee: {
            name: "Black Coffee",
            color: "#4b2c20",
            temperature: 85,
            steam: true
        },
        latte: {
            name: "Vanilla Latte",
            color: "#d2a679",
            temperature: 70,
            steam: true
        },
        cappuccino: {
            name: "Cappuccino",
            color: "#e6c19c",
            temperature: 75,
            steam: true
        },
        chocolate: {
            name: "Hot Chocolate",
            color: "#5a2d0c",
            temperature: 65,
            steam: true
        },
        espresso: {
            name: "Espresso",
            color: "#2c160c",
            temperature: 90,
            steam: true
        }
    };
    
    // Toppings data
    const toppings = {
        none: { icon: "", name: "None" },
        marshmallow: { icon: "🍡", name: "Marshmallows" },
        cinnamon: { icon: "🌿", name: "Cinnamon Stick" },
        whipped: { icon: "🍦", name: "Whipped Cream" },
        caramel: { icon: "🍯", name: "Caramel Drizzle" }
    };
    
    // Initialize
    updateSugarIcons();
    
    // Event Listeners
    makeDrinkBtn.addEventListener('click', makeDrink);
    sugarSlider.addEventListener('input', updateSugar);
    tempUpBtn.addEventListener('click', increaseTemp);
    tempDownBtn.addEventListener('click', decreaseTemp);
    
    // Update sugar display
    function updateSugar() {
        const value = sugarSlider.value;
        sugarValue.textContent = value;
        infoSugar.textContent = value;
        updateSugarIcons();
    }
    
    // Update sugar icons
    function updateSugarIcons() {
        const sugarLevel = parseInt(sugarSlider.value);
        sugarIcons.forEach((icon, index) => {
            if (index < sugarLevel) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    }
    
    // Temperature controls
    function increaseTemp() {
        let currentTemp = parseInt(tempValue.textContent);
        if (currentTemp < 100) {
            currentTemp += 5;
            tempValue.textContent = currentTemp;
            infoTemp.textContent = currentTemp;
        }
    }
    
    function decreaseTemp() {
        let currentTemp = parseInt(tempValue.textContent);
        if (currentTemp > 40) {
            currentTemp -= 5;
            tempValue.textContent = currentTemp;
            infoTemp.textContent = currentTemp;
        }
    }
    
    // Main function to make the drink
    function makeDrink() {
        // Get values from controls
        const cupStyle = document.getElementById('cupStyle').value;
        const drinkType = document.getElementById('drinkType').value;
        const sugar = sugarSlider.value;
        const toppingType = document.getElementById('topping').value;
        const temperature = parseInt(tempValue.textContent);
        
        // Reset display
        liquid.style.height = "0%";
        toppingIcon.innerHTML = "";
        steam.style.opacity = "0";
        
        // Update drink info
        drinkName.textContent = drinks[drinkType].name;
        infoSugar.textContent = sugar;
        infoTemp.textContent = temperature;
        infoTopping.textContent = toppings[toppingType].name;
        
        // Apply cup style
        cup.className = "cup";
        if (cupStyle === "round") {
            cup.classList.add("round");
        } else if (cupStyle === "mug") {
            cup.classList.add("mug");
        }
        
        // Set liquid color based on drink type
        const drinkData = drinks[drinkType];
        liquid.style.background = drinkData.color;
        
        // Create pour animation
        createPourAnimation(drinkData.color);
        
        // Animate liquid filling
        setTimeout(() => {
            liquid.style.height = "85%";
            
            // Show steam if hot enough
            if (temperature > 60 && drinkData.steam) {
                steam.style.opacity = "1";
            }
            
            // Add topping
            if (toppingType !== "none") {
                toppingIcon.innerHTML = toppings[toppingType].icon;
            }
            
            // Add bubbles for some drinks
            if (drinkType === "coffee" || drinkType === "espresso") {
                addBubbles();
            }
            
            // Add a subtle bubble effect for all hot drinks
            addHeatBubbles();
            
            // Play sound effect
            playBrewSound();
            
        }, 500);
    }
    
    // Create pour animation
    function createPourAnimation(color) {
        const pour = document.createElement('div');
        pour.className = 'pour-animation';
        pour.style.background = color;
        document.querySelector('.cup-area').appendChild(pour);
        
        setTimeout(() => {
            pour.remove();
        }, 2000);
    }
    
    // Add bubbles to the drink
    function addBubbles() {
        const bubbleCount = 8;
        for (let i = 0; i < bubbleCount; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.style.position = 'absolute';
                bubble.style.width = Math.random() * 10 + 5 + 'px';
                bubble.style.height = bubble.style.width;
                bubble.style.background = 'rgba(255, 255, 255, 0.6)';
                bubble.style.borderRadius = '50%';
                bubble.style.bottom = Math.random() * 30 + 10 + '%';
                bubble.style.left = Math.random() * 80 + 10 + '%';
                bubble.style.zIndex = '12';
                liquid.appendChild(bubble);
                
                // Animate bubble rising
                setTimeout(() => {
                    bubble.style.bottom = '85%';
                    bubble.style.opacity = '0';
                    bubble.style.transition = 'bottom 1.5s ease-out, opacity 1s ease-out';
                    
                    // Remove bubble after animation
                    setTimeout(() => {
                        if (bubble.parentNode) {
                            bubble.remove();
                        }
                    }, 1500);
                }, 100);
            }, i * 200);
        }
    }
    
    // Add heat bubbles (smaller, faster bubbles)
    function addHeatBubbles() {
        const heatBubbleCount = 5;
        for (let i = 0; i < heatBubbleCount; i++) {
            setTimeout(() => {
                const bubble = document.createElement('div');
                bubble.className = 'heat-bubble';
                bubble.style.position = 'absolute';
                bubble.style.width = Math.random() * 6 + 3 + 'px';
                bubble.style.height = bubble.style.width;
                bubble.style.background = 'rgba(255, 255, 255, 0.4)';
                bubble.style.borderRadius = '50%';
                bubble.style.bottom = '5%';
                bubble.style.left = Math.random() * 80 + 10 + '%';
                bubble.style.zIndex = '12';
                liquid.appendChild(bubble);
                
                // Animate bubble rising
                setTimeout(() => {
                    bubble.style.bottom = '40%';
                    bubble.style.opacity = '0';
                    bubble.style.transition = 'bottom 0.8s ease-out, opacity 0.5s ease-out';
                    
                    // Remove bubble after animation
                    setTimeout(() => {
                        if (bubble.parentNode) {
                            bubble.remove();
                        }
                    }, 800);
                }, 100);
            }, i * 300);
        }
    }
    
    // Play brewing sound effect
    function playBrewSound() {
        // In a real application, you would play an actual sound file
        // For this demo, we'll just simulate it with a console log
        console.log("Brewing sound effect playing...");
        
        // Create a visual indicator that sound would play
        const soundIndicator = document.createElement('div');
        soundIndicator.innerHTML = '<i class="fas fa-volume-up"></i>';
        soundIndicator.style.position = 'absolute';
        soundIndicator.style.top = '10px';
        soundIndicator.style.right = '10px';
        soundIndicator.style.color = '#ff8c42';
        soundIndicator.style.fontSize = '20px';
        soundIndicator.style.opacity = '0';
        soundIndicator.style.transition = 'opacity 0.3s';
        document.querySelector('.app').appendChild(soundIndicator);
        
        // Fade in and out
        setTimeout(() => {
            soundIndicator.style.opacity = '1';
        }, 100);
        
        setTimeout(() => {
            soundIndicator.style.opacity = '0';
            setTimeout(() => {
                if (soundIndicator.parentNode) {
                    soundIndicator.remove();
                }
            }, 300);
        }, 1500);
    }
    
    // Initialize with a sample drink
    makeDrink();
});