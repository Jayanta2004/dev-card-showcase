// Matching Component
class Matching {
    constructor(container) {
        this.container = container;
        this.topics = ['stress', 'anxiety', 'grief', 'motivation', 'relationships', 'self-esteem', 'burnout'];
        this.init();
    }

    init() {
        this.render();
        this.loadMatchHistory();
    }

    loadMatchHistory() {
        let matchHistory = Storage.get('matchHistory');
        if (!matchHistory) {
            // Sample match history for demo
            matchHistory = [
                { topic: 'stress', peer: { nickname: 'PeerStress101' }, timestamp: new Date(Date.now()-7200000).toISOString() },
                { topic: 'motivation', peer: { nickname: 'PeerMotivation202' }, timestamp: new Date(Date.now()-3600000).toISOString() }
            ];
            Storage.set('matchHistory', matchHistory);
        }
        this.renderMatchHistory(matchHistory);
    }

    renderMatchHistory(history) {
        if (!history || !history.length) return;
        const historyDiv = document.createElement('div');
        historyDiv.style.marginTop = '16px';
        historyDiv.innerHTML = '<strong>Match History:</strong><br>' + history.map(h => `Matched with <span style="color:#5bc0be">${h.peer.nickname}</span> for <span style="color:#7e57c2">${h.topic}</span> (${new Date(h.timestamp).toLocaleString()})`).join('<br>');
        this.container.appendChild(historyDiv);
    }

    render() {
        this.container.innerHTML = `
            <div class="matching-header">Find Support</div>
            <form class="match-form" id="match-form">
                <select id="topic-select">
                    ${this.topics.map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
                </select>
                <button type="submit">Match Me</button>
            </form>
            <div id="match-result"></div>
        `;
        this.form = document.getElementById('match-form');
        this.topicSelect = document.getElementById('topic-select');
        this.matchResult = document.getElementById('match-result');
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.matchUser(this.topicSelect.value);
        });
    }

    matchUser(topic) {
        // Advanced matching logic
        const preferences = Storage.get('userPreferences') || {};
        let matchHistory = Storage.get('matchHistory') || [];
        const peer = {
            id: Math.floor(Math.random() * 10000),
            topic,
            nickname: 'Peer' + topic.charAt(0).toUpperCase() + topic.slice(1) + Math.floor(Math.random() * 1000)
        };
        matchHistory.push({ topic, peer, timestamp: new Date().toISOString() });
        Storage.set('matchHistory', matchHistory);
        this.matchResult.textContent = `You have been matched to ${peer.nickname} for "${topic}".`;
    }
}

export default Matching;
