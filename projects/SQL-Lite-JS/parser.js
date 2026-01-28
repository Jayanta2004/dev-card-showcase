/**
 * SQL-LITE COMPILER (LEXER & PARSER)
 * Transforms raw SQL strings into an Abstract Syntax Tree (AST).
 * Implements a recursive descent parser strategy.
 * @author saiusesgithub
 */

/* =========================================
   1. TOKEN TYPES & CONSTANTS
   ========================================= */
const TokenType = {
    KEYWORD: 'KEYWORD',
    IDENTIFIER: 'ID',
    LITERAL: 'LITERAL', // 'string' or 123
    OPERATOR: 'OP',     // =, >, <
    SEPARATOR: 'SEP',   // , ; ( )
    WILDCARD: 'STAR',   // *
    EOF: 'EOF'
};

const KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 
    'CREATE', 'TABLE', 'DROP', 'DELETE', 'UPDATE', 'SET', 
    'AND', 'OR', 'LIMIT', 'ORDER', 'BY', 'INT', 'TEXT', 'BOOL'
]);

/* =========================================
   2. LEXER (TOKENIZER)
   ========================================= */
class Lexer {
    constructor(input) {
        this.input = input;
        this.pos = 0;
        this.char = this.input[0];
    }

    nextToken() {
        this._skipWhitespace();

        if (this.pos >= this.input.length) {
            return { type: TokenType.EOF, value: null };
        }

        if (this._isAlpha(this.char)) {
            return this._readWord();
        }

        if (this._isDigit(this.char)) {
            return this._readNumber();
        }

        if (this.char === "'") {
            return this._readString();
        }

        if (this.char === '*') {
            this._advance();
            return { type: TokenType.WILDCARD, value: '*' };
        }

        if (',;()'.includes(this.char)) {
            const val = this.char;
            this._advance();
            return { type: TokenType.SEPARATOR, value: val };
        }

        if ('=><!'.includes(this.char)) {
            return this._readOperator();
        }

        throw new Error(`Unexpected character: '${this.char}' at position ${this.pos}`);
    }

    _advance() {
        this.pos++;
        this.char = this.pos < this.input.length ? this.input[this.pos] : null;
    }

    _skipWhitespace() {
        while (this.char && /\s/.test(this.char)) {
            this._advance();
        }
    }

    _readWord() {
        let result = '';
        while (this.char && (this._isAlpha(this.char) || this._isDigit(this.char) || this.char === '_')) {
            result += this.char;
            this._advance();
        }
        
        const upper = result.toUpperCase();
        if (KEYWORDS.has(upper)) {
            return { type: TokenType.KEYWORD, value: upper };
        }
        return { type: TokenType.IDENTIFIER, value: result };
    }

    _readNumber() {
        let result = '';
        while (this.char && this._isDigit(this.char)) {
            result += this.char;
            this._advance();
        }
        return { type: TokenType.LITERAL, value: Number(result) };
    }

    _readString() {
        this._advance(); // Skip opening quote
        let result = '';
        while (this.char && this.char !== "'") {
            result += this.char;
            this._advance();
        }
        this._advance(); // Skip closing quote
        return { type: TokenType.LITERAL, value: result };
    }

    _readOperator() {
        let op = this.char;
        this._advance();
        if (this.char && '=<>'.includes(this.char)) {
            op += this.char;
            this._advance();
        }
        return { type: TokenType.OPERATOR, value: op };
    }

    _isAlpha(c) { return /[a-zA-Z]/.test(c); }
    _isDigit(c) { return /[0-9]/.test(c); }
}

/* =========================================
   3. PARSER (SYNTAX ANALYZER)
   ========================================= */
class Parser {
    constructor(input) {
        this.lexer = new Lexer(input);
        this.currentToken = this.lexer.nextToken();
    }

    _eat(type) {
        if (this.currentToken.type === type) {
            this.currentToken = this.lexer.nextToken();
        } else {
            throw new Error(`Syntax Error: Expected ${type}, got ${this.currentToken.type}`);
        }
    }

    parse() {
        if (this.currentToken.type === TokenType.KEYWORD) {
            switch (this.currentToken.value) {
                case 'SELECT': return this._parseSelect();
                case 'INSERT': return this._parseInsert();
                case 'CREATE': return this._parseCreate();
                case 'DELETE': return this._parseDelete();
                default: throw new Error(`Unknown command: ${this.currentToken.value}`);
            }
        }
        return null;
    }

