export class TerminalApp {
    constructor(kernel, container) {
        this.kernel = kernel;
        this.container = container;
    }

    init() {
        this.output = document.createElement("div");
        this.input = document.createElement("input");

        this.input.style.width = "100%";

        this.container.appendChild(this.output);
        this.container.appendChild(this.input);

        this.input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.execute(this.input.value);
                this.input.value = "";
            }
        });

        this.print("DevOS Terminal Ready");
    }

    execute(command) {
        const args = command.split(" ");
        const cmd = args[0];

        switch(cmd) {
            case "ls":
                this.print(this.kernel.fs.list().join("\n"));
                break;

            case "touch":
                this.kernel.fs.createFile(args[1]);
                this.print("File created");
                break;

            case "ps":
                const list = this.kernel.pm.listProcesses();
                this.print(JSON.stringify(list, null, 2));
                break;

            case "run":
                const process = this.kernel.pm.createProcess(args[1] || "app");
                this.print(`Process ${process.pid} started`);
                break;

            case "kill":
                this.kernel.pm.killProcess(parseInt(args[1]));
                this.print("Process killed");
                break;

            case "clear":
                this.output.innerHTML = "";
                break;

            default:
                this.print("Unknown command");
        }
    }

    print(text) {
        this.output.innerHTML += `<div>${text}</div>`;
    }
}