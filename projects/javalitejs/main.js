/**
 * JavaLiteJS - Browser-based Java Compiler Simulator
 * 
 * Architecture:
 * 1. Lexer: Tokenizes the input string.
 * 2. Parser: Converts tokens to AST.
 * 3. SemanticAnalyzer: Validates the AST (types, scopes).
 * 4. Interpreter: Executes the AST step-by-step using Generators.
 * 5. UIController: Manages the DOM, Editor, and Visualization.
 */

// ==========================================
// 1. LEXER (Tokenizer)
// ==========================================

const TokenType = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    OPERATOR: 'OPERATOR',
    PUNCTUATION: 'PUNCTUATION',
    EOF: 'EOF'
};

class Token {
    constructor(type, value, line, col) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.col = col;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.tokens = [];

        this.keywords = new Set([
            'int', 'boolean', 'String', 'if', 'else', 'while', 'for',
            'true', 'false', 'System', 'out', 'println'
        ]);
    }

    tokenize() {
        while (this.pos < this.input.length) {
            const char = this.peek();

            if (/\s/.test(char)) {
                this.consumeWhitespace();
            } else if (char === '/' && (this.peek(1) === '/' || this.peek(1) === '*')) {
                this.consumeComment();
            } else if (/[a-zA-Z_]/.test(char)) {
                this.consumeIdentifier();
            } else if (/[0-9]/.test(char)) {
                this.consumeNumber();
            } else if (char === '"') {
                this.consumeString();
            } else if (this.isOperatorStart(char)) {
                this.consumeOperator();
            } else if (/[(){};,.]/.test(char)) {
                this.consumePunctuation();
            } else {
                this.error(`Unexpected character '${char}'`);
            }
        }
        this.addToken(TokenType.EOF, '', this.line, this.col);
        return this.tokens;
    }

    peek(n = 0) {
        if (this.pos + n >= this.input.length) return null;
        return this.input[this.pos + n];
    }

    consumeWhitespace() {
        const char = this.input[this.pos];
        if (char === '\n') {
            this.line++;
            this.col = 1;
        } else {
            this.col++;
        }
        this.pos++;
    }

    consumeComment() {
        if (this.peek(1) === '/') {
            // Single line comment
            while (this.peek() !== '\n' && this.peek() !== null) {
                this.pos++;
            }
        } else {
            // Block comment (not strictly required but good to have)
            this.pos += 2;
            this.col += 2;
            while (!(this.peek() === '*' && this.peek(1) === '/') && this.peek() !== null) {
                if (this.peek() === '\n') {
                    this.line++;
                    this.col = 1;
                } else {
                    this.col++;
                }
                this.pos++;
            }
            if (this.peek() !== null) {
                this.pos += 2;
                this.col += 2;
            }
        }
    }

    consumeIdentifier() {
        let start = this.pos;
        let startCol = this.col;
        while (/[a-zA-Z0-9_]/.test(this.peek())) {
            this.advance();
        }
        const value = this.input.substring(start, this.pos);
        const type = this.keywords.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;

        // Special case for System.out.println which is treated as a keyword in this subset
        if (value === 'System' && this.peek() === '.') {
            // We'll handle this in parser, keeps lexer simple. 'System' is IDENTIFIER unless in keyword list.
            // Actually, prompt says System.out.println is built-in.
            // Let's keep it as Identifier/Keyword. Parser will validate.
        }

        this.addToken(type, value, this.line, startCol);
    }

    consumeNumber() {
        let start = this.pos;
        let startCol = this.col;
        while (/[0-9]/.test(this.peek())) {
            this.advance();
        }
        const value = this.input.substring(start, this.pos);
        this.addToken(TokenType.NUMBER, value, this.line, startCol);
    }

    consumeString() {
        let startCol = this.col;
        this.advance(); // Skip opening quote
        let start = this.pos;
        while (this.peek() !== '"' && this.peek() !== null) {
            if (this.peek() === '\n') this.error("Unterminated string literal");
            this.advance();
        }
        if (this.peek() === null) this.error("Unterminated string literal");

        const value = this.input.substring(start, this.pos);
        this.advance(); // Skip closing quote
        this.addToken(TokenType.STRING, value, this.line, startCol);
    }

    consumeOperator() {
        let startCol = this.col;
        const c = this.peek();
        const next = this.peek(1);

        // Two-char operators: == != <= >= && ||
        if ((c === '=' && next === '=') ||
            (c === '!' && next === '=') ||
            (c === '<' && next === '=') ||
            (c === '>' && next === '=') ||
            (c === '&' && next === '&') ||
            (c === '|' && next === '|')) {
            this.addToken(TokenType.OPERATOR, c + next, this.line, startCol);
            this.advance(2);
        } else {
            this.addToken(TokenType.OPERATOR, c, this.line, startCol);
            this.advance();
        }
    }

    consumePunctuation() {
        this.addToken(TokenType.PUNCTUATION, this.peek(), this.line, this.col);
        this.advance();
    }

    isOperatorStart(c) {
        return "+-*/<>=!&|".includes(c);
    }

    addToken(type, value, line, col) {
        this.tokens.push(new Token(type, value, line, col));
    }

    advance(n = 1) {
        this.pos += n;
        this.col += n;
    }

    error(msg) {
        throw new Error(`Lexer Error: ${msg} at line ${this.line}, col ${this.col}`);
    }
}

