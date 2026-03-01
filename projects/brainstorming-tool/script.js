const canvas = document.getElementById("mindmap-canvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

const ideas = [];

const colors = {
    work: "#ff5722",
    personal: "#03a9f4",
    creative: "#4caf50"
};

// Add idea
document.getElementById("add-idea").addEventListener("click", () => {
    const text = document.getElementById("idea-input").value.trim();
    const category = document.getElementById("category").value;
    if(text){
        ideas.push({
            text,
            category,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 40
        });
        document.getElementById("idea-input").value = "";
        drawMindMap();
    }
});

// Draw mind map nodes
function drawMindMap(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ideas.forEach(idea => {
        ctx.beginPath();
        ctx.arc(idea.x, idea.y, idea.radius, 0, Math.PI*2);
        ctx.fillStyle = colors[idea.category];
        ctx.fill();
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.font = "14px Verdana";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(idea.text, idea.x, idea.y);
    });
}

// Dark/light toggle
document.getElementById("toggle-mode").addEventListener("click", ()=>{
    document.body.classList.toggle("dark-mode");
});

// Export JSON
document.getElementById("export-btn").addEventListener("click", ()=>{
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ideas));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download","ideas.json");
    dlAnchor.click();
});