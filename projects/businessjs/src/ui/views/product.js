/**
 * Product View
 * R&D Management.
 */
import { store } from '../../state/store.js';

export class ProductView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'view-product';
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <div class="glass-card">
                <h2>Product Development</h2>
                <div style="display:flex; justify-content:space-between; margin-top:1rem;">
                    <div>
                        <div class="label" style="color:var(--text-muted);">Current Version</div>
                        <div class="value" id="prod-version" style="font-size:2rem; font-weight:700;">v1.0</div>
                    </div>
                    <div style="text-align:right;">
                        <div class="label" style="color:var(--text-muted);">Quality Score</div>
                        <div class="value" id="prod-quality" style="font-size:2rem; font-weight:700; color:var(--accent-primary);">10</div>
                    </div>
                </div>

                <div style="margin-top:2rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span>R&D Progress</span>
                        <span id="rd-percent">0%</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); height:8px; border-radius:4px; overflow:hidden;">
                        <div id="rd-bar" style="width:0%; height:100%; background:var(--accent-primary); transition:width 0.3s;"></div>
                    </div>
                </div>

                <div style="margin-top:2rem; border-top:1px solid var(--border-glass); padding-top:1rem;">
                    <h3>Investment Strategy</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">
                        Allocate daily budget to accelerate research.
                    </p>
                    
                    <div style="display:flex; gap:10px;">
                        <button class="btn-invest" data-amt="0" style="padding:8px 16px; background:rgba(255,255,255,0.05); border-radius:6px;">$0 (Pause)</button>
                        <button class="btn-invest" data-amt="100" style="padding:8px 16px; background:rgba(255,255,255,0.05); border-radius:6px;">$100/day</button>
                        <button class="btn-invest" data-amt="500" style="padding:8px 16px; background:rgba(255,255,255,0.05); border-radius:6px;">$500/day</button>
                        <button class="btn-invest" data-amt="2000" style="padding:8px 16px; background:rgba(255,255,255,0.05); border-radius:6px;">$2k/day</button>
                    </div>
                    <div style="margin-top:10px; font-size:0.9rem;">
                        Current: <span id="current-invest" style="color:var(--warning);">$0/day</span>
                    </div>
                </div>
            </div>
        `;

        this.element.querySelectorAll('.btn-invest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amt = parseInt(e.target.dataset.amt);
                if (window.Game && window.Game.loop && window.Game.loop.productSystem) {
                    window.Game.loop.productSystem.setInvestment(amt);
                }
            });
        });
    }

    update(state) {
        this.element.querySelector('#prod-version').textContent = `v${state.product.version}.0`;
        this.element.querySelector('#prod-quality').textContent = Math.floor(state.product.quality);

        const pct = Math.min(100, Math.floor(state.product.rdProgress));
        this.element.querySelector('#rd-percent').textContent = `${pct}%`;
        this.element.querySelector('#rd-bar').style.width = `${pct}%`;

        const invest = state.product.rdInvestment;
        this.element.querySelector('#current-invest').textContent = `$${invest}/day`;

        // Highlight active button
        this.element.querySelectorAll('.btn-invest').forEach(btn => {
            if (parseInt(btn.dataset.amt) === invest) {
                btn.style.background = 'var(--accent-primary)';
                btn.style.color = '#000';
            } else {
                btn.style.background = 'rgba(255,255,255,0.05)';
                btn.style.color = 'inherit';
            }
        });
    }

    getElement() {
        return this.element;
    }
}