// ==========================================
// 2. PARSER (AST Generator)
// ==========================================

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const statements = [];
        while (!this.isAtEnd()) {
            statements.push(this.statement());
        }
        return { type: 'Program', body: statements };
    }

    statement() {
        if (this.match(TokenType.KEYWORD, 'int') ||
            this.match(TokenType.KEYWORD, 'boolean') ||
            this.match(TokenType.KEYWORD, 'String')) {
            return this.varDeclaration();
        }
        if (this.match(TokenType.KEYWORD, 'if')) return this.ifStatement();
        if (this.match(TokenType.KEYWORD, 'while')) return this.whileStatement();
        if (this.match(TokenType.KEYWORD, 'for')) return this.forStatement();
        if (this.check(TokenType.PUNCTUATION, '{')) return this.block();
        if (this.check(TokenType.IDENTIFIER)) {
            // Could be System.out.println or Assignment
            if (this.tokens[this.current].value === 'System') {
                return this.printStatement();
            }
            return this.assignment();
        }

        this.error("Expected statement");
    }

    varDeclaration() {
        const typeToken = this.previous();
        const nameToken = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        let initializer = null;

        if (this.match(TokenType.OPERATOR, '=')) {
            initializer = this.expression();
        }

        this.consume(TokenType.PUNCTUATION, ';', "Expected ';' after variable declaration");
        return { type: 'VarDecl', varType: typeToken.value, name: nameToken.value, initializer, line: nameToken.line };
    }

    assignment() {
        const nameToken = this.consume(TokenType.IDENTIFIER, "Expected identifier");
        this.consume(TokenType.OPERATOR, '=', "Expected '=' assignment");
        const value = this.expression();
        this.consume(TokenType.PUNCTUATION, ';', "Expected ';' after assignment");
        return { type: 'Assignment', name: nameToken.value, value, line: nameToken.line };
    }

    ifStatement() {
        this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after 'if'");
        const condition = this.expression();
        this.consume(TokenType.PUNCTUATION, ')', "Expected ')' after condition");
        const thenBranch = this.statement();
        let elseBranch = null;
        if (this.match(TokenType.KEYWORD, 'else')) {
            elseBranch = this.statement();
        }
        return { type: 'IfStmt', condition, thenBranch, elseBranch };
    }

    whileStatement() {
        this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after 'while'");
        const condition = this.expression();
        this.consume(TokenType.PUNCTUATION, ')', "Expected ')' after condition");
        const body = this.statement();
        return { type: 'WhileStmt', condition, body };
    }

    forStatement() {
        this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after 'for'");

        let init = null;
        if (!this.match(TokenType.PUNCTUATION, ';')) {
            if (this.check(TokenType.KEYWORD, 'int')) { // valid for for-loop init
                this.advance(); // consume int
                init = this.varDeclaration(); // this consumes ;
            } else {
                init = this.assignment(); // this consumes ;
            }
        }

        let condition = null;
        if (!this.check(TokenType.PUNCTUATION, ';')) {
            condition = this.expression();
        }
        this.consume(TokenType.PUNCTUATION, ';', "Expected ';' after loop condition");

        let update = null;
        if (!this.check(TokenType.PUNCTUATION, ')')) {
            // Update is usually an assignment or increment. 
            // Our assignment() consumes ';', but for loop update part doesn't have ';'.
            // Special handling: parse Assignment but don't expect ';'
            const nameToken = this.consume(TokenType.IDENTIFIER, "Expected identifier");
            this.consume(TokenType.OPERATOR, '=', "Expected '=' assignment");
            const val = this.expression();
            update = { type: 'Assignment', name: nameToken.value, value: val, line: nameToken.line };
        }
        this.consume(TokenType.PUNCTUATION, ')', "Expected ')' after for clauses");

        const body = this.statement();

        return { type: 'ForStmt', init, condition, update, body };
    }

    block() {
        this.consume(TokenType.PUNCTUATION, '{', "Expected '{'");
        const statements = [];
        while (!this.check(TokenType.PUNCTUATION, '}') && !this.isAtEnd()) {
            statements.push(this.statement());
        }
        this.consume(TokenType.PUNCTUATION, '}', "Expected '}'");
        return { type: 'Block', body: statements };
    }

    printStatement() {
        this.advance(); // consume System
        this.consume(TokenType.PUNCTUATION, '.', "Expected '.'");
        this.consume(TokenType.KEYWORD, 'out', "Expected 'out'"); // treated as keyword in Lexer set
        this.consume(TokenType.PUNCTUATION, '.', "Expected '.'");
        this.consume(TokenType.KEYWORD, 'println', "Expected 'println'");
        this.consume(TokenType.PUNCTUATION, '(', "Expected '('");
        const expression = this.expression();
        this.consume(TokenType.PUNCTUATION, ')', "Expected ')'");
        this.consume(TokenType.PUNCTUATION, ';', "Expected ';'");
        return { type: 'PrintStmt', expression };
    }

    // Expressions (Precedence: ||, &&, == !=, < >, + -, * /, !)

    expression() { return this.logicOr(); }

    logicOr() {
        let expr = this.logicAnd();
        while (this.match(TokenType.OPERATOR, '||')) {
            const right = this.logicAnd();
            expr = { type: 'BinaryExpr', operator: '||', left: expr, right };
        }
        return expr;
    }

    logicAnd() {
        let expr = this.equality();
        while (this.match(TokenType.OPERATOR, '&&')) {
            const right = this.equality();
            expr = { type: 'BinaryExpr', operator: '&&', left: expr, right };
        }
        return expr;
    }

    equality() {
        let expr = this.relational();
        while (this.match(TokenType.OPERATOR, '==') || this.match(TokenType.OPERATOR, '!=')) {
            const operator = this.previous().value;
            const right = this.relational();
            expr = { type: 'BinaryExpr', operator, left: expr, right };
        }
        return expr;
    }

    relational() {
        let expr = this.additive();
        while (this.match(TokenType.OPERATOR, '<') || this.match(TokenType.OPERATOR, '>') ||
            this.match(TokenType.OPERATOR, '<=') || this.match(TokenType.OPERATOR, '>=')) {
            const operator = this.previous().value;
            const right = this.additive();
            expr = { type: 'BinaryExpr', operator, left: expr, right };
        }
        return expr;
    }

    additive() {
        let expr = this.multiplicative();
        while (this.match(TokenType.OPERATOR, '+') || this.match(TokenType.OPERATOR, '-')) {
            const operator = this.previous().value;
            const right = this.multiplicative();
            expr = { type: 'BinaryExpr', operator, left: expr, right };
        }
        return expr;
    }

    multiplicative() {
        let expr = this.unary();
        while (this.match(TokenType.OPERATOR, '*') || this.match(TokenType.OPERATOR, '/')) {
            const operator = this.previous().value;
            const right = this.unary();
            expr = { type: 'BinaryExpr', operator, left: expr, right };
        }
        return expr;
    }

    unary() {
        if (this.match(TokenType.OPERATOR, '!') || this.match(TokenType.OPERATOR, '-')) {
            const operator = this.previous().value;
            const right = this.unary();
            return { type: 'UnaryExpr', operator, right };
        }
        return this.primary();
    }

    primary() {
        if (this.match(TokenType.KEYWORD, 'true')) return { type: 'Literal', value: true, dataType: 'boolean' };
        if (this.match(TokenType.KEYWORD, 'false')) return { type: 'Literal', value: false, dataType: 'boolean' };
        if (this.match(TokenType.NUMBER)) return { type: 'Literal', value: parseInt(this.previous().value), dataType: 'int' };
        if (this.match(TokenType.STRING)) return { type: 'Literal', value: this.previous().value, dataType: 'String' };
        if (this.match(TokenType.IDENTIFIER)) return { type: 'Variable', name: this.previous().value };

        if (this.match(TokenType.PUNCTUATION, '(')) {
            const expr = this.expression();
            this.consume(TokenType.PUNCTUATION, ')', "Expected ')'");
            return expr;
        }

        this.error("Expected expression");
    }

    match(type, value) {
        if (this.check(type, value)) {
            this.advance();
            return true;
        }
        return false;
    }

    check(type, value) {
        if (this.isAtEnd()) return false;
        const t = this.tokens[this.current];
        if (value !== undefined) {
            return t.type === type && t.value === value;
        }
        return t.type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    consume(type, valueOrMsg, msg) {
        // Overload: consume(type, msg) or consume(type, value, msg)
        let expectedValue = null;
        let message = valueOrMsg;

        if (typeof msg === 'string') {
            expectedValue = valueOrMsg;
            message = msg;
        }

        if (this.check(type, expectedValue)) {
            return this.advance();
        }
        this.error(message);
    }

    isAtEnd() {
        return this.tokens[this.current].type === TokenType.EOF;
    }

    error(msg) {
        const token = this.tokens[this.current];
        throw new Error(`Parser Error: ${msg} at line ${token.line}`);
    }
}

