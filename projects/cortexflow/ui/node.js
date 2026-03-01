let idCounter = 0;

export class Node {
    constructor(type, x, y, logic) {
        this.id = idCounter++;
        this.type = type;
        this.x = x;
        this.y = y;
        this.logic = logic;
    }

    async run(input) {
        return this.logic(input);
    }
}