import { Lexer } from "./language/lexer.js";
import { Parser } from "./language/parser.js";
import { Interpreter } from "./runtime/interpreter.js";

document.getElementById("runBtn").onclick = () => {
    const code = document.getElementById("editor").value;

    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const interpreter = new Interpreter();
    const result = interpreter.run(ast);

    document.getElementById("output").innerText = result.join("\n");
};