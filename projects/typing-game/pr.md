### ⌨️ Overview
This Pull Request introduces **Typing-Game**, a highly responsive, real-time speed typing test. The application dynamically evaluates the user's keystrokes, providing instantaneous visual feedback and calculating precise Words Per Minute (WPM) and character accuracy.

Built entirely within a single-file architecture, this project demonstrates advanced string parsing, real-time DOM manipulation, and precise interval-based mathematics.

Closes #6472

<img width="1906" height="989" alt="Image" src="https://github.com/user-attachments/assets/f1e964c6-465e-433d-9e86-53a851292aba" />

<img width="1907" height="994" alt="Image" src="https://github.com/user-attachments/assets/c783647b-ee54-4fd4-8160-8cd13787582d" />

### ✨ Core Technical Implementations

#### 1. Real-Time String Parsing & Validation
* **Array Cross-Referencing:** Captures the user's input stream via the `input` event listener, dynamically splitting both the target text and the user's string into arrays. It cross-references them by index to determine exact character accuracy.
* **Backspace & Edge-Case Handling:** Implements robust logic to handle backspaces, correctly reverting the state of previously validated characters without breaking the tracking index.

#### 2. Dynamic DOM Highlighting
* **Granular Text Wrapping:** Programmatically wraps every single character of the target text inside individual `<span>` tags during initialization.
* **State-Driven CSS:** As the user types, the engine dynamically toggles `.correct` (green) or `.incorrect` (red) CSS classes on the specific `<span>` matching the current index, providing instant, hardware-accelerated visual feedback.

#### 3. Algorithmic Scoring Engine
* **Precise WPM Calculation:** Utilizes the standard typographical metric (5 characters = 1 word) combined with `Date.now()` elapsed time tracking to calculate gross and net WPM dynamically.
* **Accuracy Metrics:** Tracks the total number of keystrokes versus accurate hits, updating a live percentage readout on the UI overlay.

### 🚀 Performance Optimizations
* **Single-File Portability:** All CSS, HTML, and Vanilla JavaScript logic are consolidated into `index.html` for maximum performance and portability.
* **Event Throttling/Efficiency:** The input evaluation logic is highly optimized to run purely on delta updates rather than re-rendering the entire text block on every keystroke.

### 🕹️ How to Test
1. Launch `index.html` in your browser.
2. Click the text area to start the timer.
3. Type the highlighted paragraph as fast and accurately as you can.
4. Watch the WPM and Accuracy metrics update in real-time!
