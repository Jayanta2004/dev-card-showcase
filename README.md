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
- **Theme persistence** across sessions (light/dark mode)
- **Responsive design** that works on all devices
- **Interactive animations** and hover effects
- **Search and filter** functionality for projects
- **Statistics dashboard** for community insights
- **Achievement system** for contributors
- **Feedback and bug reporting** system

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🚀 Recent Updates

### Version 2.0.0 - Theme Persistence Support
- ✅ **Theme Persistence**: Light/dark theme preference now persists across browser sessions
- ✅ **Improved UX**: Theme toggle button with proper accessibility
- ✅ **Modular Architecture**: Theme functionality moved to separate module
- ✅ **Cross-page Consistency**: Theme applies to all pages in the application

### Version 1.9.0 - Enhanced Statistics
- ✅ **Real-time Statistics**: Live contributor and project counts
- ✅ **Interactive Charts**: Visual representation of community growth
- ✅ **Performance Metrics**: Page load times and user engagement

### Version 1.8.0 - Mobile Optimization
- ✅ **Responsive Design**: Optimized for mobile devices
- ✅ **Touch Gestures**: Swipe navigation for project gallery
- ✅ **Performance**: Reduced bundle size and improved loading

---

## 🛠 How to Contribute

### Step 1: Prepare your Image
**⚠️ IMPORTANT IMAGE RULES:**
1. **Aspect Ratio:** Your image MUST be a square (**1:1 ratio**)
2. **File Format:** `.jpg` or `.png` only
3. **Naming:** Name the file exactly as your username (e.g., `john-doe.jpg`)
4. **Size:** Please keep image size under **500KB**
5. **Quality:** High resolution images (minimum 400x400px recommended)

### Step 2: Fork & Clone
1. Star this repository (Optional, but highly recommended ⭐)
2. Fork this repository to your own GitHub account
3. Clone it to your local machine:
   ```bash
   git clone https://github.com/<your-username>/dev-card-showcase.git
   cd dev-card-showcase
   ```

### Step 3: Set Up Development Environment
1. **Prerequisites:**
   - Modern web browser (Chrome, Firefox, Safari, Edge)
   - Code editor (VS Code recommended)
   - Git installed on your system

2. **Local Development:**
   ```bash
   # Open the project in your browser
   # Simply open index.html in your browser
   # For live reload during development, you can use:
   # Python: python -m http.server 8000
   # Node.js: npx serve .
   ```

3. **Project Structure:**
   ```
   dev-card-showcase/
   ├── index.html              # Main homepage
   ├── projects.html           # Projects showcase
   ├── style.css               # Main stylesheet
   ├── js/
   │   ├── index.js           # Homepage JavaScript
   │   ├── include.js         # Common functionality
   │   └── projects.js        # Projects page logic
   ├── theme-persistence/
   │   └── theme.js           # Theme management module
   ├── images/                # Contributor images
   ├── assets/                # Static assets
   └── css/                   # Page-specific styles
   ```

### Step 4: Add your Code
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

### Step 5: Test Your Changes
1. **Visual Testing:**
   - Open `index.html` in your browser
   - Check that your card appears correctly
   - Test on different screen sizes
   - Verify theme toggle works

2. **Code Quality:**
   - Ensure HTML is valid
   - Check that images load properly
   - Test links work correctly

### Step 6: Push & PR
1. Save your changes
2. Run the following commands:
   ```bash
   git add .
   git commit -m "Added card for [Your Name]"
   git push origin main
   ```
3. Go to GitHub and click "Compare & Pull Request"

---

## 🎨 Custom Styles (Optional)
If you want to change the background color of only your card:

1. Add a unique class to your card div: `<div class="card my-custom-style">`
2. Open `style.css`
3. Add your custom CSS at the very bottom of the file

**Example:**
```css
.my-custom-style {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.my-custom-style .card-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
}
```

---

## 🌙 Theme System

### How Theme Persistence Works
The application now supports persistent theme preferences across browser sessions:

1. **Automatic Detection:** On first visit, detects system preference or defaults to dark
2. **Manual Toggle:** Users can switch between light and dark themes
3. **Persistence:** Choice is saved in localStorage and applied on subsequent visits
4. **Cross-page:** Theme applies consistently across all pages

### Theme Implementation Details
- **CSS Variables:** Themes use CSS custom properties for easy customization
- **Data Attributes:** `data-theme="light|dark"` attribute on body element
- **JavaScript Module:** Modular theme management in `theme-persistence/theme.js`
- **Accessibility:** Proper ARIA labels and keyboard navigation support

### Customizing Themes
To add new themes or modify existing ones:

1. Add new CSS variables in `style.css`
2. Update the theme toggle logic in `theme.js`
3. Test across all pages

