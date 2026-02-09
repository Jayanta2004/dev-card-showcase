
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
canvas.width=800;
canvas.height=500;

let img=new Image();
let rotation=0;
let flipH=1;
let flipV=1;
let erasing=false;
let cropping=false;
let startX,startY;

const overlay=document.getElementById('overlay');
const downloadBtn=document.getElementById('download');

const brightness=document.getElementById('brightness');
const contrast=document.getElementById('contrast');
const saturation=document.getElementById('saturation');

function triggerUpload(){
document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change',e=>{
const file=e.target.files[0];
if(!file)return;

img.onload=()=>{
overlay.style.display='none';
downloadBtn.style.display='block';
draw();
};

img.src=URL.createObjectURL(file);
});

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.save();

ctx.filter=`brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`;

ctx.translate(canvas.width/2,canvas.height/2);
ctx.scale(flipH,flipV);
ctx.rotate(rotation*Math.PI/180);

ctx.drawImage(img,-300,-200,600,400);
ctx.restore();
}

[brightness,contrast,saturation].forEach(sl=>{
sl.addEventListener('input',()=>{
updateLabels();
draw();
});
});

function updateLabels(){
bVal.textContent=brightness.value+'%';
cVal.textContent=contrast.value+'%';
sVal.textContent=saturation.value+'%';
}

function rotate(val){rotation+=val;draw();}

function flip(dir){
if(dir==='h')flipH*=-1;
else flipV*=-1;
draw();
}

/* ERASER */
function toggleEraser(){erasing=!erasing;cropping=false;}

canvas.addEventListener('mousemove',e=>{
if(!erasing||!img.src)return;
ctx.globalCompositeOperation='destination-out';
ctx.beginPath();
ctx.arc(e.offsetX,e.offsetY,18,0,Math.PI*2);
ctx.fill();
ctx.globalCompositeOperation='source-over';
});

/* CROP */
function enableCrop(){cropping=true;erasing=false;}

canvas.addEventListener('mousedown',e=>{
if(!cropping)return;
startX=e.offsetX;
startY=e.offsetY;
});

canvas.addEventListener('mouseup',e=>{
if(!cropping)return;

let w=e.offsetX-startX;
let h=e.offsetY-startY;

let data=ctx.getImageData(startX,startY,w,h);
canvas.width=w;
canvas.height=h;
ctx.putImageData(data,0,0);
cropping=false;
});

/* TEXT */
function addText(){
const text=prompt('Enter text');
if(!text)return;

ctx.font='40px Segoe UI';
ctx.fillStyle='white';
ctx.fillText(text,50,80);
}

function downloadImage(){
const a=document.createElement('a');
a.download='imageular.png';
a.href=canvas.toDataURL();
a.click();
}

function resetImage(){
rotation=0;flipH=1;flipV=1;
brightness.value=100;
contrast.value=100;
saturation.value=100;
draw();
updateLabels();
}
