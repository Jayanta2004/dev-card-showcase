import { FileSystem } from "./filesystem.js";
import { ProcessManager } from "./process.js";
import { Scheduler } from "./scheduler.js";

export class Kernel {
    constructor() {
        this.fs = new FileSystem();
        this.pm = new ProcessManager();
        this.scheduler = new Scheduler(this.pm);

        this.scheduler.start();
    }
}