let states = {};
let transitions = {};
let startState = null;
let finalStates = new Set();

const container = document.getElementById("statesContainer");
const resultText = document.getElementById("result");

function renderStates(active=null){
  container.innerHTML="";

  Object.keys(states).forEach(name=>{
    const div=document.createElement("div");
    div.className="state";
    div.textContent=name;

    if(name===startState) div.classList.add("start");
    if(finalStates.has(name)) div.classList.add("final");
    if(name===active) div.classList.add("active");

    container.appendChild(div);
  });
}

document.getElementById("addStateBtn").onclick=()=>{
  const name=document.getElementById("stateName").value.trim();
  if(!name) return;

  states[name]=true;
  renderStates();
};

document.getElementById("addTransitionBtn").onclick=()=>{
  const from=document.getElementById("fromState").value.trim();
  const sym=document.getElementById("symbol").value.trim();
  const to=document.getElementById("toState").value.trim();

  if(!from || !sym || !to) return;

  transitions[from] ??= {};
  transitions[from][sym]=to;
};

document.getElementById("setStartBtn").onclick=()=>{
  startState=document.getElementById("startState").value.trim();
  renderStates();
};

document.getElementById("addFinalBtn").onclick=()=>{
  const f=document.getElementById("finalState").value.trim();
  if(f) finalStates.add(f);
  renderStates();
};

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

document.getElementById("runBtn").onclick=async ()=>{
  const input=document.getElementById("testString").value;
  if(!startState) return;

  let current=startState;
  renderStates(current);

  for(let ch of input){
    await sleep(500);

    if(!transitions[current] || !transitions[current][ch]){
      resultText.textContent="Result: ❌ Rejected (No transition)";
      return;
    }

    current=transitions[current][ch];
    renderStates(current);
  }

  if(finalStates.has(current))
    resultText.textContent="Result: ✅ Accepted";
  else
    resultText.textContent="Result: ❌ Rejected";
};