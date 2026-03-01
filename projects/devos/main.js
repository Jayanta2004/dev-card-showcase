import { createWindow } from "./ui/windowManager.js";
import { initTaskbar } from "./ui/taskbar.js";
import { TerminalApp } from "./apps/terminal.js";
import { SystemMonitor } from "./apps/systemMonitor.js";
import { FileExplorer } from "./apps/fileExplorer.js";
import { Kernel } from "./core/kernel.js";

const kernel = new Kernel();
initTaskbar();

function launchTerminal() {
    const win = createWindow("Terminal");
    const terminal = new TerminalApp(kernel, win.content);
    terminal.init();
}

function launchMonitor() {
    const win = createWindow("System Monitor");
    const monitor = new SystemMonitor(kernel, win.content);
    monitor.init();
}

function launchExplorer() {
    const win = createWindow("File Explorer");
    const explorer = new FileExplorer(kernel, win.content);
    explorer.init();
}

launchTerminal();
launchMonitor();
launchExplorer();