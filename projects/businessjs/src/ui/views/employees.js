/**
 * Employees View
 * Manage staff.
 */
import { store } from '../../state/store.js';
// We need to trigger actions. For now, we will dispatch via a global or store method if we had one.
// Since we don't have a strict dispatcher, we can direct invoke store or system methods if exposed.
// But systems are in loop.js/main.js.
// Let's create a simple global 'Action' helper or just expose the Employee system globally in debugging.
// Ideally, the store should handle "actions" or we export 'actions.js'.

// For this vanilla implementation, let's assume we can emit an event or call a global function.
// We exposed `window.Game` in main.js.

export class EmployeesView {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'view-employees glass-container';
        this.element.style.padding = '0'; // Reset since container has padding
        this.init();
    }

    init() {
        this.element.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
                <h2 style="font-weight:600;">Staff Management</h2>
                <button id="btn-hire" class="glass-card" style="padding: 8px 16px; background: rgba(56, 189, 248, 0.1); color: var(--accent-primary);">
                    + Hire Employee ($150/day)
                </button>
            </div>
            
            <div class="glass-card">
                <table style="width:100%; text-align:left; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid var(--border-glass); color:var(--text-muted); font-size:0.8rem; text-transform:uppercase;">
                            <th style="padding:8px;">Name</th>
                            <th style="padding:8px;">Role</th>
                            <th style="padding:8px;">Skill</th>
                            <th style="padding:8px;">Productivity</th>
                        </tr>
                    </thead>
                    <tbody id="emp-list">
                        <!-- Dynamic Content -->
                    </tbody>
                </table>
            </div>
        `;

        // Bind Interaction
        this.element.querySelector('#btn-hire').addEventListener('click', () => {
            // Find the system in the global scope since we didn't export it cleanly (Vanilla Hack)
            // Or better, setup an event.
            if (window.Game && window.Game.loop && window.Game.loop.employeeSystem) {
                window.Game.loop.employeeSystem.hire('Developer');
            }
        });
    }

    update(state) {
        const tbody = this.element.querySelector('#emp-list');
        // Re-render list slightly optimized
        // For 5-10 employees full innerHTML replace is fine

        if (state.employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding:1rem; text-align:center; color:var(--text-muted);">No employees hired yet.</td></tr>';
            return;
        }

        tbody.innerHTML = state.employees.map(emp => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.02);">
                <td style="padding:8px; font-weight:500;">${emp.name}</td>
                <td style="padding:8px; color:var(--text-muted);">${emp.role}</td>
                <td style="padding:8px;">${Math.round(emp.skill)}</td>
                <td style="padding:8px; color:${emp.productivity > 80 ? 'var(--success)' : ''}">${Math.round(emp.productivity)}%</td>
            </tr>
        `).join('');
    }

    getElement() {
        return this.element;
    }
}
