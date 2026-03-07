const colors=["red","green","blue","yellow"];
const values=["0","1","2","3","4","5","6","7","8","9","Skip","+2"];

let deck=[],player=[],computer=[],discard,currentColor,playerTurn=true;

function init(){
  deck=[];player=[];computer=[];
  for(let c of colors){
    for(let v of values){
      deck.push({color:c,value:v});
    }
  }
  deck.sort(()=>Math.random()-0.5);

  for(let i=0;i<7;i++){
    player.push(deck.pop());
    computer.push(deck.pop());
  }

  discard=deck.pop();
  currentColor=discard.color;
  playerTurn=true;
  document.getElementById("status").innerText="Your Turn";
  render();
}

function render(){
  const pDiv=document.getElementById("playerHand");
  const cDiv=document.getElementById("computerCards");
  pDiv.innerHTML="";
  cDiv.innerHTML="";

  player.forEach((card,i)=>{
    let div=document.createElement("div");
    div.className="card "+card.color;
    div.innerText=card.value;
    div.onclick=()=>playCard(i);
    pDiv.appendChild(div);
  });

  for(let i=0;i<computer.length;i++){
    let back=document.createElement("div");
    back.className="card-back";
    cDiv.appendChild(back);
  }

  let discardDiv=document.getElementById("discard");
  discardDiv.className="card "+discard.color;
  discardDiv.innerText=discard.value;
}

function validMove(card){
  return card.color===currentColor || card.value===discard.value;
}

function playCard(i){
  if(!playerTurn)return;

  let card=player[i];
  if(validMove(card)){
    discard=card;
    currentColor=card.color;
    player.splice(i,1);
    applySpecial(card,"computer");
    playerTurn=false;
    render();
    checkWinner();
    setTimeout(computerMove,1000);
  }else{
    document.getElementById("status").innerText="Invalid Move!";
  }
}

function computerMove(){
  for(let i=0;i<computer.length;i++){
    if(validMove(computer[i])){
      let card=computer[i];
      discard=card;
      currentColor=card.color;
      computer.splice(i,1);
      applySpecial(card,"player");
      playerTurn=true;
      render();
      checkWinner();
      document.getElementById("status").innerText="Your Turn";
      return;
    }
  }
  computer.push(deck.pop());
  playerTurn=true;
  render();
  document.getElementById("status").innerText="Your Turn";
}

function applySpecial(card,target){
  if(card.value==="+2"){
    if(target==="player"){
      player.push(deck.pop(),deck.pop());
    }else{
      computer.push(deck.pop(),deck.pop());
    }
  }

  if(card.value==="Skip"){
    if(target==="player"){
      playerTurn=false;
      setTimeout(computerMove,1000);
    }
  }
}

document.getElementById("draw").onclick=function(){
  if(!playerTurn)return;
  player.push(deck.pop());
  render();
};

function checkWinner(){
  if(player.length===0){
    document.getElementById("status").innerText="🎉 You Win!";
    playerTurn=false;
  }
  if(computer.length===0){
    document.getElementById("status").innerText="💻 Computer Wins!";
    playerTurn=false;
  }
}

function restart(){
  init();
}

init();