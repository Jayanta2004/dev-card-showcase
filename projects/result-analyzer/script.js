let subjects = [];

function addSubject() {
    const nameInput = document.getElementById("subjectName");
    const marksInput = document.getElementById("subjectMarks");

    const name = nameInput.value.trim();
    const marks = Number(marksInput.value);

    if (!name || isNaN(marks) || marks < 0 || marks > 100) {
        alert("Enter a valid subject name and marks (0-100).");
        return;
    }

    subjects.push({ name, marks });
    renderSubjects();

    nameInput.value = "";
    marksInput.value = "";
}

function renderSubjects() {
    const container = document.getElementById("subjects");
    container.innerHTML = "";

    subjects.forEach(sub => {
        const div = document.createElement("div");
        div.className = "subject";
        div.innerHTML = `
            <span>${sub.name}</span>
            <span>${sub.marks}</span>
        `;
        container.appendChild(div);
    });
}

function analyzeResult() {
    if (subjects.length === 0) {
        alert("Add at least one subject.");
        return;
    }

    const total = subjects.reduce((sum, s) => sum + s.marks, 0);
    const maxMarks = subjects.length * 100;
    const percentage = (total / maxMarks) * 100;

    let grade, status, feedback;

    if (percentage >= 90) {
        grade = "A+";
        status = "Pass";
        feedback = "Outstanding performance 🌟";
    } else if (percentage >= 75) {
        grade = "A";
        status = "Pass";
        feedback = "Very good result 👏";
    } else if (percentage >= 60) {
        grade = "B";
        status = "Pass";
        feedback = "Good effort, keep improving 👍";
    } else if (percentage >= 40) {
        grade = "C";
        status = "Pass";
        feedback = "You passed, but focus on weak areas.";
    } else {
        grade = "F";
        status = "Fail";
        feedback = "Don't give up — improvement is possible 💪";
    }

    document.getElementById("total").textContent = `${total} / ${maxMarks}`;
    document.getElementById("percentage").textContent =
        percentage.toFixed(2) + "%";
    document.getElementById("grade").textContent = grade;
    document.getElementById("status").textContent = status;
    document.getElementById("feedback").textContent = feedback;
}
