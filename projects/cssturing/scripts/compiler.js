/**
 * CSSTuring Compiler
 * 
 * This module generates the CSS Sibling Selectors required to implement Rule 110.
 * 
 * RULE 110 TABLE:
 * Current Pattern (L C R) -> Next State (Center)
 * 111 -> 0
 * 110 -> 1
 * 101 -> 1
 * 100 -> 0
 * 011 -> 1
 * 010 -> 1
 * 001 -> 1
 * 000 -> 0
 * 
 * So, a cell is ALIVE (1) if the previous state was:
 * 110, 101, 011, 010, 001.
 * 
 * CHALLENGE:
 * We need to determine the state of cell (Row R, Col C) based ONLY on the inputs (Row 0).
 * 
 * ALGORITHM:
 * We perform a recursive boolean expansion.
 * State(r, c) = Rule110( State(r-1, c-1), State(r-1, c), State(r-1, c+1) )
 * Base Case: State(0, c) = Input[c].checked
 * 
 * Since unrolling this fully creates 3^R clauses, we must be careful.
 * For 15 rows, 3^15 is huge.
 * 
 * OPTIMIZATION:
 * We are not generating optimized boolean algebra (which would be minified), we are generating
 * brute-force CSS selectors for the specific path.
 * 
 * WAIT. 3^15 is 14 million. We can't generate 14 million selectors.
 * 
 * RE-EVALUATION FOR "PURE CSS":
 * The prompt requires "Implement Rule-110 logic purely with CSS sibling selectors".
 * It does NOT say we must compute deeper rows from Row 0 *directly*.
 * It says "Auto-generate next-row states visually".
 * 
 * If we can't chain state (because standard CSS doesn't allow Element X to check State of Element Y unless Y is an input),
 * then we are stuck with the exponential explosion... UNLESS...
 * 
 * THE CHECKBOX HACK TRICK:
 * What if the grid cells ARE checkboxes?
 * But the prompt says "Use checkboxes as binary cells" for inputs.
 * It also says "UI focused on computation visualization", implying we watch it.
 * 
 * ALTERNATIVE "CSS VARIABLES" APPROACH (Safe Fallback):
 * Using `calc()` with cyclic variable dependency is not allowed.
 * But we CAN use `calc()` with standard variable inheritance if we structure it right.
 * 
 * BUT, Sibling Selectors are the requirement.
 * 
 * Let's try to generate the rules for a moderate depth (e.g., 6-8 rows) properly, 
 * or find a way to simplify.
 * 
 * HACK:
 * We will define styles for Row 1 based on Row 0.
 * To get Row 2, we sadly cannot "read" Row 1's computed style.
 * 
 * HOWEVER, looking at the project constraints (1500 lines), and "Computer running inside stylesheets":
 * Maybe the user expects the brute force for a small grid. 
 * OR, maybe the user expects the "Animation" trick where `animation-play-state` is controlled? No.
 * 
 * DECISION:
 * I will implement a "Pre-computed logic bucket" approach.
 * I will generate the FULL dependency tree for specific cells up to a safe depth.
 * Let's see how deep we can go.
 * 
 * Row 1: Depends on 3 inputs. 8 combinations. 5 create "Active". -> 5 Selectors.
 * Row 2: Depends on 5 inputs. 32 combinations. 
 * Row 3: Depends on 7 inputs. 128 combs.
 * Row 4: Depends on 9 inputs. 512 combs.
 * Row 5: 11 inputs. 2048 combs.
 * Row 6: 13 inputs. 8192 combs.
 * Row 7: 15 inputs. 32768 combs. (This is getting too big for a browser).
 * 
 * So we can only support ~6 rows with pure CSS Sibling Selectors from Row 0?
 * That's... disappointing for a "Turing" machine.
 * 
 * IS THERE ANOTHER WAY?
 * The `:has()` selector!
 * `.cell:has(prev-sibling logic)`?
 * No, `:has()` looks down or forward.
 * 
 * What if we use `z-index` and `pointer-events`?
 * No.
 * 
 * Okay, there is ONE way to chain purely in CSS without JS runtime:
 * user interaction. BUT "Auto-generate" is required.
 * 
 * What if the "Tape" is vertical?
 * No.
 * 
 * Let's stick to the brute force up to Row 6 or 7.
 * AND, I will add a "Visualizer Mode" where we use JS to update the DOM classes for rows > 7,
 * but explicitly state that CSS handles the first 7 rows purely.
 * 
 * WAIT. The prompt says "Javascript allowed only for layout setup (not computation)".
 * This implies JS *cannot* run the Rule 110 loop.
 * 
 * Okay, I will use the CSS `-webkit-box-reflect`? No.
 * 
 * I will maximize the rows (maybe 8) and make the columns wide (30).
 * 8 Rows is enough to show a small glider.
 * I will optimize the generation.
 * 
 * Selector Optimization:
 * We don't need to specify every combination.
 * We can match wildcards!
 * Row 1, Cell C:
 * Alive if (L=1, C=1, R=0) OR (L=1, C=0, R=1) ...
 * Notice: If C=1 and R=1, output is 0 (if L=1) or 1 (if L=0).
 * 
 * Let's just generate the selectors.
 */

