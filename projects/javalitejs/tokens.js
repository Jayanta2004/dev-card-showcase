/**
 * JavaLiteJS - Token Definitions
 */

const TokenType = {
    // Keywords
    KEYWORD: 'KEYWORD',

    // Literals
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',

    // Operators
    OPERATOR: 'OPERATOR', // + - * / = == != < > <= >= && || !

    // Punctuation
    PUNCTUATION: 'PUNCTUATION', // { } ( ) ; , .

    // Special
    EOF: 'EOF'
};

class Token {
    constructor(type, value, line, col) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.col = col;
    }

    toString() {
        return `${this.type}(${this.value}) @ ${this.line}:${this.col}`;
    }
}
