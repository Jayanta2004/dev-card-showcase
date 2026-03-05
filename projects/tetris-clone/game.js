const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;

const scoreEl = document.getElementById("score");

let score = 0;

const COLORS = {
I: "#00FFFF",
O: "#FFFF00",
T: "#AA00FF",
S: "#00FF00",
Z: "#FF0000",
J: "#0000FF",
L: "#FF8800"
};

const SHAPES = {
I: [[1,1,1,1]],
O: [[1,1],[1,1]],
T: [[0,1,0],[1,1,1]],
S: [[0,1,1],[1,1,0]],
Z: [[1,1,0],[0,1,1]],
J: [[1,0,0],[1,1,1]],
L: [[0,0,1],[1,1,1]]
};

let board = Array.from({length:ROWS},()=>Array(COLS).fill(0));

const pieces = ["I","O","T","S","Z","J","L"];

function randomPiece(){
const type = pieces[Math.floor(Math.random()*pieces.length)];
return {
type,
shape: SHAPES[type],
x: 3,
y: 0
};
}

let piece = randomPiece();

function drawBlock(x,y,color){
ctx.fillStyle = color;
ctx.fillRect(x*BLOCK,y*BLOCK,BLOCK,BLOCK);
ctx.strokeStyle = "#111";
ctx.strokeRect(x*BLOCK,y*BLOCK,BLOCK,BLOCK);
}

function drawBoard(){
for(let y=0;y<ROWS;y++){
for(let x=0;x<COLS;x++){
if(board[y][x]){
drawBlock(x,y,board[y][x]);
}
}
}
}

function drawPiece(){
piece.shape.forEach((row,r)=>{
row.forEach((value,c)=>{
if(value){
drawBlock(piece.x+c,piece.y+r,COLORS[piece.type]);
}
});
});
}

function collision(px,py,shape){
for(let r=0;r<shape.length;r++){
for(let c=0;c<shape[r].length;c++){
if(!shape[r][c]) continue;

let x = px+c;
let y = py+r;

if(x<0 || x>=COLS || y>=ROWS) return true;
if(y>=0 && board[y][x]) return true;
}
}
return false;
}

function merge(){
piece.shape.forEach((row,r)=>{
row.forEach((value,c)=>{
if(value){
board[piece.y+r][piece.x+c] = COLORS[piece.type];
}
});
});
}

function clearLines(){
for(let y=ROWS-1;y>=0;y--){
if(board[y].every(cell=>cell)){
board.splice(y,1);
board.unshift(Array(COLS).fill(0));
score+=100;
scoreEl.textContent = score;
y++;
}
}
}

function rotate(shape){
return shape[0].map((_,i)=>shape.map(row=>row[i])).reverse();
}

document.addEventListener("keydown",e=>{

if(e.key==="ArrowLeft"){
if(!collision(piece.x-1,piece.y,piece.shape)) piece.x--;
}

if(e.key==="ArrowRight"){
if(!collision(piece.x+1,piece.y,piece.shape)) piece.x++;
}

if(e.key==="ArrowDown"){
drop();
}

if(e.key==="ArrowUp"){
const rotated = rotate(piece.shape);
if(!collision(piece.x,piece.y,rotated)){
piece.shape = rotated;
}
}

if(e.code==="Space"){
while(!collision(piece.x,piece.y+1,piece.shape)){
piece.y++;
}
drop();
}

});

function drop(){

if(!collision(piece.x,piece.y+1,piece.shape)){
piece.y++;
}
else{

merge();
clearLines();
piece = randomPiece();

if(collision(piece.x,piece.y,piece.shape)){
alert("Game Over");
location.reload();
}

}

}

let dropCounter = 0;
let dropInterval = 700;
let lastTime = 0;

function update(time=0){

const delta = time-lastTime;
lastTime = time;

dropCounter += delta;

if(dropCounter > dropInterval){
drop();
dropCounter = 0;
}

ctx.clearRect(0,0,canvas.width,canvas.height);

drawBoard();
drawPiece();

requestAnimationFrame(update);

}

update();