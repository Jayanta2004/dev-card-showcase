const nameInput = document.getElementById("nameInput");
const bioInput = document.getElementById("bioInput");
const skillsInput = document.getElementById("skillsInput");
const projectsInput = document.getElementById("projectsInput");
const themeSelect = document.getElementById("themeSelect");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const portfolioOutput = document.getElementById("portfolioOutput");

/* =============================
   GENERATE PORTFOLIO
============================= */

generateBtn.addEventListener("click", generatePortfolio);

function generatePortfolio(){

const name = nameInput.value;
const bio = bioInput.value;
const skills = skillsInput.value.split(",");
const projects = projectsInput.value.split("\n");
const theme = themeSelect.value;

let skillsHTML = "";
skills.forEach(skill=>{
skillsHTML += `<span>${skill.trim()}</span>`;
});

let projectsHTML = "<ul>";
projects.forEach(project=>{
if(project.trim()!==""){
projectsHTML += `<li>${project.trim()}</li>`;
}
});
projectsHTML += "</ul>";

portfolioOutput.innerHTML = `
<div class="portfolio ${theme}">
<h1>${name}</h1>
<p>${bio}</p>

<h3>Skills</h3>
<div class="skills">${skillsHTML}</div>

<h3>Projects</h3>
${projectsHTML}
</div>
`;

}

/* =============================
   DOWNLOAD GENERATED HTML
============================= */

downloadBtn.addEventListener("click", downloadHTML);

function downloadHTML(){

const content = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${nameInput.value} Portfolio</title>
<style>
body{font-family:Arial;padding:40px;}
</style>
</head>
<body>
${portfolioOutput.innerHTML}
</body>
</html>
`;

const blob = new Blob([content], {type:"text/html"});
const link = document.createElement("a");
link.href = URL.createObjectURL(blob);
link.download = "portfolio.html";
link.click();
}
