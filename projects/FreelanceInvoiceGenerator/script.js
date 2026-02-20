// InvoicePro - Professional Invoice Generator

document.addEventListener('DOMContentLoaded', function() {
    // Application state
    const state = {
        invoiceNumber: 'INV-001',
        invoiceDate: new Date(),
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        taxRates: [10],
        paymentTerms: 7,
        autoNumber: true,
        primaryColor: '#4361ee',
        business: {
            name: '',
            email: '',
            address: '',
            phone: '',
            website: '',
            taxId: ''
        },
        client: {
            id: null,
            name: '',
            email: '',
            address: '',
            phone: ''
        },
        items: [
            {
                id: 1,
                description: 'Web Design Services',
                quantity: 10,
                rate: 75,
                taxRate: 10,
                amount: 750
            },
            {
                id: 2,
                description: 'Consultation Hours',
                quantity: 5,
                rate: 120,
                taxRate: 10,
                amount: 600
            }
        ],
        notes: 'Thank you for your business!',
        terms: 'Payment due within {terms} days. Late payments subject to 1.5% monthly interest.',
        clients: [],
        logo: null,
        theme: localStorage.getItem('invoiceTheme') || 'light'
    };
    
    // DOM Elements
    const elements = {
        // Theme toggler
        themeToggle: document.getElementById('toggleTheme'),
        themeIcon: document.querySelector('#toggleTheme i'),
        
        // Invoice controls
        resetInvoice: document.getElementById('resetInvoice'),
        printInvoice: document.getElementById('printInvoice'),
        copyInvoiceLink: document.getElementById('copyInvoiceLink'),
        downloadPDF: document.getElementById('downloadPDF'),
        
        // Settings
        currency: document.getElementById('currency'),
        dateFormat: document.getElementById('dateFormat'),
        taxRate: document.getElementById('taxRate'),
        addTax: document.getElementById('addTax'),
        taxRatesContainer: document.getElementById('taxRatesContainer'),
        paymentTerms: document.getElementById('paymentTerms'),
        autoNumber: document.getElementById('autoNumber'),
        primaryColor: document.getElementById('primaryColor'),
        
        // Branding
        logoInput: document.getElementById('logoInput'),
        logoUploadArea: document.getElementById('logoUploadArea'),
        logoPreview: document.getElementById('logoPreview'),
        removeLogo: document.getElementById('removeLogo'),
        
        // Invoice details
        invoiceNumber: document.getElementById('invoiceNumber'),
        generateInvoiceNumber: document.getElementById('generateInvoiceNumber'),
        invoiceDate: document.getElementById('invoiceDate'),
        
        // Business details
        businessName: document.getElementById('businessName'),
        businessEmail: document.getElementById('businessEmail'),
        businessAddress: document.getElementById('businessAddress'),
        businessPhone: document.getElementById('businessPhone'),
        businessWebsite: document.getElementById('businessWebsite'),
        businessTaxId: document.getElementById('businessTaxId'),
        
        // Client details
        clientSelect: document.getElementById('clientSelect'),
        saveClientBtn: document.getElementById('saveClientBtn'),
        clientName: document.getElementById('clientName'),
        clientEmail: document.getElementById('clientEmail'),
        clientAddress: document.getElementById('clientAddress'),
        clientPhone: document.getElementById('clientPhone'),
        
        // Invoice items
        invoiceItems: document.getElementById('invoiceItems'),
        addItemBtn: document.getElementById('addItemBtn'),
        
        // Notes & terms
        invoiceNotes: document.getElementById('invoiceNotes'),
        invoiceTerms: document.getElementById('invoiceTerms'),
        
        // Preview elements
        previewInvoiceNumber: document.getElementById('previewInvoiceNumber'),
        previewInvoiceDate: document.getElementById('previewInvoiceDate'),
        previewDueDate: document.getElementById('previewDueDate'),
        previewBusinessName: document.getElementById('previewBusinessName'),
        previewBusinessAddress: document.getElementById('previewBusinessAddress'),
        previewBusinessContact: document.getElementById('previewBusinessContact'),
        previewBusinessEmail: document.getElementById('previewBusinessEmail'),
        previewBusinessPhone: document.getElementById('previewBusinessPhone'),
        previewTaxId: document.getElementById('previewTaxId'),
        previewClientName: document.getElementById('previewClientName'),
        previewClientAddress: document.getElementById('previewClientAddress'),
        previewClientContact: document.getElementById('previewClientContact'),
        previewClientEmail: document.getElementById('previewClientEmail'),
        previewClientPhone: document.getElementById('previewClientPhone'),
        previewItems: document.getElementById('previewItems'),
        previewNotes: document.getElementById('previewNotes'),
        previewTerms: document.getElementById('previewTerms'),
        previewSubtotal: document.getElementById('previewSubtotal'),
        previewTaxAmount: document.getElementById('previewTaxAmount'),
        previewTotal: document.getElementById('previewTotal'),
        previewAmountDue: document.getElementById('previewAmountDue'),
        
        // Clients list
        clientsList: document.getElementById('clientsList'),
        addClientBtn: document.getElementById('addClientBtn'),
        
        // Modal
        clientModal: document.getElementById('clientModal'),
        modalClientName: document.getElementById('modalClientName'),
        modalClientEmail: document.getElementById('modalClientEmail'),
        modalClientAddress: document.getElementById('modalClientAddress'),
        modalClientPhone: document.getElementById('modalClientPhone'),
        saveNewClient: document.getElementById('saveNewClient'),
        cancelClient: document.getElementById('cancelClient'),
        closeModal: document.querySelector('.close-modal'),
        
        // Toast
        toast: document.getElementById('toast')
    };
    
    // Initialize the application
    function init() {
        // Set theme
        setTheme(state.theme);
        
        // Load saved data from localStorage
        loadSavedData();
        
        // Set current date
        const today = new Date().toISOString().split('T')[0];
        elements.invoiceDate.value = today;
        state.invoiceDate = new Date();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize tax rates display
        updateTaxRatesDisplay();
        
        // Initialize clients list
        updateClientsList();
        updateClientSelect();
        
        // Update preview
        updatePreview();
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Apply primary color
        applyPrimaryColor();
    }
    
    // Set theme
    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('invoiceTheme', theme);
        
        // Update icon
        elements.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Load saved data from localStorage
    function loadSavedData() {
        // Load business details
        const savedBusiness = localStorage.getItem('invoicePro_business');
        if (savedBusiness) {
            try {
                const businessData = JSON.parse(savedBusiness);
                state.business = businessData;
                
                // Update form fields
                elements.businessName.value = businessData.name || '';
                elements.businessEmail.value = businessData.email || '';
                elements.businessAddress.value = businessData.address || '';
                elements.businessPhone.value = businessData.phone || '';
                elements.businessWebsite.value = businessData.website || '';
                elements.businessTaxId.value = businessData.taxId || '';
            } catch (e) {
                console.error('Error loading business data:', e);
            }
        }
        
        // Load clients
        const savedClients = localStorage.getItem('invoicePro_clients');
        if (savedClients) {
            try {
                state.clients = JSON.parse(savedClients);
            } catch (e) {
                console.error('Error loading clients:', e);
            }
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('invoicePro_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                state.currency = settings.currency || 'USD';
                state.dateFormat = settings.dateFormat || 'MM/DD/YYYY';
                state.taxRates = settings.taxRates || [10];
                state.paymentTerms = settings.paymentTerms || 7;
                state.autoNumber = settings.autoNumber !== undefined ? settings.autoNumber : true;
                state.primaryColor = settings.primaryColor || '#4361ee';
                
                // Update form fields
                elements.currency.value = state.currency;
                elements.dateFormat.value = state.dateFormat;
                elements.paymentTerms.value = state.paymentTerms;
                elements.autoNumber.checked = state.autoNumber;
                elements.primaryColor.value = state.primaryColor;
                
                // Update tax rate input
                if (state.taxRates.length > 0) {
                    elements.taxRate.value = state.taxRates[0];
                }
            } catch (e) {
                console.error('Error loading settings:', e);
            }
        }
        
        // Load logo
        const savedLogo = localStorage.getItem('invoicePro_logo');
        if (savedLogo) {
            state.logo = savedLogo;
            updateLogoPreview();
        }
        
        // Generate invoice number if auto-number is enabled
        if (state.autoNumber) {
            generateInvoiceNumber();
        }
    }
    
    // Save data to localStorage
    function saveData() {
        // Save business details
        localStorage.setItem('invoicePro_business', JSON.stringify(state.business));
        
        // Save clients
        localStorage.setItem('invoicePro_clients', JSON.stringify(state.clients));
        
        // Save settings
        const settings = {
            currency: state.currency,
            dateFormat: state.dateFormat,
            taxRates: state.taxRates,
            paymentTerms: state.paymentTerms,
            autoNumber: state.autoNumber,
            primaryColor: state.primaryColor
        };
        localStorage.setItem('invoicePro_settings', JSON.stringify(settings));
        
        // Save invoice number counter
        if (state.autoNumber) {
            const currentNumber = parseInt(state.invoiceNumber.split('-')[1]) || 1;
            localStorage.setItem('invoicePro_lastNumber', currentNumber);
        }
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', () => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
        
        // Invoice controls
        elements.resetInvoice.addEventListener('click', resetInvoice);
        elements.printInvoice.addEventListener('click', printInvoice);
        elements.copyInvoiceLink.addEventListener('click', copyInvoiceLink);
        elements.downloadPDF.addEventListener('click', downloadPDF);
        
        // Settings
        elements.currency.addEventListener('change', updateCurrency);
        elements.dateFormat.addEventListener('change', updateDateFormat);
        elements.addTax.addEventListener('click', addTaxRate);
        elements.paymentTerms.addEventListener('change', updatePaymentTerms);
        elements.autoNumber.addEventListener('change', updateAutoNumber);
        elements.primaryColor.addEventListener('input', updatePrimaryColor);
        
        // Branding
        elements.logoInput.addEventListener('change', handleLogoUpload);
        elements.removeLogo.addEventListener('click', removeLogo);
        elements.logoUploadArea.addEventListener('click', () => elements.logoInput.click());
        
        // Invoice details
        elements.invoiceNumber.addEventListener('change', updateInvoiceNumber);
        elements.generateInvoiceNumber.addEventListener('click', generateInvoiceNumber);
        elements.invoiceDate.addEventListener('change', updateInvoiceDate);
        
        // Business details
        elements.businessName.addEventListener('input', updateBusinessField.bind(null, 'name'));
        elements.businessEmail.addEventListener('input', updateBusinessField.bind(null, 'email'));
        elements.businessAddress.addEventListener('input', updateBusinessField.bind(null, 'address'));
        elements.businessPhone.addEventListener('input', updateBusinessField.bind(null, 'phone'));
        elements.businessWebsite.addEventListener('input', updateBusinessField.bind(null, 'website'));
        elements.businessTaxId.addEventListener('input', updateBusinessField.bind(null, 'taxId'));
        
        // Client details
        elements.clientSelect.addEventListener('change', selectClient);
        elements.saveClientBtn.addEventListener('click', saveCurrentClient);
        elements.clientName.addEventListener('input', updateClientField.bind(null, 'name'));
        elements.clientEmail.addEventListener('input', updateClientField.bind(null, 'email'));
        elements.clientAddress.addEventListener('input', updateClientField.bind(null, 'address'));
        elements.clientPhone.addEventListener('input', updateClientField.bind(null, 'phone'));
        
        // Invoice items
        elements.addItemBtn.addEventListener('click', addInvoiceItem);
        
        // Notes & terms
        elements.invoiceNotes.addEventListener('input', updateNotes);
        elements.invoiceTerms.addEventListener('input', updateTerms);
        
        // Clients modal
        elements.addClientBtn.addEventListener('click', showClientModal);
        elements.saveNewClient.addEventListener('click', saveNewClient);
        elements.cancelClient.addEventListener('click', hideClientModal);
        elements.closeModal.addEventListener('click', hideClientModal);
        
        // Close modal when clicking outside
        elements.clientModal.addEventListener('click', (e) => {
            if (e.target === elements.clientModal) {
                hideClientModal();
            }
        });
        
        // Initialize existing items with event listeners
        initInvoiceItems();
    }
    
    // Update currency
    function updateCurrency() {
        state.currency = elements.currency.value;
        updatePreview();
        saveData();
    }
    
    // Update date format
    function updateDateFormat() {
        state.dateFormat = elements.dateFormat.value;
        updatePreview();
        saveData();
    }
    
    // Add tax rate
    function addTaxRate() {
        const taxRate = parseFloat(elements.taxRate.value);
        if (!isNaN(taxRate) && taxRate >= 0 && taxRate <= 100) {
            if (!state.taxRates.includes(taxRate)) {
                state.taxRates.push(taxRate);
                updateTaxRatesDisplay();
                updatePreview();
                saveData();
                
                // Update tax select in all items
                updateAllItemTaxSelects();
            }
        }
    }
    
    // Update tax rates display
    function updateTaxRatesDisplay() {
        elements.taxRatesContainer.innerHTML = '';
        
        state.taxRates.forEach((rate, index) => {
            const tag = document.createElement('div');
            tag.className = 'tax-rate-tag';
            tag.innerHTML = `
                ${rate}%
                <button class="remove-tax" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            elements.taxRatesContainer.appendChild(tag);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-tax').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removeTaxRate(index);
            });
        });
    }
    
    // Remove tax rate
    function removeTaxRate(index) {
        state.taxRates.splice(index, 1);
        updateTaxRatesDisplay();
        updatePreview();
        saveData();
        
        // Update tax select in all items
        updateAllItemTaxSelects();
    }
    
    // Update all item tax selects
    function updateAllItemTaxSelects() {
        document.querySelectorAll('.item-tax select').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="0">No Tax</option>';
            
            state.taxRates.forEach(rate => {
                const option = document.createElement('option');
                option.value = rate;
                option.textContent = `${rate}%`;
                select.appendChild(option);
            });
            
            // Try to restore previous value
            select.value = currentValue;
            
            // If previous value doesn't exist, set to first tax rate or 0
            if (!select.value && state.taxRates.length > 0) {
                select.value = state.taxRates[0];
            }
        });
        
        // Recalculate all items
        state.items.forEach((item, index) => {
            const select = document.querySelector(`.invoice-item[data-id="${item.id}"] .item-tax select`);
            if (select) {
                item.taxRate = parseFloat(select.value) || 0;
                calculateItemAmount(index);
            }
        });
        
        updatePreview();
    }
    
    // Update payment terms
    function updatePaymentTerms() {
        state.paymentTerms = parseInt(elements.paymentTerms.value);
        updatePreview();
        saveData();
    }
    
    // Update auto number setting
    function updateAutoNumber() {
        state.autoNumber = elements.autoNumber.checked;
        saveData();
    }
    
    // Update primary color
    function updatePrimaryColor() {
        state.primaryColor = elements.primaryColor.value;
        applyPrimaryColor();
        saveData();
    }
    
    // Apply primary color to UI
    function applyPrimaryColor() {
        document.documentElement.style.setProperty('--primary-color', state.primaryColor);
        
        // Calculate lighter and darker variants
        const primaryLight = lightenColor(state.primaryColor, 20);
        const secondaryColor = darkenColor(state.primaryColor, 10);
        
        document.documentElement.style.setProperty('--primary-light', primaryLight);
        document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    }
    
    // Helper function to lighten a color
    function lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return "#" + (
            0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }
    
    // Helper function to darken a color
    function darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return "#" + (
            0x1000000 + 
            (R > 0 ? R : 0) * 0x10000 + 
            (G > 0 ? G : 0) * 0x100 + 
            (B > 0 ? B : 0)
        ).toString(16).slice(1);
    }
    
    // Handle logo upload
    function handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                state.logo = event.target.result;
                updateLogoPreview();
                saveData();
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Update logo preview
    function updateLogoPreview() {
        if (state.logo) {
            elements.logoPreview.innerHTML = `<img src="${state.logo}" alt="Company Logo">`;
            elements.removeLogo.style.display = 'block';
            
            // Update invoice preview logo
            const invoiceLogo = document.getElementById('invoiceLogoPreview');
            invoiceLogo.innerHTML = `<img src="${state.logo}" alt="Company Logo" style="max-width: 200px; max-height: 100px;">`;
        } else {
            elements.logoPreview.innerHTML = '';
            elements.removeLogo.style.display = 'none';
            
            // Reset invoice preview logo
            const invoiceLogo = document.getElementById('invoiceLogoPreview');
            invoiceLogo.innerHTML = `
                <div class="logo-placeholder">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <span>Your Logo</span>
                </div>
            `;
        }
    }
    
    // Remove logo
    function removeLogo() {
        state.logo = null;
        updateLogoPreview();
        localStorage.removeItem('invoicePro_logo');
    }
    
    // Update invoice number
    function updateInvoiceNumber() {
        state.invoiceNumber = elements.invoiceNumber.value;
        updatePreview();
    }
    
    // Generate invoice number
    function generateInvoiceNumber() {
        if (!state.autoNumber) return;
        
        let lastNumber = localStorage.getItem('invoicePro_lastNumber');
        let nextNumber = 1;
        
        if (lastNumber) {
            nextNumber = parseInt(lastNumber) + 1;
        }
        
        state.invoiceNumber = `INV-${nextNumber.toString().padStart(3, '0')}`;
        elements.invoiceNumber.value = state.invoiceNumber;
        updatePreview();
    }
    
    // Update invoice date
    function updateInvoiceDate() {
        state.invoiceDate = new Date(elements.invoiceDate.value);
        updatePreview();
    }
    
    // Update business field
    function updateBusinessField(field) {
        state.business[field] = elements[`business${field.charAt(0).toUpperCase() + field.slice(1)}`].value;
        updatePreview();
        saveData();
    }
    
    // Update client field
    function updateClientField(field) {
        state.client[field] = elements[`client${field.charAt(0).toUpperCase() + field.slice(1)}`].value;
        updatePreview();
    }
    
    // Initialize invoice items with event listeners
    function initInvoiceItems() {
        // Add event listeners to existing items
        document.querySelectorAll('.invoice-item').forEach(item => {
            initItemEventListeners(item);
        });
    }
    
    // Initialize event listeners for an invoice item
    function initItemEventListeners(itemElement) {
        const id = parseInt(itemElement.getAttribute('data-id'));
        
        // Description input
        const descriptionInput = itemElement.querySelector('.item-description input');
        descriptionInput.addEventListener('input', (e) => {
            const item = state.items.find(item => item.id === id);
            if (item) {
                item.description = e.target.value;
                updatePreview();
            }
        });
        
        // Quantity input
        const quantityInput = itemElement.querySelector('.item-quantity input');
        quantityInput.addEventListener('input', (e) => {
            const itemIndex = state.items.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                state.items[itemIndex].quantity = parseFloat(e.target.value) || 0;
                calculateItemAmount(itemIndex);
            }
        });
        
        // Rate input
        const rateInput = itemElement.querySelector('.item-rate input');
        rateInput.addEventListener('input', (e) => {
            const itemIndex = state.items.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                state.items[itemIndex].rate = parseFloat(e.target.value) || 0;
                calculateItemAmount(itemIndex);
            }
        });
        
        // Tax select
        const taxSelect = itemElement.querySelector('.item-tax select');
        taxSelect.addEventListener('change', (e) => {
            const itemIndex = state.items.findIndex(item => item.id === id);
            if (itemIndex !== -1) {
                state.items[itemIndex].taxRate = parseFloat(e.target.value) || 0;
                calculateItemAmount(itemIndex);
            }
        });
        
        // Remove button
        const removeBtn = itemElement.querySelector('.remove-item');
        removeBtn.addEventListener('click', () => {
            removeInvoiceItem(id);
        });
    }
    
    // Calculate item amount
    function calculateItemAmount(itemIndex) {
        const item = state.items[itemIndex];
        const subtotal = item.quantity * item.rate;
        const taxAmount = subtotal * (item.taxRate / 100);
        item.amount = subtotal + taxAmount;
        
        // Update amount display
        const itemElement = document.querySelector(`.invoice-item[data-id="${item.id}"]`);
        if (itemElement) {
            const amountSpan = itemElement.querySelector('.item-amount span');
            amountSpan.textContent = formatCurrency(item.amount);
        }
        
        updatePreview();
    }
    
    // Add invoice item
    function addInvoiceItem() {
        const newId = state.items.length > 0 ? Math.max(...state.items.map(item => item.id)) + 1 : 1;
        
        const newItem = {
            id: newId,
            description: 'New Item',
            quantity: 1,
            rate: 0,
            taxRate: state.taxRates.length > 0 ? state.taxRates[0] : 0,
            amount: 0
        };
        
        state.items.push(newItem);
        
        // Create HTML for new item
        const itemHtml = `
            <div class="invoice-item" data-id="${newId}">
                <div class="item-description">
                    <input type="text" value="${newItem.description}" placeholder="Item description">
                </div>
                <div class="item-quantity">
                    <input type="number" value="${newItem.quantity}" min="0" step="0.5">
                </div>
                <div class="item-rate">
                    <input type="number" value="${newItem.rate}" min="0" step="0.01">
                </div>
                <div class="item-tax">
                    <select>
                        <option value="0">No Tax</option>
                        ${state.taxRates.map(rate => 
                            `<option value="${rate}" ${rate === newItem.taxRate ? 'selected' : ''}>${rate}%</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="item-amount">
                    <span>${formatCurrency(newItem.amount)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon small remove-item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        elements.invoiceItems.insertAdjacentHTML('beforeend', itemHtml);
        
        // Initialize event listeners for new item
        const newItemElement = elements.invoiceItems.querySelector(`[data-id="${newId}"]`);
        initItemEventListeners(newItemElement);
        
        updatePreview();
    }
    
    // Remove invoice item
    function removeInvoiceItem(id) {
        state.items = state.items.filter(item => item.id !== id);
        
        const itemElement = document.querySelector(`.invoice-item[data-id="${id}"]`);
        if (itemElement) {
            itemElement.remove();
        }
        
        updatePreview();
    }
    
    // Update notes
    function updateNotes() {
        state.notes = elements.invoiceNotes.value;
        updatePreview();
    }
    
    // Update terms
    function updateTerms() {
        state.terms = elements.invoiceTerms.value;
        updatePreview();
    }
    
    // Update clients list
    function updateClientsList() {
        elements.clientsList.innerHTML = '';
        
        if (state.clients.length === 0) {
            elements.clientsList.innerHTML = `
                <div class="empty-clients">
                    <i class="fas fa-address-book"></i>
                    <p>No saved clients yet</p>
                </div>
            `;
            return;
        }
        
        state.clients.forEach(client => {
            const clientElement = document.createElement('div');
            clientElement.className = `client-item ${client.id === state.client.id ? 'active' : ''}`;
            clientElement.setAttribute('data-id', client.id);
            
            clientElement.innerHTML = `
                <div class="client-name">${client.name}</div>
                <div class="client-email">${client.email}</div>
            `;
            
            clientElement.addEventListener('click', () => {
                selectClientById(client.id);
            });
            
            elements.clientsList.appendChild(clientElement);
        });
    }
    
    // Update client select dropdown
    function updateClientSelect() {
        elements.clientSelect.innerHTML = '<option value="">Select a client or enter new...</option>';
        
        state.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            elements.clientSelect.appendChild(option);
        });
    }
    
    // Select client from dropdown
    function selectClient() {
        const clientId = elements.clientSelect.value;
        if (clientId) {
            selectClientById(clientId);
        } else {
            // Clear client form
            state.client = { id: null, name: '', email: '', address: '', phone: '' };
            elements.clientName.value = '';
            elements.clientEmail.value = '';
            elements.clientAddress.value = '';
            elements.clientPhone.value = '';
            updatePreview();
        }
    }
    
    // Select client by ID
    function selectClientById(clientId) {
        const client = state.clients.find(c => c.id == clientId);
        if (client) {
            state.client = { ...client };
            
            elements.clientSelect.value = clientId;
            elements.clientName.value = client.name;
            elements.clientEmail.value = client.email;
            elements.clientAddress.value = client.address;
            elements.clientPhone.value = client.phone;
            
            updatePreview();
            updateClientsList();
        }
    }
    
    // Save current client
    function saveCurrentClient() {
        if (!state.client.name.trim()) {
            showToast('Please enter a client name', 'warning');
            return;
        }
        
        // Check if client already exists
        const existingClientIndex = state.clients.findIndex(c => c.id === state.client.id);
        
        if (existingClientIndex !== -1) {
            // Update existing client
            state.clients[existingClientIndex] = { ...state.client };
        } else {
            // Create new client
            const newClient = {
                id: Date.now(),
                ...state.client
            };
            state.clients.push(newClient);
            state.client.id = newClient.id;
        }
        
        updateClientsList();
        updateClientSelect();
        saveData();
        showToast('Client saved successfully', 'success');
    }
    
    // Show client modal
    function showClientModal() {
        // Clear modal form
        elements.modalClientName.value = '';
        elements.modalClientEmail.value = '';
        elements.modalClientAddress.value = '';
        elements.modalClientPhone.value = '';
        
        elements.clientModal.classList.add('show');
    }
    
    // Hide client modal
    function hideClientModal() {
        elements.clientModal.classList.remove('show');
    }
    
    // Save new client from modal
    function saveNewClient() {
        const name = elements.modalClientName.value.trim();
        const email = elements.modalClientEmail.value.trim();
        const address = elements.modalClientAddress.value.trim();
        const phone = elements.modalClientPhone.value.trim();
        
        if (!name) {
            showToast('Please enter a client name', 'warning');
            return;
        }
        
        const newClient = {
            id: Date.now(),
            name,
            email,
            address,
            phone
        };
        
        state.clients.push(newClient);
        state.client = { ...newClient };
        
        // Update form fields
        elements.clientName.value = name;
        elements.clientEmail.value = email;
        elements.clientAddress.value = address;
        elements.clientPhone.value = phone;
        
        updateClientsList();
        updateClientSelect();
        updatePreview();
        saveData();
        
        hideClientModal();
        showToast('Client added successfully', 'success');
    }
    
    // Update preview
    function updatePreview() {
        // Update invoice number
        elements.previewInvoiceNumber.textContent = state.invoiceNumber;
        
        // Format dates
        const formattedDate = formatDate(state.invoiceDate, state.dateFormat);
        elements.previewInvoiceDate.textContent = formattedDate;
        
        // Calculate due date
        const dueDate = new Date(state.invoiceDate);
        dueDate.setDate(dueDate.getDate() + state.paymentTerms);
        const formattedDueDate = formatDate(dueDate, state.dateFormat);
        elements.previewDueDate.textContent = formattedDueDate;
        
        // Update business details
        elements.previewBusinessName.textContent = state.business.name || 'Your Business Name';
        elements.previewBusinessAddress.textContent = state.business.address || '123 Business St, City, State 12345';
        elements.previewBusinessEmail.textContent = state.business.email || 'billing@example.com';
        elements.previewBusinessPhone.textContent = state.business.phone || '+1 (555) 123-4567';
        elements.previewTaxId.textContent = state.business.taxId || '123-456-789';
        
        // Update client details
        elements.previewClientName.textContent = state.client.name || 'Client Company Name';
        elements.previewClientAddress.textContent = state.client.address || '456 Client Ave, City, State 67890';
        elements.previewClientEmail.textContent = state.client.email || 'contact@client.com';
        elements.previewClientPhone.textContent = state.client.phone || '+1 (555) 987-6543';
        
        // Update contact displays
        elements.previewBusinessContact.innerHTML = 
            `<span>${state.business.email || 'billing@example.com'}</span> | <span>${state.business.phone || '+1 (555) 123-4567'}</span>`;
        
        elements.previewClientContact.innerHTML = 
            `<span>${state.client.email || 'contact@client.com'}</span> | <span>${state.client.phone || '+1 (555) 987-6543'}</span>`;
        
        // Update invoice items
        updatePreviewItems();
        
        // Update notes and terms
        elements.previewNotes.textContent = state.notes;
        elements.previewTerms.textContent = state.terms.replace('{terms}', state.paymentTerms);
        
        // Update totals
        updatePreviewTotals();
    }
    
    // Update preview items
    function updatePreviewItems() {
        elements.previewItems.innerHTML = '';
        
        state.items.forEach(item => {
            const row = document.createElement('tr');
            
            // Calculate tax amount for display
            const subtotal = item.quantity * item.rate;
            const taxAmount = subtotal * (item.taxRate / 100);
            
            row.innerHTML = `
                <td data-label="Description">${item.description}</td>
                <td data-label="Quantity">${item.quantity}</td>
                <td data-label="Rate">${formatCurrency(item.rate)}</td>
                <td data-label="Tax">${item.taxRate > 0 ? `${item.taxRate}%` : 'No Tax'}</td>
                <td data-label="Amount">${formatCurrency(item.amount)}</td>
            `;
            
            elements.previewItems.appendChild(row);
        });
    }
    
    // Update preview totals
    function updatePreviewTotals() {
        // Calculate subtotal (without tax)
        const subtotal = state.items.reduce((sum, item) => {
            return sum + (item.quantity * item.rate);
        }, 0);
        
        // Calculate total tax
        const totalTax = state.items.reduce((sum, item) => {
            return sum + (item.quantity * item.rate * (item.taxRate / 100));
        }, 0);
        
        // Calculate total
        const total = subtotal + totalTax;
        
        // Update display
        elements.previewSubtotal.textContent = formatCurrency(subtotal);
        elements.previewTaxAmount.textContent = formatCurrency(totalTax);
        elements.previewTotal.textContent = formatCurrency(total);
        elements.previewAmountDue.textContent = formatCurrency(total);
    }
    
    // Format currency
    function formatCurrency(amount) {
        const currencySymbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
            CAD: 'C$',
            AUD: 'A$',
            JPY: '¥'
        };
        
        const symbol = currencySymbols[state.currency] || '$';
        const formattedAmount = amount.toFixed(2);
        
        return `${symbol}${formattedAmount}`;
    }
    
    // Format date
    function formatDate(date, format) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        switch(format) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default:
                return date.toLocaleDateString();
        }
    }
    
    // Reset invoice
    function resetInvoice() {
        if (confirm('Are you sure you want to create a new invoice? Current data will be lost.')) {
            // Keep business details and clients
            // Reset everything else
            if (state.autoNumber) {
                generateInvoiceNumber();
            }
            
            const today = new Date().toISOString().split('T')[0];
            elements.invoiceDate.value = today;
            state.invoiceDate = new Date();
            
            // Reset client
            state.client = { id: null, name: '', email: '', address: '', phone: '' };
            elements.clientSelect.value = '';
            elements.clientName.value = '';
            elements.clientEmail.value = '';
            elements.clientAddress.value = '';
            elements.clientPhone.value = '';
            
            // Reset items
            state.items = [
                {
                    id: 1,
                    description: 'New Item',
                    quantity: 1,
                    rate: 0,
                    taxRate: state.taxRates.length > 0 ? state.taxRates[0] : 0,
                    amount: 0
                }
            ];
            
            // Reset notes and terms
            state.notes = 'Thank you for your business!';
            state.terms = 'Payment due within {terms} days. Late payments subject to 1.5% monthly interest.';
            
            elements.invoiceNotes.value = state.notes;
            elements.invoiceTerms.value = state.terms;
            
            // Update UI
            updateInvoiceItemsDisplay();
            updatePreview();
            
            showToast('New invoice created', 'success');
        }
    }
    
    // Update invoice items display
    function updateInvoiceItemsDisplay() {
        elements.invoiceItems.innerHTML = '';
        
        state.items.forEach(item => {
            const itemHtml = `
                <div class="invoice-item" data-id="${item.id}">
                    <div class="item-description">
                        <input type="text" value="${item.description}" placeholder="Item description">
                    </div>
                    <div class="item-quantity">
                        <input type="number" value="${item.quantity}" min="0" step="0.5">
                    </div>
                    <div class="item-rate">
                        <input type="number" value="${item.rate}" min="0" step="0.01">
                    </div>
                    <div class="item-tax">
                        <select>
                            <option value="0">No Tax</option>
                            ${state.taxRates.map(rate => 
                                `<option value="${rate}" ${rate === item.taxRate ? 'selected' : ''}>${rate}%</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="item-amount">
                        <span>${formatCurrency(item.amount)}</span>
                    </div>
                    <div class="item-actions">
                        <button class="btn-icon small remove-item">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            elements.invoiceItems.insertAdjacentHTML('beforeend', itemHtml);
            
            // Initialize event listeners for the item
            const itemElement = elements.invoiceItems.querySelector(`[data-id="${item.id}"]`);
            initItemEventListeners(itemElement);
        });
    }
    
    // Print invoice
    function printInvoice() {
        window.print();
    }
    
    // Copy invoice link
    function copyInvoiceLink() {
        // Create a shareable link with invoice data
        const invoiceData = {
            invoiceNumber: state.invoiceNumber,
            date: state.invoiceDate.toISOString(),
            currency: state.currency,
            business: state.business,
            client: state.client,
            items: state.items,
            notes: state.notes,
            terms: state.terms
        };
        
        // Convert to base64 for URL
        const dataStr = JSON.stringify(invoiceData);
        const base64Data = btoa(encodeURIComponent(dataStr));
        
        // Create URL
        const url = new URL(window.location.href);
        url.searchParams.set('invoice', base64Data);
        
        // Copy to clipboard
        navigator.clipboard.writeText(url.toString())
            .then(() => {
                showToast('Invoice link copied to clipboard', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast('Failed to copy link', 'error');
            });
    }
    
    // Download PDF (using browser print to PDF)
    function downloadPDF() {
        // Create a print-friendly version
        const invoicePaper = document.getElementById('invoicePaper');
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice ${state.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
                    .invoice-paper { max-width: 800px; margin: 0 auto; }
                    .invoice-header-preview { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid ${state.primaryColor}; }
                    .invoice-title h1 { color: ${state.primaryColor}; font-size: 2.5rem; margin: 0; }
                    .invoice-parties { display: flex; gap: 40px; margin-bottom: 40px; }
                    .bill-from, .bill-to { flex: 1; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; padding: 15px; background-color: #f8f9fa; border-bottom: 2px solid #e0e0e0; }
                    td { padding: 15px; border-bottom: 1px solid #e0e0e0; }
                    .col-amount { text-align: right; font-weight: bold; }
                    .invoice-totals { display: flex; gap: 40px; margin-bottom: 40px; }
                    .totals-right { flex: 1; }
                    .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
                    .total-row { font-size: 1.2rem; padding-top: 20px; border-top: 2px solid #e0e0e0; margin-top: 10px; }
                    .due-row { background-color: #f5f7ff; padding: 15px; border-radius: 8px; margin-top: 15px; border: 2px solid ${state.primaryColor}; }
                    .invoice-footer { padding-top: 30px; border-top: 1px solid #e0e0e0; }
                    @media print { body { padding: 0; } .invoice-paper { box-shadow: none; border: none; } }
                </style>
            </head>
            <body>
                <div class="invoice-paper">
                    ${invoicePaper.innerHTML}
                </div>
                <script>
                    window.onload = function() { window.print(); };
                <\/script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
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