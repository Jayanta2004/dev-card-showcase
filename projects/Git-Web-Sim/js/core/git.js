/**
 * GIT GRAPH VISUALIZER
 * ====================
 * Renders the repository history as a Directed Acyclic Graph (DAG).
 * Visualizes Commits, Branch References, and the HEAD pointer.
 */

class GraphVisualizer {
    constructor(canvasId, repo) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.repo = repo;
        
        // Layout Config
        this.config = {
            nodeRadius: 8,
            spacingX: 60,
            spacingY: 50,
            padding: 40,
            colors: {
                node: '#f05033',
                edge: '#666',
                head: '#007acc',
                text: '#fff'
            }
        };

        // Zoom/Pan State
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        // Auto-resize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Initial Draw
        this.draw();
    }

    resize() {
        if (!this.canvas.parentElement) return;
        this.width = this.canvas.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.height = this.canvas.parentElement.clientHeight;
        this.draw();
    }

    /**
     * Main Render Loop
     */
    draw() {
        if (!this.repo) return;
        
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        
        // 1. Build the Graph Model (Nodes & Edges)
        const { nodes, edges } = this._buildGraphModel();
        
        // 2. Apply Transform (Zoom/Pan)
        ctx.save();
        ctx.translate(this.offsetX + this.config.padding, this.offsetY + this.config.padding);
        ctx.scale(this.scale, this.scale);

        // 3. Draw Edges (Lines between commits)
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.config.colors.edge;
        
        edges.forEach(edge => {
            const start = nodes.get(edge.from);
            const end = nodes.get(edge.to);
            if (start && end) {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                // Simple Bezier for branching visual
                ctx.bezierCurveTo(
                    start.x, start.y + 25, 
                    end.x, end.y - 25, 
                    end.x, end.y
                );
                ctx.stroke();
            }
        });

        // 4. Draw Nodes (Commits)
        nodes.forEach(node => {
            // Circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, this.config.nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.config.colors.node;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hash Label
            ctx.fillStyle = '#888';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(node.oid.substring(0, 7), node.x, node.y - 15);

            // Message Label (Truncated)
            ctx.fillStyle = this.config.colors.text;
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            const msg = node.commit.message.split('\n')[0];
            ctx.fillText(msg.substring(0, 20), node.x + 15, node.y + 4);

            // 5. Draw Refs (Branches / HEAD)
            this._drawRefs(ctx, node);
        });

        ctx.restore();
    }

    /**
     * Helper: Draw Labels like "main", "HEAD" attached to nodes
     */
    _drawRefs(ctx, node) {
        let labelOffset = 20;

        // Check HEAD
        const headOid = this.repo.resolveRef('HEAD');
        if (node.oid === headOid) {
            this._drawBadge(ctx, node.x - 30, node.y + labelOffset, "HEAD", this.config.colors.head);
            labelOffset += 20;
        }

        // Check Branches
        this.repo.refs.forEach((oid, refName) => {
            if (oid === node.oid && refName.startsWith('refs/heads/')) {
                const name = refName.replace('refs/heads/', '');
                this._drawBadge(ctx, node.x - 30, node.y + labelOffset, name, '#3fb950');
                labelOffset += 20;
            }
        });
    }

    _drawBadge(ctx, x, y, text, color) {
        ctx.font = 'bold 10px sans-serif';
        const width = ctx.measureText(text).width + 10;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, width, 16, 4);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText(text, x + 5, y + 11);
    }

    /**
     * GRAPH LAYOUT ALGORITHM
     * Converts the Git OID history into X,Y coordinates.
     */
    _buildGraphModel() {
        const nodes = new Map(); // OID -> { x, y, oid, commit }
        const edges = [];
        
        // Find all tips (branches + HEAD) to start traversal
        const tips = new Set(this.repo.refs.values());
        const head = this.repo.resolveRef('HEAD');
        if (head) tips.add(head);

        // BFS Queue: { oid, depth }
        // For visualization, 'depth' is Y-axis
        const queue = [];
        tips.forEach(oid => {
            if (oid) queue.push({ oid, depth: 0 });
        });
        
        // Sort queue by timestamp to process newer commits first? 
        // Simple BFS is okay for this depth calculation.
        
        const visited = new Set();
        let maxDepth = 0;

        // 1. Calculate Depths (Y-axis)
        while (queue.length > 0) {
            const { oid, depth } = queue.shift();
            
            if (visited.has(oid)) continue;
            visited.add(oid);

            const commit = this.repo.objects.get(oid);
            if (!commit) continue;

            // X-Axis: 
            // In a real git graph (like gitk), we need "Lanes".
            // Here we simplify: X is static, unless we implement full topological sort lanes.
            // We'll just stack them vertically for this version (Linear History Visual).
            
            nodes.set(oid, {
                oid: oid,
                commit: commit,
                x: 0, 
                y: depth * this.config.spacingY
            });
            
            if (depth > maxDepth) maxDepth = depth;

            // Add parents
            commit.parents.forEach(pOid => {
                edges.push({ from: pOid, to: oid }); // Parent -> Child direction for visual flow? 
                // Usually graphs draw time downwards. Parent is OLDER (lower Y? or Higher Y?)
                // Let's say Top = Newest.
                // Then Parent depth = Current Depth + 1
                queue.push({ oid: pOid, depth: depth + 1 });
            });
        }
        
        // Fix coordinates so Newest is at Top (Y=0)
        // Currently depth 0 is tips.
        // We'll center them horizontally.
        const midX = this.width / 2;
        nodes.forEach(node => {
            node.x = midX;
        });

        return { nodes, edges };
    }
}

// Export
if (typeof window !== 'undefined') {
    window.GraphVisualizer = GraphVisualizer;
}