## 📌 Description
This PR introduces **Zombie-Type-Shooter**, a survival arcade game that combines typing mechanics with zombie defense .

Players act as a stationary gunner on the left side of the screen. Zombies approach from the right, each carrying a random word. The player must type the word correctly to fire bullets and eliminate the zombie. The game features an "Auto-Targeting" system where typing the first letter of a word automatically locks onto that zombie.

**Key Features:**
* **Typing Engine:** Tracks keystrokes and matches them against zombie words in real-time.
* **Smart Targeting:** If multiple zombies are present, typing a unique starting letter selects that specific target.
* **Difficulty Scaling:** As the score increases, zombies spawn faster and move quicker.
* **WPM Tracker:** Calculates Words Per Minute dynamically based on keys typed and time elapsed.
* **Visual Polish:** Includes particle effects for "blood" upon kills and a retro horror UI.

Fixes: #3294

---

## 📸 Screenshots

<img width="1919" height="953" alt="Image" src="https://github.com/user-attachments/assets/5e53a81c-4e48-408b-9506-de3d666da3a0" />

<img width="1919" height="927" alt="Image" src="https://github.com/user-attachments/assets/8505a071-56f1-4935-8d8e-d0b3c70c8c25" />

<img width="1919" height="995" alt="Image" src="https://github.com/user-attachments/assets/8a2ab8c0-1a41-47f4-9777-999e17e0cd9a" />

---


## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Typing:** Verified that typing the correct letters advances the word and eventually kills the zombie.
    - **Targeting:** Confirmed that typing a letter that matches two zombies picks the closest one (or first in array).
    - **Game Over:** Verified that when a zombie reaches x < 100, the game stops and the "You Died" screen appears.
    - **Reset:** Confirmed "Try Again" resets the score, WPM, and zombie waves.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive