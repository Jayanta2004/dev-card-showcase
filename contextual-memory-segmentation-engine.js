document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const segmentBtn = document.getElementById('segmentBtn');
    const segmentsContainer = document.getElementById('segmentsContainer');
    const totalSegments = document.getElementById('totalSegments');
    const avgLength = document.getElementById('avgLength');
    const coherence = document.getElementById('coherence');

    segmentBtn.addEventListener('click', function() {
        const text = inputText.value.trim();
        if (!text) {
            alert('Please enter some text to segment.');
            return;
        }

        const segments = segmentText(text);
        displaySegments(segments);
        updateStats(segments);
    });

    function segmentText(text) {
        // Simple sentence segmentation
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim());

        const segments = [];
        const segmentSize = 3; // Group into segments of 3 sentences

        for (let i = 0; i < sentences.length; i += segmentSize) {
            const segmentSentences = sentences.slice(i, i + segmentSize);
            const segmentText = segmentSentences.join('. ') + '.';
            const context = extractContext(segmentSentences);
            segments.push({
                id: segments.length + 1,
                text: segmentText,
                context: context,
                sentences: segmentSentences.length
            });
        }

        return segments;
    }

    function extractContext(sentences) {
        // Simple context extraction: first few words
        const words = sentences.join(' ').split(' ').slice(0, 5);
        return words.join(' ') + '...';
    }

    function displaySegments(segments) {
        segmentsContainer.innerHTML = '';

        if (segments.length === 0) {
            segmentsContainer.innerHTML = '<p>No segments created.</p>';
            return;
        }

        segments.forEach(segment => {
            const segmentDiv = document.createElement('div');
            segmentDiv.className = 'segment';
            segmentDiv.innerHTML = `
                <h3>Segment ${segment.id}: ${segment.context}</h3>
                <p>${segment.text}</p>
                <small>${segment.sentences} sentence(s)</small>
            `;
            segmentsContainer.appendChild(segmentDiv);
        });
    }

    function updateStats(segments) {
        totalSegments.textContent = segments.length;

        if (segments.length === 0) {
            avgLength.textContent = '0 words';
            coherence.textContent = 'N/A';
            return;
        }

        const totalWords = segments.reduce((sum, seg) => sum + seg.text.split(' ').length, 0);
        const avgWords = Math.round(totalWords / segments.length);
        avgLength.textContent = `${avgWords} words`;

        // Simple coherence score based on segment size consistency
        const avgSentences = segments.reduce((sum, seg) => sum + seg.sentences, 0) / segments.length;
        const variance = segments.reduce((sum, seg) => sum + Math.pow(seg.sentences - avgSentences, 2), 0) / segments.length;
        const coherenceScore = Math.max(0, 100 - variance * 10);
        coherence.textContent = `${Math.round(coherenceScore)}%`;
    }
});