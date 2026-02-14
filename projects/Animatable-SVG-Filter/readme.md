# Animatable SVG Filter

An interactive web application that allows users to experiment with SVG filters in real-time. Upload images and apply various visual effects including distortion, pixelation, and color shifting with live preview and animation capabilities.

## Features

- **Image Upload**: Upload your own images to apply filters
- **Multiple Filter Effects**:
  - Displacement distortion with turbulence
  - Pixelation effect
  - Color offset/shift
- **Real-time Controls**:
  - Scale adjustment (0-200)
  - X and Y frequency control (0-999)
  - Spread control (1-5)
  - Angle rotation (0-360°)
- **Animation**: Toggle automatic animation of filters
- **Interactive Preview**: See changes in real-time as you adjust parameters

## Technologies Used

- HTML5
- CSS3
- JavaScript
- SVG Filters (feDisplacementMap, feTurbulence, feMorphology, feComposite)

## Getting Started

### Installation

1. Clone the repository or download the project files
2. Navigate to the project directory
3. Open `index.html` in a modern web browser

No build process or dependencies required - it's a pure HTML/CSS/JavaScript application!

### Usage

1. **Upload an Image**: Click the "Upload Image" button and select an image from your device
2. **Adjust Parameters**: Use the sliders to modify:
   - **Scale**: Controls the intensity of the displacement effect
   - **X/Y Frequency**: Adjusts the turbulence frequency
   - **Spread**: Controls the spread of the effect
   - **Angle**: Rotates the effect
3. **Toggle Effects**: Use checkboxes to enable/disable:
   - **Animate**: Automatically animates the filter
   - **Image**: Toggle between uploaded image and gradient
   - **Pixelate**: Apply pixelation filter
   - **Color Offset**: Apply color shifting effect
4. **Experiment**: Try different combinations to create unique visual effects!

## How It Works

The application uses SVG filter primitives to create complex visual effects:

- `<feTurbulence>`: Generates noise patterns
- `<feDisplacementMap>`: Distorts the image based on the turbulence
- `<feMorphology>`: Creates dilation/erosion effects for pixelation
- `<feComposite>`: Combines filter effects

These filters are applied dynamically based on user input, allowing for real-time manipulation and creative experimentation.

## Browser Compatibility

This application works best in modern browsers that fully support SVG filters:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the project.


## Acknowledgments

Built as part of the dev-card-showcase project to demonstrate interactive SVG filter capabilities.
