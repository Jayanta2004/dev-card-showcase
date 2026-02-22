// Dream Pattern Analyzer - Word Cloud Renderer

function renderWordCloud(containerId, freqObj) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const max = Math.max(...Object.values(freqObj));
    Object.entries(freqObj).forEach(([word, count]) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.fontSize = (12 + (count / max) * 28) + 'px';
        span.style.margin = '0 8px';
        span.style.display = 'inline-block';
        span.style.color = `hsl(${Math.floor(Math.random()*360)},70%,50%)`;
        container.appendChild(span);
    });
}

window.DreamWordCloud = { renderWordCloud };
