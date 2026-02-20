## 📌 Description
This PR introduces **Neon-Brick-Breaker**, a modern, high-energy arcade physics game inspired by *Breakout* and *Arkanoid* .

The game features a glowing "Neon" aesthetic powered by the Canvas API's shadow effects. Players control a paddle to deflect a ball, destroy bricks, and collect falling power-ups. The engine includes custom vector reflection logic for the ball, circle-AABB collision detection for the bricks, and a particle system for satisfying explosions.

**Key Features:**
* **Physics Engine:** Handles ball movement, wall bouncing, and angle-based paddle reflection (hitting the edge of the paddle sends the ball at a sharper angle).
* **Power-Up System:** Randomly spawns items:
    * **Multi-Ball (M):** Spawns extra balls to clear the screen faster.
    * **Wide Paddle (W):** Temporarily increases paddle size.
    * **Extra Life (L):** Grants a safety net.
* **Particle Effects:** Visual feedback with glowing debris whenever a brick is smashed.
* **Responsive Design:** The game adapts to the window size, recalculating brick widths dynamically.

Fixes: #3292

---

## 📸 Screenshots

<img width="1919" height="932" alt="Image" src="https://github.com/user-attachments/assets/3506314b-5915-40a4-8149-43c727622d1a" />

<img width="1919" height="988" alt="Image" src="https://github.com/user-attachments/assets/e7721bfc-7ce1-41da-b805-85e088756fa2" />

<img width="1919" height="968" alt="Image" src="https://github.com/user-attachments/assets/f1e9ce64-c64c-40dd-9ef8-5af9b7f019d5" />


---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Controls:** Verified mouse and touch input moves the paddle smoothly.
    - **Physics:** Confirmed ball bounces correctly off all 4 walls (bottom kills ball) and bricks.
    - **Power-ups:** Collected "Wide" and "Multi" items to ensure they trigger the correct game state changes.
    - **Win/Loss:** Verified that losing all lives triggers the Game Over screen, and clearing all bricks resets the level with a score bonus.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive