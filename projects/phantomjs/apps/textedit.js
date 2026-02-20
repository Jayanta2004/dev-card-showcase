class TextEditApp {
    constructor(container, winId) {
        this.container = container;
        this.container.innerHTML = `
            <div class="app-textedit">
                <div class="te-toolbar">
                    <button>SAVE</button>
                    <button>LOAD</button>
                    <button>EXECUTE</button>
                </div>
                <textarea class="te-area" spellcheck="false">// HACKER SCRIPT v1.0
// Enter payload here...

function inject() {
    return true;
}</textarea>
            </div>
        `;
    }
}

window.TextEditApp = TextEditApp;
