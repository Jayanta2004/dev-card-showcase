// Main Magnetic Cursor Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    let config = {
        strength: 0.5, // 0 to 1
        radius: 80,    // pixels
        customCursorEnabled: false
    };

    // DOM Elements
    const cursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const strengthSlider = document.getElementById('strength');
    const strengthValue = document.getElementById('strength-value');
    const radiusSlider = document.getElementById('radius');
    const radiusValue = document.getElementById('radius-value');
    const toggleCursorBtn = document.getElementById('toggle-cursor');
    
    // State
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    
    // Magnetic elements
    let magneticElements = [];
    
    // Initialize
    function init() {
        // Get all magnetic elements
        magneticElements = document.querySelectorAll('.magnetic-btn, .magnetic-img, .magnetic-card');
        
        // Set up slider event listeners
        strengthSlider.addEventListener('input', function() {
            config.strength = this.value / 100;
            strengthValue.textContent = `${this.value}%`;
        });
        
        radiusSlider.addEventListener('input', function() {
            config.radius = parseInt(this.value);
            radiusValue.textContent = `${this.value}px`;
        });
        
        // Toggle custom cursor
        toggleCursorBtn.addEventListener('click', function() {
            config.customCursorEnabled = !config.customCursorEnabled;
            
            if (config.customCursorEnabled) {
                cursor.style.display = 'block';
                document.body.style.cursor = 'none';
                toggleCursorBtn.innerHTML = '<i class="fas fa-mouse"></i> Use Default Cursor';
                toggleCursorBtn.classList.add('active');
            } else {
                cursor.style.display = 'none';
                document.body.style.cursor = 'auto';
                toggleCursorBtn.innerHTML = '<i class="fas fa-mouse-pointer"></i> Toggle Custom Cursor';
                toggleCursorBtn.classList.remove('active');
            }
        });
        
        // Initialize mouse tracking
        document.addEventListener('mousemove', trackMouse);
        
        // Initialize animation loop
        requestAnimationFrame(animate);
        
        // Add magnetic behavior to elements
        magneticElements.forEach(element => {
            element.addEventListener('mouseenter', handleMouseEnter);
            element.addEventListener('mouseleave', handleMouseLeave);
        });
        
        // Add click effects
        magneticElements.forEach(element => {
            element.addEventListener('mousedown', () => {
                element.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('mouseup', () => {
                element.style.transform = '';
            });
            
            // For buttons, also listen to click for ripple effect
            if (element.classList.contains('magnetic-btn')) {
                element.addEventListener('click', createRippleEffect);
            }
        });
        
        // Add view button events for images
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                alert('Viewing image in full screen! (This is a demo)');
            });
        });
        
        // Add card button events
        const cardButtons = document.querySelectorAll('.card-btn');
        cardButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const cardTitle = this.closest('.magnetic-card').querySelector('h3').textContent;
                alert(`You clicked "${cardTitle}"! (This is a demo)`);
            });
        });
        
        console.log('Magnetic Cursor initialized!');
        console.log(`Magnetic elements found: ${magneticElements.length}`);
    }
    
    // Track mouse position
    function trackMouse(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Update custom cursor position if enabled
        if (config.customCursorEnabled) {
            cursor.style.left = `${mouseX - 10}px`;
            cursor.style.top = `${mouseY - 10}px`;
        }
    }
    
    // Animation loop
    function animate() {
        // Smooth follower movement
        followerX += (mouseX - followerX) * 0.2;
        followerY += (mouseY - followerY) * 0.2;
        
        cursorFollower.style.left = `${followerX - 20}px`;
        cursorFollower.style.top = `${followerY - 20}px`;
        
        // Check magnetic attraction for each element
        magneticElements.forEach(element => {
            applyMagneticEffect(element);
        });
        
        requestAnimationFrame(animate);
    }
    
    // Apply magnetic effect to an element
    function applyMagneticEffect(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = centerX - mouseX;
        const deltaY = centerY - mouseY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // If cursor is within attraction radius
        if (distance < config.radius) {
            // Calculate magnetic force (stronger when closer)
            const force = (1 - distance / config.radius) * config.strength;
            
            // Move the cursor follower towards the element
            const moveX = deltaX * force * 0.5;
            const moveY = deltaY * force * 0.5;
            
            cursorFollower.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + force * 0.3})`;
            
            // Apply visual feedback to the element
            element.style.transform = `scale(${1 + force * 0.1}) translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
            
            // Add glow effect
            if (element.classList.contains('magnetic-btn')) {
                const computedStyle = window.getComputedStyle(element);
                const bgColor = computedStyle.backgroundImage;
                
                // Extract color from gradient for glow
                element.style.boxShadow = `0 0 ${20 + force * 30}px rgba(0, 219, 222, ${0.3 + force * 0.4})`;
            }
            
            // Add pulse animation to images and cards
            if (!element.classList.contains('active-pulse')) {
                element.classList.add('active-pulse');
            }
        } else {
            // Reset element styles when cursor is outside attraction radius
            element.style.transform = '';
            
            if (element.classList.contains('magnetic-btn')) {
                // Reset to original shadow (stored in a data attribute)
                const originalClass = Array.from(element.classList)
                    .find(cls => cls.startsWith('magnetic-btn') && cls !== 'magnetic-btn');
                    
                if (originalClass === 'primary') {
                    element.style.boxShadow = '0 5px 15px rgba(0, 219, 222, 0.3)';
                } else if (originalClass === 'secondary') {
                    element.style.boxShadow = '0 5px 15px rgba(255, 126, 179, 0.3)';
                } else if (originalClass === 'accent') {
                    element.style.boxShadow = '0 5px 15px rgba(255, 179, 71, 0.3)';
                } else if (originalClass === 'warning') {
                    element.style.boxShadow = '0 5px 15px rgba(255, 65, 108, 0.3)';
                } else if (originalClass === 'info') {
                    element.style.boxShadow = '0 5px 15px rgba(138, 35, 135, 0.3)';
                } else if (originalClass === 'success') {
                    element.style.boxShadow = '0 5px 15px rgba(86, 171, 47, 0.3)';
                } else {
                    element.style.boxShadow = '';
                }
            }
            
            // Reset cursor follower
            cursorFollower.style.transform = '';
            
            // Remove pulse class
            if (element.classList.contains('active-pulse')) {
                element.classList.remove('active-pulse');
            }
        }
    }
    
    // Handle mouse enter on magnetic element
    function handleMouseEnter(e) {
        const element = e.currentTarget;
        
        // Add visual indicator
        if (!element.classList.contains('magnetic-element-active')) {
            element.classList.add('magnetic-element-active');
        }
        
        // Update cursor follower color based on element type
        if (element.classList.contains('magnetic-btn')) {
            if (element.classList.contains('primary')) {
                cursorFollower.style.borderColor = 'rgba(0, 219, 222, 0.5)';
            } else if (element.classList.contains('secondary')) {
                cursorFollower.style.borderColor = 'rgba(255, 126, 179, 0.5)';
            } else if (element.classList.contains('accent')) {
                cursorFollower.style.borderColor = 'rgba(255, 179, 71, 0.5)';
            }
        }
        
        // For images, show overlay
        if (element.classList.contains('magnetic-img')) {
            const overlay = element.querySelector('.img-overlay');
            if (overlay) {
                overlay.style.transform = 'translateY(0)';
            }
        }
    }
    
    // Handle mouse leave on magnetic element
    function handleMouseLeave(e) {
        const element = e.currentTarget;
        
        // Remove visual indicator
        if (element.classList.contains('magnetic-element-active')) {
            element.classList.remove('magnetic-element-active');
        }
        
        // Reset cursor follower
        cursorFollower.style.borderColor = 'rgba(0, 219, 222, 0.3)';
        
        // For images, hide overlay
        if (element.classList.contains('magnetic-img')) {
            const overlay = element.querySelector('.img-overlay');
            if (overlay) {
                overlay.style.transform = 'translateY(100%)';
            }
        }
    }
    
    // Create ripple effect on button click
    function createRippleEffect(e) {
        const button = e.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        // Remove existing ripples
        const existingRipples = button.querySelectorAll('.ripple');
        existingRipples.forEach(ripple => ripple.remove());
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Add ripple effect styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .magnetic-btn {
            position: relative;
            overflow: hidden;
        }
    `;
    document.head.appendChild(style);
    
    // Start the application
    init();
});