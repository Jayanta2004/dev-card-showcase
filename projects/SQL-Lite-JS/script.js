/**
 * SQL-LITE IDE CONTROLLER
 * Manages the Code Editor, Results Grid, and Sidebar Tree.
 * Handles the "Synthetic Syntax Highlighting" overlay logic.
 * @author saiusesgithub
 */

class DBController {
    constructor() {
        this.editor = document.getElementById('sql-input');
        this.highlighter = document.getElementById('code-highlight');
        this.engine = window.SQLEngine;
        this.storage = window.Storage;
        
        this.init();
    }

    init() {
        this.storage.init(); // Mount Virtual Disk
        this.refreshSidebar();
        this.bindEvents();
        this.setupEditor();
        
        // Initial "Hello World" Query
        if (!this.editor.value) {
            this.editor.value = "-- Welcome to SQL-Lite-JS\n-- Try creating a table:\n\nCREATE TABLE users (id INT, name TEXT, age INT);\nINSERT INTO users VALUES (1, 'Alice', 25);\nSELECT * FROM users;";
            this.updateHighlight();
        }
    }

    bindEvents() {
        // Run Button
        document.getElementById('btn-run').onclick = () => this.runQuery();
        
        // Ctrl+Enter Shortcut
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') this.runQuery();
        });

        // Nuke Button
        document.getElementById('btn-nuke').onclick = () => {
            if(confirm("Are you sure? This wipes the virtual disk.")) {
                this.storage.nuke();
                this.refreshSidebar();
                this.logToConsole("Disk formatted.", "system");
            }
        };

        // Create Table Modal
        document.getElementById('btn-create-table').onclick = () => {
            document.getElementById('modal-create').classList.remove('hidden');
        };

        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.onclick = () => document.getElementById('modal-create').classList.add('hidden');
        });

        document.getElementById('btn-add-col').onclick = () => this.addModalColumn();
        document.getElementById('btn-submit-table').onclick = () => this.handleCreateTable();

        // Tabs
        document.querySelectorAll('.res-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.res-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`view-${tab.dataset.target}`).classList.add('active');
            };
        });
    }

    setupEditor() {
        // Sync scroll and text for highlighting
        this.editor.oninput = () => this.updateHighlight();
        this.editor.onscroll = () => {
            this.highlighter.parentElement.scrollTop = this.editor.scrollTop;
            this.highlighter.parentElement.scrollLeft = this.editor.scrollLeft;
            this.updateLineNumbers();
        };
    }

    updateHighlight() {
        let text = this.editor.value;
        
        // Simple Regex Highlighter
        text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        
        // Keywords
        text = text.replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|CREATE|TABLE|INT|TEXT|BOOL|AND|OR|ORDER|BY|LIMIT)\b/gi, 
            '<span class="kwd">$1</span>');
        
        // Strings
        text = text.replace(/(['"])(.*?)\1/g, '<span class="str">$1$2$1</span>');
        
        // Comments
        text = text.replace(/(--.*)/g, '<span class="cmt">$1</span>');

        this.highlighter.innerHTML = text;
        this.updateLineNumbers();
    }

    updateLineNumbers() {
        const lines = this.editor.value.split('\n').length;
        document.getElementById('line-numbers').innerHTML = 
            Array(lines).fill(0).map((_, i) => `<div>${i+1}</div>`).join('');
    }

    async runQuery() {
        const sql = this.getSelection() || this.editor.value;
        if (!sql.trim()) return;

        const tableBody = document.querySelector('#result-table tbody');
        const tableHead = document.querySelector('#result-table thead');
        
        tableHead.innerHTML = '<tr><th>Running...</th></tr>';
        tableBody.innerHTML = '';

        const res = await this.engine.execute(sql);
        
        this.renderLogs(res.logs);
        document.getElementById('query-timer').innerText = `Time: ${res.time}ms`;

        if (res.success) {
            this.renderGrid(res.data);
            this.renderRaw(res.data);
            this.refreshSidebar();
            
            // Switch to Grid view if select, else Logs
            if (Array.isArray(res.data)) {
                document.querySelector('[data-target="grid"]').click();
            } else {
                document.querySelector('[data-target="logs"]').click();
            }
        } else {
            tableHead.innerHTML = `<tr><th class="error">Error: ${res.error}</th></tr>`;
            document.querySelector('[data-target="logs"]').click();
        }
    }

    renderGrid(data) {
        const tableBody = document.querySelector('#result-table tbody');
        const tableHead = document.querySelector('#result-table thead');
        
        if (!Array.isArray(data) || data.length === 0) {
            if (Array.isArray(data)) {
                tableHead.innerHTML = '<tr><th>No rows returned</th></tr>';
            } else {
                tableHead.innerHTML = `<tr><th>${data.message}</th></tr>`;
            }
            return;
        }

        // Headers
        const cols = Object.keys(data[0]);
        tableHead.innerHTML = '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';

        // Rows
        tableBody.innerHTML = data.map(row => {
            return '<tr>' + cols.map(c => `<td>${row[c]}</td>`).join('') + '</tr>';
        }).join('');

        document.getElementById('grid-pagination').innerHTML = `<span>Rows: ${data.length}</span>`;
    }

    renderLogs(logs) {
        const consoleEl = document.getElementById('console-logs');
        consoleEl.innerHTML = '';
        logs.forEach(l => {
            const entry = document.createElement('div');
            entry.className = `log-entry ${l.type}`;
            entry.innerHTML = `<span class="time">[${l.time.split('T')[1].slice(0,8)}]</span> ${l.msg}`;
            consoleEl.appendChild(entry);
        });
    }

    renderRaw(data) {
        document.getElementById('json-output').textContent = JSON.stringify(data, null, 2);
    }

    refreshSidebar() {
        const meta = this.storage.meta;
        const list = document.getElementById('table-list');
        const usage = this.storage.getUsage();
        
        document.getElementById('storage-val').innerText = `${(usage/1024).toFixed(2)} KB`;
        document.getElementById('storage-fill').style.width = Math.min(100, (usage / 10240) * 100) + '%'; // 10MB limit vis

        if (Object.keys(meta.tables).length === 0) {
            list.innerHTML = '<div class="empty-tree">No tables found</div>';
            return;
        }

        list.innerHTML = Object.values(meta.tables).map(t => `
            <div class="tree-item">
                <i class="ri-table-line"></i>
                <span>${t.name}</span>
                <span class="badge-sm">${t.rowCount} rows</span>
            </div>
        `).join('');
    }

    getSelection() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        return start === end ? null : this.editor.value.substring(start, end);
    }
    
    // Stub for modal column adding
    addModalColumn() {
        const div = document.createElement('div');
        div.className = 'col-row';
        div.innerHTML = `
            <input type="text" placeholder="col_name" class="col-name">
            <select class="col-type">
                <option value="INT">INT</option>
                <option value="TEXT">TEXT</option>
                <option value="BOOL">BOOL</option>
            </select>
        `;
        document.getElementById('cols-container').appendChild(div);
    }
    
    handleCreateTable() {
        const name = document.getElementById('new-table-name').value;
        if(!name) return;
        
        const schema = {};
        document.querySelectorAll('.col-row').forEach(row => {
            const col = row.querySelector('.col-name').value;
            const type = row.querySelector('.col-type').value;
            if(col) schema[col] = type;
        });
        
        const sql = `CREATE TABLE ${name} (${Object.entries(schema).map(([k,v]) => k + ' ' + v).join(', ')});`;
        this.editor.value = sql;
        this.updateHighlight();
        document.getElementById('modal-create').classList.add('hidden');
        this.runQuery();
    }
    
    logToConsole(msg, type) {
        const consoleEl = document.getElementById('console-logs');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerText = msg;
        consoleEl.appendChild(entry);
    }
}

// Start App
window.onload = () => {
    window.dbApp = new DBController();
};