const attackSelect=document.getElementById("attackSelect")
const defenseSelect=document.getElementById("defenseSelect")
const simulateBtn=document.getElementById("simulateBtn")
const result=document.getElementById("result")

simulateBtn.onclick=simulate

function simulate(){

const attack=attackSelect.value
const defense=defenseSelect.value

let success=true
let message=""

if(attack==="sql" && defense==="validation") success=false
if(attack==="ddos" && defense==="ratelimit") success=false
if(attack==="bruteforce" && defense==="mfa") success=false
if(attack==="phishing" && defense==="firewall") success=false

if(success){

message="⚠️ Attack Successful!"

result.style.color="red"

}else{

message="🛡 Defense Successful!"

result.style.color="lime"

}

result.textContent=message

}