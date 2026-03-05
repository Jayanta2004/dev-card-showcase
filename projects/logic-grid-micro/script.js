const people = ["Alex","Sam","Mia"];
const drinks = ["Tea","Coffee","Juice"];

const solution = {
Alex:"Tea",
Sam:"Coffee",
Mia:"Juice"
};

let gridState = {};
let progress = 0;

const grid = document.getElementById("grid");
const progressBar = document.getElementById("progress");

function createGrid(){

grid.innerHTML="";

grid.appendChild(header(""));

drinks.forEach(d=>{
grid.appendChild(header(d));
});

people.forEach(p=>{
grid.appendChild(header(p));

drinks.forEach(d=>{
const cell=document.createElement("div");
cell.className="cell";
cell.dataset.person=p;
cell.dataset.drink=d;

cell.onclick=()=>toggle(cell);

grid.appendChild(cell);
});
});
}

function header(text){
const h=document.createElement("div");
h.className="cell header";
h.innerText=text;
return h;
}

function toggle(cell){

const key=cell.dataset.person+"-"+cell.dataset.drink;

if(!gridState[key]){
gridState[key]="true";
cell.classList.add("true");

check(cell);

}else if(gridState[key]=="true"){
gridState[key]="false";
cell.classList.remove("true");
cell.classList.add("false");

}else{
delete gridState[key];
cell.classList.remove("false");
}
}

function check(cell){

const p=cell.dataset.person;
const d=cell.dataset.drink;

if(solution[p]===d){

progress+=10;
progressBar.style.width=progress+"%";

autoEliminate(p,d);

if(progress>=30){
alert("Puzzle solved!");
}

}else{

cell.classList.add("shake");
setTimeout(()=>cell.classList.remove("shake"),300);
}

}

function autoEliminate(person,drink){

document.querySelectorAll(".cell").forEach(c=>{

if(
(c.dataset.person===person && c.dataset.drink!==drink) ||
(c.dataset.drink===drink && c.dataset.person!==person)
){
c.classList.add("false");
}

});

}

document.getElementById("reset").onclick=()=>{
gridState={};
progress=0;
progressBar.style.width="0%";
createGrid();
};

document.getElementById("hint").onclick=()=>{
alert("Hint: Sam drinks Coffee");
};

createGrid();