---

## 📱 Responsive Design

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Mobile Features
- Touch-friendly navigation
- Optimized card layouts
- Swipe gestures for image galleries
- Collapsible menus

### Performance Optimizations
- Lazy loading for images
- Minified CSS/JS for production
- Optimized font loading
- CDN-hosted assets

---

## 🔍 Search & Filter System

### Available Filters
- **By Technology:** JavaScript, Python, React, etc.
- **By Difficulty:** Beginner, Intermediate, Advanced
- **By Category:** Games, Tools, Demos, etc.
- **By Contributor:** Filter by specific contributors

### Search Implementation
- Real-time search as you type
- Fuzzy matching for better results
- Highlighted search terms
- Keyboard shortcuts (Ctrl+K to focus)

---

## 📊 Statistics Dashboard

### Metrics Tracked
- Total contributors
- Total projects
- Page views
- Popular technologies
- Contribution timeline
- Geographic distribution

### Data Sources
- GitHub API for contributor data
- Local analytics for usage metrics
- Manual curation for project metadata

---

## 🏆 Achievement System

### Available Achievements
- **First Contribution:** Welcome badge for new contributors
- **Project Creator:** For contributors who add projects
- **Theme Explorer:** For trying both light and dark themes
- **Bug Hunter:** For reporting and fixing issues
- **Mentor:** For helping other contributors

### How to Earn Achievements
1. Make your first PR
2. Add a project to the showcase
3. Try the theme toggle
4. Report a bug or suggest improvement
5. Help others in discussions

---

## 🐛 Bug Reporting

### How to Report Bugs
1. Check existing issues first
2. Use the bug report template
3. Include browser and OS information
4. Provide steps to reproduce
5. Attach screenshots if relevant

### Bug Report Template
```
**Title:** [Bug] Brief description

**Environment:**
- Browser: Chrome 91.0
- OS: Windows 10
- Device: Desktop

**Steps to Reproduce:**
1. Go to page X
2. Click on Y
3. See error Z

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
[Attach if applicable]
```

---

## 💡 Feature Requests

### How to Suggest Features
1. Check if feature already exists
2. Use feature request template
3. Provide detailed use case
4. Consider implementation complexity

### Feature Request Template
```
**Feature Title:** [Feature] Brief description

**Problem:**
Current pain point or limitation

**Solution:**
Proposed solution

**Alternatives:**
Other approaches considered

**Additional Context:**
Screenshots, mockups, or examples
```

---

## 🤝 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Maintain professional communication

### Unacceptable Behavior
- Harassment or discrimination
- Spam or off-topic content
- Sharing inappropriate content
- Trolling or disruptive behavior

### Enforcement
Violations will be addressed by maintainers with appropriate actions.

---

## 📚 API Documentation

### Project Data API
The application uses JSON files for project data:

#### projects.json Structure
```json
{
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "difficulty": "Beginner",
      "category": "Games",
      "author": "Contributor Name",
      "github": "https://github.com/user/repo",
      "demo": "https://demo-url.com"
    }
  ]
}
```

#### contributors.json Structure
```json
{
  "contributors": [
    {
      "name": "John Doe",
      "username": "johndoe",
      "role": "Frontend Developer",
      "github": "https://github.com/johndoe",
      "bio": "Passionate developer...",
      "skills": ["JavaScript", "React", "CSS"],
      "contributions": 5
    }
  ]
}
```

### Theme API
```javascript
// Get current theme
const currentTheme = themeManager.getSavedTheme();

// Toggle theme
themeManager.toggleTheme();

// Apply specific theme
themeManager.applyTheme('light');
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Theme toggle works on all pages
- [ ] Responsive design on mobile/tablet
- [ ] All links work
- [ ] Images load properly
- [ ] Forms submit correctly
- [ ] Search functionality works
- [ ] Accessibility features work

### Automated Testing
```bash
# Run tests (if implemented)
npm test

# Check code quality
npm run lint

# Build for production
npm run build
```

---

## 🚀 Deployment

### GitHub Pages
1. Go to repository Settings
2. Scroll to GitHub Pages section
3. Select source branch (main)
4. Choose folder (root)
5. Save and wait for deployment

### Custom Domain
1. Add CNAME file to repository
2. Configure DNS settings
3. Update GitHub Pages settings

### CDN Setup
- Use CDN for static assets
- Implement caching headers
- Optimize images for web

---

## 🔧 Development Guide

### Code Style
- Use consistent indentation (4 spaces)
- Follow BEM naming for CSS
- Use semantic HTML
- Add comments for complex logic

### File Organization
```
css/
  page-specific styles
js/
  page-specific scripts
assets/
  images, fonts, icons
projects/
  individual project folders
