## 📌 Description
This PR introduces **Kaleidoscope-Mandala**, a creative drawing tool that utilizes radial symmetry to generate complex patterns effortlessly.

The engine divides the canvas into radial sectors (configurable from 4 to 32). When the user draws a line in one sector, the application uses **Canvas Transformations** (`rotate` and `scale`) to instantly replicate and mirror that stroke across all other sectors. This allows even simple scribbles to result in perfectly symmetrical, intricate Mandala or Snowflake designs .

**Key Features:**
* **Radial Symmetry Engine:** Simultaneously draws $N$ rotated copies and $N$ mirrored copies of the input stroke.
* **Customizable Tools:**
    * **Segments:** Adjust symmetry count from 4 to 32 slices.
    * **Brush:** Change stroke color and width in real-time.
* **Export:** Built-in functionality to save the artwork as a high-quality PNG.
* **Responsive:** Centers the symmetry point automatically on window resize.

Fixes: #2985

---

## 📸 Screenshots

<img width="1919" height="966" alt="Image" src="https://github.com/user-attachments/assets/821f0b97-c0f4-4961-8544-ca1bf06d83aa" />

<img width="1919" height="966" alt="Image" src="https://github.com/user-attachments/assets/20ffce73-83dc-4c80-918e-3dabd7eb2dd2" />

<img width="1918" height="971" alt="Image" src="https://github.com/user-attachments/assets/ffa4d6af-69d3-4307-b21b-9754d76deb28" />

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **Symmetry:** Verified that drawing in one corner produces symmetrical lines in all other sectors.
    - **Mirroring:** Confirmed that lines meet perfectly at the sector boundaries (kaleidoscope effect).
    - **Controls:** Tested changing the segment count mid-drawing (affects new strokes only, preserving old ones).
    - **Touch:** Verified functionality on mobile devices (touch events mapped to mouse events).
    - **Download:** Confirmed the "Save" button downloads the current canvas state.

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive