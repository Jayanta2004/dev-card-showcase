    (function(){
        // --------------------  DATA  --------------------
        const discoveries = [
            { id:1, title:'Heliocentrism', creator:'Nicolaus Copernicus', year:1543, description:'Model with Sun at center, revolutionizing astronomy.', disciplines:['astronomy','physics'], era:'scientific-revolution' },
            { id:2, title:'Law of Universal Gravitation', creator:'Isaac Newton', year:1687, description:'Every mass attracts every other; explained planetary motion.', disciplines:['physics','math'], era:'scientific-revolution' },
            { id:3, title:'Penicillin', creator:'Alexander Fleming', year:1928, description:'First antibiotic, changed medicine forever.', disciplines:['medicine','biology'], era:'20th' },
            { id:4, title:'Structure of DNA', creator:'Watson & Crick', year:1953, description:'Double helix model of genetic material.', disciplines:['biology','medicine'], era:'20th' },
            { id:5, title:'Theory of Relativity', creator:'Albert Einstein', year:1915, description:'General relativity: gravity as curvature of spacetime.', disciplines:['physics'], era:'20th' },
            { id:6, title:'Heliocentrism (ancient)', creator:'Aristarchus of Samos', year:-280, description:'Early heliocentric model, largely ignored.', disciplines:['astronomy'], era:'ancient' },
            { id:7, title:'Atomic Theory', creator:'John Dalton', year:1808, description:'Matter composed of atoms, basis of modern chemistry.', disciplines:['chemistry','physics'], era:'19th' },
            { id:8, title:'Evolution by Natural Selection', creator:'Charles Darwin', year:1859, description:'Origin of species, common descent with branching.', disciplines:['biology'], era:'19th' },
            { id:9, title:'Periodic Table', creator:'Dmitri Mendeleev', year:1869, description:'Arranged elements by atomic weight, predicted new ones.', disciplines:['chemistry'], era:'19th' },
            { id:10, title:'CRISPR-Cas9', creator:'Doudna & Charpentier', year:2012, description:'Precise gene-editing tool, Nobel 2020.', disciplines:['biology','medicine'], era:'21st' },
            { id:11, title:'Expanding Universe / Hubble\'s Law', creator:'Edwin Hubble', year:1929, description:'Galaxies recede, evidence for Big Bang.', disciplines:['astronomy','physics'], era:'20th' },
            { id:12, title:'Vaccination (smallpox)', creator:'Edward Jenner', year:1796, description:'First vaccine, using cowpox to protect.', disciplines:['medicine'], era:'scientific-revolution' },
            { id:13, title:'Plate Tectonics', creator:'Wegener & others', year:1912, description:'Continents drift; unifying theory for geology.', disciplines:['earth'], era:'20th' },
            { id:14, title:'Quantum Mechanics', creator:'Planck, Heisenberg, Schrödinger', year:1925, description:'Physics at atomic scale, probabilistic nature.', disciplines:['physics'], era:'20th' },
            { id:15, title:'Oxygen Discovery', creator:'Joseph Priestley / Lavoisier', year:1774, description:'Isolation and role in combustion.', disciplines:['chemistry'], era:'scientific-revolution' },
            { id:16, title:'X-ray Diffraction / DNA', creator:'Rosalind Franklin', year:1952, description:'Photo 51, key to double helix.', disciplines:['biology','chemistry'], era:'20th' },
            { id:17, title:'Inert Gases', creator:'William Ramsay', year:1894, description:'Discovered argon, helium, neon, etc.', disciplines:['chemistry'], era:'19th' },
            { id:18, title:'Greenland ice cores / climate change', creator:'Willi Dansgaard et al.', year:1982, description:'Evidence of rapid climate shifts in past.', disciplines:['earth'], era:'20th' },
            { id:19, title:'Gravitational Waves', creator:'LIGO collaboration', year:2016, description:'Direct detection of ripples in spacetime.', disciplines:['physics','astronomy'], era:'21st' },
            { id:20, title:'First image of a black hole', creator:'Event Horizon Telescope', year:2019, description:'Supermassive black hole in M87.', disciplines:['astronomy','physics'], era:'21st' },
            { id:21, title:'Geometry / Elements', creator:'Euclid', year:-300, description:'Axiomatic foundation of geometry.', disciplines:['math'], era:'ancient' },
            { id:22, title:'Infinitesimal Calculus', creator:'Newton & Leibniz', year:1684, description:'Separate development of calculus.', disciplines:['math','physics'], era:'scientific-revolution' },
            { id:23, title:'Helicobacter pylori / ulcers', creator:'Warren & Marshall', year:1984, description:'Bacteria cause peptic ulcers, Nobel 2005.', disciplines:['medicine'], era:'20th' },
            { id:24, title:'Neutrino oscillations', creator:'Super‑Kamiokande', year:1998, description:'Neutrinos have mass, changes flavor.', disciplines:['physics'], era:'20th' },
            { id:25, title:'Kepler\'s Laws', creator:'Johannes Kepler', year:1619, description:'Elliptical orbits, planetary motion rules.', disciplines:['astronomy','physics'], era:'scientific-revolution' },
        ];

        // ---------- state ----------
        let searchTerm = '';
        let disciplineFilter = 'all';
        let eraFilter = 'all';

        // DOM elements
        const gridEl = document.getElementById('archiveGrid');
        const statsEl = document.getElementById('resultCount');
        const activeLabels = document.getElementById('activeFilterLabels');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const disciplineSelect = document.getElementById('disciplineFilter');
        const eraSelect = document.getElementById('eraFilter');
        const resetBtn = document.getElementById('resetFilters');

        // helper: era mapping (just for display)
        function getEraDisplay(era) {
            const map = {
                'ancient': 'ancient',
                'scientific-revolution': '1600‑1800',
                '19th': '19th c.',
                '20th': '20th c.',
                '21st': '21st c.'
            };
            return map[era] || era;
        }

        // filter logic
        function filterDiscoveries() {
            return discoveries.filter(d => {
                // search (title, creator, description)
                if (searchTerm) {
                    const haystack = (d.title + ' ' + d.creator + ' ' + d.description).toLowerCase();
                    if (!haystack.includes(searchTerm.toLowerCase())) return false;
                }

                // discipline
                if (disciplineFilter !== 'all' && !d.disciplines.includes(disciplineFilter)) return false;

                // era
                if (eraFilter !== 'all' && d.era !== eraFilter) return false;

                return true;
            });
        }

        // render cards
        function render() {
            const filtered = filterDiscoveries();

            // update stats
            statsEl.innerText = `📄 ${filtered.length} discovery${filtered.length !== 1 ? 'ies' : 'y'}`;

            // active filter labels
            let labelParts = [];
            if (disciplineFilter !== 'all') {
                const disName = disciplineSelect.options[disciplineSelect.selectedIndex].text.replace('⚛️ ','').replace('🧬 ','').replace('⚗️ ','').replace('🏥 ','').replace('🔭 ','').replace('🌍 ','').replace('📐 ','');
                labelParts.push(`discipline: ${disName}`);
            }
            if (eraFilter !== 'all') {
                const eraName = eraSelect.options[eraSelect.selectedIndex].text.split(' ').slice(1).join(' ') || eraFilter;
                labelParts.push(`era: ${eraName}`);
            }
            if (searchTerm) labelParts.push(`search: “${searchTerm}”`);

            if (labelParts.length > 0) {
                activeLabels.innerHTML = ' · ' + labelParts.map(p => `<span class="badge-filter">${p}</span>`).join(' ');
            } else {
                activeLabels.innerHTML = '';
            }

            // build grid html
            if (filtered.length === 0) {
                gridEl.innerHTML = `<div class="no-results">🔎 no matching entries · try broader filters</div>`;
                return;
            }

            let html = '';
            filtered.forEach(d => {
                // format year BC/AD
                const yearStr = d.year < 0 ? `${Math.abs(d.year)} BCE` : d.year;

                // discipline tags
                const tags = d.disciplines.map(dis => {
                    let icon = '';
                    if (dis === 'physics') icon = '⚛️';
                    else if (dis === 'biology') icon = '🧬';
                    else if (dis === 'chemistry') icon = '⚗️';
                    else if (dis === 'medicine') icon = '🏥';
                    else if (dis === 'astronomy') icon = '🔭';
                    else if (dis === 'earth') icon = '🌍';
                    else if (dis === 'math') icon = '📐';
                    else icon = '🔖';
                    return `<span class="discipline-tag">${icon} ${dis}</span>`;
                }).join('');

                html += `<div class="card">`;
                html += `<div class="card-year">📅 ${yearStr} <span>${getEraDisplay(d.era)}</span></div>`;
                html += `<div class="card-title">${d.title}</div>`;
                html += `<div class="card-creator">${d.creator}</div>`;
                html += `<div class="card-desc">${d.description}</div>`;
                html += `<div class="disciplines">${tags}</div>`;
                html += `<div class="card-footer">✨ milestone · scientia</div>`;
                html += `</div>`;
            });

            gridEl.innerHTML = html;
        }

        // update from UI
        function updateFiltersAndRender() {
            searchTerm = searchInput.value.trim();
            disciplineFilter = disciplineSelect.value;
            eraFilter = eraSelect.value;
            render();
        }

        // reset all filters
        function resetAllFilters() {
            searchInput.value = '';
            disciplineSelect.value = 'all';
            eraSelect.value = 'all';
            searchTerm = '';
            disciplineFilter = 'all';
            eraFilter = 'all';
            render();
        }

        // event listeners
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            updateFiltersAndRender();
        });

        // allow enter key in search
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                updateFiltersAndRender();
            }
        });

        disciplineSelect.addEventListener('change', updateFiltersAndRender);
        eraSelect.addEventListener('change', updateFiltersAndRender);
        resetBtn.addEventListener('click', resetAllFilters);

        // initial render
        render();
    })();