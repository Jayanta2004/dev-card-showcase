const quotes = [
    { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney" },
    { text: "Success is not in what you have, but who you are.", author: "Bo Bennett" },
    { text: "The harder you work for something, the greater you’ll feel when you achieve it.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "Don’t watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Great things never come from comfort zones.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Sometimes later becomes never. Do it now.", author: "Unknown" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It’s going to be hard, but hard does not mean impossible.", author: "Unknown" }
];

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function getTodayQuote() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return quotes[seed % quotes.length];
}

function displayQuote(quoteObj) {
    document.getElementById('quote').textContent = quoteObj.text;
    document.getElementById('author').textContent = `— ${quoteObj.author}`;
}

function saveFavorite(quoteObj) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.some(q => q.text === quoteObj.text && q.author === quoteObj.author)) {
        favorites.push(quoteObj);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavorites();
    }
}

function renderFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const list = document.getElementById('favorites-list');
    list.innerHTML = '';
    favorites.forEach((q, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>"${q.text}" <em>— ${q.author}</em></span> <button data-index="${i}">Remove</button>`;
        list.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    let currentQuote = getTodayQuote();
    displayQuote(currentQuote);
    renderFavorites();

    document.getElementById('new-quote').addEventListener('click', () => {
        currentQuote = getRandomQuote();
        displayQuote(currentQuote);
    });

    document.getElementById('favorite').addEventListener('click', () => {
        saveFavorite(currentQuote);
    });

    document.getElementById('share').addEventListener('click', () => {
        const shareText = `"${currentQuote.text}" — ${currentQuote.author}`;
        if (navigator.share) {
            navigator.share({ text: shareText });
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Quote copied to clipboard!');
        }
    });

    document.getElementById('favorites-list').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            favorites.splice(e.target.dataset.index, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderFavorites();
        }
    });
});
