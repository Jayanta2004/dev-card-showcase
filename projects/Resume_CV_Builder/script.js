// Resume Builder Application
class ResumeBuilder {
    constructor() {
        // Initialize resume data structure
        this.resumeData = {
            personal: {
                name: '',
                title: '',
                email: '',
                phone: '',
                location: '',
                summary: '',
                linkedin: '',
                github: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            design: {
                template: 'modern',
                primaryColor: '#3a86ff',
                secondaryColor: '#03045e',
                font: "'Segoe UI', sans-serif",
                layout: 'single-column',
                showPhoto: false
            }
        };
        
        // DOM Elements
        this.dom = {
            // Tabs
            tabBtns: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Personal form
            fullName: document.getElementById('full-name'),
            jobTitle: document.getElementById('job-title'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            location: document.getElementById('location'),
            summary: document.getElementById('summary'),
            linkedin: document.getElementById('linkedin'),
            github: document.getElementById('github'),
            
            // Lists
            experienceList: document.getElementById('experience-list'),
            educationList: document.getElementById('education-list'),
            projectsList: document.getElementById('projects-list'),
            skillsContainer: document.getElementById('skills-container'),
            
            // Design
            templateOptions: document.querySelectorAll('.template-option'),
            colorPrimary: document.getElementById('color-primary'),
            colorSecondary: document.getElementById('color-secondary'),
            fontSelect: document.getElementById('font-select'),
            layoutSelect: document.getElementById('layout-select'),
            showPhoto: document.getElementById('show-photo'),
            
            // Buttons
            addExperience: document.getElementById('add-experience'),
            addEducation: document.getElementById('add-education'),
            addSkill: document.getElementById('add-skill'),
            addProject: document.getElementById('add-project'),
            exportPdf: document.getElementById('export-pdf'),
            resetBtn: document.getElementById('reset-btn'),
            
            // Modals
            experienceModal: document.getElementById('experience-modal'),
            skillModal: document.getElementById('skill-modal'),
            
            // Preview
            resumeContent: document.getElementById('resume-content'),
            resumePreview: document.getElementById('resume-preview'),
            zoomIn: document.getElementById('zoom-in'),
            zoomOut: document.getElementById('zoom-out'),
            zoomLevel: document.getElementById('zoom-level'),
            
            // Toast
            toast: document.getElementById('save-toast'),
            toastMessage: document.querySelector('.toast-message'),
            toastClose: document.querySelector('.toast-close'),
            
            // Save status
            saveStatus: document.getElementById('save-status')
        };
        
        // Current state
        this.currentZoom = 100;
        this.editingExperienceId = null;
        this.editingSkillId = null;
        this.autoSaveTimeout = null;
        
        // Initialize
        this.init();
    }
    
    init() {
        // Load saved data
        this.loadFromLocalStorage();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set default dates
        this.setDefaultDates();
        
        // Initial render
        this.updatePreview();
        this.renderExperienceList();
        this.renderEducationList();
        this.renderSkills();
        this.renderProjects();
    }
    
    setupEventListeners() {
        // Tab switching
        this.dom.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Personal info auto-save
        const personalInputs = [
            this.dom.fullName, this.dom.jobTitle, this.dom.email,
            this.dom.phone, this.dom.location, this.dom.summary,
            this.dom.linkedin, this.dom.github
        ];
        
        personalInputs.forEach(input => {
            input.addEventListener('input', () => this.autoSave('personal'));
        });
        
        // Design settings
        this.dom.templateOptions.forEach(option => {
            option.addEventListener('click', () => this.selectTemplate(option.dataset.template));
        });
        
        this.dom.colorPrimary.addEventListener('input', () => this.autoSave('design'));
        this.dom.colorSecondary.addEventListener('input', () => this.autoSave('design'));
        this.dom.fontSelect.addEventListener('change', () => this.autoSave('design'));
        this.dom.layoutSelect.addEventListener('change', () => this.autoSave('design'));
        this.dom.showPhoto.addEventListener('change', () => this.autoSave('design'));
        
        // Action buttons
        this.dom.addExperience.addEventListener('click', () => this.openExperienceModal());
        this.dom.addEducation.addEventListener('click', () => this.openEducationModal());
        this.dom.addSkill.addEventListener('click', () => this.openSkillModal());
        this.dom.addProject.addEventListener('click', () => this.openProjectModal());
        this.dom.exportPdf.addEventListener('click', () => this.exportToPDF());
        this.dom.resetBtn.addEventListener('click', () => this.resetResume());
        
        // Preview controls
        this.dom.zoomIn.addEventListener('click', () => this.adjustZoom(10));
        this.dom.zoomOut.addEventListener('click', () => this.adjustZoom(-10));
        
        // Modal close buttons
        document.querySelectorAll('.close-modal, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) modal.style.display = 'none';
                this.clearModalForms();
            });
        });
        
