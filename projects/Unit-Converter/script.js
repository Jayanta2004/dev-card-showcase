// Unit definitions with conversion factors (all relative to base unit)
const units = {
    length: {
        name: 'Length',
        base: 'meter',
        units: {
            meter: { name: 'Meter', symbol: 'm', factor: 1 },
            kilometer: { name: 'Kilometer', symbol: 'km', factor: 0.001 },
            centimeter: { name: 'Centimeter', symbol: 'cm', factor: 100 },
            millimeter: { name: 'Millimeter', symbol: 'mm', factor: 1000 },
            mile: { name: 'Mile', symbol: 'mi', factor: 0.000621371 },
            yard: { name: 'Yard', symbol: 'yd', factor: 1.09361 },
            foot: { name: 'Foot', symbol: 'ft', factor: 3.28084 },
            inch: { name: 'Inch', symbol: 'in', factor: 39.3701 },
            nauticalMile: { name: 'Nautical Mile', symbol: 'nmi', factor: 0.000539957 }
        }
    },
    weight: {
        name: 'Weight',
        base: 'kilogram',
        units: {
            kilogram: { name: 'Kilogram', symbol: 'kg', factor: 1 },
            gram: { name: 'Gram', symbol: 'g', factor: 1000 },
            milligram: { name: 'Milligram', symbol: 'mg', factor: 1000000 },
            metricTon: { name: 'Metric Ton', symbol: 't', factor: 0.001 },
            pound: { name: 'Pound', symbol: 'lb', factor: 2.20462 },
            ounce: { name: 'Ounce', symbol: 'oz', factor: 35.274 },
            stone: { name: 'Stone', symbol: 'st', factor: 0.157473 },
            ton: { name: 'US Ton', symbol: 'ton', factor: 0.00110231 }
        }
    },
    temperature: {
        name: 'Temperature',
        base: 'celsius',
        units: {
            celsius: { name: 'Celsius', symbol: '°C', factor: 1 },
            fahrenheit: { name: 'Fahrenheit', symbol: '°F', factor: 1 },
            kelvin: { name: 'Kelvin', symbol: 'K', factor: 1 }
        }
    },
    volume: {
        name: 'Volume',
        base: 'liter',
        units: {
            liter: { name: 'Liter', symbol: 'L', factor: 1 },
            milliliter: { name: 'Milliliter', symbol: 'mL', factor: 1000 },
            cubicMeter: { name: 'Cubic Meter', symbol: 'm³', factor: 0.001 },
            cubicCentimeter: { name: 'Cubic Centimeter', symbol: 'cm³', factor: 1000 },
            gallon: { name: 'US Gallon', symbol: 'gal', factor: 0.264172 },
            quart: { name: 'US Quart', symbol: 'qt', factor: 1.05669 },
            pint: { name: 'US Pint', symbol: 'pt', factor: 2.11338 },
            cup: { name: 'US Cup', symbol: 'cup', factor: 4.22675 },
            fluidOunce: { name: 'US Fluid Ounce', symbol: 'fl oz', factor: 33.814 },
            tablespoon: { name: 'Tablespoon', symbol: 'tbsp', factor: 67.628 },
            teaspoon: { name: 'Teaspoon', symbol: 'tsp', factor: 202.884 }
        }
    },
    time: {
        name: 'Time',
        base: 'second',
        units: {
            second: { name: 'Second', symbol: 's', factor: 1 },
            millisecond: { name: 'Millisecond', symbol: 'ms', factor: 1000 },
            microsecond: { name: 'Microsecond', symbol: 'µs', factor: 1000000 },
            nanosecond: { name: 'Nanosecond', symbol: 'ns', factor: 1000000000 },
            minute: { name: 'Minute', symbol: 'min', factor: 1/60 },
            hour: { name: 'Hour', symbol: 'h', factor: 1/3600 },
            day: { name: 'Day', symbol: 'd', factor: 1/86400 },
            week: { name: 'Week', symbol: 'wk', factor: 1/604800 },
            month: { name: 'Month', symbol: 'mo', factor: 1/2629800 },
            year: { name: 'Year', symbol: 'yr', factor: 1/31557600 }
        }
    }
};

// State management
let state = {
    currentCategory: 'length',
    fromUnit: 'meter',
    toUnit: 'kilometer',
    history: []
};

