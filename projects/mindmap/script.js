    (function() {
        const canvas = document.getElementById('mindCanvas');
        const ctx = canvas.getContext('2d');

        // ---- default mind map data ----
        let nodes = [];
        let nextId = 100;

        // selection set (allows multiple with shift)
        let selectedIds = new Set();     

        // drag state
        let dragActive = false;
        let dragNodeId = null;           // the node being dragged (always the primary dragged node)
        let dragOffsetX = 0, dragOffsetY = 0;

        // color settings
        let strokeColor = '#1f5e8e';
        let fillColor = '#d4eaf7';

        // ui constants
        const NODE_RADIUS = 38;
        const LEVEL_OFFSET_X = 160;
        const LEVEL_OFFSET_Y = 70;

        // ---- helpers ----
        function updateCounter() {
            document.getElementById('nodeCounter').innerText = nodes.length;
            const selText = selectedIds.size === 0 ? 'none' : 
                            (selectedIds.size === 1 ? `#${Array.from(selectedIds)[0]}` : `${selectedIds.size} nodes`);
            document.getElementById('selectedId').innerText = selText;
        }

        // find node by id
        function findNode(id) {
            return nodes.find(n => n.id === id);
        }

        // generate unique id
        function generateId() {
            return nextId++;
        }

        // initial default nodes : central + two children
        function createDefaultMap() {
            nodes = [];
            selectedIds.clear();

            const central = { id: generateId(), text: 'central', x: 550, y: 260, level: 0 };
            nodes.push(central);

            const child1 = { id: generateId(), text: 'explore', x: 380, y: 170, level: 1 };
            const child2 = { id: generateId(), text: 'create', x: 720, y: 180, level: 1 };
            const child3 = { id: generateId(), text: 'connect', x: 540, y: 380, level: 1 };
            nodes.push(child1, child2, child3);

            // level isn't strictly used for positioning but helps layout
            // also assign reasonable positions (already set)
            updateCounter();
            drawMap();
        }

        // ----- drawing -----
        function drawMap() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1) draw connections (simple straight lines)
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#9bb7d4';
            ctx.globalAlpha = 0.7;
            for (let node of nodes) {
                // connect to parent if exists (we define parent by proximity logic? we need structured tree)
                // instead we will connect root to all level1, and level1 to their children, but for demo we infer parent by level:
                // easier: manual parenting based on order? To keep it flexible we add a "parentId" field.
                // Let's enrich nodes: we build a small hierarchy.
                // But our current nodes have no parent info. We'll quickly rebuild data with parentIds.
            }
            // we'll recreate default structure WITH parentIds now, because lines need parent relation.
            // re-initialize with proper parentIds.
            function buildStructuredMap() {
                nodes = [];
                selectedIds.clear();
                const root = { id: generateId(), text: 'brain', x: 550, y: 260, level: 0, parentId: null };
                nodes.push(root);

                const childA = { id: generateId(), text: 'ideas', x: 380, y: 150, level: 1, parentId: root.id };
                const childB = { id: generateId(), text: 'tasks', x: 720, y: 150, level: 1, parentId: root.id };
                const childC = { id: generateId(), text: 'notes', x: 540, y: 380, level: 1, parentId: root.id };

                const grandChild = { id: generateId(), text: 'sketch', x: 260, y: 70, level: 2, parentId: childA.id };
                const grandChild2 = { id: generateId(), text: 'mind map', x: 840, y: 70, level: 2, parentId: childB.id };
                nodes.push(childA, childB, childC, grandChild, grandChild2);
            }
            buildStructuredMap();
            // now we have parentIds

            // draw edges (using parentId)
            ctx.beginPath();
            for (let node of nodes) {
                if (node.parentId) {
                    const parent = findNode(node.parentId);
                    if (parent) {
                        ctx.beginPath();
                        ctx.moveTo(parent.x, parent.y);
                        ctx.lineTo(node.x, node.y);
                        ctx.strokeStyle = strokeColor;
                        ctx.lineWidth = 2.2;
                        ctx.globalAlpha = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // draw nodes (circles + text)
            for (let node of nodes) {
                // shadow for selected
                if (selectedIds.has(node.id)) {
                    ctx.shadowColor = '#3f9eff';
                    ctx.shadowBlur = 16;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                } else {
                    ctx.shadowColor = 'rgba(0,0,0,0.1)';
                    ctx.shadowBlur = 6;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;
                }

                // fill
                ctx.beginPath();
                ctx.arc(node.x, node.y, NODE_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = fillColor;
                ctx.fill();
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = selectedIds.has(node.id) ? 4 : 2.5;
                ctx.stroke();

                // reset shadow for text
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;

                // text
                ctx.font = '500 15px "Segoe UI", "Roboto", sans-serif';
                ctx.fillStyle = '#0b2a3b';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.text, node.x, node.y);
            }

            // reset shadow
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            updateCounter();
        }

        // ----- find node at (x,y) -----
        function getNodeAt(px, py) {
            for (let i = nodes.length - 1; i >= 0; i--) { // reverse for top if overlapping
                const n = nodes[i];
                const dx = px - n.x;
                const dy = py - n.y;
                if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS) {
                    return n;
                }
            }
            return null;
        }

        // ----- event handlers -----
        function handleMouseDown(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const clickedNode = getNodeAt(mouseX, mouseY);

            if (clickedNode) {
                // shift key for multi-select (toggle)
                if (e.shiftKey) {
                    if (selectedIds.has(clickedNode.id)) {
                        selectedIds.delete(clickedNode.id);
                    } else {
                        selectedIds.add(clickedNode.id);
                    }
                    dragActive = false;  // don't start drag on shift+click (just selection)
                } else {
                    // without shift: set selection to this node only
                    if (!selectedIds.has(clickedNode.id)) {
                        selectedIds.clear();
                        selectedIds.add(clickedNode.id);
                    }
                    // start dragging (only if it's the only selected? but we allow dragging the set if multiple? For simplicity we drag only primary)
                    // we will just drag the clicked node, but if multiple selected we keep them selected.
                    dragActive = true;
                    dragNodeId = clickedNode.id;
                    dragOffsetX = clickedNode.x - mouseX;
                    dragOffsetY = clickedNode.y - mouseY;
                }
            } else {
                // click on background: clear selection if not shift
                if (!e.shiftKey) {
                    selectedIds.clear();
                }
                dragActive = false;
            }
            drawMap();
        }

        function handleMouseMove(e) {
            if (!dragActive || dragNodeId === null) return;
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const draggedNode = findNode(dragNodeId);
            if (!draggedNode) return;

            // move the dragged node
            draggedNode.x = mouseX + dragOffsetX;
            draggedNode.y = mouseY + dragOffsetY;

            // also move any other selected nodes (maintain relative offset? but we stored offset only for primary)
            // to keep simple, we only drag the primary node. others stay. but we could iterate selected and shift with same delta.
            // Let's implement delta movement for all selected:
            if (selectedIds.size > 1) {
                const deltaX = (mouseX + dragOffsetX) - draggedNode.x; // actually draggedNode already updated; we need previous
                // better compute delta from previous pos:
                // we'll use a different approach: store previousX per node?
                // For simplicity, I'll only move the primary node. This avoids complexity.
                // but we want group move. let's quickly implement using lastPos.
                if (!dragActive) return;
                // We'll store last positions in a map? easier: just move all selected with same delta.
                // Compute movement of dragged node since last call:
                // We need a previous position. We'll store prevX/prevY in drag state.
                if (!dragActive) return;
            }

            // but we want all selected to move. we can compute delta from initial click? we have offset for primary, but we can reuse:
            // We'll store initial drag coords. Let's upgrade: 
            // To keep code clean, i will add a new map `dragStartPositions` on drag start.
            // quick refactor:
        }

        // We need more robust drag with group. Let's reimplement drag with start positions.
        let dragGroupOffsets = new Map(); // nodeId -> {startX, startY}
        let dragStartMouse = { x: 0, y: 0 };

        // override handlers for group drag.
        function onMouseDown(e) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const clickedNode = getNodeAt(mouseX, mouseY);

            if (clickedNode) {
                if (e.shiftKey) {
                    // toggle selection, no drag
                    if (selectedIds.has(clickedNode.id)) {
                        selectedIds.delete(clickedNode.id);
                    } else {
                        selectedIds.add(clickedNode.id);
                    }
                    dragActive = false;
                } else {
                    // without shift: set selection to clicked node if not in set
                    if (!selectedIds.has(clickedNode.id)) {
                        selectedIds.clear();
                        selectedIds.add(clickedNode.id);
                    }
                    // start drag for all selected nodes, store start positions
                    dragActive = true;
                    dragStartMouse.x = mouseX;
                    dragStartMouse.y = mouseY;
                    dragGroupOffsets.clear();
                    for (let id of selectedIds) {
                        const n = findNode(id);
                        if (n) {
                            dragGroupOffsets.set(id, { startX: n.x, startY: n.y });
                        }
                    }
                }
            } else {
                if (!e.shiftKey) selectedIds.clear();
                dragActive = false;
                dragGroupOffsets.clear();
            }
            drawMap();
        }

        function onMouseMove(e) {
            if (!dragActive || dragGroupOffsets.size === 0) return;
            e.preventDefault();

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const deltaX = mouseX - dragStartMouse.x;
            const deltaY = mouseY - dragStartMouse.y;

            for (let [id, startPos] of dragGroupOffsets.entries()) {
                const node = findNode(id);
                if (node) {
                    node.x = startPos.startX + deltaX;
                    node.y = startPos.startY + deltaY;
                }
            }
            drawMap();
        }

        function onMouseUp(e) {
            if (dragActive) {
                dragActive = false;
                dragGroupOffsets.clear();
                drawMap();
            }
        }

        function onMouseLeave(e) {
            if (dragActive) {
                dragActive = false;
                dragGroupOffsets.clear();
                drawMap();
            }
        }

        // ----- operations -----
        function addCentral() {
            selectedIds.clear();
            const newId = generateId();
            const newNode = {
                id: newId,
                text: 'idea',
                x: 400 + Math.random() * 200,
                y: 200 + Math.random() * 150,
                level: 0,
                parentId: null
            };
            nodes.push(newNode);
            selectedIds.add(newId);
            drawMap();
        }

        function addChild() {
            if (selectedIds.size === 0) {
                alert('select a parent node first');
                return;
            }
            // use first selected as parent (if multiple, pick first)
            const parentId = Array.from(selectedIds)[0];
            const parent = findNode(parentId);
            if (!parent) return;

            const newId = generateId();
            const angle = Math.random() * 2 * Math.PI;
            const newNode = {
                id: newId,
                text: 'sub',
                x: parent.x + 100 * Math.cos(angle),
                y: parent.y + 70 * Math.sin(angle) + 30,
                level: (parent.level || 0) + 1,
                parentId: parent.id
            };
            nodes.push(newNode);
            selectedIds.clear();
            selectedIds.add(newId);
            drawMap();
        }

        function addSibling() {
            if (selectedIds.size === 0) {
                alert('select a node to add sibling (same parent)');
                return;
            }
            const nodeId = Array.from(selectedIds)[0];
            const node = findNode(nodeId);
            if (!node) return;
            if (!node.parentId) {
                // root: sibling means another root? we allow another root-level node (parent null)
                const newId = generateId();
                const newNode = {
                    id: newId,
                    text: 'new',
                    x: node.x + 80,
                    y: node.y + 40,
                    level: 0,
                    parentId: null
                };
                nodes.push(newNode);
                selectedIds.clear();
                selectedIds.add(newId);
                drawMap();
                return;
            }
            const parent = findNode(node.parentId);
            if (!parent) return;

            const newId = generateId();
            const newNode = {
                id: newId,
                text: 'peer',
                x: node.x + 60,
                y: node.y + 50,
                level: node.level,
                parentId: parent.id
            };
            nodes.push(newNode);
            selectedIds.clear();
            selectedIds.add(newId);
            drawMap();
        }

        function deleteSelected() {
            if (selectedIds.size === 0) return;
            // also delete any children (recursive) to keep integrity
            const toDelete = new Set(selectedIds);
            // cascade children (simple BFS)
            let frontier = Array.from(toDelete);
            while (frontier.length) {
                const next = [];
                for (let pid of frontier) {
                    for (let n of nodes) {
                        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
                            toDelete.add(n.id);
                            next.push(n.id);
                        } else if (n.parentId && toDelete.has(n.parentId)) {
                            // already in set
                        }
                    }
                }
                frontier = next;
            }

            nodes = nodes.filter(n => !toDelete.has(n.id));
            selectedIds.clear();
            drawMap();
        }

        function clearAll() {
            if (confirm('erase everything?')) {
                nodes = [];
                selectedIds.clear();
                drawMap();
            }
        }

        // export canvas as png
        function exportPNG() {
            const link = document.createElement('a');
            link.download = 'mindmap.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        // set colors from pickers
        function updateColors() {
            strokeColor = document.getElementById('strokeColorPicker').value;
            fillColor = document.getElementById('fillColorPicker').value;
            drawMap();
        }

        // ----- attach events -----
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseLeave);

        document.getElementById('addCentralBtn').addEventListener('click', addCentral);
        document.getElementById('addChildBtn').addEventListener('click', addChild);
        document.getElementById('addSiblingBtn').addEventListener('click', addSibling);
        document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelected);
        document.getElementById('clearAllBtn').addEventListener('click', clearAll);
        document.getElementById('exportBtn').addEventListener('click', exportPNG);

        document.getElementById('strokeColorPicker').addEventListener('input', updateColors);
        document.getElementById('fillColorPicker').addEventListener('input', updateColors);

        // start with structured map
        buildStructuredMap(); // also sets parentIds, nextId etc
        // fix nextId after rebuild
        nextId = Math.max(...nodes.map(n => n.id)) + 1;
        selectedIds.clear();
        drawMap();
        updateCounter();

        // ensure counters
        window.findNode = findNode; // debug
    })();