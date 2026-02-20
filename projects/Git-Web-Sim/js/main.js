/**
 * GIT-WEB-SIM MAIN CONTROLLER
 * ===========================
 * Entry point for the application.
 * - Initializes the Git Engine.
 * - Binds UI events (Tabs, Editor, File Explorer).
 * - Coordinates updates between components.
 */

class App {
    constructor() {
        // Systems
        this.repo = new GitRepo();
        
        // UI Controllers
        this.graphViz = null;
        this.terminal = null;
        
        // State
        this.currentFile = null;
        
        // DOM Cache
        this.dom = {
            fileTree: document.getElementById('file-tree'),
            stageTree: document.getElementById('staging-tree'),
            editorInput: document.getElementById('code-input'),
            lineNumbers: document.getElementById('line-numbers'),
            currentFilename: document.getElementById('current-filename'),
            statusBranch: document.getElementById('status-branch'),
            statusHead: document.getElementById('status-head'),
            diffContainer: document.getElementById('diff-output'),
            objList: document.getElementById('object-list')
        };
        
        this.init();
    }

    init() {
        // 1. Initialize Repo
        const initMsg = this.repo.init();
        
        // 2. Initialize Subsystems
        this.graphViz = new GraphVisualizer('dag-canvas', this.repo);
        this.terminal = new TerminalController(this.repo, () => this.refreshUI());
        
        // Print welcome
        this.terminal.print(initMsg, 'success');
        this.terminal.print("Tip: Create a new file or edit README.md to start.", 'system');

        // 3. Bind Events
        this.bindTabs();
        this.bindEditor();
        this.bindExplorerActions();
        
        // 4. Initial Render
        this.refreshUI();
    }

    /**
     * Central update loop called after any Git command.
     */
    refreshUI() {
        this.renderFileTree();
        this.renderStaging();
        this.renderStatus();
        this.graphViz.draw(); // Redraw DAG
        this.updateDiff(); // If diff tab active
        this.renderObjectList();
    }

    // =========================================
    // UI RENDERING
    // =========================================

    renderStatus() {
        const branch = this.repo.currentBranchName();
        this.dom.statusBranch.innerText = branch;
        
        const head = this.repo.resolveRef('HEAD');
        this.dom.statusHead.innerText = head ? head.substring(0, 7) : ' (empty)';
    }

    renderFileTree() {
        const container = this.dom.fileTree;
        container.innerHTML = '';
        
        // Iterate Working Directory
        const files = Array.from(this.repo.workingDir.keys()).sort();
        
        if (files.length === 0) {
            container.innerHTML = '<div class="empty-state">No files</div>';
            return;
        }

        const status = this.repo.status();

        files.forEach(path => {
            const el = document.createElement('div');
            el.className = 'tree-item';
            
            // Icon
            const icon = document.createElement('i');
            icon.className = 'ri-file-text-line';
            
            // Status Check
            if (status.modified.includes(path)) {
                el.classList.add('modified');
                icon.className = 'ri-file-edit-line';
            } else if (status.untracked.includes(path)) {
                el.classList.add('untracked'); // Custom style needed
                icon.className = 'ri-file-add-line';
            }

            el.appendChild(icon);
            el.appendChild(document.createTextNode(path));
            
            // Click to Open
            el.onclick = () => this.openFile(path);
            
            container.appendChild(el);
        });
    }

    renderStaging() {
        const container = this.dom.stageTree;
        container.innerHTML = '';
        
        const entries = Array.from(this.repo.index.entries.values());
        document.getElementById('stage-count').innerText = entries.length;

        if (entries.length === 0) {
            container.innerHTML = '<div class="empty-state-text">No changes staged</div>';
            return;
        }

        entries.forEach(entry => {
            const el = document.createElement('div');
            el.className = 'tree-item staged';
            el.innerHTML = `<i class="ri-check-double-line"></i> ${entry.path}`;
            container.appendChild(el);
        });
    }

