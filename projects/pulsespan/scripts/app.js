/**
 * App Entry Point
 */
document.addEventListener('DOMContentLoaded', () => {

    // Initialize UI
    Visuals.init();
    UI.init();

    // Subscribe UI to State
    State.subscribe(UI.update);

    // Initial Render
    UI.update(State.data, 'INIT');

    // Event Listeners

    // Energy Slider
    const slider = document.getElementById('energy-slider');
    slider.addEventListener('input', (e) => {
        State.setEnergyLevel(e.target.value);
    });

    // Add Task Modal Controls
    const modal = document.getElementById('add-task-modal');
    const openBtn = document.getElementById('btn-add-task');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-add-task');

    const toggleModal = (show) => {
        if (show) modal.classList.add('open');
        else modal.classList.remove('open');
    };

    openBtn.addEventListener('click', () => toggleModal(true));
    closeBtn.addEventListener('click', () => toggleModal(false));
    cancelBtn.addEventListener('click', () => toggleModal(false));

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) toggleModal(false);
    });

    // Add Task Form Submit
    const form = document.getElementById('add-task-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const duration = parseInt(document.getElementById('task-duration').value, 10);
        const energyOptions = document.getElementsByName('task-energy');
        let energy = 'medium';
        for (let opt of energyOptions) {
            if (opt.checked) energy = opt.value;
        }

        const vibeOptions = document.getElementsByName('task-vibe');
        let vibe = 'any';
        for (let opt of vibeOptions) { if (opt.checked) vibe = opt.value; }

        State.addTask({
            title,
            energy,
            vibe,
            duration,
        });

        // Reset and close
        form.reset();
        // Reset radio to default
        energyOptions.forEach(opt => opt.value === 'medium' ? opt.checked = true : null);
        vibeOptions.forEach(opt => opt.value === 'any' ? opt.checked = true : null);

        toggleModal(false);
    });

    // Feature 4: Vibe Filter
    const vibeSelect = document.getElementById('vibe-select');
    if (vibeSelect) {
        vibeSelect.addEventListener('change', (e) => {
            State.setVibe(e.target.value);
        });
    }

    // Feature 6: Sonic Focus Button
    document.getElementById('btn-sonic-focus').addEventListener('click', (e) => {
        const isPlaying = AudioEngine.toggle();
        e.target.style.opacity = isPlaying ? '1' : '0.5';
        e.target.style.color = isPlaying ? 'var(--brand-primary)' : 'inherit';
    });

    // Feature 8: Brain Dump
    const brainDump = document.getElementById('brain-dump-input');
    if (brainDump) {
        brainDump.addEventListener('input', Utils.debounce((e) => {
            State.updateBrainDump(e.target.value);
        }, 500));
    }

    // Feature 1: Focus Overlay Controls
    document.getElementById('exit-focus').addEventListener('click', () => {
        State.endFocusSession();
    });

    document.getElementById('complete-focus').addEventListener('click', () => {
        if (State.data.activeFocusSession) {
            State.updateTaskStatus(State.data.activeFocusSession.taskId, 'completed');
            if (window.Visuals) window.Visuals.spawnConfetti(window.innerWidth / 2, window.innerHeight / 2);
        }
        State.endFocusSession();
    });

    // Filter Tabs
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active class
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update filter
            State.setFilter(tab.dataset.filter);
        });
    });

    // Navigation (Visual only for now)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            // Simple view switching logic if we implemented multiple views fully
            // For now, mostly dashboard focus
        });
    });

    // Optimize Button (Easter egg / feature)
    document.getElementById('btn-optimize').addEventListener('click', () => {
        // Simulates an AI optimization
        const btn = document.getElementById('btn-optimize');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="icon">✨</span> Optimizing...';

        setTimeout(() => {
            btn.innerHTML = originalText;
            // Force a re-sort notification just to show interactivity
            State.notify('OPTIMIZED');
        }, 800);
    });
});