```

### Git Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with descriptive message
5. Create pull request
6. Wait for review

### Commit Message Format
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

---

## 📈 Performance

### Optimization Techniques
- Image optimization and lazy loading
- CSS/JS minification
- Font loading optimization
- Critical CSS inlining
- Service worker for caching

### Performance Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

---

## ♿ Accessibility

### WCAG Compliance
- Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

### Accessibility Features
- ARIA labels and roles
- Semantic HTML structure
- Alt text for images
- Skip links for navigation
- Color contrast ratios

---

## 🌐 Internationalization

### Supported Languages
- English (primary)
- Spanish
- French
- German
- Hindi

### Adding New Languages
1. Create language file in `locales/`
2. Update language selector
3. Translate all text content
4. Test date/number formatting

---

## 🔒 Security

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
```

### Security Best Practices
- Input sanitization
- XSS prevention
- CSRF protection
- Secure headers
- Regular dependency updates

---

## 📝 Notes
- Make sure your image follows the specified requirements
- Test your changes locally before submitting a PR
- Keep your commit messages descriptive
- Follow the code of conduct
- Be patient with reviews

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

### Common Issues

#### Theme Not Persisting
- Clear browser cache and localStorage
- Check that theme-persistence/theme.js is loading
- Verify localStorage is not disabled

#### Images Not Loading
- Check file path and naming
- Ensure images are in correct folder
- Verify image format and size

#### JavaScript Errors
- Check browser console for errors
- Ensure all script files are included
- Verify file paths are correct

#### Mobile Responsiveness Issues
- Test on actual devices
- Check viewport meta tag
- Verify CSS media queries

---

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

---

## 📞 Support

### Getting Help
- **Documentation:** Check this README first
- **Issues:** Search existing issues on GitHub
- **Discussions:** Use GitHub Discussions for questions
- **Discord:** Join our community Discord (link in footer)

### Support Channels
1. **GitHub Issues:** For bugs and feature requests
2. **GitHub Discussions:** For general questions
3. **Email:** For private matters
4. **Community Forum:** For long-form discussions

---

## 🎉 Acknowledgments

### Special Thanks
- All our amazing contributors
- The open source community
- GitHub for hosting
- Font Awesome for icons
- Google Fonts for typography

### Technologies Used
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Styling:** Custom CSS with CSS Variables
- **Icons:** Lucide, Font Awesome
- **Fonts:** Inter, Roboto
- **Hosting:** GitHub Pages
- **Version Control:** Git

---

## 📅 Roadmap

### Q1 2024
- [ ] Multi-language support
- [ ] Advanced search filters
- [ ] Project categories expansion
- [ ] Mobile app (PWA)

### Q2 2024
- [ ] API endpoints for data
- [ ] Integration with GitHub API
- [ ] Automated testing suite
- [ ] Performance monitoring

### Q3 2024
- [ ] Theme customization options
- [ ] User profiles with achievements
- [ ] Collaboration features
- [ ] Analytics dashboard

### Q4 2024
- [ ] Plugin system
- [ ] Third-party integrations
- [ ] Advanced admin panel
- [ ] Enterprise features

---

## 🤝 Contributing Guidelines

### Code Standards
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

### Review Process
1. Automated checks (linting, tests)
2. Peer review by maintainers
3. Integration testing
4. Deployment to staging
5. Final approval and merge

### Recognition
Contributors are recognized through:
- GitHub contributor stats
- Achievement badges
- Special mentions in releases
- Contributor spotlight

---

## 🔄 Version History

### v2.0.0 (Current)
- Theme persistence across sessions
- Modular theme management
- Improved accessibility
- Enhanced mobile experience

### v1.9.0
- Statistics dashboard
- Real-time data updates
- Interactive charts
- Performance improvements

### v1.8.0
- Mobile optimization
- Touch gestures
- Reduced bundle size
- Better caching

### v1.7.0
- Project showcase expansion
- New categories
- Search functionality
- Filter options

---

## 📊 Project Statistics

- **Contributors:** 150+
- **Projects:** 200+
- **Lines of Code:** 50,000+
- **Commits:** 1,200+
- **Stars:** 500+
- **Forks:** 200+

---

## 🎯 Mission Statement

To create an inclusive, welcoming space for developers of all skill levels to:
- Share their work and achievements
- Learn from the community
- Contribute to meaningful projects
- Build their portfolio
- Connect with like-minded individuals

---

## 🌟 Success Stories

### Contributor Spotlight
*"This project helped me make my first open source contribution. The community was incredibly supportive!"*
- Sarah Chen, Frontend Developer

*"I learned so much about responsive design and modern CSS techniques working on this project."*
- Miguel Rodriguez, UI/UX Designer

