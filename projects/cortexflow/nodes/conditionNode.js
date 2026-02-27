import { Node } from "../ui/node.js";

export class ConditionNode extends Node {
    constructor() {
        super("Condition", 200, 200, async (input) => {
            if (parseInt(input) > 10) {
                return input;
            } else {
                alert("Condition failed");
                return null;
            }
        });
    }
}