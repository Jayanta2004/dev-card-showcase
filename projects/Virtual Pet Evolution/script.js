let petEmoji="";
let growth=0;
let hunger=70, fun=70, energy=70;

function pick(e,el){
  petEmoji=e;
  document.querySelectorAll(".pet-option").forEach(p=>p.classList.remove("selected"));
  el.classList.add("selected");
}

function start(){
  const name=document.getElementById("petName").value;
  if(!name||!petEmoji) return alert("Select pet & name");
  document.getElementById("setup").style.display="none";
  document.getElementById("game").style.display="flex";
  document.getElementById("pet").textContent=petEmoji;
  document.getElementById("title").textContent=name;
  updateUI();
}

function updateUI(){
  document.getElementById("hungerBar").style.width=hunger+"%";
  document.getElementById("funBar").style.width=fun+"%";
  document.getElementById("energyBar").style.width=energy+"%";
  document.getElementById("growthBar").style.width=growth*10+"%";
}

function feed(){ hunger=Math.min(hunger+10,100); updateUI();}
function play(){ fun=Math.min(fun+10,100); energy=Math.max(energy-10,0); updateUI();}

function sleepPet(){
  const petEl=document.getElementById("pet");
  const zzz=document.getElementById("sleepZzz");
  const feedBtn=document.getElementById("feedBtn");
  const playBtn=document.getElementById("playBtn");
  const sleepBtn=document.getElementById("sleepBtn");

  feedBtn.disabled=true; playBtn.disabled=true; sleepBtn.disabled=true;
  petEl.classList.add("sleeping");
  zzz.style.opacity=1;

  setTimeout(()=>{
    energy=100;
    if(growth<10) growth+=1;
    petEl.style.fontSize=(80+growth*5)+"px";
    petEl.classList.remove("sleeping");
    zzz.style.opacity=0;
    feedBtn.disabled=false; playBtn.disabled=false; sleepBtn.disabled=false;
    updateUI();
  },18000000);
}

updateUI();