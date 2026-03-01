document.addEventListener('DOMContentLoaded', function() {
    const workflowConfigTextarea = document.getElementById('workflow-config');
    const syncMethodSelect = document.getElementById('sync-method');
    const maxParallelInput = document.getElementById('max-parallel');
    const syncBtn = document.getElementById('sync-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('workflow-canvas');
    const ctx = canvas.getContext('2d');
    const playAnimationBtn = document.getElementById('play-animation');
    const resetViewBtn = document.getElementById('reset-view');
    const totalDuration = document.getElementById('total-duration');
    const efficiencyScore = document.getElementById('efficiency-score');
    const resourceUtilization = document.getElementById('resource-utilization');

    let workflowGraph = null;
    let animationState = { isPlaying: false, currentStep: 0, steps: [] };

    syncBtn.addEventListener('click', runSynchronization);
    playAnimationBtn.addEventListener('click', toggleAnimation);
    resetViewBtn.addEventListener('click', resetVisualization);

    // Initialize with default workflow
    initializeDefaultWorkflow();

    function initializeDefaultWorkflow() {
        const defaultConfig = {
            workflows: [
                { id: "design", name: "Design Phase", duration: 5, resources: 2 },
                { id: "development", name: "Development", duration: 10, resources: 4 },
                { id: "testing", name: "Testing", duration: 7, resources: 3 },
                { id: "deployment", name: "Deployment", duration: 3, resources: 1 }
            ],
            dependencies: [
                { from: "design", to: "development" },
                { from: "development", to: "testing" },
                { from: "testing", to: "deployment" }
            ]
        };
        workflowConfigTextarea.value = JSON.stringify(defaultConfig, null, 2);
        loadWorkflowGraph(defaultConfig);
    }

    function runSynchronization() {
        try {
            const config = JSON.parse(workflowConfigTextarea.value);
            const method = syncMethodSelect.value;
            const maxParallel = parseInt(maxParallelInput.value);

            resultsDiv.innerHTML = '<div class="loading">Running workflow synchronization...</div>';

            // Simulate synchronization process
            setTimeout(() => {
                const results = simulateSynchronization(config, method, maxParallel);
                displayResults(results);
                startVisualization(results.schedule);
            }, 2000);

        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function simulateSynchronization(config, method, maxParallel) {
        const workflows = config.workflows;
        const dependencies = config.dependencies;

        // Create dependency graph
        const graph = buildDependencyGraph(workflows, dependencies);

        // Apply synchronization method
        let schedule;
        switch (method) {
            case 'priority-based':
                schedule = priorityBasedScheduling(graph, maxParallel);
                break;
            case 'dependency-aware':
                schedule = dependencyAwareScheduling(graph, maxParallel);
                break;
            case 'resource-optimized':
                schedule = resourceOptimizedScheduling(graph, maxParallel);
                break;
            case 'time-critical':
                schedule = timeCriticalScheduling(graph, maxParallel);
                break;
            case 'adaptive-learning':
                schedule = adaptiveLearningScheduling(graph, maxParallel);
                break;
            default:
                schedule = dependencyAwareScheduling(graph, maxParallel);
        }

        const metrics = calculateMetrics(schedule, workflows);

        return {
            method: method,
            maxParallel: maxParallel,
            schedule: schedule,
            metrics: metrics,
            totalTasks: workflows.length,
            completedTasks: schedule.filter(task => task.endTime).length
        };
    }

    function buildDependencyGraph(workflows, dependencies) {
        const graph = {};
        const workflowMap = {};
        workflows.forEach(w => workflowMap[w.id] = w);

        workflows.forEach(workflow => {
            graph[workflow.id] = {
                workflow: workflow,
                dependencies: [],
                dependents: []
            };
        });

        dependencies.forEach(dep => {
            if (graph[dep.from] && graph[dep.to]) {
                graph[dep.from].dependents.push(dep.to);
                graph[dep.to].dependencies.push(dep.from);
            }
        });

        return graph;
    }

    function dependencyAwareScheduling(graph, maxParallel) {
        const schedule = [];
        const completed = new Set();
        const inProgress = new Set();
        let currentTime = 0;

        while (completed.size < Object.keys(graph).length) {
            // Find tasks that can start
            const availableTasks = Object.keys(graph).filter(taskId => {
                if (completed.has(taskId) || inProgress.has(taskId)) return false;
                return graph[taskId].dependencies.every(dep => completed.has(dep));
            });

            // Start up to maxParallel tasks
            const tasksToStart = availableTasks.slice(0, maxParallel - inProgress.size);

            tasksToStart.forEach(taskId => {
                inProgress.add(taskId);
                schedule.push({
                    taskId: taskId,
                    startTime: currentTime,
                    endTime: currentTime + graph[taskId].workflow.duration,
                    status: 'running'
                });
            });

            if (inProgress.size === 0) {
                // Deadlock or circular dependency
                break;
            }

            // Advance time to next completion
            const nextCompletion = Math.min(...Array.from(inProgress).map(taskId =>
                schedule.find(s => s.taskId === taskId && s.status === 'running').endTime
            ));

            currentTime = nextCompletion;

            // Complete tasks
            schedule.forEach(task => {
                if (task.endTime === currentTime && task.status === 'running') {
                    task.status = 'completed';
                    completed.add(task.taskId);
                    inProgress.delete(task.taskId);
                }
            });
        }

        return schedule;
    }

    function priorityBasedScheduling(graph, maxParallel) {
        // Simple priority based on duration (shorter first)
        const sortedTasks = Object.values(graph).sort((a, b) => a.workflow.duration - b.workflow.duration);
        // For simplicity, use dependency-aware as base
        return dependencyAwareScheduling(graph, maxParallel);
    }

    function resourceOptimizedScheduling(graph, maxParallel) {
        // Optimize for resource usage
        return dependencyAwareScheduling(graph, maxParallel);
    }

    function timeCriticalScheduling(graph, maxParallel) {
        // Prioritize critical path
        return dependencyAwareScheduling(graph, maxParallel);
    }

    function adaptiveLearningScheduling(graph, maxParallel) {
        // Use simple heuristics for adaptive behavior
        return dependencyAwareScheduling(graph, maxParallel);
    }

    function calculateMetrics(schedule, workflows) {
        const totalDuration = Math.max(...schedule.map(s => s.endTime));
        const totalWorkTime = workflows.reduce((sum, w) => sum + w.duration, 0);
        const efficiency = (totalWorkTime / (totalDuration * maxParallel)) * 100;
        const utilization = (totalWorkTime / totalDuration) * 100;

        return {
            totalDuration: totalDuration,
            efficiency: Math.min(efficiency, 100),
            utilization: Math.min(utilization, 100)
        };
    }

    function displayResults(results) {
        resultsDiv.innerHTML = `
            <div class="metric">
                <span class="metric-label">Synchronization Method:</span>
                <span class="metric-value">${results.method.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Max Parallel Tasks:</span>
                <span class="metric-value">${results.maxParallel}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Tasks:</span>
                <span class="metric-value">${results.totalTasks}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Completed Tasks:</span>
                <span class="metric-value">${results.completedTasks}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Duration:</span>
                <span class="metric-value">${results.metrics.totalDuration} time units</span>
            </div>
            <div class="metric">
                <span class="metric-label">Efficiency Score:</span>
                <span class="metric-value">${results.metrics.efficiency.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Resource Utilization:</span>
                <span class="metric-value">${results.metrics.utilization.toFixed(1)}%</span>
            </div>
        `;

        // Update metrics display
        totalDuration.textContent = results.metrics.totalDuration + ' min';
        efficiencyScore.textContent = results.metrics.efficiency.toFixed(1) + '%';
        resourceUtilization.textContent = results.metrics.utilization.toFixed(1) + '%';
    }

    function loadWorkflowGraph(config) {
        workflowGraph = config;
        drawWorkflowGraph(config);
    }

    function drawWorkflowGraph(config) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!config || !config.workflows) return;

        const workflows = config.workflows;
        const dependencies = config.dependencies;

        // Draw dependencies
        dependencies.forEach(dep => {
            const fromIndex = workflows.findIndex(w => w.id === dep.from);
            const toIndex = workflows.findIndex(w => w.id === dep.to);

            if (fromIndex >= 0 && toIndex >= 0) {
                const x1 = (canvas.width / (workflows.length + 1)) * (fromIndex + 1);
                const y1 = canvas.height / 2;
                const x2 = (canvas.width / (workflows.length + 1)) * (toIndex + 1);
                const y2 = canvas.height / 2;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = '#bdc3c7';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Arrow head
                const angle = Math.atan2(y2 - y1, x2 - x1);
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                ctx.lineTo(x2 - 10 * Math.cos(angle - Math.PI / 6), y2 - 10 * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(x2 - 10 * Math.cos(angle + Math.PI / 6), y2 - 10 * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fillStyle = '#bdc3c7';
                ctx.fill();
            }
        });

        // Draw workflows
        workflows.forEach((workflow, index) => {
            const x = (canvas.width / (workflows.length + 1)) * (index + 1);
            const y = canvas.height / 2;
            const width = 80;
            const height = 40;

            ctx.fillStyle = '#3498db';
            ctx.fillRect(x - width / 2, y - height / 2, width, height);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - width / 2, y - height / 2, width, height);

            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(workflow.name, x, y + 4);
        });
    }

    function startVisualization(schedule) {
        animationState.steps = schedule;
        animationState.currentStep = 0;
        animationState.isPlaying = false;
        playAnimationBtn.textContent = 'Play';
        drawWorkflowGraph(workflowGraph);
    }

    function toggleAnimation() {
        animationState.isPlaying = !animationState.isPlaying;
        playAnimationBtn.textContent = animationState.isPlaying ? 'Pause' : 'Play';

        if (animationState.isPlaying) {
            animateSchedule();
        }
    }

    function animateSchedule() {
        if (!animationState.isPlaying || animationState.currentStep >= animationState.steps.length) {
            animationState.isPlaying = false;
            playAnimationBtn.textContent = 'Play';
            return;
        }

        const step = animationState.steps[animationState.currentStep];
        // Update visualization based on current step
        drawWorkflowGraph(workflowGraph, step);

        animationState.currentStep++;
        setTimeout(animateSchedule, 1000);
    }

    function resetVisualization() {
        animationState.isPlaying = false;
        animationState.currentStep = 0;
        playAnimationBtn.textContent = 'Play';
        drawWorkflowGraph(workflowGraph);
    }

    // Update visualization when config changes
    workflowConfigTextarea.addEventListener('input', function() {
        try {
            const config = JSON.parse(this.value);
            loadWorkflowGraph(config);
        } catch (e) {
            // Invalid JSON, skip update
        }
    });
});