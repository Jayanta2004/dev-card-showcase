// ==================== MISTAKES DATABASE ====================
const mistakesData = [
    {
        id: 1,
        title: "Confirmation Bias",
        category: "logic",
        difficulty: "intermediate",
        description: "The tendency to search for, interpret, favor, and recall information in a way that confirms one's preexisting beliefs.",
        why: [
            "Reduces cognitive dissonance",
            "Saves mental energy",
            "Protects self-esteem"
        ],
        avoid: [
            "Actively seek disconfirming evidence",
            "Practice 'consider the opposite'",
            "Engage with diverse perspectives"
        ],
        reflectionPrompts: [
            "When did you last dismiss contradictory evidence?",
            "What beliefs might you defend without good reason?",
            "How can you seek opposing viewpoints today?"
        ]
    },
    {
        id: 2,
        title: "Procrastination",
        category: "daily",
        difficulty: "beginner",
        description: "Delaying important tasks despite expecting negative consequences.",
        why: [
            "Avoid immediate discomfort",
            "Overestimate future motivation",
            "Task aversion"
        ],
        avoid: [
            "Break tasks into smaller chunks",
            "Use the 2-minute rule",
            "Eliminate distractions first"
        ],
        reflectionPrompts: [
            "What task are you avoiding right now?",
            "What's the real fear behind this procrastination?",
            "What's the smallest step you could take today?"
        ]
    },
    {
        id: 3,
        title: "Dunning-Kruger Effect",
        category: "logic",
        difficulty: "advanced",
        description: "Overestimating one's knowledge and competence in areas where expertise is lacking.",
        why: [
            "Lack of meta-cognitive awareness",
            "Incomplete knowledge prevents self-assessment",
            "Confidence from initial learning"
        ],
        avoid: [
            "Seek feedback regularly",
            "Study deeply, not superficially",
            "Acknowledge the vastness of your ignorance"
        ],
        reflectionPrompts: [
            "Where do you overestimate your abilities?",
            "What areas need deeper learning?",
            "Who can provide honest feedback?"
        ]
    },
    {
        id: 4,
        title: "Anchoring Bias",
        category: "logic",
        difficulty: "intermediate",
        description: "Relying too heavily on the first piece of information encountered when making decisions.",
        why: [
            "First impressions stick",
            "Mental shortcuts",
            "Limited cognitive resources"
        ],
        avoid: [
            "Seek multiple reference points",
            "Question initial assumptions",
            "Consider alternative anchors"
        ],
        reflectionPrompts: [
            "What first numbers influenced your recent decisions?",
            "How can you check if you're anchored?",
            "What other perspectives exist?"
        ]
    },
    {
        id: 5,
        title: "Analysis Paralysis",
        category: "study",
        difficulty: "intermediate",
        description: "Overthinking a decision to the point where no action is taken.",
        why: [
            "Fear of making wrong choice",
            "Too many options",
            "Information overload"
        ],
        avoid: [
            "Set decision deadlines",
            "Accept 'good enough' solutions",
            "Learn from mistakes"
        ],
        reflectionPrompts: [
            "What decision are you stuck on?",
            "What's the worst realistic outcome?",
            "When do you need to decide?"
        ]
    },
    {
        id: 6,
        title: "The Spotlight Effect",
        category: "relationships",
        difficulty: "beginner",
        description: "Overestimating how much others notice your appearance and behavior.",
        why: [
            "Self-focused attention",
            "Egocentric bias",
            "Anxiety amplification"
        ],
        avoid: [
            "Remember others are self-focused",
            "Most will forget your mistake",
            "Most people are kind"
        ],
        reflectionPrompts: [
            "What moment are you replaying?",
            "Do you remember others' mistakes?",
            "Who's really judging you?"
        ]
    },
    {
        id: 7,
        title: "Sunken Cost Fallacy",
        category: "work",
        difficulty: "intermediate",
        description: "Continuing investment in something because of past investment, regardless of current value.",
        why: [
            "Loss aversion",
            "Justifying past decisions",
            "Emotional attachment"
        ],
        avoid: [
            "Focus on future value only",
            "Ignore past investments",
            "Ask: 'Would I start this today?'"
        ],
        reflectionPrompts: [
            "What are you stuck with because of past investment?",
            "Would you choose it fresh today?",
            "What would you do if you started over?"
        ]
    },
    {
        id: 8,
        title: "The Planning Fallacy",
        category: "work",
        difficulty: "intermediate",
        description: "Underestimating the time, costs, and risks of future actions.",
        why: [
            "Optimism bias",
            "Neglecting past experiences",
            "Task complexity underestimation"
        ],
        avoid: [
            "Reference past similar projects",
            "Add buffer time (1.5-2x estimate)",
            "Break down all sub-tasks"
        ],
        reflectionPrompts: [
            "How accurate are your time estimates?",
            "What always takes longer?",
            "What's your realistic buffer?"
        ]
    },
    {
        id: 9,
        title: "Availability Heuristic",
        category: "logic",
        difficulty: "beginner",
        description: "Judging likelihood based on how easily examples come to mind.",
        why: [
            "Media sensationalism",
            "Recent events bias",
            "Emotional memorability"
        ],
        avoid: [
            "Check actual statistics",
            "Distinguish vivid from common",
            "Consider base rates"
        ],
        reflectionPrompts: [
            "What recent event influences your fear?",
            "What are the actual odds?",
            "Are dramatic cases representative?"
        ]
    },
    {
        id: 10,
        title: "Impostor Syndrome",
        category: "relationships",
        difficulty: "intermediate",
        description: "Doubting your accomplishments and fearing being exposed as a fraud.",
        why: [
            "Comparing to invisible standards",
            "Attributing success to luck",
            "Fear of failure"
        ],
        avoid: [
            "Document your achievements",
            "Recognize effort required",
            "Accept you're still learning"
        ],
        reflectionPrompts: [
            "What accomplishment do you doubt?",
            "Who had to help get you here?",
            "If you're a fraud, what's evidence?"
        ]
    }
];

