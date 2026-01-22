/**
 * SQL-LITE VIRTUAL DISK DRIVER
 * Simulates Block Storage on top of localStorage.
 * Manages data in 4KB Pages and handles binary-like serialization.
 * @author saiusesgithub
 */

const CONSTANTS = {
    BLOCK_SIZE: 4096, // 4KB Pages
    DB_PREFIX: 'sqllite_v1_',
    META_KEY: 'sqllite_meta'
};

/**
 * PAGE MANAGER
 * Represents a single block of data on the "disk".
 */
class Page {
    constructor(id, data = []) {
        this.id = id;
        this.data = data; // Array of Records
        this.nextPage = null;
        this.isDirty = false;
    }

    serialize() {
        return JSON.stringify({
            n: this.nextPage,
            d: this.data
        });
    }

    static deserialize(id, raw) {
        if (!raw) return new Page(id);
        const obj = JSON.parse(raw);
        const page = new Page(id, obj.d);
        page.nextPage = obj.n;
        return page;
    }
}

/**
 * DISK DRIVER
 * Low-level I/O operations.
 */
class DiskDriver {
    constructor() {
        this.storage = window.localStorage;
    }

    writePage(page) {
        try {
            const key = `${CONSTANTS.DB_PREFIX}blk_${page.id}`;
            this.storage.setItem(key, page.serialize());
            page.isDirty = false;
            return true;
        } catch (e) {
            console.error("Disk Quota Exceeded!", e);
            return false;
        }
    }

    readPage(id) {
        const key = `${CONSTANTS.DB_PREFIX}blk_${id}`;
        const raw = this.storage.getItem(key);
        return Page.deserialize(id, raw);
    }

    deletePage(id) {
        const key = `${CONSTANTS.DB_PREFIX}blk_${id}`;
        this.storage.removeItem(key);
    }

    writeMeta(meta) {
        this.storage.setItem(CONSTANTS.DB_PREFIX + CONSTANTS.META_KEY, JSON.stringify(meta));
    }

    readMeta() {
        const raw = this.storage.getItem(CONSTANTS.DB_PREFIX + CONSTANTS.META_KEY);
        return raw ? JSON.parse(raw) : { tables: {}, freeList: [] };
    }

    nuke() {
        Object.keys(this.storage).forEach(key => {
            if (key.startsWith(CONSTANTS.DB_PREFIX)) {
                this.storage.removeItem(key);
            }
        });
    }

    getUsage() {
        let total = 0;
        Object.keys(this.storage).forEach(key => {
            if (key.startsWith(CONSTANTS.DB_PREFIX)) {
                total += this.storage.getItem(key).length * 2; // UTF-16
            }
        });
        return total;
    }
}

/**
 * STORAGE ENGINE
 * High-level API for Tables and Records.
 */
class StorageEngine {
    constructor() {
        this.disk = new DiskDriver();
        this.meta = this.disk.readMeta();
        this.cache = new Map(); // Simple Buffer Pool
    }

    init() {
        console.log("Storage Engine Mounted.");
        console.log(`Tables loaded: ${Object.keys(this.meta.tables).length}`);
    }

    createTable(name, schema) {
        if (this.meta.tables[name]) throw new Error(`Table ${name} already exists.`);
        
        // Allocate Root Page
        const rootId = this._allocatePage();
        
        this.meta.tables[name] = {
            name: name,
            schema: schema,
            rootPage: rootId,
            autoIncrement: 1,
            rowCount: 0
        };
        
        this._saveMeta();
        return this.meta.tables[name];
    }

    insert(tableName, record) {
        const table = this.meta.tables[tableName];
        if (!table) throw new Error(`Table ${tableName} not found.`);

        // Handle Auto Increment
        if (!record.id) {
            record.id = table.autoIncrement++;
        }

        // Find last page to insert (Heap File organization)
        let pageId = table.rootPage;
        let page = this._getPage(pageId);

        // Traverse linked list to end
        while (page.nextPage) {
            pageId = page.nextPage;
            page = this._getPage(pageId);
        }

        // Check if page is full (simulation limit: 50 rows per page)
        if (page.data.length >= 50) {
            const newPageId = this._allocatePage();
            page.nextPage = newPageId;
            this.disk.writePage(page); // Flush current
            
            page = this._getPage(newPageId); // Switch to new
        }

        page.data.push(record);
        this.disk.writePage(page);
        
        table.rowCount++;
        this._saveMeta();
        return record;
    }

    /**
     * FULL TABLE SCAN
     * Reads every page in the linked list.
     */
    scan(tableName) {
        const table = this.meta.tables[tableName];
        if (!table) throw new Error(`Table ${tableName} not found.`);

        let rows = [];
        let pageId = table.rootPage;

        while (pageId !== null) {
            const page = this._getPage(pageId);
            rows.push(...page.data);
            pageId = page.nextPage;
        }
        return rows;
    }

    dropTable(name) {
        if (!this.meta.tables[name]) return;
        
        // Walk and delete pages
        let pageId = this.meta.tables[name].rootPage;
        while (pageId) {
            const page = this._getPage(pageId);
            const next = page.nextPage;
            this.disk.deletePage(pageId);
            pageId = next;
        }

        delete this.meta.tables[name];
        this._saveMeta();
    }

    getSchema(tableName) {
        return this.meta.tables[tableName]?.schema;
    }

    getUsage() {
        return this.disk.getUsage();
    }

    nuke() {
        this.disk.nuke();
        this.meta = { tables: {}, freeList: [] };
        this.cache.clear();
    }

    // --- Internals ---

    _allocatePage() {
        // Simple ID generation based on timestamp + random
        // In a real DB, this would reuse freed pages
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    _getPage(id) {
        if (this.cache.has(id)) return this.cache.get(id);
        const page = this.disk.readPage(id);
        this.cache.set(id, page);
        return page;
    }

    _saveMeta() {
        this.disk.writeMeta(this.meta);
    }
}

// Global Export
window.Storage = new StorageEngine();