// Sample reviews data
let reviews = [
    {
        id: 1,
        name: "Alex Johnson",
        rating: 5,
        title: "Excellent Product!",
        content: "This product exceeded my expectations. The quality is outstanding and it works perfectly. Highly recommended!",
        date: "2023-11-15",
        avatar: "AJ"
    },
    {
        id: 2,
        name: "Sarah Miller",
        rating: 4,
        title: "Very Good Quality",
        content: "Good value for money. Works as described with minor issues that don't affect overall performance.",
        date: "2023-11-12",
        avatar: "SM"
    },
    {
        id: 3,
        name: "Mike Chen",
        rating: 5,
        title: "Best Purchase This Year",
        content: "I've been using this for a month now and it's been fantastic. The build quality is impressive.",
        date: "2023-11-10",
        avatar: "MC"
    },
    {
        id: 4,
        name: "Emma Wilson",
        rating: 3,
        title: "Average Experience",
        content: "It's okay for the price, but I expected better based on the reviews. Does the job but nothing special.",
        date: "2023-11-08",
        avatar: "EW"
    },
    {
        id: 5,
        name: "David Brown",
        rating: 5,
        title: "Perfect for My Needs",
        content: "Exactly what I was looking for. Easy to use and very reliable. Would buy again!",
        date: "2023-11-05",
        avatar: "DB"
    }
];

// DOM Elements
const stars = document.querySelectorAll('#stars i');
const ratingText = document.getElementById('ratingText');
const submitReviewBtn = document.getElementById('submitReview');
const reviewsContainer = document.getElementById('reviewsContainer');
const averageRating = document.getElementById('averageRating');
const totalReviews = document.getElementById('totalReviews');
const todayReviews = document.getElementById('todayReviews');

// Rating state
let userRating = 0;
let isRatingSelected = false;

// Rating text mapping
const ratingTexts = {
    1: { text: "Poor", class: "bad" },
    2: { text: "Fair", class: "poor" },
    3: { text: "Average", class: "average" },
    4: { text: "Good", class: "good" },
    5: { text: "Excellent", class: "excellent" }
};

// Initialize the application
function init() {
    // Initialize star rating events
    initStarRating();
    
    // Load reviews
    loadReviews();
    
    // Update statistics
    updateStatistics();
    
    // Set up event listeners
    submitReviewBtn.addEventListener('click', submitReview);
}

// Initialize star rating interaction
function initStarRating() {
    stars.forEach(star => {
        // Hover effect
        star.addEventListener('mouseover', () => {
            if (!isRatingSelected) {
                const value = parseInt(star.getAttribute('data-value'));
                highlightStars(value);
                updateRatingText(value);
            }
        });
        
        // Click event
        star.addEventListener('click', () => {
            userRating = parseInt(star.getAttribute('data-value'));
            isRatingSelected = true;
            highlightStars(userRating);
            updateRatingText(userRating);
            
            // Add visual feedback
            star.classList.add('clicked');
            setTimeout(() => {
                star.classList.remove('clicked');
            }, 300);
        });
    });
    
    // Reset stars when mouse leaves (if no rating selected)
    document.getElementById('stars').addEventListener('mouseleave', () => {
        if (!isRatingSelected) {
            resetStars();
            ratingText.textContent = "Click to rate";
            ratingText.className = "rating-text";
        } else {
            highlightStars(userRating);
            updateRatingText(userRating);
        }
    });
}

// Highlight stars up to the given value
function highlightStars(value) {
    stars.forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        if (starValue <= value) {
            star.classList.remove('far');
            star.classList.add('fas', 'active');
        } else {
            star.classList.remove('fas', 'active');
            star.classList.add('far');
        }
    });
}

// Reset stars to empty state
function resetStars() {
    stars.forEach(star => {
        star.classList.remove('fas', 'active');
        star.classList.add('far');
    });
}

// Update rating text based on value
function updateRatingText(value) {
    if (value === 0) {
        ratingText.textContent = "Click to rate";
        ratingText.className = "rating-text";
        return;
    }
    
    const ratingInfo = ratingTexts[value];
    ratingText.textContent = `${value} Star${value > 1 ? 's' : ''} - ${ratingInfo.text}`;
    ratingText.className = `rating-text ${ratingInfo.class}`;
}

// Load and display reviews
function loadReviews() {
    reviewsContainer.innerHTML = '';
    
    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="no-reviews">
                <i class="far fa-star"></i>
                <h3>No Reviews Yet</h3>
                <p>Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    
    // Sort reviews by date (newest first)
    const sortedReviews = [...reviews].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Display each review
    sortedReviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        reviewsContainer.appendChild(reviewElement);
    });
}

// Create a review element
function createReviewElement(review) {
    const div = document.createElement('div');
    div.className = 'review-item';
    
    // Format date
    const date = new Date(review.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create stars HTML
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= review.rating) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    
    div.innerHTML = `
        <div class="review-header">
            <div class="reviewer-info">
                <div class="reviewer-avatar">${review.avatar}</div>
                <div class="reviewer-details">
                    <h4>${review.name}</h4>
                    <div class="review-date">${date}</div>
                </div>
            </div>
            <div class="review-stars">
                ${starsHTML}
            </div>
        </div>
        <h3 class="review-title">${review.title}</h3>
        <div class="review-content">${review.content}</div>
    `;
    
    return div;
}

