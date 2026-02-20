# How to Add Skills to Your Developer Card

## Quick Guide

When adding your card to the showcase, you can now include your skills/tech stack!

### Step 1: Add the data-skills attribute
Add `data-skills` to your card div with comma-separated skills (lowercase, no spaces):

```html
<div class="card" data-skills="javascript,react,nodejs,mongodb">
```

### Step 2: Add visual skill tags
Inside your `card-inner` div, add the skill tags display:

```html
<div class="card-skills">
    <span class="skill-tag">JavaScript</span>
    <span class="skill-tag">React</span>
    <span class="skill-tag">Node.js</span>
    <span class="skill-tag">MongoDB</span>
</div>
```

### Complete Example:

```html
<div class="card" data-skills="python,django,postgresql">
    <div class="card-inner">
        <img src="images/your-image.jpg" alt="Your Photo" class="card-img">
        <h2>Your Name</h2>
        <span class="role">Backend Developer</span>
        <div class="card-skills">
            <span class="skill-tag">Python</span>
            <span class="skill-tag">Django</span>
            <span class="skill-tag">PostgreSQL</span>
        </div>
        <p>"Your quote here"</p>
        <a href="https://github.com/yourusername" class="card-btn" target="_blank">
            <i class="fab fa-github"></i> GitHub
        </a>
    </div>
</div>
```

## Popular Skills to Choose From:

### Programming Languages
- JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin

### Frontend
- React, Vue, Angular, HTML, CSS, Sass, Tailwind, Bootstrap, Next.js, Svelte

### Backend
- Node.js, Django, Flask, Spring, Express, FastAPI, Laravel, Ruby on Rails

### Databases
- MongoDB, PostgreSQL, MySQL, Redis, Firebase, SQLite, Oracle

### Mobile
- React Native, Flutter, Android, iOS, Ionic

### DevOps & Cloud
- Docker, Kubernetes, AWS, Azure, GCP, CI/CD, Jenkins, GitHub Actions

### Tools & Others
- Git, Linux, OpenSource, Leadership, UI/UX, Testing, GraphQL, REST API

## Tips:
- ✅ Keep it to 3-5 main skills for better visibility
- ✅ Use commonly recognized technology names
- ✅ Skills in `data-skills` should be lowercase and comma-separated
- ✅ Visual tags can have proper capitalization
- ✅ Make sure both attributes match (just different casing)

## Need Help?
If you're unsure about which skills to add or how to format them, check out the existing cards in the showcase for examples!
