// app.js - Recipe Ingredient Substituter
const form = document.getElementById('substitute-form');
const recipeInput = document.getElementById('recipe-input');
const restrictionsInput = document.getElementById('restrictions-input');
const pantryInput = document.getElementById('pantry-input');
const loadingDiv = document.getElementById('loading');
const resultsDiv = document.getElementById('results');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    resultsDiv.innerHTML = '';
    loadingDiv.style.display = 'block';
    const recipe = recipeInput.value.trim();
    const restrictions = restrictionsInput.value.trim();
    const pantry = pantryInput.value.trim();
    if (!recipe) {
        alert('Please enter your recipe ingredients.');
        loadingDiv.style.display = 'none';
        return;
    }
    try {
        const substitutes = await getSubstitutesAI(recipe, restrictions, pantry);
        renderResults(substitutes);
    } catch (err) {
        resultsDiv.innerHTML = '<p>Failed to find substitutes. Please try again.</p>';
    }
    loadingDiv.style.display = 'none';
});

// Call OpenAI API to get substitutes
async function getSubstitutesAI(recipe, restrictions, pantry) {
    // Replace with your OpenAI API key
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    let prompt = `Suggest ingredient substitutions for the following recipe ingredients. If there are dietary restrictions or pantry items, use them. For each ingredient, suggest a substitute (if needed) and a short reason. Format as JSON array: [{ingredient, substitute, reason}].\nIngredients: ${recipe}`;
    if (restrictions) prompt += `\nDietary restrictions: ${restrictions}`;
    if (pantry) prompt += `\nAvailable pantry items: ${pantry}`;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful cooking assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 512,
            temperature: 0.5
        })
    });
    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    let substitutes = [];
    try {
        const text = data.choices[0].message.content;
        substitutes = JSON.parse(text.match(/\[.*\]/s)[0]);
    } catch (e) {
        throw new Error('Failed to parse substitutes');
    }
    return substitutes;
}

function renderResults(substitutes) {
    if (!Array.isArray(substitutes) || substitutes.length === 0) {
        resultsDiv.innerHTML = '<p>No substitutes needed or found.</p>';
        return;
    }
    resultsDiv.innerHTML = '';
    substitutes.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<span class="ingredient">${item.ingredient}</span> ➔ <span class="substitute">${item.substitute}</span> <span class="reason">${item.reason}</span>`;
        resultsDiv.appendChild(div);
    });
}
