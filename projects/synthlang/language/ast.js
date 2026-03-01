export class Program {
    constructor(body) {
        this.body = body;
    }
}

export class VariableDeclaration {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

export class PrintStatement {
    constructor(expression) {
        this.expression = expression;
    }
}

export class BinaryExpression {
    constructor(left, operator, right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class Literal {
    constructor(value) {
        this.value = value;
    }
}

export class Identifier {
    constructor(name) {
        this.name = name;
    }
}