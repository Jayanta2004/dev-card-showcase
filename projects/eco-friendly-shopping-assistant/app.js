// Eco-Friendly Shopping Assistant

const products = [
  {
    name: "Bamboo Toothbrush",
    brand: "EcoBrush",
    category: "Personal Care",
    ecoRating: 9.2,
    ratingLabel: "Excellent",
    description: "Biodegradable handle, BPA-free bristles, compostable packaging.",
    certifications: ["FSC", "Vegan"],
    price: 3.99
  },
  {
    name: "Reusable Grocery Bag",
    brand: "GreenBag Co.",
    category: "Home & Kitchen",
    ecoRating: 8.7,
    ratingLabel: "Great",
    description: "Made from 100% recycled plastic bottles.",
    certifications: ["GOTS"],
    price: 2.49
  },
  {
    name: "Organic Cotton T-Shirt",
    brand: "EarthWear",
    category: "Clothing",
    ecoRating: 8.9,
    ratingLabel: "Great",
    description: "GOTS certified organic cotton, fair trade manufacturing.",
    certifications: ["GOTS", "Fair Trade"],
    price: 19.99
  },
  {
    name: "Solar Power Bank",
    brand: "SunCharge",
    category: "Electronics",
    ecoRating: 7.8,
    ratingLabel: "Good",
    description: "Charges via solar, made with recycled plastics.",
    certifications: ["Energy Star"],
    price: 29.99
  },
  {
    name: "Compostable Phone Case",
    brand: "EcoShell",
    category: "Electronics",
    ecoRating: 8.3,
    ratingLabel: "Great",
    description: "Plant-based, fully compostable in home compost.",
    certifications: ["OK Compost"],
    price: 12.99
  }
];

let greenPurchases = JSON.parse(localStorage.getItem('greenPurchases') || '[]');

function renderSearch() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Find Sustainable Products</h2>
    <input id="search-input" type="text" placeholder="Search by name, brand, or category...">
    <div id="product-list"></div>
  `;
  document.getElementById('search-input').addEventListener('input', handleSearch);
  handleSearch();
}

function handleSearch() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.brand.toLowerCase().includes(query) ||
    p.category.toLowerCase().includes(query)
  );
  renderProductList(filtered);
}

function renderProductList(list) {
  const container = document.getElementById('product-list');
  if (!list.length) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }
  container.innerHTML = list.map((p, idx) => `
    <div class="card">
      <div><strong>${p.name}</strong> <span class="eco-rating ${ecoRatingColor(p.ecoRating)}">${p.ecoRating} (${p.ratingLabel})</span></div>
      <div>Brand: ${p.brand}</div>
      <div>Category: ${p.category}</div>
      <div>${p.description}</div>
      <div>Certifications: ${p.certifications.join(', ')}</div>
      <div>Price: $${p.price.toFixed(2)}</div>
      <button class="action" onclick="addToTracker(${idx})">Add to My Green Purchases</button>
    </div>
  `).join('');
}

function ecoRatingColor(rating) {
  if (rating >= 9) return 'green';
  if (rating >= 8) return 'yellow';
  return 'red';
}

function addToTracker(idx) {
  const product = products[idx];
  const entry = {
    ...product,
    date: new Date().toLocaleDateString()
  };
  greenPurchases.push(entry);
  localStorage.setItem('greenPurchases', JSON.stringify(greenPurchases));
  alert('Added to your green purchases!');
}

function renderCompare() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">Compare Eco-Ratings</h2>
    <select id="compare1">
      <option value="">Select product 1</option>
      ${products.map((p, i) => `<option value="${i}">${p.name}</option>`).join('')}
    </select>
    <select id="compare2">
      <option value="">Select product 2</option>
      ${products.map((p, i) => `<option value="${i}">${p.name}</option>`).join('')}
    </select>
    <div id="compare-result"></div>
  `;
  document.getElementById('compare1').addEventListener('change', handleCompare);
  document.getElementById('compare2').addEventListener('change', handleCompare);
}

function handleCompare() {
  const idx1 = document.getElementById('compare1').value;
  const idx2 = document.getElementById('compare2').value;
  const result = document.getElementById('compare-result');
  if (idx1 === '' || idx2 === '' || idx1 === idx2) {
    result.innerHTML = '<p>Select two different products to compare.</p>';
    return;
  }
  const p1 = products[idx1];
  const p2 = products[idx2];
  result.innerHTML = `
    <div class="card">
      <div><strong>${p1.name}</strong> <span class="eco-rating ${ecoRatingColor(p1.ecoRating)}">${p1.ecoRating} (${p1.ratingLabel})</span></div>
      <div>Brand: ${p1.brand}</div>
      <div>Category: ${p1.category}</div>
      <div>Certifications: ${p1.certifications.join(', ')}</div>
      <div>Price: $${p1.price.toFixed(2)}</div>
    </div>
    <div class="card">
      <div><strong>${p2.name}</strong> <span class="eco-rating ${ecoRatingColor(p2.ecoRating)}">${p2.ecoRating} (${p2.ratingLabel})</span></div>
      <div>Brand: ${p2.brand}</div>
      <div>Category: ${p2.category}</div>
      <div>Certifications: ${p2.certifications.join(', ')}</div>
      <div>Price: $${p2.price.toFixed(2)}</div>
    </div>
  `;
}

function renderTracker() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <h2 class="section-title">My Green Purchases</h2>
    <ul class="tracker-list">
      ${greenPurchases.length ? greenPurchases.map(p => `
        <li>
          <span><strong>${p.name}</strong> <span class="eco-rating ${ecoRatingColor(p.ecoRating)}">${p.ecoRating}</span></span>
          <span class="date">${p.date}</span>
        </li>
      `).join('') : '<li>No green purchases yet.</li>'}
    </ul>
    <button class="action" onclick="clearTracker()">Clear All</button>
  `;
}

function clearTracker() {
  if (confirm('Clear all your green purchases?')) {
    greenPurchases = [];
    localStorage.setItem('greenPurchases', '[]');
    renderTracker();
  }
}

document.getElementById('nav-search').onclick = renderSearch;
document.getElementById('nav-compare').onclick = renderCompare;
document.getElementById('nav-tracker').onclick = renderTracker;

// Initial load
renderSearch();
