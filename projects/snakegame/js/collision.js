/**
 * collision.js
 * Collision detection utilities for TitleSnake
 * Provides efficient collision checking functions
 */

import { CONFIG } from './game-state.js';

/**
 * Check if a position is within grid bounds
 * @param {{x: number, y: number}} position
 * @returns {boolean}
 */
export function isInBounds(position) {
    return (
        position.x >= 0 &&
        position.x < CONFIG.GRID_WIDTH &&
        position.y >= 0 &&
        position.y < CONFIG.GRID_HEIGHT
    );
}

/**
 * Check if two positions are equal
 * @param {{x: number, y: number}} pos1
 * @param {{x: number, y: number}} pos2
 * @returns {boolean}
 */
export function positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Check if a position collides with any segment in an array
 * @param {{x: number, y: number}} position
 * @param {Array<{x: number, y: number}>} segments
 * @returns {boolean}
 */
export function collidesWithSegments(position, segments) {
    return segments.some(segment => positionsEqual(position, segment));
}

/**
 * Check if snake head collides with walls
 * @param {{x: number, y: number}} head
 * @returns {boolean}
 */
export function checkWallCollision(head) {
    return !isInBounds(head);
}

/**
 * Check if snake head collides with its body
 * @param {{x: number, y: number}} head
 * @param {Array<{x: number, y: number}>} body - Snake body excluding head
 * @returns {boolean}
 */
export function checkSelfCollision(head, body) {
    return collidesWithSegments(head, body);
}

/**
 * Check if snake head collides with food
 * @param {{x: number, y: number}} head
 * @param {{x: number, y: number}} food
 * @returns {boolean}
 */
export function checkFoodCollision(head, food) {
    if (!food) return false;
    return positionsEqual(head, food);
}

/**
 * Get all empty positions on the grid
 * @param {Array<{x: number, y: number}>} snake
 * @returns {Array<{x: number, y: number}>}
 */
export function getEmptyPositions(snake) {
    const emptyPositions = [];

    for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            const position = { x, y };
            if (!collidesWithSegments(position, snake)) {
                emptyPositions.push(position);
            }
        }
    }

    return emptyPositions;
}

/**
 * Calculate Manhattan distance between two positions
 * @param {{x: number, y: number}} pos1
 * @param {{x: number, y: number}} pos2
 * @returns {number}
 */
export function manhattanDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Check if a move in a direction would be valid
 * @param {{x: number, y: number}} position
 * @param {{x: number, y: number}} direction
 * @param {Array<{x: number, y: number}>} obstacles
 * @returns {boolean}
 */
export function isValidMove(position, direction, obstacles) {
    const newPosition = {
        x: position.x + direction.x,
        y: position.y + direction.y,
    };

    if (!isInBounds(newPosition)) {
        return false;
    }

    if (collidesWithSegments(newPosition, obstacles)) {
        return false;
    }

    return true;
}

/**
 * Get all valid neighboring positions
 * @param {{x: number, y: number}} position
 * @param {Array<{x: number, y: number}>} obstacles
 * @returns {Array<{x: number, y: number}>}
 */
export function getValidNeighbors(position, obstacles) {
    const directions = [
        { x: 0, y: -1 }, // up
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }, // left
        { x: 1, y: 0 },  // right
    ];

    const neighbors = [];

    for (const direction of directions) {
        const neighbor = {
            x: position.x + direction.x,
            y: position.y + direction.y,
        };

        if (isInBounds(neighbor) && !collidesWithSegments(neighbor, obstacles)) {
            neighbors.push(neighbor);
        }
    }

    return neighbors;
}

/**
 * Check if the grid has any empty spaces
 * @param {Array<{x: number, y: number}>} snake
 * @returns {boolean}
 */
export function hasEmptySpaces(snake) {
    const totalCells = CONFIG.GRID_WIDTH * CONFIG.GRID_HEIGHT;
    return snake.length < totalCells;
}

/**
 * Detect if snake is trapped (no valid moves)
 * @param {{x: number, y: number}} head
 * @param {Array<{x: number, y: number}>} body
 * @returns {boolean}
 */
export function isTrapped(head, body) {
    const validNeighbors = getValidNeighbors(head, body);
    return validNeighbors.length === 0;
}
