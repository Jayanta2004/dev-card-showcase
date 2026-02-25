// AI-Based Resume Analyzer
// Resume upload, parsing, feedback, suggestions

const resumeUploadEl = document.getElementById('resume-upload');
const analyzeBtn = document.getElementById('analyze-btn');
const feedbackEl = document.getElementById('feedback');
const suggestionsEl = document.getElementById('suggestions');

let resumeText = '';

resumeUploadEl.onchange = e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            resumeText = evt.target.result;
        };
        reader.readAsText(file);
    }
};

analyzeBtn.onclick = () => {
    if (!resumeText) {
        feedbackEl.textContent = 'Please upload a resume file.';
        suggestionsEl.textContent = '';
        return;
    }
    const feedback = analyzeResume(resumeText);
    feedbackEl.innerHTML = feedback.feedback;
    suggestionsEl.innerHTML = feedback.suggestions;
};

function analyzeResume(text) {
    // Basic keyword checks and suggestions
    let feedback = '';
    let suggestions = '';
    const keywords = ['experience', 'education', 'skills', 'projects', 'certifications', 'summary'];
    let found = keywords.filter(k => text.toLowerCase().includes(k));
    feedback += `<strong>Sections found:</strong> ${found.join(', ') || 'None'}`;
    suggestions += '<ul>';
    keywords.forEach(k => {
        if (!found.includes(k)) {
            suggestions += `<li>Add a section for <strong>${k}</strong>.</li>`;
        }
    });
    if (text.length < 500) {
        suggestions += '<li>Your resume seems short. Consider adding more details.</li>';
    }
    suggestions += '</ul>';
    return { feedback, suggestions };
}
