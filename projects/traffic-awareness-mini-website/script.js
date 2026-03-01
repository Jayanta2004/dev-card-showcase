
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');
        
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            });
        });

        // Traffic Signals Section
        const redLight = document.getElementById('redLight');
        const yellowLight = document.getElementById('yellowLight');
        const greenLight = document.getElementById('greenLight');
        const redBtn = document.getElementById('redBtn');
        const yellowBtn = document.getElementById('yellowBtn');
        const greenBtn = document.getElementById('greenBtn');
        const autoBtn = document.getElementById('autoBtn');
        
        function activateLight(light) {
            // Deactivate all lights
            [redLight, yellowLight, greenLight].forEach(l => l.classList.remove('active'));
            
            // Activate the selected light
            light.classList.add('active');
        }
        
        redBtn.addEventListener('click', () => activateLight(redLight));
        yellowBtn.addEventListener('click', () => activateLight(yellowLight));
        greenBtn.addEventListener('click', () => activateLight(greenLight));
        
        let autoCycleInterval;
        autoBtn.addEventListener('click', function() {
            if (autoCycleInterval) {
                clearInterval(autoCycleInterval);
                autoCycleInterval = null;
                autoBtn.textContent = 'Auto Cycle';
                return;
            }
            
            autoBtn.textContent = 'Stop Cycling';
            let currentLight = 0;
            const lights = [redLight, yellowLight, greenLight];
            
            autoCycleInterval = setInterval(() => {
                activateLight(lights[currentLight]);
                currentLight = (currentLight + 1) % lights.length;
            }, 1500);
        });

        // Pedestrian Crossing Simulation
        const pedestrian = document.getElementById('pedestrian');
        const car = document.getElementById('car');
        const pedRedLight = document.getElementById('pedRedLight');
        const pedGreenLight = document.getElementById('pedGreenLight');
        const safeCrossBtn = document.getElementById('safeCrossBtn');
        const dangerCrossBtn = document.getElementById('dangerCrossBtn');
        const resetSimBtn = document.getElementById('resetSimBtn');
        const simulationResult = document.getElementById('simulationResult');
        
        function resetSimulation() {
            pedestrian.style.left = '100px';
            car.style.right = '-100px';
            pedRedLight.classList.add('active');
            pedGreenLight.classList.remove('active');
            simulationResult.style.display = 'none';
        }
        
        function showResult(message, isSafe) {
            simulationResult.textContent = message;
            simulationResult.className = 'simulation-result ' + (isSafe ? 'result-safe' : 'result-danger');
            simulationResult.style.display = 'block';
        }
        
        safeCrossBtn.addEventListener('click', function() {
            resetSimulation();
            pedRedLight.classList.remove('active');
            pedGreenLight.classList.add('active');
            
            setTimeout(() => {
                pedestrian.style.left = 'calc(100% - 150px)';
            }, 500);
            
            setTimeout(() => {
                showResult("✅ Safe Crossing! You crossed the road when the pedestrian signal was green and all vehicles were stopped. This is the correct and safe way to cross.", true);
            }, 3500);
        });
        
        dangerCrossBtn.addEventListener('click', function() {
            resetSimulation();
            car.style.right = '100%';
            
            setTimeout(() => {
                pedestrian.style.left = 'calc(50% - 15px)';
            }, 500);
            
            setTimeout(() => {
                showResult("⚠️ Dangerous Crossing! You crossed when the signal was red and a car was approaching. This could result in an accident. Always wait for the green signal.", false);
            }, 1500);
        });
        
        resetSimBtn.addEventListener('click', resetSimulation);

        // Traffic Signs Section
        const signsContainer = document.getElementById('signsContainer');
        const trafficSigns = [
            { icon: 'fas fa-stop', title: 'Stop Sign', description: 'Come to a complete stop, then proceed when safe.' },
            { icon: 'fas fa-exclamation-triangle', title: 'Yield Sign', description: 'Slow down and give right of way to crossing traffic.' },
            { icon: 'fas fa-ban', title: 'No Entry', description: 'Do not enter this road or area.' },
            { icon: 'fas fa-arrow-up', title: 'One Way', description: 'Traffic flows only in the direction of the arrow.' },
            { icon: 'fas fa-utensils', title: 'No Parking', description: 'Parking is not allowed in this area.' },
            { icon: 'fas fa-school', title: 'School Zone', description: 'Reduce speed, children may be crossing.' },
            { icon: 'fas fa-bicycle', title: 'Bicycle Path', description: 'Bicycle route, watch for cyclists.' },
            { icon: 'fas fa-walking', title: 'Pedestrian Crossing', description: 'Watch for people crossing the road.' }
        ];
        
        trafficSigns.forEach(sign => {
            const signCard = document.createElement('div');
            signCard.className = 'sign-card';
            signCard.innerHTML = `
                <div class="sign-icon">
                    <i class="${sign.icon}"></i>
                </div>
                <h3>${sign.title}</h3>
                <p>${sign.description}</p>
            `;
            signsContainer.appendChild(signCard);
        });

        // Traffic Flow Animation
        const horizontalRed = document.getElementById('horizontalRed');
        const horizontalYellow = document.getElementById('horizontalYellow');
        const horizontalGreen = document.getElementById('horizontalGreen');
        const verticalRed = document.getElementById('verticalRed');
        const verticalYellow = document.getElementById('verticalYellow');
        const verticalGreen = document.getElementById('verticalGreen');
        const startFlowBtn = document.getElementById('startFlowBtn');
        const stopFlowBtn = document.getElementById('stopFlowBtn');
        const changeSignalBtn = document.getElementById('changeSignalBtn');
        const cars = ['car1', 'car2', 'car3', 'car4'];
        
        let flowActive = false;
        let horizontalGreenActive = false;
        
        function setSignal(horizontalIsGreen) {
            horizontalGreenActive = horizontalIsGreen;
            
            if (horizontalIsGreen) {
                horizontalRed.classList.remove('active');
                horizontalYellow.classList.remove('active');
                horizontalGreen.classList.add('active');
                
                verticalRed.classList.add('active');
                verticalYellow.classList.remove('active');
                verticalGreen.classList.remove('active');
            } else {
                horizontalRed.classList.add('active');
                horizontalYellow.classList.remove('active');
                horizontalGreen.classList.remove('active');
                
                verticalRed.classList.remove('active');
                verticalYellow.classList.remove('active');
                verticalGreen.classList.add('active');
            }
        }
        
        function startTrafficFlow() {
            if (flowActive) return;
            flowActive = true;
            
            // Initial positions for cars
            const carElements = cars.map(id => document.getElementById(id));
            
            // Car 1: Horizontal, left to right
            carElements[0].style.left = '-60px';
            carElements[0].style.top = '50%';
            carElements[0].style.transform = 'translateY(-50%)';
            carElements[0].style.backgroundColor = '#E74C3C';
            
            // Car 2: Horizontal, right to left
            carElements[1].style.right = '-60px';
            carElements[1].style.top = '50%';
            carElements[1].style.transform = 'translateY(-50%) rotate(180deg)';
            carElements[1].style.backgroundColor = '#2E86C1';
            
            // Car 3: Vertical, top to bottom
            carElements[2].style.top = '-40px';
            carElements[2].style.left = '50%';
            carElements[2].style.transform = 'translateX(-50%) rotate(90deg)';
            carElements[2].style.backgroundColor = '#28B463';
            
            // Car 4: Vertical, bottom to top
            carElements[3].style.bottom = '-40px';
            carElements[3].style.left = '50%';
            carElements[3].style.transform = 'translateX(-50%) rotate(270deg)';
            carElements[3].style.backgroundColor = '#F39C12';
            
            // Set initial signal
            setSignal(true);
            
            // Animate cars based on signal
            function animateCars() {
                if (!flowActive) return;
                
                // Reset car positions if they've gone off screen
                carElements.forEach((car, index) => {
                    const rect = car.getBoundingClientRect();
                    const containerRect = document.querySelector('.animation-container').getBoundingClientRect();
                    
                    if (index < 2 && rect.left > containerRect.right) {
                        car.style.left = '-60px';
                    } else if (index < 2 && rect.right < containerRect.left) {
                        car.style.right = '-60px';
                    } else if (index >= 2 && rect.top > containerRect.bottom) {
                        car.style.top = '-40px';
                    } else if (index >= 2 && rect.bottom < containerRect.top) {
                        car.style.bottom = '-40px';
                    }
                });
                
                // Move cars based on current signal
                if (horizontalGreenActive) {
                    // Horizontal cars move
                    if (parseInt(carElements[0].style.left) < 800) {
                        carElements[0].style.left = (parseInt(carElements[0].style.left) || -60) + 1 + 'px';
                    }
                    
                    if (parseInt(carElements[1].style.right) < 800) {
                        carElements[1].style.right = (parseInt(carElements[1].style.right) || -60) + 1 + 'px';
                    }
                } else {
                    // Vertical cars move
                    if (parseInt(carElements[2].style.top) < 400) {
                        carElements[2].style.top = (parseInt(carElements[2].style.top) || -40) + 1 + 'px';
                    }
                    
                    if (parseInt(carElements[3].style.bottom) < 400) {
                        carElements[3].style.bottom = (parseInt(carElements[3].style.bottom) || -40) + 1 + 'px';
                    }
                }
                
                requestAnimationFrame(animateCars);
            }
            
            animateCars();
        }
        
        function stopTrafficFlow() {
            flowActive = false;
        }
        
        startFlowBtn.addEventListener('click', startTrafficFlow);
        stopFlowBtn.addEventListener('click', stopTrafficFlow);
        changeSignalBtn.addEventListener('click', () => setSignal(!horizontalGreenActive));

        // Initialize page with some animations
        window.addEventListener('load', () => {
            // Trigger a subtle animation for the hero section
            document.querySelector('.hero h1').style.animation = 'none';
            setTimeout(() => {
                document.querySelector('.hero h1').style.animation = 'fadeInUp 1s ease-out';
            }, 100);
            
            // Set initial signal state for traffic flow
            setSignal(true);
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    