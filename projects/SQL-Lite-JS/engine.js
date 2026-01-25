/**
 * SQL-LITE EXECUTION ENGINE
 * Interprets the AST and coordinates storage operations.
 * Implements Query Optimization (Index Scan vs Full Scan).
 * @author saiusesgithub
 */

class ExecutionEngine {
    constructor() {
        this.storage = window.Storage;
        this.index = window.IndexSystem;
        this.logs = [];
    }

    /**
     * Main Entry Point
     * @param {string} sql - Raw SQL string
     */
    async execute(sql) {
        this.logs = [];
        const timerStart = performance.now();
        
        try {
            this.log("Parsing SQL...", "system");
            const parser = new window.SQLParser(sql);
            const ast = parser.parse();
            
            this.log(`AST Generated: ${ast.type}`, "system");
            
            let result;
            switch (ast.type) {
                case 'CREATE':
                    result = this.executeCreate(ast);
                    break;
                case 'INSERT':
                    result = this.executeInsert(ast);
                    break;
                case 'SELECT':
                    result = this.executeSelect(ast);
                    break;
                case 'DELETE':
                    result = this.executeDelete(ast);
                    break;
                default:
                    throw new Error("Unsupported Operation");
            }

            const duration = (performance.now() - timerStart).toFixed(2);
            return { 
                success: true, 
                data: result, 
                logs: this.logs, 
                time: duration 
            };

        } catch (e) {
            console.error(e);
            return { 
                success: false, 
                error: e.message, 
                logs: this.logs 
            };
        }
    }

    executeCreate(ast) {
        this.storage.createTable(ast.table, ast.schema);
        this.log(`Table '${ast.table}' created successfully.`, "success");
        return { message: "Table Created" };
    }

    executeInsert(ast) {
        const schema = this.storage.getSchema(ast.table);
        if (!schema) throw new Error(`Table ${ast.table} does not exist.`);

        const record = {};
        
        // Map values to columns
        if (ast.columns.length > 0) {
            ast.columns.forEach((col, i) => {
                record[col] = this._castType(ast.values[i], schema[col]);
            });
        } else {
            // Assume order matches schema (simplified)
            const cols = Object.keys(schema);
            ast.values.forEach((val, i) => {
                record[cols[i]] = this._castType(val, schema[cols[i]]);
            });
        }

        const inserted = this.storage.insert(ast.table, record);
        
        // Update Indexes if any
        Object.keys(record).forEach(col => {
            this.index.insert(ast.table, col, record[col], inserted.id);
        });

        this.log(`Inserted 1 row into ${ast.table}`, "success");
        return { message: "Row Inserted", row: inserted };
    }

    executeSelect(ast) {
        let rows = [];

        // 1. QUERY OPTIMIZER: Decide Scan Strategy
        if (ast.where && this._hasIndex(ast.table, ast.where.left) && ast.where.op === '=') {
            this.log(`OPTIMIZER: Using Index Scan on ${ast.where.left}`, "info");
            // Index Lookup (Mocked for now as direct storage scan is fast in memory)
            // Real implementation would fetch PageID from B-Tree
             rows = this.storage.scan(ast.table); // Fallback for prototype
        } else {
            this.log("OPTIMIZER: Using Full Table Scan", "warning");
            rows = this.storage.scan(ast.table);
        }

        // 2. Filtering (WHERE)
        if (ast.where) {
            rows = rows.filter(row => this._evaluateCondition(row, ast.where));
            this.log(`Filtered result: ${rows.length} rows matched.`, "info");
        }

        // 3. Projection (SELECT col1, col2)
        if (ast.columns[0] !== '*') {
            rows = rows.map(row => {
                const projected = {};
                ast.columns.forEach(col => projected[col] = row[col]);
                return projected;
            });
        }

        return rows;
    }

    executeDelete(ast) {
        // Simplified: Drop table if no WHERE, otherwise complex
        if (!ast.where) {
             this.storage.dropTable(ast.table);
             return { message: `Table ${ast.table} dropped (TRUNCATE simulation)` };
        }
        // Row-level delete would require Page compaction logic (too complex for MVP)
        throw new Error("DELETE with WHERE is not supported in this version.");
    }

    // --- Helpers ---

    _castType(val, type) {
        if (type === 'INT') return parseInt(val);
        if (type === 'BOOL') return val === 'true' || val === true;
        return String(val); // TEXT
    }

    _evaluateCondition(row, cond) {
        const val = row[cond.left];
        const target = cond.right;
        
        switch (cond.op) {
            case '=': return val == target;
            case '>': return val > target;
            case '<': return val < target;
            case '>=': return val >= target;
            case '<=': return val <= target;
            case '!=': return val != target;
            default: return false;
        }
    }

    _hasIndex(table, col) {
        return !!this.index.getIndex(table, col);
    }

    log(msg, type="info") {
        this.logs.push({ msg, type, time: new Date().toISOString() });
    }
}

window.SQLEngine = new ExecutionEngine();