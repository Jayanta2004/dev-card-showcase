const input = document.getElementById("titleInput");
const output = document.getElementById("output");

input.addEventListener("keydown", function(e){

if(e.key === "Enter"){

let title = input.value.trim();
if(!title) return;

generateTitles(title);

input.value="";
}

});

function generateTitles(title){

let styles = [

`🔥 Viral: You Won't Believe ${title}`,
`🎯 Guide: Complete Guide to ${title}`,
`⚡ Simple: ${title} Made Simple`,
`📈 Growth: How ${title} Can Change Everything`,
`🎬 YouTube: Top Secrets About ${title}`

];

styles.forEach(t=>{

let div=document.createElement("div");
div.className="line";
div.textContent=t;

div.onclick=()=>{
navigator.clipboard.writeText(t);
};

output.appendChild(div);

});

}