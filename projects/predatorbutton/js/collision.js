/**
 * PREDATOR BUTTON - COLLISION DETECTION
 * 
 * Continuously checks if the cursor has been "captured" by the button.
 */

(function () {
    /**
     * Check if cursor is inside the button's rect
     */
    function checkCollision() {
        if (!window.PredatorState.isHunting) return;

        const { mouse, button, config } = window.PredatorState;

        const halfWidth = button.width / 2;
        const halfHeight = button.height / 2;

        const isInsideX = mouse.x >= (button.x - halfWidth - config.collisionBuffer) &&
            mouse.x <= (button.x + halfWidth + config.collisionBuffer);

        const isInsideY = mouse.y >= (button.y - halfHeight - config.collisionBuffer) &&
            mouse.y <= (button.y + halfHeight + config.collisionBuffer);

        if (isInsideX && isInsideY) {
            handleCapture();
        }
    }

    /**
     * Triggered when the button catches the mouse
     */
    function handleCapture() {
        // Stop hunting immediately
        window.PredatorState.isHunting = false;

        // Broadcast capture event
        const captureEvent = new CustomEvent('predator:capture');
        window.dispatchEvent(captureEvent);
    }

    // Run collision check every frame
    function loop() {
        checkCollision();
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
})();
