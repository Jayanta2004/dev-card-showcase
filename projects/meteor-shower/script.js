        (function() {
            // ---------- METEOR SHOWER DATA (2025–2026 season) ----------
            const showers = [
                { name: "Quadrantids", peak: "2025-01-03", intensity: "major", zhr: 110, moon: "waxing crescent (12%)", constellation: "Boötes" },
                { name: "Lyrids", peak: "2025-04-22", intensity: "medium", zhr: 18, moon: "waning crescent (28%)", constellation: "Lyra" },
                { name: "Eta Aquariids", peak: "2025-05-05", intensity: "major", zhr: 60, moon: "first quarter (60%)", constellation: "Aquarius" },
                { name: "Delta Aquariids", peak: "2025-07-30", intensity: "medium", zhr: 25, moon: "waxing crescent (20%)", constellation: "Aquarius" },
                { name: "Perseids", peak: "2025-08-12", intensity: "major", zhr: 100, moon: "waning gibbous (85%)", constellation: "Perseus" },
                { name: "Draconids", peak: "2025-10-08", intensity: "minor", zhr: 10, moon: "full moon (100%)", constellation: "Draco" },
                { name: "Orionids", peak: "2025-10-21", intensity: "medium", zhr: 20, moon: "new moon (0%)", constellation: "Orion" },
                { name: "Taurids (South)", peak: "2025-11-05", intensity: "minor", zhr: 7, moon: "full moon (99%)", constellation: "Taurus" },
                { name: "Taurids (North)", peak: "2025-11-12", intensity: "minor", zhr: 5, moon: "waning gibbous (55%)", constellation: "Taurus" },
                { name: "Leonids", peak: "2025-11-17", intensity: "medium", zhr: 15, moon: "waning crescent (10%)", constellation: "Leo" },
                { name: "Geminids", peak: "2025-12-14", intensity: "major", zhr: 150, moon: "waning crescent (25%)", constellation: "Gemini" },
                { name: "Ursids", peak: "2025-12-22", intensity: "minor", zhr: 10, moon: "waxing crescent (8%)", constellation: "Ursa Minor" },
                { name: "Quadrantids (2026)", peak: "2026-01-03", intensity: "major", zhr: 110, moon: "full moon (99%)", constellation: "Boötes" }
            ];

            // mapping intensity to dot class and label
            function getIntensityDot(intensity) {
                if (intensity === "major") return "intense";
                if (intensity === "medium") return "moderate";
                return "faint";
            }

            // format date as "DD MMM" (e.g., 03 Jan)
            function formatDateShort(dateStr) {
                const d = new Date(dateStr + "T12:00:00"); // noon to avoid timezone issues
                const options = { day: '2-digit', month: 'short' };
                return d.toLocaleDateString('en-GB', options).replace(/ /, ' ');
            }

            // render table body
            function renderTable(data) {
                const tbody = document.getElementById('tableBody');
                let html = '';
                data.forEach(s => {
                    const dotClass = getIntensityDot(s.intensity);
                    // optional emoji for moon phase quick indicator
                    let moonEmoji = '';
                    if (s.moon.toLowerCase().includes('new')) moonEmoji = '🌑 ';
                    else if (s.moon.toLowerCase().includes('full')) moonEmoji = '🌕 ';
                    else if (s.moon.toLowerCase().includes('waxing crescent')) moonEmoji = '🌒 ';
                    else if (s.moon.toLowerCase().includes('waning crescent')) moonEmoji = '🌘 ';
                    else if (s.moon.toLowerCase().includes('quarter')) moonEmoji = '🌓 ';
                    else if (s.moon.toLowerCase().includes('gibbous')) moonEmoji = '🌔 ';
                    else moonEmoji = '🌙 ';

                    html += `<tr>
                        <td><span class="shower-name">${s.name}</span></td>
                        <td class="date-cell">${formatDateShort(s.peak)} (night)</td>
                        <td><div class="rating"><span class="intensity-dot ${dotClass}"></span> ${s.zhr} / h</div></td>
                        <td><span class="moon-tag">${moonEmoji} ${s.moon}</span></td>
                        <td><span class="constellation">${s.constellation}</span></td>
                    </tr>`;
                });
                tbody.innerHTML = html;
            }

            // sort by date (ISO string works)
            function sortByDate(data, ascending = true) {
                return [...data].sort((a, b) => {
                    const dateA = new Date(a.peak);
                    const dateB = new Date(b.peak);
                    return ascending ? dateA - dateB : dateB - dateA;
                });
            }

            // initial render (chronological order)
            let currentSortAsc = true;
            let sortedData = sortByDate(showers, true);
            renderTable(sortedData);

            // button sorting toggle
            const sortBtn = document.getElementById('sortByDateBtn');
            sortBtn.addEventListener('click', () => {
                // toggle order
                currentSortAsc = !currentSortAsc;
                sortedData = sortByDate(showers, currentSortAsc);
                renderTable(sortedData);
                // update button text maybe
                sortBtn.textContent = currentSortAsc ? 'sort by date ⇅' : 'sort by date ⇅ (desc)';
            });

            // optional: add subtle note for major showers
        })();