// ==========================================
// 3. SEMANTIC ANALYZER
// ==========================================

class SemanticAnalyzer {
    constructor() {
        this.scopes = []; // Stack of Maps { name: { type, line } }
    }

    analyze(ast) {
        this.scopes = [new Map()]; // Global scope
        try {
            this.visit(ast);
            return null; // No error
        } catch (e) {
            return e.message;
        }
    }

    visit(node) {
        switch (node.type) {
            case 'Program':
            case 'Block':
                node.body.forEach(stmt => this.visit(stmt));
                break;
            case 'VarDecl':
                this.visitVarDecl(node);
                break;
            case 'Assignment':
                this.visitAssignment(node);
                break;
            case 'IfStmt':
                this.visitExpression(node.condition, 'boolean');
                this.visit(node.thenBranch);
                if (node.elseBranch) this.visit(node.elseBranch);
                break;
            case 'WhileStmt':
                this.visitExpression(node.condition, 'boolean');
                this.visit(node.body);
                break;
            case 'ForStmt':
                this.enterScope();
                if (node.init) this.visit(node.init);
                if (node.condition) this.visitExpression(node.condition, 'boolean');
                if (node.update) this.visit(node.update);
                this.visit(node.body);
                this.exitScope();
                break;
            case 'PrintStmt':
                this.getExpressionType(node.expression); // Just check it's valid
                break;
            case 'ExpressionStmt':
                this.getExpressionType(node.expression);
                break;
        }
    }

