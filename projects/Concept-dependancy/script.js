    // Data structure for concepts
    let concepts = [];
    let conceptIdCounter = 1;

    // DOM elements
    const addConceptBtn = document.getElementById('addConceptBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const exportBtn = document.getElementById('exportBtn');
    const addExampleBtn = document.getElementById('addExampleBtn');
    const addFirstConceptBtn = document.getElementById('addFirstConceptBtn');
    const viewBtns = document.querySelectorAll('.view-btn');
    const modal = document.getElementById('conceptModal');
    const closeModal = document.getElementById('closeModal');
    const emptyState = document.getElementById('emptyState');

    // Example data for demonstration
    const exampleConcepts = [
      {
        id: 1,
        name: "Variables",
        description: "Understanding how to store and manipulate data",
        category: "programming",
        difficulty: "beginner",
        prerequisites: [],
        estimatedTime: 3,
        status: "completed"
      },
      {
        id: 2,
        name: "Functions",
        description: "Creating reusable blocks of code",
        category: "programming",
        difficulty: "beginner",
        prerequisites: ["Variables"],
        estimatedTime: 5,
        status: "completed"
      },
      {
        id: 3,
        name: "Arrays",
        description: "Working with collections of data",
        category: "programming",
        difficulty: "beginner",
        prerequisites: ["Variables"],
        estimatedTime: 4,
        status: "in-progress"
      },
      {
        id: 4,
        name: "Object-Oriented Programming",
        description: "Using objects to organize code",
        category: "programming",
        difficulty: "intermediate",
        prerequisites: ["Variables", "Functions", "Arrays"],
        estimatedTime: 10,
        status: "pending"
      },
      {
        id: 5,
        name: "Recursion",
        description: "Functions that call themselves",
        category: "programming",
        difficulty: "intermediate",
        prerequisites: ["Functions"],
        estimatedTime: 6,
        status: "pending"
      },
      {
        id: 6,
        name: "Data Structures",
        description: "Organizing and storing data efficiently",
        category: "programming",
        difficulty: "advanced",
        prerequisites: ["Arrays", "Object-Oriented Programming"],
        estimatedTime: 15,
        status: "pending"
      }
    ];

    // Initialize the app
    function initApp() {
      // Load from localStorage if available
      const savedConcepts = localStorage.getItem('concepts');
      if (savedConcepts) {
        concepts = JSON.parse(savedConcepts);
        conceptIdCounter = concepts.length > 0 ? Math.max(...concepts.map(c => c.id)) + 1 : 1;
      }
      
      updateVisualization();
      setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
      addConceptBtn.addEventListener('click', addConcept);
      clearFormBtn.addEventListener('click', clearForm);
      exportBtn.addEventListener('click', exportData);
      addExampleBtn.addEventListener('click', addExampleConcepts);
      addFirstConceptBtn.addEventListener('click', focusOnForm);
      closeModal.addEventListener('click', () => modal.style.display = 'none');
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
      
      // View toggle buttons
      viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const view = btn.dataset.view;
          switchView(view);
          
          // Update active button
          viewBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    }

    // Add a new concept
    function addConcept() {
      const name = document.getElementById('conceptName').value.trim();
      const description = document.getElementById('conceptDescription').value.trim();
      const category = document.getElementById('conceptCategory').value;
      const difficulty = document.getElementById('difficulty').value;
      const prerequisitesInput = document.getElementById('prerequisites').value.trim();
      const estimatedTime = parseInt(document.getElementById('estimatedTime').value);
      
      if (!name) {
        alert('Please enter a concept name');
        return;
      }
      
      // Check if concept already exists
      if (concepts.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert('A concept with this name already exists');
        return;
      }
      
      // Parse prerequisites
      const prerequisites = prerequisitesInput 
        ? prerequisitesInput.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : [];
      
      const newConcept = {
        id: conceptIdCounter++,
        name,
        description,
        category,
        difficulty,
        prerequisites,
        estimatedTime,
        status: "pending"
      };
      
      concepts.push(newConcept);
      saveToLocalStorage();
      updateVisualization();
      clearForm();
      
      // Show success message
      showMessage(`"${name}" added successfully!`, 'success');
    }

    // Clear the form
    function clearForm() {
      document.getElementById('conceptName').value = '';
      document.getElementById('conceptDescription').value = '';
      document.getElementById('conceptCategory').value = 'programming';
      document.getElementById('difficulty').value = 'beginner';
      document.getElementById('prerequisites').value = '';
      document.getElementById('estimatedTime').value = '5';
      
      // Focus on the name field
      document.getElementById('conceptName').focus();
    }

    // Add example concepts
    function addExampleConcepts() {
      if (concepts.length > 0) {
        if (!confirm('This will replace your current concepts. Continue?')) {
          return;
        }
      }
      
      concepts = JSON.parse(JSON.stringify(exampleConcepts));
      conceptIdCounter = concepts.length > 0 ? Math.max(...concepts.map(c => c.id)) + 1 : 1;
      saveToLocalStorage();
      updateVisualization();
      showMessage('Example concepts loaded successfully!', 'success');
    }

    // Focus on the form
    function focusOnForm() {
      document.getElementById('conceptName').focus();
      // Scroll to form
      document.querySelector('.input-panel').scrollIntoView({ behavior: 'smooth' });
    }

    // Export data
    function exportData() {
      if (concepts.length === 0) {
        showMessage('No concepts to export', 'warning');
        return;
      }
      
      const dataStr = JSON.stringify(concepts, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'concept-dependencies.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      showMessage('Data exported successfully!', 'success');
    }

    // Switch between views
    function switchView(view) {
      // Hide all views
      document.querySelectorAll('.view-content').forEach(el => {
        el.style.display = 'none';
      });
      
      // Show selected view
      document.getElementById(`${view}View`).style.display = 'block';
    }

    // Update all visualizations
    function updateVisualization() {
      if (concepts.length === 0) {
        emptyState.style.display = 'block';
        document.querySelectorAll('.view-content').forEach(el => {
          el.style.display = 'none';
        });
        return;
      }
      
      emptyState.style.display = 'none';
      
      // Update graph view
      updateGraphView();
      
      // Update list view
      updateListView();
      
      // Update learning path
      updateLearningPath();
      
      // Update recommended path
      updateRecommendedPath();
    }

    // Update graph view
    function updateGraphView() {
      const graphContainer = document.getElementById('dependencyGraph');
      graphContainer.innerHTML = '';
      
      // Group concepts by level based on dependencies
      const levels = groupConceptsByLevel();
      
      // Create levels
      levels.forEach((levelConcepts, levelIndex) => {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'concept-level';
        
        // Add level label
        const levelLabel = document.createElement('div');
        levelLabel.className = 'level-label';
        levelLabel.textContent = `Level ${levelIndex + 1}`;
        levelDiv.appendChild(levelLabel);
        
        // Add concepts in this level
        levelConcepts.forEach(concept => {
          const conceptNode = createConceptNode(concept);
          levelDiv.appendChild(conceptNode);
        });
        
        graphContainer.appendChild(levelDiv);
      });
      
      // Add event listeners to concept nodes
      document.querySelectorAll('.concept-node').forEach(node => {
        node.addEventListener('click', () => {
          const conceptId = parseInt(node.dataset.id);
          showConceptDetails(conceptId);
        });
      });
    }

    // Group concepts by dependency level
    function groupConceptsByLevel() {
      const levels = [];
      const remainingConcepts = [...concepts];
      
      while (remainingConcepts.length > 0) {
        const currentLevel = [];
        
        // Find concepts with all prerequisites satisfied (or no prerequisites)
        for (let i = 0; i < remainingConcepts.length; i++) {
          const concept = remainingConcepts[i];
          const allPrerequisitesMet = concept.prerequisites.every(prereq => {
            // Check if prerequisite is in previous levels
            return levels.flat().some(c => c.name === prereq);
          });
          
          if (allPrerequisitesMet || concept.prerequisites.length === 0) {
            currentLevel.push(concept);
            remainingConcepts.splice(i, 1);
            i--;
          }
        }
        
        if (currentLevel.length === 0) {
          // Circular dependency detected, add remaining concepts
          levels.push([...remainingConcepts]);
          break;
        }
        
        levels.push(currentLevel);
      }
      
      return levels;
    }

    // Create a concept node for the graph
    function createConceptNode(concept) {
      const node = document.createElement('div');
      node.className = `concept-node ${concept.status}`;
      node.dataset.id = concept.id;
      
      // Difficulty color indicator
      const difficultyColors = {
        beginner: '#27ae60',
        intermediate: '#f39c12',
        advanced: '#e74c3c'
      };
      
      node.innerHTML = `
        <div class="concept-title">${concept.name}</div>
        <div class="concept-description">${concept.description}</div>
        <div class="concept-meta">
          <span>${concept.estimatedTime}h</span>
          <span style="color: ${difficultyColors[concept.difficulty]}">${concept.difficulty}</span>
        </div>
      `;
      
      return node;
    }

    // Update list view
    function updateListView() {
      const listContainer = document.getElementById('conceptList');
      listContainer.innerHTML = '';
      
      concepts.forEach(concept => {
        const listItem = document.createElement('div');
        listItem.className = 'concept-list-item';
        listItem.dataset.id = concept.id;
        
        // Status badge
        const statusTexts = {
          'pending': 'Pending',
          'in-progress': 'In Progress',
          'completed': 'Completed'
        };
        
        listItem.innerHTML = `
          <div class="concept-list-info">
            <h4>${concept.name}</h4>
            <p>${concept.description}</p>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <span style="font-size: 0.8rem; color: #95a5a6;">Prerequisites: ${concept.prerequisites.join(', ') || 'None'}</span>
              <span style="font-size: 0.8rem; color: #95a5a6;">${concept.estimatedTime}h</span>
            </div>
          </div>
          <div>
            <span class="status-badge status-${concept.status}">${statusTexts[concept.status]}</span>
          </div>
        `;
        
        listItem.addEventListener('click', () => {
          showConceptDetails(concept.id);
        });
        
        listContainer.appendChild(listItem);
      });
    }

    // Update learning path view
    function updateLearningPath() {
      const pathContainer = document.getElementById('learningPath');
      pathContainer.innerHTML = '';
      
      // Get recommended order
      const learningOrder = calculateLearningOrder();
      
      learningOrder.forEach((concept, index) => {
        const pathItem = document.createElement('div');
        pathItem.className = 'path-item';
        
        // Status badge
        const statusTexts = {
          'pending': 'Pending',
          'in-progress': 'In Progress',
          'completed': 'Completed'
        };
        
        pathItem.innerHTML = `
          <div class="path-order">${index + 1}</div>
          <div class="path-content">
            <div class="path-title">${concept.name}</div>
            <div class="path-description">${concept.description}</div>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <span style="font-size: 0.8rem; color: #95a5a6;">Prerequisites: ${concept.prerequisites.join(', ') || 'None'}</span>
              <span style="font-size: 0.8rem; color: #95a5a6;">${concept.estimatedTime}h</span>
            </div>
          </div>
          <div class="path-actions">
            <span class="status-badge status-${concept.status}">${statusTexts[concept.status]}</span>
            <button class="btn btn-secondary" style="padding: 6px 12px;" onclick="toggleConceptStatus(${concept.id})">
              <i class="fas fa-check"></i> Mark
            </button>
          </div>
        `;
        
        pathItem.addEventListener('click', (e) => {
          // Don't trigger if clicking on the mark button
          if (!e.target.closest('.path-actions')) {
            showConceptDetails(concept.id);
          }
        });
        
        pathContainer.appendChild(pathItem);
      });
    }

    // Update recommended path panel
    function updateRecommendedPath() {
      const pathContainer = document.getElementById('recommendedPath');
      pathContainer.innerHTML = '';
      
      if (concepts.length === 0) {
        pathContainer.innerHTML = `
          <div class="empty-state" style="padding: 30px;">
            <i class="fas fa-road"></i>
            <h4>No Learning Path Yet</h4>
            <p>Add concepts to generate a learning path</p>
          </div>
        `;
        return;
      }
      
      // Get recommended order
      const learningOrder = calculateLearningOrder();
      
      learningOrder.forEach((concept, index) => {
        const pathItem = document.createElement('div');
        pathItem.className = 'path-item';
        
        pathItem.innerHTML = `
          <div class="path-order">${index + 1}</div>
          <div class="path-content">
            <div class="path-title">${concept.name}</div>
            <div class="path-description">${concept.description}</div>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <span style="font-size: 0.8rem; color: #95a5a6;">${concept.estimatedTime}h</span>
              <span style="font-size: 0.8rem; color: #95a5a6;">${concept.difficulty}</span>
            </div>
          </div>
          <div class="path-actions">
            <span class="status-badge status-${concept.status}">
              ${concept.status === 'completed' ? 'Completed' : concept.status === 'in-progress' ? 'In Progress' : 'Pending'}
            </span>
          </div>
        `;
        
        pathItem.addEventListener('click', () => {
          showConceptDetails(concept.id);
        });
        
        pathContainer.appendChild(pathItem);
      });
    }

    // Calculate optimal learning order
    function calculateLearningOrder() {
      const levels = groupConceptsByLevel();
      return levels.flat();
    }

    // Show concept details in modal
    function showConceptDetails(conceptId) {
      const concept = concepts.find(c => c.id === conceptId);
      if (!concept) return;
      
      const modalContent = document.getElementById('modalContent');
      
      // Get concepts that depend on this one
      const dependentConcepts = concepts.filter(c => 
        c.prerequisites.includes(concept.name)
      );
      
      // Get prerequisite concepts
      const prerequisiteConcepts = concepts.filter(c => 
        concept.prerequisites.includes(c.name)
      );
      
      modalContent.innerHTML = `
        <h3 style="color: var(--primary); margin-bottom: 15px;">${concept.name}</h3>
        <p style="margin-bottom: 20px;">${concept.description}</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div>
            <h4 style="color: var(--secondary); margin-bottom: 10px;">Details</h4>
            <p><strong>Category:</strong> ${capitalizeFirstLetter(concept.category)}</p>
            <p><strong>Difficulty:</strong> ${capitalizeFirstLetter(concept.difficulty)}</p>
            <p><strong>Estimated Time:</strong> ${concept.estimatedTime} hours</p>
            <p><strong>Status:</strong> <span class="status-badge status-${concept.status}">
              ${concept.status === 'completed' ? 'Completed' : concept.status === 'in-progress' ? 'In Progress' : 'Pending'}
            </span></p>
          </div>
          
          <div>
            <h4 style="color: var(--secondary); margin-bottom: 10px;">Prerequisites</h4>
            ${prerequisiteConcepts.length > 0 
              ? `<ul style="padding-left: 20px;">${prerequisiteConcepts.map(c => `<li>${c.name}</li>`).join('')}</ul>`
              : '<p>No prerequisites</p>'
            }
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h4 style="color: var(--secondary); margin-bottom: 10px;">Required For</h4>
          ${dependentConcepts.length > 0 
            ? `<ul style="padding-left: 20px;">${dependentConcepts.map(c => `<li>${c.name}</li>`).join('')}</ul>`
            : '<p>No concepts depend on this one yet</p>'
          }
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="toggleConceptStatus(${concept.id})">
            <i class="fas fa-check"></i> ${concept.status === 'completed' ? 'Mark as Pending' : concept.status === 'in-progress' ? 'Mark as Completed' : 'Mark as In Progress'}
          </button>
          <button class="btn btn-danger" onclick="deleteConcept(${concept.id})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      `;
      
      modal.style.display = 'flex';
    }

    // Toggle concept status
    function toggleConceptStatus(conceptId) {
      const concept = concepts.find(c => c.id === conceptId);
      if (!concept) return;
      
      // Cycle through statuses: pending -> in-progress -> completed -> pending
      const statusOrder = ['pending', 'in-progress', 'completed'];
      const currentIndex = statusOrder.indexOf(concept.status);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      
      concept.status = statusOrder[nextIndex];
      saveToLocalStorage();
      updateVisualization();
      
      // Close modal if open
      modal.style.display = 'none';
      
      showMessage(`"${concept.name}" marked as ${concept.status === 'completed' ? 'completed' : concept.status === 'in-progress' ? 'in progress' : 'pending'}`, 'success');
    }

    // Delete a concept
    function deleteConcept(conceptId) {
      if (!confirm('Are you sure you want to delete this concept?')) {
        return;
      }
      
      const conceptIndex = concepts.findIndex(c => c.id === conceptId);
      if (conceptIndex === -1) return;
      
      const conceptName = concepts[conceptIndex].name;
      
      // Remove concept from prerequisites of other concepts
      concepts.forEach(c => {
        const prereqIndex = c.prerequisites.indexOf(conceptName);
        if (prereqIndex !== -1) {
          c.prerequisites.splice(prereqIndex, 1);
        }
      });
      
      // Remove the concept
      concepts.splice(conceptIndex, 1);
      saveToLocalStorage();
      updateVisualization();
      
      // Close modal
      modal.style.display = 'none';
      
      showMessage(`"${conceptName}" deleted successfully`, 'success');
    }

    // Save concepts to localStorage
    function saveToLocalStorage() {
      localStorage.setItem('concepts', JSON.stringify(concepts));
    }

    // Show a temporary message
    function showMessage(text, type) {
      // Remove existing message if any
      const existingMessage = document.querySelector('.message');
      if (existingMessage) {
        existingMessage.remove();
      }
      
      const message = document.createElement('div');
      message.className = `message ${type}`;
      message.textContent = text;
      message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `;
      
      // Set background color based on type
      if (type === 'success') {
        message.style.backgroundColor = 'var(--success)';
      } else if (type === 'warning') {
        message.style.backgroundColor = 'var(--warning)';
      } else {
        message.style.backgroundColor = 'var(--accent)';
      }
      
      document.body.appendChild(message);
      
      // Remove after 3 seconds
      setTimeout(() => {
        if (message.parentNode) {
          message.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => {
            if (message.parentNode) {
              message.remove();
            }
          }, 300);
        }
      }, 3000);
      
      // Add CSS for animations
      if (!document.querySelector('#message-styles')) {
        const style = document.createElement('style');
        style.id = 'message-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // Utility function to capitalize first letter
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initialize the app when the page loads
    document.addEventListener('DOMContentLoaded', initApp);