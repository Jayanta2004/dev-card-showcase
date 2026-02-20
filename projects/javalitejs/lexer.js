/**
 * JavaLiteJS - Lexer Module
 */

class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.tokens = [];
        this.errorReporter = window.ErrorSystem;

        this.keywords = new Set([
            'int', 'boolean', 'String', 'if', 'else', 'while', 'for',
            'true', 'false',
            'class', 'public', 'static', 'void', 'main', 'return'
        ]);

        // System.out.println support hack: we treat them as individual identifiers/keywords in parser,
        // but lexer separates them.
    }

    tokenize() {
        this.errorReporter.clear();
        this.tokens = [];
        this.pos = 0;
        this.line = 1;
        this.col = 1;

        while (this.pos < this.input.length) {
            const char = this.peek();

            // Whitespace
            if (/\s/.test(char)) {
                this.consumeWhitespace();
                continue;
            }

            // Comments
            if (char === '/' && (this.peek(1) === '/' || this.peek(1) === '*')) {
                this.consumeComment();
                continue;
            }

            // Identifiers / Keywords
            if (/[a-zA-Z_]/.test(char)) {
                this.consumeIdentifier();
                continue;
            }

            // Numbers
            if (/[0-9]/.test(char)) {
                this.consumeNumber();
                continue;
            }

            // Strings
            if (char === '"') {
                this.consumeString();
                continue;
            }

            // Punctuation
            if (/[(){};,.\[\]]/.test(char)) {
                this.addToken(TokenType.PUNCTUATION, char);
                this.advance();
                continue;
            }

            // Operators (Multi-char check)
            if (this.isOperatorStart(char)) {
                this.consumeOperator();
                continue;
            }

            // Unknown
            this.errorReporter.error(this.line, `Unexpected character '${char}'`, "Syntax");
            this.advance();
        }

        this.addToken(TokenType.EOF, '');
        return this.tokens;
    }

    peek(n = 0) {
        if (this.pos + n >= this.input.length) return null;
        return this.input[this.pos + n];
    }

    advance(n = 1) {
        for (let i = 0; i < n; i++) {
            if (this.pos >= this.input.length) break;
            const char = this.input[this.pos];
            if (char === '\n') {
                this.line++;
                this.col = 1;
            } else {
                this.col++;
            }
            this.pos++;
        }
    }

    consumeWhitespace() {
        this.advance(); // Logic inside advance handles line++
    }

    consumeComment() {
        if (this.peek(1) === '/') {
            // Single line //
            while (this.peek() !== '\n' && this.peek() !== null) {
                this.advance(); // Just consume chars
            }
        } else {
            // Block /* */
            this.advance(2); // Skip /*
            while (!(this.peek() === '*' && this.peek(1) === '/') && this.peek() !== null) {
                this.advance();
            }
            if (this.peek() !== null) this.advance(2); // Skip */
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

        // Literal Booleans
        if (value === 'true' || value === 'false') {
            // We can treat them as Keywords or Boolean Literals. 
            // Let's call them KEYWORD here, Parser converts to Literal.
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
        this.advance(); // Open quote

        let start = this.pos;
        while (this.peek() !== '"' && this.peek() !== null) {
            if (this.peek() === '\n') {
                this.errorReporter.error(this.line, "Unterminated string literal", "Syntax");
                break;
            }
            this.advance();
        }

        const value = this.input.substring(start, this.pos);

        if (this.peek() === '"') {
            this.advance(); // Close quote
            this.addToken(TokenType.STRING, value, this.line, startCol);
        }
    }

    consumeOperator() {
        let startCol = this.col;
        const c = this.peek();
        const next = this.peek(1);

        // 2-char operators
        const twoChar = c + (next || '');
        if (['==', '!=', '<=', '>=', '&&', '||'].includes(twoChar)) {
            this.addToken(TokenType.OPERATOR, twoChar, this.line, startCol);
            this.advance(2);
            return;
        }

        this.addToken(TokenType.OPERATOR, c, this.line, startCol);
        this.advance();
    }

    isOperatorStart(c) {
        return "+-*/<>=!&|".includes(c);
    }

    addToken(type, value, line = this.line, col = this.col) {
        this.tokens.push(new Token(type, value, line, col));
    }
}
