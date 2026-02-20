/**
 * SQL-LITE B-TREE INDEXING ENGINE
 * A self-balancing tree data structure for O(log n) lookups.
 * Implements standard B-Tree insertion and splitting algorithms.
 * @author saiusesgithub
 */

const BTREE_DEGREE = 3; // Minimum degree (t). Max keys = 2t - 1

class BTreeNode {
    constructor(leaf = false) {
        this.leaf = leaf;
        this.keys = [];   // Array of keys
        this.values = []; // Array of pointers (Record IDs)
        this.children = []; // Array of child node references
    }

    /**
     * Serializes node for storage
     */
    serialize() {
        return {
            l: this.leaf,
            k: this.keys,
            v: this.values,
            c: this.children // In a real DB, these would be PageIDs
        };
    }

    static deserialize(raw) {
        const node = new BTreeNode(raw.l);
        node.keys = raw.k;
        node.values = raw.v;
        node.children = raw.c;
        return node;
    }
}

class BTree {
    constructor(name) {
        this.name = name; // Index Name
        this.root = new BTreeNode(true);
        this.t = BTREE_DEGREE;
    }

    /**
     * Search for a value by key
     * Complexity: O(log n)
     */
    search(key) {
        return this._searchNode(this.root, key);
    }

    _searchNode(node, key) {
        let i = 0;
        // Find the first key greater than or equal to k
        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }

        // Check if we found the key
        if (i < node.keys.length && key === node.keys[i]) {
            return node.values[i];
        }

        // If leaf, key doesn't exist
        if (node.leaf) {
            return null;
        }

        // Recurse to child
        // Note: In a disk-based DB, we would load the child page here
        return this._searchNode(node.children[i], key);
    }

    /**
     * Insert a new key-value pair
     */
    insert(key, value) {
        const root = this.root;
        
        // If root is full, tree grows in height
        if (root.keys.length === (2 * this.t) - 1) {
            const newRoot = new BTreeNode(false);
            newRoot.children.push(this.root);
            this._splitChild(newRoot, 0);
            this.root = newRoot;
            this._insertNonFull(newRoot, key, value);
        } else {
            this._insertNonFull(root, key, value);
        }
    }

    _insertNonFull(node, key, value) {
        let i = node.keys.length - 1;

        if (node.leaf) {
            // Find location to insert and shift keys
            while (i >= 0 && key < node.keys[i]) {
                node.keys[i + 1] = node.keys[i];
                node.values[i + 1] = node.values[i];
                i--;
            }
            node.keys[i + 1] = key;
            node.values[i + 1] = value;
        } else {
            // Find child to recurse into
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }
            i++;

            // Check if child is full
            if (node.children[i].keys.length === (2 * this.t) - 1) {
                this._splitChild(node, i);
                if (key > node.keys[i]) {
                    i++;
                }
            }
            this._insertNonFull(node.children[i], key, value);
        }
    }

    /**
     * Split a full child node into two
     * This is the core logic that keeps the tree balanced.
     */
    _splitChild(parent, i) {
        const t = this.t;
        const child = parent.children[i];
        const newSibling = new BTreeNode(child.leaf);

        // Move the last t-1 keys of child to newSibling
        // newSibling gets keys[t] to keys[2t-2]
        newSibling.keys = child.keys.splice(t); 
        newSibling.values = child.values.splice(t);

        // If not leaf, move children pointers too
        if (!child.leaf) {
            newSibling.children = child.children.splice(t);
        }

        // The middle key moves UP to the parent
        const medianKey = child.keys.pop();
        const medianVal = child.values.pop();

        // Insert newSibling into parent's children
        parent.children.splice(i + 1, 0, newSibling);

        // Insert median key into parent
        parent.keys.splice(i, 0, medianKey);
        parent.values.splice(i, 0, medianVal);
    }

    /**
     * Traversal for debugging
     */
    traverse() {
        const result = [];
        this._traverseNode(this.root, result);
        return result;
    }

    _traverseNode(node, acc) {
        let i;
        for (i = 0; i < node.keys.length; i++) {
            if (!node.leaf) {
                this._traverseNode(node.children[i], acc);
            }
            acc.push({ key: node.keys[i], val: node.values[i] });
        }
        if (!node.leaf) {
            this._traverseNode(node.children[i], acc);
        }
    }
}

/**
 * INDEX MANAGER
 * Coordinates B-Trees for tables.
 */
class IndexManager {
    constructor() {
        this.indexes = {};
    }

    createIndex(tableName, column) {
        const name = `${tableName}_${column}`;
        this.indexes[name] = new BTree(name);
        return this.indexes[name];
    }

    getIndex(tableName, column) {
        return this.indexes[`${tableName}_${column}`];
    }

    insert(tableName, column, key, recordPointer) {
        const index = this.getIndex(tableName, column);
        if (index) {
            index.insert(key, recordPointer);
        }
    }
}

window.IndexSystem = new IndexManager();