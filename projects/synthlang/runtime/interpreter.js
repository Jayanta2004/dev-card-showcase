import { Scope } from "./scope.js";
import {
    VariableDeclaration,
    PrintStatement,
    BinaryExpression,
    Literal,
    Identifier
} from "../language/ast.js";

export class Interpreter {
    constructor() {
        this.scope = new Scope();
        this.output = [];
    }

    run(program) {
        for (let stmt of program.body) {
            this.evaluate(stmt);
        }
        return this.output;
    }

    evaluate(node) {
        if (node instanceof VariableDeclaration) {
            const value = this.evaluate(node.value);
            this.scope.set(node.name, value);
        }

        else if (node instanceof PrintStatement) {
            const value = this.evaluate(node.expression);
            this.output.push(value);
        }

        else if (node instanceof BinaryExpression) {
            const left = this.evaluate(node.left);
            const right = this.evaluate(node.right);

            if (node.operator === "+") return left + right;
            if (node.operator === "-") return left - right;
        }

        else if (node instanceof Literal) {
            return node.value;
        }

        else if (node instanceof Identifier) {
            return this.scope.get(node.name);
        }
    }
}