    /**
     * Parsing: SELECT col1, col2 FROM table WHERE ...
     */
    _parseSelect() {
        this._eat(TokenType.KEYWORD); // SELECT
        
        const columns = [];
        if (this.currentToken.type === TokenType.WILDCARD) {
            this._eat(TokenType.WILDCARD);
            columns.push('*');
        } else {
            while (true) {
                columns.push(this.currentToken.value);
                this._eat(TokenType.IDENTIFIER);
                if (this.currentToken.value === ',') {
                    this._eat(TokenType.SEPARATOR);
                } else {
                    break;
                }
            }
        }

        this._eat(TokenType.KEYWORD); // FROM (Assumed)
        const table = this.currentToken.value;
        this._eat(TokenType.IDENTIFIER);

        let where = null;
        if (this.currentToken.value === 'WHERE') {
            this._eat(TokenType.KEYWORD);
            where = this._parseCondition();
        }

        return { type: 'SELECT', table, columns, where };
    }

    /**
     * Parsing: INSERT INTO table (c1, c2) VALUES (v1, v2)
     */
    _parseInsert() {
        this._eat(TokenType.KEYWORD); // INSERT
        this._eat(TokenType.KEYWORD); // INTO
        
        const table = this.currentToken.value;
        this._eat(TokenType.IDENTIFIER);

        // Optional columns
        let columns = [];
        if (this.currentToken.value === '(') {
            this._eat(TokenType.SEPARATOR);
            while (this.currentToken.value !== ')') {
                columns.push(this.currentToken.value);
                this._eat(TokenType.IDENTIFIER);
                if (this.currentToken.value === ',') this._eat(TokenType.SEPARATOR);
            }
            this._eat(TokenType.SEPARATOR); // )
        }

        this._eat(TokenType.KEYWORD); // VALUES
        this._eat(TokenType.SEPARATOR); // (

        const values = [];
        while (this.currentToken.value !== ')') {
            values.push(this.currentToken.value);
            // Accept LITERAL or Identifier
            if (this.currentToken.type === TokenType.LITERAL || this.currentToken.type === TokenType.IDENTIFIER) {
                this._eat(this.currentToken.type);
            }
            if (this.currentToken.value === ',') this._eat(TokenType.SEPARATOR);
        }
        this._eat(TokenType.SEPARATOR); // )

        return { type: 'INSERT', table, columns, values };
    }

    /**
     * Parsing: CREATE TABLE name (col type, ...)
     */
    _parseCreate() {
        this._eat(TokenType.KEYWORD); // CREATE
        this._eat(TokenType.KEYWORD); // TABLE
        
        const table = this.currentToken.value;
        this._eat(TokenType.IDENTIFIER);
        this._eat(TokenType.SEPARATOR); // (

        const schema = {};
        while (this.currentToken.value !== ')') {
            const colName = this.currentToken.value;
            this._eat(TokenType.IDENTIFIER);
            const colType = this.currentToken.value;
            this._eat(TokenType.KEYWORD); // INT, TEXT
            
            schema[colName] = colType;

            if (this.currentToken.value === ',') this._eat(TokenType.SEPARATOR);
        }
        this._eat(TokenType.SEPARATOR); // )

        return { type: 'CREATE', table, schema };
    }

    /**
     * Parsing Binary Expressions: col > 5
     */
    _parseCondition() {
        const left = this.currentToken.value;
        this._eat(TokenType.IDENTIFIER);
        
        const op = this.currentToken.value;
        this._eat(TokenType.OPERATOR);
        
        const right = this.currentToken.value;
        // Right side can be literal or number
        if (this.currentToken.type === TokenType.LITERAL) {
            this._eat(TokenType.LITERAL);
        } else {
            this._eat(TokenType.IDENTIFIER);
        }

        return { left, op, right };
    }
    
    // Stub for DELETE
    _parseDelete() {
        this._eat(TokenType.KEYWORD); // DELETE
        this._eat(TokenType.KEYWORD); // FROM
        const table = this.currentToken.value;
        this._eat(TokenType.IDENTIFIER);
        
        let where = null;
        if (this.currentToken.value === 'WHERE') {
            this._eat(TokenType.KEYWORD);
            where = this._parseCondition();
        }
        return { type: 'DELETE', table, where };
    }
}

window.SQLParser = Parser;