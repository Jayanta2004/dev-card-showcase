// Art Portfolio & Gallery Manager
let artworks = JSON.parse(localStorage.getItem('artworks') || '[]');

function renderGallery() {
    const galleryDiv = document.getElementById('gallery');
    galleryDiv.innerHTML = '';
    artworks.forEach(a => {
        const card = document.createElement('div');
        card.className = 'art-card';
        if (a.image) card.innerHTML += `<img src="${a.image}" alt="Artwork">`;
        card.innerHTML += `<b>${a.title}</b><br><small>${a.category}</small><br>`;
        card.innerHTML += `<div class="art-tags">${a.tags.map(t => `<span class="art-tag">${t}</span>`).join('')}</div>`;
        card.innerHTML += `<p>${a.desc}</p>`;
        card.innerHTML += `<small>Exhibition: ${a.exhibition || 'None'}</small><br>`;
        card.innerHTML += `<small>Sales: ${a.sales || 0}</small>`;
        galleryDiv.appendChild(card);
    });
    renderExhibitions();
    renderSales();
}

document.getElementById('add-art-btn').onclick = function() {
    const title = document.getElementById('art-title').value.trim();
    const category = document.getElementById('art-category').value.trim();
    const tags = document.getElementById('art-tags').value.split(',').map(t => t.trim()).filter(t => t);
    const desc = document.getElementById('art-desc').value.trim();
    const exhibition = document.getElementById('art-exhibition').value.trim();
    const sales = parseInt(document.getElementById('art-sales').value);
    const imageInput = document.getElementById('art-image');
    if (!title || !category || !tags.length || !desc) {
        alert('Please fill all required fields.');
        return;
    }
    let image = '';
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image = e.target.result;
            addArtwork({ title, category, tags, desc, exhibition, sales, image });
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        addArtwork({ title, category, tags, desc, exhibition, sales, image: '' });
    }
};

function addArtwork(artwork) {
    artworks.push(artwork);
    localStorage.setItem('artworks', JSON.stringify(artworks));
    renderGallery();
}

function renderExhibitions() {
    const exhibitionsDiv = document.getElementById('exhibitions');
    exhibitionsDiv.innerHTML = '';
    artworks.forEach(a => {
        if (a.exhibition) {
            const card = document.createElement('div');
            card.className = 'exhibition-card';
            card.innerHTML = `<b>${a.title}</b><br><small>${a.exhibition}</small>`;
            exhibitionsDiv.appendChild(card);
        }
    });
}

function renderSales() {
    const salesDiv = document.getElementById('sales');
    salesDiv.innerHTML = '';
    artworks.forEach(a => {
        if (a.sales) {
            const card = document.createElement('div');
            card.className = 'sales-card';
            card.innerHTML = `<b>${a.title}</b><br><small>Sales: ${a.sales}</small>`;
            salesDiv.appendChild(card);
        }
    });
}

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Title,Category,Tags,Description,Exhibition,Sales\n';
    artworks.forEach(a => {
        csv += `${a.title},${a.category},${a.tags.join('|')},"${a.desc.replace(/\n/g,' ')}",${a.exhibition || ''},${a.sales || 0}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'art-portfolio.csv';
    link.click();
};

document.getElementById('export-pdf-btn').onclick = function() {
    alert('PDF export is a placeholder. Use browser print to PDF for now.');
};

renderGallery();