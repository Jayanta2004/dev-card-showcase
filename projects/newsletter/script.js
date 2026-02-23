    (function() {
        // ---------- state: array of blocks ----------
        let blocks = [
            { type: 'text', content: 'Hello! This is your first newsletter article. You can edit this text.' },
            { type: 'image', content: 'https://placehold.co/600x200/8fc9ff/ffffff?text=Your+Image' },
            { type: 'button', content: 'Click here', url: 'https://example.com' }
        ];

        // DOM elements
        const blockListEl = document.getElementById('blockListContainer');
        const previewEl = document.getElementById('emailPreview');
        const newsletterName = document.getElementById('newsletterName');
        const preheader = document.getElementById('preheader');
        const bgColor = document.getElementById('bgColor');
        const textColor = document.getElementById('textColor');
        const fontSelect = document.getElementById('fontSelect');
        const addTextBtn = document.getElementById('addTextBlockBtn');
        const addImageBtn = document.getElementById('addImageBlockBtn');
        const addButtonBtn = document.getElementById('addButtonBlockBtn');
        const exportBtn = document.getElementById('exportHtmlBtn');
        const refreshBtn = document.getElementById('refreshPreviewBtn');

        // Render block list (drag/drop with simple reorder via buttons? we implement move up/down for simplicity)
        function renderBlockList() {
            blockListEl.innerHTML = '';
            blocks.forEach((block, index) => {
                const blockDiv = document.createElement('div');
                blockDiv.className = 'block-item';
                blockDiv.dataset.index = index;

                // emoji based on type
                let emoji = '📄';
                if (block.type === 'image') emoji = '🖼️';
                if (block.type === 'button') emoji = '🔘';

                // content summary
                let summary = block.content.substring(0, 20) + (block.content.length > 20 ? '…' : '');
                if (block.type === 'image') summary = 'image url: ' + block.content.substring(0, 15) + '…';
                if (block.type === 'button') summary = `button: ${block.content} → ${block.url || '#'}`;

                blockDiv.innerHTML = `
                    <div class="block-emoji">${emoji}</div>
                    <div class="block-content">${summary}</div>
                    <div style="display: flex; gap:6px;">
                        <button class="move-up" data-index="${index}" style="background:#568fc2; border:none; color:white; border-radius:30px; padding:4px 10px;">⬆</button>
                        <button class="move-down" data-index="${index}" style="background:#568fc2; border:none; color:white; border-radius:30px; padding:4px 10px;">⬇</button>
                        <button class="edit-block" data-index="${index}" style="background:#2f7d42; border:none; color:white; border-radius:30px; padding:4px 10px;">✎</button>
                        <button class="delete-block" data-index="${index}" style="background:#b13e3e; border:none; color:white; border-radius:30px; padding:4px 10px;">🗑️</button>
                    </div>
                `;
                blockListEl.appendChild(blockDiv);
            });

            // attach event listeners to buttons
            document.querySelectorAll('.move-up').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    if (idx > 0) {
                        [blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]];
                        renderBlockList();
                        updatePreview();
                    }
                });
            });
            document.querySelectorAll('.move-down').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    if (idx < blocks.length - 1) {
                        [blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]];
                        renderBlockList();
                        updatePreview();
                    }
                });
            });
            document.querySelectorAll('.delete-block').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    blocks.splice(idx, 1);
                    renderBlockList();
                    updatePreview();
                });
            });
            document.querySelectorAll('.edit-block').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    editBlock(idx);
                });
            });
        }

        // simple edit prompt (for demo)
        function editBlock(index) {
            const block = blocks[index];
            if (block.type === 'text') {
                const newText = prompt('Edit text content:', block.content);
                if (newText !== null) blocks[index].content = newText;
            } else if (block.type === 'image') {
                const newUrl = prompt('Image URL:', block.content);
                if (newUrl !== null) blocks[index].content = newUrl;
            } else if (block.type === 'button') {
                const newLabel = prompt('Button label:', block.content);
                if (newLabel !== null) {
                    blocks[index].content = newLabel;
                    const newUrl = prompt('Button link URL:', block.url || 'https://example.com');
                    if (newUrl !== null) blocks[index].url = newUrl;
                }
            }
            renderBlockList();
            updatePreview();
        }

        // Add block functions
        addTextBtn.addEventListener('click', () => {
            blocks.push({ type: 'text', content: 'New text paragraph. Click edit to change.' });
            renderBlockList();
            updatePreview();
        });
        addImageBtn.addEventListener('click', () => {
            blocks.push({ type: 'image', content: 'https://placehold.co/600x200/9bbdf0/ffffff?text=New+Image' });
            renderBlockList();
            updatePreview();
        });
        addButtonBtn.addEventListener('click', () => {
            blocks.push({ type: 'button', content: 'Call to action', url: 'https://example.com' });
            renderBlockList();
            updatePreview();
        });

        // Build preview HTML based on state + styling
        function generatePreviewHTML() {
            const name = newsletterName.value || 'Newsletter';
            const pre = preheader.value || '';
            const bg = bgColor.value || '#f0f6ff';
            const color = textColor.value || '#222222';
            const font = fontSelect.value || 'Arial, sans-serif';

            let blocksHTML = '';
            blocks.forEach(block => {
                if (block.type === 'text') {
                    blocksHTML += `<div style="margin: 20px 0; font-size: 16px; line-height:1.5;">${block.content.replace(/\\n/g, '<br>')}</div>`;
                } else if (block.type === 'image') {
                    blocksHTML += `<div style="margin: 20px 0;"><img src="${block.content}" style="max-width:100%; height:auto; border-radius: 16px;" alt="newsletter image"></div>`;
                } else if (block.type === 'button') {
                    const url = block.url || '#';
                    blocksHTML += `<div style="margin: 30px 0; text-align:center;"><a href="${url}" style="background: #2a7faa; color: white; padding: 14px 28px; border-radius: 60px; text-decoration: none; font-weight: 600; display: inline-block;">${block.content}</a></div>`;
                }
            });

            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
</head>
<body style="margin:0; padding:20px; background:#eaf2f9; font-family: ${font};">
    <div style="max-width: 600px; margin:0 auto; background: ${bg}; color: ${color}; padding: 30px 25px; border-radius: 30px; border: 1px solid #cde1f5;">
        <!-- preheader -->
        <div style="font-size: 13px; color: #8aa5c2; margin-bottom: 20px; text-align: center;">${pre}</div>
        <h1 style="margin-top:0; color: #144a6f;">${name}</h1>
        ${blocksHTML}
        <div style="margin-top: 40px; font-size: 12px; color: #6f8fb2; text-align: center; border-top: 1px solid #c7ddfa; padding-top: 20px;">
            <p>you’re receiving this because you signed up · <a href="#" style="color: #2a6792;">unsubscribe</a></p>
        </div>
    </div>
</body>
</html>`;
        }

        function updatePreview() {
            const fullHtml = generatePreviewHTML();
            // Render inside preview div (we only render inner content, but we can embed)
            // To show same styling, we'll set inner html to a div mimicking.
            const name = newsletterName.value;
            const pre = preheader.value;
            const bg = bgColor.value;
            const color = textColor.value;
            const font = fontSelect.value;
            let blocksHTML = '';
            blocks.forEach(block => {
                if (block.type === 'text') {
                    blocksHTML += `<div style="margin: 20px 0; font-size: 16px; line-height:1.5;">${block.content.replace(/\\n/g, '<br>')}</div>`;
                } else if (block.type === 'image') {
                    blocksHTML += `<div style="margin: 20px 0;"><img src="${block.content}" style="max-width:100%; height:auto; border-radius: 16px;" alt="newsletter image"></div>`;
                } else if (block.type === 'button') {
                    blocksHTML += `<div style="margin: 30px 0; text-align:center;"><a href="${block.url || '#'}" style="background: #2a7faa; color: white; padding: 14px 28px; border-radius: 60px; text-decoration: none; font-weight: 600; display: inline-block;">${block.content}</a></div>`;
                }
            });
            previewEl.innerHTML = `
                <div style="max-width: 600px; margin:0 auto; background: ${bg}; color: ${color}; padding: 30px 25px; border-radius: 30px; border: 1px solid #cde1f5; font-family: ${font};">
                    <div style="font-size: 13px; color: #8aa5c2; margin-bottom: 20px; text-align: center;">${pre}</div>
                    <h1 style="margin-top:0; color: #144a6f;">${name}</h1>
                    ${blocksHTML}
                    <div style="margin-top: 40px; font-size: 12px; color: #6f8fb2; text-align: center; border-top: 1px solid #c7ddfa; padding-top: 20px;">
                        <p>you’re receiving this because you signed up · <a href="#" style="color: #2a6792;">unsubscribe</a></p>
                    </div>
                </div>
            `;
        }

        // Export full HTML file
        function exportHTML() {
            const fullHtml = generatePreviewHTML();
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (newsletterName.value || 'newsletter').replace(/\\s+/g, '_') + '.html';
            a.click();
            URL.revokeObjectURL(url);
        }

        // event listeners
        newsletterName.addEventListener('input', updatePreview);
        preheader.addEventListener('input', updatePreview);
        bgColor.addEventListener('input', updatePreview);
        textColor.addEventListener('input', updatePreview);
        fontSelect.addEventListener('change', updatePreview);
        refreshBtn.addEventListener('click', updatePreview);
        exportBtn.addEventListener('click', exportHTML);

        // initial render
        renderBlockList();
        updatePreview();
    })();