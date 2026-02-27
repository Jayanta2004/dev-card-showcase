export class Scope {
    constructor() {
        this.variables = {};
    }

    set(name, value) {
        this.variables[name] = value;
    }

    get(name) {
        if (!(name in this.variables)) {
            throw new Error("Undefined variable: " + name);
        }
        return this.variables[name];
    }
}