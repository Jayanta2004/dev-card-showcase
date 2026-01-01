async function generatePersona() {
    const usernameInput = document.getElementById('gh-username');
    const username = usernameInput.value.trim();
    const btn = document.getElementById('generate-btn');
    const container = document.getElementById('card-list');

    if (!username) {
        alert("Please enter a GitHub username!");
        return;
    }

    // UI Feedback
    btn.innerText = "⏳ Reading GitHub...";
    btn.disabled = true;

    try {
        // 1. Fetch GitHub User Data
        console.log("Fetching GitHub data for:", username);
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        const userData = await userRes.json();

        if (userData.message === "Not Found") throw new Error("GitHub User not found!");

        // 2. Fetch Repos to see their tech stack
        const repoRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
        const repos = await repoRes.json();
        const langs = [...new Set(repos.map(r => r.language).filter(Boolean))];

        btn.innerText = "🤖 AI Identity Forming...";
        console.log("Calling Puter AI with languages:", langs);

        // 3. Get AI Persona from Puter
        // We added a check to ensure Puter is loaded
        if (!window.puter) {
            throw new Error("Puter AI library not loaded. Check your internet or ad-blocker.");
        }

        const prompt = `Developer uses these languages: ${langs.join(', ') || 'General Coding'}. 
                        Their GitHub bio is: "${userData.bio || 'No bio provided'}". 
                        Give them a cool 3-word title (like 'Cyberpunk Frontend Mage') 
                        and a 1-sentence legendary bio. Start the bio on a new line.`;

        const aiResponse = await puter.ai.chat(prompt);

        // SAFE PARSING: Puter v2 can return a string OR an object
        let personaText = "";
        if (typeof aiResponse === 'string') {
            personaText = aiResponse;
        } else if (aiResponse && aiResponse.message && aiResponse.message.content) {
            personaText = aiResponse.message.content;
        } else {
            personaText = "The Mysterious Architect\nCoding in the shadows of the digital realm.";
        }

        console.log("AI Response received:", personaText);

        // 4. Split response into Title and Bio
        const lines = personaText.trim().split('\n');
        const aiTitle = lines[0] || "Digital Nomad";
        const aiBio = lines.slice(1).join(' ') || "Crafting code in the vast open source universe.";

        // 5. Create and Add the Card
        const cardHTML = `
            <div class="card ai-card">
                <img src="${userData.avatar_url}" class="card-img" onerror="this.src='images/user.png'">
                <h2>${userData.name || username}</h2>
                <span class="role">${aiTitle}</span>
                <p>"${aiBio}"</p>
                <a href="${userData.html_url}" class="card-btn" target="_blank">GitHub Profile</a>
            </div>
        `;

        // Add to top of list
        container.insertAdjacentHTML('afterbegin', cardHTML);

        // Reset Button
        btn.innerText = "Generate Card ✨";
        btn.disabled = false;
        usernameInput.value = ""; // Clear input

    } catch (e) {
        console.error("DETAILED ERROR:", e);
        alert("Error: " + (e.message || "Could not connect to AI. Check for blocked popups!"));
        btn.innerText = "Generate Card ✨";
        btn.disabled = false;
    }
}