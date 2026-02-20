const form = document.getElementById("mistakeForm");
const mistakeList = document.getElementById("mistakeList");

let mistakes = JSON.parse(localStorage.getItem("mistakes")) || [];

function renderMistakes() {
    mistakeList.innerHTML = "";
    mistakes.forEach((m, index) => {
        const div = document.createElement("div");
        div.className = "mistake";
        div.innerHTML = `
            <h3>${m.title}</h3>
            <p><strong>Category:</strong> ${m.category}</p>
            <p><strong>Mistake:</strong> ${m.description}</p>
            <p><strong>Solution:</strong> ${m.solution}</p>
            <button onclick="deleteMistake(${index})">Delete</button>
        `;
        mistakeList.appendChild(div);
    });
}

function deleteMistake(index) {
    mistakes.splice(index, 1);
    localStorage.setItem("mistakes", JSON.stringify(mistakes));
    renderMistakes();
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const solution = document.getElementById("solution").value;

    const newMistake = {
        title,
        category,
        description,
        solution,
        date: new Date().toLocaleDateString()
    };

    mistakes.push(newMistake);
    localStorage.setItem("mistakes", JSON.stringify(mistakes));

    form.reset();
    renderMistakes();
});

renderMistakes();
