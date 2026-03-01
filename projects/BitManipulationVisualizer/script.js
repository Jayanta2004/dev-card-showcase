const runBtn = document.getElementById("runBtn");

function toBinary(n){
  return (n >>> 0).toString(2).padStart(8,"0");
}

function renderBits(container, bin){
  container.innerHTML = "";
  bin.split("").forEach(b=>{
    const div = document.createElement("div");
    div.className = "bit " + (b==="1" ? "one":"zero");
    div.textContent = b;
    container.appendChild(div);
  });
}

runBtn.addEventListener("click", () => {
  let a = Number(document.getElementById("numA").value || 0);
  let b = Number(document.getElementById("numB").value || 0);
  const op = document.getElementById("operation").value;

  let result;

  switch(op){
    case "AND": result = a & b; break;
    case "OR": result = a | b; break;
    case "XOR": result = a ^ b; break;
    case "LEFT": result = a << 1; break;
    case "RIGHT": result = a >> 1; break;
    case "NOT": result = ~a; break;
  }

  const binA = toBinary(a);
  const binB = toBinary(b);
  const binR = toBinary(result);

  renderBits(document.getElementById("binA"), binA);
  renderBits(document.getElementById("binB"), binB);
  renderBits(document.getElementById("binResult"), binR);

  document.getElementById("resultText")
    .textContent = `Result (Decimal): ${result}`;
});