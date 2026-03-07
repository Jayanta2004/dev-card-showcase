    (function(){
      // state: store crease lines as SVG elements data
      let creases = [];         // array of { x1, y1, x2, y2, type }
      let foldCount = 0;

      // svg namespaces
      const svgNS = "http://www.w3.org/2000/svg";
      const creaseGroup = document.getElementById("creaseGroup");
      const foldLog = document.getElementById("foldLog");
      const creaseSpan = document.getElementById("creaseCounter");

      // predefined coordinates (based on viewBox 0-300, square from 40 to 260)
      const S = 40;   // start
      const E = 260;  // end
      const C = 150;  // center

      function addCrease(x1, y1, x2, y2, type = 'valley') {
        // avoid perfect duplicates (very simple: ignore if same endpoints)
        const exists = creases.some(c => 
          (Math.abs(c.x1 - x1) < 2 && Math.abs(c.y1 - y1) < 2 && Math.abs(c.x2 - x2) < 2 && Math.abs(c.y2 - y2) < 2) ||
          (Math.abs(c.x1 - x2) < 2 && Math.abs(c.y1 - y2) < 2 && Math.abs(c.x2 - x1) < 2 && Math.abs(c.y2 - y1) < 2)
        );
        if (exists) {
          addLog("⚠️ crease already exists");
          return false;
        }

        // create line
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", type === 'valley' ? "#2277aa" : "#c44536");
        line.setAttribute("stroke-width", "2.5");
        line.setAttribute("stroke-dasharray", type === 'valley' ? "5 3" : "2 4");
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("class", `crease ${type}`);
        creaseGroup.appendChild(line);

        // store
        creases.push({ x1, y1, x2, y2, type, element: line });
        foldCount++;
        creaseSpan.innerText = `creases: ${foldCount}`;
        addLog(`${type} fold added (${Math.round(x1)}-${Math.round(y1)})`);
        return true;
      }

      function addLog(message) {
        const li = document.createElement("li");
        li.textContent = `🔸 ${message}`;
        foldLog.prepend(li); // latest first
        if (foldLog.children.length > 5) {
          foldLog.removeChild(foldLog.lastElementChild);
        }
      }

      function clearAllFolds() {
        // remove lines from group
        while (creaseGroup.firstChild) {
          creaseGroup.removeChild(creaseGroup.firstChild);
        }
        creases = [];
        foldCount = 0;
        creaseSpan.innerText = `creases: 0`;
        // reset log
        foldLog.innerHTML = '<li>✨ paper reset</li>';
      }

      // ---------- fold definitions (using absolute coordinates) ----------
      function valleyFold() {
        // valley: horizontal line across center (mountain/valley just style)
        addCrease(S, C, E, C, 'valley');
      }

      function mountainFold() {
        // mountain: vertical center line
        addCrease(C, S, C, E, 'mountain');
      }

      function halfBookFold() {
        // book fold: vertical line at 1/3? we do a classic "half" line from mid-left to mid-right? actually half fold often means fold paper in half — so a center line.
        // we'll add a valley style but also could be both. For variety: add a line from (S,100) to (E,100) – slightly off center
        addCrease(S, 100, E, 100, 'valley');
      }

      function diagonalCrease() {
        // diagonal from top-left to bottom-right
        addCrease(S, S, E, E, 'mountain');
      }

      // ----- bind buttons -----
      document.getElementById("foldValley").addEventListener("click", (e) => {
        valleyFold();
      });
      document.getElementById("foldMountain").addEventListener("click", (e) => {
        mountainFold();
      });
      document.getElementById("foldHalf").addEventListener("click", (e) => {
        halfBookFold();
      });
      document.getElementById("foldDiagonal").addEventListener("click", (e) => {
        diagonalCrease();
      });

      // reset button
      document.getElementById("resetFoldsBtn").addEventListener("click", (e) => {
        clearAllFolds();
      });

      // extra flair: after reset also log
      // initial sample crease? maybe not, keep blank.

      // add starting friendly crease? optional, but we want empty canvas.
      // For demonstration, maybe one pre-added diagonal? but let's keep empty
      // however to show it's working, we add one subtle diagonal? No, empty is fine.

      // we can add one automatic "sample" but better not. User will click.

      // but we need to show some example: let's add one small diagonal on first load?
      // maybe not, but to show style: add a "valley" line that is not too intrusive? 
      // comment: better to let user discover. But we can add a faint "demo" crease? 
      // I'll add a simple small diagonal after 0.5 sec to demonstrate (optional)
      // but to respect "empty" start, I'll not. However I will set a default so interface is not empty.
      // Actually I'll add one diagonal on page load to show style (valley)
      window.addEventListener('load', function() {
        // add one diagonal example after 100ms so user sees it's interactive
        setTimeout(() => {
          if (creases.length === 0) {
            addCrease(70, 70, 230, 230, 'valley'); // subtle example
            addLog("👆 try the fold buttons");
          }
        }, 200);
      });
    })();