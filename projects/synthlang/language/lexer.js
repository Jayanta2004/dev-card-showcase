export class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
    }

    tokenize() {
        const tokens = [];
        const regex = /\s*(=>|==|!=|[A-Za-z_]\w*|\d+|[()+\-*/=;])/g;
        let match;

        while ((match = regex.exec(this.input)) !== null) {
            tokens.push(match[1]);
        }

        return tokens;
    }
}