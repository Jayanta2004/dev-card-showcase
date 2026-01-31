/**
 * Employee System
 * Manages staff, recruitment, and productivity.
 */
import { store } from '../state/store.js';

export class EmployeeSystem {
    constructor() {
        this.names = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn'];
        this.roles = ['Developer', 'Designer', 'Marketer', 'Manager'];
    }

    update() {
        // Daily updates for morale/fatigue
        const state = store.get();
        if (state.day % 1 !== 0) return;

        store.mutate(s => {
            s.employees.forEach(emp => {
                // Fatigue increases slightly
                emp.fatigue = Math.min(100, emp.fatigue + (Math.random() * 2));

                // Morale changes based on cash/health?
                if (s.cash < 0) emp.morale -= 1;

                // Productivity calculation
                emp.productivity = (emp.skill * (emp.morale / 100) * ((100 - emp.fatigue) / 100));
            });
        });
    }

    hire(role) {
        const newEmp = {
            id: Date.now(),
            name: this.names[Math.floor(Math.random() * this.names.length)],
            role: role || 'Intern',
            skill: 50 + Math.floor(Math.random() * 50),
            morale: 100,
            fatigue: 0,
            loyalty: 50,
            salary: 150 // Daily cost
        };

        store.mutate(s => {
            s.employees.push(newEmp);
            store.addEventLog({
                type: 'info',
                message: `Hired ${newEmp.name} as ${newEmp.role}`,
                timestamp: s.day
            });
        });
    }
}
