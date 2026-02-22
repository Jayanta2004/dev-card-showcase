        (function() {
            // ---------- DISEASE DATASET ----------
            const diseaseDB = [
                {
                    name: "Wheat Rust",
                    scientific: "Puccinia graminis",
                    emoji: "🌾⚡",
                    cropType: "cereal",
                    crop: "Wheat",
                    description: "Reddish-brown pustules on stems and leaves. Reduces yield and weakens plant. Prefers humid conditions.",
                    treatment: "Use resistant varieties. Apply fungicides (triazoles/strobilurins) early. Remove volunteer wheat."
                },
                {
                    name: "Apple Scab",
                    scientific: "Venturia inaequalis",
                    emoji: "🍎🤎",
                    cropType: "fruit",
                    crop: "Apple",
                    description: "Olive-green to brown velvety spots on leaves and fruit. Causes fruit cracking and drop.",
                    treatment: "Plant resistant cultivars. Apply fungicides from green tip through summer. Rake and destroy fallen leaves."
                },
                {
                    name: "Tomato Blight (Late)",
                    scientific: "Phytophthora infestans",
                    emoji: "🍅🌧️",
                    cropType: "vegetable",
                    crop: "Tomato",
                    description: "Dark lesions on leaves with white moldy growth. Fruit rot. Spreads fast in wet weather.",
                    treatment: "Copper-based fungicides preventive. Remove infected plants. Avoid overhead irrigation."
                },
                {
                    name: "Corn Smut",
                    scientific: "Ustilago maydis",
                    emoji: "🌽🖤",
                    cropType: "cereal",
                    crop: "Maize",
                    description: "Large grey galls on ears, tassels, leaves. Edible in Mexican cuisine but reduces yield.",
                    treatment: "Remove galls before rupture. Rotate crops. Use less susceptible hybrids."
                },
                {
                    name: "Powdery Mildew",
                    scientific: "Erysiphe spp.",
                    emoji: "🥒❄️",
                    cropType: "vegetable",
                    crop: "Cucurbits",
                    description: "White powdery spots on leaves, stems. Stunts growth, reduces photosynthesis.",
                    treatment: "Sulfur or potassium bicarbonate sprays. Improve air circulation. Resistant varieties."
                },
                {
                    name: "Citrus Canker",
                    scientific: "Xanthomonas citri",
                    emoji: "🍊🧡",
                    cropType: "fruit",
                    crop: "Citrus",
                    description: "Raised corky lesions on fruit, leaves, stems. Causes premature fruit drop.",
                    treatment: "Copper bactericides. Remove infected debris. Strict quarantine; windbreaks help."
                },
                {
                    name: "Rice Blast",
                    scientific: "Magnaporthe oryzae",
                    emoji: "🍚🔥",
                    cropType: "cereal",
                    crop: "Rice",
                    description: "Diamond-shaped spots with grey centers. Can kill seedlings or damage panicles.",
                    treatment: "Use resistant cultivars. Avoid excess nitrogen. Seed treatment with fungicides."
                },
                {
                    name: "Potato Scab",
                    scientific: "Streptomyces scabies",
                    emoji: "🥔🤎",
                    cropType: "vegetable",
                    crop: "Potato",
                    description: "Rough, corky lesions on tuber surface. Mainly aesthetic but market loss.",
                    treatment: "Maintain soil pH 5.2–5.5. Use certified seed. Rotate with non-hosts."
                },
                {
                    name: "Grape Downy Mildew",
                    scientific: "Plasmopara viticola",
                    emoji: "🍇💧",
                    cropType: "fruit",
                    crop: "Grape",
                    description: "Yellow spots on leaves, white downy growth. Berries shrivel.",
                    treatment: "Copper fungicides, phosphonates. Good canopy management. Remove leaves near fruit."
                },
                {
                    name: "Bean Rust",
                    scientific: "Uromyces appendiculatus",
                    emoji: "🫘🧡",
                    cropType: "legume",
                    crop: "Common bean",
                    description: "Reddish-brown pustules on leaves. Premature defoliation.",
                    treatment: "Resistant varieties. Sulfur or fungicide sprays. 3-year rotation."
                },
                {
                    name: "Peach Leaf Curl",
                    scientific: "Taphrina deformans",
                    emoji: "🍑🌀",
                    cropType: "fruit",
                    crop: "Peach",
                    description: "Distorted, reddened curled leaves. Severe defoliation, fruit drop.",
                    treatment: "Dormant copper or lime sulfur spray before bud swell. Remove infected leaves."
                },
                {
                    name: "Soybean Rust",
                    scientific: "Phakopsora pachyrhizi",
                    emoji: "🫘⚡",
                    cropType: "legume",
                    crop: "Soybean",
                    description: "Small brown lesions on lower leaves. Rapid defoliation. Devastating.",
                    treatment: "Early fungicide application (triazoles + strobilurins). Resistant cultivars."
                },
                {
                    name: "Banana Sigatoka",
                    scientific: "Mycosphaerella spp.",
                    emoji: "🍌🍃",
                    cropType: "fruit",
                    crop: "Banana",
                    description: "Dark leaf spots with grey centers. Reduces photosynthetic area.",
                    treatment: "Oil-based fungicides, systemic fungicides. Remove affected leaves."
                },
                {
                    name: "Downy Mildew (Brassica)",
                    scientific: "Hyaloperonospora parasitica",
                    emoji: "🥦🌧️",
                    cropType: "vegetable",
                    crop: "Cabbage, broccoli",
                    description: "Yellow patches on leaves, white mold underneath. Seedlings rot.",
                    treatment: "Resistant varieties. Avoid overhead water. Metalaxyl fungicides."
                }
            ];

            // reference to elements
            const grid = document.getElementById('diseaseGrid');
            const searchInput = document.getElementById('searchInput');
            const filterChips = document.querySelectorAll('.chip');
            const resultCountSpan = document.getElementById('resultCount');

            // state
            let activeFilter = 'all';       // 'all', 'cereal', 'vegetable', 'fruit', 'legume'
            let searchTerm = '';

            // ---- render function ----
            function renderCards() {
                const lowerSearch = searchTerm.trim().toLowerCase();

                // filter by both cropType and search
                const filtered = diseaseDB.filter(disease => {
                    // filter by crop type
                    if (activeFilter !== 'all' && disease.cropType !== activeFilter) return false;

                    // search in name, scientific, crop, description
                    if (lowerSearch !== '') {
                        return disease.name.toLowerCase().includes(lowerSearch) ||
                               disease.scientific.toLowerCase().includes(lowerSearch) ||
                               disease.crop.toLowerCase().includes(lowerSearch) ||
                               disease.description.toLowerCase().includes(lowerSearch) ||
                               (disease.treatment && disease.treatment.toLowerCase().includes(lowerSearch));
                    }
                    return true;
                });

                // update result count
                resultCountSpan.innerText = filtered.length + (filtered.length === 1 ? ' disease' : ' diseases');

                if (filtered.length === 0) {
                    grid.innerHTML = `<div class="empty-state">🌿 No matching diseases. try another keyword?</div>`;
                    return;
                }

                // generate cards
                let htmlString = '';
                filtered.forEach(d => {
                    // treatment short
                    const treatmentShort = d.treatment.length > 80 ? d.treatment.substring(0, 80) + '…' : d.treatment;
                    // crop type badge label
                    let typeLabel = d.cropType;
                    if (d.cropType === 'cereal') typeLabel = '🌾 cereal';
                    else if (d.cropType === 'vegetable') typeLabel = '🥬 vegetable';
                    else if (d.cropType === 'fruit') typeLabel = '🍎 fruit';
                    else if (d.cropType === 'legume') typeLabel = '🫘 legume';

                    htmlString += `
                        <div class="disease-card">
                            <div class="card-header">
                                <span class="disease-emoji">${d.emoji}</span>
                                <div>
                                    <div class="disease-name">${d.name}</div>
                                    <div class="scientific-name">${d.scientific}</div>
                                </div>
                            </div>
                            <div class="crop-type-badge">${typeLabel} · ${d.crop}</div>
                            <div class="disease-desc">${d.description}</div>
                            <div class="treatment-section">
                                <div class="treatment-label"><span>💊 treatment</span></div>
                                <div class="treatment-text">${treatmentShort}</div>
                            </div>
                            <div class="card-footer">
                                <span>🪴 click for details</span> 
                                <span style="font-size:1.2rem;">🔍</span>
                            </div>
                        </div>
                    `;
                });

                grid.innerHTML = htmlString;
            }

            // initial render
            renderCards();

            // ---- search input handler ----
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                renderCards();
            });

            // ---- chip filter handler ----
            filterChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    // remove active class from all chips
                    filterChips.forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');

                    // set filter
                    const filterValue = chip.getAttribute('data-filter');
                    activeFilter = filterValue;   // 'all', 'cereal', etc.

                    renderCards();
                });
            });

            // optional: reset chips when search changes? we keep filter independent.

            // ----- simulate detail on card click (expand later) just for show -----
            // we add a small delegation to show full treatment in console, but we can also enhance UI with alert?
            // but that may be intrusive. we can add a click that shows full info in a friendly way.
            grid.addEventListener('click', (e) => {
                // find if click inside card
                const card = e.target.closest('.disease-card');
                if (!card) return;

                // find disease name from card (crude but okay for demo)
                const nameElem = card.querySelector('.disease-name');
                if (!nameElem) return;
                const diseaseName = nameElem.innerText;
                const disease = diseaseDB.find(d => d.name === diseaseName);
                if (disease) {
                    alert(`🌱 ${disease.name} (${disease.scientific})\n\nCrop: ${disease.crop}\n\nTreatment: ${disease.treatment}`);
                }
            });

            // bonus: clear search with escape key? not needed.
        })();