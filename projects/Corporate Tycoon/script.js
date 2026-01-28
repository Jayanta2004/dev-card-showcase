// Levels data
 const levels = [
  {
    name: "Single Room",
    svg: `<svg viewBox="0 0 400 350">
            <rect x="70" y="100" width="200" height="200" fill="#8d6e63" stroke="#5d4037" stroke-width="2"/>
          </svg>`,
    hint: "Complete freelance tasks to gain customers",
    thresholds: { revenue: 1000, employees: 2, customers: 5 }
  },
  {
    name: "Small Office",
    svg: `<svg viewBox="0 0 400 350">
            <rect x="50" y="80" width="100" height="100" fill="#4caf50" stroke="#2e7d32" stroke-width="2"/>
          </svg>`,
    hint: "Hire interns and take projects",
    thresholds: { revenue: 3000, employees: 4, customers: 10 }
  },
{
  name: "Big Office",
  svg: `<svg viewBox="0 0 400 350">
          <rect x="30" y="40" width="240" height="260" fill="#2196f3" stroke="#1565c0" stroke-width="2"/>
          <rect x="55" y="60" width="30" height="30" fill="#fff"/>
          <rect x="95" y="60" width="30" height="30" fill="#fff"/>
          <rect x="135" y="60" width="30" height="30" fill="#fff"/>
        </svg>`,
  hint: "Expand employees & projects",
  thresholds: { revenue: 8000, employees: 8, customers: 20 }
},
{
  name: "Two-Story Office",
  svg: `<svg viewBox="0 0 400 350">
          <rect x="20" y="40" width="180" height="80" fill="#ff9800" stroke="#ef6c00" stroke-width="2"/>
          <rect x="20" y="130" width="180" height="80" fill="#ffb74d" stroke="#ef6c00" stroke-width="2"/>
          <rect x="50" y="55" width="25" height="25" fill="#fff"/>
          <rect x="95" y="55" width="25" height="25" fill="#fff"/>
          <rect x="140" y="55" width="25" height="25" fill="#fff"/>
          <rect x="50" y="145" width="25" height="25" fill="#fff"/>
          <rect x="95" y="145" width="25" height="25" fill="#fff"/>
          <rect x="140" y="145" width="25" height="25" fill="#fff"/>
        </svg>`,
  hint: "Your company has 2 floors!",
  thresholds: { revenue: 15000, employees: 15, customers: 35 }
},
{
  name: "Skyscraper",
  svg: `<svg viewBox="0 0 400 350">
          <rect x="20" y="10" width="60" height="200" fill="#9c27b0"/>
          <rect x="90" y="0" width="60" height="220" fill="#8e24aa"/>
          <rect x="160" y="20" width="60" height="200" fill="#7b1fa2"/>
        </svg>`,
  hint: "Global HQ! Congrats!",
  thresholds: { revenue: 30000, employees: 30, customers: 50 }
}

];


let company={level:0,revenue:0,employees:0,customers:0};
const buildingDiv=document.getElementById("building");
const hintDiv=document.getElementById("hint");
const revBar=document.getElementById("rev-bar");
const empBar=document.getElementById("emp-bar");
const custBar=document.getElementById("cust-bar");

function render(){
  document.getElementById("rev").textContent=company.revenue;
  document.getElementById("emp").textContent=company.employees;
  document.getElementById("cust").textContent=company.customers;
  document.getElementById("lvl").textContent=company.level+1;
  const t=levels[company.level].thresholds;
  revBar.style.width=Math.min(100,(company.revenue/t.revenue*100))+"%";
  empBar.style.width=Math.min(100,(company.employees/t.employees*100))+"%";
  custBar.style.width=Math.min(100,(company.customers/t.customers*100))+"%";
}

function increase(type){
  if(type==="revenue") company.revenue += Math.floor(Math.random()*1000+500);
  if(type==="employees") company.employees += 1;
  if(type==="customers") company.customers += Math.floor(Math.random()*5+1);
  render();
  checkLevelUp();
}

function checkLevelUp(){
  const t=levels[company.level].thresholds;
  if(company.revenue>=t.revenue && company.employees>=t.employees && company.customers>=t.customers){
    company.level++;
    if(company.level>=levels.length){ company.level=levels.length-1; hintDiv.textContent="🏆 Maximum Level reached!"; return; }
    buildingDiv.innerHTML=levels[company.level].svg;
    hintDiv.textContent="🚀 Level Up! "+levels[company.level].hint;
    render();
  }
}

buildingDiv.innerHTML=levels[company.level].svg;
hintDiv.textContent=levels[company.level].hint;
render();