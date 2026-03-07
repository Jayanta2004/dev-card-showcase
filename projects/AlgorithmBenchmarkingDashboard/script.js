const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const statsDiv = document.getElementById("stats");
const chartDiv = document.getElementById("chart");

function randomArray(n){
  return Array.from({length:n},()=>Math.floor(Math.random()*500));
}

/* ---------- Sorting Algorithms ---------- */

function bubbleSort(arr){
  let a=[...arr], swaps=0, comps=0;
  const start=performance.now();

  for(let i=0;i<a.length;i++){
    for(let j=0;j<a.length-i-1;j++){
      comps++;
      if(a[j]>a[j+1]){
        [a[j],a[j+1]]=[a[j+1],a[j]];
        swaps++;
      }
    }
  }

  return {time:performance.now()-start, swaps, comps};
}

function selectionSort(arr){
  let a=[...arr], swaps=0, comps=0;
  const start=performance.now();

  for(let i=0;i<a.length;i++){
    let min=i;
    for(let j=i+1;j<a.length;j++){
      comps++;
      if(a[j]<a[min]) min=j;
    }
    if(min!==i){
      [a[i],a[min]]=[a[min],a[i]];
      swaps++;
    }
  }

  return {time:performance.now()-start, swaps, comps};
}

function insertionSort(arr){
  let a=[...arr], swaps=0, comps=0;
  const start=performance.now();

  for(let i=1;i<a.length;i++){
    let key=a[i];
    let j=i-1;
    while(j>=0){
      comps++;
      if(a[j]>key){
        a[j+1]=a[j];
        swaps++;
        j--;
      } else break;
    }
    a[j+1]=key;
  }

  return {time:performance.now()-start, swaps, comps};
}

function benchmark(){
  const size=Number(document.getElementById("sizeInput").value);
  const arr=randomArray(size);

  const results={
    "Bubble Sort":bubbleSort(arr),
    "Selection Sort":selectionSort(arr),
    "Insertion Sort":insertionSort(arr)
  };

  renderResults(results);
}

function renderResults(results){
  statsDiv.innerHTML="";
  chartDiv.innerHTML="";

  let maxTime=Math.max(...Object.values(results).map(r=>r.time));

  Object.entries(results).forEach(([name,res])=>{

    const card=document.createElement("div");
    card.className="card";
    card.innerHTML=`
      <h3>${name}</h3>
      <p>Time: ${res.time.toFixed(2)} ms</p>
      <p>Comparisons: ${res.comps}</p>
      <p>Swaps: ${res.swaps}</p>
    `;
    statsDiv.appendChild(card);

    const bar=document.createElement("div");
    bar.className="bar";

    const width=(res.time/maxTime)*100;

    bar.innerHTML=`
      <div class="bar-label">${name}</div>
      <div class="bar-fill" style="width:${width}%">
        ${res.time.toFixed(2)} ms
      </div>
    `;

    chartDiv.appendChild(bar);
  });
}

runBtn.addEventListener("click",benchmark);

resetBtn.addEventListener("click",()=>{
  statsDiv.innerHTML="";
  chartDiv.innerHTML="";
});