    visitVarDecl(node) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (currentScope.has(node.name)) {
            this.error(`Variable '${node.name}' already declared in this scope`, node.line);
        }

        if (node.initializer) {
            const initType = this.getExpressionType(node.initializer);
            if (initType !== node.varType) {
                this.error(`Type mismatch: cannot assign ${initType} to ${node.varType}`, node.line);
            }
        }

        currentScope.set(node.name, { type: node.varType, line: node.line });
    }

    visitAssignment(node) {
        const symbol = this.resolve(node.name);
        if (!symbol) {
            this.error(`Variable '${node.name}' not declared`, node.line);
        }

        const valueType = this.getExpressionType(node.value);
        if (valueType !== symbol.type) {
            this.error(`Type mismatch: cannot assign ${valueType} to ${symbol.type}`, node.line);
        }
    }

    visitExpression(node, expectedType) {
        const type = this.getExpressionType(node);
        if (expectedType && type !== expectedType) {
            this.error(`Expected expression of type ${expectedType} but got ${type}`);
        }
    }

    getExpressionType(node) {
        if (node.type === 'Literal') return node.dataType;
        if (node.type === 'Variable') {
            const symbol = this.resolve(node.name);
            if (!symbol) this.error(`Variable '${node.name}' not declared`);
            return symbol.type;
        }
        if (node.type === 'BinaryExpr') {
            const left = this.getExpressionType(node.left);
            const right = this.getExpressionType(node.right);

            if (['+', '-', '*', '/'].includes(node.operator)) {
                if (left === 'int' && right === 'int') return 'int';
                if (node.operator === '+' && (left === 'String' || right === 'String')) return 'String';
                this.error(`Invalid operands for ${node.operator}: ${left}, ${right}`);
            }
            if (['<', '>', '<=', '>='].includes(node.operator)) {
                if (left === 'int' && right === 'int') return 'boolean';
                this.error(`Invalid operands for ${node.operator}: ${left}, ${right}`);
            }
            if (['&&', '||'].includes(node.operator)) {
                if (left === 'boolean' && right === 'boolean') return 'boolean';
                this.error(`Invalid operands for ${node.operator}: ${left}, ${right}`);
            }
            if (['==', '!='].includes(node.operator)) {
                if (left === right) return 'boolean';
                this.error(`Type mismatch in evaluation: ${left} ${node.operator} ${right}`);
            }
        }
        if (node.type === 'UnaryExpr') {
            const right = this.getExpressionType(node.right);
            if (node.operator === '!' && right === 'boolean') return 'boolean';
            if (node.operator === '-' && right === 'int') return 'int';
            this.error(`Invalid unary operator ${node.operator} for type ${right}`);
        }
        return 'void';
    }

    resolve(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) return this.scopes[i].get(name);
        }
        return null;
    }

    enterScope() { this.scopes.push(new Map()); }
    exitScope() { this.scopes.pop(); }

    error(msg, line) {
        throw new Error(`Semantic Error: ${msg} ${line ? 'at line ' + line : ''}`);
    }
}

