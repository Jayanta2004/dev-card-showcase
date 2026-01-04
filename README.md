 <h1 align="center"> Hi!!<img src="https://raw.githubusercontent.com/nixin72/nixin72/master/wave.gif" height="40"width="40" />Welcome to the Community Card Showcase </h1> 
    
This is a **beginner-friendly Open Source project** designed to:  
- **Celebrate contributors** and their achievements  
- **Showcase developer profiles** from around the world  
- **Encourage first-time PRs** and open source participation  

Whether you're making your first contribution or simply want to be part of a global developer community, this project is the perfect place to start.  

---

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🎯 Project Goal
The main goal of this project is to **create a community gallery of contributors**. Each contributor gets their own **Profile Card** that appears on the website, highlighting their participation in Open Source.

---

## ✨ Features
- Display your personal **Profile Card** with photo, name, role, and GitHub link  
- Highlight your **first Open Source contribution**  
- Fully **responsive and beginner-friendly**  
- Easy to **customize card styles** for personal flair  

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🛠 How to Contribute

### Step 1: Prepare your Image
**⚠️ IMPORTANT IMAGE RULES:**
1. **Aspect Ratio:** Your image MUST be a square (**1:1 ratio**)
2. **File Format:** `.jpg` or `.png` only
3. **Naming:** Name the file exactly as your username (e.g., `john-doe.jpg`)
4. **Size:** Please keep image size under **500KB**

### Step 2: Fork & Clone
1. Star this repository (Optional, but highly recommended)
2. Fork this repository to your own GitHub account
3. Clone it to your local machine:
   ```bash
   git clone https://github.com/<your-username>/dev-card-showcase.git
   ```

### Step 3: Add your Code
1. Add your image file into the `images/` folder
2. Open `index.html`
3. Locate the comment **`👇 CONTRIBUTORS: START COPYING FROM HERE 👇`**
4. Copy the template code block
5. Paste it at the **bottom** of the list (above the closing tags)
6. Update the `src=""`, `<h2>`, `<span class="role">`, and `<p>` tags with your details

**Example:**
```html
<div class="card">
    <img src="images/john-doe.jpg" alt="John's Photo" class="card-img">
    <h2>John Doe</h2>
    <span class="role">Frontend Wizard</span>
    <p>"Hello world! This is my first PR."</p>
    <a href="https://github.com/johndoe" class="card-btn" target="_blank">GitHub</a>
</div>
```

### Step 4: Push & PR
1. Save your changes
2. Run the following commands:
   ```bash
   git add .
   git commit -m "Added card for [Your Name]"
   git push origin main
   ```
3. Go to GitHub and click "Compare & Pull Request"

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🎨 Custom Styles (Optional)
If you want to change the background color of only your card:

1. Add a unique class to your card div: `<div class="card my-custom-style">`
2. Open `style.css`
3. Add your custom CSS at the very bottom of the file

---

## 📝 Notes
- Make sure your image follows the specified requirements
- Test your changes locally before submitting a PR
- Keep your commit messages descriptive

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## Contributors
<a href="https://github.com/Jayanta2004/dev-card-showcase/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jayanta2004/dev-card-showcase&max=300" />
</a>

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🛠️ Troubleshooting

Having trouble setting up the project?
- Double-check that you're opening index.html
- If images are not loading, check path references.
- Still stuck? Raise an issue - we're here to help ✨
- Not sure how to set up the project? Check the README steps again

## 🥑 License

This project is licensed under the **MIT License**.<br>
Feel free to fork, remix, or build upon it — with proper credit 🙏

## ⭐ Star the Repo!

If this project inspired you or helped in any way — do leave a ⭐<br>
It keeps us going and growing!

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

### Be a part of the Open Source community and see your profile shine! 🚀
## Happy Coding! 💻
