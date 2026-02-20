document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    
    // Task status buttons functionality
    const completeButtons = document.querySelectorAll('.complete-btn');
    const skipButtons = document.querySelectorAll('.skip-btn');
    const editButtons = document.querySelectorAll('.edit-btn');
    const taskInputs = document.querySelectorAll('.task-input');
    const taskTitles = document.querySelectorAll('.task-title');
    
    // Initialize stats
    updateStats();
    
    // Mark task as completed
    completeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const task = this.closest('.task');
            const status = task.getAttribute('data-status');
            
            if (status === 'completed') {
                // If already completed, revert to active
                task.setAttribute('data-status', 'active');
                task.classList.remove('completed');
                this.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                // Mark as completed
                task.setAttribute('data-status', 'completed');
                task.classList.add('completed');
                task.classList.remove('skipped');
                this.innerHTML = '<i class="fas fa-undo"></i>';
                
                // Animate completion
                task.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    task.style.transform = 'scale(0.98)';
                }, 300);
            }
            
            updateStats();
        });
    });
    
    // Mark task as skipped
    skipButtons.forEach(button => {
        button.addEventListener('click', function() {
            const task = this.closest('.task');
            const status = task.getAttribute('data-status');
            
            if (status === 'skipped') {
                // If already skipped, revert to active
                task.setAttribute('data-status', 'active');
                task.classList.remove('skipped');
                this.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                // Mark as skipped
                task.setAttribute('data-status', 'skipped');
                task.classList.add('skipped');
                task.classList.remove('completed');
                this.innerHTML = '<i class="fas fa-undo"></i>';
                
                // Animate skip
                task.style.transform = 'translateX(10px)';
                setTimeout(() => {
                    task.style.transform = 'translateX(0)';
                }, 300);
            }
            
            updateStats();
        });
    });
    
    // Edit task functionality
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const task = this.closest('.task');
            const taskTitle = task.querySelector('.task-title');
            
            // Focus on the editable title
            taskTitle.focus();
            
            // Highlight the text
            const range = document.createRange();
            range.selectNodeContents(taskTitle);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Pulse animation for edit mode
            task.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.3)';
            setTimeout(() => {
                task.style.boxShadow = '';
            }, 1000);
        });
    });
    
    // Make task titles editable on click as well
    taskTitles.forEach(title => {
        title.addEventListener('click', function() {
            this.focus();
        });
        
        // Update task type when title changes (simple categorization)
        title.addEventListener('blur', function() {
            const text = this.textContent.toLowerCase();
            const task = this.closest('.task');
            const taskType = task.querySelector('.task-type');
            
            // Simple logic to determine task type based on content
            if (text.includes('study') || text.includes('homework') || text.includes('read') || text.includes('review')) {
                task.className = task.className.replace(/\b(study|break|personal)\b/g, '') + ' study';
                taskType.textContent = 'Study';
            } else if (text.includes('break') || text.includes('rest') || text.includes('snack') || text.includes('walk')) {
                task.className = task.className.replace(/\b(study|break|personal)\b/g, '') + ' break';
                taskType.textContent = 'Break';
            } else if (text.includes('lunch') || text.includes('dinner') || text.includes('family') || text.includes('hobby') || text.includes('relax')) {
                task.className = task.className.replace(/\b(study|break|personal)\b/g, '') + ' personal';
                taskType.textContent = 'Personal';
            }
        });
    });
    
    // Add new task when pressing Enter in task input
    taskInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                const timeSection = this.closest('.time-section');
                const tasksContainer = timeSection.querySelector('.tasks-container');
                const timeOfDay = timeSection.classList.contains('morning') ? 'Morning' : 
                                 timeSection.classList.contains('afternoon') ? 'Afternoon' : 'Evening';
                
                // Determine appropriate time based on existing tasks
                const existingTasks = timeSection.querySelectorAll('.task');
                let hour = 8;
                if (timeOfDay === 'Afternoon') hour = 14;
                if (timeOfDay === 'Evening') hour = 19;
                
                if (existingTasks.length > 0) {
                    const lastTask = existingTasks[existingTasks.length - 1];
                    const lastTimeText = lastTask.querySelector('.task-time').textContent;
                    const timeMatch = lastTimeText.match(/(\d+):(\d+)/);
                    if (timeMatch) {
                        hour = parseInt(timeMatch[1]);
                        if (timeMatch[2] === '30') {
                            hour += 1;
                        }
                    }
                }
                
                const endHour = hour + 1;
                const timeDisplay = `${hour}:00 ${hour < 12 ? 'AM' : 'PM'} - ${endHour}:00 ${endHour < 12 ? 'AM' : 'PM'}`;
                
                // Create new task element
                const newTask = document.createElement('div');
                newTask.className = 'task personal';
                newTask.setAttribute('data-status', 'active');
                newTask.innerHTML = `
                    <div class="task-header">
                        <span class="task-type">Personal</span>
                        <div class="task-actions">
                            <button class="status-btn complete-btn" title="Mark as completed"><i class="fas fa-check"></i></button>
                            <button class="status-btn skip-btn" title="Mark as skipped"><i class="fas fa-times"></i></button>
                            <button class="status-btn edit-btn" title="Edit task"><i class="fas fa-edit"></i></button>
                        </div>
                    </div>
                    <h3 class="task-title" contenteditable="true">${this.value}</h3>
                    <p class="task-desc">New task added to your ${timeOfDay.toLowerCase()} routine.</p>
                    <div class="task-time"><i class="far fa-clock"></i> ${timeDisplay}</div>
                `;
                
                // Insert before the input field
                tasksContainer.insertBefore(newTask, this);
                
                // Clear input
                this.value = '';
                
                // Add event listeners to new buttons
                const newCompleteBtn = newTask.querySelector('.complete-btn');
                const newSkipBtn = newTask.querySelector('.skip-btn');
                const newEditBtn = newTask.querySelector('.edit-btn');
                const newTitle = newTask.querySelector('.task-title');
                
                newCompleteBtn.addEventListener('click', function() {
                    const task = this.closest('.task');
                    const status = task.getAttribute('data-status');
                    
                    if (status === 'completed') {
                        task.setAttribute('data-status', 'active');
                        task.classList.remove('completed');
                        this.innerHTML = '<i class="fas fa-check"></i>';
                    } else {
                        task.setAttribute('data-status', 'completed');
                        task.classList.add('completed');
                        task.classList.remove('skipped');
                        this.innerHTML = '<i class="fas fa-undo"></i>';
                        
                        task.style.transform = 'scale(1.05)';
                        setTimeout(() => {
                            task.style.transform = 'scale(0.98)';
                        }, 300);
                    }
                    
                    updateStats();
                });
                
                newSkipBtn.addEventListener('click', function() {
                    const task = this.closest('.task');
                    const status = task.getAttribute('data-status');
                    
                    if (status === 'skipped') {
                        task.setAttribute('data-status', 'active');
                        task.classList.remove('skipped');
                        this.innerHTML = '<i class="fas fa-times"></i>';
                    } else {
                        task.setAttribute('data-status', 'skipped');
                        task.classList.add('skipped');
                        task.classList.remove('completed');
                        this.innerHTML = '<i class="fas fa-undo"></i>';
                        
                        task.style.transform = 'translateX(10px)';
                        setTimeout(() => {
                            task.style.transform = 'translateX(0)';
                        }, 300);
                    }
                    
                    updateStats();
                });
                
                newEditBtn.addEventListener('click', function() {
                    const task = this.closest('.task');
                    const taskTitle = task.querySelector('.task-title');
                    
                    taskTitle.focus();
                    const range = document.createRange();
                    range.selectNodeContents(taskTitle);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    task.style.boxShadow = '0 0 0 3px rgba(108, 99, 255, 0.3)';
                    setTimeout(() => {
                        task.style.boxShadow = '';
                    }, 1000);
                });
                
                newTitle.addEventListener('click', function() {
                    this.focus();
                });
                
                newTitle.addEventListener('blur', function() {
                    const text = this.textContent.toLowerCase();
                    const task = this.closest('.task');
                    const taskType = task.querySelector('.task-type');
                    
                    if (text.includes('study') || text.includes('homework') || text.includes('read') || text.includes('review')) {
                        task.className = task.className.replace(/\b(study|break|personal)\b/g, '') + ' study';
                        taskType.textContent = 'Study';
                    } else if (text.includes('break') || text.includes('rest') || text.includes('snack') || text.includes('walk')) {
                        task.className = task.className.replace(/\b(study|break|personal)\b/g, '') + ' break';
                        taskType.textContent = 'Break';
                    } else if (text.includes('lunch') || text.includes('dinner') || text.includes('family') || text.includes('hobby') || text.includes('relax')) {
                        task.className = task.className.replace(/\b(study|break|personal)\b/g, '') + ' personal';
                        taskType.textContent = 'Personal';
                    }
                });
                
                // Animate the new task entry
                newTask.style.opacity = '0';
                newTask.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    newTask.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    newTask.style.opacity = '1';
                    newTask.style.transform = 'translateY(0)';
                }, 10);
                
                // Update stats
                updateStats();
            }
        });
    });
    
    // Function to update statistics
    function updateStats() {
        const totalTasks = document.querySelectorAll('.task').length;
        const completedTasks = document.querySelectorAll('.task.completed').length;
        const skippedTasks = document.querySelectorAll('.task.skipped').length;
        const remainingTasks = totalTasks - completedTasks - skippedTasks;
        
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('skipped-tasks').textContent = skippedTasks;
        document.getElementById('remaining-tasks').textContent = remainingTasks;
        
        // Animate stat updates
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(stat => {
            stat.style.transform = 'scale(1.1)';
            setTimeout(() => {
                stat.style.transform = 'scale(1)';
            }, 300);
        });
    }
    
    // Add some initial animation to time sections
    const timeSections = document.querySelectorAll('.time-section');
    timeSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
});