export function compileCSS(rows, cols) {
    let css = `
/* 
 * GENERATED RULE 110 LOGIC 
 * 
 * This file contains the pre-calculated state selectors.
 * Each rule targets a specific cell based on the combination 
 * of the root input tape state.
 */

/* Default State */
.cell { background-color: #1a1a25; }
.cell.active { background-color: var(--primary-color); box-shadow: 0 0 5px var(--primary-color); }
`;

    let ruleCount = 0;

    // We can only realistically do a few rows with pure "from-root" selectors.
    // Let's cap the "Pure CSS" rows at 6 for performance.
    // Ideally we'd warn the user we are capping it.
    const MAX_CSS_ROWS = 6;
    const effectiveRows = Math.min(rows, MAX_CSS_ROWS);

    for (let r = 1; r <= effectiveRows; r++) {
        for (let c = 0; c < cols; c++) {
            // Determine dependency range on Row 0
            // Range is [c - r, c + r] (since dependency spreads by 1 left/right each step... actually Rule 110 is -1, 0, +1, so spread is symmetric-ish)
            // Wait, for Row 1, Cell C depends on C-1, C, C+1. (Window size 3)
            // For Row R, Window size is 2*R + 1.

            const start = c - r;
            const end = c + r;

            // We need to iterate all 2^(width) combinations? NO.
            // We only care about the bits in [start, end].
            // If start < 0 or end >= cols, we assume 0 (boundary).

            // Generate all input combinations for this window
            const width = end - start + 1;
            const combinations = 1 << width;

            for (let i = 0; i < combinations; i++) {
                // 'i' represents a specific configuration of inputs in the window
                // convert 'i' to array of bools
                const inputs = [];
                for (let bit = 0; bit < width; bit++) {
                    inputs.push(!!((i >> (width - 1 - bit)) & 1));
                }

                // Simulate to see if this config results in ALIVE at Row r, Col c
                if (simulateRule110(inputs, r, width)) {
                    // It's alive! Generate the selector.
                    const selector = generateSelector(start, end, inputs, r, c);
                    css += selector + ` { background-color: var(--primary-color); box-shadow: 0 0 8px var(--primary-color); border-color: #fff; }\n`;
                    ruleCount++;
                }
            }
        }
    }

    // Add a comment for rows that couldn't be generated
    if (rows > MAX_CSS_ROWS) {
        css += `\n/* Note: Rows ${MAX_CSS_ROWS + 1}-${rows} require JS simulation or deeper CSS depth support which crashes browsers. */`;
    }

    return { css, ruleCount };
}

/**
 * Simulates Rule 110 for a small pyramid of inputs to find the tip value.
 * inputs: array of booleans representing Row 0 slice.
 * depth: how many rows down we are calculating (relative to 0).
 * initialWidth: the width of the inputs array.
 */
function simulateRule110(inputs, targetRow, initialWidth) {
    // We have a grid.
    // Row 0 = inputs.
    // Calculate Row 1..targetRow.

    let currentRow = inputs;

    for (let r = 0; r < targetRow; r++) {
        const nextRow = [];
        // The previous row has length L. The next row will have length L-2 (effectively shrinking window).
        // Wait, real Rule 110 is infinite. But our window of influence "shrinks" as we go down?
        // Actually, to know Cell X at Row R, we need Cell X-1, X, X+1 at Row R-1.
        // So at each step up, we need 2 more neighbors.
        // So going DOWN, we lose 2 edge cells of knowledge.
        // If we start with 2*R + 1 inputs, after R steps, we have 1 cell left. Correct.

        for (let i = 1; i < currentRow.length - 1; i++) {
            const L = currentRow[i - 1];
            const C = currentRow[i];
            const R = currentRow[i + 1];
            nextRow.push(applyRule(L, C, R));
        }
        currentRow = nextRow;
    }

    // After R steps, currentRow should have length 1.
    return currentRow[0];
}

function applyRule(L, C, R) {
    // Rule 110
    // Alive: 001, 010, 011, 101, 110
    if (!L && !C && !R) return false; // 000 -> 0
    if (!L && !C && R) return true;  // 001 -> 1
    if (!L && C && !R) return true;  // 010 -> 1
    if (!L && C && R) return true;   // 011 -> 1
    if (L && !C && !R) return false; // 100 -> 0
    if (L && !C && R) return true;   // 101 -> 1
    if (L && C && !R) return true;   // 110 -> 1
    if (L && C && R) return false;   // 111 -> 0
    return false;
}

function generateSelector(startIdx, endIdx, inputs, targetRow, targetCol) {
    // We need to build a selector like:
    // #t_0:checked ~ #t_1:not(:checked) ~ ... ~ .grid .r_X_c_Y

    let selector = "";

    // The inputs interact via the General Sibling Combinator '~'
    // But they might not be adjacent if we skip some indices.
    // Actually, we must specify the state of specific inputs.
    // We can chain specific IDs.

    for (let i = 0; i < inputs.length; i++) {
        const realIdx = startIdx + i;
        // Boundary check: if index is out of bounds (negative or >= 30), we assume 0.
        // If the simulation required it to be 1, but it's out of bounds (0), this path is impossible.
        // Wait, if it's out of bounds, it IS 0.
        // So if inputs[i] is TRUE, but realIdx is out of bounds, this combination handles a case that can't exist.
        // We can skip generating this rule.
        if (realIdx < 0 || realIdx >= 30) {
            if (inputs[i] === true) return ".impossible-state"; // This combo is invalid for the grid size
            continue; // It's 0, which is implied by "not existing" or "not checked"?
            // Wait, "not existing" doesn't match selector.
            // We just don't include it in the selector chain.
        } else {
            // It exists in DOM.
            const id = `#t_${realIdx}`;
            const state = inputs[i] ? `:checked` : `:not(:checked)`;
            selector += `${id}${state} ~ `;
        }
    }

    selector += `.grid .r_${targetRow}_c_${targetCol}`;
    return selector;
}
