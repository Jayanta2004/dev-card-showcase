const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

let messages = [];

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e=>{
if(e.key==="Enter") sendMessage();
});

function sendMessage(){
const text = userInput.value.trim();
if(!text) return;

addMessage(text,"user");
userInput.value="";

setTimeout(()=>{
botReply(text);
},500);
}

function addMessage(text,type){
const msg = document.createElement("div");
msg.classList.add("message",type);
msg.textContent=text;
chatBox.appendChild(msg);
chatBox.scrollTop=chatBox.scrollHeight;

messages.push({type,text});
}

function botReply(userText){
const response = generateFakeResponse(userText);
typeEffect(response);
}

function generateFakeResponse(input){
return "AI Response: I understand your message about \""+input+"\". This is a simulated intelligent reply.";
}

function typeEffect(text){
let index=0;
const msg = document.createElement("div");
msg.classList.add("message","bot");
chatBox.appendChild(msg);

const interval = setInterval(()=>{
msg.textContent += text[index];
index++;
chatBox.scrollTop=chatBox.scrollHeight;

if(index>=text.length){
clearInterval(interval);
messages.push({type:"bot",text});
}
},20);
}