// ==========================================
// 4. INTERPRETER (Execution Engine)
// ==========================================

class Interpreter {
    constructor(ast, uiHandlers) {
        this.ast = ast;
        this.ui = uiHandlers;
        this.scopes = [new Map()]; // Runtime memory
        this.running = false;
    }

    *startExecution() {
        this.running = true;
        this.ui.log("Execution started...", "system");

        try {
            yield* this.executeBlock(this.ast.body);
        } catch (e) {
            this.ui.log(e.message, "error");
        }

        this.ui.log("Execution finished.", "system");
        this.running = false;
        yield { type: 'DONE' };
    }

    *executeBlock(statements) {
        for (const stmt of statements) {
            if (!this.running) return;
            yield* this.execute(stmt);
        }
    }

    *execute(node) {
        yield { type: 'STEP', line: node.line || 0, memory: this.getMemorySnapshot() };

        switch (node.type) {
            case 'VarDecl':
                let value = null;
                if (node.initializer) {
                    value = this.evaluate(node.initializer);
                }
                // default values
                if (value === null) {
                    if (node.varType === 'int') value = 0;
                    if (node.varType === 'boolean') value = false;
                    if (node.varType === 'String') value = "";
                }
                this.define(node.name, value);
                break;

            case 'Assignment':
                const val = this.evaluate(node.value);
                this.assign(node.name, val);
                break;

            case 'IfStmt':
                if (this.evaluate(node.condition)) {
                    yield* this.execute(node.thenBranch);
                } else if (node.elseBranch) {
                    yield* this.execute(node.elseBranch);
                }
                break;

            case 'WhileStmt':
                while (this.evaluate(node.condition)) {
                    yield* this.execute(node.body);
                }
                break;

            case 'ForStmt':
                // For loop needs its own scope for init
                this.enterScope();
                if (node.init) {
                    if (node.init.type === 'VarDecl') {
                        // VarDecl logic but inside checking scope? 
                        // Actually execute(VarDecl) handles defining in current scope.
                        yield* this.execute(node.init);
                    } else {
                        yield* this.execute(node.init);
                    }
                }
                while (true) {
                    if (node.condition) {
                        if (!this.evaluate(node.condition)) break;
                    }
                    yield* this.execute(node.body);
                    if (node.update) {
                        // Update is usually an assignment expression, but stored as stmt in parser 
                        // or special assignment object.
                        // Parser saves it as Assignment.
                        // Assignment is a stmt in our execute switch, so we can yield* execute(update)
                        // Wait, Parser stores update as: { type: 'Assignment', ... }
                        // So calling execute(node.update) works.
                        yield* this.execute(node.update);
                    }
                }
                this.exitScope();
                break;

            case 'Block':
                this.enterScope();
                yield* this.executeBlock(node.body);
                this.exitScope();
                break;

            case 'PrintStmt':
                const output = this.evaluate(node.expression);
                this.ui.log(output, "log");
                break;
        }
    }

