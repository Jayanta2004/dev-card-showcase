import {
    Program,
    VariableDeclaration,
    PrintStatement,
    BinaryExpression,
    Literal,
    Identifier
} from "./ast.js";

export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }

    parse() {
        const body = [];

        while (this.position < this.tokens.length) {
            body.push(this.parseStatement());
        }

        return new Program(body);
    }

    parseStatement() {
        const token = this.peek();

        if (token === "let") {
            return this.parseVariableDeclaration();
        }

        if (token === "print") {
            return this.parsePrintStatement();
        }
    }

    parseVariableDeclaration() {
        this.consume("let");
        const name = this.consume();
        this.consume("=");
        const value = this.parseExpression();
        this.consume(";");

        return new VariableDeclaration(name, value);
    }

    parsePrintStatement() {
        this.consume("print");
        this.consume("(");
        const expression = this.parseExpression();
        this.consume(")");
        this.consume(";");

        return new PrintStatement(expression);
    }

    parseExpression() {
        let left = this.parsePrimary();

        while (this.peek() === "+" || this.peek() === "-") {
            const operator = this.consume();
            const right = this.parsePrimary();
            left = new BinaryExpression(left, operator, right);
        }

        return left;
    }

    parsePrimary() {
        const token = this.consume();

        if (!isNaN(token)) {
            return new Literal(Number(token));
        }

        return new Identifier(token);
    }

    consume(expected) {
        const token = this.tokens[this.position++];

        if (expected && token !== expected) {
            throw new Error("Unexpected token: " + token);
        }

        return token;
    }

    peek() {
        return this.tokens[this.position];
    }
}