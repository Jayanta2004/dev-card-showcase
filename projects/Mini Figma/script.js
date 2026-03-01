const canvas = document.getElementById("canvas");
const fillColor = document.getElementById("fillColor");
const textColor = document.getElementById("textColor");
const bgColor = document.getElementById("bgColor");
let selectedShape = null;

// ---------- PAGE SIZE ----------
function changePageSize() {
  const size = document.getElementById("pageSize").value;
  if (size === "custom") {
    const w = prompt("Width px?");
    const h = prompt("Height px?");
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    return;
  }
  if (size === "A4") {
    canvas.style.width = "794px";
    canvas.style.height = "1123px";
    return;
  }
  const [w,h] = size.split("x");
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
}

// ---------- CANVAS BG ----------
function setCanvasBG() {
  canvas.style.background = bgColor.value;
}

// ---------- ADD SHAPES ----------
function addShape(type) {
  const shape = document.createElement("div");
  shape.className = "shape";
  shape.dataset.type = type;
  shape.style.left = "50px";
  shape.style.top = "50px";
  shape.style.background = fillColor.value;
  shape.style.zIndex = canvas.children.length + 1;

  // Shape dimensions and styles
  if(type==='rect'){ shape.style.width='100px'; shape.style.height='60px'; }
  if(type==='circle'){ shape.style.width='80px'; shape.style.height='80px'; shape.style.borderRadius='50%'; }
  if(type==='ellipse'){ shape.style.width='120px'; shape.style.height='60px'; shape.style.borderRadius='50% / 50%'; }
  if(type==='triangle'){ 
    shape.style.width='0'; shape.style.height='0';
    shape.style.borderLeft='40px solid transparent';
    shape.style.borderRight='40px solid transparent';
    shape.style.borderBottom='80px solid ' + fillColor.value;
    shape.style.background='transparent';
  }
  if(type==='line'){ shape.style.width='100px'; shape.style.height='2px'; shape.style.background=fillColor.value; shape.style.border='none'; }

  if(type==='text'){
    shape.className='shape text-box';
    shape.style.width='120px';
    shape.style.height='40px';
    shape.style.color = textColor.value;
    shape.style.background = 'transparent';
    shape.innerText='Double-click to edit';
    
    // Enable editing on double click
    shape.ondblclick = () => {
        shape.contentEditable = true;
        shape.focus();
    };
  }

  // Dragging
  shape.onmousedown = dragMouseDown;

  // Select shape on click
  shape.onclick = () => selectShape(shape);

  canvas.appendChild(shape);
  selectShape(shape);
}

// ---------- IMAGE ----------
function addImage(){
  let url = document.getElementById("imgURL").value;
  if(!url) return alert("Enter image URL");
  const shape = document.createElement("div");
  shape.className = "shape";
  shape.dataset.type="image";
  shape.style.width="150px";
  shape.style.height="100px";
  shape.style.left='50px';
  shape.style.top='50px';
  shape.style.background='transparent';
  shape.style.border='2px solid #38bdf8';

  const img = document.createElement("img");
  img.src = url;
  shape.appendChild(img);

  shape.onmousedown = dragMouseDown;
  shape.onclick = () => selectShape(shape);
  canvas.appendChild(shape);
  selectShape(shape);
}

// ---------- SELECT ----------
function selectShape(shape){
  if(selectedShape) selectedShape.classList.remove('selected');
  selectedShape = shape;
  shape.classList.add('selected');
}

// ---------- DRAG ----------
function dragMouseDown(e){
  const el = e.target.closest('.shape');

  // If it's a text box currently being edited, do not drag
  if(el.classList.contains('text-box') && document.activeElement === el){
    return; // allow typing
  }

  selectShape(el);
  e.preventDefault();

  let shiftX = e.clientX - el.getBoundingClientRect().left;
  let shiftY = e.clientY - el.getBoundingClientRect().top;

  function moveAt(event){
    let x = event.clientX - shiftX - canvas.getBoundingClientRect().left;
    let y = event.clientY - shiftY - canvas.getBoundingClientRect().top;
    x=Math.max(0,Math.min(canvas.clientWidth-el.offsetWidth,x));
    y=Math.max(0,Math.min(canvas.clientHeight-el.offsetHeight,y));
    el.style.left=x+'px';
    el.style.top=y+'px';
  }

  function stopMove(){
    document.removeEventListener('mousemove',moveAt);
    document.removeEventListener('mouseup',stopMove);
  }

  document.addEventListener('mousemove',moveAt);
  document.addEventListener('mouseup',stopMove);
}

// ---------- CLEAR ----------
function clearCanvas(){
  canvas.innerHTML='';
  selectedShape=null;
}

// ---------- SAVE / LOAD ----------
function saveCanvas(){
  const data=[];
  Array.from(canvas.children).forEach(c=>{
    data.push({
      type:c.dataset.type,
      left:c.style.left,
      top:c.style.top,
      width:c.style.width,
      height:c.style.height,
      background:c.style.background,
      color:c.style.color,
      zIndex:c.style.zIndex,
      innerHTML:c.innerHTML
    });
  });
  localStorage.setItem('miniFigmaPro',JSON.stringify(data));
  alert("Canvas saved ✅");
}

function loadCanvas(){
  const data=JSON.parse(localStorage.getItem('miniFigmaPro')||"[]");
  clearCanvas();
  data.forEach(d=>{
    const shape=document.createElement('div');
    shape.className='shape';
    shape.dataset.type=d.type;
    shape.style.left=d.left;
    shape.style.top=d.top;
    shape.style.width=d.width;
    shape.style.height=d.height;
    shape.style.background=d.background;
    shape.style.color=d.color;
    shape.style.zIndex=d.zIndex;
    shape.innerHTML=d.innerHTML;

    if(d.type==='text'){
        shape.className='shape text-box';
        shape.ondblclick = () => { shape.contentEditable=true; shape.focus(); };
    }

    shape.onmousedown = dragMouseDown;
    shape.onclick = () => selectShape(shape);
    canvas.appendChild(shape);
  });
}

// ---------- CLICK OUTSIDE TEXT TO DISABLE EDIT ----------
document.addEventListener('click', (e) => {
  if(selectedShape && selectedShape.dataset.type === 'text'){
    if(e.target !== selectedShape){
      selectedShape.contentEditable = false;
    }
  }
});
