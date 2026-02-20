    (function() {
        // ----- PHILOSOPHER DATA -----
        const philosophers = [
            { name: 'Socrates', birth: -470, death: -399, region: 'Athens', school: 'ancient-greek', era: 'ancient', idea: 'Socratic method, ethics, "know thyself".', work: 'No writings; known through Plato.' },
            { name: 'Plato', birth: -428, death: -348, region: 'Athens', school: 'ancient-greek', era: 'ancient', idea: 'Theory of Forms, idealism, The Republic.', work: 'Dialogues, Academy founder.' },
            { name: 'Aristotle', birth: -384, death: -322, region: 'Stagira', school: 'ancient-greek', era: 'ancient', idea: 'Logic, metaphysics, virtue ethics, Lyceum.', work: 'Nicomachean Ethics, Politics.' },
            { name: 'Confucius', birth: -551, death: -479, region: 'China', school: 'eastern', era: 'ancient', idea: 'Ethics, filial piety, moral cultivation.', work: 'Analects (Lunyu).' },
            { name: 'Laozi', birth: -601, death: -531, region: 'China', school: 'eastern', era: 'ancient', idea: 'Daoism, wu-wei, natural harmony.', work: 'Tao Te Ching.' },
            { name: 'Augustine', birth: 354, death: 430, region: 'Hippo (Algeria)', school: 'medieval', era: 'medieval', idea: 'Theodicy, original sin, divine grace.', work: 'Confessions, City of God.' },
            { name: 'Avicenna', birth: 980, death: 1037, region: 'Persia', school: 'medieval', era: 'medieval', idea: 'Islamic philosophy, metaphysics, The Cure.', work: 'Canon of Medicine.' },
            { name: 'Thomas Aquinas', birth: 1225, death: 1274, region: 'Italy', school: 'medieval', era: 'medieval', idea: 'Scholasticism, natural law, Summa Theologica.', work: 'Summa contra Gentiles.' },
            { name: 'René Descartes', birth: 1596, death: 1650, region: 'France', school: 'modern', era: 'early-modern', idea: 'Cogito ergo sum, dualism, rationalism.', work: 'Meditations on First Philosophy.' },
            { name: 'John Locke', birth: 1632, death: 1704, region: 'England', school: 'modern', era: 'early-modern', idea: 'Empiricism, tabula rasa, natural rights.', work: 'Essay Concerning Human Understanding.' },
            { name: 'David Hume', birth: 1711, death: 1776, region: 'Scotland', school: 'modern', era: 'early-modern', idea: 'Empiricism, skepticism, problem of induction.', work: 'A Treatise of Human Nature.' },
            { name: 'Immanuel Kant', birth: 1724, death: 1804, region: 'Prussia', school: 'modern', era: 'early-modern', idea: 'Categorical imperative, transcendental idealism.', work: 'Critique of Pure Reason.' },
            { name: 'Jean-Jacques Rousseau', birth: 1712, death: 1778, region: 'Geneva', school: 'political', era: 'early-modern', idea: 'Social contract, general will, noble savage.', work: 'The Social Contract.' },
            { name: 'Karl Marx', birth: 1818, death: 1883, region: 'Germany', school: 'political', era: 'modern', idea: 'Historical materialism, class struggle.', work: 'Das Kapital, Communist Manifesto.' },
            { name: 'Friedrich Nietzsche', birth: 1844, death: 1900, region: 'Germany', school: 'existential', era: 'modern', idea: 'Will to power, Übermensch, eternal return.', work: 'Thus Spoke Zarathustra.' },
            { name: 'Søren Kierkegaard', birth: 1813, death: 1855, region: 'Denmark', school: 'existential', era: 'modern', idea: 'Existentialism, anxiety, leap of faith.', work: 'Fear and Trembling.' },
            { name: 'Simone de Beauvoir', birth: 1908, death: 1986, region: 'France', school: 'existential', era: 'modern', idea: 'Feminist existentialism, "One is not born a woman".', work: 'The Second Sex.' },
            { name: 'Jean-Paul Sartre', birth: 1905, death: 1980, region: 'France', school: 'existential', era: 'modern', idea: 'Existence precedes essence, radical freedom.', work: 'Being and Nothingness.' },
            { name: 'Hannah Arendt', birth: 1906, death: 1975, region: 'Germany/US', school: 'political', era: 'modern', idea: 'Totalitarianism, banality of evil.', work: 'The Origins of Totalitarianism.' },
            { name: 'Epicurus', birth: -341, death: -270, region: 'Samos', school: 'ancient-greek', era: 'ancient', idea: 'Pleasure as absence of pain, ataraxia.', work: 'Letter to Menoeceus.' },
            { name: 'Zeno of Citium', birth: -334, death: -262, region: 'Cyprus', school: 'ancient-greek', era: 'ancient', idea: 'Stoicism, virtue, living according to nature.', work: 'Fragments.' },
            { name: 'Seneca', birth: -4, death: 65, region: 'Rome', school: 'ancient-greek', era: 'ancient', idea: 'Stoic ethics, anger, tranquility.', work: 'Letters from a Stoic.' },
            { name: 'Mencius', birth: -372, death: -289, region: 'China', school: 'eastern', era: 'ancient', idea: 'Innate goodness of human nature.', work: 'Mencius.' },
            { name: 'Zhuangzi', birth: -369, death: -286, region: 'China', school: 'eastern', era: 'ancient', idea: 'Relativism, spontaneity, dreaming.', work: 'Zhuangzi.' }
        ];

        // state
        let currentSchool = 'all';
        let currentEra = 'all';
        let selectedPhilosopher = null;

        // DOM elements
        const grid = document.getElementById('philosopherGrid');
        const resultSpan = document.getElementById('resultCount');
        const activeLabel = document.getElementById('activeFilterLabel');
        const schoolBtns = document.querySelectorAll('.school-btn');
        const eraSelect = document.getElementById('eraSelect');
        const modal = document.getElementById('philosopherModal');
        const modalName = document.getElementById('modalName');
        const modalOrigin = document.getElementById('modalOrigin');
        const modalSchool = document.getElementById('modalSchool');
        const modalIdeas = document.getElementById('modalIdeas');
        const modalWork = document.getElementById('modalWork');
        const closeBtn = document.getElementById('closeModalBtn');

        // helpers
        function filterPhilosophers() {
            return philosophers.filter(p => {
                if (currentSchool !== 'all' && p.school !== currentSchool) return false;
                if (currentEra !== 'all' && p.era !== currentEra) return false;
                return true;
            });
        }

        // get era string from year (approx)
        function eraYearText(year) {
            if (year < 0) return `${Math.abs(year)} BCE`;
            return `${year} CE`;
        }

        // render grid
        function render() {
            const filtered = filterPhilosophers();
            resultSpan.innerText = `🧠 ${filtered.length} thinker${filtered.length !== 1 ? 's' : ''}`;

            // active filter labels
            let labelParts = [];
            if (currentSchool !== 'all') {
                const schoolNames = {
                    'ancient-greek': 'ancient greek', 'eastern': 'eastern', 'modern': 'modern',
                    'existential': 'existentialism', 'political': 'political', 'medieval': 'medieval'
                };
                labelParts.push(`school: ${schoolNames[currentSchool] || currentSchool}`);
            }
            if (currentEra !== 'all') {
                const eraNames = { 'ancient':'ancient', 'medieval':'medieval', 'early-modern':'early modern', 'modern':'modern' };
                labelParts.push(`era: ${eraNames[currentEra]}`);
            }
            activeLabel.innerHTML = labelParts.map(p => `<span>${p}</span>`).join(' ');

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="no-results">🔍 no philosophers found · adjust filters</div>`;
                return;
            }

            let html = '';
            filtered.forEach(p => {
                const lifespan = `${eraYearText(p.birth)} – ${p.death < 0 ? eraYearText(p.death) : p.death} `;
                const schoolDisplay = {
                    'ancient-greek': '🏛️ ancient greek', 'eastern': '☯️ eastern', 'modern': '⚡ modern',
                    'existential': '🌫️ existential', 'political': '🏛️ political', 'medieval': '⛪ medieval'
                }[p.school] || p.school;
                html += `<div class="card" data-name="${p.name}">`;
                html += `<div class="century">${lifespan}</div>`;
                html += `<div class="card-title">${p.name}</div>`;
                html += `<div class="origin">${p.region}</div>`;
                html += `<div class="school-tag">${schoolDisplay}</div>`;
                html += `<div class="idea">${p.idea.substring(0, 65)}${p.idea.length > 65 ? '…' : ''}</div>`;
                html += `<div class="card-footer">✎ tap for more</div>`;
                html += `</div>`;
            });
            grid.innerHTML = html;

            // attach click to each card
            document.querySelectorAll('.card').forEach(card => {
                card.addEventListener('click', () => {
                    const name = card.dataset.name;
                    const philosopher = philosophers.find(p => p.name === name);
                    if (philosopher) showModal(philosopher);
                });
            });
        }

        // show modal with full info
        function showModal(p) {
            selectedPhilosopher = p;
            modalName.innerText = p.name;
            const lifespan = `${eraYearText(p.birth)} – ${p.death < 0 ? eraYearText(p.death) : p.death}`;
            modalOrigin.innerText = `${p.region} · ${lifespan}`;
            const schoolMap = {
                'ancient-greek': '🏛️ ancient greek', 'eastern': '☯️ eastern', 'modern': '⚡ modern',
                'existential': '🌫️ existentialism', 'political': '🏛️ political', 'medieval': '⛪ medieval'
            };
            modalSchool.innerText = `${schoolMap[p.school] || p.school} · ${p.era}`;
            modalIdeas.innerText = `💡 ${p.idea}`;
            modalWork.innerText = `📜 ${p.work || 'major works'}`;
            modal.style.display = 'flex';
        }

        function hideModal() {
            modal.style.display = 'none';
        }

        // filter event listeners
        schoolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                schoolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentSchool = btn.dataset.school;
                render();
            });
        });

        eraSelect.addEventListener('change', (e) => {
            currentEra = e.target.value;
            render();
        });

        closeBtn.addEventListener('click', hideModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideModal();
        });

        // initial render
        render();
    })();