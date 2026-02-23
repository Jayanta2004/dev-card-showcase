        (function(){
            // ---------- VIRUS DATASET ----------
            const virusDB = [
                { name: "SARS-CoV-2", family: "Coronaviridae", genome: "RNA", risk: "high", zoonotic: true, host: "humans, bats", emoji: "🦠😷", discovery: 2019, description: "Betacoronavirus; caused COVID-19 pandemic. Spike protein mediates entry.", deaths: "~7M (reported)" },
                { name: "Influenza A H5N1", family: "Orthomyxoviridae", genome: "RNA", risk: "high", zoonotic: true, host: "birds, humans", emoji: "🦆⚠️", discovery: 1997, description: "Avian influenza virus; high mortality in humans. Rare human-to-human.", deaths: "~60% case fatality" },
                { name: "HIV-1", family: "Retroviridae", genome: "RNA", risk: "high", zoonotic: true, host: "humans", emoji: "🧬🩸", discovery: 1983, description: "Lentivirus causing AIDS. Attacks CD4+ T cells. Global pandemic.", deaths: "~40M (since start)" },
                { name: "Ebola virus", family: "Filoviridae", genome: "RNA", risk: "high", zoonotic: true, host: "primates, bats", emoji: "🦇💉", discovery: 1976, description: "Hemorrhagic fever; severe bleeding. Outbreaks in Central Africa.", deaths: "25-90% fatality" },
                { name: "Zika virus", family: "Flaviviridae", genome: "RNA", risk: "moderate", zoonotic: true, host: "mosquitoes, humans", emoji: "🦟🧠", discovery: 1947, description: "Mosquito-borne; congenital microcephaly. Usually mild in adults.", deaths: "low (complication risk)" },
                { name: "Hepatitis B", family: "Hepadnaviridae", genome: "DNA", risk: "moderate", zoonotic: false, host: "humans", emoji:="🧪🩺", discovery: 1965, description: "Chronic liver infection; vaccine-preventable. DNA virus with reverse transcription.", deaths: "~820k/year" },
                { name: "Rabies lyssavirus", family: "Rhabdoviridae", genome: "RNA", risk: "high", zoonotic: true, host: "mammals", emoji: "🐕🧠", discovery: 1885, description: "Furious or paralytic; ~100% fatal after symptoms. Post-exposure vaccine.", deaths: "~59k/year" },
                { name: "Human papillomavirus 16", family: "Papillomaviridae", genome: "DNA", risk: "moderate", zoonotic: false, host: "humans", emoji: "🔬🧬", discovery: 1980, description: "High-risk HPV; causes cervical cancer. Vaccine available.", deaths: "~340k (cervical ca)" },
                { name: "Marburg virus", family: "Filoviridae", genome: "RNA", risk: "high", zoonotic: true, host: "bats, primates", emoji: "🦇🩸", discovery: 1967, description: "Hemorrhagic fever similar to Ebola. High mortality.", deaths: "23-90% outbreaks" },
                { name: "Adenovirus 5", family: "Adenoviridae", genome: "DNA", risk: "low", zoonotic: false, host: "humans", emoji: "😷🧫", discovery: 1953, description: "Common cold; conjunctivitis. Used in vaccine vectors.", deaths: "rare" },
                { name: "Dengue virus (DENV-2)", family: "Flaviviridae", genome: "RNA", risk: "moderate", zoonotic: false, host: "humans/mosquitoes", emoji: "🦟🌡️", discovery: 1943, description: "Mosquito-borne; severe dengue shock. 100M infections/year.", deaths: "~40k/year" },
                { name: "Smallpox (Variola)", family: "Poxviridae", genome: "DNA", risk: "high (historical)", zoonotic: false, host: "humans", emoji: "💀⚠️", discovery: "ancient", description: "Eradicated 1980; high mortality. Bioterrorism concern.", deaths: "300M+ in 20th century" },
                { name: "Hantavirus (Sin Nombre)", family: "Hantaviridae", genome: "RNA", risk: "high", zoonotic: true, host: "rodents", emoji: "🐭💨", discovery: 1993, description: "HPS – pulmonary syndrome. Rare but severe.", deaths: "~38% fatality" },
                { name: "Norovirus", family: "Caliciviridae", genome: "RNA", risk: "low", zoonotic: false, host: "humans", emoji: "🤢🚢", discovery: 1972, description: "Gastroenteritis; cruise ships. Very contagious.", deaths: "~200k/year (developing)" }
            ];

            // enrichment: add zoonotic property if not set explicitly
            for (let v of virusDB) {
                if (v.zoonotic === undefined) v.zoonotic = false;
                if (!v.deaths) v.deaths = 'unknown';
            }

            // DOM elements
            const grid = document.getElementById('virusGrid');
            const searchInput = document.getElementById('searchInput');
            const filterTabs = document.querySelectorAll('.tab');
            const totalSpan = document.getElementById('totalCount');
            const rnaSpan = document.getElementById('rnaCount');
            const dnaSpan = document.getElementById('dnaCount');
            const dateSpan = document.getElementById('dateDisplay');

            // state
            let activeFilter = 'all';   // 'all', 'rna', 'dna', 'high', 'zoonotic'
            let searchTerm = '';

            // set current date
            const today = new Date();
            dateSpan.textContent = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' · vault';

            // update counts
            function updateStats(filteredArray) {
                const total = filteredArray.length;
                const rna = filteredArray.filter(v => v.genome === 'RNA').length;
                const dna = filteredArray.filter(v => v.genome === 'DNA').length;
                totalSpan.textContent = total;
                rnaSpan.textContent = rna;
                dnaSpan.textContent = dna;
            }

            // main render
            function renderViruses() {
                const lowerSearch = searchTerm.trim().toLowerCase();

                const filtered = virusDB.filter(v => {
                    // filter by category
                    if (activeFilter === 'rna' && v.genome !== 'RNA') return false;
                    if (activeFilter === 'dna' && v.genome !== 'DNA') return false;
                    if (activeFilter === 'high' && v.risk !== 'high') return false;
                    if (activeFilter === 'zoonotic' && !v.zoonotic) return false;

                    // search filter
                    if (lowerSearch !== '') {
                        return v.name.toLowerCase().includes(lowerSearch) ||
                               v.family.toLowerCase().includes(lowerSearch) ||
                               (v.host && v.host.toLowerCase().includes(lowerSearch)) ||
                               v.description.toLowerCase().includes(lowerSearch);
                    }
                    return true;
                });

                // update stats with filtered
                updateStats(filtered);

                if (filtered.length === 0) {
                    grid.innerHTML = `<div class="empty-message">🧫 no viruses match · adjust filters</div>`;
                    return;
                }

                let html = '';
                filtered.forEach(v => {
                    // risk class
                    let riskClass = 'risk-moderate';
                    if (v.risk === 'high') riskClass = 'risk-high';
                    else if (v.risk === 'low') riskClass = 'risk-low';

                    // genome badge
                    const genomeIcon = v.genome === 'RNA' ? '🧬 RNA' : '🧬 DNA';

                    html += `
                        <div class="virus-card">
                            <div class="card-header">
                                <span class="virus-emoji">${v.emoji}</span>
                                <div>
                                    <div class="virus-name">${v.name}</div>
                                    <div class="virus-family">${v.family}</div>
                                </div>
                            </div>
                            <div class="meta-tags">
                                <span class="tag ${riskClass}">${v.risk} risk</span>
                                <span class="tag">${genomeIcon}</span>
                                ${v.zoonotic ? '<span class="tag">🦇 zoonotic</span>' : ''}
                            </div>
                            <div class="genome-info">🧬 ${v.genome} · host: ${v.host || 'humans'}</div>
                            <div class="description">${v.description}</div>
                            <div class="stats-mini">
                                <div class="stat-cell"><span>discovered</span>${v.discovery || '?'}</div>
                                <div class="stat-cell"><span>mortality</span>${v.deaths}</div>
                            </div>
                            <div class="card-footer">
                                <span>🔬 variant info</span> <span>⏵</span>
                            </div>
                        </div>
                    `;
                });
                grid.innerHTML = html;
            }

            // initial render
            renderViruses();

            // search input
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                renderViruses();
            });

            // tab switching
            filterTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    filterTabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    activeFilter = tab.getAttribute('data-filter');
                    renderViruses();
                });
            });

            // (optional) click on card show quick summary
            grid.addEventListener('click', (e) => {
                const card = e.target.closest('.virus-card');
                if (!card) return;
                const nameElem = card.querySelector('.virus-name');
                if (!nameElem) return;
                const virusName = nameElem.innerText;
                const virus = virusDB.find(v => v.name === virusName);
                if (virus) {
                    alert(`🦠 ${virus.name} (${virus.family})\nRisk: ${virus.risk}\nGenome: ${virus.genome}\nZoonotic: ${virus.zoonotic ? 'Yes' : 'No'}\nHost: ${virus.host}\nDeaths: ${virus.deaths}`);
                }
            });
        })();