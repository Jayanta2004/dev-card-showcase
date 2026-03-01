// Community Gratitude Wall - Main JavaScript

// Data Storage
let gratitudeNotes = [];
let currentFilter = 'all';

// Note rotations for visual variety
const rotations = [-2, -1, 0, 1, 2, -3, 3];

// Sample Notes (for demo purposes)
const sampleNotes = [
    {
        id: 1,
        recipient: 'My Mother',
        message: 'Thank you for always believing in me, even when I didn\'t believe in myself. Your endless support and unconditional love gave me the strength to chase my dreams.',
        author: 'Sarah K.',
        color: 'pink',
        likes: 47,
        likedBy: [],
        comments: [],
        featured: true,
        timestamp: Date.now() - 3600000 * 5
    },
    {
        id: 2,
        recipient: 'Dr. Martinez',
        message: 'Your patience and compassion during my recovery made all the difference. You didn\'t just treat my illness - you cared about me as a person. Thank you for being an amazing doctor!',
        author: 'Anonymous',
        color: 'blue',
        likes: 32,
        likedBy: [],
        comments: [],
        featured: false,
        timestamp: Date.now() - 3600000 * 12
    },
    {
        id: 3,
        recipient: 'The Coffee Shop Staff',
        message: 'You remember my order, ask about my day, and make me feel welcome every single morning. Thank you for brightening my days with your kindness!',
        author: 'Mike',
        color: 'yellow',
        likes: 28,
        likedBy: [],
        comments: [],
        featured: true,
        timestamp: Date.now() - 3600000 * 24
    },
    {
        id: 4,
        recipient: 'My Best Friend',
        message: 'Thank you for listening without judgment, for making me laugh when I wanted to cry, and for being there through every up and down. You\'re the best friend anyone could ask for!',
        author: 'Emily R.',
        color: 'purple',
        likes: 56,
        likedBy: [],
        comments: [],
        featured: true,
        timestamp: Date.now() - 3600000 * 36
    },
    {
        id: 5,
        recipient: 'My Teacher, Ms. Johnson',
        message: 'You saw potential in me when others didn\'t. Thank you for pushing me to be better and for never giving up on me. You changed my life!',
        author: 'Alex',
        color: 'green',
        likes: 41,
        likedBy: [],
        comments: [],
        featured: false,
        timestamp: Date.now() - 3600000 * 48
    },
    {
        id: 6,
        recipient: 'The Stranger on the Bus',
        message: 'You gave up your seat for an elderly person without hesitation. That simple act of kindness reminded me that good people still exist. Thank you for being one of them!',
        author: 'Anonymous',
        color: 'orange',
        likes: 19,
        likedBy: [],
        comments: [],
        featured: false,
        timestamp: Date.now() - 3600000 * 60
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    setupEventListeners();
    renderNotes();
    updateStats();
});

// Load Data from LocalStorage
function loadData() {
    const savedNotes = localStorage.getItem('gratitudeNotes');
    if (savedNotes) {
        gratitudeNotes = JSON.parse(savedNotes);
    } else {
        gratitudeNotes = [...sampleNotes];
        saveData();
    }
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('gratitudeNotes', JSON.stringify(gratitudeNotes));
}

// Setup Event Listeners
function setupEventListeners() {
    // Add Note Buttons
    document.getElementById('addNoteBtn').addEventListener('click', openAddNoteModal);
    document.getElementById('fabBtn').addEventListener('click', openAddNoteModal);
    
    // Modal Close
    document.getElementById('closeAddModal').addEventListener('click', closeAddNoteModal);
    document.getElementById('cancelBtn').addEventListener('click', closeAddNoteModal);
    document.getElementById('closeViewModal').addEventListener('click', closeViewNoteModal);
    
    // Click outside modal to close
    document.getElementById('addNoteModal').addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('modal-overlay')) {
            closeAddNoteModal();
        }
    });
    document.getElementById('viewNoteModal').addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('modal-overlay')) {
            closeViewNoteModal();
        }
    });
    
    // Form Submit
    document.getElementById('noteForm').addEventListener('submit', handleFormSubmit);
    
    // Character Counter
    document.getElementById('noteMessage').addEventListener('input', updateCharCounter);
    
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderNotes();
        });
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', function() {
        renderNotes(this.value);
    });
}

// Update Character Counter
function updateCharCounter() {
    const count = this.value.length;
    document.getElementById('charCount').textContent = count;
}

// Open Add Note Modal
function openAddNoteModal() {
    document.getElementById('addNoteModal').classList.add('active');
    document.getElementById('recipientName').focus();
}