    renderObjectList() {
        const list = this.dom.objList;
        list.innerHTML = '';
        // In real app, we'd paginate. Here just show top 20
        let count = 0;
        this.repo.objects.forEach((obj, oid) => {
            if (count++ > 20) return;
            const li = document.createElement('li');
            li.innerText = `${oid.substring(0,7)} (${obj.type})`;
            li.onclick = () => {
                document.getElementById('obj-detail-content').innerText = JSON.stringify(obj, null, 2);
            };
            list.appendChild(li);
        });
        document.getElementById('obj-count').innerText = `${this.repo.objects.size} Objects`;
    }

    // =========================================
    // EDITOR LOGIC
    // =========================================

    openFile(path) {
        this.currentFile = path;
        this.dom.currentFilename.innerText = path;
        
        const content = this.repo.workingDir.get(path);
        this.dom.editorInput.value = content;
        
        // Show Editor Tab
        document.querySelector('[data-target="editor-view"]').click();
        this.updateLineNumbers();
    }

    saveFile() {
        if (!this.currentFile) return;
        
        const newContent = this.dom.editorInput.value;
        this.repo.workingDir.set(this.currentFile, newContent);
        
        this.terminal.print(`Saved '${this.currentFile}' to working directory.`, 'system');
        this.refreshUI();
    }

    updateLineNumbers() {
        const lines = this.dom.editorInput.value.split('\n').length;
        this.dom.lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => `<span>${i+1}</span>`).join('');
    }

    updateDiff() {
        // If we are in Diff View, calculate diff of current file or all?
        // Simplified: Show diff for the currently selected file in Editor vs Index
        if (!this.currentFile) {
             this.dom.diffContainer.innerHTML = '<div class="placeholder-msg">Select a file to see diff</div>';
             return;
        }
        
        // Get diff from working dir to index
        // We need a helper in Repo for this: getDiff(path)
        // Let's implement a quick one here leveraging what we know
        const wdContent = this.repo.workingDir.get(this.currentFile) || "";
        
        // Find index content
        const entry = this.repo.index.get(this.currentFile);
        let indexContent = "";
        if (entry) {
            const blob = this.repo.objects.get(entry.oid);
            if (blob) indexContent = blob.content;
        } else {
            // New file, compare against empty
        }

        const diffs = new DiffEngine().compute(indexContent, wdContent);
        this.dom.diffContainer.innerHTML = DiffEngine.toHTML(diffs);
    }

    // =========================================
    // EVENT BINDING
    // =========================================

    bindTabs() {
        const tabs = document.querySelectorAll('.tab-item');
        const panels = document.querySelectorAll('.view-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all
                tabs.forEach(t => t.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                // Activate clicked
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
                
                // Specific Refresh
                if (targetId === 'graph-view') this.graphViz.resize();
                if (targetId === 'diff-view') this.updateDiff();
            });
        });
    }

    bindEditor() {
        // Save Button
        document.getElementById('btn-save').addEventListener('click', () => this.saveFile());
        
        // Line Numbers Sync
        this.dom.editorInput.addEventListener('input', () => this.updateLineNumbers());
        this.dom.editorInput.addEventListener('scroll', () => {
            this.dom.lineNumbers.scrollTop = this.dom.editorInput.scrollTop;
        });
    }

    bindExplorerActions() {
        // New File (Simple Prompt)
        document.getElementById('btn-new-file').addEventListener('click', () => {
            const name = prompt("Enter filename (e.g., style.css):");
            if (name) {
                this.repo.workingDir.set(name, "");
                this.refreshUI();
                this.openFile(name);
                this.terminal.print(`Created '${name}'`, 'system');
            }
        });

        // Nuke Repo
        document.getElementById('btn-nuke-repo').addEventListener('click', () => {
            if(confirm("Are you sure? This will delete all history.")) {
                this.init();
            }
        });
        
        // Zoom Controls
        document.getElementById('zoom-in').onclick = () => { this.graphViz.scale += 0.1; this.graphViz.draw(); };
        document.getElementById('zoom-out').onclick = () => { this.graphViz.scale = Math.max(0.1, this.graphViz.scale - 0.1); this.graphViz.draw(); };
        document.getElementById('zoom-reset').onclick = () => { this.graphViz.scale = 1; this.graphViz.offsetX = 0; this.graphViz.offsetY = 0; this.graphViz.draw(); };
    }
}

// Start App when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});