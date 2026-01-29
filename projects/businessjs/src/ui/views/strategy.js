/**
 * Strategy View
 * Manage active company policies.
 */
import { store } from '../../state/store.js';

export class StrategyView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'view-strategy';
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <div class="glass-card">
                <h2>Company Policies</h2>
                <p style="color:var(--text-muted); margin-bottom:1.5rem;">
                    Active strategies change how your business operates. They often have trade-offs.
                </p>
                <div id="policy-grid" style="display:grid; grid-template-columns:1fr; gap:10px;"></div>
                
                <div style="margin-top:1.5rem; padding:1rem; border-top:1px solid var(--border-glass);">
                    <div style="font-size:0.9rem; color:var(--text-muted);">Projected Policy Costs:</div>
                    <div id="proj-cost" style="font-size:1.2rem; font-weight:700; color:var(--danger);">$0 / day</div>
                </div>
            </div>
        `;

        this.renderPolicies();
    }

    getPolicies() {
        return [
            {
                id: 'crunch_mode',
                name: 'Crunch Mode',
                desc: 'Increase productivity by 20%, but drain morale and fatigue twice as fast.',
                cost: 0
            },
            {
                id: 'aggressive_marketing',
                name: 'Aggressive Marketing',
                desc: 'Boost demand by 25%, but costs $500/day and risks reputation drops.',
                cost: 500
            },
            {
                id: 'remote_work',
                name: 'Remote First',
                desc: 'Boost morale, but R&D progress is 15% slower.',
                cost: 0
            }
        ];
    }

    renderPolicies() {
        const grid = this.element.querySelector('#policy-grid');
        const policies = this.getPolicies();

        policies.forEach(p => {
            const item = document.createElement('div');
            item.className = 'policy-item';
            item.style.border = '1px solid var(--border-glass)';
            item.style.padding = '1rem';
            item.style.borderRadius = '8px';
            item.style.background = 'rgba(255,255,255,0.02)';
            item.style.display = 'flex';
            item.style.justifyContent = 'space-between';
            item.style.alignItems = 'center';
            item.dataset.id = p.id;
            item.dataset.cost = p.cost;

            item.innerHTML = `
                <div>
                    <div style="font-weight:600; margin-bottom:4px;">${p.name}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${p.desc}</div>
                    ${p.cost > 0 ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">Cost: $${p.cost}/day</div>` : ''}
                </div>
                <button class="btn-toggle" style="
                    padding:8px 16px; 
                    border-radius:20px; 
                    font-weight:600; 
                    transition:all 0.2s;
                    border:1px solid rgba(255,255,255,0.1);
                    cursor: pointer;
                ">Enable</button>
            `;

            item.querySelector('.btn-toggle').addEventListener('click', () => {
                if (window.Game && window.Game.loop && window.Game.loop.policySystem) {
                    window.Game.loop.policySystem.toggle(p.id);
                }
            });

            grid.appendChild(item);
        });
    }

    update(state) {
        const active = state.policies ? state.policies.active : [];
        let totalCost = 0;

        this.element.querySelectorAll('.policy-item').forEach(el => {
            const id = el.dataset.id;
            const cost = parseInt(el.dataset.cost);
            const btn = el.querySelector('.btn-toggle');

            if (active.includes(id)) {
                btn.textContent = 'Active';
                btn.style.background = 'var(--accent-secondary)';
                btn.style.color = '#fff';
                el.style.borderColor = 'var(--accent-secondary)';
                totalCost += cost;
            } else {
                btn.textContent = 'Enable';
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-muted)';
                el.style.borderColor = 'var(--border-glass)';
            }
        });

        this.element.querySelector('#proj-cost').textContent = `-$${totalCost.toLocaleString()} / day`;
    }

    getElement() {
        return this.element;
    }
}
