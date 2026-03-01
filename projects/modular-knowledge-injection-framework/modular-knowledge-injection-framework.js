document.addEventListener('DOMContentLoaded', function() {
    const moduleName = document.getElementById('moduleName');
    const moduleType = document.getElementById('moduleType');
    const moduleContent = document.getElementById('moduleContent');
    const injectBtn = document.getElementById('injectBtn');
    const modulesList = document.getElementById('modulesList');
    const queryInput = document.getElementById('queryInput');
    const queryBtn = document.getElementById('queryBtn');
    const queryResults = document.getElementById('queryResults');
    const totalModules = document.getElementById('totalModules');
    const totalFacts = document.getElementById('totalFacts');
    const totalRules = document.getElementById('totalRules');
    const lastUpdated = document.getElementById('lastUpdated');

    let knowledgeBase = {
        modules: [],
        facts: [],
        rules: [],
        definitions: [],
        procedures: []
    };

    // Inject module
    injectBtn.addEventListener('click', function() {
        const name = moduleName.value.trim();
        const type = moduleType.value;
        const content = moduleContent.value.trim();

        if (!name || !content) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const parsedContent = JSON.parse(content);
            injectModule(name, type, parsedContent);
            updateUI();
            clearForm();
        } catch (error) {
            alert('Invalid JSON format. Please check your module content.');
        }
    });

    // Query knowledge base
    queryBtn.addEventListener('click', function() {
        const query = queryInput.value.trim();
        if (!query) {
            alert('Please enter a query.');
            return;
        }

        const results = executeQuery(query);
        displayResults(results);
    });

    function injectModule(name, type, content) {
        const module = {
            id: Date.now(),
            name: name,
            type: type,
            content: content,
            injectedAt: new Date().toISOString()
        };

        knowledgeBase.modules.push(module);

        // Add content to appropriate arrays
        if (content.facts && Array.isArray(content.facts)) {
            knowledgeBase.facts.push(...content.facts.map(fact => ({ fact, module: name })));
        }
        if (content.rules && Array.isArray(content.rules)) {
            knowledgeBase.rules.push(...content.rules.map(rule => ({ rule, module: name })));
        }
        if (content.definitions && Array.isArray(content.definitions)) {
            knowledgeBase.definitions.push(...content.definitions.map(def => ({ definition: def, module: name })));
        }
        if (content.procedures && Array.isArray(content.procedures)) {
            knowledgeBase.procedures.push(...content.procedures.map(proc => ({ procedure: proc, module: name })));
        }
    }

    function executeQuery(query) {
        const results = {
            facts: [],
            rules: [],
            definitions: [],
            procedures: []
        };

        const queryLower = query.toLowerCase();

        // Search facts
        results.facts = knowledgeBase.facts.filter(item =>
            item.fact.toLowerCase().includes(queryLower) ||
            item.module.toLowerCase().includes(queryLower)
        );

        // Search rules
        results.rules = knowledgeBase.rules.filter(item =>
            item.rule.toLowerCase().includes(queryLower) ||
            item.module.toLowerCase().includes(queryLower)
        );

        // Search definitions
        results.definitions = knowledgeBase.definitions.filter(item =>
            item.definition.toLowerCase().includes(queryLower) ||
            item.module.toLowerCase().includes(queryLower)
        );

        // Search procedures
        results.procedures = knowledgeBase.procedures.filter(item =>
            item.procedure.toLowerCase().includes(queryLower) ||
            item.module.toLowerCase().includes(queryLower)
        );

        return results;
    }

    function displayResults(results) {
        queryResults.innerHTML = '';

        let hasResults = false;

        if (results.facts.length > 0) {
            queryResults.innerHTML += '<h4>Facts:</h4>';
            results.facts.forEach(item => {
                queryResults.innerHTML += `<div class="result-item">${item.fact} <small>(from ${item.module})</small></div>`;
            });
            hasResults = true;
        }

        if (results.rules.length > 0) {
            queryResults.innerHTML += '<h4>Rules:</h4>';
            results.rules.forEach(item => {
                queryResults.innerHTML += `<div class="result-item">${item.rule} <small>(from ${item.module})</small></div>`;
            });
            hasResults = true;
        }

        if (results.definitions.length > 0) {
            queryResults.innerHTML += '<h4>Definitions:</h4>';
            results.definitions.forEach(item => {
                queryResults.innerHTML += `<div class="result-item">${item.definition} <small>(from ${item.module})</small></div>`;
            });
            hasResults = true;
        }

        if (results.procedures.length > 0) {
            queryResults.innerHTML += '<h4>Procedures:</h4>';
            results.procedures.forEach(item => {
                queryResults.innerHTML += `<div class="result-item">${item.procedure} <small>(from ${item.module})</small></div>`;
            });
            hasResults = true;
        }

        if (!hasResults) {
            queryResults.innerHTML = '<p>No results found for your query.</p>';
        }
    }

    function updateUI() {
        // Update modules list
        modulesList.innerHTML = '';
        if (knowledgeBase.modules.length === 0) {
            modulesList.innerHTML = '<p>No modules loaded yet.</p>';
        } else {
            knowledgeBase.modules.forEach(module => {
                const moduleDiv = document.createElement('div');
                moduleDiv.className = 'module-item';
                moduleDiv.innerHTML = `
                    <h3>${module.name}</h3>
                    <p><span class="module-type">${module.type}</span></p>
                    <p>Facts: ${module.content.facts ? module.content.facts.length : 0}</p>
                    <p>Rules: ${module.content.rules ? module.content.rules.length : 0}</p>
                    <p>Definitions: ${module.content.definitions ? module.content.definitions.length : 0}</p>
                    <p>Procedures: ${module.content.procedures ? module.content.procedures.length : 0}</p>
                    <p><small>Injected: ${new Date(module.injectedAt).toLocaleString()}</small></p>
                `;
                modulesList.appendChild(moduleDiv);
            });
        }

        // Update stats
        totalModules.textContent = knowledgeBase.modules.length;
        totalFacts.textContent = knowledgeBase.facts.length;
        totalRules.textContent = knowledgeBase.rules.length;
        lastUpdated.textContent = knowledgeBase.modules.length > 0 ?
            new Date(knowledgeBase.modules[knowledgeBase.modules.length - 1].injectedAt).toLocaleString() : 'Never';
    }

    function clearForm() {
        moduleName.value = '';
        moduleContent.value = '';
    }

    // Load sample data
    setTimeout(() => {
        injectModule('Sample Science', 'facts', {
            facts: ['Earth is the third planet from the Sun', 'Water boils at 100°C at sea level', 'The speed of light is approximately 299,792,458 m/s'],
            rules: ['If temperature > 100°C then water boils', 'If distance = speed × time then time = distance ÷ speed']
        });
        updateUI();
    }, 1000);
});