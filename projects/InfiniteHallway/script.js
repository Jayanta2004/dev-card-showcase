        // Main elements
        const hallway = document.getElementById('hallway');
        const speedSlider = document.getElementById('speedSlider');
        const depthSlider = document.getElementById('depthSlider');

        // Configuration
        let animationSpeed = 0.5;
        let depth = 15;
        let scrollPosition = 0;
        let animationId = null;

        // Initialize hallway elements
        function initHallway() {
            hallway.innerHTML = '';
            
            // Create walls, floor, ceiling, doors, and windows
            createWalls();
            createFloor();
            createCeiling();
            createDoorsAndWindows();
            createLights();
        }

        // Create the walls of the hallway
        function createWalls() {
            // Left wall
            const leftWall = document.createElement('div');
            leftWall.className = 'wall';
            leftWall.style.width = '100%';
            leftWall.style.height = '100%';
            leftWall.style.left = '0';
            leftWall.style.top = '0';
            leftWall.style.transform = 'rotateY(90deg) translateZ(-400px)';
            hallway.appendChild(leftWall);
            
            // Right wall
            const rightWall = document.createElement('div');
            rightWall.className = 'wall';
            rightWall.style.width = '100%';
            rightWall.style.height = '100%';
            rightWall.style.left = '0';
            rightWall.style.top = '0';
            rightWall.style.transform = 'rotateY(-90deg) translateZ(-400px)';
            hallway.appendChild(rightWall);
        }

        // Create the floor
        function createFloor() {
            const floor = document.createElement('div');
            floor.className = 'floor';
            floor.style.width = '800px';
            floor.style.height = '800px';
            floor.style.left = '0';
            floor.style.top = '250px';
            floor.style.transform = 'rotateX(90deg) translateZ(-250px)';
            hallway.appendChild(floor);
        }

        // Create the ceiling
        function createCeiling() {
            const ceiling = document.createElement('div');
            ceiling.className = 'ceiling';
            ceiling.style.width = '800px';
            ceiling.style.height = '800px';
            ceiling.style.left = '0';
            ceiling.style.top = '-250px';
            ceiling.style.transform = 'rotateX(-90deg) translateZ(-250px)';
            hallway.appendChild(ceiling);
        }

        // Create doors and windows along the hallway
        function createDoorsAndWindows() {
            // Create multiple layers of doors and windows for parallax effect
            for (let layer = 0; layer < depth; layer++) {
                const layerDepth = 1000 + layer * 600;
                const scale = 1 - layer * 0.05;
                
                // Create doors on left and right walls
                for (let i = 0; i < 4; i++) {
                    const doorDepth = layerDepth + i * 300;
                    
                    // Left door
                    const leftDoor = document.createElement('div');
                    leftDoor.className = 'door';
                    leftDoor.style.width = '100px';
                    leftDoor.style.height = '200px';
                    leftDoor.style.left = '150px';
                    leftDoor.style.top = '150px';
                    leftDoor.style.transform = `rotateY(90deg) translateZ(${doorDepth}px) scale(${scale})`;
                    
                    const leftKnob = document.createElement('div');
                    leftKnob.className = 'door-knob';
                    leftDoor.appendChild(leftKnob);
                    
                    hallway.appendChild(leftDoor);
                    
                    // Right door
                    const rightDoor = document.createElement('div');
                    rightDoor.className = 'door';
                    rightDoor.style.width = '100px';
                    rightDoor.style.height = '200px';
                    rightDoor.style.right = '150px';
                    rightDoor.style.top = '150px';
                    rightDoor.style.transform = `rotateY(-90deg) translateZ(${doorDepth}px) scale(${scale})`;
                    
                    const rightKnob = document.createElement('div');
                    rightKnob.className = 'door-knob';
                    rightDoor.appendChild(rightKnob);
                    
                    hallway.appendChild(rightDoor);
                }
                
                // Create windows on left and right walls
                for (let i = 0; i < 3; i++) {
                    const windowDepth = layerDepth + i * 400 + 150;
                    
                    // Left window
                    const leftWindow = document.createElement('div');
                    leftWindow.className = 'window';
                    leftWindow.style.width = '80px';
                    leftWindow.style.height = '120px';
                    leftWindow.style.left = '350px';
                    leftWindow.style.top = '180px';
                    leftWindow.style.transform = `rotateY(90deg) translateZ(${windowDepth}px) scale(${scale})`;
                    
                    // Add window frame
                    const leftFrameVertical = document.createElement('div');
                    leftFrameVertical.className = 'window-frame';
                    leftFrameVertical.style.width = '4px';
                    leftFrameVertical.style.height = '100%';
                    leftFrameVertical.style.left = '50%';
                    leftFrameVertical.style.transform = 'translateX(-50%)';
                    leftWindow.appendChild(leftFrameVertical);
                    
                    const leftFrameHorizontal = document.createElement('div');
                    leftFrameHorizontal.className = 'window-frame';
                    leftFrameHorizontal.style.width = '100%';
                    leftFrameHorizontal.style.height = '4px';
                    leftFrameHorizontal.style.top = '50%';
                    leftFrameHorizontal.style.transform = 'translateY(-50%)';
                    leftWindow.appendChild(leftFrameHorizontal);
                    
                    hallway.appendChild(leftWindow);
                    
                    // Right window
                    const rightWindow = document.createElement('div');
                    rightWindow.className = 'window';
                    rightWindow.style.width = '80px';
                    rightWindow.style.height = '120px';
                    rightWindow.style.right = '350px';
                    rightWindow.style.top = '180px';
                    rightWindow.style.transform = `rotateY(-90deg) translateZ(${windowDepth}px) scale(${scale})`;
                    
                    // Add window frame
                    const rightFrameVertical = document.createElement('div');
                    rightFrameVertical.className = 'window-frame';
                    rightFrameVertical.style.width = '4px';
                    rightFrameVertical.style.height = '100%';
                    rightFrameVertical.style.left = '50%';
                    rightFrameVertical.style.transform = 'translateX(-50%)';
                    rightWindow.appendChild(rightFrameVertical);
                    
                    const rightFrameHorizontal = document.createElement('div');
                    rightFrameHorizontal.className = 'window-frame';
                    rightFrameHorizontal.style.width = '100%';
                    rightFrameHorizontal.style.height = '4px';
                    rightFrameHorizontal.style.top = '50%';
                    rightFrameHorizontal.style.transform = 'translateY(-50%)';
                    rightWindow.appendChild(rightFrameHorizontal);
                    
                    hallway.appendChild(rightWindow);
                }
            }
        }

        // Create lighting elements
        function createLights() {
            for (let layer = 0; layer < depth; layer++) {
                const lightDepth = 800 + layer * 500;
                const scale = 1 - layer * 0.05;
                
                for (let i = 0; i < 5; i++) {
                    const lightPos = lightDepth + i * 250;
                    
                    // Ceiling light
                    const light = document.createElement('div');
                    light.className = 'light';
                    light.style.width = '60px';
                    light.style.height = '60px';
                    light.style.left = '50%';
                    light.style.top = '50%';
                    light.style.transform = `translate(-50%, -50%) rotateX(-90deg) translateZ(${lightPos}px) scale(${scale})`;
                    hallway.appendChild(light);
                }
            }
        }

        // Animate the hallway
        function animateHallway() {
            // Update scroll position based on speed
            scrollPosition += animationSpeed;
            
            // Get all transformable elements
            const doors = document.querySelectorAll('.door');
            const windows = document.querySelectorAll('.window');
            const lights = document.querySelectorAll('.light');
            
            // Animate doors with parallax effect
            doors.forEach((door, index) => {
                const layer = Math.floor(index / 8); // 8 doors per layer (4 left, 4 right)
                const layerSpeed = 0.5 + layer * 0.3; // Deeper layers move slower
                const zPos = parseFloat(door.style.transform.match(/translateZ\(([-\d.]+)px\)/)[1]);
                
                // Update position
                let newZ = zPos - animationSpeed * layerSpeed;
                
                // Reset position if it goes too far
                if (newZ < -500) {
                    newZ = 4000;
                }
                
                // Update the transform
                const scale = 1 - layer * 0.05;
                door.style.transform = door.style.transform.replace(
                    /translateZ\([-\d.]+px\)/, 
                    `translateZ(${newZ}px)`
                );
            });
            
            // Animate windows with parallax effect
            windows.forEach((window, index) => {
                const layer = Math.floor(index / 6); // 6 windows per layer (3 left, 3 right)
                const layerSpeed = 0.5 + layer * 0.3;
                const zPos = parseFloat(window.style.transform.match(/translateZ\(([-\d.]+)px\)/)[1]);
                
                // Update position
                let newZ = zPos - animationSpeed * layerSpeed;
                
                // Reset position if it goes too far
                if (newZ < -500) {
                    newZ = 4000;
                }
                
                // Update the transform
                const scale = 1 - layer * 0.05;
                window.style.transform = window.style.transform.replace(
                    /translateZ\([-\d.]+px\)/, 
                    `translateZ(${newZ}px)`
                );
            });
            
            // Animate lights with parallax effect
            lights.forEach((light, index) => {
                const layer = Math.floor(index / 5); // 5 lights per layer
                const layerSpeed = 0.5 + layer * 0.3;
                const zPos = parseFloat(light.style.transform.match(/translateZ\(([-\d.]+)px\)/)[1]);
                
                // Update position
                let newZ = zPos - animationSpeed * layerSpeed;
                
                // Reset position if it goes too far
                if (newZ < -500) {
                    newZ = 4000;
                }
                
                // Update the transform
                const scale = 1 - layer * 0.05;
                light.style.transform = light.style.transform.replace(
                    /translateZ\([-\d.]+px\)/, 
                    `translateZ(${newZ}px)`
                );
            });
            
            // Continue animation
            animationId = requestAnimationFrame(animateHallway);
        }

        // Event listeners for controls
        speedSlider.addEventListener('input', function() {
            // Convert slider value (0-100) to speed (0.1-2.0)
            animationSpeed = 0.1 + (this.value / 100) * 1.9;
        });

        depthSlider.addEventListener('input', function() {
            depth = parseInt(this.value);
            initHallway();
        });

        // Initialize and start animation
        window.addEventListener('load', function() {
            initHallway();
            animateHallway();
        });

        // Handle window resize
        window.addEventListener('resize', function() {
            // For responsive design, we would adjust the hallway dimensions here
            // For simplicity, we'll keep it as is for this example
        });

        // Pause animation when tab is not visible
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                cancelAnimationFrame(animationId);
            } else {
                animateHallway();
            }
        });