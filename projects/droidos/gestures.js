/* --- GESTURE NAVIGATION SYSTEM --- */

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const device = document.getElementById('device');

device.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, false);

device.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleGesture();
}, false);

function handleGesture() {
    const xDiff = touchEndX - touchStartX;
    const yDiff = touchEndY - touchStartY;
    
    // Thresholds
    const minSwipeDistance = 50; 
    const screenHeight = window.innerHeight;
    
    // Check if swipe started from bottom area (for Home/Recents)
    const isBottomSwipe = touchStartY > (screenHeight - 100);
    
    // 1. SWIPE UP (Home)
    if (isBottomSwipe && yDiff < -minSwipeDistance && Math.abs(xDiff) < Math.abs(yDiff)) {
        // Unlock via click logic, so only goHome if screen != lock
        if (os.state.screen !== 'lock') {
            os.goHome();
        }
        return;
    }

    // 2. SWIPE RIGHT (Back) - mimics Android "Back" gesture from left edge
    const isEdgeSwipe = touchStartX < 50 || touchStartX > (window.innerWidth - 50);
    
    if (isEdgeSwipe && Math.abs(xDiff) > minSwipeDistance && Math.abs(yDiff) < Math.abs(xDiff)) {
        os.goBack();
    }
}