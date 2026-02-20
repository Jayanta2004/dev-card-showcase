/**
 * GIT INDEX MANAGER (STAGING AREA)
 * ================================
 * The Index is a binary file in .git/index that tracks the file tree
 * for the *next* commit.
 * * In this simulation, this class manages:
 * 1. The state of staged files (path -> OID).
 * 2. The logic to convert the flat Index into a nested Tree structure (write-tree).
 */

class GitIndex {
    constructor() {
        // Map<path, IndexEntry>
        // We use a Map to ensure unique paths and fast lookups.
        this.entries = new Map();
    }

    /**
     * Load index from memory/storage (Simulated).
     * @param {Array} savedEntries 
     */
    load(savedEntries) {
        this.entries.clear();
        if (savedEntries) {
            savedEntries.forEach(e => {
                // Reconstruct IndexEntry objects
                const entry = new IndexEntry(e.path, e.oid, e.mode, e.size);
                entry.stage = e.stage;
                this.entries.set(e.path, entry);
            });
        }
    }

    /**
     * Export for storage.
     */
    toJSON() {
        return Array.from(this.entries.values());
    }

    /**
     * Add or update a file in the staging area.
     * Corresponds to `git add <file>`.
     * * @param {string} path - Relative path.
     * @param {string} oid - SHA-1 of the blob.
     * @param {number} size - File size in bytes.
     */
    add(path, oid, size) {
        // Mode is usually 100644 for files
        const entry = new IndexEntry(path, oid, MODES.FILE, size);
        this.entries.set(path, entry);
    }

    /**
     * Remove a file from the staging area.
     * Corresponds to `git rm --cached <file>`.
     */
    remove(path) {
        this.entries.delete(path);
    }

    /**
     * Clear the index (rarely used directly, but useful for resets).
     */
    clear() {
        this.entries.clear();
    }

    /**
     * Get entry by path.
     */
    get(path) {
        return this.entries.get(path);
    }

    /**
     * Check if a specific file path is staged.
     */
    has(path) {
        return this.entries.get(path);
    }

    /**
     * WRITE-TREE ALGORITHM (Recursive)
     * ================================
     * Converts the flat list of index entries into a hierarchy of GitTree objects.
     * This is the core logic of `git write-tree`.
     * * Example:
     * Index: ['a.txt', 'src/main.js']
     * * Step 1: Group by root folder
     * - 'a.txt' -> Blob
     * - 'src' -> [ 'main.js' ]
     * * Step 2: Recursively build trees for subfolders
     * - Build tree for 'src' containing 'main.js'
     * - Hash 'src' tree -> OID_SRC
     * * Step 3: Create Root Tree
     * - Entry: 'a.txt', blob, OID_A
     * - Entry: 'src', tree, OID_SRC
     * * @param {Object} repo - Reference to the repo to write objects to database.
     * @returns {string} The OID of the root tree.
     */
    writeTree(repo) {
        // 1. Convert Map to Array of entries
        const flatEntries = Array.from(this.entries.values());
        
        // 2. Build recursive structure
        // structure = { files: [], dirs: { 'src': { ... } } }
        const rootStruct = this._buildStructure(flatEntries);

        // 3. Create GitTree objects and write to DB
        return this._createTreeObject(rootStruct, repo);
    }

    /**
     * Helper: Turns flat paths into nested objects.
     */
    _buildStructure(entries) {
        const root = { files: [], dirs: {} };

        entries.forEach(entry => {
            const parts = entry.path.split('/');
            let current = root;

            // Traverse directories
            for (let i = 0; i < parts.length - 1; i++) {
                const dirName = parts[i];
                if (!current.dirs[dirName]) {
                    current.dirs[dirName] = { files: [], dirs: {} };
                }
                current = current.dirs[dirName];
            }

            // Add file to the leaf directory
            const fileName = parts[parts.length - 1];
            current.files.push({
                name: fileName,
                oid: entry.oid,
                mode: entry.mode
            });
        });

        return root;
    }

    /**
     * Helper: Recursively turns structure into GitTree objects.
     * Returns the OID of the tree created.
     */
    _createTreeObject(struct, repo) {
        const tree = new GitTree();

        // 1. Add Files (Blobs)
        struct.files.forEach(f => {
            tree.addEntry(f.name, f.mode, 'blob', f.oid);
        });

        // 2. Process Subdirectories (Trees)
        for (const dirName in struct.dirs) {
            const subStruct = struct.dirs[dirName];
            // RECURSION: Build the child tree first
            const subtreeOid = this._createTreeObject(subStruct, repo);
            
            // Add the child tree entry to current tree
            tree.addEntry(dirName, MODES.DIR, 'tree', subtreeOid);
        }

        // 3. Write this tree to the database
        const treeOid = repo.writeObject(tree);
        return treeOid;
    }

    /**
     * Utility: Flatten a Tree Object back into Index Entries.
     * Used for `git read-tree` (e.g., checkout).
     */
    static flattenTree(repo, treeOid, basePath = "") {
        const tree = repo.objects.get(treeOid);
        if (!tree) return [];

        let results = [];

        tree.entries.forEach(entry => {
            const fullPath = basePath ? `${basePath}/${entry.name}` : entry.name;

            if (entry.type === 'blob') {
                results.push(new IndexEntry(fullPath, entry.oid, entry.mode));
            } else if (entry.type === 'tree') {
                // Recursion
                const subResults = GitIndex.flattenTree(repo, entry.oid, fullPath);
                results = results.concat(subResults);
            }
        });

        return results;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.GitIndex = GitIndex;
}