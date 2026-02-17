
const container = document.getElementById("cryptoContainer");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

let coins = [];

async function fetchData(){
try{
const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1");
coins = await res.json();
displayCoins(coins);
}catch(error){
container.innerHTML="<p>Error fetching data</p>";
}
}

function displayCoins(data){
container.innerHTML="";
data.forEach(coin=>{
const card = document.createElement("div");
card.classList.add("card");

const changeClass = coin.price_change_percentage_24h >=0 ? "positive" : "negative";

card.innerHTML=`
<h3>${coin.name}</h3>
<p>Price: $${coin.current_price}</p>
<p>Market Cap: $${coin.market_cap}</p>
<p class="${changeClass}">
24h: ${coin.price_change_percentage_24h.toFixed(2)}%
</p>
`;

container.appendChild(card);
});
}

searchInput.addEventListener("input", ()=>{
const filtered = coins.filter(c =>
c.name.toLowerCase().includes(searchInput.value.toLowerCase())
);
displayCoins(filtered);
});

sortSelect.addEventListener("change", ()=>{
let sorted = [...coins];

if(sortSelect.value==="price"){
sorted.sort((a,b)=>b.current_price-a.current_price);
}else{
sorted.sort((a,b)=>b.market_cap-a.market_cap);
}

displayCoins(sorted);
});

fetchData();
