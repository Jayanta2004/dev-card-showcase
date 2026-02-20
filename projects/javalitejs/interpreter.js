/**
 * JavaLiteJS - Interpreter Module
 */

class Interpreter {
    constructor(ast, uiHandlers) {
        this.ast = ast;
        this.ui = uiHandlers; // { log: fn }
        this.scopes = [new Map()];
        this.running = false;
        this.steps = 0;
        this.MAX_STEPS = 10000; // Infinite loop guard
    }

    *startExecution() {
        this.running = true;
        this.steps = 0;
        this.ui.log("Execution started...", "system");

        try {
            yield* this.executeBlock(this.ast.body);
        } catch (e) {
            this.ui.log(`Runtime Error: ${e.message}`, "error");
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
        this.verifySteps();

        // Yield step info
        yield { type: 'STEP', line: node.line || 0, memory: this.getMemorySnapshot() };

        switch (node.type) {
            case 'VarDecl':
                let value = null;
                if (node.initializer) {
                    value = this.evaluate(node.initializer);
                }
                // Default values if null
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
                    this.verifySteps();
                    yield* this.execute(node.body);
                }
                break;

            case 'ForStmt':
                this.enterScope();
                if (node.init) {
                    // Init can be VarDecl or Assignment. 
                    if (node.init.type === 'VarDecl' || node.init.type === 'Assignment') {
                        yield* this.execute(node.init);
                    }
                }
                while (true) {
                    this.verifySteps();
                    if (node.condition) {
                        if (!this.evaluate(node.condition)) break;
                    }
                    yield* this.execute(node.body);
                    if (node.update) {
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
                case '+': return left + right; // JS handles int/string mixed addition naturally
                case '-': return left - right;
                case '*': return left * right;
                case '/':
                    if (right === 0) throw new Error("Division by zero");
                    return Math.floor(left / right); // Integer division
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
        throw new Error(`Unknown expression type ${node.type}`);
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
        throw new Error(`Variable '${name}' undefined at runtime.`);
    }

    lookup(name) {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) return this.scopes[i].get(name);
        }
        throw new Error(`Variable '${name}' undefined at runtime.`);
    }

    enterScope() { this.scopes.push(new Map()); }
    exitScope() { this.scopes.pop(); }

    verifySteps() {
        this.steps++;
        if (this.steps > this.MAX_STEPS) {
            throw new Error("Execution limit exceeded (Infinite Loop detected?)");
        }
    }

    getMemorySnapshot() {
        const snapshot = [];
        this.scopes.forEach((scope, index) => {
            scope.forEach((value, key) => {
                // Determine rough type for display
                let type = 'unknown';
                if (typeof value === 'number') type = 'int';
                if (typeof value === 'boolean') type = 'boolean';
                if (typeof value === 'string') type = 'String';

                snapshot.push({ name: key, value, type, scopeIndex: index });
            });
        });
        return snapshot;
    }
}
