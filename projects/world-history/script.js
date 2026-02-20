        (function() {
            // ---------- WORLD WAR HISTORY DATASET ----------
            const events = [
                // WWI (1914-1918)
                { year: 1914, title: "Assassination of Franz Ferdinand", desc: "heir to Austro-Hungarian throne killed in Sarajevo, triggers July Crisis and war declarations.", theme: "leader", fullDesc: "On June 28, 1914, Gavrilo Princip shot Archduke Franz Ferdinand. Within weeks, alliances pulled major powers into war – the start of WWI." },
                { year: 1914, title: "Battle of the Marne", desc: "Allied counter-offensive halts German advance; beginning of trench warfare.", theme: "battle", fullDesc: "First Battle of the Marne (Sept 1914) saved Paris. Both sides then dug in – the 'race to the sea' began." },
                { year: 1916, title: "Battle of Verdun", desc: "Longest and one of the most costly battles in human history.", theme: "battle", fullDesc: "Verdun became a symbol of French determination. Casualties ~700,000 (dead/wounded)." },
                { year: 1916, title: "Battle of the Somme", desc: "Over 1 million casualties; first use of tanks.", theme: "tech", fullDesc: "British forces introduced the Mark I tank. The battle lasted from July to November 1916." },
                { year: 1917, title: "U.S. enters the war", desc: "Wilson asks Congress for declaration of war against Germany.", theme: "leader", fullDesc: "Following unrestricted submarine warfare and Zimmermann Telegram, US joined Allies in April 1917." },
                { year: 1918, title: "Armistice Day", desc: "Ceasefire on the Western Front; end of WWI.", theme: "homefront", fullDesc: "11 November 1918, at 11 a.m. – the war ended. Celebrations worldwide." },
                // interwar (1919-1938)
                { year: 1919, title: "Treaty of Versailles", desc: "Officially ends WWI; imposes heavy reparations on Germany.", theme: "leader", fullDesc: "The treaty's 'war guilt' clause and reparations fueled resentment in Germany." },
                { year: 1922, title: "March on Rome", desc: "Mussolini becomes Italian Prime Minister; fascism rises.", theme: "leader", fullDesc: "Benito Mussolini's National Fascist Party seized power, inspiring other dictators." },
                { year: 1929, title: "Wall Street Crash", desc: "Stock market collapse triggers Great Depression.", theme: "homefront", fullDesc: "Economic crisis destabilized democracies and boosted extremists globally." },
                { year: 1933, title: "Hitler becomes Chancellor", desc: "Nazi Party gains power in Germany.", theme: "leader", fullDesc: "Paul von Hindenburg appointed Adolf Hitler on January 30, 1933." },
                { year: 1935, title: "Nuremberg Laws", desc: "Anti-Jewish racial laws enacted in Germany.", theme: "homefront", fullDesc: "Systematic persecution of Jews begins; stripped of citizenship." },
                { year: 1936, title: "Spanish Civil War begins", desc: "Nationalists vs Republicans; prelude to WWII.", theme: "battle", fullDesc: "Franco's rebellion; Germany and Italy support Nationalists, USSR aids Republicans." },
                { year: 1938, title: "Munich Agreement", desc: "UK, France, Italy allow Germany to annex Sudetenland.", theme: "leader", fullDesc: "Appeasement policy: 'peace for our time' – but Hitler invaded rest of Czechoslovakia in 1939." },
                // WWII (1939-1945)
                { year: 1939, title: "Invasion of Poland", desc: "Germany attacks Poland; WWII begins.", theme: "battle", fullDesc: "September 1, 1939 – Blitzkrieg. Britain and France declare war on Sept 3." },
                { year: 1940, title: "Fall of France", desc: "Germany conquers France in 6 weeks.", theme: "battle", fullDesc: "Dunkirk evacuation (Operation Dynamo) saved over 300,000 troops." },
                { year: 1940, title: "Battle of Britain", desc: "Luftwaffe vs RAF; first major defeat for Germany.", theme: "tech", fullDesc: "Radar and the Spitfire helped Britain resist invasion." },
                { year: 1941, title: "Operation Barbarossa", desc: "Germany invades Soviet Union.", theme: "battle", fullDesc: "Largest invasion in history; over 4 million Axis troops committed." },
                { year: 1941, title: "Pearl Harbor", desc: "Japan attacks US Pacific Fleet; US enters war.", theme: "battle", fullDesc: "December 7, 1941 – 2,400 Americans killed. 'A date which will live in infamy.'" },
                { year: 1942, title: "Battle of Stalingrad", desc: "Turning point on Eastern Front; German 6th Army surrenders.", theme: "battle", fullDesc: "Harsh winter and urban warfare; over 2 million casualties." },
                { year: 1944, title: "D-Day (Normandy)", desc: "Allied landings in France; opens Western Front.", theme: "tech", fullDesc: "June 6, 1944 – Operation Overlord. Largest amphibious invasion." },
                { year: 1945, title: "Battle of Berlin", desc: "Soviets capture Berlin; Hitler commits suicide.", theme: "battle", fullDesc: "April-May 1945, ending Nazi regime." },
                { year: 1945, title: "Atomic bombs dropped", desc: "Hiroshima & Nagasaki; Japan surrenders.", theme: "tech", fullDesc: "August 6 & 9, 1945 – new era of warfare. WWII ends August 15." },
                { year: 1945, title: "Yalta Conference", desc: "Roosevelt, Churchill, Stalin plan post-war order.", theme: "leader", fullDesc: "February 1945; agreements on Germany, UN, and spheres of influence." }
            ];

            // ----- UI references -----
            const grid = document.getElementById('cardsGrid');
            const eraSlider = document.getElementById('eraSlider');
            const eraDisplay = document.getElementById('eraDisplay');
            const themeFilters = document.querySelectorAll('.theme-btn');
            const modalOverlay = document.getElementById('modalOverlay');
            const modalYear = document.getElementById('modalYear');
            const modalTitle = document.getElementById('modalTitle');
            const modalTheme = document.getElementById('modalTheme');
            const modalDesc = document.getElementById('modalDesc');
            const closeModalBtn = document.getElementById('closeModalBtn');
            const counterDisplay = document.getElementById('counterDisplay');

            // ----- state -----
            let activeTheme = 'all';
            let sliderYearMin = 1914;
            let sliderYearMax = 1945;
            // map slider 0-100 to year 1914-1945 (linear)
            function sliderToYear(val) {
                return Math.round(1914 + (val / 100) * (1945 - 1914));
            }
            function yearToSlider(year) {
                return ((year - 1914) / (1945 - 1914)) * 100;
            }

            // initial: set slider to 1933 (interwar/WWII border)
            eraSlider.value = yearToSlider(1933); // approx 45
            updateEraLabel(1933);

            function updateEraLabel(year) {
                if (year <= 1918) eraDisplay.textContent = '🌹 WWI (1914–1918)';
                else if (year <= 1938) eraDisplay.textContent = '⏳ interwar (1919–1938)';
                else eraDisplay.textContent = '🔥 WWII (1939–1945)';
            }

            // filter events based on activeTheme and slider year range
            function filterEvents() {
                const sliderVal = parseInt(eraSlider.value, 10);
                const currentYear = sliderToYear(sliderVal);

                // filter by year <= currentYear? actually we want events with year <= currentYear (cumulative) or exact?
                // typical portal shows events up to that year, but we want to show all events from 1914 to selected year.
                const filtered = events.filter(ev => {
                    const yearMatch = ev.year <= currentYear;
                    const themeMatch = activeTheme === 'all' || ev.theme === activeTheme;
                    return yearMatch && themeMatch;
                });

                // sort descending (most recent first)
                filtered.sort((a,b) => b.year - a.year);
                renderCards(filtered);
                updateCounter(filtered.length, currentYear);
                updateEraLabel(currentYear);
            }

            function renderCards(eventList) {
                if (eventList.length === 0) {
                    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; background:#0a1b30; border-radius:3rem; color:#ccc;">📭 no events match your filters</div>`;
                    return;
                }

                let html = '';
                eventList.forEach(ev => {
                    html += `
                        <div class="history-card" data-event-id="${ev.title.replace(/\s/g,'')}" data-year="${ev.year}" data-theme="${ev.theme}" data-title="${ev.title}" data-desc="${ev.desc}" data-fulldesc="${ev.fullDesc}">
                            <div class="card-year">${ev.year}</div>
                            <div class="card-title">${ev.title}</div>
                            <div class="card-desc">${ev.desc}</div>
                            <div class="card-footer">
                                <span class="card-theme">${ev.theme}</span>
                                <span>🔍 click</span>
                            </div>
                        </div>
                    `;
                });
                grid.innerHTML = html;

                // attach click to each card (modal)
                document.querySelectorAll('.history-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const year = card.dataset.year;
                        const title = card.dataset.title;
                        const theme = card.dataset.theme;
                        const fulldesc = card.dataset.fulldesc;
                        showModal(year, title, theme, fulldesc);
                    });
                });
            }

            function showModal(year, title, theme, fulldesc) {
                modalYear.textContent = year;
                modalTitle.textContent = title;
                modalTheme.textContent = theme;
                modalDesc.textContent = fulldesc || 'detailed description not available';
                modalOverlay.classList.add('show');
            }

            function updateCounter(count, currentYear) {
                counterDisplay.innerHTML = `📅 up to ${currentYear} · ${count} event${count!==1?'s':''}`;
            }

            // theme click handler
            themeFilters.forEach(btn => {
                btn.addEventListener('click', () => {
                    themeFilters.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeTheme = btn.dataset.theme;
                    filterEvents();
                });
            });

            // slider input
            eraSlider.addEventListener('input', () => {
                filterEvents();
            });

            // close modal
            function closeModal() {
                modalOverlay.classList.remove('show');
            }
            closeModalBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });

            // initial render
            filterEvents();

            // also set slider labels styling
        })();