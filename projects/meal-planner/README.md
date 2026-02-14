# Meal Planner 🥗

A comprehensive daily meal planning application that helps users create balanced, nutritious meal plans with nutrition tracking, progress visualization, and smart meal suggestions. Perfect for anyone looking to maintain a healthy diet and track their nutritional intake.

## 🌟 Features

### Core Functionality
- **Daily Meal Planning**: Organize meals by breakfast, lunch, dinner, and snacks
- **Nutrition Tracking**: Real-time calculation of calories, protein, carbs, and fats
- **Progress Visualization**: Interactive charts and progress bars for nutrition goals
- **Meal Management**: Add, edit, and delete meals with detailed nutritional information

### Smart Features
- **Meal Suggestions**: Categorized suggestions (balanced, high-protein, low-carb, vegetarian)
- **Nutrition Goals**: Customizable daily nutrition targets with progress tracking
- **Date Navigation**: Plan meals for different days with easy navigation
- **Data Persistence**: All meal plans saved locally in your browser

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Interface**: Clean, modern UI with smooth animations
- **Visual Feedback**: Progress bars and charts for immediate nutrition insights
- **Quick Actions**: One-click meal additions from suggestions

## 🎯 Problem It Solves

- **Meal Planning Complexity**: Users struggle with creating balanced meals manually
- **Nutrition Tracking**: Difficulty monitoring daily nutritional intake
- **Healthy Eating**: Lack of guidance for maintaining healthy eating habits
- **Time Management**: Time-consuming process of planning and tracking meals

## 💡 Solution Overview

The Meal Planner provides:
- **Structured Planning**: Organized meal categories for systematic planning
- **Nutrition Awareness**: Real-time feedback on nutritional balance
- **Smart Suggestions**: AI-powered meal recommendations based on preferences
- **Progress Tracking**: Visual indicators for achieving nutrition goals

## 📊 Nutrition Tracking

### Macronutrient Goals (Default)
- **Calories**: 2,000 kcal/day
- **Protein**: 150g/day
- **Carbohydrates**: 250g/day
- **Fats**: 67g/day

### Visual Indicators
- **Progress Bars**: Real-time progress toward daily goals
- **Nutrition Chart**: Doughnut chart showing macronutrient distribution
- **Color Coding**: Green for good progress, orange for approaching limits

## 🥗 Meal Categories

### Breakfast
- Morning meals and breakfast items
- Focus on energy-boosting nutrients

### Lunch
- Midday meals with balanced nutrition
- Sustained energy throughout the afternoon

### Dinner
- Evening meals with lighter options
- Recovery and restorative nutrients

### Snacks
- Healthy snacks between meals
- Portion-controlled nutritional boosts

## 🍎 Meal Suggestions System

### Categories Available
1. **Balanced**: Well-rounded meals with all macronutrients
2. **High-Protein**: Protein-focused meals for muscle building
3. **Low-Carb**: Reduced carbohydrate options
4. **Vegetarian**: Plant-based meal options

### Sample Meals
- **Balanced**: Grilled Chicken Salad, Quinoa Bowl, Turkey Wrap
- **High-Protein**: Salmon with Broccoli, Chicken Breast, Tofu Stir Fry
- **Low-Carb**: Avocado Chicken Salad, Grilled Steak, Cauliflower Rice
- **Vegetarian**: Chickpea Curry, Vegetable Stir Fry, Lentil Soup

## 🚀 Getting Started

1. **Access the Planner**: Open the meal planner in your browser
2. **Navigate Dates**: Use arrow buttons to plan for different days
3. **Add Meals**: Click "Add Meal" buttons for each meal category
4. **Input Nutrition**: Enter meal details with nutritional information
5. **Track Progress**: Monitor your nutrition goals with visual indicators
6. **Use Suggestions**: Browse and add suggested meals for quick planning

## 💻 Technical Details

### Technologies Used
- **HTML5**: Semantic markup and responsive structure
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **JavaScript ES6+**: Core functionality and DOM manipulation
- **Chart.js**: Interactive data visualization
- **Local Storage API**: Client-side data persistence

