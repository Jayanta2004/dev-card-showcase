// Sustainable Shopping Assistant
// Simple demo with local data and tracking

const ecoProducts = [
    { name: "Bamboo Toothbrush", carbon: 0.2 },
    { name: "Reusable Water Bottle", carbon: 0.5 },
    { name: "Organic Cotton T-Shirt", carbon: 2.1 },
    { name: "Solar Power Bank", carbon: 1.3 },
    { name: "LED Light Bulb", carbon: 0.4 },
    { name: "Compostable Phone Case", carbon: 0.7 }
];

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const productResults = document.getElementById('product-results');
const compareList = document.getElementById('compare-list');
const trackForm = document.getElementById('track-form');
const purchaseHistory = document.getElementById('purchase-history');
const totalCarbon = document.getElementById('total-carbon');

let compareProducts = [];
let purchases = JSON.parse(localStorage.getItem('sustainablePurchases') || '[]');

function renderProducts(products) {
    productResults.innerHTML = '';
    if (products.length === 0) {
        productResults.innerHTML = '<p>No eco-friendly products found.</p>';
        return;
    }
    products.forEach((prod, idx) => {
        const div = document.createElement('div');
        div.className = 'product-result';
        div.innerHTML = `<strong>${prod.name}</strong> <span style="color:#bdbdbd;">(${prod.carbon} kg CO₂)</span> <button data-idx="${idx}" class="add-compare">Compare</button>`;
        productResults.appendChild(div);
    });
    document.querySelectorAll('.add-compare').forEach(btn => {
        btn.onclick = function() {
            const prod = products[parseInt(btn.getAttribute('data-idx'))];
            if (!compareProducts.find(p => p.name === prod.name)) {
                compareProducts.push(prod);
                renderCompare();
            }
        };
    });
}

function renderCompare() {
    compareList.innerHTML = '';
    if (compareProducts.length === 0) {
        compareList.innerHTML = '<p>No products to compare.</p>';
        return;
    }
    compareProducts.forEach((prod, idx) => {
        const div = document.createElement('div');
        div.className = 'compare-item';
        div.innerHTML = `<strong>${prod.name}</strong> <span style="color:#bdbdbd;">${prod.carbon} kg CO₂</span> <button data-idx="${idx}" class="remove-compare">Remove</button>`;
        compareList.appendChild(div);
    });
    document.querySelectorAll('.remove-compare').forEach(btn => {
        btn.onclick = function() {
            compareProducts.splice(parseInt(btn.getAttribute('data-idx')), 1);
            renderCompare();
        };
    });
}

function renderPurchases() {
    purchaseHistory.innerHTML = '';
    let total = 0;
    if (purchases.length === 0) {
        purchaseHistory.innerHTML = '<li>No purchases tracked yet.</li>';
    } else {
        purchases.forEach((p, idx) => {
            total += p.carbon;
            const li = document.createElement('li');
            li.innerHTML = `<span>${p.name} <span style='color:#bdbdbd;'>(${p.carbon} kg CO₂)</span></span> <button data-idx="${idx}" class="remove-purchase">Remove</button>`;
            purchaseHistory.appendChild(li);
        });
    }
    totalCarbon.textContent = `Total Carbon Footprint: ${total.toFixed(2)} kg CO₂`;
    document.querySelectorAll('.remove-purchase').forEach(btn => {
        btn.onclick = function() {
            purchases.splice(parseInt(btn.getAttribute('data-idx')), 1);
            localStorage.setItem('sustainablePurchases', JSON.stringify(purchases));
            renderPurchases();
        };
    });
}

searchBtn.onclick = function() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = ecoProducts.filter(p => p.name.toLowerCase().includes(q));
    renderProducts(filtered);
};

trackForm.onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('purchase-name').value.trim();
    const carbon = parseFloat(document.getElementById('purchase-carbon').value);
    if (!name || isNaN(carbon)) return;
    purchases.push({ name, carbon });
    localStorage.setItem('sustainablePurchases', JSON.stringify(purchases));
    renderPurchases();
    trackForm.reset();
};

// Initial renders
renderProducts(ecoProducts);
renderCompare();
renderPurchases();
