export class FileSystem {
    constructor() {
        this.files = {
            "/": {}
        };
    }

    createFile(path, content="") {
        this.files[path] = content;
    }

    readFile(path) {
        return this.files[path] || "File not found";
    }

    list() {
        return Object.keys(this.files);
    }
}