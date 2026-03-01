import { Node } from "../ui/node.js";

export class LogNode extends Node {
    constructor() {
        super("Log", 400, 300, async (input) => {
            console.log("Final:", input);
            return input;
        });
    }
}