const aiTwistBtn = document.getElementById('ai-twist-btn');
const aiTwistDiv = document.getElementById('ai-twist');
const aiIllustrationDiv = document.getElementById('ai-illustration');
if (aiTwistBtn) {
	aiTwistBtn.addEventListener('click', function() {
		aiTwistDiv.innerHTML = '<em>AI is weaving a plot twist...</em>';
		aiIllustrationDiv.innerHTML = '';
		setTimeout(() => {
			// Demo AI twist
			const twists = [
				'Suddenly, a mysterious stranger appears!',
				'A hidden treasure is discovered beneath the old oak tree.',
				'A storm changes the course of the adventure.',
				'The main character reveals a secret identity!',
				'A magical portal opens to another world.'
			];
			const twist = twists[Math.floor(Math.random()*twists.length)];
			aiTwistDiv.innerHTML = `<b>AI Twist:</b> ${twist}`;
			// Demo AI illustration (placeholder image)
			aiIllustrationDiv.innerHTML = '<img src="https://placekitten.com/400/200" alt="AI Illustration" />';
		}, 2000);
	});
}
// Entry point for AI-Generated Storytelling Game
// App logic for multiplayer, story, and AI

// --- Data Model ---
let players = JSON.parse(localStorage.getItem('story_players') || '[]');
let story = JSON.parse(localStorage.getItem('story_content') || '[]'); // [{player, text}]

// --- UI Elements ---
const joinForm = document.getElementById('join-form');
const playerNameInput = document.getElementById('player-name');
const playersList = document.getElementById('players-list');
const storyContent = document.getElementById('story-content');
const contributionForm = document.getElementById('contribution-form');
const contributionInput = document.getElementById('contribution');

// --- Utility Functions ---
function savePlayers() { localStorage.setItem('story_players', JSON.stringify(players)); }
function saveStory() { localStorage.setItem('story_content', JSON.stringify(story)); }

function addPlayer(name) {
	if (!players.includes(name)) {
		players.push(name);
		savePlayers();
		updatePlayers();
	}
}

function addContribution(player, text) {
	story.push({ player, text });
	saveStory();
	updateStory();
}

// --- UI Update Functions ---
function updatePlayers() {
	if (players.length === 0) {
		playersList.innerHTML = '<em>No players joined yet.</em>';
		return;
	}
	playersList.innerHTML = '<b>Players:</b> ' + players.map(p => `<span style="margin-right:8px;">${p}</span>`).join('');
}

function updateStory() {
	if (story.length === 0) {
		storyContent.innerHTML = '<em>The story begins here...</em>';
		return;
	}
	let html = '';
	story.forEach(s => {
		html += `<p><b>${s.player}:</b> ${s.text}</p>`;
	});
	storyContent.innerHTML = html;
}

// --- Event Listeners ---
if (joinForm) {
	joinForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const name = playerNameInput.value.trim();
		if (!name) return;
		addPlayer(name);
		joinForm.reset();
	});
}

if (contributionForm) {
	contributionForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const text = contributionInput.value.trim();
		if (!text) return;
		// Use the last joined player as the contributor for demo
		const player = players.length > 0 ? players[players.length-1] : 'Anonymous';
		addContribution(player, text);
		contributionForm.reset();
	});
}

// --- Initial Render ---
updatePlayers();
updateStory();