### Architecture
- **Modular Design**: Separate HTML, CSS, and JavaScript files
- **Class-Based**: Object-oriented JavaScript structure
- **Event-Driven**: Interactive elements with event listeners
- **Data Validation**: Form validation for nutritional inputs

### Performance
- **Lightweight**: Minimal dependencies (only Chart.js)
- **Fast Loading**: Optimized for quick page loads
- **Efficient Storage**: Compact local storage usage
- **Responsive**: Optimized for all screen sizes

## 🎨 User Interface

### Design Philosophy
- **Clean & Modern**: Minimalist design with focus on functionality
- **Color Scheme**: Green-based palette for health and wellness
- **Typography**: Clear, readable fonts with proper hierarchy
- **Animations**: Subtle transitions and hover effects

### Responsive Breakpoints
- **Desktop**: Full feature set with multi-column layout
- **Tablet**: Adapted layout with maintained functionality
- **Mobile**: Single-column layout with touch-friendly controls

## 📱 Mobile Experience

- **Touch-Friendly**: Large buttons and touch targets
- **Swipe Navigation**: Easy date navigation on mobile
- **Optimized Forms**: Mobile-optimized input fields and modals
- **Responsive Charts**: Charts adapt to smaller screens

## 🔧 Customization

### Nutrition Goals
Modify default nutrition targets in the JavaScript:

```javascript
this.nutritionGoals = {
    calories: 2000,  // Change daily calorie goal
    protein: 150,    // Change protein goal (grams)
    carbs: 250,      // Change carbohydrate goal (grams)
    fats: 67         // Change fat goal (grams)
};
```

### Meal Categories
Add new meal categories by updating the HTML and JavaScript:

```html
<div class="meal-section" data-meal="newCategory">
    <h3>New Category</h3>
    <!-- Add meal items -->
</div>
```

### Styling Customization
Modify colors and themes in `style.css`:

```css
:root {
    --primary-color: #4CAF50;    /* Main theme color */
    --secondary-color: #81C784;  /* Secondary accent */
    --background: #f5f7fa;       /* Background color */
}
```

## 📊 Data Management

### Local Storage Structure
```json
{
    "2024-01-15": {
        "breakfast": [...],
        "lunch": [...],
        "dinner": [...],
        "snacks": [...]
    }
}
```

### Meal Object Structure
```json
{
    "name": "Grilled Chicken Salad",
    "calories": 350,
    "protein": 35,
    "carbs": 15,
    "fats": 18,
    "category": "lunch"
}
```

## 🌐 Browser Compatibility

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes
4. Test thoroughly on multiple devices
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Create a Pull Request

### Development Guidelines
- Maintain responsive design principles
- Ensure accessibility compliance
- Add proper error handling
- Test on multiple browsers and devices
- Follow existing code style and structure

## 📄 License

This project is part of the Dev Card Showcase and follows the same licensing terms as the main repository.

## 🙏 Acknowledgments

- **Chart.js**: Beautiful and responsive charts
- **Font Awesome**: Comprehensive icon library
- **Nutrition Data**: Based on USDA nutritional guidelines
- **UI Inspiration**: Modern web design trends and best practices

## 🔍 Troubleshooting

### Common Issues

**Meals Not Saving**
- Check browser local storage permissions
- Clear browser cache and try again
- Ensure JavaScript is enabled

**Charts Not Loading**
- Verify Chart.js CDN connection
- Check browser console for errors
- Try refreshing the page

**Incorrect Calculations**
- Verify meal nutritional data input
- Check for valid number formats
- Ensure all required fields are filled

**Mobile Display Issues**
- Check viewport meta tag
- Test on different screen sizes
- Verify CSS media queries

### Support

For technical issues:
1. Check browser developer console
2. Verify all files are properly loaded
3. Test in different browsers
4. Check network connectivity for CDN resources

### Feature Requests

- Additional meal categories
- Recipe integration
- Shopping list generation
- Nutrition goal customization
- Data export functionality

---

**Happy Meal Planning! 🥗** Plan nutritious meals and maintain a healthy lifestyle with ease!