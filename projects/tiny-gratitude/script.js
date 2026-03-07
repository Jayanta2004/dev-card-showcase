const vault = document.getElementById("vault");
const noteInput = document.getElementById("noteInput");
const count = document.getElementById("count");
const highlight = document.getElementById("highlight");

let notes = JSON.parse(localStorage.getItem("gratitudeNotes")) || [];

function render(){

vault.innerHTML="";

notes.forEach((note,i)=>{

let div=document.createElement("div");
div.className="capsule";
div.innerText="🔒 Gratitude";

div.onclick=()=>{
div.classList.toggle("open");
div.innerText=div.classList.contains("open") ? note : "🔒 Gratitude";
};

vault.appendChild(div);

});

count.innerText="Entries: "+notes.length;

localStorage.setItem("gratitudeNotes",JSON.stringify(notes));
}

document.getElementById("addBtn").onclick=()=>{

let text=noteInput.value.trim();

if(!text) return;

notes.push(text);
noteInput.value="";
render();
};

document.getElementById("highlightBtn").onclick=()=>{

if(notes.length===0) return;

let r=notes[Math.floor(Math.random()*notes.length)];

highlight.innerText="✨ "+r;
};

render();