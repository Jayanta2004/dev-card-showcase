const textInput = document.getElementById("textInput");
const generateBtn = document.getElementById("generateBtn");
const tagsContainer = document.getElementById("tagsContainer");
const keywordStats = document.getElementById("keywordStats");

generateBtn.addEventListener("click", generateTags);

function generateTags() {
    const text = textInput.value.trim().toLowerCase();
    if (!text) return;

    const words = text.match(/\b\w+\b/g);
    if (!words) return;

    // Count frequency
    const freqMap = {};
    words.forEach(word => {
        if (word.length > 2) { // ignore tiny words
            freqMap[word] = (freqMap[word] || 0) + 1;
        }
    });

    // Sort by frequency
    const sortedWords = Object.entries(freqMap).sort((a,b) => b[1]-a[1]);
    const topWords = sortedWords.slice(0, 10).map(entry => entry[0]);

    // Render tags
    tagsContainer.innerHTML = '';
    topWords.forEach(word => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.textContent = word;
        tagsContainer.appendChild(tag);
    });

    // Render analytics
    keywordStats.innerHTML = '';
    sortedWords.slice(0, 5).forEach(([word, count]) => {
        const p = document.createElement('p');
        p.textContent = `${word} → ${count} occurrence${count>1?'s':''}`;
        keywordStats.appendChild(p);
    });
}