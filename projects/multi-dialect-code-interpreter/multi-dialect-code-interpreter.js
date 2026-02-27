// multi-dialect-code-interpreter.js

let pyodide = null;
let originalConsoleLog = console.log;

async function initPyodide() {
    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
    });
    console.log("Pyodide loaded");
}

initPyodide();

function runCode() {
    const language = document.getElementById('languageSelect').value;
    const code = document.getElementById('codeInput').value;
    const output = document.getElementById('output');

    output.innerHTML = '<p>Running...</p>';

    if (language === 'javascript') {
        runJavaScript(code);
    } else if (language === 'python') {
        runPython(code);
    } else {
        runMock(language, code);
    }
}

function runJavaScript(code) {
    const output = document.getElementById('output');
    let logs = [];

    // Override console.log
    console.log = function(...args) {
        logs.push(args.join(' '));
    };

    try {
        eval(code);
        output.innerHTML = logs.length > 0 ? logs.map(log => `<p>${log}</p>`).join('') : '<p>No output</p>';
    } catch (error) {
        output.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    } finally {
        console.log = originalConsoleLog;
    }
}

async function runPython(code) {
    const output = document.getElementById('output');

    if (!pyodide) {
        output.innerHTML = '<p>Pyodide not loaded yet. Please wait...</p>';
        return;
    }

    try {
        // Capture stdout
        pyodide.runPython(`
import sys
from io import StringIO
old_stdout = sys.stdout
sys.stdout = captured_output = StringIO()
        `);

        pyodide.runPython(code);

        const result = pyodide.runPython(`
output = captured_output.getvalue()
sys.stdout = old_stdout
output
        `);

        output.innerHTML = result ? `<p>${result.replace(/\n/g, '<br>')}</p>` : '<p>No output</p>';
    } catch (error) {
        output.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function runMock(language, code) {
    const output = document.getElementById('output');
    setTimeout(() => {
        output.innerHTML = `
            <p>Interpreting ${language} code...</p>
            <p>Code length: ${code.length} characters</p>
            <p>Lines: ${code.split('\n').length}</p>
            <p><em>Note: Real execution for ${language} is not supported in browser. This is a mock interpretation.</em></p>
        `;
    }, 1000);
}

function clearOutput() {
    document.getElementById('output').innerHTML = '<p>Output will appear here...</p>';
}

// Initialize with example code
document.getElementById('languageSelect').addEventListener('change', function() {
    const lang = this.value;
    const input = document.getElementById('codeInput');

    if (lang === 'javascript') {
        input.value = `// Example JavaScript
console.log("Hello, World!");
for (let i = 0; i < 3; i++) {
    console.log("Count: " + i);
}`;
    } else if (lang === 'python') {
        input.value = `# Example Python
print("Hello, World!")
for i in range(3):
    print(f"Count: {i}")`;
    } else if (lang === 'java') {
        input.value = `// Example Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        for (int i = 0; i < 3; i++) {
            System.out.println("Count: " + i);
        }
    }
}`;
    } else {
        input.value = `// Example ${lang} code
// This is a mock example
print "Hello, World!"
for i in 0..2
    puts "Count: #{i}"
end`;
    }
});