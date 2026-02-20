/**
 * @fileoverview Command Pattern implementation for FourierDraw.
 * Enables undo/redo functionality for drawing paths and configuration changes.
 */

export class CommandManager {
    constructor() {
        /** @type {Command[]} */
        this.undoStack = [];
        /** @type {Command[]} */
        this.redoStack = [];
    }

    /**
     * Executes a command and adds it to the undo stack.
     * @param {Command} command 
     */
    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = []; // Clear redo stack on new action

        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
    }

    /**
     * Undoes the last command.
     */
    undo() {
        if (this.undoStack.length === 0) return;
        const command = this.undoStack.pop();
        command.undo();
        this.redoStack.push(command);
    }

    /**
     * Redoes the last undone command.
     */
    redo() {
        if (this.redoStack.length === 0) return;
        const command = this.redoStack.pop();
        command.execute();
        this.undoStack.push(command);
    }

    /**
     * Clears all command history.
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}

/**
 * Interface for commands.
 * @interface
 */
export class Command {
    execute() { throw new Error('Method execute() must be implemented'); }
    undo() { throw new Error('Method undo() must be implemented'); }
}

/**
 * Command for path creation.
 */
export class DrawPathCommand extends Command {
    /**
     * @param {Object} appState - Reference to the application state manager.
     * @param {Object} pathData - Data of the path to draw.
     */
    constructor(appState, pathData) {
        super();
        this.appState = appState;
        this.pathData = pathData;
    }

    execute() {
        this.appState.addPath(this.pathData);
    }

    undo() {
        this.appState.removeLastPath();
    }
}
