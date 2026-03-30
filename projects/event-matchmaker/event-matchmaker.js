// event-matchmaker.js
// Local Event Matchmaker logic

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('preferences-form');
    const interestsInput = document.getElementById('interests');
    const budgetInput = document.getElementById('budget');
    const freeTimeInput = document.getElementById('free-time');
    const eventsOutput = document.getElementById('events-output');

    // Sample event database (expanded)
    const events = [
        { name: 'Tech Meetup', category: 'tech', price: 0, time: 'Sat 7-9pm', location: 'Downtown', description: 'Networking and talks.' },
        { name: 'Live Concert', category: 'music', price: 25, time: 'Sat 6-8pm', location: 'City Hall', description: 'Local bands performing.' },
        { name: 'Soccer Game', category: 'sports', price: 15, time: 'Sun 3-5pm', location: 'Stadium', description: 'Watch local teams play.' },
        { name: 'Art Workshop', category: 'art', price: 10, time: 'Sun 2-4pm', location: 'Art Center', description: 'Hands-on painting.' },
        { name: 'Food Festival', category: 'food', price: 5, time: 'Sat 6-9pm', location: 'Park', description: 'Tasting and fun.' },
        { name: 'Yoga Class', category: 'health', price: 8, time: 'Sun 10-11am', location: 'Wellness Studio', description: 'Relax and stretch.' },
        { name: 'Book Club', category: 'literature', price: 0, time: 'Sat 8-9pm', location: 'Library', description: 'Discuss your favorite books.' },
        { name: 'Coding Bootcamp', category: 'tech', price: 30, time: 'Sun 1-4pm', location: 'Tech Center', description: 'Learn coding basics.' },
        { name: 'Basketball Tournament', category: 'sports', price: 20, time: 'Sat 6-9pm', location: 'Sports Complex', description: 'Compete or watch.' },
        { name: 'Photography Walk', category: 'art', price: 12, time: 'Sun 2-5pm', location: 'City Park', description: 'Capture city sights.' }
    ];

    // Favorites feature
    let favorites = [];

    // Sort events by price or time
    function sortEvents(events, sortBy) {
        if (sortBy === 'price') {
            return [...events].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'time') {
            return [...events].sort((a, b) => a.time.localeCompare(b.time));
        }
        return events;
    }

    // Show event details modal
    function showEventDetails(event) {
        let modal = document.getElementById('event-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'event-modal';
            modal.style.position = 'fixed';
            modal.style.top = '50%';
            modal.style.left = '50%';
            modal.style.transform = 'translate(-50%, -50%)';
            modal.style.background = '#fff';
            modal.style.padding = '32px';
            modal.style.borderRadius = '12px';
            modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.15)';
            modal.style.zIndex = '9999';
            modal.style.maxWidth = '400px';
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
            <h2>${event.name}</h2>
            <p><strong>Category:</strong> ${event.category}</p>
            <p><strong>Price:</strong> $${event.price}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p>${event.description}</p>
            <button id="close-modal">Close</button>
        `;
        document.getElementById('close-modal').onclick = () => modal.remove();
    }

    // Add event to favorites
    function addToFavorites(event) {
        if (!favorites.some(f => f.name === event.name)) {
            favorites.push(event);
            alert(`Added '${event.name}' to favorites!`);
        }
    }

    // Render favorites
    function renderFavorites() {
        let favDiv = document.getElementById('favorites-output');
        if (!favDiv) {
            favDiv = document.createElement('div');
            favDiv.id = 'favorites-output';
            favDiv.style.marginTop = '24px';
            eventsOutput.parentNode.appendChild(favDiv);
        }
        if (favorites.length === 0) {
            favDiv.innerHTML = '<em>No favorites yet.</em>';
        } else {
            favDiv.innerHTML = '<h3>Your Favorites</h3>' + favorites.map(event => `
                <div class="event-card">
                    <h4>${event.name}</h4>
                    <p><strong>Category:</strong> ${event.category}</p>
                    <p><strong>Price:</strong> $${event.price}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                </div>
            `).join('');
        }
    }

    function matchEvents(interests, budget, freeTime) {
        interests = interests.toLowerCase().split(',').map(i => i.trim());
        freeTime = freeTime.toLowerCase();
        return events.filter(event => {
            const interestMatch = interests.some(interest => event.category.includes(interest));
            const budgetMatch = event.price <= budget;
            const timeMatch = freeTime.includes(event.time.toLowerCase());
            return interestMatch && budgetMatch && timeMatch;
        });
    }

    // Add sorting controls
    function addSortingControls() {
        let sortDiv = document.getElementById('sort-controls');
        if (!sortDiv) {
            sortDiv = document.createElement('div');
            sortDiv.id = 'sort-controls';
            sortDiv.style.marginBottom = '18px';
            eventsOutput.parentNode.insertBefore(sortDiv, eventsOutput);
        }
        sortDiv.innerHTML = `
            <label>Sort by:
                <select id="sort-select">
                    <option value="none">None</option>
                    <option value="price">Price</option>
                    <option value="time">Time</option>
                </select>
            </label>
        `;
        document.getElementById('sort-select').addEventListener('change', function() {
            form.dispatchEvent(new Event('submit'));
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const interests = interestsInput.value;
        const budget = parseFloat(budgetInput.value);
        const freeTime = freeTimeInput.value;
        let matched = matchEvents(interests, budget, freeTime);
        // Sorting
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect && sortSelect.value !== 'none') {
            matched = sortEvents(matched, sortSelect.value);
        }
        if (matched.length === 0) {
            eventsOutput.innerHTML = '<em>No matching events found. Try adjusting your preferences.</em>';
        } else {
            eventsOutput.innerHTML = matched.map(event => `
                <div class="event-card">
                    <h3>${event.name}</h3>
                    <p><strong>Category:</strong> ${event.category}</p>
                    <p><strong>Price:</strong> $${event.price}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                    <p>${event.description}</p>
                    <button class="details-btn">Details</button>
                    <button class="favorite-btn">Add to Favorites</button>
                </div>
            `).join('');
            // Add event listeners for details and favorites
            document.querySelectorAll('.details-btn').forEach((btn, idx) => {
                btn.onclick = () => showEventDetails(matched[idx]);
            });
            document.querySelectorAll('.favorite-btn').forEach((btn, idx) => {
                btn.onclick = () => { addToFavorites(matched[idx]); renderFavorites(); };
            });
        }
        renderFavorites();
    });

    // Initialize sorting controls
    addSortingControls();
    renderFavorites();
});