// Close Add Note Modal
function closeAddNoteModal() {
    document.getElementById('addNoteModal').classList.remove('active');
    document.getElementById('noteForm').reset();
    document.getElementById('charCount').textContent = '0';
}

// Close View Note Modal
function closeViewNoteModal() {
    document.getElementById('viewNoteModal').classList.remove('active');
}

// Handle Form Submit
function handleFormSubmit(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('recipientName').value.trim();
    const message = document.getElementById('noteMessage').value.trim();
    const author = document.getElementById('authorName').value.trim() || 'Anonymous';
    const color = document.querySelector('input[name="noteColor"]:checked').value;
    
    if (!recipient || !message) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const newNote = {
        id: Date.now(),
        recipient: recipient,
        message: message,
        author: author,
        color: color,
        likes: 0,
        likedBy: [],
        comments: [],
        featured: false,
        timestamp: Date.now()
    };
    
    gratitudeNotes.unshift(newNote);
    saveData();
    renderNotes();
    updateStats();
    closeAddNoteModal();
    showSuccessPopup();
}

// Render Notes
function renderNotes(searchQuery = '') {
    const wall = document.getElementById('gratitudeWall');
    const emptyState = document.getElementById('emptyState');
    const featuredSection = document.getElementById('featuredSection');
    const featuredCarousel = document.getElementById('featuredCarousel');
    
    // Filter notes
    let filteredNotes = gratitudeNotes.filter(note => {
        // Filter by category
        if (currentFilter === 'featured' && !note.featured) return false;
        if (currentFilter === 'recent') {
            const hoursDiff = (Date.now() - note.timestamp) / 3600000;
            if (hoursDiff > 24) return false;
        }
        if (currentFilter === 'popular' && note.likes < 20) return false;
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return note.recipient.toLowerCase().includes(query) ||
                   note.message.toLowerCase().includes(query) ||
                   note.author.toLowerCase().includes(query);
        }
        
        return true;
    });
    
    // Sort
    if (currentFilter === 'popular') {
        filteredNotes.sort((a, b) => b.likes - a.likes);
    } else if (currentFilter === 'recent') {
        filteredNotes.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Show/hide empty state
    if (filteredNotes.length === 0) {
        wall.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } else {
        wall.style.display = 'grid';
        emptyState.style.display = 'none';
    }
    
    // Render featured notes
    const featuredNotes = gratitudeNotes.filter(n => n.featured).slice(0, 3);
    if (featuredNotes.length > 0 && currentFilter === 'all') {
        featuredSection.style.display = 'block';
        featuredCarousel.innerHTML = featuredNotes.map((note, index) => 
            createNoteCard(note, index)
        ).join('');
    } else {
        featuredSection.style.display = 'none';
    }
    
    // Render main wall
    wall.innerHTML = filteredNotes.map((note, index) => 
        createNoteCard(note, index)
    ).join('');
    
    // Add event listeners to note cards
    attachNoteEventListeners();
}

// Create Note Card HTML
function createNoteCard(note, index) {
    const rotation = rotations[index % rotations.length];
    const isLongMessage = note.message.length > 150;
    
    return `
        <div class="note-card ${note.color} ${note.featured ? 'featured' : ''}" 
             style="--rotation: ${rotation}deg;"
             data-note-id="${note.id}">
            <div class="note-header">
                <div class="note-to">To:</div>
                <div class="note-recipient">${escapeHtml(note.recipient)}</div>
            </div>
            <div class="note-message ${isLongMessage ? 'long' : ''}">
                ${escapeHtml(note.message)}
            </div>
            <div class="note-author">
                — ${escapeHtml(note.author)}
            </div>
            <div class="note-footer">
                <div class="note-actions">
                    <button class="note-action-btn like-btn ${note.likedBy.includes('current-user') ? 'liked' : ''}" 
                            onclick="toggleLike(${note.id}); event.stopPropagation();">
                        <i class="fas fa-heart"></i>
                        <span>${note.likes}</span>
                    </button>
                    <button class="note-action-btn" onclick="openViewNoteModal(${note.id}); event.stopPropagation();">
                        <i class="fas fa-comment"></i>
                        <span>${note.comments.length}</span>
                    </button>
                </div>
                <div class="note-timestamp">${getTimeAgo(note.timestamp)}</div>
            </div>
        </div>
    `;
}

// Attach Event Listeners to Note Cards
function attachNoteEventListeners() {
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', function() {
            const noteId = parseInt(this.dataset.noteId);
            openViewNoteModal(noteId);
        });
    });
}

