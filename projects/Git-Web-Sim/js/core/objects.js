/**
 * GIT OBJECT MODELS
 * =================
 * Defines the four fundamental object types used in Git:
 * 1. Blob   - Compressed file content.
 * 2. Tree   - Directory listing (map of names to OIDs).
 * 3. Commit - Snapshot wrapper with metadata and parent links.
 * 4. Tag    - (Optional) Static reference to a commit.
 * * Also defines the IndexEntry structure used in the Staging Area.
 */

// Global permissions modes
const MODES = {
    FILE: '100644', // Regular non-executable file
    EXEC: '100755', // Executable file
    DIR:  '040000'  // Directory (Tree)
};

/**
 * Base class for all Git objects.
 * Enforces the contract that all objects must be serializable and hashable.
 */
class GitObject {
    constructor(type) {
        this.type = type;
        this.oid = null; // Computed upon save
    }

    /**
     * Convert the object state to the string format Git uses for hashing.
     */
    serialize() {
        throw new Error("Method 'serialize()' must be implemented.");
    }

    /**
     * Calculate the SHA-1 OID based on current state.
     * @returns {string} The 40-char SHA-1 hash.
     */
    hash() {
        const content = this.serialize();
        if (this.type === 'blob') {
            this.oid = GitHasher.blob(content);
        } else if (this.type === 'tree') {
            this.oid = GitHasher.tree(content);
        } else if (this.type === 'commit') {
            this.oid = GitHasher.commit(content);
        }
        return this.oid;
    }
}

/**
 * GIT BLOB
 * Stores file data. Note that blobs do NOT store filenames.
 */
class GitBlob extends GitObject {
    constructor(content) {
        super('blob');
        this.content = content || "";
    }

    serialize() {
        return this.content;
    }
}

/**
 * GIT TREE
 * Represents a directory. Stores a list of "Tree Entries".
 * Entry Format: <mode> <type> <oid> <name>
 */
class GitTree extends GitObject {
    constructor(entries = []) {
        super('tree');
        this.entries = entries; // Array of { mode, type, oid, name }
    }

    /**
     * Add or update an entry in the tree.
     * @param {string} name - Filename
     * @param {string} mode - File mode (e.g., '100644')
     * @param {string} type - 'blob' or 'tree'
     * @param {string} oid - SHA-1 hash
     */
    addEntry(name, mode, type, oid) {
        // Remove existing entry with same name (overwrite)
        this.entries = this.entries.filter(e => e.name !== name);
        
        this.entries.push({ name, mode, type, oid });
        
        // Git trees are strictly sorted by name
        this.entries.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
    }

    serialize() {
        // Format: mode type oid name
        // Real Git uses binary packing, we use text lines for simulation
        return this.entries
            .map(e => `${e.mode} ${e.type} ${e.oid} ${e.name}`)
            .join('\n');
    }
    
    static parse(serialized) {
        if (!serialized) return new GitTree();
        const lines = serialized.split('\n');
        const entries = lines.map(line => {
            const parts = line.split(' ');
            if (parts.length < 4) return null;
            return {
                mode: parts[0],
                type: parts[1],
                oid: parts[2],
                name: parts.slice(3).join(' ') // Handle names with spaces
            };
        }).filter(e => e !== null);
        return new GitTree(entries);
    }
}

/**
 * GIT COMMIT
 * A snapshot of the working directory at a point in time.
 * Links to a Tree (root directory) and Parent Commits.
 */
class GitCommit extends GitObject {
    /**
     * @param {string} treeOid - The root tree SHA-1.
     * @param {Array<string>} parentOids - Array of parent SHA-1s.
     * @param {string} author - "Name <email>"
     * @param {string} message - Commit message
     * @param {number} timestamp - Unix timestamp (optional)
     */
    constructor(treeOid, parentOids, author, message, timestamp) {
        super('commit');
        this.tree = treeOid;
        this.parents = parentOids || [];
        this.author = author;
        this.message = message;
        this.timestamp = timestamp || Math.floor(Date.now() / 1000);
    }

    serialize() {
        let str = `tree ${this.tree}\n`;
        
        this.parents.forEach(p => {
            str += `parent ${p}\n`;
        });
        
        str += `author ${this.author} ${this.timestamp} +0000\n`;
        str += `committer ${this.author} ${this.timestamp} +0000\n`;
        str += `\n${this.message}`;
        
        return str;
    }

    static parse(serialized) {
        const lines = serialized.split('\n');
        let tree = null;
        let parents = [];
        let author = "";
        let message = "";
        let isBody = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (isBody) {
                message += (message ? "\n" : "") + line;
                continue;
            }

            if (line === "") {
                isBody = true;
                continue;
            }

            if (line.startsWith('tree ')) {
                tree = line.substring(5);
            } else if (line.startsWith('parent ')) {
                parents.push(line.substring(7));
            } else if (line.startsWith('author ')) {
                // Extract "Name <email>" ignoring timestamp for now
                const parts = line.split(' ');
                // Quick hack to get author name
                author = parts.slice(1, parts.length - 2).join(' '); 
            }
        }
        
        return new GitCommit(tree, parents, author, message);
    }
}

/**
 * STAGING AREA ENTRY
 * Represents a file in the "Index" (.git/index).
 * The index is a binary file in real Git, here we model it as an object.
 */
class IndexEntry {
    constructor(path, oid, mode, size) {
        this.path = path; // Relative path (e.g., "src/main.js")
        this.oid = oid;   // Blob SHA-1
        this.mode = mode || MODES.FILE;
        this.size = size || 0;
        
        // Flags
        this.stage = 0; // 0=Normal, 1=Base, 2=Ours, 3=Theirs (Merge conflicts)
        
        // Timestamps (Simulated)
        this.ctime = Date.now();
        this.mtime = Date.now();
    }
}

// Export classes
if (typeof window !== 'undefined') {
    window.GitObject = GitObject;
    window.GitBlob = GitBlob;
    window.GitTree = GitTree;
    window.GitCommit = GitCommit;
    window.IndexEntry = IndexEntry;
    window.MODES = MODES;
}