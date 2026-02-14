const roadmapData = {
  frontend: [
    "HTML & CSS Fundamentals",
    "Responsive Design",
    "JavaScript Basics",
    "Advanced JavaScript (ES6+)",
    "Git & GitHub",
    "React.js",
    "Projects & Portfolio",
    "Deployment"
  ],
  backend: [
    "Programming Basics (JS/Python)",
    "Node.js / Django",
    "REST APIs",
    "Databases (SQL & NoSQL)",
    "Authentication",
    "Deployment",
    "System Design Basics",
    "Backend Projects"
  ],
  fullstack: [
    "HTML, CSS, JavaScript",
    "Frontend Framework (React)",
    "Backend Framework",
    "Databases",
    "Authentication & APIs",
    "Full Stack Projects",
    "Deployment",
    "Advanced Concepts"
  ],
  ai: [
    "Python Fundamentals",
    "Data Structures",
    "Statistics & Probability",
    "NumPy & Pandas",
    "Machine Learning Basics",
    "Deep Learning",
    "Projects",
    "Model Deployment"
  ]
};

function generateRoadmap() {
  const goal = document.getElementById("goal").value;
  const duration = parseInt(document.getElementById("duration").value);
  const output = document.getElementById("roadmapOutput");

  const topics = roadmapData[goal];
  const monthsPerPhase = duration / topics.length;

  output.innerHTML = "";

  topics.forEach((topic, index) => {
    const phaseDiv = document.createElement("div");
    phaseDiv.className = "phase";

    phaseDiv.innerHTML = `
      <h4>Phase ${index + 1}</h4>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Duration:</strong> ~${monthsPerPhase.toFixed(1)} month(s)</p>
    `;

    output.appendChild(phaseDiv);
  });
}
