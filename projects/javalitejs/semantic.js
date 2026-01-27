/**
 * JavaLiteJS - Semantic Analysis Module
 */

class SemanticAnalyzer {
    constructor() {
        this.scopes = [];
        this.errorReporter = window.ErrorSystem;
    }

    analyze(ast) {
        this.scopes = [new Map()]; // Global scope reset
        try {
            this.visit(ast);
        } catch (e) {
            // Errors are caught inside usually, but if robust failure happens
            console.error(e);
        }
    }

    visit(node) {
        if (!node) return;
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
                this.checkType(node.condition, 'boolean', node.line);
                this.visit(node.thenBranch);
                if (node.elseBranch) this.visit(node.elseBranch);
                break;
            case 'WhileStmt':
                this.checkType(node.condition, 'boolean', node.line);
                this.visit(node.body);
                break;
            case 'ForStmt':
                this.enterScope();
                if (node.init) this.visit(node.init);
                if (node.condition) this.checkType(node.condition, 'boolean', node.line);
                if (node.update) this.visit(node.update);
                this.visit(node.body);
                this.exitScope();
                break;
            case 'PrintStmt':
                this.getExpressionType(node.expression);
                break;
            case 'ExpressionStmt':
                this.getExpressionType(node.expression);
                break;
        }
    }

    visitVarDecl(node) {
        const currentScope = this.scopes[this.scopes.length - 1];
        if (currentScope.has(node.name)) {
            this.error(node.line, `Variable '${node.name}' is already defined in this scope.`);
        }

        // Track initialization state
        let isInitialized = false;
        if (node.initializer) {
            const initType = this.getExpressionType(node.initializer);
            if (initType !== node.varType) {
                this.error(node.line, `Type mismatch: Cannot assign '${initType}' to '${node.varType}' variable.`);
            }
            isInitialized = true;
        }

        currentScope.set(node.name, {
            type: node.varType,
            line: node.line,
            initialized: isInitialized
        });
    }

    visitAssignment(node) {
        const symbol = this.resolve(node.name);
        if (!symbol) {
            this.error(node.line, `Variable '${node.name}' cannot be resolved.`);
            return;
        }

        const valueType = this.getExpressionType(node.value);
        if (valueType !== symbol.type) {
            this.error(node.line, `Type mismatch: Cannot assign '${valueType}' to '${symbol.type}' variable '${node.name}'.`);
        }

        // Mark as initialized upon assignment
        // Note: In real Java, flow analysis determines this.
        // Here we do a simple check: if assigned, it's initialized for subsequent static checks.
        symbol.initialized = true;
    }

    checkType(node, expectedType, line) {
        const type = this.getExpressionType(node);
        if (type !== expectedType) {
            this.error(line || 0, `Expected expression of type '${expectedType}' but found '${type}'.`);
        }
    }

    getExpressionType(node) {
        if (node.type === 'Literal') return node.dataType;

        if (node.type === 'Variable') {
            const symbol = this.resolve(node.name);
            if (!symbol) {
                this.error(node.line, `Variable '${node.name}' cannot be resolved.`);
                return 'unknown';
            }
            if (!symbol.initialized) {
                this.error(node.line, `Variable '${node.name}' might not have been initialized.`);
            }
            return symbol.type;
        }

        if (node.type === 'BinaryExpr') {
            const left = this.getExpressionType(node.left);
            const right = this.getExpressionType(node.right);

            // Arithmetic
            if (['+', '-', '*', '/'].includes(node.operator)) {
                if (left === 'int' && right === 'int') return 'int';
                if (node.operator === '+' && (left === 'String' || right === 'String')) return 'String';

                // Allow "String" + int etc.
                this.error(0, `Operator '${node.operator}' not defined for types '${left}', '${right}'.`);
                return 'unknown';
            }

            // Relational
            if (['<', '>', '<=', '>='].includes(node.operator)) {
                if (left === 'int' && right === 'int') return 'boolean';
                this.error(0, `Operator '${node.operator}' not defined for types '${left}', '${right}'.`);
                return 'unknown';
            }

            // Logical
            if (['&&', '||'].includes(node.operator)) {
                if (left === 'boolean' && right === 'boolean') return 'boolean';
                this.error(0, `Operator '${node.operator}' not defined for types '${left}', '${right}'.`);
                return 'unknown';
            }

            // Equality
            if (['==', '!='].includes(node.operator)) {
                if (left === right) return 'boolean';
                this.error(0, `Operator '${node.operator}' cannot be applied to '${left}', '${right}'.`);
                return 'unknown';
            }
        }

        if (node.type === 'UnaryExpr') {
            const right = this.getExpressionType(node.right);
            if (node.operator === '!' && right === 'boolean') return 'boolean';
            if (node.operator === '-' && right === 'int') return 'int';
            this.error(0, `Operator '${node.operator}' not defined for type '${right}'.`);
            return 'unknown';
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

    error(line, msg) {
        this.errorReporter.error(line, msg, "Semantic");
    }
}
