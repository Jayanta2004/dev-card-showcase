// UnitConverter Pro - Engineering & Science Conversion Tool

document.addEventListener('DOMContentLoaded', function() {
    // Application state
    const state = {
        currentCategory: 'length',
        fromUnit: '',
        toUnit: '',
        fromValue: 1,
        toValue: 0,
        conversionHistory: [],
        favorites: [],
        conversionCount: 0,
        precision: {
            decimalPlaces: 2,
            roundingMode: 'round',
            scientificNotation: 'auto',
            significantFigures: true
        },
        theme: localStorage.getItem('unitConverterTheme') || 'light',
        unitDefinitions: {}
    };
    
    // Unit definitions with conversion formulas
    const unitDefinitions = {
        length: {
            name: 'Length',
            units: {
                meter: { name: 'Meter', symbol: 'm', factor: 1 },
                kilometer: { name: 'Kilometer', symbol: 'km', factor: 1000 },
                centimeter: { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
                millimeter: { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
                micrometer: { name: 'Micrometer', symbol: 'μm', factor: 0.000001 },
                nanometer: { name: 'Nanometer', symbol: 'nm', factor: 1e-9 },
                mile: { name: 'Mile', symbol: 'mi', factor: 1609.344 },
                yard: { name: 'Yard', symbol: 'yd', factor: 0.9144 },
                foot: { name: 'Foot', symbol: 'ft', factor: 0.3048 },
                inch: { name: 'Inch', symbol: 'in', factor: 0.0254 },
                nauticalMile: { name: 'Nautical Mile', symbol: 'nmi', factor: 1852 }
            },
            defaultFrom: 'meter',
            defaultTo: 'foot',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        temperature: {
            name: 'Temperature',
            units: {
                celsius: { name: 'Celsius', symbol: '°C', offset: 0, factor: 1 },
                fahrenheit: { name: 'Fahrenheit', symbol: '°F', offset: 32, factor: 5/9 },
                kelvin: { name: 'Kelvin', symbol: 'K', offset: 273.15, factor: 1 },
                rankine: { name: 'Rankine', symbol: '°R', offset: 491.67, factor: 5/9 }
            },
            defaultFrom: 'celsius',
            defaultTo: 'fahrenheit',
            formula: (from, to, value) => {
                // Convert to Celsius first
                let celsius;
                switch(from.symbol) {
                    case '°C': celsius = value; break;
                    case '°F': celsius = (value - 32) * 5/9; break;
                    case 'K': celsius = value - 273.15; break;
                    case '°R': celsius = (value - 491.67) * 5/9; break;
                    default: celsius = value;
                }
                
                // Convert from Celsius to target
                switch(to.symbol) {
                    case '°C': return celsius;
                    case '°F': return (celsius * 9/5) + 32;
                    case 'K': return celsius + 273.15;
                    case '°R': return (celsius + 273.15) * 9/5;
                    default: return celsius;
                }
            },
            formulaDisplay: (from, to) => {
                const formulas = {
                    '°C→°F': '°F = (°C × 9/5) + 32',
                    '°F→°C': '°C = (°F - 32) × 5/9',
                    '°C→K': 'K = °C + 273.15',
                    'K→°C': '°C = K - 273.15',
                    '°F→K': 'K = (°F + 459.67) × 5/9',
                    'K→°F': '°F = (K × 9/5) - 459.67',
                    '°C→°R': '°R = (°C + 273.15) × 9/5',
                    '°R→°C': '°C = (°R × 5/9) - 273.15'
                };
                
                const key = `${from.symbol}→${to.symbol}`;
                return formulas[key] || `${to.symbol} = f(${from.symbol})`;
            }
        },
        
        pressure: {
            name: 'Pressure',
            units: {
                pascal: { name: 'Pascal', symbol: 'Pa', factor: 1 },
                kilopascal: { name: 'Kilopascal', symbol: 'kPa', factor: 1000 },
                megapascal: { name: 'Megapascal', symbol: 'MPa', factor: 1000000 },
                bar: { name: 'Bar', symbol: 'bar', factor: 100000 },
                millibar: { name: 'Millibar', symbol: 'mbar', factor: 100 },
                atmosphere: { name: 'Atmosphere', symbol: 'atm', factor: 101325 },
                psi: { name: 'PSI', symbol: 'psi', factor: 6894.76 },
                torr: { name: 'Torr', symbol: 'Torr', factor: 133.322 },
                mmHg: { name: 'mmHg', symbol: 'mmHg', factor: 133.322 }
            },
            defaultFrom: 'pascal',
            defaultTo: 'psi',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        energy: {
            name: 'Energy',
            units: {
                joule: { name: 'Joule', symbol: 'J', factor: 1 },
                kilojoule: { name: 'Kilojoule', symbol: 'kJ', factor: 1000 },
                megajoule: { name: 'Megajoule', symbol: 'MJ', factor: 1000000 },
                calorie: { name: 'Calorie', symbol: 'cal', factor: 4.184 },
                kilocalorie: { name: 'Kilocalorie', symbol: 'kcal', factor: 4184 },
                wattHour: { name: 'Watt-hour', symbol: 'Wh', factor: 3600 },
                kilowattHour: { name: 'Kilowatt-hour', symbol: 'kWh', factor: 3600000 },
                electronvolt: { name: 'Electronvolt', symbol: 'eV', factor: 1.60218e-19 },
                btu: { name: 'British Thermal Unit', symbol: 'BTU', factor: 1055.06 },
                footPound: { name: 'Foot-pound', symbol: 'ft·lb', factor: 1.35582 }
            },
            defaultFrom: 'joule',
            defaultTo: 'calorie',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        power: {
            name: 'Power',
            units: {
                watt: { name: 'Watt', symbol: 'W', factor: 1 },
                kilowatt: { name: 'Kilowatt', symbol: 'kW', factor: 1000 },
                megawatt: { name: 'Megawatt', symbol: 'MW', factor: 1000000 },
                horsepower: { name: 'Horsepower', symbol: 'hp', factor: 745.7 },
                btuPerHour: { name: 'BTU/hour', symbol: 'BTU/h', factor: 0.293071 }
            },
            defaultFrom: 'watt',
            defaultTo: 'horsepower',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        dataRate: {
            name: 'Data Transfer Rate',
            units: {
                bitPerSecond: { name: 'Bit per second', symbol: 'bps', factor: 1 },
                kilobitPerSecond: { name: 'Kilobit per second', symbol: 'kbps', factor: 1000 },
                megabitPerSecond: { name: 'Megabit per second', symbol: 'Mbps', factor: 1000000 },
                gigabitPerSecond: { name: 'Gigabit per second', symbol: 'Gbps', factor: 1000000000 },
                bytePerSecond: { name: 'Byte per second', symbol: 'B/s', factor: 8 },
                kilobytePerSecond: { name: 'Kilobyte per second', symbol: 'KB/s', factor: 8000 },
                megabytePerSecond: { name: 'Megabyte per second', symbol: 'MB/s', factor: 8000000 },
                gigabytePerSecond: { name: 'Gigabyte per second', symbol: 'GB/s', factor: 8000000000 }
            },
            defaultFrom: 'megabitPerSecond',
            defaultTo: 'megabytePerSecond',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        digital: {
            name: 'Digital Storage',
            units: {
                bit: { name: 'Bit', symbol: 'b', factor: 1 },
                byte: { name: 'Byte', symbol: 'B', factor: 8 },
                kilobyte: { name: 'Kilobyte', symbol: 'KB', factor: 8192 },
                megabyte: { name: 'Megabyte', symbol: 'MB', factor: 8388608 },
                gigabyte: { name: 'Gigabyte', symbol: 'GB', factor: 8589934592 },
                terabyte: { name: 'Terabyte', symbol: 'TB', factor: 8796093022208 },
                petabyte: { name: 'Petabyte', symbol: 'PB', factor: 9007199254740992 },
                kibibyte: { name: 'Kibibyte', symbol: 'KiB', factor: 8192 },
                mebibyte: { name: 'Mebibyte', symbol: 'MiB', factor: 8388608 },
                gibibyte: { name: 'Gibibyte', symbol: 'GiB', factor: 8589934592 }
            },
            defaultFrom: 'megabyte',
            defaultTo: 'gigabyte',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        mass: {
            name: 'Mass / Weight',
            units: {
                kilogram: { name: 'Kilogram', symbol: 'kg', factor: 1 },
                gram: { name: 'Gram', symbol: 'g', factor: 0.001 },
                milligram: { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
                pound: { name: 'Pound', symbol: 'lb', factor: 0.453592 },
                ounce: { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
                ton: { name: 'Ton', symbol: 't', factor: 1000 },
                metricTon: { name: 'Metric Ton', symbol: 't', factor: 1000 },
                carat: { name: 'Carat', symbol: 'ct', factor: 0.0002 }
            },
            defaultFrom: 'kilogram',
            defaultTo: 'pound',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        area: {
            name: 'Area',
            units: {
                squareMeter: { name: 'Square Meter', symbol: 'm²', factor: 1 },
                squareKilometer: { name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
                squareCentimeter: { name: 'Square Centimeter', symbol: 'cm²', factor: 0.0001 },
                squareMillimeter: { name: 'Square Millimeter', symbol: 'mm²', factor: 0.000001 },
                hectare: { name: 'Hectare', symbol: 'ha', factor: 10000 },
                acre: { name: 'Acre', symbol: 'ac', factor: 4046.86 },
                squareMile: { name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
                squareFoot: { name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
                squareInch: { name: 'Square Inch', symbol: 'in²', factor: 0.00064516 }
            },
            defaultFrom: 'squareMeter',
            defaultTo: 'squareFoot',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        volume: {
            name: 'Volume',
            units: {
                cubicMeter: { name: 'Cubic Meter', symbol: 'm³', factor: 1 },
                cubicCentimeter: { name: 'Cubic Centimeter', symbol: 'cm³', factor: 0.000001 },
                cubicMillimeter: { name: 'Cubic Millimeter', symbol: 'mm³', factor: 1e-9 },
                liter: { name: 'Liter', symbol: 'L', factor: 0.001 },
                milliliter: { name: 'Milliliter', symbol: 'mL', factor: 0.000001 },
                gallon: { name: 'Gallon (US)', symbol: 'gal', factor: 0.00378541 },
                quart: { name: 'Quart (US)', symbol: 'qt', factor: 0.000946353 },
                pint: { name: 'Pint (US)', symbol: 'pt', factor: 0.000473176 },
                cup: { name: 'Cup (US)', symbol: 'cup', factor: 0.000236588 },
                fluidOunce: { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 2.95735e-5 },
                cubicFoot: { name: 'Cubic Foot', symbol: 'ft³', factor: 0.0283168 },
                cubicInch: { name: 'Cubic Inch', symbol: 'in³', factor: 1.63871e-5 }
            },
            defaultFrom: 'liter',
            defaultTo: 'gallon',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        speed: {
            name: 'Speed',
            units: {
                meterPerSecond: { name: 'Meter per second', symbol: 'm/s', factor: 1 },
                kilometerPerHour: { name: 'Kilometer per hour', symbol: 'km/h', factor: 0.277778 },
                milePerHour: { name: 'Mile per hour', symbol: 'mph', factor: 0.44704 },
                footPerSecond: { name: 'Foot per second', symbol: 'ft/s', factor: 0.3048 },
                knot: { name: 'Knot', symbol: 'kn', factor: 0.514444 },
                mach: { name: 'Mach', symbol: 'Mach', factor: 340.3 }
            },
            defaultFrom: 'kilometerPerHour',
            defaultTo: 'milePerHour',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        },
        
        time: {
            name: 'Time',
            units: {
                second: { name: 'Second', symbol: 's', factor: 1 },
                millisecond: { name: 'Millisecond', symbol: 'ms', factor: 0.001 },
                microsecond: { name: 'Microsecond', symbol: 'μs', factor: 0.000001 },
                nanosecond: { name: 'Nanosecond', symbol: 'ns', factor: 1e-9 },
                minute: { name: 'Minute', symbol: 'min', factor: 60 },
                hour: { name: 'Hour', symbol: 'h', factor: 3600 },
                day: { name: 'Day', symbol: 'd', factor: 86400 },
                week: { name: 'Week', symbol: 'wk', factor: 604800 },
                month: { name: 'Month (30 days)', symbol: 'mo', factor: 2592000 },
                year: { name: 'Year (365 days)', symbol: 'yr', factor: 31536000 }
            },
            defaultFrom: 'hour',
            defaultTo: 'minute',
            formula: (from, to, value) => {
                return value * from.factor / to.factor;
            },
            formulaDisplay: (from, to) => {
                if (from.symbol === to.symbol) return `1 ${from.symbol} = 1 ${to.symbol}`;
                return `${to.symbol} = ${from.symbol} × (${from.factor} / ${to.factor})`;
            }
        }
    };
    
    // DOM Elements
    const elements = {
        // Theme toggler
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.querySelector('#themeToggle i'),
        
        // Header controls
        resetAll: document.getElementById('resetAll'),
        exportHistory: document.getElementById('exportHistory'),
        
        // Stats
        conversionCount: document.getElementById('conversionCount'),
        favoritesCount: document.getElementById('favoritesCount'),
        
        // Converter elements
        categorySelect: document.getElementById('categorySelect'),
        fromValue: document.getElementById('fromValue'),
        fromUnit: document.getElementById('fromUnit'),
        toValue: document.getElementById('toValue'),
        toUnit: document.getElementById('toUnit'),
        swapUnits: document.getElementById('swapUnits'),
        addFavorite: document.getElementById('addFavorite'),
        copyResult: document.getElementById('copyResult'),
        formulaDisplay: document.getElementById('formulaDisplay'),
        
        // Precision controls
        decimalPlaces: document.getElementById('decimalPlaces'),
        roundingMode: document.getElementById('roundingMode'),
        scientificNotation: document.getElementById('scientificNotation'),
        significantFigures: document.getElementById('significantFigures'),
        
        // History and favorites
        historyList: document.getElementById('historyList'),
        clearHistory: document.getElementById('clearHistory'),
        favoritesList: document.getElementById('favoritesList'),
        manageFavorites: document.getElementById('manageFavorites'),
        
        // Search
        unitSearch: document.getElementById('unitSearch'),
        searchResults: document.getElementById('searchResults'),
        
        // Category cards
        categoryCards: document.querySelectorAll('.category-card'),
        
        // Modals
        aboutModal: document.getElementById('aboutModal'),
        feedbackModal: document.getElementById('feedbackModal'),
        shortcutsModal: document.getElementById('shortcutsModal'),
        
        // Modal buttons
        aboutBtn: document.getElementById('aboutBtn'),
        feedbackBtn: document.getElementById('feedbackBtn'),
        keyboardShortcuts: document.getElementById('keyboardShortcuts'),
        cancelFeedback: document.getElementById('cancelFeedback'),
        closeShortcuts: document.getElementById('closeShortcuts'),
        
        // Toast
        toast: document.getElementById('toast')
    };
    
    // Initialize the application
    function init() {
        // Set theme
        setTheme(state.theme);
        
        // Load saved data
        loadData();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize unit definitions
        state.unitDefinitions = unitDefinitions;
        
        // Set up initial category
        initializeCategory();
        
        // Perform initial conversion
        convert();
        
        // Update statistics
        updateStatistics();
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Initialize keyboard shortcuts
        initKeyboardShortcuts();
    }
    
    // Set theme
    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('unitConverterTheme', theme);
        
        // Update icon
        elements.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Load saved data from localStorage
    function loadData() {
        // Load conversion history
        const savedHistory = localStorage.getItem('unitConverterHistory');
        if (savedHistory) {
            try {
                state.conversionHistory = JSON.parse(savedHistory);
            } catch (e) {
                console.error('Error loading history:', e);
                state.conversionHistory = [];
            }
        }
        
        // Load favorites
        const savedFavorites = localStorage.getItem('unitConverterFavorites');
        if (savedFavorites) {
            try {
                state.favorites = JSON.parse(savedFavorites);
            } catch (e) {
                console.error('Error loading favorites:', e);
                state.favorites = [];
            }
        }
        
        // Load conversion count
        const savedCount = localStorage.getItem('unitConverterCount');
        if (savedCount) {
            try {
                state.conversionCount = parseInt(savedCount);
            } catch (e) {
                console.error('Error loading count:', e);
                state.conversionCount = 0;
            }
        }
        
        // Load precision settings
        const savedPrecision = localStorage.getItem('unitConverterPrecision');
        if (savedPrecision) {
            try {
                state.precision = JSON.parse(savedPrecision);
            } catch (e) {
                console.error('Error loading precision settings:', e);
            }
        }
        
        // Apply precision settings to UI
        elements.decimalPlaces.value = state.precision.decimalPlaces;
        elements.roundingMode.value = state.precision.roundingMode;
        elements.scientificNotation.value = state.precision.scientificNotation;
        elements.significantFigures.checked = state.precision.significantFigures;
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('unitConverterHistory', JSON.stringify(state.conversionHistory));
        localStorage.setItem('unitConverterFavorites', JSON.stringify(state.favorites));
        localStorage.setItem('unitConverterCount', state.conversionCount.toString());
        localStorage.setItem('unitConverterPrecision', JSON.stringify(state.precision));
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', () => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
        
        // Reset all button
        elements.resetAll.addEventListener('click', resetConverter);
        
        // Export history button
        elements.exportHistory.addEventListener('click', exportHistory);
        
        // Category selection
        elements.categorySelect.addEventListener('change', (e) => {
            state.currentCategory = e.target.value;
            initializeCategory();
            convert();
        });
        
        // Input value changes
        elements.fromValue.addEventListener('input', () => {
            state.fromValue = parseFloat(elements.fromValue.value) || 0;
            convert();
        });
        
        // Unit selection changes
        elements.fromUnit.addEventListener('change', () => {
            state.fromUnit = elements.fromUnit.value;
            convert();
        });
        
        elements.toUnit.addEventListener('change', () => {
            state.toUnit = elements.toUnit.value;
            convert();
        });
        
        // Swap units button
        elements.swapUnits.addEventListener('click', swapUnits);
        
        // Add favorite button
        elements.addFavorite.addEventListener('click', toggleFavorite);
        
        // Copy result button
        elements.copyResult.addEventListener('click', copyResult);
        
        // Precision controls
        elements.decimalPlaces.addEventListener('change', (e) => {
            state.precision.decimalPlaces = parseInt(e.target.value);
            saveData();
            convert();
        });
        
        elements.roundingMode.addEventListener('change', (e) => {
            state.precision.roundingMode = e.target.value;
            saveData();
            convert();
        });
        
        elements.scientificNotation.addEventListener('change', (e) => {
            state.precision.scientificNotation = e.target.value;
            saveData();
            convert();
        });
        
        elements.significantFigures.addEventListener('change', (e) => {
            state.precision.significantFigures = e.target.checked;
            saveData();
            convert();
        });
        
        // Clear history button
        elements.clearHistory.addEventListener('click', clearHistory);
        
        // Manage favorites button
        elements.manageFavorites.addEventListener('click', manageFavorites);
        
        // Unit search
        elements.unitSearch.addEventListener('input', searchUnits);
        
        // Category cards
        elements.categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                elements.categorySelect.value = category;
                state.currentCategory = category;
                initializeCategory();
                convert();
            });
        });
        
        // Modal buttons
        elements.aboutBtn.addEventListener('click', () => showModal(elements.aboutModal));
        elements.feedbackBtn.addEventListener('click', () => showModal(elements.feedbackModal));
        elements.keyboardShortcuts.addEventListener('click', () => showModal(elements.shortcutsModal));
        elements.cancelFeedback.addEventListener('click', () => hideModal(elements.feedbackModal));
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target);
            }
        });
        
        // Close modals with close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                hideModal(btn.closest('.modal'));
            });
        });
        
        // Feedback form submission
        document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);
    }
    
    // Initialize keyboard shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            
            // Close modals with Escape
            if (e.key === 'Escape') {
                hideAllModals();
            }
            
            // Copy result with Ctrl/Cmd + C
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                copyResult();
            }
            
            // Focus search with Ctrl/Cmd + F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                elements.unitSearch.focus();
                elements.unitSearch.select();
            }
            
            // Clear history with Ctrl/Cmd + H
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                clearHistory();
            }
            
            // Reset converter with Ctrl/Cmd + R
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                resetConverter();
            }
            
            // Toggle favorite with F
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                toggleFavorite();
            }
            
            // Swap units with S
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                swapUnits();
            }
            
            // Quick category selection with number keys 1-9
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                const categories = Array.from(elements.categorySelect.options);
                if (index < categories.length) {
                    e.preventDefault();
                    elements.categorySelect.value = categories[index].value;
                    state.currentCategory = categories[index].value;
                    initializeCategory();
                    convert();
                }
            }
        });
    }
    
    // Show modal
    function showModal(modal) {
        modal.classList.add('show');
    }
    
    // Hide modal
    function hideModal(modal) {
        modal.classList.remove('show');
    }
    
    // Hide all modals
    function hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Submit feedback form
    function submitFeedback(e) {
        e.preventDefault();
        
        // In a real application, this would send data to a server
        // For now, just show a success message and reset the form
        showToast('Thank you for your feedback!', 'success');
        e.target.reset();
        hideModal(elements.feedbackModal);
    }
    
    // Initialize category units
    function initializeCategory() {
        const category = unitDefinitions[state.currentCategory];
        if (!category) return;
        
        // Clear unit selectors
        elements.fromUnit.innerHTML = '';
        elements.toUnit.innerHTML = '';
        
        // Populate unit selectors
        Object.entries(category.units).forEach(([key, unit]) => {
            const fromOption = document.createElement('option');
            fromOption.value = key;
            fromOption.textContent = `${unit.name} (${unit.symbol})`;
            elements.fromUnit.appendChild(fromOption);
            
            const toOption = document.createElement('option');
            toOption.value = key;
            toOption.textContent = `${unit.name} (${unit.symbol})`;
            elements.toUnit.appendChild(toOption);
        });
        
        // Set default units
        state.fromUnit = category.defaultFrom;
        state.toUnit = category.defaultTo;
        
        elements.fromUnit.value = state.fromUnit;
        elements.toUnit.value = state.toUnit;
        
        // Update favorite button state
        updateFavoriteButton();
    }
    
    // Perform conversion
    function convert() {
        const category = unitDefinitions[state.currentCategory];
        if (!category || !state.fromUnit || !state.toUnit) return;
        
        const fromUnit = category.units[state.fromUnit];
        const toUnit = category.units[state.toUnit];
        
        if (!fromUnit || !toUnit) return;
        
        // Calculate conversion
        const rawResult = category.formula(fromUnit, toUnit, state.fromValue);
        
        // Apply formatting
        const formattedResult = formatNumber(rawResult);
        
        // Update UI
        elements.toValue.value = formattedResult;
        
        // Update formula display
        updateFormulaDisplay(fromUnit, toUnit);
        
        // Add to history if value has changed
        if (state.fromValue !== 0) {
            addToHistory(fromUnit, toUnit, state.fromValue, rawResult);
        }
        
        // Update conversion count
        if (state.fromValue !== 0) {
            state.conversionCount++;
            updateStatistics();
            saveData();
        }
    }
    
    // Format number based on precision settings
    function formatNumber(number) {
        let result = number;
        
        // Apply significant figures if enabled
        if (state.precision.significantFigures && number !== 0) {
            const magnitude = Math.floor(Math.log10(Math.abs(number)));
            const significantDigits = state.precision.decimalPlaces;
            result = parseFloat(number.toPrecision(significantDigits));
        } else {
            // Apply rounding
            const decimalPlaces = state.precision.decimalPlaces;
            
            switch(state.precision.roundingMode) {
                case 'round':
                    result = Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
                    break;
                case 'floor':
                    result = Math.floor(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
                    break;
                case 'ceil':
                    result = Math.ceil(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
                    break;
                case 'trunc':
                    result = Math.trunc(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
                    break;
            }
        }
        
        // Apply scientific notation if needed
        switch(state.precision.scientificNotation) {
            case 'scientific':
                return result.toExponential(state.precision.decimalPlaces);
            case 'engineering':
                return toEngineeringNotation(result, state.precision.decimalPlaces);
            case 'auto':
                if (Math.abs(result) >= 1000000 || (Math.abs(result) < 0.001 && result !== 0)) {
                    return result.toExponential(state.precision.decimalPlaces);
                }
                return result.toString();
            default:
                return result.toString();
        }
    }
    
    // Convert to engineering notation
    function toEngineeringNotation(number, decimalPlaces) {
        const exponent = Math.floor(Math.log10(Math.abs(number)) / 3) * 3;
        const mantissa = number / Math.pow(10, exponent);
        
        const suffixes = {
            '24': 'Y', // yotta
            '21': 'Z', // zetta
            '18': 'E', // exa
            '15': 'P', // peta
            '12': 'T', // tera
            '9': 'G',  // giga
            '6': 'M',  // mega
            '3': 'k',  // kilo
            '0': '',
            '-3': 'm', // milli
            '-6': 'μ', // micro
            '-9': 'n', // nano
            '-12': 'p', // pico
            '-15': 'f', // femto
            '-18': 'a', // atto
            '-21': 'z', // zepto
            '-24': 'y'  // yocto
        };
        
        const suffix = suffixes[exponent.toString()] || `e${exponent}`;
        return mantissa.toFixed(decimalPlaces) + suffix;
    }
    
    // Update formula display
    function updateFormulaDisplay(fromUnit, toUnit) {
        const category = unitDefinitions[state.currentCategory];
        if (!category) return;
        
        const formula = category.formulaDisplay(fromUnit, toUnit);
        elements.formulaDisplay.innerHTML = `<span class="formula">${formula}</span>`;
    }
    
    // Add conversion to history
    function addToHistory(fromUnit, toUnit, fromValue, toValue) {
        const timestamp = new Date();
        const historyEntry = {
            id: Date.now(),
            category: state.currentCategory,
            fromValue: fromValue,
            fromUnit: fromUnit.symbol,
            fromUnitName: fromUnit.name,
            toValue: toValue,
            toUnit: toUnit.symbol,
            toUnitName: toUnit.name,
            timestamp: timestamp.getTime(),
            date: timestamp.toLocaleDateString(),
            time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Add to beginning of history
        state.conversionHistory.unshift(historyEntry);
        
        // Keep only last 50 entries
        if (state.conversionHistory.length > 50) {
            state.conversionHistory.pop();
        }
        
        // Update history display
        updateHistoryDisplay();
        
        // Save data
        saveData();
    }
    
    // Update history display
    function updateHistoryDisplay() {
        elements.historyList.innerHTML = '';
        
        if (state.conversionHistory.length === 0) {
            elements.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-history"></i>
                    <p>No conversion history yet</p>
                </div>
            `;
            return;
        }
        
        state.conversionHistory.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.setAttribute('data-id', entry.id);
            
            historyItem.innerHTML = `
                <div class="history-content">
                    <div class="history-conversion">
                        ${formatNumber(entry.fromValue)} ${entry.fromUnit} → ${formatNumber(entry.toValue)} ${entry.toUnit}
                    </div>
                    <div class="history-meta">
                        <span class="history-time">${entry.time}</span>
                        <span class="history-category">${unitDefinitions[entry.category].name}</span>
                    </div>
                </div>
            `;
            
            // Add click event to load conversion
            historyItem.addEventListener('click', () => {
                loadFromHistory(entry);
            });
            
            elements.historyList.appendChild(historyItem);
        });
    }
    
    // Load conversion from history
    function loadFromHistory(entry) {
        // Set category
        elements.categorySelect.value = entry.category;
        state.currentCategory = entry.category;
        initializeCategory();
        
        // Set units and values
        const category = unitDefinitions[entry.category];
        const fromUnitKey = Object.keys(category.units).find(key => 
            category.units[key].symbol === entry.fromUnit
        );
        const toUnitKey = Object.keys(category.units).find(key => 
            category.units[key].symbol === entry.toUnit
        );
        
        if (fromUnitKey && toUnitKey) {
            elements.fromUnit.value = fromUnitKey;
            elements.toUnit.value = toUnitKey;
            elements.fromValue.value = entry.fromValue;
            
            state.fromUnit = fromUnitKey;
            state.toUnit = toUnitKey;
            state.fromValue = entry.fromValue;
            
            convert();
        }
    }
    
    // Clear history
    function clearHistory() {
        if (state.conversionHistory.length === 0) return;
        
        if (confirm('Are you sure you want to clear all conversion history?')) {
            state.conversionHistory = [];
            updateHistoryDisplay();
            saveData();
            showToast('History cleared', 'success');
        }
    }
    
    // Update statistics
    function updateStatistics() {
        elements.conversionCount.textContent = state.conversionCount;
        elements.favoritesCount.textContent = state.favorites.length;
    }
    
    // Update favorite button state
    function updateFavoriteButton() {
        const isFavorite = state.favorites.some(fav => 
            fav.category === state.currentCategory && 
            fav.fromUnit === state.fromUnit && 
            fav.toUnit === state.toUnit
        );
        
        const icon = elements.addFavorite.querySelector('i');
        icon.className = isFavorite ? 'fas fa-star' : 'far fa-star';
        elements.addFavorite.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
    }
    
    // Toggle favorite
    function toggleFavorite() {
        const favorite = {
            category: state.currentCategory,
            fromUnit: state.fromUnit,
            toUnit: state.toUnit,
            timestamp: new Date().getTime()
        };
        
        const existingIndex = state.favorites.findIndex(fav => 
            fav.category === favorite.category && 
            fav.fromUnit === favorite.fromUnit && 
            fav.toUnit === favorite.toUnit
        );
        
        if (existingIndex >= 0) {
            // Remove from favorites
            state.favorites.splice(existingIndex, 1);
            showToast('Removed from favorites', 'success');
        } else {
            // Add to favorites
            state.favorites.push(favorite);
            showToast('Added to favorites', 'success');
        }
        
        updateFavoriteButton();
        updateFavoritesDisplay();
        updateStatistics();
        saveData();
    }
    
    // Update favorites display
    function updateFavoritesDisplay() {
        elements.favoritesList.innerHTML = '';
        
        if (state.favorites.length === 0) {
            elements.favoritesList.innerHTML = `
                <div class="empty-favorites">
                    <i class="far fa-star"></i>
                    <p>No favorites yet</p>
                    <p>Click the star on any conversion to add it here</p>
                </div>
            `;
            return;
        }
        
        state.favorites.forEach(fav => {
            const category = unitDefinitions[fav.category];
            const fromUnit = category.units[fav.fromUnit];
            const toUnit = category.units[fav.toUnit];
            
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            
            favoriteItem.innerHTML = `
                <div class="favorite-content">
                    <div class="history-conversion">
                        ${fromUnit.name} → ${toUnit.name}
                    </div>
                    <div class="favorite-meta">
                        <span>${category.name}</span>
                    </div>
                </div>
                <div class="favorite-actions">
                    <button class="favorite-action use-favorite" title="Use this conversion">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="favorite-action remove-favorite" title="Remove from favorites">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            favoriteItem.querySelector('.use-favorite').addEventListener('click', (e) => {
                e.stopPropagation();
                useFavorite(fav);
            });
            
            favoriteItem.querySelector('.remove-favorite').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(fav);
            });
            
            // Click on the item itself also uses the favorite
            favoriteItem.addEventListener('click', () => {
                useFavorite(fav);
            });
            
            elements.favoritesList.appendChild(favoriteItem);
        });
    }
    
    // Use a favorite conversion
    function useFavorite(favorite) {
        elements.categorySelect.value = favorite.category;
        state.currentCategory = favorite.category;
        initializeCategory();
        
        elements.fromUnit.value = favorite.fromUnit;
        elements.toUnit.value = favorite.toUnit;
        
        state.fromUnit = favorite.fromUnit;
        state.toUnit = favorite.toUnit;
        
        convert();
        showToast('Favorite loaded', 'success');
    }
    
    // Remove a favorite
    function removeFavorite(favorite) {
        const index = state.favorites.findIndex(fav => 
            fav.category === favorite.category && 
            fav.fromUnit === favorite.fromUnit && 
            fav.toUnit === favorite.toUnit
        );
        
        if (index >= 0) {
            state.favorites.splice(index, 1);
            updateFavoritesDisplay();
            updateFavoriteButton();
            updateStatistics();
            saveData();
            showToast('Removed from favorites', 'success');
        }
    }
    
    // Manage favorites
    function manageFavorites() {
        // For now, just show a confirmation to clear all favorites
        if (state.favorites.length === 0) {
            showToast('No favorites to manage', 'info');
            return;
        }
        
        if (confirm(`You have ${state.favorites.length} favorites. Would you like to clear all favorites?`)) {
            state.favorites = [];
            updateFavoritesDisplay();
            updateFavoriteButton();
            updateStatistics();
            saveData();
            showToast('All favorites cleared', 'success');
        }
    }
    
    // Search units
    function searchUnits() {
        const searchTerm = elements.unitSearch.value.toLowerCase().trim();
        elements.searchResults.innerHTML = '';
        
        if (searchTerm === '') {
            elements.searchResults.innerHTML = `
                <div class="search-hint">
                    Type to search across all units
                </div>
            `;
            return;
        }
        
        const results = [];
        
        // Search across all categories
        Object.entries(unitDefinitions).forEach(([categoryKey, category]) => {
            Object.entries(category.units).forEach(([unitKey, unit]) => {
                if (unit.name.toLowerCase().includes(searchTerm) || 
                    unit.symbol.toLowerCase().includes(searchTerm) ||
                    category.name.toLowerCase().includes(searchTerm)) {
                    
                    results.push({
                        categoryKey,
                        categoryName: category.name,
                        unitKey,
                        unitName: unit.name,
                        unitSymbol: unit.symbol
                    });
                }
            });
        });
        
        if (results.length === 0) {
            elements.searchResults.innerHTML = `
                <div class="search-hint">
                    No units found for "${searchTerm}"
                </div>
            `;
            return;
        }
        
        // Display results
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            
            resultItem.innerHTML = `
                <div class="search-result-name">
                    ${result.unitName} (${result.unitSymbol})
                </div>
                <div class="search-result-category">
                    ${result.categoryName}
                </div>
            `;
            
            resultItem.addEventListener('click', () => {
                // Switch to this category and unit
                elements.categorySelect.value = result.categoryKey;
                state.currentCategory = result.categoryKey;
                initializeCategory();
                
                // Try to set this as the from unit
                elements.fromUnit.value = result.unitKey;
                state.fromUnit = result.unitKey;
                
                convert();
                elements.unitSearch.value = '';
                elements.searchResults.innerHTML = '';
                
                showToast(`Switched to ${result.unitName}`, 'success');
            });
            
            elements.searchResults.appendChild(resultItem);
        });
    }
    
    // Swap units
    function swapUnits() {
        const tempUnit = state.fromUnit;
        state.fromUnit = state.toUnit;
        state.toUnit = tempUnit;
        
        elements.fromUnit.value = state.fromUnit;
        elements.toUnit.value = state.toUnit;
        
        // Also swap values
        const tempValue = state.fromValue;
        state.fromValue = parseFloat(elements.toValue.value) || 0;
        elements.fromValue.value = state.fromValue;
        
        convert();
        showToast('Units swapped', 'success');
    }
    
    // Copy result to clipboard
    function copyResult() {
        const resultText = `${formatNumber(state.fromValue)} ${elements.fromUnit.selectedOptions[0].textContent.split('(')[1].replace(')', '')} = ${elements.toValue.value} ${elements.toUnit.selectedOptions[0].textContent.split('(')[1].replace(')', '')}`;
        
        navigator.clipboard.writeText(resultText)
            .then(() => {
                showToast('Result copied to clipboard', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy result', 'error');
            });
    }
    
    // Reset converter
    function resetConverter() {
        if (confirm('Reset converter to default settings?')) {
            state.fromValue = 1;
            elements.fromValue.value = '1';
            
            // Reset to category defaults
            const category = unitDefinitions[state.currentCategory];
            if (category) {
                state.fromUnit = category.defaultFrom;
                state.toUnit = category.defaultTo;
                
                elements.fromUnit.value = state.fromUnit;
                elements.toUnit.value = state.toUnit;
            }
            
            convert();
            showToast('Converter reset', 'success');
        }
    }
    
    // Export history
    function exportHistory() {
        if (state.conversionHistory.length === 0) {
            showToast('No history to export', 'warning');
            return;
        }
        
        const data = {
            conversions: state.conversionHistory,
            exportedAt: new Date().toISOString(),
            tool: 'UnitConverter Pro'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `unit-conversions-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('History exported successfully', 'success');
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = elements.toast;
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Update content
        toastMessage.textContent = message;
        
        // Update icon based on type
        switch(type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle toast-icon';
                toast.style.backgroundColor = 'var(--success-color)';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
                toast.style.backgroundColor = 'var(--warning-color)';
                break;
            case 'error':
                toastIcon.className = 'fas fa-times-circle toast-icon';
                toast.style.backgroundColor = 'var(--danger-color)';
                break;
            case 'info':
                toastIcon.className = 'fas fa-info-circle toast-icon';
                toast.style.backgroundColor = 'var(--info-color)';
                break;
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Initialize the app
    init();
});