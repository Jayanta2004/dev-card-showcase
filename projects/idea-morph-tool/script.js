let count = 0;
let favCount = 0;
let ideas = [];

function morphIdea() {
    const base = document.getElementById("baseIdea").value.trim();
    if (!base) return;

    const strategy = document.getElementById("strategy").value;
    const tone = document.getElementById("tone").value;
    const audience = document.getElementById("audience").value;

    const morphed = generateIdea(base, strategy, tone, audience);

    createMorphCard(morphed);
    ideas.push(morphed);
    count++;
    document.getElementById("count").textContent = count;
}

function generateIdea(base, strategy, tone, audience) {
    return `${tone.toUpperCase()} ${strategy.toUpperCase()} version of "${base}" designed for ${audience}`;
}

function createMorphCard(text) {
    const container = document.getElementById("morphResults");
    const div = document.createElement("div");
    div.className = "morph-card";
    div.textContent = text;

    div.style.top = Math.random() * 200 + "px";
    div.style.left = Math.random() * 600 + "px";

    div.onclick = () => {
        favCount++;
        document.getElementById("favCount").textContent = favCount;
        div.style.background = "#00ffcc";
    };

    container.appendChild(div);
}

function exportIdeas() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ideas));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "morphed_ideas.json");
    dl.click();
}