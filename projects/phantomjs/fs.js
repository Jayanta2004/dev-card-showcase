// Simple singleton fake file system
const FileSystem = {
    tree: {
        'home': {
            type: 'dir',
            children: {
                'user': {
                    type: 'dir',
                    children: {
                        'documents': {
                            type: 'dir',
                            children: {
                                'secrets.txt': { type: 'file', content: 'TOP SECRET\n\nTarget ID: 99402\nStatus: ELIMINATE' },
                                'todo.md': { type: 'file', content: '# TODO\n- Install neuro-link\n- Bypass firewall 7' }
                            }
                        },
                        'downloads': {
                            type: 'dir',
                            children: {
                                'payload.exe': { type: 'file', content: '[BINARY DATA CORRUPTED]' }
                            }
                        }
                    }
                }
            }
        },
        'bin': {
            type: 'dir',
            children: {
                'scan': { type: 'bin', content: '[SYSTEM BINARY]' },
                'trace': { type: 'bin', content: '[SYSTEM BINARY]' },
                'connect': { type: 'bin', content: '[SYSTEM BINARY]' }
            }
        },
        'system': {
            type: 'dir',
            children: {
                'kernel.sys': { type: 'sys', content: 'KERNEL PANIC' },
                'logs': { type: 'dir', children: {} }
            }
        }
    },

    // Helper to traverse path
    resolve(path) {
        if (path === '/') return this.tree;
        const parts = path.split('/').filter(p => p);
        let current = this.tree;
        for (const part of parts) {
            if (current && current.children && current.children[part]) {
                current = current.children[part];
            } else {
                return null;
            }
        }
        return current;
    }
};

window.FileSystem = FileSystem;