// ==================== STATE MANAGEMENT ====================
let currentView = 'grid';
let currentFilter = 'all';
let currentSearch = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    renderGallery(mistakesData);
    setupEventListeners();
    updateFavoritesCount();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            filterAndRender();
        });
    });

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
        filterAndRender();
    });

    // View controls
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentView = this.dataset.view;
            updateGalleryView();
        });
    });

    // Modal controls
    const modal = document.getElementById('reflection-modal');
    const closeBtn = document.querySelector('.close-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    closeBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.getElementById('save-reflection-btn').addEventListener('click', saveReflection);
}

// ==================== FILTERING & RENDERING ====================
function filterAndRender() {
    let filtered = mistakesData.filter(mistake => {
        const matchesCategory = currentFilter === 'all' || mistake.category === currentFilter;
        const matchesSearch = currentSearch === '' || 
                            mistake.title.toLowerCase().includes(currentSearch) ||
                            mistake.description.toLowerCase().includes(currentSearch);
        return matchesCategory && matchesSearch;
    });

    renderGallery(filtered);
}

function renderGallery(data) {
    const gallery = document.getElementById('exhibit-gallery');
    gallery.innerHTML = '';

    if (data.length === 0) {
        gallery.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No mistakes found matching your criteria.</div>';
        return;
    }

    data.forEach(mistake => {
        const card = createExhibitCard(mistake);
        gallery.appendChild(card);
    });
}

function createExhibitCard(mistake) {
    const card = document.createElement('div');
    card.className = 'exhibit-card';
    card.dataset.mistakeId = mistake.id;

    const isFavorite = favorites.includes(mistake.id);
    const saveButtonClass = isFavorite ? 'saved' : '';

    card.innerHTML = `
        <div class="card-header">
            <span class="category-badge ${mistake.category}">${mistake.category.charAt(0).toUpperCase() + mistake.category.slice(1)}</span>
            <span class="prevalence-badge">⚠️ ${mistake.difficulty.charAt(0).toUpperCase() + mistake.difficulty.slice(1)}</span>
        </div>
        
        <h3 class="exhibit-title">${mistake.title}</h3>
        
        <div class="exhibit-content">
            <p class="mistake-description">${mistake.description}</p>
            
            <div class="why-happens">
                <h4>🧠 Why It Happens:</h4>
                <ul>
                    ${mistake.why.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            
            <div class="how-to-avoid">
                <h4>🛡️ How to Avoid:</h4>
                <ul>
                    ${mistake.avoid.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
        
        <div class="card-footer">
            <button class="reflection-btn" data-mistake-id="${mistake.id}">💭 Reflect</button>
            <div class="exhibit-meta">
                <button class="save-btn ${saveButtonClass}" data-mistake-id="${mistake.id}" title="Save to favorites">⭐</button>
            </div>
        </div>
    `;

    // Add event listeners
    card.querySelector('.reflection-btn').addEventListener('click', () => {
        openReflectionModal(mistake);
    });

    card.querySelector('.save-btn').addEventListener('click', (e) => {
        toggleFavorite(mistake.id, e.target);
    });

    return card;
}

function updateGalleryView() {
    const gallery = document.getElementById('exhibit-gallery');
    if (currentView === 'list') {
        gallery.classList.add('list-view');
    } else {
        gallery.classList.remove('list-view');
    }
}

// ==================== FAVORITES ====================
function toggleFavorite(mistakeId, btn) {
    if (favorites.includes(mistakeId)) {
        favorites = favorites.filter(id => id !== mistakeId);
        btn.classList.remove('saved');
    } else {
        favorites.push(mistakeId);
        btn.classList.add('saved');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    document.getElementById('favorites-count').textContent = favorites.length;
}

// ==================== REFLECTION MODAL ====================
let currentMistakeForReflection = null;

function openReflectionModal(mistake) {
    currentMistakeForReflection = mistake;
    const modal = document.getElementById('reflection-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const reflectionPrompts = document.getElementById('reflection-prompts');

    modalTitle.textContent = `Reflecting on: ${mistake.title}`;
    modalDescription.textContent = mistake.description;

    reflectionPrompts.innerHTML = mistake.reflectionPrompts
        .map(prompt => `<li>${prompt}</li>`)
        .join('');

    // Load existing reflection if any
    const saved = localStorage.getItem(`reflection-${mistake.id}`);
    document.getElementById('reflection-text').value = saved || '';

    modal.classList.add('show');
}

function closeModal() {
    document.getElementById('reflection-modal').classList.remove('show');
    currentMistakeForReflection = null;
}

function saveReflection() {
    if (!currentMistakeForReflection) return;

    const reflectionText = document.getElementById('reflection-text').value;
    localStorage.setItem(
        `reflection-${currentMistakeForReflection.id}`,
        reflectionText
    );

    // Show success feedback
    const btn = document.getElementById('save-reflection-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Saved!';
    btn.style.background = 'var(--success)';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        closeModal();
    }, 1500);
}

// ==================== UTILITIES ====================
// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}, observerOptions);

// Update mistake count (in case it's different from data length)
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('mistake-count').textContent = mistakesData.length;
});