        // Experience form
        document.getElementById('experience-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveExperience();
        });
        
        // Skill form
        document.getElementById('skill-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSkill();
        });
        
        // Toast close
        this.dom.toastClose.addEventListener('click', () => {
            this.dom.toast.style.display = 'none';
        });
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    this.clearModalForms();
                }
            });
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
                this.clearModalForms();
            }
        });
    }
    
    setDefaultDates() {
        const today = new Date();
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(today.getFullYear() - 2);
        
        // Set default dates in experience modal
        document.getElementById('exp-start').value = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('exp-end').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        
        // Set default dates in education modal
        document.getElementById('edu-start').value = `${twoYearsAgo.getFullYear()}-${String(twoYearsAgo.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('edu-end').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }
    
    switchTab(tabName) {
        // Update tab buttons
        this.dom.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        this.dom.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }
    
    // Data Management
    updatePersonalData() {
        this.resumeData.personal = {
            name: this.dom.fullName.value,
            title: this.dom.jobTitle.value,
            email: this.dom.email.value,
            phone: this.dom.phone.value,
            location: this.dom.location.value,
            summary: this.dom.summary.value,
            linkedin: this.dom.linkedin.value,
            github: this.dom.github.value
        };
    }
    
    updateDesignData() {
        this.resumeData.design = {
            template: this.resumeData.design.template, // Keep current template
            primaryColor: this.dom.colorPrimary.value,
            secondaryColor: this.dom.colorSecondary.value,
            font: this.dom.fontSelect.value,
            layout: this.dom.layoutSelect.value,
            showPhoto: this.dom.showPhoto.checked
        };
    }
    
    selectTemplate(templateName) {
        this.resumeData.design.template = templateName;
        
        // Update UI
        this.dom.templateOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.template === templateName);
        });
        
        this.autoSave('design');
    }
    
    // Experience Management
    openExperienceModal(experience = null) {
        this.editingExperienceId = experience ? experience.id : null;
        
        const form = document.getElementById('experience-form');
        const modal = document.getElementById('experience-modal');
        
        if (experience) {
            // Fill form with existing data
            document.getElementById('exp-title').value = experience.title;
            document.getElementById('exp-company').value = experience.company;
            document.getElementById('exp-start').value = experience.startDate;
            document.getElementById('exp-end').value = experience.endDate || '';
            document.getElementById('exp-current').checked = experience.current || false;
            document.getElementById('exp-location').value = experience.location || '';
            document.getElementById('exp-description').value = experience.description || '';
        } else {
            // Clear form for new experience
            form.reset();
            this.setDefaultDates();
        }
        
        modal.style.display = 'flex';
    }
    
    saveExperience() {
        const title = document.getElementById('exp-title').value.trim();
        const company = document.getElementById('exp-company').value.trim();
        const startDate = document.getElementById('exp-start').value;
        const endDate = document.getElementById('exp-current').checked ? null : document.getElementById('exp-end').value;
        const current = document.getElementById('exp-current').checked;
        const location = document.getElementById('exp-location').value.trim();
        const description = document.getElementById('exp-description').value.trim();
        
        if (!title || !company || !startDate) {
            alert('Please fill in all required fields');
            return;
        }
        
        const experience = {
            id: this.editingExperienceId || Date.now().toString(),
            title,
            company,
            startDate,
            endDate,
            current,
            location,
            description
        };
        
        if (this.editingExperienceId) {
            // Update existing
            const index = this.resumeData.experience.findIndex(exp => exp.id === this.editingExperienceId);
            if (index !== -1) {
                this.resumeData.experience[index] = experience;
            }
        } else {
            // Add new
            this.resumeData.experience.push(experience);
        }
        
        // Close modal and update
        document.getElementById('experience-modal').style.display = 'none';
        this.clearModalForms();
        this.renderExperienceList();
        this.autoSave('experience');
    }
    
    renderExperienceList() {
        this.dom.experienceList.innerHTML = '';
        
        if (this.resumeData.experience.length === 0) {
            this.dom.experienceList.innerHTML = `
                <div class="empty-section">
                    <p>No work experience added yet. Click "Add Experience" to get started.</p>
                </div>
            `;
            return;
        }
        
        this.resumeData.experience.forEach(exp => {
            const element = this.createExperienceElement(exp);
            this.dom.experienceList.appendChild(element);
        });
    }
    
    createExperienceElement(experience) {
        const element = document.createElement('div');
        element.className = 'experience-item';
        element.dataset.id = experience.id;
        
        const startDate = new Date(experience.startDate + '-01');
        const endDate = experience.current ? 'Present' : 
                       experience.endDate ? new Date(experience.endDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
        
        element.innerHTML = `
            <div class="item-header">
                <div class="item-title">${experience.title}</div>
                <div class="item-dates">${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate}</div>
            </div>
            <div class="item-company">${experience.company}</div>
            ${experience.location ? `<div class="item-location">${experience.location}</div>` : ''}
            ${experience.description ? `<div class="item-description">${experience.description}</div>` : ''}
            <div class="item-actions">
                <button class="action-btn edit-btn" data-action="edit">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" data-action="delete">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners
        element.querySelector('[data-action="edit"]').addEventListener('click', () => {
            this.openExperienceModal(experience);
        });
        
        element.querySelector('[data-action="delete"]').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this experience?')) {
                this.resumeData.experience = this.resumeData.experience.filter(exp => exp.id !== experience.id);
                this.renderExperienceList();
                this.autoSave('experience');
            }
        });
        
        return element;
    }
    
    // Education Management
    openEducationModal() {
        // For simplicity, we'll use the same modal structure as experience
        // In a full implementation, you would create a separate education modal
        alert('Education modal would open here. For this demo, you can add education entries in a similar way to experience.');
    }
    
    renderEducationList() {
        // This would render education items similar to experience
        // For this demo, we'll use static content
        if (!this.resumeData.education || this.resumeData.education.length === 0) {
            this.dom.educationList.innerHTML = `
                <div class="empty-section">
                    <p>No education added yet. Click "Add Education" to get started.</p>
                </div>
            `;
        }
    }
    
    // Skills Management
    openSkillModal(skill = null) {
        this.editingSkillId = skill ? skill.id : null;
        const modal = document.getElementById('skill-modal');
        
        if (skill) {
            document.getElementById('skill-name').value = skill.name;
            document.getElementById('skill-category').value = skill.category;
            
            // Set skill level
            document.querySelectorAll('.level-option').forEach(option => {
                option.classList.toggle('active', parseInt(option.dataset.level) === skill.level);
            });
            document.getElementById('skill-level-value').value = skill.level;
        } else {
            document.getElementById('skill-form').reset();
            // Reset level to default (Advanced)
            document.querySelectorAll('.level-option').forEach(option => {
                option.classList.toggle('active', option.dataset.level === '3');
            });
            document.getElementById('skill-level-value').value = '3';
        }
        
        // Add event listeners to level options
        document.querySelectorAll('.level-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.level-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                document.getElementById('skill-level-value').value = option.dataset.level;
            });
        });
        
        modal.style.display = 'flex';
    }
    
    saveSkill() {
        const name = document.getElementById('skill-name').value.trim();
        const category = document.getElementById('skill-category').value;
        const level = parseInt(document.getElementById('skill-level-value').value);
        
        if (!name) {
            alert('Please enter a skill name');
            return;
        }
        
        const skill = {
            id: this.editingSkillId || Date.now().toString(),
            name,
            category,
            level
        };
        
        if (this.editingSkillId) {
            const index = this.resumeData.skills.findIndex(s => s.id === this.editingSkillId);
            if (index !== -1) {
                this.resumeData.skills[index] = skill;
            }
        } else {
            this.resumeData.skills.push(skill);
        }
        
        document.getElementById('skill-modal').style.display = 'none';
        this.clearModalForms();
        this.renderSkills();
        this.autoSave('skills');
    }
    
    renderSkills() {
        this.dom.skillsContainer.innerHTML = '';
        
        if (this.resumeData.skills.length === 0) {
            this.dom.skillsContainer.innerHTML = `
                <div class="empty-section">
                    <p>No skills added yet. Click "Add Skill" to get started.</p>
                </div>
            `;
            return;
        }
        
        // Group skills by category
        const skillsByCategory = {};
        this.resumeData.skills.forEach(skill => {
            if (!skillsByCategory[skill.category]) {
                skillsByCategory[skill.category] = [];
            }
            skillsByCategory[skill.category].push(skill);
        });
        
        // Render skills
        for (const [category, skills] of Object.entries(skillsByCategory)) {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'skill-category';
            categoryElement.innerHTML = `<strong>${category}:</strong> `;
            
            skills.forEach(skill => {
                const skillElement = document.createElement('span');
                skillElement.className = 'skill-tag';
                skillElement.innerHTML = `
                    ${skill.name}
                    <button class="delete-skill" data-id="${skill.id}">&times;</button>
                `;
                categoryElement.appendChild(skillElement);
                
                // Add delete event listener
                skillElement.querySelector('.delete-skill').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.resumeData.skills = this.resumeData.skills.filter(s => s.id !== skill.id);
                    this.renderSkills();
                    this.autoSave('skills');
                });
            });
            
            this.dom.skillsContainer.appendChild(categoryElement);
        }
    }
    
    // Projects Management
    openProjectModal() {
        alert('Project modal would open here. For this demo, you can add projects in a similar way to experience.');
    }
    
    renderProjects() {
        // This would render project items
        // For this demo, we'll use static content
        if (!this.resumeData.projects || this.resumeData.projects.length === 0) {
            this.dom.projectsList.innerHTML = `
                <div class="empty-section">
                    <p>No projects added yet. Click "Add Project" to get started.</p>
                </div>
            `;
        }
    }
    
    // Preview Rendering
    updatePreview() {
        // Update data from form inputs
        this.updatePersonalData();
        this.updateDesignData();
        
        // Clear current content
        this.dom.resumeContent.innerHTML = '';
        
        // Create resume based on selected template
        let resumeHTML = '';
        
        switch (this.resumeData.design.template) {
            case 'modern':
                resumeHTML = this.renderModernTemplate();
                break;
            case 'classic':
                resumeHTML = this.renderClassicTemplate();
                break;
            case 'minimal':
                resumeHTML = this.renderMinimalTemplate();
                break;
            case 'creative':
                resumeHTML = this.renderCreativeTemplate();
                break;
            default:
                resumeHTML = this.renderModernTemplate();
        }
        
        this.dom.resumeContent.innerHTML = resumeHTML;
        this.dom.resumeContent.className = `resume-template ${this.resumeData.design.template}`;
        
        // Apply custom styles
        this.applyCustomStyles();
    }
    
    renderModernTemplate() {
        const { personal, experience, skills } = this.resumeData;
        
        return `
            <div class="resume-header">
                <div class="name-title">
                    <h1>${personal.name || 'Your Name'}</h1>
                    <h2>${personal.title || 'Professional Title'}</h2>
                    <p>${personal.summary || 'Experienced professional with a proven track record...'}</p>
                </div>
                <div class="contact-info">
                    ${personal.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${personal.email}</div>` : ''}
                    ${personal.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${personal.phone}</div>` : ''}
                    ${personal.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${personal.location}</div>` : ''}
                    ${personal.linkedin ? `<div class="contact-item"><i class="fab fa-linkedin"></i> ${personal.linkedin}</div>` : ''}
                    ${personal.github ? `<div class="contact-item"><i class="fab fa-github"></i> ${personal.github}</div>` : ''}
                </div>
            </div>
            
            ${experience.length > 0 ? `
            <div class="section">
                <div class="section-title">Work Experience</div>
                ${experience.map(exp => {
                    const startDate = new Date(exp.startDate + '-01');
                    const endDate = exp.current ? 'Present' : 
                                   exp.endDate ? new Date(exp.endDate + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
                    
                    return `
                    <div class="experience-item">
                        <div class="item-header">
                            <div class="item-title">${exp.title}</div>
                            <div class="item-dates">${startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${endDate}</div>
                        </div>
                        <div class="item-subtitle">${exp.company}</div>
                        ${exp.location ? `<div class="item-location">${exp.location}</div>` : ''}
                        ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
                    </div>
                    `;
                }).join('')}
            </div>
            ` : ''}
            
            ${skills.length > 0 ? `
            <div class="section">
                <div class="section-title">Skills</div>
                <div class="skills-list">
                    ${skills.map(skill => `<span class="skill-tag">${skill.name}</span>`).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <div class="section-title">Education</div>
                <div class="education-item">
                    <div class="item-header">
                        <div class="item-title">Bachelor of Science in Computer Science</div>
                        <div class="item-dates">2016 - 2020</div>
                    </div>
                    <div class="item-subtitle">University of Technology</div>
                    <div class="item-description">Graduated Magna Cum Laude with a 3.8 GPA</div>
                </div>
            </div>
        `;
    }
    
    renderClassicTemplate() {
        const { personal } = this.resumeData;
        
        return `
            <div class="resume-header">
                <div class="name-title">
                    <h1>${personal.name || 'Your Name'}</h1>
                    <h2>${personal.title || 'Professional Title'}</h2>
                </div>
                <div class="contact-info">
                    ${personal.email ? `<span>${personal.email}</span>` : ''}
                    ${personal.phone ? `<span>• ${personal.phone}</span>` : ''}
                    ${personal.location ? `<span>• ${personal.location}</span>` : ''}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Professional Summary</div>
                <p>${personal.summary || 'Experienced professional with a proven track record of success...'}</p>
            </div>
            
            <div class="section">
                <div class="section-title">Work Experience</div>
                <p>Senior Developer at Tech Corp (2019-Present)</p>
                <p>Junior Developer at Startup Inc. (2017-2019)</p>
            </div>
            
            <div class="section">
                <div class="section-title">Education</div>
                <p>BS in Computer Science, University of Technology (2016-2020)</p>
            </div>
        `;
    }
    
    renderMinimalTemplate() {
        const { personal } = this.resumeData;
        
        return `
            <div class="resume-header">
                <h1>${personal.name || 'Your Name'}</h1>
                <h2>${personal.title || 'Professional Title'}</h2>
                <div class="contact-info">
                    ${personal.email ? `<span>${personal.email}</span>` : ''}
                    ${personal.phone ? `<span> | ${personal.phone}</span>` : ''}
                    ${personal.location ? `<span> | ${personal.location}</span>` : ''}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">Experience</div>
                <p><strong>Tech Corp Inc.</strong> - Senior Developer (2019-Present)</p>
                <p>Led development of multiple web applications using modern JavaScript frameworks.</p>
                
                <p><strong>Startup Inc.</strong> - Junior Developer (2017-2019)</p>
                <p>Contributed to frontend development and collaborated with design teams.</p>
            </div>
            
            <div class="section">
                <div class="section-title">Education</div>
                <p><strong>University of Technology</strong> - BS Computer Science (2016-2020)</p>
            </div>
        `;
    }
    
    renderCreativeTemplate() {
        const { personal } = this.resumeData;
        
        return `
            <div class="resume-header">
                <div class="name-title">
                    <h1>${personal.name || 'Your Name'}</h1>
                    <h2>${personal.title || 'Professional Title'}</h2>
                </div>
                <div class="contact-info">
                    ${personal.email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${personal.email}</div>` : ''}
                    ${personal.phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${personal.phone}</div>` : ''}
                    ${personal.location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${personal.location}</div>` : ''}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">About Me</div>
                <p>${personal.summary || 'Passionate professional dedicated to creating innovative solutions and delivering exceptional results.'}</p>
            </div>
            
            <div class="section">
                <div class="section-title">Professional Journey</div>
                <p><strong>Tech Corp Inc.</strong> - Senior Developer (2019-Present)</p>
                <p>Spearheaded multiple successful projects and mentored junior developers.</p>
                
                <p><strong>Startup Inc.</strong> - Junior Developer (2017-2019)</p>
                <p>Gained valuable experience in agile development and team collaboration.</p>
            </div>
            
            <div class="section">
                <div class="section-title">Academic Background</div>
                <p><strong>University of Technology</strong> - Bachelor of Science in Computer Science</p>
                <p>Graduated with honors, focusing on software engineering and web technologies.</p>
            </div>
        `;
    }
    
    applyCustomStyles() {
        // Apply custom CSS variables for colors
        this.dom.resumeContent.style.setProperty('--resume-primary', this.resumeData.design.primaryColor);
        this.dom.resumeContent.style.setProperty('--resume-secondary', this.resumeData.design.secondaryColor);
        
        // Apply font
        this.dom.resumeContent.style.fontFamily = this.resumeData.design.font;
        
        // Apply layout
        this.dom.resumeContent.classList.remove('single-column', 'two-column', 'sidebar');
        this.dom.resumeContent.classList.add(this.resumeData.design.layout);
    }
    
    // Auto-save functionality
    autoSave(section) {
        // Update save status
        this.dom.saveStatus.innerHTML = '<i class="fas fa-sync-alt"></i> Saving...';
        
        // Clear previous timeout
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        // Set new timeout
        this.autoSaveTimeout = setTimeout(() => {
            this.saveToLocalStorage();
            this.updatePreview();
            
            // Update save status
            this.dom.saveStatus.innerHTML = '<i class="fas fa-check-circle"></i> Auto-saved';
            
            // Show toast notification
            this.showToast('Resume saved successfully!');
        }, 1000);
    }
    
    saveToLocalStorage() {
        // Convert data to string and save
        localStorage.setItem('resumeBuilderData', JSON.stringify(this.resumeData));
    }
    
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('resumeBuilderData');
        
        if (savedData) {
            this.resumeData = JSON.parse(savedData);
            
            // Populate form fields
            this.populateFormFields();
            
            // Update design controls
            this.updateDesignControls();
        } else {
            // Load sample data for first-time users
            this.loadSampleData();
        }
    }
    
    populateFormFields() {
        const { personal } = this.resumeData;
        
        this.dom.fullName.value = personal.name || '';
        this.dom.jobTitle.value = personal.title || '';
        this.dom.email.value = personal.email || '';
        this.dom.phone.value = personal.phone || '';
        this.dom.location.value = personal.location || '';
        this.dom.summary.value = personal.summary || '';
        this.dom.linkedin.value = personal.linkedin || '';
        this.dom.github.value = personal.github || '';
    }
    
    updateDesignControls() {
        const { design } = this.resumeData;
        
        // Update template selection
        this.dom.templateOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.template === design.template);
        });
        
        // Update color pickers
        this.dom.colorPrimary.value = design.primaryColor;
        this.dom.colorSecondary.value = design.secondaryColor;
        
        // Update select elements
        this.dom.fontSelect.value = design.font;
        this.dom.layoutSelect.value = design.layout;
        this.dom.showPhoto.checked = design.showPhoto;
    }
    
    loadSampleData() {
        // Sample personal data
        this.resumeData.personal = {
            name: 'Alex Johnson',
            title: 'Senior Software Developer',
            email: 'alex.johnson@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            summary: 'Experienced software developer with 5+ years in web application development. Specialized in JavaScript frameworks and cloud technologies. Passionate about creating efficient, scalable solutions.',
            linkedin: 'linkedin.com/in/alexjohnson',
            github: 'github.com/alexjohnson'
        };
        
        // Sample experience
        this.resumeData.experience = [
            {
                id: '1',
                title: 'Senior Software Developer',
                company: 'Tech Corp Inc.',
                startDate: '2019-06',
                endDate: null,
                current: true,
                location: 'San Francisco, CA',
                description: 'Led a team of 5 developers in building scalable web applications. Improved application performance by 40% through code optimization and caching strategies.'
            },
            {
                id: '2',
                title: 'Junior Developer',
                company: 'Startup Inc.',
                startDate: '2017-03',
                endDate: '2019-05',
                current: false,
                location: 'Austin, TX',
                description: 'Developed responsive web interfaces using React.js. Collaborated with UX designers to implement user-friendly features.'
            }
        ];
        
        // Sample skills
        this.resumeData.skills = [
            { id: '1', name: 'JavaScript', category: 'Technical', level: 4 },
            { id: '2', name: 'React.js', category: 'Technical', level: 4 },
            { id: '3', name: 'Node.js', category: 'Technical', level: 3 },
            { id: '4', name: 'Python', category: 'Technical', level: 3 },
            { id: '5', name: 'Team Leadership', category: 'Soft', level: 4 },
            { id: '6', name: 'Problem Solving', category: 'Soft', level: 4 }
        ];
        
        // Populate form with sample data
        this.populateFormFields();
    }
    
    clearModalForms() {
        this.editingExperienceId = null;
        this.editingSkillId = null;
        
        // Clear modal forms
        document.getElementById('experience-form').reset();
        document.getElementById('skill-form').reset();
    }
    
    // PDF Export
    async exportToPDF() {
        this.showToast('Generating PDF...');
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Get resume element
            const resumeElement = this.dom.resumeContent;
            
            // Use html2canvas to capture the resume
            const canvas = await html2canvas(resumeElement, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            // Convert canvas to image
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate dimensions
            const imgWidth = 190; // A4 width in mm minus margins
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add image to PDF
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            
            // Save the PDF
            pdf.save('resume.pdf');
            
            this.showToast('PDF exported successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Error exporting PDF. Please try again.', 'error');
        }
    }
    
    // Zoom controls
    adjustZoom(amount) {
        this.currentZoom += amount;
        
        // Limit zoom range
        if (this.currentZoom < 50) this.currentZoom = 50;
        if (this.currentZoom > 200) this.currentZoom = 200;
        
        // Apply zoom
        const scale = this.currentZoom / 100;
        this.dom.resumePreview.style.transform = `scale(${scale})`;
        this.dom.zoomLevel.textContent = `${this.currentZoom}%`;
    }
    
    // Reset functionality
    resetResume() {
        if (confirm('Are you sure you want to reset your resume? All unsaved changes will be lost.')) {
            localStorage.removeItem('resumeBuilderData');
            this.resumeData = {
                personal: {
                    name: '',
                    title: '',
                    email: '',
                    phone: '',
                    location: '',
                    summary: '',
                    linkedin: '',
                    github: ''
                },
                experience: [],
                education: [],
                skills: [],
                projects: [],
                design: {
                    template: 'modern',
                    primaryColor: '#3a86ff',
                    secondaryColor: '#03045e',
                    font: "'Segoe UI', sans-serif",
                    layout: 'single-column',
                    showPhoto: false
                }
            };
            
            // Reset form fields
            this.populateFormFields();
            this.updateDesignControls();
            
            // Clear lists
            this.renderExperienceList();
            this.renderEducationList();
            this.renderSkills();
            this.renderProjects();
            
            // Update preview
            this.updatePreview();
            
            this.showToast('Resume reset to default');
        }
    }
    
    // Toast notifications
    showToast(message, type = 'success') {
        this.dom.toastMessage.textContent = message;
        
        // Update icon based on type
        const icon = this.dom.toast.querySelector('i');
        if (type === 'error') {
            icon.className = 'fas fa-exclamation-circle';
            icon.style.color = '#ef476f';
        } else {
            icon.className = 'fas fa-check-circle';
            icon.style.color = '#06d6a0';
        }
        
        this.dom.toast.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.dom.toast.style.display = 'none';
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.resumeBuilder = new ResumeBuilder();
});