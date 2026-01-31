# Dynamic Maze Generator

An interactive web-based maze game that generates random mazes using depth-first search algorithm and allows players to solve them in real-time.

## Features

- **Dynamic Maze Generation**: Creates unique mazes using DFS algorithm
- **Multiple Difficulty Levels**: Easy (10x10), Medium (15x15), Hard (20x20)
- **Real-time Timer**: Tracks completion time
- **Keyboard Controls**: Arrow keys for navigation
- **Hint System**: Press 'H' to briefly show the solution path
- **Reset Functionality**: Press 'R' or use reset button to restart

## How to Play

1. Select your preferred difficulty level
2. Click "Generate New Maze" to create a random maze
3. Use arrow keys to navigate the red player through the maze
4. Reach the green exit square to win
5. Try to beat your best time!

## Controls

- **Arrow Keys**: Move the player
- **R**: Reset player position
- **H**: Show hint (solution path for 2 seconds)

## Technologies Used

- HTML5 Canvas for rendering
- JavaScript (ES6+) for game logic
- CSS3 for styling

## Algorithm

The maze is generated using a depth-first search algorithm:
1. Start from the top-left corner
2. Randomly choose unvisited neighboring cells
3. Remove walls between cells to create paths
4. Backtrack when no unvisited neighbors remain
5. Continue until all cells are visited

This ensures a perfect maze with exactly one solution path from start to finish.