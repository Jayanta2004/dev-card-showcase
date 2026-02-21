import { Node } from "../ui/node.js";

export class InputNode extends Node {
    constructor() {
        super("Input", 100, 100, async () => {
            return 5;
        });
    }
}