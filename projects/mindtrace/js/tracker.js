const Tracker = {
    interactions: [],
    hoverPath: [],
    keySequence: [],
    lastInteractionTime: null,
    sessionStartTime: Date.now(),
    stats: {
        clicks: 0,
        hovers: 0,
        keyPresses: 0,
        totalHoverTime: 0,
        hoverCount: 0
    },
    hoverStartTime: null,
    currentHoverElement: null,

    init: function() {
        this.attachListeners();
        this.loadPreviousSession();
    },

    loadPreviousSession: function() {
        const savedSession = Storage.loadSession();
        if (savedSession) {
            this.interactions = savedSession.interactions || [];
            this.stats = savedSession.stats || this.stats;
        }
    },

    saveSession: function() {
        Storage.saveSession({
            interactions: this.interactions.slice(-100),
            stats: this.stats,
            timestamp: Date.now()
        });
    },

    attachListeners: function() {
        const interactiveZone = document.querySelector('.interactive-zone');
        if (!interactiveZone) return;

        const elements = interactiveZone.querySelectorAll('button, input, textarea, .interactive-card, label');

        elements.forEach(element => {
            element.addEventListener('click', (e) => this.recordClick(e));
            element.addEventListener('mouseenter', (e) => this.recordHoverStart(e));
            element.addEventListener('mouseleave', (e) => this.recordHoverEnd(e));
        });

        document.addEventListener('keydown', (e) => this.recordKeyPress(e));

        const inputs = interactiveZone.querySelectorAll('input[type="text"], textarea');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.recordInput(e));
        });

        const checkboxes = interactiveZone.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.recordChange(e));
        });
    },

    recordClick: function(event) {
        const element = event.target.closest('button, .interactive-card, label');
        if (!element) return;

        const interaction = {
            type: 'click',
            element: Utils.getElementSelector(element),
            description: Utils.getElementDescription(element),
            timestamp: Date.now(),
            timeSinceLastAction: this.getTimeSinceLast()
        };

        this.interactions.push(interaction);
        this.stats.clicks++;
        this.lastInteractionTime = Date.now();
        this.saveSession();

        element.classList.add('clicked');
        setTimeout(() => element.classList.remove('clicked'), 300);

        window.dispatchEvent(new CustomEvent('interaction', { detail: interaction }));
    },

    recordHoverStart: function(event) {
        const element = event.target;
        this.currentHoverElement = element;
        this.hoverStartTime = Date.now();

        this.hoverPath.push({
            element: Utils.getElementSelector(element),
            timestamp: Date.now()
        });

        if (this.hoverPath.length > 20) {
            this.hoverPath.shift();
        }
    },

    recordHoverEnd: function(event) {
        if (!this.hoverStartTime) return;

        const duration = Date.now() - this.hoverStartTime;
        if (duration > 100) {
            const element = event.target;
            const interaction = {
                type: 'hover',
                element: Utils.getElementSelector(element),
                description: Utils.getElementDescription(element),
                timestamp: Date.now(),
                duration: duration,
                timeSinceLastAction: this.getTimeSinceLast()
            };

            this.interactions.push(interaction);
            this.stats.hovers++;
            this.stats.totalHoverTime += duration;
            this.stats.hoverCount++;
            this.lastInteractionTime = Date.now();
            this.saveSession();

            window.dispatchEvent(new CustomEvent('interaction', { detail: interaction }));
        }

        this.hoverStartTime = null;
        this.currentHoverElement = null;
    },

    recordKeyPress: function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        const interaction = {
            type: 'keypress',
            key: event.key,
            element: Utils.getElementSelector(event.target),
            timestamp: Date.now(),
            timeSinceLastAction: this.getTimeSinceLast()
        };

        this.interactions.push(interaction);
        this.stats.keyPresses++;
        this.lastInteractionTime = Date.now();

        this.keySequence.push(event.key);
        if (this.keySequence.length > 10) {
            this.keySequence.shift();
        }

        this.saveSession();
        window.dispatchEvent(new CustomEvent('interaction', { detail: interaction }));
    },

    recordInput: function(event) {
        const element = event.target;
        const interaction = {
            type: 'input',
            element: Utils.getElementSelector(element),
            description: Utils.getElementDescription(element),
            timestamp: Date.now(),
            timeSinceLastAction: this.getTimeSinceLast()
        };

        this.interactions.push(interaction);
        this.lastInteractionTime = Date.now();
        this.saveSession();

        window.dispatchEvent(new CustomEvent('interaction', { detail: interaction }));
    },

    recordChange: function(event) {
        const element = event.target;
        const interaction = {
            type: 'change',
            element: Utils.getElementSelector(element),
            description: Utils.getElementDescription(element),
            timestamp: Date.now(),
            timeSinceLastAction: this.getTimeSinceLast()
        };

        this.interactions.push(interaction);
        this.lastInteractionTime = Date.now();
        this.saveSession();

        window.dispatchEvent(new CustomEvent('interaction', { detail: interaction }));
    },

    getTimeSinceLast: function() {
        if (!this.lastInteractionTime) return 0;
        return Date.now() - this.lastInteractionTime;
    },

    getRecentInteractions: function(count = 10) {
        return this.interactions.slice(-count);
    },

    getInteractionSequence: function(length = 5) {
        const recent = this.interactions.slice(-length);
        return recent.map(i => i.element).join(' → ');
    },

    getAverageClickSpeed: function() {
        const clicks = this.interactions.filter(i => i.type === 'click');
        if (clicks.length < 2) return 0;

        let totalTime = 0;
        for (let i = 1; i < clicks.length; i++) {
            totalTime += clicks[i].timestamp - clicks[i - 1].timestamp;
        }

        return totalTime / (clicks.length - 1);
    },

    getAverageHoverDuration: function() {
        if (this.stats.hoverCount === 0) return 0;
        return this.stats.totalHoverTime / this.stats.hoverCount;
    },

    getKeyPressRate: function() {
        const sessionDuration = (Date.now() - this.sessionStartTime) / 60000;
        if (sessionDuration < 0.1) return 0;
        return (this.stats.keyPresses / sessionDuration).toFixed(1);
    }
};