// DOM elements
const elements = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    fromValue: document.getElementById('fromValue'),
    toValue: document.getElementById('toValue'),
    fromUnit: document.getElementById('fromUnit'),
    toUnit: document.getElementById('toUnit'),
    swapBtn: document.getElementById('swapBtn'),
    copyBtn: document.getElementById('copyBtn'),
    clearBtn: document.getElementById('clearBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    formulaText: document.getElementById('formulaText'),
    historyList: document.getElementById('historyList'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Initialize the application
function init() {
    loadHistory();
    populateUnitSelects();
    attachEventListeners();
    updateFormula();
}

// Populate unit select dropdowns
function populateUnitSelects() {
    const category = units[state.currentCategory];
    const unitKeys = Object.keys(category.units);
    
    elements.fromUnit.innerHTML = '';
    elements.toUnit.innerHTML = '';
    
    unitKeys.forEach(key => {
        const unit = category.units[key];
        const option1 = new Option(`${unit.name} (${unit.symbol})`, key);
        const option2 = new Option(`${unit.name} (${unit.symbol})`, key);
        elements.fromUnit.add(option1);
        elements.toUnit.add(option2);
    });
    
    // Set default selections
    elements.fromUnit.value = unitKeys[0];
    elements.toUnit.value = unitKeys[1] || unitKeys[0];
    
    state.fromUnit = elements.fromUnit.value;
    state.toUnit = elements.toUnit.value;
}

// Attach event listeners
function attachEventListeners() {
    // Category tabs
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            switchCategory(category);
        });
    });
    
    // Input changes
    elements.fromValue.addEventListener('input', () => {
        convert();
    });
    
    elements.fromUnit.addEventListener('change', () => {
        state.fromUnit = elements.fromUnit.value;
        convert();
    });
    
    elements.toUnit.addEventListener('change', () => {
        state.toUnit = elements.toUnit.value;
        convert();
    });
    
    // Swap button
    elements.swapBtn.addEventListener('click', swapUnits);
    
    // Action buttons
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.clearBtn.addEventListener('click', clearInputs);
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
}

// Switch category
function switchCategory(category) {
    state.currentCategory = category;
    
    // Update active tab
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    // Clear inputs and update selects
    elements.fromValue.value = '';
    elements.toValue.value = '';
    populateUnitSelects();
    updateFormula();
}

// Convert function
function convert() {
    const value = parseFloat(elements.fromValue.value);
    
    if (isNaN(value) || elements.fromValue.value === '') {
        elements.toValue.value = '';
        updateFormula();
        return;
    }
    
    let result;
    
    if (state.currentCategory === 'temperature') {
        result = convertTemperature(value, state.fromUnit, state.toUnit);
    } else {
        const category = units[state.currentCategory];
        const fromFactor = category.units[state.fromUnit].factor;
        const toFactor = category.units[state.toUnit].factor;
        
        // Convert to base unit, then to target unit
        const baseValue = value / fromFactor;
        result = baseValue * toFactor;
    }
    
    elements.toValue.value = formatNumber(result);
    updateFormula(value, result);
    
    // Add to history
    addToHistory(value, state.fromUnit, result, state.toUnit);
}

// Temperature conversion (special case)
function convertTemperature(value, from, to) {
    let celsius;
    
    // Convert to Celsius first
    switch (from) {
        case 'celsius':
            celsius = value;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            break;
    }
    
    // Convert from Celsius to target
    switch (to) {
        case 'celsius':
            return celsius;
        case 'fahrenheit':
            return celsius * 9/5 + 32;
        case 'kelvin':
            return celsius + 273.15;
    }
}

// Format number for display
function formatNumber(num) {
    if (Math.abs(num) < 0.000001 && num !== 0) {
        return num.toExponential(6);
    }
    
    const rounded = Math.round(num * 1000000) / 1000000;
    return rounded.toString();
}

// Update formula display
function updateFormula(fromValue, toValue) {
    const category = units[state.currentCategory];
    const fromUnit = category.units[state.fromUnit];
    const toUnit = category.units[state.toUnit];
    
    if (!fromValue) {
        elements.formulaText.textContent = `1 ${fromUnit.symbol} = ${formatNumber(
            state.currentCategory === 'temperature' 
                ? convertTemperature(1, state.fromUnit, state.toUnit)
                : (1 / fromUnit.factor) * toUnit.factor
        )} ${toUnit.symbol}`;
    } else {
        elements.formulaText.textContent = `${fromValue} ${fromUnit.symbol} = ${toValue} ${toUnit.symbol}`;
    }
}

