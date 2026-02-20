## 📌 Description
This PR introduces **Helix Drop**, a pseudo-3D arcade game inspired by *Helix Jump* .

The objective is to guide a bouncing ball down a rotating tower by aligning the gaps in the platforms. The rendering engine creates a 3D cylindrical effect using 2D Canvas transformations (squashing the Y-axis with `ctx.scale(1, 0.4)`).

**Key Features:**
* **Pseudo-3D Rendering:** Uses stacked arcs and elliptical scaling to simulate a 3D tower on a 2D canvas.
* **Angular Collision:** Detects whether the ball lands on a platform or falls through a gap based on the relative rotation angle ($\theta_{ball} \approx \theta_{gap} + \theta_{rotation}$).
* **Persistent Decals:** Every bounce leaves a "paint splat" on the platform that rotates with the tower, adding to the visual persistence.
* **Infinite Generation:** Platforms are generated procedurally as the player descends.

Fixes: #3479

---

## 📸 Screenshots

<img width="1915" height="942" alt="Image" src="https://github.com/user-attachments/assets/1da20185-bfd0-4057-b701-548920a73784" />

<img width="1919" height="956" alt="Image" src="https://github.com/user-attachments/assets/1c9f06bc-94ca-406f-b7c7-8a82af38fb77" />

<img width="1918" height="963" alt="Image" src="https://github.com/user-attachments/assets/75cc7c11-8e2f-415a-97db-d80febd05c3f" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Rotation:** Verified that swiping/dragging rotates the tower smoothly.
    - **Physics:** Confirmed the ball bounces with gravity and falls through gaps correctly.
    - **Visuals:** Checked that paint splats appear at the correct contact point and rotate with the platform.
    - **Infinite Loop:** Verified that new platforms generate endlessly and old ones are culled to maintain performance.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive