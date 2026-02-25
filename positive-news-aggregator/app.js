// Positive News Aggregator
const newsList = document.getElementById('news-list');

// Example uplifting news stories (in real app, fetch from API)
const stories = [
    {
        title: "Scientists Restore Coral Reefs in Indonesia",
        summary: "A team of marine biologists successfully restored over 10,000 square meters of coral reefs, boosting marine life and local tourism.",
        source: "BBC News",
        url: "https://www.bbc.com/news/science-environment-123456"
    },
    {
        title: "Teen Invents Device to Clean Rivers",
        summary: "A 16-year-old student created a solar-powered device that removes plastic waste from rivers, helping keep waterways clean.",
        source: "CNN",
        url: "https://www.cnn.com/positive-news/river-cleaner"
    },
    {
        title: "Community Garden Feeds Hundreds",
        summary: "A local community garden project provided fresh produce to hundreds of families in need, fostering unity and health.",
        source: "The Guardian",
        url: "https://www.theguardian.com/environment/community-garden"
    },
    {
        title: "Dog Rescued After 3 Days Lost",
        summary: "A rescue team found and saved a dog lost in the mountains for three days, reuniting it with its grateful owners.",
        source: "ABC News",
        url: "https://abcnews.go.com/US/dog-rescue"
    },
    {
        title: "School Launches Kindness Challenge",
        summary: "An elementary school launched a kindness challenge, inspiring students to perform good deeds and spread positivity.",
        source: "NBC News",
        url: "https://www.nbcnews.com/positive/kindness-challenge"
    }
];

function renderNews() {
    newsList.innerHTML = '';
    stories.forEach(story => {
        const div = document.createElement('div');
        div.className = 'news-story';
        div.innerHTML = `<h2>${story.title}</h2><p>${story.summary}</p><div class="source">Source: <a href="${story.url}" target="_blank">${story.source}</a></div>`;
        newsList.appendChild(div);
    });
}

renderNews();
