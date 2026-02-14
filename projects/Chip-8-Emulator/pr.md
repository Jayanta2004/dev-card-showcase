## 📌 Description
This PR introduces **Chip-8-Emulator**, a complete Virtual Machine for the vintage CHIP-8 interpreting language .

The project simulates a 1970s microcomputer entirely in JavaScript. It reads binary ROM files (Instructions), stores them in a simulated 4KB Memory `Uint8Array`, and processes them through a CPU Fetch-Decode-Execute cycle.

**Key Features:**
* **Full Instruction Set:** Implements the core 35 OpCodes, including arithmetic, control flow (Jump/Call/Ret), and random number generation.
* **Canvas Renderer:** Maps the internal `64x32` display buffer to an HTML5 Canvas, simulating the classic "XOR" drawing mode used for sprites.
* **Input Mapping:** Maps the original 16-key Hex Keypad (0-F) to the modern QWERTY keyboard layout.
* **Binary Loader:** Includes a file reader to parse `.ch8` binary files directly from the user's disk.

Fixes: #3106

---

## 📸 Screenshots

<img width="1919" height="968" alt="Image" src="https://github.com/user-attachments/assets/b447271b-3c8d-471b-b889-ef6cbbef7d5f" />

<img width="1919" height="948" alt="Image" src="https://github.com/user-attachments/assets/7bb3f47d-69e7-4b86-8cd1-57c6b7d106c9" />

<img width="1918" height="1078" alt="Image" src="https://github.com/user-attachments/assets/44a5d8ff-cee5-4b63-8c2f-2bc71b25943b" />

---

## 🔧 Type of Change
- [ ] 🐛 Bug fix
- [x] ✨ New feature
- [ ] 📝 Documentation update
- [ ] ♻️ Refactor / Code cleanup
- [x] 🎨 UI / Styling change
- [ ] 🚀 Other (please describe):

---

## 🧪 How Has This Been Tested?
- [x] **Manual testing**
    - **ROM Loading:** Tested loading "Pong" and "Tetris" binary files.
    - **Graphics:** Verified that sprites draw and erase correctly using XOR logic (0^1=1, 1^1=0).
    - **Input:** Confirmed that pressing keyboard keys updates the emulator's internal key state.
    - **Timers:** Verified that the Delay Timer decrements at approximately 60Hz.
- [ ] Automated tests
- [ ] Not tested (please explain why)

---

## ✅ Checklist
- [x] My project uses vanilla HTML, CSS, and JavaScript
- [x] I have tested my project locally
- [x] My project is responsive
- [x] I will add my project to projects.json (NOT index.html)