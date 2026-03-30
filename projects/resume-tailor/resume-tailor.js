
// resume-tailor.js
// JavaScript for Resume Tailor functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const resumeInput = document.getElementById('resume-input');
    const jobInput = document.getElementById('job-input');
    const tailorBtn = document.getElementById('tailor-btn');
    const tailoredOutput = document.getElementById('tailored-output');
    const skillsOutput = document.getElementById('skills-output');

    // Utility: Extract skills from text
    function extractSkills(text) {
        // Simple skill extraction (keywords)
        const skillKeywords = [
            'JavaScript', 'Python', 'HTML', 'CSS', 'React', 'Node.js', 'SQL', 'Java', 'C++', 'Git',
            'Communication', 'Leadership', 'Teamwork', 'Problem-solving', 'Project Management',
            'Machine Learning', 'Data Analysis', 'Cloud', 'AWS', 'Azure', 'Docker', 'Kubernetes',
            'Testing', 'Debugging', 'Agile', 'Scrum', 'Design', 'UI/UX', 'Figma', 'Photoshop',
            'Public Speaking', 'Presentation', 'Time Management', 'Adaptability', 'Creativity',
            'Linux', 'Shell', 'REST', 'API', 'MongoDB', 'PostgreSQL', 'Excel', 'PowerPoint',
            'Sales', 'Marketing', 'SEO', 'Content Writing', 'Copywriting', 'Analytics', 'Statistics'
        ];
        const found = [];
        skillKeywords.forEach(skill => {
            const regex = new RegExp(`\\b${skill}\\b`, 'i');
            if (regex.test(text)) found.push(skill);
        });
        return found;
    }

    // Utility: Highlight missing skills
    function highlightMissingSkills(resumeSkills, jobSkills) {
        return jobSkills.filter(skill => !resumeSkills.includes(skill));
    }

    // Utility: Tailor resume for job description
    function tailorResume(resume, jobDesc) {
        // Basic tailoring: emphasize job keywords in resume
        const jobSkills = extractSkills(jobDesc);
        let tailored = resume;
        jobSkills.forEach(skill => {
            const regex = new RegExp(`(${skill})`, 'gi');
            tailored = tailored.replace(regex, '<span class="highlight">$1</span>');
        });
        return tailored;
    }

    // UI: Show tailored resume and missing skills
    function updateTailoredResume() {
        const resume = resumeInput.value;
        const jobDesc = jobInput.value;
        if (!resume || !jobDesc) {
            tailoredOutput.innerHTML = '<em>Please provide both resume and job description.</em>';
            skillsOutput.innerHTML = '';
            return;
        }
        const resumeSkills = extractSkills(resume);
        const jobSkills = extractSkills(jobDesc);
        const missingSkills = highlightMissingSkills(resumeSkills, jobSkills);
        tailoredOutput.innerHTML = tailorResume(resume, jobDesc);
        if (missingSkills.length > 0) {
            skillsOutput.innerHTML = '<strong>Missing Skills:</strong><ul>' + missingSkills.map(skill => `<li>${skill}</li>`).join('') + '</ul>';
        } else {
            skillsOutput.innerHTML = '<strong>No missing skills detected!</strong>';
        }
    }

    // UI: Add highlight style
    function injectHighlightStyle() {
        const style = document.createElement('style');
        style.innerHTML = '.highlight { background: #ffe066; font-weight: bold; padding: 0 2px; border-radius: 3px; }';
        document.head.appendChild(style);
    }

    // UI: Add copy to clipboard for tailored resume
    function addCopyButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Copy Tailored Resume';
        btn.id = 'copy-tailored-btn';
        btn.style.marginTop = '12px';
        tailoredOutput.parentNode.appendChild(btn);
        btn.addEventListener('click', function() {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tailoredOutput.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
            const text = tempDiv.textContent || tempDiv.innerText;
            navigator.clipboard.writeText(text);
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy Tailored Resume', 1200);
        });
    }

    // UI: Add download tailored resume as TXT
    function addDownloadButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Download Tailored Resume';
        btn.id = 'download-tailored-btn';
        btn.style.marginTop = '12px';
        tailoredOutput.parentNode.appendChild(btn);
        btn.addEventListener('click', function() {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tailoredOutput.innerHTML.replace(/<span class="highlight">(.*?)<\/span>/g, '$1');
            const text = tempDiv.textContent || tempDiv.innerText;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tailored_resume.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // UI: Add clear all button
    function addClearButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Clear All';
        btn.id = 'clear-all-btn';
        btn.style.marginTop = '12px';
        tailoredOutput.parentNode.appendChild(btn);
        btn.addEventListener('click', function() {
            resumeInput.value = '';
            jobInput.value = '';
            tailoredOutput.innerHTML = '';
            skillsOutput.innerHTML = '';
        });
    }

    // UI: Add expand/collapse for tailored resume
    function addExpandCollapse() {
        const btn = document.createElement('button');
        btn.textContent = 'Expand';
        btn.id = 'expand-tailored-btn';
        btn.style.marginTop = '12px';
        tailoredOutput.parentNode.appendChild(btn);
        let expanded = false;
        btn.addEventListener('click', function() {
            expanded = !expanded;
            tailoredOutput.style.maxHeight = expanded ? 'none' : '120px';
            tailoredOutput.style.overflowY = expanded ? 'visible' : 'auto';
            btn.textContent = expanded ? 'Collapse' : 'Expand';
        });
        tailoredOutput.style.maxHeight = '120px';
        tailoredOutput.style.overflowY = 'auto';
    }

    // UI: Add skill suggestions
    function addSkillSuggestions() {
        const btn = document.createElement('button');
        btn.textContent = 'Suggest Skills';
        btn.id = 'suggest-skills-btn';
        btn.style.marginTop = '12px';
        skillsOutput.parentNode.appendChild(btn);
        btn.addEventListener('click', function() {
            const resume = resumeInput.value;
            const jobDesc = jobInput.value;
            const resumeSkills = extractSkills(resume);
            const jobSkills = extractSkills(jobDesc);
            const missingSkills = highlightMissingSkills(resumeSkills, jobSkills);
            if (missingSkills.length > 0) {
                alert('Consider adding these skills: ' + missingSkills.join(', '));
            } else {
                alert('No missing skills detected!');
            }
        });
    }

    // UI: Add sample data button
    function addSampleDataButton() {
        const btn = document.createElement('button');
        btn.textContent = 'Load Sample Data';
        btn.id = 'load-sample-btn';
        btn.style.marginTop = '12px';
        resumeInput.parentNode.appendChild(btn);
        btn.addEventListener('click', function() {
            resumeInput.value = 'John Doe\nSoftware Engineer\nSkills: JavaScript, Python, HTML, CSS, React, Node.js\nExperience: Developed web apps, led teams, managed projects.';
            jobInput.value = 'Looking for a Software Engineer with skills in JavaScript, React, Node.js, AWS, Docker, Agile, and strong communication.';
            updateTailoredResume();
        });
    }

    // UI: Add event listeners
    tailorBtn.addEventListener('click', updateTailoredResume);
    resumeInput.addEventListener('input', function() {
        tailoredOutput.innerHTML = '';
        skillsOutput.innerHTML = '';
    });
    jobInput.addEventListener('input', function() {
        tailoredOutput.innerHTML = '';
        skillsOutput.innerHTML = '';
    });

    // Initialize UI features
    injectHighlightStyle();
    addCopyButton();
    addDownloadButton();
    addClearButton();
    addExpandCollapse();
    addSkillSuggestions();
    addSampleDataButton();
});

// Modular: Export functions for testing (if needed)
// window.extractSkills = extractSkills;
// window.highlightMissingSkills = highlightMissingSkills;
// window.tailorResume = tailorResume;

// ...existing code...
