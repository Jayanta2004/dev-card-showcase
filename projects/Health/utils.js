function updateProgress(current, goal, progressId, statsId, label){
  let percent=Math.min((current/goal)*100,100);
  document.getElementById(progressId).style.width=percent+"%";
  document.getElementById(statsId).innerText=current+" / "+goal+" "+label;
}