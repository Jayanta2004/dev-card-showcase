## 📌 Description
This PR introduces **Tower-Stack-3D**, a minimalist isometric stacking game .

The goal is to stack blocks as high as possible. A block slides back and forth above the tower, and the player must click to place it. If the block is not perfectly aligned, the overhanging portion is "sliced" off and falls away as debris. This makes the landing surface smaller for the next block, increasing difficulty.

**Key Features:**
* **Isometric Engine:** Renders 3D cubes on a 2D canvas using isometric projection formulas (`x - z`, `x + z`).
* **Slicing Logic:** Calculates the intersection of the current block and the previous one. Adjusts the dimensions dynamically and spawns a "Debris" block for the cut portion.
* **Physics:** Debris blocks obey gravity and fall off the screen visually.
* **Dynamic Camera:** The view automatically scrolls up smoothly to keep the top of the stack in focus.

Fixes: #3293

---

## 📸 Screenshots

<img width="1919" height="950" alt="Image" src="https://github.com/user-attachments/assets/eeaefcf4-2937-4c82-8225-900b6b420459" />

<img width="1919" height="1007" alt="Image" src="https://github.com/user-attachments/assets/f13a9d92-5847-47ff-b711-fa6d9aca8c18" />

<img width="1916" height="964" alt="Image" src="https://github.com/user-attachments/assets/6306b21e-ffce-4065-b949-b19160a61004" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Placement:** Verified that clicking places the block and triggers the next spawn.
    - **Slicing:** Confirmed that misaligned blocks get smaller, and the "cut" piece falls down.
    - **Game Over:** Verified that missing the stack completely ends the game.
    - **Visuals:** Checked that the isometric perspective looks correct (Top/Left/Right faces shaded differently).


---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive