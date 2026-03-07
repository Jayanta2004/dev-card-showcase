        (function() {
            // ----- CONVERSION DATABASE -----
            const conversionRates = {
                length: {
                    meter: 1,
                    kilometer: 0.001,
                    centimeter: 100,
                    millimeter: 1000,
                    mile: 0.000621371,
                    yard: 1.09361,
                    foot: 3.28084,
                    inch: 39.3701
                },
                weight: {
                    kilogram: 1,
                    gram: 1000,
                    milligram: 1e6,
                    pound: 2.20462,
                    ounce: 35.274,
                    ton: 0.001,
                    stone: 0.157473
                },
                volume: {
                    liter: 1,
                    milliliter: 1000,
                    gallon: 0.264172,
                    quart: 1.05669,
                    pint: 2.11338,
                    cup: 4.16667,
                    tablespoon: 66.6667,
                    teaspoon: 200
                },
                speed: {
                    'meter per second': 1,
                    'kilometer per hour': 3.6,
                    'mile per hour': 2.23694,
                    knot: 1.94384,
                    'foot per second': 3.28084
                }
            };

            // temperature special functions
            const tempConversions = {
                celsius: {
                    toFahrenheit: (c) => c * 9/5 + 32,
                    toKelvin: (c) => c + 273.15
                },
                fahrenheit: {
                    toCelsius: (f) => (f - 32) * 5/9,
                    toKelvin: (f) => (f - 32) * 5/9 + 273.15
                },
                kelvin: {
                    toCelsius: (k) => k - 273.15,
                    toFahrenheit: (k) => (k - 273.15) * 9/5 + 32
                }
            };

            // unit display names and lists per category
            const unitLists = {
                length: ['meter', 'kilometer', 'centimeter', 'millimeter', 'mile', 'yard', 'foot', 'inch'],
                weight: ['kilogram', 'gram', 'milligram', 'pound', 'ounce', 'ton', 'stone'],
                temperature: ['celsius', 'fahrenheit', 'kelvin'],
                volume: ['liter', 'milliliter', 'gallon', 'quart', 'pint', 'cup', 'tablespoon', 'teaspoon'],
                speed: ['meter per second', 'kilometer per hour', 'mile per hour', 'knot', 'foot per second']
            };

            // state
            let currentCategory = 'length';
            let fromUnit = 'meter';
            let toUnit = 'kilometer';
            let inputVal = 1;

            // DOM elements
            const categoryChips = document.querySelectorAll('.category-chip');
            const unitFromSelect = document.getElementById('unitFrom');
            const unitToSelect = document.getElementById('unitTo');
            const inputValue = document.getElementById('inputValue');
            const outputValue = document.getElementById('outputValue');
            const resultDisplay = document.getElementById('resultDisplay');
            const resultUnit = document.getElementById('resultUnit');
            const swapBtn = document.getElementById('swapBtn');
            const favChips = document.querySelectorAll('.fav-chip');

            // populate dropdowns for given category
            function populateUnits() {
                const units = unitLists[currentCategory];
                unitFromSelect.innerHTML = '';
                unitToSelect.innerHTML = '';

                units.forEach(unit => {
                    const optionFrom = document.createElement('option');
                    optionFrom.value = unit;
                    optionFrom.textContent = unit;
                    if (unit === fromUnit) optionFrom.selected = true;
                    unitFromSelect.appendChild(optionFrom);

                    const optionTo = document.createElement('option');
                    optionTo.value = unit;
                    optionTo.textContent = unit;
                    if (unit === toUnit) optionTo.selected = true;
                    unitToSelect.appendChild(optionTo);
                });

                // ensure from/to not equal
                if (fromUnit === toUnit) {
                    // change to second option if possible
                    if (units.length > 1) {
                        toUnit = units[1];
                        unitToSelect.value = toUnit;
                    }
                }
            }

            // perform conversion
            function convert() {
                inputVal = parseFloat(inputValue.value) || 0;
                let result;

                if (currentCategory === 'temperature') {
                    // handle special temperature formulas
                    if (fromUnit === toUnit) {
                        result = inputVal;
                    } else if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
                        result = tempConversions.celsius.toFahrenheit(inputVal);
                    } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
                        result = tempConversions.celsius.toKelvin(inputVal);
                    } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
                        result = tempConversions.fahrenheit.toCelsius(inputVal);
                    } else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') {
                        result = tempConversions.fahrenheit.toKelvin(inputVal);
                    } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
                        result = tempConversions.kelvin.toCelsius(inputVal);
                    } else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') {
                        result = tempConversions.kelvin.toFahrenheit(inputVal);
                    } else {
                        result = inputVal; // fallback
                    }
                } else {
                    // standard ratio conversion
                    const rates = conversionRates[currentCategory];
                    const baseValue = inputVal / rates[fromUnit];
                    result = baseValue * rates[toUnit];
                }

                // format result
                const formatted = Number.isInteger(result) ? result : result.toFixed(4);
                outputValue.value = formatted;
                resultDisplay.innerText = formatted;
                resultUnit.innerText = toUnit;
            }

            // category change
            function setCategory(cat) {
                currentCategory = cat;
                // set default units
                const units = unitLists[cat];
                fromUnit = units[0];
                toUnit = units.length > 1 ? units[1] : units[0];
                
                populateUnits();
                convert();

                // update active chip
                categoryChips.forEach(chip => {
                    chip.classList.remove('active');
                    if (chip.getAttribute('data-cat') === cat) {
                        chip.classList.add('active');
                    }
                });
            }

            // event listeners
            categoryChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const cat = chip.getAttribute('data-cat');
                    setCategory(cat);
                });
            });

            unitFromSelect.addEventListener('change', (e) => {
                fromUnit = e.target.value;
                convert();
            });

            unitToSelect.addEventListener('change', (e) => {
                toUnit = e.target.value;
                convert();
            });

            inputValue.addEventListener('input', convert);

            swapBtn.addEventListener('click', () => {
                [fromUnit, toUnit] = [toUnit, fromUnit];
                unitFromSelect.value = fromUnit;
                unitToSelect.value = toUnit;
                convert();
            });

            favChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const from = chip.getAttribute('data-from');
                    const to = chip.getAttribute('data-to');
                    
                    // find category that contains both
                    for (const [cat, units] of Object.entries(unitLists)) {
                        if (units.includes(from) && units.includes(to)) {
                            setCategory(cat);
                            fromUnit = from;
                            toUnit = to;
                            unitFromSelect.value = from;
                            unitToSelect.value = to;
                            convert();
                            break;
                        }
                    }
                });
            });

            // initial setup
            setCategory('length');
        })();