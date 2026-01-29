// Physics sandbox simulation
document.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    const canvas = document.getElementById('physics-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        canvas.width = container.clientWidth;
        canvas.height = 600;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Physics parameters
    let gravity = 9.8;
    let friction = 0.1;
    let elasticity = 0.8;
    let objectCount = 5;
    let objectSize = 40;
    let selectedColor = "#FF5252";
    let selectedType = "circle";
    let isPlaying = true;
    let showGrid = false;
    let showTrails = false;
    
    // Simulation stats
    let collisions = 0;
    let frameCount = 0;
    let lastTime = 0;
    let fps = 60;
    
    // Objects array
    let objects = [];
    
    // Initialize objects
    function initializeObjects() {
        objects = [];
        collisions = 0;
        
        for (let i = 0; i < objectCount; i++) {
            createRandomObject();
        }
        
        updateStats();
    }
    
    // Create a random object
    function createRandomObject() {
        const size = 20 + Math.random() * 40;
        const type = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
        const colors = ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const object = {
            x: 50 + Math.random() * (canvas.width - 100),
            y: 50 + Math.random() * (canvas.height - 100),
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: size,
            color: color,
            type: type,
            id: Date.now() + Math.random(),
            trail: []
        };
        
        objects.push(object);
    }
    
    // Create a new object at position
    function createObjectAt(x, y) {
        const object = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            size: objectSize,
            color: selectedColor,
            type: selectedType,
            id: Date.now() + Math.random(),
            trail: []
        };
        
        objects.push(object);
        updateStats();
    }
    
    // Draw an object
    function drawObject(obj) {
        ctx.save();
        ctx.fillStyle = obj.color;
        
        // Draw trail if enabled
        if (showTrails && obj.trail.length > 1) {
            ctx.strokeStyle = obj.color + "80";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obj.trail[0].x, obj.trail[0].y);
            
            for (let i = 1; i < obj.trail.length; i++) {
                ctx.lineTo(obj.trail[i].x, obj.trail[i].y);
            }
            
            ctx.stroke();
        }
        
        // Draw the object based on its type
        switch(obj.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, obj.size / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Add highlight
                ctx.beginPath();
                ctx.arc(obj.x - obj.size/6, obj.y - obj.size/6, obj.size/6, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
                break;
                
            case 'square':
                ctx.fillRect(obj.x - obj.size/2, obj.y - obj.size/2, obj.size, obj.size);
                
                // Add highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(obj.x - obj.size/2 + 5, obj.y - obj.size/2 + 5, obj.size/3, obj.size/3);
                break;
                
            case 'triangle':
                ctx.beginPath();
                ctx.moveTo(obj.x, obj.y - obj.size/2);
                ctx.lineTo(obj.x - obj.size/2, obj.y + obj.size/2);
                ctx.lineTo(obj.x + obj.size/2, obj.y + obj.size/2);
                ctx.closePath();
                ctx.fill();
                
                // Add highlight
                ctx.beginPath();
                ctx.moveTo(obj.x - obj.size/6, obj.y - obj.size/6);
                ctx.lineTo(obj.x - obj.size/3, obj.y + obj.size/6);
                ctx.lineTo(obj.x + obj.size/6, obj.y + obj.size/6);
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
                break;
        }
        
        ctx.restore();
    }
    
    // Update object position
    function updateObject(obj, deltaTime) {
        // Apply gravity
        obj.vy += gravity * deltaTime;
        
        // Apply friction
        obj.vx *= (1 - friction);
        obj.vy *= (1 - friction);
        
        // Update position
        obj.x += obj.vx;
        obj.y += obj.vy;
        
        // Store trail position
        if (showTrails) {
            obj.trail.push({x: obj.x, y: obj.y});
            if (obj.trail.length > 20) {
                obj.trail.shift();
            }
        } else {
            obj.trail = [];
        }
        
        // Boundary collision
        if (obj.x - obj.size/2 < 0) {
            obj.x = obj.size/2;
            obj.vx = -obj.vx * elasticity;
            collisions++;
        } else if (obj.x + obj.size/2 > canvas.width) {
            obj.x = canvas.width - obj.size/2;
            obj.vx = -obj.vx * elasticity;
            collisions++;
        }
        
        if (obj.y - obj.size/2 < 0) {
            obj.y = obj.size/2;
            obj.vy = -obj.vy * elasticity;
            collisions++;
        } else if (obj.y + obj.size/2 > canvas.height) {
            obj.y = canvas.height - obj.size/2;
            obj.vy = -obj.vy * elasticity;
            collisions++;
        }
    }
    
    // Check collision between two objects
    function checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (obj1.size + obj2.size) / 2;
        
        if (distance < minDistance) {
            // Calculate collision response
            const angle = Math.atan2(dy, dx);
            const targetX = obj1.x + Math.cos(angle) * minDistance;
            const targetY = obj1.y + Math.sin(angle) * minDistance;
            
            const ax = (targetX - obj2.x) * 0.05;
            const ay = (targetY - obj2.y) * 0.05;
            
            obj1.vx -= ax;
            obj1.vy -= ay;
            obj2.vx += ax;
            obj2.vy += ay;
            
            // Apply elasticity
            obj1.vx *= elasticity;
            obj1.vy *= elasticity;
            obj2.vx *= elasticity;
            obj2.vy *= elasticity;
            
            collisions++;
            return true;
        }
        
        return false;
    }
    
    // Draw grid
    function drawGrid() {
        if (!showGrid) return;
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Animation loop
    function animate(currentTime) {
        // Calculate delta time
        const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
        lastTime = currentTime;
        
        // Calculate FPS
        frameCount++;
        if (frameCount % 10 === 0) {
            fps = Math.round(1 / deltaTime);
            document.getElementById('stats-fps').textContent = fps;
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = '#0f1525';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        if (isPlaying) {
            // Update and draw objects
            for (let i = 0; i < objects.length; i++) {
                updateObject(objects[i], deltaTime);
                
                // Check collisions with other objects
                for (let j = i + 1; j < objects.length; j++) {
                    checkCollision(objects[i], objects[j]);
                }
            }
        }
        
        // Draw objects
        objects.forEach(obj => drawObject(obj));
        
        // Update stats
        if (frameCount % 30 === 0) {
            updateStats();
        }
        
        requestAnimationFrame(animate);
    }
    
    // Update statistics display
    function updateStats() {
        document.getElementById('stats-objects').textContent = objects.length;
        document.getElementById('stats-collisions').textContent = collisions;
        document.getElementById('object-count-value').textContent = objectCount;
    }
    
    // Event listeners for controls
    document.getElementById('gravity').addEventListener('input', function() {
        gravity = parseFloat(this.value);
        document.getElementById('gravity-value').textContent = gravity.toFixed(1);
    });
    
    document.getElementById('friction').addEventListener('input', function() {
        friction = parseFloat(this.value);
        document.getElementById('friction-value').textContent = friction.toFixed(2);
    });
    
    document.getElementById('elasticity').addEventListener('input', function() {
        elasticity = parseFloat(this.value);
        document.getElementById('elasticity-value').textContent = elasticity.toFixed(2);
    });
    
    document.getElementById('object-count').addEventListener('input', function() {
        objectCount = parseInt(this.value);
        document.getElementById('object-count-value').textContent = objectCount;
        initializeObjects();
    });
    
    document.getElementById('object-size').addEventListener('input', function() {
        objectSize = parseInt(this.value);
        document.getElementById('size-value').textContent = objectSize;
    });
    
    // Object type selection
    document.querySelectorAll('.object-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.object-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedType = this.dataset.type;
        });
    });
    
    // Color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.dataset.color;
        });
    });
    
    // Set initial selected color
    document.querySelector('.color-option').classList.add('selected');
    
    // Add object button
    document.getElementById('add-object').addEventListener('click', function() {
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        createObjectAt(x, y);
    });
    
    // Play/pause button
    document.getElementById('play-pause').addEventListener('click', function() {
        isPlaying = !isPlaying;
        const icon = this.querySelector('i');
        const text = this.querySelector('span') || document.createElement('span');
        
        if (isPlaying) {
            icon.className = 'fas fa-pause';
            this.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else {
            icon.className = 'fas fa-play';
            this.innerHTML = '<i class="fas fa-play"></i> Play';
        }
    });
    
    // Reset button
    document.getElementById('reset').addEventListener('click', function() {
        initializeObjects();
    });
    
    // Clear button
    document.getElementById('clear').addEventListener('click', function() {
        objects = [];
        collisions = 0;
        updateStats();
    });
    
    // Toggle grid
    document.getElementById('toggle-grid').addEventListener('click', function(e) {
        e.preventDefault();
        showGrid = !showGrid;
        
        // Update button text
        const icon = this.querySelector('i');
        if (showGrid) {
            icon.className = 'fas fa-th-large';
            this.innerHTML = '<i class="fas fa-th-large"></i> Hide Grid';
        } else {
            icon.className = 'fas fa-th';
            this.innerHTML = '<i class="fas fa-th"></i> Show Grid';
        }
    });
    
    // Toggle trails
    document.getElementById('toggle-trails').addEventListener('click', function(e) {
        e.preventDefault();
        showTrails = !showTrails;
        
        // Update button text
        const icon = this.querySelector('i');
        if (showTrails) {
            icon.className = 'fas fa-ban';
            this.innerHTML = '<i class="fas fa-ban"></i> Hide Trails';
        } else {
            icon.className = 'fas fa-stream';
            this.innerHTML = '<i class="fas fa-stream"></i> Show Trails';
        }
    });
    
    // Help button
    document.getElementById('help-btn').addEventListener('click', function(e) {
        e.preventDefault();
        alert('Welcome to the Physics Sandbox!\n\n1. Use the controls on the left to adjust physics parameters.\n2. Select an object type and color, then click "Add Object".\n3. Click and drag on the canvas to throw objects.\n4. Click on objects to remove them.\n5. Toggle the simulation with the Play/Pause button.\n\nHave fun experimenting with physics!');
    });
    
    // Canvas interaction
    let isDragging = false;
    let dragStart = {x: 0, y: 0};
    let dragEnd = {x: 0, y: 0};
    
    canvas.addEventListener('mousedown', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicked on an object
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            const dx = x - obj.x;
            const dy = y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < obj.size / 2) {
                // Remove object on click
                objects.splice(i, 1);
                updateStats();
                return;
            }
        }
        
        // Start dragging to create/throw object
        isDragging = true;
        dragStart.x = x;
        dragStart.y = y;
    });
    
    canvas.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        dragEnd.x = e.clientX - rect.left;
        dragEnd.y = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        dragEnd.x = e.clientX - rect.left;
        dragEnd.y = e.clientY - rect.top;
        
        // Calculate velocity based on drag distance
        const vx = (dragStart.x - dragEnd.x) / 5;
        const vy = (dragStart.y - dragEnd.y) / 5;
        
        // Create new object at drag start position
        const newObj = {
            x: dragStart.x,
            y: dragStart.y,
            vx: vx,
            vy: vy,
            size: objectSize,
            color: selectedColor,
            type: selectedType,
            id: Date.now() + Math.random(),
            trail: []
        };
        
        objects.push(newObj);
        updateStats();
        
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
    });
    
    // Initialize the simulation
    initializeObjects();
    
    // Start animation
    requestAnimationFrame(animate);
});