    evaluate(node) {
        if (node.type === 'Literal') return node.value;
        if (node.type === 'Variable') return this.lookup(node.name);
        if (node.type === 'UnaryExpr') {
            const right = this.evaluate(node.right);
            if (node.operator === '-') return -right;
            if (node.operator === '!') return !right;
        }
        if (node.type === 'BinaryExpr') {
            const left = this.evaluate(node.left);
            const right = this.evaluate(node.right);

            switch (node.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return Math.floor(left / right); // Integer division for simplicity
                case '<': return left < right;
                case '>': return left > right;
                case '<=': return left <= right;
                case '>=': return left >= right;
                case '==': return left === right;
                case '!=': return left !== right;
                case '&&': return left && right;
                case '||': return left || right;
            }
        }
        throw new Error(`Runtime Error: Unknown expression type ${node.type}`);
    }

    define(name, value) {
        this.scopes[this.scopes.length - 1].set(name, value);
    }

    assign(name, value) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                this.scopes[i].set(name, value);
                return;
            }
        }
        throw new Error(`Runtime Error: Undefined variable '${name}'`);
    }

    lookup(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) return this.scopes[i].get(name);
        }
        throw new Error(`Runtime Error: Undefined variable '${name}'`);
    }

    enterScope() { this.scopes.push(new Map()); }
    exitScope() { this.scopes.pop(); }

    getMemorySnapshot() {
        // Flatten scopes for display
        const snapshot = [];
        this.scopes.forEach((scope, index) => {
            scope.forEach((value, key) => {
                snapshot.push({ name: key, value, scopeIndex: index });
            });
        });
        return snapshot;
    }
}

// ==========================================
// 5. UI CONTROLLER
// ==========================================

const Editor = {
    init() {
        this.input = document.getElementById('code-input');
        this.display = document.getElementById('code-content');
        this.input.addEventListener('input', () => this.update());
        this.input.addEventListener('scroll', () => this.syncScroll());
        this.input.value = `int a = 5;
int b = 10;
if (a < b) {
    System.out.println("Hello JavaLite!");
}`;
        this.update();
    },

    update() {
        const text = this.input.value;
        // Simple escape for now, syntax highlighting will come from Lexer later
        this.display.innerHTML = text.replace(/</g, '&lt;');
        this.updateLineNumbers();
    },

    syncScroll() {
        document.getElementById('code-display').scrollTop = this.input.scrollTop;
    },

    updateLineNumbers() {
        const lines = this.input.value.split('\n').length;
        document.getElementById('line-numbers').innerHTML =
            Array(lines).fill(0).map((_, i) => i + 1).join('<br>');
    }
};

const App = {
    init() {
        Editor.init();

        document.getElementById('btn-run').addEventListener('click', () => this.run());

        // Tab system
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                e.target.classList.add('active');
                document.getElementById(`tab-${e.target.dataset.tab}`).classList.add('active');
            });
        });

        console.log("JavaLiteJS Initialized");
    },

    run() {
        const code = document.getElementById('code-input').value;
        // Placeholder run
        document.getElementById('console-output').innerHTML +=
            `<div class="console-line log">Running simulation (stub)...</div>`;
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
