// app.js

document.getElementById('reviewBtn').addEventListener('click', async () => {
    const code = document.getElementById('codeInput').value.trim();
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.innerHTML = '<span style="color:#00c6ff;">Analyzing code with AI...</span>';

    if (!code) {
        feedbackDiv.innerHTML = '<span style="color:#ff7675;">Please paste your code above.</span>';
        return;
    }

    // Simulate AI review (replace with real API call in production)
    setTimeout(() => {
        feedbackDiv.innerHTML = `
            <strong>Feedback:</strong><br>
            <ul>
                <li>✅ Code is well-structured.</li>
                <li>💡 Consider adding more comments for clarity.</li>
                <li>🚀 Try optimizing the loop on line 12 for better performance.</li>
                <li>🔒 No major security issues detected.</li>
            </ul>
            <em>Want more detailed feedback? Integrate with an AI backend!</em>
        `;
    }, 1800);
});
