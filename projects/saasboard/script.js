const ctx = document.getElementById("chart").getContext("2d");

const dataPoints = [10, 25, 15, 30, 22, 40, 35];

const userData = [
{ name: "John Doe", email: "john@example.com", status: "Active" },
{ name: "Jane Smith", email: "jane@example.com", status: "Inactive" },
{ name: "Alex Lee", email: "alex@example.com", status: "Active" }
];

const userTable = document.getElementById("userTable");

userData.forEach(user=>{
const row=document.createElement("tr");
row.innerHTML=`
<td>${user.name}</td>
<td>${user.email}</td>
<td>${user.status}</td>
`;
userTable.appendChild(row);
});

/* Simple Chart Drawing */

function drawChart(){
ctx.clearRect(0,0,600,300);

ctx.strokeStyle="#38bdf8";
ctx.beginPath();

dataPoints.forEach((point,index)=>{
let x=index*80+50;
let y=300-point*5;

if(index===0) ctx.moveTo(x,y);
else ctx.lineTo(x,y);
});

ctx.stroke();
}

drawChart();