// Toggle Like
function toggleLike(noteId) {
    const note = gratitudeNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const userId = 'current-user'; // In a real app, this would be the actual user ID
    const likeIndex = note.likedBy.indexOf(userId);
    
    if (likeIndex > -1) {
        note.likedBy.splice(likeIndex, 1);
        note.likes--;
    } else {
        note.likedBy.push(userId);
        note.likes++;
    }
    
    saveData();
    renderNotes();
    updateStats();
}

// Open View Note Modal
function openViewNoteModal(noteId) {
    const note = gratitudeNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const modal = document.getElementById('viewNoteModal');
    const content = document.getElementById('noteDetailContent');
    
    content.innerHTML = `
        <div class="note-detail">
            <div class="note-detail-header">
                <div class="note-to" style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 5px;">To:</div>
                <div class="note-detail-recipient">${escapeHtml(note.recipient)}</div>
            </div>
            <div class="note-detail-message ${note.color}">
                ${escapeHtml(note.message)}
            </div>
            <div class="note-detail-author">
                — ${escapeHtml(note.author)}
            </div>
            <div class="note-detail-footer">
                <div class="note-detail-actions">
                    <button class="note-action-btn ${note.likedBy.includes('current-user') ? 'liked' : ''}" 
                            onclick="toggleLike(${note.id})">
                        <i class="fas fa-heart"></i>
                        <span>${note.likes} Likes</span>
                    </button>
                    <button class="note-action-btn" onclick="toggleFeatured(${note.id})">
                        <i class="fas fa-star"></i>
                        <span>${note.featured ? 'Unfeatured' : 'Feature'}</span>
                    </button>
                </div>
                <div class="note-timestamp">${getTimeAgo(note.timestamp)}</div>
            </div>
            <div class="comments-section">
                <h3><i class="fas fa-comments"></i> Comments (${note.comments.length})</h3>
                <div class="comments-list">
                    ${note.comments.length > 0 ? 
                        note.comments.map(comment => `
                            <div class="comment">
                                <div class="comment-author">${escapeHtml(comment.author)}</div>
                                <div class="comment-text">${escapeHtml(comment.text)}</div>
                            </div>
                        `).join('') : 
                        '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>'
                    }
                </div>
                <div style="margin-top: 20px;">
                    <form onsubmit="addComment(${note.id}, event)" style="display: flex; gap: 10px;">
                        <input type="text" placeholder="Add a comment..." 
                               style="flex: 1; padding: 12px; border: 2px solid var(--border); border-radius: 50px; font-size: 1rem;"
                               required>
                        <button type="submit" class="btn-primary" style="border-radius: 50px;">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

// Toggle Featured
function toggleFeatured(noteId) {
    const note = gratitudeNotes.find(n => n.id === noteId);
    if (!note) return;
    
    note.featured = !note.featured;
    saveData();
    renderNotes();
    openViewNoteModal(noteId); // Refresh the modal
}

// Add Comment
function addComment(noteId, event) {
    event.preventDefault();
    
    const note = gratitudeNotes.find(n => n.id === noteId);
    if (!note) return;
    
    const input = event.target.querySelector('input');
    const commentText = input.value.trim();
    
    if (!commentText) return;
    
    const newComment = {
        id: Date.now(),
        author: 'Anonymous', // In a real app, use actual username
        text: commentText,
        timestamp: Date.now()
    };
    
    note.comments.push(newComment);
    saveData();
    renderNotes();
    openViewNoteModal(noteId); // Refresh the modal
}

// Update Stats
function updateStats() {
    const totalNotes = gratitudeNotes.length;
    const totalLikes = gratitudeNotes.reduce((sum, note) => sum + note.likes, 0);
    const totalUsers = new Set(gratitudeNotes.map(n => n.author)).size;
    
    document.getElementById('totalNotes').textContent = totalNotes;
    document.getElementById('totalLikes').textContent = totalLikes;
    document.getElementById('totalUsers').textContent = totalUsers;
}

// Show Success Popup
function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.add('active');
    
    setTimeout(() => {
        popup.classList.remove('active');
    }, 2000);
}

// Get Time Ago
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.toggleLike = toggleLike;
window.openViewNoteModal = openViewNoteModal;
window.toggleFeatured = toggleFeatured;
window.addComment = addComment;

// Log success
console.log('💝 Community Gratitude Wall loaded successfully!');
console.log(`📝 ${gratitudeNotes.length} gratitude notes on the wall`);
