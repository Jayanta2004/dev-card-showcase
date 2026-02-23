function analyzeCode() {
    const code = document.getElementById("codeInput").value;
    const lines = code.split("\n");

    let totalLines = lines.length;
    let blankLines = 0;
    let commentLines = 0;
    let functions = 0;
    let loops = 0;
    let conditionals = 0;

    let nestedLoopCount = 0;
    let loopDepth = 0;

    lines.forEach(line => {
        let trimmed = line.trim();

        if (trimmed === "") {
            blankLines++;
        }

        if (trimmed.startsWith("//") || trimmed.startsWith("/*")) {
            commentLines++;
        }

        if (trimmed.match(/function\s+\w+/) || trimmed.match(/\w+\s*=\s*\(.*\)\s*=>/)) {
            functions++;
        }

        if (trimmed.match(/\bfor\b/) || trimmed.match(/\bwhile\b/)) {
            loops++;
            loopDepth++;
            if (loopDepth > nestedLoopCount) {
                nestedLoopCount = loopDepth;
            }
        }

        if (trimmed.includes("}")) {
            loopDepth = Math.max(0, loopDepth - 1);
        }

        if (trimmed.match(/\bif\b/) || trimmed.match(/\bswitch\b/)) {
            conditionals++;
        }
    });

    let complexity = "O(1)";
    let meterValue = 10;

    if (nestedLoopCount === 1) {
        complexity = "O(n)";
        meterValue = 40;
    } else if (nestedLoopCount === 2) {
        complexity = "O(n²)";
        meterValue = 70;
    } else if (nestedLoopCount >= 3) {
        complexity = "O(n³)";
        meterValue = 100;
    }

    document.getElementById("totalLines").textContent = totalLines;
    document.getElementById("blankLines").textContent = blankLines;
    document.getElementById("commentLines").textContent = commentLines;
    document.getElementById("functions").textContent = functions;
    document.getElementById("loops").textContent = loops;
    document.getElementById("conditionals").textContent = conditionals;
    document.getElementById("complexity").textContent = complexity;

    let meter = document.getElementById("meterFill");
    meter.style.width = meterValue + "%";

    if (meterValue < 50) {
        meter.style.background = "green";
    } else if (meterValue < 80) {
        meter.style.background = "orange";
    } else {
        meter.style.background = "red";
    }
}
