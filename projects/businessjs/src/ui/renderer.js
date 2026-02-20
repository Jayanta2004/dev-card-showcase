/**
 * UI Renderer
 * Subscribes to store and updates Javascript DOM elements.
 */
import { store } from '../state/store.js';
import { DashboardView } from './views/dashboard.js';
import { EmployeesView } from './views/employees.js';
import { ProductView } from './views/product.js';
import { StrategyView } from './views/strategy.js';
import { FinanceView } from './views/finance.js';

export class Renderer {
    constructor() {
        this.ui = {
            date: document.getElementById('date-text'),
            health: document.getElementById('health-pill'),
            pauseBtn: document.getElementById('btn-pause'),
            speed1: document.getElementById('btn-speed-1'),
            speed2: document.getElementById('btn-speed-2'),
            speed3: document.getElementById('btn-speed-3'),
            eventList: document.getElementById('event-list')
        };

        this.activeView = 'dashboard';
        this.views = {
            dashboard: new DashboardView(),
            employees: new EmployeesView(),
            product: new ProductView(),
            strategy: new StrategyView(),
            finance: new FinanceView()
        };

        // Mount initial view
        // Mount initial view
        this.switchView('dashboard');
        this.renderNav();

        this.bindEvents();
    }

    init() {
        // Initial render
        this.render(store.get());

        // Subscribe
        store.subscribe(state => this.render(state));
    }

    bindEvents() {
        // Paused
        this.ui.pauseBtn.addEventListener('click', () => store.update({ paused: true, gameSpeed: 0 }));

        // Speeds
        this.ui.speed1.addEventListener('click', () => store.update({ paused: false, gameSpeed: 1 }));
        this.ui.speed2.addEventListener('click', () => store.update({ paused: false, gameSpeed: 2 }));
        this.ui.speed3.addEventListener('click', () => store.update({ paused: false, gameSpeed: 3 })); // Max Speed

        // Nav Events
        document.getElementById('main-nav').addEventListener('click', (e) => {
            const link = e.target.closest('.nav-item');
            if (link) {
                e.preventDefault();
                this.switchView(link.dataset.view);
            }
        });
    }

    switchView(viewName) {
        if (!this.views[viewName]) return;
        this.activeView = viewName;

        const container = document.getElementById('view-container');
        container.innerHTML = '';
        container.appendChild(this.views[viewName].getElement());

        // Update Nav Highlighting
        this.renderNav();

        // Trigger immediate render/update for the new view
        this.views[viewName].update(store.get());
    }

    renderNav() {
        const navItems = [
            { id: 'dashboard', label: 'Overview', icon: '📊' },
            { id: 'product', label: 'Product', icon: '🚀' },
            { id: 'strategy', label: 'Strategy', icon: '♟️' },
            { id: 'employees', label: 'Employees', icon: '👥' },
            { id: 'finance', label: 'Finance', icon: '💰' }, // Placeholder
        ];

        const navHtml = navItems.map(item => `
            <a href="#" class="nav-item ${this.activeView === item.id ? 'active' : ''}" data-view="${item.id}">
                <span class="icon">${item.icon}</span> ${item.label}
            </a>
        `).join('');

        document.getElementById('main-nav').innerHTML = navHtml;
    }

    render(state) {
        // Update Time
        this.ui.date.textContent = `Day ${state.day}`;

        // Update Controls Visuals
        const { paused, gameSpeed } = state;

        this.ui.pauseBtn.classList.toggle('active', paused);
        this.ui.pauseBtn.style.color = paused ? 'var(--accent-primary)' : 'inherit';

        this.ui.speed1.classList.toggle('active', !paused && gameSpeed === 1);
        this.ui.speed1.style.color = (!paused && gameSpeed === 1) ? 'var(--accent-primary)' : 'inherit';

        this.ui.speed2.classList.toggle('active', !paused && gameSpeed === 2);
        this.ui.speed2.style.color = (!paused && gameSpeed === 2) ? 'var(--accent-primary)' : 'inherit';

        this.ui.speed3.classList.toggle('active', !paused && gameSpeed === 3);
        this.ui.speed3.style.color = (!paused && gameSpeed === 3) ? 'var(--accent-primary)' : 'inherit';

        // Update Health
        const healthVal = this.ui.health.querySelector('.value');
        healthVal.textContent = state.health + '%';
        if (state.health < 50) healthVal.style.color = 'var(--danger)';
        else if (state.health < 80) healthVal.style.color = 'var(--warning)';
        else healthVal.style.color = 'var(--success)';

        // Delegate to active view
        if (this.views[this.activeView]) this.views[this.activeView].update(state);

        // Render Event Log
        this.renderEvents(state.eventLog);
    }

    renderEvents(events) {
        // Simple diff check or just clear/redraw for vanilla simplicity
        // For performance, we should track last render count, but for now:
        const list = this.ui.eventList;
        if (events.length === list.children.length) return; // Basic check

        list.innerHTML = '';
        events.slice(0, 20).forEach(ev => {
            const el = document.createElement('div');
            el.className = `event-item ${ev.type === 'good' ? 'positive' : ev.type === 'bad' ? 'negative' : ''}`;
            el.innerHTML = `
                <span class="event-time">Day ${ev.timestamp}</span>
                ${ev.message}
            `;
            list.appendChild(el);
        });
    }
}
