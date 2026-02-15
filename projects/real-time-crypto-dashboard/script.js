const table = document.getElementById("cryptoTable");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const refreshBtn = document.getElementById("refreshBtn");

const totalMarketCapEl = document.getElementById("totalMarketCap");
const totalVolumeEl = document.getElementById("totalVolume");

let coins = [];

const API_URL =
"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false";

async function fetchData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        coins = data;
        updateStats(data);
        renderTable(data);
    } catch (err) {
        console.error("Error fetching data", err);
    }
}

function updateStats(data) {
    const totalMarketCap = data.reduce((sum, coin) => sum + coin.market_cap, 0);
    const totalVolume = data.reduce((sum, coin) => sum + coin.total_volume, 0);

    totalMarketCapEl.textContent =
        "$" + totalMarketCap.toLocaleString();
    totalVolumeEl.textContent =
        "$" + totalVolume.toLocaleString();
}

function renderTable(data) {
    table.innerHTML = "";

    data.forEach((coin, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <img src="${coin.image}" width="20">
                ${coin.name}
            </td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td class="${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
            </td>
            <td>$${coin.market_cap.toLocaleString()}</td>
        `;

        table.appendChild(row);
    });
}

function filterAndSort() {
    let filtered = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    const sortValue = sortSelect.value;

    if (sortValue === "market_cap_desc") {
        filtered.sort((a,b)=>b.market_cap - a.market_cap);
    } else if (sortValue === "market_cap_asc") {
        filtered.sort((a,b)=>a.market_cap - b.market_cap);
    } else if (sortValue === "price_desc") {
        filtered.sort((a,b)=>b.current_price - a.current_price);
    } else if (sortValue === "price_asc") {
        filtered.sort((a,b)=>a.current_price - b.current_price);
    }

    renderTable(filtered);
}

searchInput.addEventListener("input", filterAndSort);
sortSelect.addEventListener("change", filterAndSort);
refreshBtn.addEventListener("click", fetchData);

fetchData();
