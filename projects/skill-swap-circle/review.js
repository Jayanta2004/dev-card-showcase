// Review/rating logic
const reviewForm = document.getElementById('reviewForm');
const reviewList = document.getElementById('reviewList');
//done odne 
reviewForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const partner = reviewForm.partner.value;
    const review = reviewForm.review.value;
    const rating = reviewForm.rating.value;
    const entry = { partner, review, rating };
    let reviews = JSON.parse(localStorage.getItem('skillSwapReviews') || '[]');
    reviews.push(entry);
    localStorage.setItem('skillSwapReviews', JSON.stringify(reviews));
    showReviews(reviews);
    reviewForm.reset();
});

function showReviews(reviews) {
    if (reviews.length === 0) {
        reviewList.innerHTML = '<p>No reviews yet.</p>';
        return;
    }
    reviewList.innerHTML = '<ul>' + reviews.map(r => `<li><strong>${r.partner}</strong>: ${r.review} (Rating: ${r.rating}/5)</li>`).join('') + '</ul>';
}

window.onload = function() {
    const reviews = JSON.parse(localStorage.getItem('skillSwapReviews') || '[]');
    showReviews(reviews);
};