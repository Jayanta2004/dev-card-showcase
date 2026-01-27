/**
 * JavaLiteJS - Parser Module
 */

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.errorReporter = window.ErrorSystem;
    }

    parse() {
        this.current = 0;
        let statements = [];

        // Check for "public class ..." (Optional Boilerplate)
        let insideClass = false;
        let insideMain = false;

        if (this.match(TokenType.KEYWORD, 'public') || this.check(TokenType.KEYWORD, 'class')) {
            // Likely standard Java structure
            if (this.previous().value === 'public') {
                this.consume(TokenType.KEYWORD, 'class', "Expected 'class' after 'public'");
            } else {
                this.match(TokenType.KEYWORD, 'class');
            }

            this.consume(TokenType.IDENTIFIER, "Expected class name");
            this.consume(TokenType.PUNCTUATION, '{', "Expected '{' after class name");
            insideClass = true;

            // Check for main method: public static void main...
            this.consume(TokenType.KEYWORD, 'public', "Expected 'public' modifier for main method");
            this.consume(TokenType.KEYWORD, 'static', "Expected 'static' modifier for main method");
            this.consume(TokenType.KEYWORD, 'void', "Expected 'void' return type");
            this.consume(TokenType.KEYWORD, 'main', "Expected 'main' method name");

            this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after main");
            // String[] args
            this.consume(TokenType.KEYWORD, 'String', "Expected 'String' type for args");
            this.consume(TokenType.PUNCTUATION, '[', "Expected '[' for array");
            this.consume(TokenType.PUNCTUATION, ']', "Expected ']' for array");
            this.consume(TokenType.IDENTIFIER, "Expected 'args' identifier");
            this.consume(TokenType.PUNCTUATION, ')', "Expected ')' after args");

            this.consume(TokenType.PUNCTUATION, '{', "Expected '{' to start main method");
            insideMain = true;
        }

        while (!this.isAtEnd()) {
            // Stop if we hit the closing braces of class/main
            if (insideMain && this.check(TokenType.PUNCTUATION, '}')) {
                break;
            }

            try {
                const stmt = this.statement();
                if (stmt) statements.push(stmt);
            } catch (error) {
                this.synchronize();
            }
        }

        if (insideMain) {
            this.consume(TokenType.PUNCTUATION, '}', "Expected '}' to close main method");
            if (insideClass) {
                this.consume(TokenType.PUNCTUATION, '}', "Expected '}' to close class");
            }
        }

        return { type: 'Program', body: statements };
    }

    // --- Statements ---

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
            if (this.tokens[this.current].value === 'System') {
                return this.printStatement();
            }
            return this.assignment();
        }

        // Error handling
        const token = this.peek();
        this.error(token, `Unexpected token: ${token.value}`);
        this.advance(); // consume to avoid inf loop if error throws
        return null;
    }

    varDeclaration() {
        const typeToken = this.previous();
        const nameToken = this.consume(TokenType.IDENTIFIER, "Expected variable name");
        let initializer = null;

        if (this.match(TokenType.OPERATOR, '=')) {
            initializer = this.expression();
        }

        this.consume(TokenType.PUNCTUATION, ';', "Expected ';' after variable declaration");
        return {
            type: 'VarDecl',
            varType: typeToken.value,
            name: nameToken.value,
            initializer,
            line: nameToken.line
        };
    }

    assignment() {
        const nameToken = this.consume(TokenType.IDENTIFIER, "Expected identifier");
        this.consume(TokenType.OPERATOR, '=', "Expected '=' assignment");
        const value = this.expression();
        this.consume(TokenType.PUNCTUATION, ';', "Expected ';' after assignment");
        return {
            type: 'Assignment',
            name: nameToken.value,
            value,
            line: nameToken.line
        };
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
        return { type: 'IfStmt', condition, thenBranch, elseBranch, line: this.previous().line };
    }

    whileStatement() {
        this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after 'while'");
        const condition = this.expression();
        this.consume(TokenType.PUNCTUATION, ')', "Expected ')' after condition");
        const body = this.statement();
        return { type: 'WhileStmt', condition, body, line: this.previous().line };
    }

    forStatement() {
        this.consume(TokenType.PUNCTUATION, '(', "Expected '(' after 'for'");

        let init = null;
        if (!this.match(TokenType.PUNCTUATION, ';')) {
            if (this.check(TokenType.KEYWORD, 'int')) {
                this.advance();
                init = this.varDeclaration();
            } else {
                init = this.assignment();
            }
        }

        let condition = null;
        if (!this.check(TokenType.PUNCTUATION, ';')) {
            condition = this.expression();
        }
        this.consume(TokenType.PUNCTUATION, ';', "Expected ';' after loop condition");

        let update = null;
        if (!this.check(TokenType.PUNCTUATION, ')')) {
            const nameToken = this.consume(TokenType.IDENTIFIER, "Expected identifier");
            this.consume(TokenType.OPERATOR, '=', "Expected '='");
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
        this.advance(); // System
        this.consume(TokenType.PUNCTUATION, '.', "Expected '.'");
        this.consume(TokenType.KEYWORD, 'out', "Expected 'out'");
        this.consume(TokenType.PUNCTUATION, '.', "Expected '.'");
        this.consume(TokenType.KEYWORD, 'println', "Expected 'println'");
        this.consume(TokenType.PUNCTUATION, '(', "Expected '('");
        const expression = this.expression();
        this.consume(TokenType.PUNCTUATION, ')', "Expected ')'");
        this.consume(TokenType.PUNCTUATION, ';', "Expected ';'");
        return { type: 'PrintStmt', expression };
    }

    // --- Expressions ---

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

        if (this.match(TokenType.IDENTIFIER)) return { type: 'Variable', name: this.previous().value, line: this.previous().line };

        if (this.match(TokenType.PUNCTUATION, '(')) {
            const expr = this.expression();
            this.consume(TokenType.PUNCTUATION, ')', "Expected ')'");
            return expr;
        }

        throw this.error(this.peek(), "Expected expression");
    }

    // --- Helpers ---

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
        if (value !== undefined) return t.type === type && t.value === value;
        return t.type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    previous() { return this.tokens[this.current - 1]; }
    peek() { return this.tokens[this.current]; }

    consume(type, msgOrExpected, errorDetails) {
        // Overload handling
        let expectedValue = null;
        let errorMessage = msgOrExpected;

        if (this.check(type, msgOrExpected)) {
            // If called as consume(TYPE, "value", "msg")
            return this.advance();
        } else if (arguments.length === 2 && typeof msgOrExpected === 'string' && !this.check(type)) {
            // Called as consume(TYPE, "Msg")
            // Check if it matched type but we failed above? No, check() handles type only if value undefined
        }

        // If we passed specific value to check
        if (errorDetails) {
            // consume(TYPE, "value", "Message")
            if (this.check(type, msgOrExpected)) {
                return this.advance();
            }
            errorMessage = errorDetails;
            expectedValue = msgOrExpected;
        }

        if (this.check(type, expectedValue)) {
            return this.advance();
        }

        const actual = this.peek();
        const actualDesc = actual.type === TokenType.EOF ? "end of file" : `'${actual.value}'`;

        // Enhance message
        if (!errorMessage) {
            errorMessage = `Expected ${type}`;
            if (expectedValue) errorMessage += ` '${expectedValue}'`;
        }

        throw this.error(this.peek(), `${errorMessage}. Found ${actualDesc}`);
    }

    isAtEnd() { return this.tokens[this.current].type === TokenType.EOF; }

    error(token, message) {
        this.errorReporter.error(token.line, message, "Syntax");
        return new Error(message); // Throw to unwind
    }

    synchronize() {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().value === ';') return;

            const v = this.peek().value;
            if (['if', 'for', 'while', 'int', 'boolean', 'String', 'System'].includes(v)) {
                return;
            }
            this.advance();
        }
    }
}
