export async function bubbleSort(arr, container, speed){
  const bars = container.children;
  for(let i=0;i<arr.length-1;i++){
    for(let j=0;j<arr.length-i-1;j++){
      bars[j].style.background="red";
      bars[j+1].style.background="red";
      await new Promise(r=>setTimeout(r,speed));
      if(arr[j]>arr[j+1]){
        [arr[j],arr[j+1]]=[arr[j+1],arr[j]];
        bars[j].style.height=`${arr[j]}px`;
        bars[j+1].style.height=`${arr[j+1]}px`;
      }
      bars[j].style.background="#00f0ff";
      bars[j+1].style.background="#00f0ff";
    }
    bars[arr.length-1-i].style.background="#00ff88";
  }
}