// Submit a new review
function submitReview() {
    const title = document.getElementById('reviewTitle').value.trim();
    const content = document.getElementById('reviewText').value.trim();
    const name = document.getElementById('userName').value.trim() || 'Anonymous';
    
    // Validate inputs
    if (!userRating) {
        alert('Please select a star rating first!');
        return;
    }
    
    if (!title) {
        alert('Please enter a review title!');
        return;
    }
    
    if (!content) {
        alert('Please enter your review!');
        return;
    }
    
    // Create new review
    const newReview = {
        id: reviews.length + 1,
        name: name,
        rating: userRating,
        title: title,
        content: content,
        date: new Date().toISOString().split('T')[0], // Today's date
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    
    // Add to reviews array
    reviews.unshift(newReview);
    
    // Reset form
    resetForm();
    
    // Reload reviews
    loadReviews();
    
    // Update statistics
    updateStatistics();
    
    // Show success message
    showSuccessMessage();
}

// Reset the review form
function resetForm() {
    document.getElementById('reviewTitle').value = '';
    document.getElementById('reviewText').value = '';
    document.getElementById('userName').value = '';
    resetStars();
    userRating = 0;
    isRatingSelected = false;
    ratingText.textContent = 'Click to rate';
    ratingText.className = 'rating-text';
}

// Update statistics display
function updateStatistics() {
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '0.0';
    
    // Count today's reviews
    const today = new Date().toISOString().split('T')[0];
    const todaysCount = reviews.filter(review => review.date === today).length;
    
    // Update display
    averageRating.textContent = avgRating;
    totalReviews.textContent = reviews.length;
    todayReviews.textContent = todaysCount;
    
    // Update overall rating display
    document.querySelector('.rating-value').textContent = avgRating;
    document.querySelector('.rating-count').textContent = `(${reviews.length} reviews)`;
    
    // Update star display for average rating
    updateAverageStars(parseFloat(avgRating));
    
    // Update distribution (simplified - in a real app you'd calculate this)
    updateDistribution();
}

// Update average stars display
function updateAverageStars(rating) {
    const starsLarge = document.querySelectorAll('.stars-large i');
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    starsLarge.forEach((star, index) => {
        star.className = 'fas';
        
        if (index < fullStars) {
            star.classList.add('fa-star');
        } else if (index === fullStars && hasHalfStar) {
            star.classList.add('fa-star-half-alt');
        } else {
            star.classList.remove('fa-star', 'fa-star-half-alt');
            star.classList.add('fa-star');
            star.style.opacity = '0.3';
        }
    });
}

// Update distribution chart (simplified)
function updateDistribution() {
    // In a real app, you would calculate actual distribution
    // For this demo, we'll just animate the existing bars
    const distributionItems = document.querySelectorAll('.distribution-item');
    distributionItems.forEach(item => {
        const fill = item.querySelector('.distribution-fill');
        const currentWidth = fill.style.width;
        fill.style.width = '0%';
        
        setTimeout(() => {
            fill.style.width = currentWidth;
        }, 300);
    });
}

// Show success message
function showSuccessMessage() {
    const originalText = submitReviewBtn.innerHTML;
    submitReviewBtn.innerHTML = '<i class="fas fa-check"></i> Review Submitted!';
    submitReviewBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
    
    setTimeout(() => {
        submitReviewBtn.innerHTML = originalText;
        submitReviewBtn.style.background = 'linear-gradient(45deg, #FF8C00, #FFD700)';
    }, 2000);
}

// Add sample review button for testing
function addSampleReviewButton() {
    const sampleBtn = document.createElement('button');
    sampleBtn.className = 'btn';
    sampleBtn.id = 'sampleReviewBtn';
    sampleBtn.innerHTML = '<i class="fas fa-magic"></i> Add Sample Review';
    sampleBtn.style.marginTop = '10px';
    sampleBtn.style.background = '#6c757d';
    
    document.querySelector('.rating-form').appendChild(sampleBtn);
    
    sampleBtn.addEventListener('click', () => {
        // Auto-fill form with sample data
        document.getElementById('reviewTitle').value = 'Great Product!';
        document.getElementById('reviewText').value = 'This is an automatically generated sample review to demonstrate the rating system functionality.';
        document.getElementById('userName').value = 'Sample User';
        
        // Set a random rating
        const randomRating = Math.floor(Math.random() * 5) + 1;
        userRating = randomRating;
        isRatingSelected = true;
        highlightStars(randomRating);
        updateRatingText(randomRating);
        
        // Scroll to form
        document.querySelector('.rating-form').scrollIntoView({ behavior: 'smooth' });
    });
}

// Add keyboard shortcuts
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl + Enter to submit review
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            submitReview();
        }
        
        // Number keys 1-5 to set rating
        if (e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const rating = parseInt(e.key);
            userRating = rating;
            isRatingSelected = true;
            highlightStars(rating);
            updateRatingText(rating);
            
            // Focus on title input
            document.getElementById('reviewTitle').focus();
        }
        
        // Escape to reset rating
        if (e.key === 'Escape') {
            resetForm();
        }
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    init();
    addSampleReviewButton();
    addKeyboardShortcuts();
    
    // Add animation to stars on load
    stars.forEach((star, index) => {
        setTimeout(() => {
            star.style.transform = 'scale(1.2)';
            setTimeout(() => {
                star.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
});