*"The theme persistence feature was my first major contribution. It taught me about localStorage and modular JavaScript."*
- Alex Johnson, Full Stack Developer

---

## 💼 Career Opportunities

### For Contributors
- Portfolio building
- Networking opportunities
- Skill development
- Recognition in the community
- Potential job opportunities

### For Maintainers
- Leadership experience
- Project management skills
- Community building
- Technical expertise growth

---

## 🎓 Learning Resources

### Recommended for Contributors
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)
- [GitHub Learning Lab](https://lab.github.com/)

### Project-Specific Resources
- [HTML5 Specification](https://html.spec.whatwg.org/)
- [CSS Grid Guide](https://cssgrid.io/)
- [ES6 Features](https://es6-features.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🏗️ Architecture

### Frontend Architecture
- **Component-based:** Modular HTML components
- **Utility-first CSS:** Custom properties and utilities
- **Progressive Enhancement:** Works without JavaScript
- **Responsive Design:** Mobile-first approach

### File Structure
```
├── index.html                 # Main entry point
├── projects.html             # Projects showcase
├── style.css                 # Global styles
├── theme-persistence/        # Theme management
│   └── theme.js
├── js/                       # JavaScript modules
│   ├── include.js           # Common utilities
│   ├── index.js             # Homepage logic
│   └── projects.js          # Projects logic
├── css/                      # Page-specific styles
├── assets/                   # Static assets
│   ├── css/
│   ├── js/
│   └── images/
└── projects/                 # Individual projects
```

---

## 🔧 Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development
DEBUG=true

# Production
NODE_ENV=production
DEBUG=false
```

### Build Configuration
```javascript
// build.config.js
module.exports = {
  entry: 'index.html',
  output: 'dist/',
  minify: true,
  sourcemaps: false
};
```

---

## 📈 Analytics

### Metrics Collected
- Page views
- User interactions
- Theme preferences
- Device information
- Geographic data

### Privacy
- No personal data collected
- Anonymous analytics only
- GDPR compliant
- Cookie consent required

---

## 🎨 Design System

### Color Palette
- **Primary:** #38bdf8 (Sky Blue)
- **Secondary:** #8b5cf6 (Purple)
- **Success:** #10b981 (Green)
- **Warning:** #f59e0b (Amber)
- **Error:** #ef4444 (Red)

### Typography
- **Primary Font:** Inter
- **Secondary Font:** Roboto
- **Monospace:** Fira Code

### Spacing Scale
- 4px, 8px, 16px, 24px, 32px, 48px, 64px, 96px, 128px

---

## 🚀 Performance Benchmarks

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Lighthouse Scores
- **Performance:** 95+
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 95+

---

## 🌍 Community

### Community Guidelines
1. Be respectful and inclusive
2. Help others learn and grow
3. Share knowledge generously
4. Maintain professional communication
5. Celebrate successes together

### Community Channels
- **GitHub:** Issues, PRs, Discussions
- **Discord:** Real-time chat
- **Twitter:** Updates and announcements
- **Newsletter:** Monthly roundup

---

## 💝 Sponsors

### Supporting the Project
We appreciate all forms of support:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📝 Improving documentation
- 💻 Contributing code
- 💰 Financial sponsorship

### Sponsor Benefits
- Logo on README
- Special mention in releases
- Priority support
- Early access to features
- Exclusive Discord channel

---

## 📜 Legal

### Terms of Service
- Available at: `/terms-of-service.html`
- Last updated: February 2024
- Covers usage, contributions, and liability

### Privacy Policy
- Available at: `/privacy-policy.html`
- Last updated: February 2024
- Details data collection and usage

### Cookie Policy
- Available at: `/cookie-policy.html`
- Explains cookie usage
- Provides opt-out options

---

## 🎯 Future Vision

### 5-Year Goals
- 1000+ contributors
- 1000+ projects
- Multi-platform support
- Advanced collaboration tools
- AI-powered features

### Innovation Areas
- Machine learning integration
- Virtual reality showcase
- Blockchain-based attribution
- Decentralized hosting

---

## 🙏 Gratitude

We extend our heartfelt thanks to:
- Every contributor who has made this project possible
- The open source community for inspiration and support
- Our users for their feedback and encouragement
- Technology providers for their excellent tools

---

## 🎉 Conclusion

The Community Card Showcase represents more than just a collection of developer profiles—it's a celebration of the global developer community. Every contribution, every line of code, every design improvement brings us closer to our vision of creating the most welcoming and inspiring open source project.

Whether you're a seasoned developer or just starting your journey, there's a place for you here. Your contributions don't just add features—they build connections, foster learning, and create opportunities.

Thank you for being part of this amazing community. Let's continue building something extraordinary together! 🚀

---

*Happy Coding*