// Swap units
function swapUnits() {
    // Swap values
    const tempUnit = state.fromUnit;
    state.fromUnit = state.toUnit;
    state.toUnit = tempUnit;
    
    // Update selects
    elements.fromUnit.value = state.fromUnit;
    elements.toUnit.value = state.toUnit;
    
    // Swap input values
    const tempValue = elements.fromValue.value;
    elements.fromValue.value = elements.toValue.value;
    elements.toValue.value = '';
    
    // Reconvert
    convert();
}

// Copy to clipboard
function copyToClipboard() {
    const value = elements.toValue.value;
    
    if (!value) {
        showToast('Nothing to copy!', 'error');
        return;
    }
    
    navigator.clipboard.writeText(value).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Clear inputs
function clearInputs() {
    elements.fromValue.value = '';
    elements.toValue.value = '';
    updateFormula();
}

// Add to history
function addToHistory(fromValue, fromUnit, toValue, toUnit) {
    const category = units[state.currentCategory];
    const fromUnitData = category.units[fromUnit];
    const toUnitData = category.units[toUnit];
    
    const historyItem = {
        id: Date.now(),
        category: state.currentCategory,
        conversion: `${formatNumber(fromValue)} ${fromUnitData.symbol} = ${formatNumber(toValue)} ${toUnitData.symbol}`,
        fromValue,
        fromUnit,
        toValue,
        toUnit,
        timestamp: new Date().toLocaleString()
    };
    
    // Add to beginning of history
    state.history.unshift(historyItem);
    
    // Limit history to 50 items
    if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
    }
    
    saveHistory();
    renderHistory();
}

// Render history
function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<p class="no-history">No conversions yet. Start converting!</p>';
        return;
    }
    
    elements.historyList.innerHTML = state.history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-content">
                <div class="history-conversion">${item.conversion}</div>
                <div class="history-timestamp">
                    <i class="fas fa-clock"></i> ${item.timestamp}
                </div>
            </div>
            <div class="history-actions">
                <button class="history-btn" onclick="reloadConversion(${item.id})" title="Reload">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="history-btn" onclick="copyHistoryItem('${item.conversion}')" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="history-btn" onclick="deleteHistoryItem(${item.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Reload conversion from history
function reloadConversion(id) {
    const item = state.history.find(h => h.id === id);
    if (!item) return;
    
    // Switch to category if needed
    if (state.currentCategory !== item.category) {
        switchCategory(item.category);
    }
    
    // Set units and value
    state.fromUnit = item.fromUnit;
    state.toUnit = item.toUnit;
    elements.fromUnit.value = item.fromUnit;
    elements.toUnit.value = item.toUnit;
    elements.fromValue.value = item.fromValue;
    
    convert();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Copy history item
function copyHistoryItem(conversion) {
    navigator.clipboard.writeText(conversion).then(() => {
        showToast('Copied to clipboard!', 'success');
    });
}

// Delete history item
function deleteHistoryItem(id) {
    state.history = state.history.filter(h => h.id !== id);
    saveHistory();
    renderHistory();
    showToast('Item deleted', 'success');
}

// Clear history
function clearHistory() {
    if (state.history.length === 0) return;
    
    if (confirm('Are you sure you want to clear all history?')) {
        state.history = [];
        saveHistory();
        renderHistory();
        showToast('History cleared', 'success');
    }
}

// Save history to localStorage
function saveHistory() {
    try {
        localStorage.setItem('unitConverterHistory', JSON.stringify(state.history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

// Load history from localStorage
function loadHistory() {
    try {
        const saved = localStorage.getItem('unitConverterHistory');
        if (saved) {
            state.history = JSON.parse(saved);
            renderHistory();
        }
    } catch (e) {
        console.error('Failed to load history:', e);
        state.history = [];
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = 'toast show';
    
    if (type === 'error') {
        elements.toast.style.background = '#ef4444';
    } else {
        elements.toast.style.background = '#10b981';
    }
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearInputs();
    }
    
    // Ctrl/Cmd + S to swap
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        swapUnits();
    }
    
    // Ctrl/Cmd + C to copy (when focus is on result)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === elements.toValue) {
        e.preventDefault();
        copyToClipboard();
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
