# Project Comparison Tool

A comprehensive side-by-side project comparison feature that helps users evaluate and compare multiple projects based on various metrics and criteria.

## Features

### 📊 Core Comparison Features
- **Multi-Project Support**: Select up to 3 projects for simultaneous comparison
- **Comprehensive Metrics**: Stars, forks, contributors, downloads, and more
- **Visual Comparisons**: Radar charts, bar charts, and line graphs for data visualization
- **Tech Stack Analysis**: Compare technologies and frameworks used
- **Feature Checklist**: Side-by-side feature comparison
- **Community Metrics**: Engagement, contributors, and activity analysis
- **Learning Difficulty**: Beginner, Intermediate, and Advanced ratings
- **Time Investment**: Estimated time to complete/learn each project

### 💾 Save & Share
- **Generate Shareable Links**: URL-based project sharing with query parameters
- **Save Comparisons**: Store comparisons locally for later reference
- **Export as PDF**: Download comparisons as professional PDF documents
- **Comparison History**: Access previously saved comparisons

### 🎯 Advanced Features
- **Project Search**: Filter projects by name and description
- **Comparison Filters**: Customize which metrics to display
- **Winner Badges**: Automatic calculation of best projects by category
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Instantly refresh comparison when projects are added/removed

## How to Use

### Getting Started
1. Open `project-comparison.html` in your browser
2. Search for projects using the search box
3. Select up to 3 projects by clicking them
4. The comparison automatically appears in tabs

### Viewing Comparisons

#### Overview Tab
- Quick summary of each project
- Basic statistics (stars, forks, contributors, downloads)
- Language and difficulty level

#### Metrics Tab
- Detailed comparison matrix
- Visual bars showing relative metrics
- Easy identification of leaders in each category

#### Charts Tab
- **Popularity Chart**: Stars vs Forks comparison
- **Community Chart**: Contributors and downloads
- **Radar Chart**: Multi-metric visualization
- **Difficulty Chart**: Learning curve comparison

#### Tech Stack Tab
- Technologies used by each project
- Compatibility indicators
- Technology overlap identification

#### Features Tab
- Feature-by-feature comparison
- Checklist format
- Visual indicators for available features

### Saving & Sharing

#### Save for Later
1. Click "Save" button in header
2. Enter a name for your comparison
3. Optionally add notes
4. Click "Save" to store locally

#### Share with Others
1. Click "Share" button
2. Copy the generated URL
3. Share via email, chat, or social media
4. Recipients can open the link to see the same comparison

#### Export to PDF
1. Click "Export PDF" button
2. Save the PDF file to your computer
3. Share or print the document

## Comparison Metrics

### Popularity Metrics
- **Stars**: GitHub stars count
- **Forks**: Number of forks
- **Downloads**: Total downloads

### Community Metrics
- **Contributors**: Active project contributors
- **Community Level**: Very High, High, Medium, Low
- **Activity**: Recent engagement

### Learning & Difficulty
- **Difficulty Level**: Beginner, Intermediate, Advanced
- **Time Estimate**: Hours needed to complete/learn
- **Ease of Use Score**: Based on difficulty

### Technical Metrics
- **Tech Stack**: Languages and frameworks
- **Compatibility**: How well technologies work together
- **Performance**: Speed and efficiency

### Project-Specific
- **Features**: Available functionality
- **Documentation**: Quality and completeness
- **Support**: Community support level

## Winner Categories

The tool automatically calculates and displays winners in:
- 🏆 **Most Popular**: Project with most stars
- 🏆 **Most Active Community**: Project with most contributors
- 🏆 **Beginner Friendly**: Easiest project to learn
- 🏆 **Most Downloaded**: Most popular by downloads

## API & URL Parameters

### Share via URL
```
/project-comparison.html?projects=1,2,3
```

Where the numbers are project IDs separated by commas.

### Example:
```
https://dev-card-showcase.com/project-comparison.html?projects=1,2,3
```

## Data Structure

Each project should have:
```javascript
{
    id: 1,
    name: "Project Name",
    description: "Project description",
    stars: 100,
    forks: 50,
    contributors: 10,
    downloads: 500,
    difficulty: "Intermediate",
    timeEstimate: "20-30 hours",
    techStack: ["JavaScript", "React"],
    features: ["Feature 1", "Feature 2"],
    community: "High",
    language: "JavaScript"
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for visualizations
- **PDF Export**: html2pdf.js
- **Data Storage**: LocalStorage for saved comparisons
- **Data Format**: JSON

## Features in Detail

### Project Selection
- Search and filter projects
- Select up to 3 projects
- Disabled state for projects beyond limit
- Visual feedback for selected projects

### Comparison Matrix
- Automatically normalizes metrics for fair comparison
- Visual bar fills show relative performance
- Supports up to 10 different metrics

### Chart Visualizations
- **Bar Chart**: Perfect for comparing absolute values
- **Radar Chart**: Multi-dimensional comparison
- **Line Chart**: Trend visualization
- Responsive to window resizing

### Saved Comparisons
- Store up to 100 comparisons locally
- Delete individual or all comparisons
- Load saved comparison with one click
- Includes timestamp for each save

## Keyboard Shortcuts

| Action | Method |
|--------|--------|
| Select Project | Click on project name |
| Remove Project | Click × button on project card |
| Switch Tab | Click tab button |
| Open Save Modal | Click "Save" button |
| Share Comparison | Click "Share" button |

## Accessibility

- Semantic HTML structure
- Proper contrast ratios
- Keyboard navigation support
- Focus states on interactive elements
- Screen reader friendly

## Performance Tips

- Use search to quickly find projects
- Clear old saved comparisons regularly
- Browser storage is limited (~5-10MB)
- Charts auto-resize for optimal viewing

## Troubleshooting

### Projects Won't Load
- Check if `projects.json` exists in root directory
- Verify JSON format is valid
- Check browser console for errors

### Charts Not Displaying
- Try refreshing the page
- Ensure JavaScript is enabled
- Check for console errors

### PDF Export Issues
- Large comparisons may take longer
- Disable browser extensions
- Try a different browser

## Future Enhancements

- Real-time project data from GitHub API
- Custom metric creation
- Comparison templates
- Collaborative comparisons
- Advanced filtering options
- Export to Excel/CSV
- Trending project comparisons

## Privacy

- All comparisons are stored locally in your browser
- No data is sent to external servers
- Shared URLs contain only project IDs
- Clear browser data to remove saved comparisons

## Notes

- Comparisons are browser-specific (not synced across devices)
- Clearing browser storage will delete saved comparisons
- Projects.json should be in the root directory
- Maximum 3 projects can be compared at once

## License

This project comparison tool is part of the Dev Card Showcase project.

---

**Make Informed Decisions!** 📊 Compare projects and choose the best fit for your needs.
