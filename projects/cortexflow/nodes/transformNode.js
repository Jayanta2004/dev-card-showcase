import { Node } from "../ui/node.js";

export class TransformNode extends Node {
    constructor() {
        super("Transform", 250, 200, async (input) => {
            return input * 3;
        });
    }
}