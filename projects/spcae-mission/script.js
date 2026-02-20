    (function() {
        // ---------- MISSION DATA ----------
        const missions = [
            { name: 'Sputnik 1', year: 1957, country: 'USSR', type: 'orbital', desc: 'First artificial satellite. Sparked the space age.', highlight: 'beep-beep signal' },
            { name: 'Explorer 1', year: 1958, country: 'USA', type: 'orbital', desc: 'First US satellite, discovered Van Allen belts.' },
            { name: 'Luna 2', year: 1959, country: 'USSR', type: 'lunar', desc: 'First human-made object to hit the Moon.' },
            { name: 'Vostok 1', year: 1961, country: 'USSR', type: 'orbital', desc: 'Yuri Gagarin: first human in space.' },
            { name: 'Mariner 2', year: 1962, country: 'USA', type: 'deep', desc: 'First successful Venus flyby.' },
            { name: 'Luna 9', year: 1966, country: 'USSR', type: 'lunar', desc: 'First soft landing on the Moon, first surface photos.' },
            { name: 'Apollo 11', year: 1969, country: 'USA', type: 'lunar', desc: 'First humans on the Moon. "One small step..."' },
            { name: 'Venera 7', year: 1970, country: 'USSR', type: 'deep', desc: 'First soft landing on Venus, survived 23 minutes.' },
            { name: 'Mariner 9', year: 1971, country: 'USA', type: 'mars', desc: 'First spacecraft to orbit Mars.' },
            { name: 'Viking 1', year: 1976, country: 'USA', type: 'mars', desc: 'First successful Mars lander, operated for 6 years.' },
            { name: 'Voyager 2', year: 1977, country: 'USA', type: 'deep', desc: 'Flyby of Jupiter, Saturn, Uranus, Neptune.' },
            { name: 'Voyager 1', year: 1977, country: 'USA', type: 'deep', desc: 'Entered interstellar space in 2012.' },
            { name: 'Space Shuttle Columbia', year: 1981, country: 'USA', type: 'orbital', desc: 'First reusable crewed orbital spacecraft.' },
            { name: 'Mir station', year: 1986, country: 'USSR', type: 'orbital', desc: 'First modular space station, long duration missions.' },
            { name: 'Hubble Telescope', year: 1990, country: 'USA/ESA', type: 'orbital', desc: 'Revolutionized astronomy with deep field images.' },
            { name: 'Mars Pathfinder', year: 1997, country: 'USA', type: 'mars', desc: 'First successful Mars rover (Sojourner).' },
            { name: 'ISS module Zarya', year: 1998, country: 'International', type: 'orbital', desc: 'Beginning of International Space Station.' },
            { name: 'Cassini–Huygens', year: 2004, country: 'NASA/ESA', type: 'deep', desc: 'Saturn orbiter; Huygens landed on Titan.' },
            { name: 'Chang\'e 3', year: 2013, country: 'China', type: 'lunar', desc: 'First Chinese soft landing on the Moon, Yutu rover.' },
            { name: 'New Horizons', year: 2015, country: 'USA', type: 'deep', desc: 'First Pluto flyby, revealed heart-shaped plain.' },
            { name: 'InSight', year: 2018, country: 'USA', type: 'mars', desc: 'Studied Mars interior using seismometer.' },
            { name: 'Perseverance rover', year: 2021, country: 'USA', type: 'mars', desc: 'Collects samples, Ingenuity helicopter flew.' },
            { name: 'JWST', year: 2021, country: 'NASA/ESA/CSA', type: 'orbital', desc: 'James Webb Space Telescope, infrared universe.' },
            { name: 'Artemis I', year: 2022, country: 'USA', type: 'lunar', desc: 'Uncrewed Orion capsule around the Moon.' },
            { name: 'Chandrayaan-3', year: 2023, country: 'India', type: 'lunar', desc: 'First successful soft landing near lunar south pole.' },
            { name: 'Europa Clipper', year: 2024, country: 'USA', type: 'deep', desc: 'Mission to study Jupiter\'s icy moon Europa.' },
            { name: 'MMX (Martian Moons)', year: 2026, country: 'JAXA', type: 'mars', desc: 'Sample return from Phobos.' },
            { name: 'Artemis III', year: 2027, country: 'USA', type: 'lunar', desc: 'First crewed lunar landing since 1972.' },
            { name: 'Tianwen-3', year: 2028, country: 'China', type: 'mars', desc: 'Proposed Mars sample return mission.' },
            { name: 'VERITAS', year: 2029, country: 'USA', type: 'deep', desc: 'Venus orbiter, high-resolution mapping.' },
            { name: 'EnVision', year: 2030, country: 'ESA', type: 'deep', desc: 'Venus atmospheric and geologic orbiter.' }
        ];

        // current filter and detail state
        let activeFilter = 'all';
        let selectedMission = null;    // index or null

        // DOM elements
        const timelineDiv = document.getElementById('timelineContainer');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const infoPanel = document.getElementById('infoPanel');
        const detailName = document.getElementById('detailName');
        const detailDesc = document.getElementById('detailDesc');
        const closeBtn = document.getElementById('closeInfoBtn');

        // ---------- helpers ----------
        function filterMissions(type) {
            if (type === 'all') return missions;
            return missions.filter(m => m.type === type);
        }

        // build timeline html (and preserve selected mission if possible)
        function renderTimeline() {
            const filtered = filterMissions(activeFilter);
            if (filtered.length === 0) {
                timelineDiv.innerHTML = `<div class="empty-timeline">🌠 no missions match filter · ${activeFilter}</div>`;
                return;
            }

            let html = '';
            filtered.forEach((mission, idx) => {
                // we use original index for stable selection (not needed but use combined key)
                // but for dot we need consistent alternating left/right using overall position
                // simply alternate based on idx in filtered list for visual variation
                const isRight = (idx % 2 === 1); // alternate
                const sideClass = isRight ? 'right' : '';

                // build card
                html += `<div class="timeline-item ${sideClass}" data-mission-idx="${missions.indexOf(mission)}" data-filtered-idx="${idx}">`;
                html += `<div class="timeline-bubble">`;
                html += `<div class="mission-card">`;
                html += `<div class="mission-year">${mission.year}</div>`;
                html += `<div class="mission-name">${mission.name}</div>`;
                html += `<div class="mission-details">`;
                html += `<span class="badge">${mission.type}</span>`;
                html += `<span class="country">${mission.country}</span>`;
                html += `</div>`;
                html += `</div>`; // card
                html += `</div>`; // bubble
                html += `<div class="timeline-dot"></div>`;
                html += `</div>`;
            });

            timelineDiv.innerHTML = html;

            // attach click listeners to each mission card
            document.querySelectorAll('.timeline-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    // if click on dot or anything inside
                    const idx = item.dataset.missionIdx;
                    if (idx !== undefined) {
                        const mission = missions[parseInt(idx)];
                        if (mission) {
                            displayMissionDetail(mission);
                        }
                    }
                });
            });

            // if there is a selected mission, try to keep info (but we just show if same)
            if (selectedMission) {
                // check if still present in filtered? avoid confusion, just show it if exists (we don't auto clear)
                // but we don't want to show non-filtered mission – better clear if not visible.
                const stillExists = missions.some(m => m.name === selectedMission.name && m.year === selectedMission.year);
                if (!stillExists) {
                    selectedMission = null;
                    resetDetailPanel();
                } else {
                    // but we only keep if it's in the current filter? decide to keep, but user might see mismatch. we reset if filter excludes it.
                    const inFilter = filterMissions(activeFilter).some(m => m.name === selectedMission.name);
                    if (!inFilter) {
                        selectedMission = null;
                        resetDetailPanel();
                    } else {
                        displayMissionDetail(selectedMission); // refresh
                    }
                }
            } else {
                resetDetailPanel();
            }
        }

        function displayMissionDetail(mission) {
            selectedMission = mission;
            detailName.innerText = `${mission.name} (${mission.year}) · ${mission.country}`;
            let extra = mission.desc;
            if (mission.highlight) extra += ` · ✦ ${mission.highlight}`;
            detailDesc.innerText = extra;
        }

        function resetDetailPanel() {
            selectedMission = null;
            detailName.innerText = '—';
            detailDesc.innerText = 'click on any mission card';
        }

        // filter update
        function setActiveFilter(filter) {
            activeFilter = filter;
            filterBtns.forEach(btn => {
                const btnFilter = btn.dataset.filter;
                if (btnFilter === filter) btn.classList.add('active');
                else btn.classList.remove('active');
            });
            renderTimeline();
        }

        // event listeners for filter
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                setActiveFilter(filter);
            });
        });

        // close detail button
        closeBtn.addEventListener('click', () => {
            selectedMission = null;
            resetDetailPanel();
        });

        // initialise: sort missions by year (already sorted but double-check)
        missions.sort((a,b) => a.year - b.year);

        // first render
        renderTimeline();

        // (optional) set default filter active
        setActiveFilter('all');
    })();