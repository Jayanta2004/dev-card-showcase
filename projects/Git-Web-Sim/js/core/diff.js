/**
 * GIT DIFF ENGINE (MYERS ALGORITHM)
 * =================================
 * A complete implementation of the O(ND) Myers Difference Algorithm.
 * Used to calculate the line-by-line differences between two blobs.
 * * * Concept:
 * It finds the Shortest Edit Script (SES) by traversing an Edit Graph.
 * The "Snake" is a sequence of diagonal moves (matching lines).
 */

class DiffEngine {
    constructor() {
        // No state needed for the engine itself
    }

    /**
     * Compute the diff between two text strings.
     * @param {string} text1 - The original content (Blob A).
     * @param {string} text2 - The new content (Blob B).
     * @returns {Array} List of operations [{ type: 'same'|'add'|'delete', text: '...' }]
     */
    compute(text1, text2) {
        // 1. Pre-process: Split into lines
        const lines1 = text1 ? text1.split('\n') : [];
        const lines2 = text2 ? text2.split('\n') : [];
        
        // Edge cases
        if (lines1.length === 0 && lines2.length === 0) return [];
        if (lines1.length === 0) return lines2.map(l => ({ type: 'add', text: l }));
        if (lines2.length === 0) return lines1.map(l => ({ type: 'delete', text: l }));

        // 2. Find the Shortest Edit Path
        const history = this._findPath(lines1, lines2);

        // 3. Backtrack to generate the Edit Script
        return this._backtrack(history, lines1, lines2);
    }

    /**
     * THE GREEDY ALGORITHM
     * Searches for the optimal path (the "Snake") in the edit graph.
     * Tracks the furthest reaching D-path on diagonal k.
     */
    _findPath(lines1, lines2) {
        const n = lines1.length;
        const m = lines2.length;
        const max = n + m;
        
        // V[k] stores the max x-coordinate reached on diagonal k.
        // k = x - y. Range of k is [-m, n].
        // To handle negative indices in JS, we could offset, but object keys work fine.
        const v = { 1: 0 }; 
        
        // History stores the state of 'v' at each depth 'd' for backtracking
        const history = [];

        for (let d = 0; d <= max; d++) {
            // Clone v for history (shallow copy is enough as values are primitives)
            const vCopy = { ...v };
            history.push(vCopy);

            // Iterate diagonals k
            // Step is 2 because k parity changes every move
            for (let k = -d; k <= d; k += 2) {
                
                // Determine direction:
                // If k == -d, we moved down (Insertion) from k+1
                // If k == d, we moved right (Deletion) from k-1
                // Otherwise, pick the direction that reached further
                
                let x, y;
                const down = (k === -d || (k !== d && v[k - 1] < v[k + 1]));
                
                if (down) {
                    x = v[k + 1];      // Move Down (Insertion)
                } else {
                    x = v[k - 1] + 1;  // Move Right (Deletion)
                }
                
                y = x - k;

                // SNAKE: Follow diagonal while lines match
                while (x < n && y < m && lines1[x] === lines2[y]) {
                    x++;
                    y++;
                }

                v[k] = x;

                // Check if we reached the end (Bottom-Right of graph)
                if (x >= n && y >= m) {
                    return history;
                }
            }
        }
        return history;
    }

    /**
     * BACKTRACKING
     * Reconstructs the specific edits by walking backwards from the solution.
     */
    _backtrack(history, lines1, lines2) {
        const diffs = [];
        let x = lines1.length;
        let y = lines2.length;
        
        // Walk backwards through depth D
        for (let d = history.length - 1; d >= 0; d--) {
            const v = history[d];
            const k = x - y;
            
            // Re-determine how we got here (Down vs Right)
            // Logic must match _findPath exactly
            const down = (k === -d || (k !== d && v[k - 1] < v[k + 1]));
            
            const prevK = down ? k + 1 : k - 1;
            const prevX = v[prevK];
            const prevY = prevX - prevK;
            
            // 1. Add Matching Lines (Diagonal moves)
            // These happened *after* the edit in this step
            while (x > prevX && y > prevY) {
                diffs.unshift({ type: 'same', text: lines1[x - 1] });
                x--;
                y--;
            }

            // 2. Add the Edit (Insertion or Deletion)
            if (d > 0) { // d=0 is the start node
                if (x > prevX) {
                    // x decreased, y stayed same -> Deletion from Text 1
                    diffs.unshift({ type: 'delete', text: lines1[prevX] });
                    x--;
                } else {
                    // x stayed same, y decreased -> Insertion into Text 2
                    diffs.unshift({ type: 'add', text: lines2[prevY] });
                    y--;
                }
            }
        }
        return diffs;
    }

    /**
     * HTML Formatter
     * Converts the diff operations into HTML for the UI.
     */
    static toHTML(diffs) {
        if (!diffs || diffs.length === 0) {
            return '<div class="placeholder-msg"><i class="ri-check-line"></i> Files are identical.</div>';
        }
        
        let html = '';
        let chunkIndex = 0;

        diffs.forEach((op, i) => {
            // Optional: Group into "Hunks" (simplified here)
            
            if (op.type === 'same') {
                html += `
                <div class="diff-line same">
                    <span class="diff-num">${i + 1}</span>
                    <span class="diff-content">${escapeHtml(op.text)}</span>
                </div>`;
            } else if (op.type === 'add') {
                html += `
                <div class="diff-line add">
                    <span class="diff-num">+</span>
                    <span class="diff-content">${escapeHtml(op.text)}</span>
                </div>`;
            } else if (op.type === 'delete') {
                html += `
                <div class="diff-line del">
                    <span class="diff-num">-</span>
                    <span class="diff-content">${escapeHtml(op.text)}</span>
                </div>`;
            }
        });
        return html;
    }
}

// Helper to prevent XSS in diff viewer
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Export
if (typeof window !== 'undefined') {
    window.DiffEngine = DiffEngine;
}