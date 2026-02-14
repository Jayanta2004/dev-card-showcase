const editor = document.getElementById("editor");
const lineNumbers = document.getElementById("lineNumbers");
const runBtn = document.getElementById("runBtn");
const output = document.getElementById("output");

/* =============================
   UI: Line Numbers + Highlight
============================= */

editor.addEventListener("input", updateEditor);

function updateEditor() {
    const lines = editor.innerText.split("\n").length;
    lineNumbers.innerHTML = "";
    for (let i = 1; i <= lines; i++) {
        lineNumbers.innerHTML += i + "<br>";
    }

    highlight();
}

function highlight() {
    let code = editor.innerText;

    code = code
        .replace(/(let|print)/g, `<span class="keyword">$1</span>`)
        .replace(/(\d+)/g, `<span class="number">$1</span>`)
        .replace(/([+\-*/=])/g, `<span class="operator">$1</span>`);

    editor.innerHTML = code;
    placeCaretAtEnd(editor);
}

function placeCaretAtEnd(el) {
    el.focus();
    document.execCommand("selectAll", false, null);
    document.getSelection().collapseToEnd();
}

/* =============================
   TOKENIZER
============================= */

function tokenize(input) {
    const tokens = [];
    const regex = /\s*(let|print|\d+|[a-zA-Z]+|[+\-*/=();])/g;

    let match;
    while ((match = regex.exec(input))) {
        tokens.push(match[1]);
    }
    return tokens;
}

/* =============================
   PARSER → AST
============================= */

function parse(tokens) {
    let position = 0;

    function peek() {
        return tokens[position];
    }

    function consume() {
        return tokens[position++];
    }

    function parseExpression() {
        let left = parseTerm();

        while (peek() === "+" || peek() === "-") {
            const op = consume();
            const right = parseTerm();
            left = { type: "Binary", operator: op, left, right };
        }
        return left;
    }

    function parseTerm() {
        let left = parseFactor();

        while (peek() === "*" || peek() === "/") {
            const op = consume();
            const right = parseFactor();
            left = { type: "Binary", operator: op, left, right };
        }
        return left;
    }

    function parseFactor() {
        const token = consume();

        if (!isNaN(token)) {
            return { type: "Number", value: Number(token) };
        }

        if (/[a-zA-Z]+/.test(token)) {
            return { type: "Identifier", name: token };
        }

        if (token === "(") {
            const expr = parseExpression();
            consume(); // )
            return expr;
        }
    }

    function parseStatement() {
        if (peek() === "let") {
            consume();
            const name = consume();
            consume(); // =
            const value = parseExpression();
            consume(); // ;
            return { type: "Let", name, value };
        }

        if (peek() === "print") {
            consume();
            consume(); // (
            const value = parseExpression();
            consume(); // )
            consume(); // ;
            return { type: "Print", value };
        }
    }

    const program = [];
    while (position < tokens.length) {
        program.push(parseStatement());
    }

    return program;
}

/* =============================
   INTERPRETER
============================= */

function evaluate(ast) {
    const env = {};
    output.innerText = "";

    function evalNode(node) {
        switch (node.type) {
            case "Number":
                return node.value;

            case "Identifier":
                return env[node.name];

            case "Binary":
                const left = evalNode(node.left);
                const right = evalNode(node.right);

                switch (node.operator) {
                    case "+": return left + right;
                    case "-": return left - right;
                    case "*": return left * right;
                    case "/": return left / right;
                }

            case "Let":
                env[node.name] = evalNode(node.value);
                break;

            case "Print":
                output.innerText += evalNode(node.value) + "\n";
                break;
        }
    }

    ast.forEach(evalNode);
}

/* =============================
   RUN BUTTON
============================= */

runBtn.addEventListener("click", () => {
    try {
        const code = editor.innerText;
        const tokens = tokenize(code);
        const ast = parse(tokens);
        evaluate(ast);
    } catch (err) {
        output.innerText = "Error: " + err.message;
    }
});

/* Initialize */
editor.innerText = "let x = 5;\nlet y = 10;\nprint(x + y);";
updateEditor();
