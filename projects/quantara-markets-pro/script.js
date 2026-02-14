const API_URL =
"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1";

const table = document.getElementById("cryptoTable");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const loading = document.getElementById("loading");
const themeToggle = document.getElementById("themeToggle");

const totalMarketCapEl = document.getElementById("totalMarketCap");
const totalVolumeEl = document.getElementById("totalVolume");
const favoriteCountEl = document.getElementById("favoriteCount");

const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");

let coins = [];
let currentPage = 1;
let perPage = 10;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/* ---------- FETCH DATA ---------- */
async function fetchData(){
loading.style.display="block";
try{
const res=await fetch(API_URL);
coins=await res.json();
updateStats();
renderChart();
renderTable();
}catch(e){
loading.innerText="Error loading data.";
}
loading.style.display="none";
}

/* ---------- STATS ---------- */
function animateValue(el,value){
let start=0;
let duration=800;
let startTime=null;

function animation(currentTime){
if(!startTime)startTime=currentTime;
let progress=currentTime-startTime;
let val=Math.min(progress/duration*value,value);
el.textContent="$"+Math.floor(val).toLocaleString();
if(progress<duration)requestAnimationFrame(animation);
}
requestAnimationFrame(animation);
}

function updateStats(){
let totalCap=coins.reduce((sum,c)=>sum+c.market_cap,0);
let totalVol=coins.reduce((sum,c)=>sum+c.total_volume,0);
animateValue(totalMarketCapEl,totalCap);
animateValue(totalVolumeEl,totalVol);
favoriteCountEl.textContent=favorites.length;
}

/* ---------- TABLE ---------- */
function renderTable(){
table.innerHTML="";

let filtered=coins.filter(c=>
c.name.toLowerCase().includes(searchInput.value.toLowerCase())
);

let sorted=[...filtered];

switch(sortSelect.value){
case "market_cap_desc":sorted.sort((a,b)=>b.market_cap-a.market_cap);break;
case "market_cap_asc":sorted.sort((a,b)=>a.market_cap-b.market_cap);break;
case "price_desc":sorted.sort((a,b)=>b.current_price-a.current_price);break;
case "price_asc":sorted.sort((a,b)=>a.current_price-b.current_price);break;
}

let start=(currentPage-1)*perPage;
let paginated=sorted.slice(start,start+perPage);

paginated.forEach((coin,index)=>{
let row=document.createElement("tr");
row.innerHTML=`
<td>${start+index+1}</td>
<td>${coin.name}</td>
<td>$${coin.current_price.toLocaleString()}</td>
<td class="${coin.price_change_percentage_24h>=0?'positive':'negative'}">
${coin.price_change_percentage_24h.toFixed(2)}%
</td>
<td>$${coin.market_cap.toLocaleString()}</td>
<td>
<button onclick="toggleFavorite('${coin.id}')">
${favorites.includes(coin.id)?"★":"☆"}
</button>
</td>
`;
table.appendChild(row);
});
}

/* ---------- FAVORITES ---------- */
function toggleFavorite(id){
if(favorites.includes(id)){
favorites=favorites.filter(f=>f!==id);
}else{
favorites.push(id);
}
localStorage.setItem("favorites",JSON.stringify(favorites));
updateStats();
renderTable();
}

/* ---------- PAGINATION ---------- */
prevPage.onclick=()=>{
if(currentPage>1){currentPage--;renderTable();}
pageNumber.textContent=currentPage;
};

nextPage.onclick=()=>{
if(currentPage<Math.ceil(coins.length/perPage)){
currentPage++;
renderTable();
}
pageNumber.textContent=currentPage;
};

/* ---------- CHART ---------- */
function renderChart(){
const ctx=document.getElementById("marketChart");
let top10=coins.slice(0,10);

new Chart(ctx,{
type:"bar",
data:{
labels:top10.map(c=>c.name),
datasets:[{
label:"Market Cap",
data:top10.map(c=>c.market_cap),
backgroundColor:"#00ff88"
}]
}
});
}

/* ---------- SEARCH DEBOUNCE ---------- */
let debounceTimeout;
searchInput.addEventListener("input",()=>{
clearTimeout(debounceTimeout);
debounceTimeout=setTimeout(()=>renderTable(),300);
});

sortSelect.addEventListener("change",renderTable);

themeToggle.onclick=()=>{
document.body.classList.toggle("light");
};

fetchData();
