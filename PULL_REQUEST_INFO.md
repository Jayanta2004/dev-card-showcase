# Pull Request: Skill / Tech Stack Tags with Filtering

## 🚀 Feature Description
This PR adds skill/tech-stack tags to each developer card and introduces a filtering mechanism that allows users to browse developer profiles based on selected technologies, roles, or interests.

## 🎯 Problem It Solves
Currently, all developer cards are displayed together without any way to filter them by skills or tech stack. As the number of contributors grows, it becomes difficult for users to quickly find developers working with specific technologies (e.g., React, Python, Backend). This reduces discoverability and overall usability of the showcase.

## 💡 Implementation Details

### What's Added:
1. **Skill Filter UI Section**
   - Dynamic skill tag generation from card data
   - "Clear All" button to reset filters
   - Responsive design for mobile devices

2. **Card Skill Tags Display**
   - Visual skill tags on each developer card
   - Hover effects and animations
   - Consistent styling with the existing theme

3. **Filtering Functionality**
   - Multi-select skill filtering
   - Works in combination with existing search and role filters
   - Real-time card filtering as skills are selected/deselected

4. **Template Update**
   - Updated contributor template with skill tags example
   - Added `data-skills` attribute for easy skill management

### Technical Changes:
- **index.html**: Added skill filter section, updated template card, enhanced JavaScript filtering logic
- **style.css**: Added styles for skill filter section, skill tags, and mobile responsiveness

### How to Use (For Contributors):
1. Add `data-skills` attribute to your card div with comma-separated skills:
   ```html
   <div class="card" data-skills="javascript,react,frontend">
   ```

2. Add visual skill tags inside card-inner:
   ```html
   <div class="card-skills">
       <span class="skill-tag">JavaScript</span>
       <span class="skill-tag">React</span>
       <span class="skill-tag">Frontend</span>
   </div>
   ```

### Example Skills:
- **Languages**: JavaScript, Python, Java, C++, Go, Rust, TypeScript
- **Frontend**: React, Vue, Angular, HTML, CSS, Tailwind
- **Backend**: Node.js, Django, Flask, Spring, Express
- **Database**: MongoDB, PostgreSQL, MySQL, Redis
- **DevOps**: Docker, Kubernetes, AWS, Azure, CI/CD
- **Mobile**: React Native, Flutter, Android, iOS
- **Other**: Git, Linux, OpenSource, Leadership

## 📸 Features Showcase
- ✅ Dynamic skill tag generation from existing cards
- ✅ Multi-select filtering with visual feedback
- ✅ Responsive design for all screen sizes
- ✅ Smooth animations and transitions
- ✅ Works seamlessly with existing filters (search, role, sort)
- ✅ Clear all functionality for easy reset
- ✅ Backward compatible (cards without skills still display)

## 🧪 Testing Done
- ✅ Tested skill filtering with multiple selections
- ✅ Verified combination with search and role filters
- ✅ Checked responsive design on mobile devices
- ✅ Validated backward compatibility with existing cards
- ✅ Tested "Clear All" functionality

## 📱 Responsive Design
The feature is fully responsive and works on:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🔄 Backward Compatibility
- Cards without `data-skills` attribute will continue to work normally
- No breaking changes to existing functionality
- All existing filters and features remain functional

## 🎨 UI/UX Improvements
- Intuitive chip-based filter interface
- Visual feedback on selected skills
- Smooth hover and click animations
- Consistent with existing design language
- Clear visual hierarchy

## 📝 Notes for Reviewers
- The skill tags are automatically extracted from `data-skills` attributes
- Skills are case-insensitive for filtering
- Multiple skills can be selected simultaneously
- The feature enhances discoverability without affecting existing functionality

## 🔗 Related Issue
Closes #[issue-number] (if applicable)

---

**Branch**: `skill-tag-filter`  
**Base Branch**: `main`  
**Type**: Feature Enhancement  
**Breaking Changes**: None
