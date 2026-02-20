    (function() {
        // ---------- state ----------
        let currentCategory = 'length';      // 'length', 'weight', 'temperature'

        // common unit definitions
        const lengthUnits = [
            { name: 'meters', factor: 1 },          // base: meter
            { name: 'kilometers', factor: 0.001 },
            { name: 'centimeters', factor: 100 },
            { name: 'millimeters', factor: 1000 },
            { name: 'miles', factor: 0.000621371 },
            { name: 'yards', factor: 1.09361 },
            { name: 'feet', factor: 3.28084 },
            { name: 'inches', factor: 39.3701 }
        ];

        const weightUnits = [
            { name: 'kilograms', factor: 1 },       // base: kilogram
            { name: 'grams', factor: 1000 },
            { name: 'milligrams', factor: 1e6 },
            { name: 'pounds', factor: 2.20462 },
            { name: 'ounces', factor: 35.274 }
        ];

        // temperature is special (non-linear), we handle separately

        // DOM elements
        const tabLength = document.getElementById('tabLength');
        const tabWeight = document.getElementById('tabWeight');
        const tabTemp = document.getElementById('tabTemp');
        const panel = document.getElementById('panel');
        const formulaHint = document.getElementById('formulaHint');

        // render panel based on current category
        function renderPanel() {
            if (currentCategory === 'length') {
                renderLengthWeight('length', lengthUnits, 'meter');
            } else if (currentCategory === 'weight') {
                renderLengthWeight('weight', weightUnits, 'kilogram');
            } else if (currentCategory === 'temperature') {
                renderTemperature();
            }
        }

        // for length & weight (linear conversion)
        function renderLengthWeight(category, unitList, baseUnitName) {
            let leftValue = 1;
            let leftUnit = unitList[0].name;    // default meters or kg
            let rightUnit = unitList[4] ? unitList[4].name : unitList[1].name; // miles or pounds if exist

            // attempt to load last used from localStorage?
            // we can skip to keep simple, but we may want to preserve inputs. we'll keep it simple on render.

            // generate selects
            let leftOptions = unitList.map(u => `<option value="${u.name}" ${u.name === leftUnit ? 'selected' : ''}>${u.name}</option>`).join('');
            let rightOptions = unitList.map(u => `<option value="${u.name}" ${u.name === rightUnit ? 'selected' : ''}>${u.name}</option>`).join('');

            const html = `
                <div class="input-group">
                    <div class="label">🔽 from</div>
                    <div class="unit-row">
                        <input type="number" id="leftInput" value="1" step="any">
                        <select id="leftUnit">${leftOptions}</select>
                    </div>
                </div>
                <div class="swap-icon">⇅</div>
                <div class="input-group">
                    <div class="label">🔼 to</div>
                    <div class="unit-row">
                        <input type="number" id="rightInput" value="" readonly style="background:#f2f9ff;" step="any">
                        <select id="rightUnit">${rightOptions}</select>
                    </div>
                </div>
                <div class="result-area">
                    <span class="result-label">converted</span>
                    <span class="result-value" id="resultDisplay">—</span>
                </div>
            `;
            panel.innerHTML = html;

            // attach listeners
            const leftInput = document.getElementById('leftInput');
            const leftUnit = document.getElementById('leftUnit');
            const rightInput = document.getElementById('rightInput');
            const rightUnit = document.getElementById('rightUnit');
            const resultSpan = document.getElementById('resultDisplay');

            function updateLinear() {
                const val = parseFloat(leftInput.value);
                if (isNaN(val)) {
                    rightInput.value = '';
                    resultSpan.textContent = '—';
                    return;
                }
                const fromUnitName = leftUnit.value;
                const toUnitName = rightUnit.value;

                // find factors
                const fromUnit = unitList.find(u => u.name === fromUnitName);
                const toUnit = unitList.find(u => u.name === toUnitName);
                if (!fromUnit || !toUnit) return;

                // convert: val (from) -> base (factor 1) -> to
                const baseValue = val / fromUnit.factor;    // because factor is base unit per fromUnit (e.g. 1 meter = 3.28084 feet, so feet factor = 3.28084 -> baseValue = val / factor)
                const result = baseValue * toUnit.factor;

                rightInput.value = result.toFixed(6);
                resultSpan.textContent = result.toFixed(4);
            }

            leftInput.addEventListener('input', updateLinear);
            leftUnit.addEventListener('change', updateLinear);
            rightUnit.addEventListener('change', updateLinear);

            // initial update
            updateLinear();
            // update formula hint
            formulaHint.textContent = `⚡ 1 ${baseUnitName} = ${unitList[4] ? unitList[4].factor.toFixed(5) + ' ' + unitList[4].name : ''} ...`;
        }

        // temperature panel (special formulas)
        function renderTemperature() {
            const html = `
                <div class="input-group">
                    <div class="label">🌡️ from</div>
                    <div class="unit-row">
                        <input type="number" id="tempInput" value="0" step="any">
                        <select id="tempFromUnit">
                            <option value="C">Celsius °C</option>
                            <option value="F">Fahrenheit °F</option>
                            <option value="K">Kelvin K</option>
                        </select>
                    </div>
                </div>
                <div class="swap-icon">⇆</div>
                <div class="input-group">
                    <div class="label">🎯 to</div>
                    <div class="unit-row">
                        <input type="number" id="tempOutput" value="" readonly style="background:#f2f9ff;">
                        <select id="tempToUnit">
                            <option value="F">Fahrenheit °F</option>
                            <option value="C">Celsius °C</option>
                            <option value="K">Kelvin K</option>
                        </select>
                    </div>
                </div>
                <div class="result-area">
                    <span class="result-label">result</span>
                    <span class="result-value" id="tempResultDisplay">—</span>
                </div>
            `;
            panel.innerHTML = html;

            const tempInput = document.getElementById('tempInput');
            const tempFrom = document.getElementById('tempFromUnit');
            const tempTo = document.getElementById('tempToUnit');
            const tempOutput = document.getElementById('tempOutput');
            const tempResultSpan = document.getElementById('tempResultDisplay');

            function convertTemp() {
                const val = parseFloat(tempInput.value);
                if (isNaN(val)) {
                    tempOutput.value = '';
                    tempResultSpan.textContent = '—';
                    return;
                }
                const from = tempFrom.value;
                const to = tempTo.value;

                // first convert 'from' to Celsius
                let celsius;
                if (from === 'C') celsius = val;
                else if (from === 'F') celsius = (val - 32) * 5/9;
                else if (from === 'K') celsius = val - 273.15;

                // then from celsius to target
                let result;
                if (to === 'C') result = celsius;
                else if (to === 'F') result = celsius * 9/5 + 32;
                else if (to === 'K') result = celsius + 273.15;

                tempOutput.value = result.toFixed(2);
                tempResultSpan.textContent = result.toFixed(2);
            }

            tempInput.addEventListener('input', convertTemp);
            tempFrom.addEventListener('change', convertTemp);
            tempTo.addEventListener('change', convertTemp);
            convertTemp(); // initial

            formulaHint.textContent = '🌡️ °C to °F: (°C × 9/5) + 32 · °F to °C: (°F − 32) × 5/9 · K = °C + 273.15';
        }

        // tab switching
        function setActiveTab(category) {
            [tabLength, tabWeight, tabTemp].forEach(tab => tab.classList.remove('active'));
            if (category === 'length') tabLength.classList.add('active');
            if (category === 'weight') tabWeight.classList.add('active');
            if (category === 'temperature') tabTemp.classList.add('active');
            currentCategory = category;
            renderPanel();
        }

        tabLength.addEventListener('click', () => setActiveTab('length'));
        tabWeight.addEventListener('click', () => setActiveTab('weight'));
        tabTemp.addEventListener('click', () => setActiveTab('temperature'));

        // initial render
        setActiveTab('length');
    })();