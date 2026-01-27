/**
 * JavaLiteJS - Error Handling Module
 */

class CompilerError extends Error {
    constructor(message, line, col, type = "Error") {
        super(message);
        this.line = line;
        this.col = col;
        this.type = type; // "Syntax", "Semantic", "Runtime"
    }

    toString() {
        return `[${this.type}] Line ${this.line}: ${this.message}`;
    }
}

class ErrorReporter {
    constructor() {
        this.errors = [];
    }

    error(line, message, type = "Error") {
        const err = new CompilerError(message, line, 0, type);
        this.errors.push(err);
        return err;
    }

    hasErrors() {
        // We only care about errors, not warnings for halting compilation
        return this.errors.some(e => e.type !== "Warning");
    }

    clear() {
        this.errors = [];
    }

    getErrors() {
        return this.errors;
    }
}

// Global instance or passed around
window.ErrorSystem = new ErrorReporter();
