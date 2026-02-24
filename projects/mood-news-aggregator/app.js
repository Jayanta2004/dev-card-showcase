// app.js - Mood-Based News Aggregator
const moodForm = document.getElementById('mood-form');
const moodSelect = document.getElementById('mood-select');
const moodText = document.getElementById('mood-text');
const loadingDiv = document.getElementById('loading');
const newsResults = document.getElementById('news-results');

moodSelect.onchange = () => {
    if (moodSelect.value === 'other') {
        moodText.style.display = '';
    } else {
        moodText.style.display = 'none';
    }
};

moodForm.onsubmit = async (e) => {
    e.preventDefault();
    newsResults.innerHTML = '';
    loadingDiv.style.display = 'block';
    let mood = moodSelect.value;
    if (mood === 'other') {
        const text = moodText.value.trim();
        if (!text) {
            alert('Please describe your mood.');
            loadingDiv.style.display = 'none';
            return;
        }
        mood = await analyzeMood(text);
    }
    try {
        const articles = await fetchNewsForMood(mood);
        renderNews(articles);
    } catch (err) {
        newsResults.innerHTML = '<p>Failed to fetch news. Please try again.</p>';
    }
    loadingDiv.style.display = 'none';
};

// Analyze mood using OpenAI API
async function analyzeMood(text) {
    // Replace with your OpenAI API key
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    const prompt = `Analyze the following journal entry and return the user's mood as a single word (e.g., happy, sad, angry, anxious, curious, motivated, bored):\n${text}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant that detects mood.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 10,
            temperature: 0.2
        })
    });
    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    return data.choices[0].message.content.trim().toLowerCase();
}

// Fetch news articles for mood
async function fetchNewsForMood(mood) {
    // Replace with your NewsAPI key
    const NEWS_API_KEY = 'YOUR_NEWSAPI_KEY';
    // Map moods to news categories or keywords
    const moodMap = {
        happy: 'entertainment',
        sad: 'health',
        angry: 'politics',
        anxious: 'science',
        curious: 'technology',
        motivated: 'business',
        bored: 'sports'
    };
    const category = moodMap[mood] || 'general';
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${NEWS_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('News API error');
    const data = await res.json();
    return data.articles || [];
}

function renderNews(articles) {
    if (!Array.isArray(articles) || articles.length === 0) {
        newsResults.innerHTML = '<p>No news found for your mood.</p>';
        return;
    }
    newsResults.innerHTML = '';
    articles.forEach(article => {
        const div = document.createElement('div');
        div.className = 'news-card';
        div.innerHTML = `
            <div class="news-title">${article.title}</div>
            <div class="news-desc">${article.description || ''}</div>
            <a class="news-link" href="${article.url}" target="_blank">Read more</a>
        `;
        newsResults.appendChild(div);
    });
}
