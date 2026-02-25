document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('input-text');
    const chunkSizeInput = document.getElementById('chunk-size');
    const overlapInput = document.getElementById('overlap');
    const partitionBtn = document.getElementById('partition-btn');
    const output = document.getElementById('output');

    partitionBtn.addEventListener('click', partitionContext);

    function partitionContext() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to partition.');
            return;
        }

        const chunkSize = parseInt(chunkSizeInput.value);
        const overlap = parseInt(overlapInput.value);

        const chunks = partitionText(text, chunkSize, overlap);
        displayChunks(chunks);
    }

    function partitionText(text, chunkSize, overlap) {
        const chunks = [];
        let start = 0;

        while (start < text.length) {
            let end = start + chunkSize;
            
            // If we're not at the end, try to find a good breaking point
            if (end < text.length) {
                // Look for sentence endings within the last 100 characters
                const searchStart = Math.max(start, end - 100);
                let breakPoint = end;
                
                for (let i = end - 1; i >= searchStart; i--) {
                    if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
                        breakPoint = i + 1;
                        break;
                    }
                }
                
                end = breakPoint;
            }

            const chunk = text.slice(start, end);
            chunks.push({
                content: chunk,
                start: start,
                end: end,
                length: chunk.length
            });

            // Move start position, considering overlap
            start = Math.max(start + 1, end - overlap);
        }

        return chunks;
    }

    function displayChunks(chunks) {
        output.innerHTML = '';
        
        chunks.forEach((chunk, index) => {
            const chunkDiv = document.createElement('div');
            chunkDiv.className = 'chunk';
            
            const header = document.createElement('div');
            header.className = 'chunk-header';
            header.textContent = `Chunk ${index + 1} (Characters: ${chunk.start}-${chunk.end}, Length: ${chunk.length})`;
            
            const content = document.createElement('div');
            content.className = 'chunk-content';
            content.textContent = chunk.content;
            
            chunkDiv.appendChild(header);
            chunkDiv.appendChild(content);
            output.appendChild(chunkDiv);
        });
    }
});