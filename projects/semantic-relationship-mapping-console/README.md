# Semantic Relationship Mapping Console

A web-based console for visualizing and managing semantic relationships between concepts, entities, and ideas.

## Features

- **Interactive Graph Visualization**: Drag-and-drop nodes and relations with zoom and pan controls
- **Multiple Layout Algorithms**: Force-directed, circular, hierarchical, and random layouts
- **Relation Types**: Support for various semantic relationships (is-a, part-of, related-to, etc.)
- **List View**: Alternative tabular view of nodes and relations
- **Analytics Dashboard**: Graph metrics including degree distribution, clustering coefficient, and connectivity
- **Settings Management**: Customizable node sizes, relation widths, and display options
- **Export Functionality**: Save your semantic maps as JSON files
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

1. Open `index.html` in a web browser
2. Click "Add Node" to create new concepts or entities
3. Select two nodes and click "Add Relation" to connect them
4. Use the graph view to visualize and interact with your semantic map
5. Switch to analytics to see graph metrics
6. Export your work when finished

## Node Types

- **Concept**: Abstract ideas or categories
- **Entity**: Concrete objects or individuals
- **Attribute**: Properties or characteristics
- **Event**: Actions or occurrences

## Relation Types

- **is-a**: Hierarchical relationships (e.g., cat is-a animal)
- **part-of**: Meronymic relationships (e.g., wheel part-of car)
- **related-to**: General associations
- **causes**: Causal relationships
- **synonym**: Equivalent meanings
- **antonym**: Opposite meanings
- **instance-of**: Specific examples
- **causes**: Causal connections

## Keyboard Shortcuts

- `Ctrl+N`: Add new node
- `Ctrl+R`: Add new relation
- `Delete`: Remove selected items
- `Ctrl+Z`: Undo (future feature)

## Layout Algorithms

- **Force Directed**: Physically-based layout that minimizes edge crossings
- **Circular**: Arranges nodes in a circle
- **Hierarchical**: Organizes nodes by levels
- **Random**: Random node placement

## Analytics Metrics

- **Total Nodes/Relations**: Basic counts
- **Average Degree**: Mean number of connections per node
- **Connected Components**: Number of separate graph components
- **Diameter**: Longest shortest path between any two nodes
- **Clustering Coefficient**: Measure of node clustering

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Technologies Used

- HTML5 Canvas for graph rendering
- CSS3 for styling and animations
- JavaScript (ES6+) for interactivity
- No external dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the dev-card-showcase and follows the same license terms.

## Future Enhancements

- Undo/redo functionality
- Import from JSON/CSV
- Advanced search and filtering
- Collaborative editing
- Path finding algorithms
- Export to various formats (PNG, SVG, GraphML)

## Contact

For questions or feedback, please visit the main dev-card-showcase repository.