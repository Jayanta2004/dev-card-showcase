let canvas;
let fluid;
let mouseX = 0;
let mouseY = 0;
let pmouseX = 0;
let pmouseY = 0;
let isMouseDown = false;
let isPaused = false;
let fps = 60;
let lastTime = performance.now();
let frameCount = 0;
let touches = [];

function initCanvas() {
    canvas = document.getElementById('fluidCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const resolution = Math.floor(Math.min(canvas.width, canvas.height) / 8);
    fluid = new FluidSimulation(canvas, Math.max(64, Math.min(resolution, 128)));
}

function handleMouseMove(e) {
    pmouseX = mouseX;
    pmouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!isPaused) {
        addFluidAtMouse();
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const touchId = touch.identifier;
        
        if (!touches[touchId]) {
            touches[touchId] = { x: touch.clientX, y: touch.clientY };
        }
        
        pmouseX = touches[touchId].x;
        pmouseY = touches[touchId].y;
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        
        touches[touchId] = { x: touch.clientX, y: touch.clientY };
        
        if (!isPaused) {
            addFluidAtMouse();
        }
    }
}

function handleMouseDown() {
    isMouseDown = true;
}

function handleMouseUp() {
    isMouseDown = false;
}

function addFluidAtMouse() {
    const x = (mouseX / canvas.width) * fluid.resolution;
    const y = (mouseY / canvas.height) * fluid.resolution;
    const px = (pmouseX / canvas.width) * fluid.resolution;
    const py = (pmouseY / canvas.height) * fluid.resolution;
    
    const dx = (x - px) * 0.5;
    const dy = (y - py) * 0.5;
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    if (speed > 0.1) {
        const radius = isMouseDown ? fluid.brushSize + 1 : fluid.brushSize;
        const amount = isMouseDown ? 100 : 50;
        
        for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
                const dist = Math.sqrt(i * i + j * j);
                if (dist <= radius) {
                    const falloff = 1 - (dist / radius);
                    fluid.addDensity(x + i, y + j, amount * falloff);
                    fluid.addVelocity(x + i, y + j, dx * falloff * 2, dy * falloff * 2);
                    
                    if (Math.random() < 0.05 && fluid.showParticles) {
                        fluid.addParticle(mouseX, mouseY, dx * 2, dy * 2);
                    }
                }
            }
        }
    const currentTime = performance.now();
    const delta = currentTime - lastTime;
    frameCount++;
    
    if (delta >= 1000) {
        fps = Math.round(frameCount * 1000 / delta);
        document.getElementById('fpsCounter').textContent = `${fps} FPS`;
        frameCount = 0;
        lastTime = currentTime;
    }
    
    }
}

function animate() {
    if (!isPaused) {
        fluid.step();
        fluid.render();
    }
    requestAnimationFrame(animate);
}

function handleResize() {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (Math.abs(oldWidth - canvas.width) > 100 || Math.abs(oldHeight - canvas.height) > 100) {
        const resolution = Math.floor(Math.min(canvas.width, canvas.height) / 8);
        fluid = new FluidSimulation(canvas, Math.max(64, Math.min(resolution, 128)));
    }
}

window.addEventListener('load', () => {
    initCanvas();
    
    document.getElementById('resValue').textContent = fluid.resolution;
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMouseDown();
    }, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp);
    
    window.addEventListener('resize', handleResize);
    
    animate();
});
