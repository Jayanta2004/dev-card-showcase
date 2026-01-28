/**
 * JavaLiteJS - Main App Controller
 */

const App = {
    interpreter: null,
    gen: null,

    init() {
        UI.init();
        this.bindEvents();
        console.log("JavaLiteJS v2.0 Started");

        // Load default example
        this.loadExample('hello');
    },

    bindEvents() {
        document.getElementById('btn-run').addEventListener('click', () => this.run());
        document.getElementById('btn-step').addEventListener('click', () => this.step());
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
        document.getElementById('btn-clear-console').addEventListener('click', () => UI.clearConsole());

        document.getElementById('example-selector').addEventListener('change', (e) => this.loadExample(e.target.value));

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Find parent container
                const container = btn.closest('.panel');
                // Deactivate all in this container
                container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                container.querySelectorAll('.panel-content > div').forEach(d => d.classList.remove('active'));

                // Activate clicked
                btn.classList.add('active');
                const targetId = btn.getAttribute('data-target');

                // Special mapping for IDs
                if (['console', 'problems'].includes(targetId)) {
                    document.getElementById(`output-${targetId}`).classList.add('active');
                } else if (['memory', 'ast'].includes(targetId)) {
                    document.getElementById(`view-${targetId}`).classList.add('active');
                }
            });
        });

        // Modal
        const modal = document.getElementById('guide-modal');
        document.getElementById('btn-guide').addEventListener('click', () => modal.classList.remove('hidden'));
        document.getElementById('close-guide').addEventListener('click', () => modal.classList.add('hidden'));
        modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.classList.add('hidden'));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') this.run();
            if (e.key === 'F10') this.step();
        });
    },

    compile() {
        const input = document.getElementById('code-input').value;
        UI.setStatus('Compiling...', 'working');

        // 1. Lexer
        const lexer = new Lexer(input);
        const tokens = lexer.tokenize();

        if (window.ErrorSystem.hasErrors()) {
            this.handleErrors();
            return null;
        }

        // 2. Parser
        const parser = new Parser(tokens);
        const ast = parser.parse();

        if (window.ErrorSystem.hasErrors()) {
            this.handleErrors();
            return null;
        }

        UI.renderAST(ast);

        // 3. Semantics
        const semantics = new SemanticAnalyzer();
        semantics.analyze(ast);

        if (window.ErrorSystem.hasErrors()) {
            this.handleErrors();
            return null;
        }

        UI.setStatus('Ready');
        return ast;
    },

    handleErrors() {
        UI.setStatus('Compilation Failed', '');
        UI.showProblems(window.ErrorSystem.getErrors());
    },

    run() {
        this.reset();
        const ast = this.compile();
        if (!ast) return;

        UI.log("Build Success. Running...", "success");

        this.interpreter = new Interpreter(ast, {
            log: (msg, type) => UI.log(msg, type)
        });

        this.gen = this.interpreter.startExecution();

        // Disable Run, Enable Step
        document.getElementById('btn-step').disabled = false;

        // Auto-Run loop
        this.autoStep();
    },

    autoStep() {
        if (!this.gen) return;
        const res = this.gen.next();

        if (!res.done) {
            if (res.value && res.value.type === 'STEP') {
                UI.renderMemory(res.value.memory);
                UI.highlightExecutionLine(res.value.line);
                // Delay for visual effect
                setTimeout(() => this.autoStep(), 15);
            } else {
                setTimeout(() => this.autoStep(), 0);
            }
        } else {
            this.finishExecution();
        }
    },

    step() {
        if (!this.gen) {
            // If starting fresh via Step
            this.reset();
            const ast = this.compile();
            if (!ast) return;

            this.interpreter = new Interpreter(ast, {
                log: (msg, type) => UI.log(msg, type)
            });
            this.gen = this.interpreter.startExecution();
            document.getElementById('btn-step').disabled = false;
        }

        const res = this.gen.next();

        if (res.done) {
            this.finishExecution();
        } else if (res.value && res.value.type === 'STEP') {
            UI.renderMemory(res.value.memory);
            UI.highlightExecutionLine(res.value.line);
        }
    },

    finishExecution() {
        this.gen = null;
        document.getElementById('btn-step').disabled = true;
        UI.highlightExecutionLine(-1); // Remove highlight
        UI.setStatus('Finished');
    },

    reset() {
        this.interpreter = null;
        this.gen = null;
        document.getElementById('btn-step').disabled = true;
        UI.clearConsole();
        UI.renderMemory([]);
        UI.highlightExecutionLine(-1);
        window.ErrorSystem.clear();
        UI.setStatus('Ready');
    },

    loadExample(key) {
        const examples = {
            hello: `public class Main {
    public static void main(String[] args) {
        // Simple Hello World
        int a = 42;
        String msg = "Hello World";

        System.out.println(msg);
        System.out.println("Answer is: " + a);
    }
}`,

            loop: `public class Main {
    public static void main(String[] args) {
        // Calculate Factorial
        int n = 6;
        int result = 1;

        while (n > 0) {
            result = result * n;
            n = n - 1;
        }

        System.out.println("Factorial of 6 is: " + result);
    }
}`,

            logic: `public class Main {
    public static void main(String[] args) {
        // Logic Checks
        int age = 17;
        boolean hasID = true;

        if (age >= 18) {
            System.out.println("Access Granted");
        } else {
            if (hasID) {
                System.out.println("Underage but has ID");
            } else {
                System.out.println("Access Denied");
            }
        }
    }
}`,

            fibonacci: `public class Main {
    public static void main(String[] args) {
        // First 10 Fibonacci numbers
        int n1 = 0;
        int n2 = 1;
        int count = 10;

        System.out.println(n1);
        System.out.println(n2);

        for (int i = 2; i < count; i = i + 1) {
            int n3 = n1 + n2;
            System.out.println(n3);
            n1 = n2;
            n2 = n3;
        }
    }
}`,

            errors: `public class Main {
    public static void main(String[] args) {
        // Error Demonstration
        int x = 10;
        boolean y = true;

        // Type Mismatch
        int z = x + y; 

        // Undefined Variable
        System.out.println(unknownVar);
        
        // Missing Semicolon
        int k = 5
    }
}`
        };

        if (examples[key]) {
            document.getElementById('code-input').value = examples[key];
            UI.updateEditor();
        }
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
