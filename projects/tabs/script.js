document.addEventListener('DOMContentLoaded', function() {
    // Initialize all tab containers
    initTabs('basicTabs');
    initTabs('verticalTabs');
    
    // Style switcher functionality
    initStyleSwitcher();
    
    // Add keyboard navigation
    initKeyboardNavigation();
});

function initTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabPanes = container.querySelectorAll('.tab-pane');
    
    // Function to switch tabs
    function switchTab(tabId) {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            pane.setAttribute('aria-hidden', 'true');
        });
        
        // Add active class to clicked button and corresponding pane
        const activeButton = container.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const activePane = document.getElementById(tabId);
        
        if (activeButton && activePane) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-selected', 'true');
            activePane.classList.add('active');
            activePane.setAttribute('aria-hidden', 'false');
            
            // Update URL hash without scrolling
            history.pushState(null, null, `#${tabId}`);
        }
    }
    
    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
        
        // Add keyboard event for Enter key
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            }
        });
    });
    
    // Check for initial tab from URL hash
    const hash = window.location.hash.substring(1);
    if (hash && container.querySelector(`.tab-btn[data-tab="${hash}"]`)) {
        switchTab(hash);
    }
}

function initStyleSwitcher() {
    const styleButtons = document.querySelectorAll('.style-btn');
    const tabsContainers = document.querySelectorAll('.tabs-container');
    
    styleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all style buttons
            styleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get the selected style
            const style = button.getAttribute('data-style');
            
            // Apply the style to all tab containers
            tabsContainers.forEach(container => {
                // Remove all style classes
                container.classList.remove('style-default', 'style-rounded', 'style-underline', 'style-pills');
                
                // Add the selected style class
                container.classList.add(`style-${style}`);
                
                // Update tab buttons based on style
                const tabButtons = container.querySelectorAll('.tab-btn');
                
                tabButtons.forEach(tabBtn => {
                    // Remove all style classes
                    tabBtn.classList.remove('rounded', 'underline', 'pill');
                    
                    // Add style-specific class
                    if (style === 'rounded') {
                        tabBtn.classList.add('rounded');
                    } else if (style === 'underline') {
                        tabBtn.classList.add('underline');
                    } else if (style === 'pills') {
                        tabBtn.classList.add('pill');
                    }
                });
            });
            
            // Apply CSS for the selected style
            applyTabStyle(style);
        });
    });
}

function applyTabStyle(style) {
    // Remove existing style rules
    const existingStyle = document.getElementById('dynamic-tab-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-tab-styles';
    
    let cssRules = '';
    
    switch(style) {
        case 'rounded':
            cssRules = `
                .tabs-container.style-rounded .tabs-header {
                    border-radius: 50px;
                    padding: 5px;
                }
                
                .tabs-container.style-rounded .tab-btn {
                    border-radius: 50px;
                    margin: 0 2px;
                }
                
                .tabs-container.style-rounded .tab-btn.active {
                    background: linear-gradient(135deg, #3498db, #2c3e50);
                    color: white;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }
            `;
            break;
            
        case 'underline':
            cssRules = `
                .tabs-container.style-underline .tabs-header {
                    background: transparent;
                    border-bottom: 2px solid #eaeaea;
                }
                
                .tabs-container.style-underline .tab-btn {
                    background: transparent;
                    border: none;
                    position: relative;
                }
                
                .tabs-container.style-underline .tab-btn.active {
                    background: transparent;
                    color: #3498db;
                }
                
                .tabs-container.style-underline .tab-btn.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: #3498db;
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from { width: 0; left: 50%; }
                    to { width: 100%; left: 0; }
                }
            `;
            break;
            
        case 'pills':
            cssRules = `
                .tabs-container.style-pills .tabs-header {
                    background: transparent;
                    gap: 10px;
                }
                
                .tabs-container.style-pills .tab-btn {
                    border-radius: 25px;
                    border: 2px solid #3498db;
                    background: transparent;
                    color: #3498db;
                    transition: all 0.3s ease;
                }
                
                .tabs-container.style-pills .tab-btn:hover {
                    background: rgba(52, 152, 219, 0.1);
                }
                
                .tabs-container.style-pills .tab-btn.active {
                    background: #3498db;
                    color: white;
                    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
                }
            `;
            break;
            
        default:
            // Default style - no additional CSS needed
            break;
    }
    
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
}

function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Only handle if Tab key is pressed with Ctrl key (Ctrl + Tab)
        if (e.key === 'Tab' && e.ctrlKey) {
            e.preventDefault();
            
            // Find the currently active tab container
            const activeContainer = document.querySelector('.tabs-container');
            if (!activeContainer) return;
            
            const activeButton = activeContainer.querySelector('.tab-btn.active');
            if (!activeButton) return;
            
            const allButtons = activeContainer.querySelectorAll('.tab-btn');
            const currentIndex = Array.from(allButtons).indexOf(activeButton);
            
            let nextIndex;
            if (e.shiftKey) {
                // Ctrl + Shift + Tab - go to previous tab
                nextIndex = currentIndex > 0 ? currentIndex - 1 : allButtons.length - 1;
            } else {
                // Ctrl + Tab - go to next tab
                nextIndex = currentIndex < allButtons.length - 1 ? currentIndex + 1 : 0;
            }
            
            // Switch to the next/previous tab
            const nextButton = allButtons[nextIndex];
            const tabId = nextButton.getAttribute('data-tab');
            
            // Find the corresponding container and switch tab
            const container = nextButton.closest('.tabs-container');
            if (container) {
                initTabs(container.id);
                const event = new Event('click');
                nextButton.dispatchEvent(event);
                nextButton.focus();
            }
        }
        
        // Arrow key navigation for tabs
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('tab-btn')) {
                e.preventDefault();
                
                const container = focusedElement.closest('.tabs-container');
                if (!container) return;
                
                const allButtons = container.querySelectorAll('.tab-btn');
                const currentIndex = Array.from(allButtons).indexOf(focusedElement);
                
                let nextIndex;
                if (e.key === 'ArrowRight') {
                    nextIndex = currentIndex < allButtons.length - 1 ? currentIndex + 1 : 0;
                } else {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : allButtons.length - 1;
                }
                
                const nextButton = allButtons[nextIndex];
                nextButton.focus();
            }
        }
    });
}

// Export tab functionality for use in other scripts
window.tabsModule = {
    switchTab: function(containerId, tabId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const button = container.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (button) {
            button.click();
        }
    },
    
    getActiveTab: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const activeButton = container.querySelector('.tab-btn.active');
        return activeButton ? activeButton.getAttribute('data-tab') : null;
    },
    
    addTab: function(containerId, tabData) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const tabsHeader = container.querySelector('.tabs-header');
        const tabsContent = container.querySelector('.tabs-content');
        
        if (!tabsHeader || !tabsContent) return;
        
        // Create new tab button
        const newButton = document.createElement('button');
        newButton.className = 'tab-btn';
        newButton.setAttribute('data-tab', tabData.id);
        newButton.textContent = tabData.title;
        
        // Create new tab pane
        const newPane = document.createElement('div');
        newPane.className = 'tab-pane';
        newPane.id = tabData.id;
        newPane.innerHTML = tabData.content;
        
        // Append to containers
        tabsHeader.appendChild(newButton);
        tabsContent.appendChild(newPane);
        
        // Reinitialize tabs for this container
        initTabs(containerId);
    }
};