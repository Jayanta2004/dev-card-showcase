### Contributing to Dev-Card-Showcase 🧠✨

---

First of all — thank you for considering contributing to Dev-Card-Showcase.
This project exists to make coding feel clearer, less frustrating, and more collaborative.
Every contribution, big or small, helps move us closer to that goal.

Whether you’re fixing a typo, improving UI, optimizing backend logic, or adding a brand-new feature — you’re welcome here.

## 📚 Table of Contents

- 🚀 How You Can Contribute
- 📌 Issue Assignment
- 🛠 Tech Stack Overview
  - 🗺 Contribution Map (File Responsibility Guide)
    - 🔹 Common Contribution Types & Where to Edit
    - ⚠️ Important Notes
  - 🧭 Where Should I Edit? (Quick Reference)
- 📦 Getting Started
  - 🎨 UI & UX Contributions
- Questions?

# 🚀 How You Can Contribute

You can contribute in many ways:

- 🐛 Fix bugs
- ✨ Add new features
- 🎨 Improve UI/UX
- 🧠 Improve AI prompts or explanations
- 📄 Improve documentation
- ⚡ Optimize performance
- 🧪 Add tests
- 🌍 Improve accessibility or responsiveness

If you’re unsure where to start, check the Issues tab for:

- good first issue
- help wanted

---

## 🧭 Where Should I Edit? (Quick Reference)

Not sure which file to modify? Use the table below to quickly find the right place for your contribution:

| Contribution Type | What You Want To Do            | Files / Folders To Edit                       |
| ----------------- | ------------------------------ | --------------------------------------------- |
| Add Profile Card  | Add your profile card          | index.html, images/                           |
| Add Project       | Showcase a new project         | projects/, project.json, projects.html        |
| UI / Styling Fix  | Improve layout or visuals      | style.css, about.css, css/                    |
| JavaScript Logic  | Add or fix interactivity       | tilt.js, other .js files                      |
| Documentation     | Improve guides or instructions | README.md, CONTRIBUTING.md, SCRIPTS_README.md |
| Bug Fix           | Fix broken behavior            | Relevant .html, .css, .js files               |
| New Feature       | Add new functionality          | Open an issue first                           |

> ⚠️ **Important:** Please do not edit files unrelated to your contribution.  
> If you’re unsure, ask in the issue or start a discussion before proceeding.

---

# 📌 Issue Assignment

- Please comment on an issue before starting work.
- Wait for a maintainer to assign the issue to you.
- This helps avoid duplicate work and conflicts.

# 🛠 Tech Stack Overview

Before contributing, it helps to know what we’re working with:

- HTML5 – Structure and markup for profile cards and layout
- CSS3 – Styling, layout, responsiveness, and custom card designs
- JavaScript (ES6) – Basic interactivity (if any enhancements are added)
- Git & GitHub – Version control and open-source collaboration

---

## 🗺 Contribution Map (File Responsibility Guide)

This section helps contributors understand **which files and folders are responsible for what**, so you can make changes in the correct place without confusion.

### 🔹 Common Contribution Types & Where to Edit

- **Profile Cards**
  - Modify: index.html
  - Add images to: images/
  - ⚠️ Follow the exact template and image rules

- **Projects / Showcases**
  - Create a new folder in projects/
  - Add your project files (HTML, CSS, JS, etc.)
  - Add a project.json file in your folder (see SCRIPTS_README.md for format)
  - Add your folder name to the projectFolders array in projects.html

- **UI / Styling Fixes**
  - Modify: style.css or files inside css/
  - Do **not** change HTML unless absolutely necessary

- **JavaScript / Interactivity**
  - Modify relevant .js files (e.g., tilt.js)
  - Keep changes minimal and well-documented

- **Documentation**
  - Modify: README.md, CONTRIBUTING.md, SCRIPTS_README.md
  - Ideal for first-time contributors

- **Bug Fixes**
  - Modify only the files related to the bug
  - Mention the affected files clearly in your PR description

### ⚠️ Important Notes

- Please **do not edit unrelated files**
- Avoid modifying index.html unless your contribution specifically requires it
- If you’re unsure where to make changes, **open an issue or ask maintainers first**

This guide exists to reduce invalid PRs and make contributions smoother for everyone.

---

# 📦 Getting Started

**1️⃣ Fork the Repository**

Click the Fork button at the top right of this repository.

**2️⃣ Clone Your Fork**

```bash
git clone https://github.com/user-name/dev-card-showcase.git
cd clone
```

**3️⃣ 🖼 Adding Your Profile Card**

- Add your image file into the images/ folder
- Open index.html
- Locate the comment '👇 CONTRIBUTORS: START COPYING FROM HERE 👇'
- Copy the template code block
- Paste it at the bottom of the list (above the closing tags)
- Update the src, h2, role, and p tags with your details

**4️⃣ 🌱 Creating a Branch**
Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

**✅ Commit Guidelines**
Write clear, meaningful commit messages:

```bash
git commit -m "Fix: prevent editor crash on empty input"
```

**5️⃣ Push & PR**

- Save your changes
- Run the following commands:

```bash
git add .
git commit -m "Added card for [Your Name]"
git push origin main
```

- Go to GitHub and click "Compare & Pull Request"

### Adding a New Project

1. Create a new folder for your project inside the projects directory.
2. Add your project files (HTML, CSS, JS, etc.) to your new folder.
3. Create a project.json file in your project folder. See SCRIPTS_README.md for the required structure.
4. Add your folder name to the projectFolders array in projects.html.
5. Test by opening projects.html in your browser and verify your project appears.

No Python scripts are needed for adding or loading new projects. All project loading is handled automatically by the site using the projectFolders array and each project.json file.

For troubleshooting or more details, refer to SCRIPTS_README.md.

### 🎨 UI & UX Contributions

- Keep the UI clean and intuitive
- Maintain dark/light theme compatibility
- Avoid unnecessary animations
- Ensure responsiveness across devices

## ❓ Questions or Need Help?

If you have any questions about contributing, please follow these steps:

1. 📘 **Read the Contribution Guide and README**  
   They cover most common questions and setup instructions.

2. 🔍 **Search Existing Issues & Discussions**  
   Your question may already be answered.

3. 📝 **Open a New Issue or Start a Discussion**  
   If you don’t find what you’re looking for, feel free to ask.

4. 🤝 **Reach Out to the Maintainers**  
   We’re happy to help guide you.

---

Thank you for contributing to Dev-card-showcase! 🎉  
Your support helps make this project better for everyone.
