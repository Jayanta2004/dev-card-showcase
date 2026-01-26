// Terminal commands and data
const commands = {
    help: {
        description: 'Show available commands',
        execute: () => {
            return `Available commands:
  help     - Show this help message
  about    - About me
  projects - List my projects
  skills   - My technical skills
  contact  - Contact information
  clear    - Clear the terminal
  date     - Show current date
  whoami   - Show current user
  ls       - List directory contents
  pwd      - Show current directory
  echo     - Echo text to terminal

Type a command followed by --help for more info.
Example: projects --help`;
        }
    },

    about: {
        description: 'About me',
        execute: () => {
            return `╔══════════════════════════════════════════════════════════════╗
║                      ABOUT ME                                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Hi! I'm Sneha Amballa, a passionate developer and          ║
║  creative coder. I love building interactive web            ║
║  applications and exploring new technologies.               ║
║                                                              ║
║  My journey in programming started with curiosity and       ║
║  has evolved into a deep passion for creating digital       ║
║  experiences that matter.                                   ║
║                                                              ║
║  When I'm not coding, you can find me exploring new         ║
║  technologies, contributing to open source projects,        ║
║  or enjoying a good cup of coffee.                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
        }
    },

    projects: {
        description: 'List my projects',
        execute: (args) => {
            if (args.includes('--help')) {
                return `projects - List my projects

Usage: projects [filter]

Filters:
  --web     - Show web development projects
  --games   - Show game development projects
  --all     - Show all projects (default)

Examples:
  projects
  projects --games
  projects --web`;
            }

            const projects = [
                { name: 'Dungeon Escape', type: 'game', desc: 'Grid-based dungeon adventure game' },
                { name: 'Retro Racing', type: 'game', desc: 'Top-down racing game with obstacles' },
                { name: 'Island Builder', type: 'game', desc: 'Cozy tile-placement strategy game' },
                { name: 'Gravity Golf', type: 'game', desc: 'Physics-based puzzle golf game' },
                { name: 'AI Prompt Playground', type: 'web', desc: 'Interactive AI prompt testing tool' },
                { name: 'Algorithm Visualizer', type: 'web', desc: 'Visual algorithm demonstration tool' },
                { name: '2048 Game', type: 'game', desc: 'Classic sliding puzzle game' },
                { name: 'Weather App', type: 'web', desc: 'Real-time weather information app' },
                { name: 'Todo List', type: 'web', desc: 'Task management application' },
                { name: 'Calculator', type: 'web', desc: 'Scientific calculator with history' }
            ];

            let filteredProjects = projects;
            if (args.includes('--games')) {
                filteredProjects = projects.filter(p => p.type === 'game');
            } else if (args.includes('--web')) {
                filteredProjects = projects.filter(p => p.type === 'web');
            }

            let output = `My Projects (${filteredProjects.length}):\n\n`;

            filteredProjects.forEach((project, index) => {
                const typeIcon = project.type === 'game' ? '🎮' : '🌐';
                output += `${index + 1}. ${typeIcon} ${project.name}\n`;
                output += `   ${project.desc}\n\n`;
            });

            output += 'Use "projects --help" for more options.';
            return output;
        }
    },

    skills: {
        description: 'My technical skills',
        execute: () => {
            return `╔══════════════════════════════════════════════════════════════╗
║                      TECHNICAL SKILLS                          ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  🚀 Programming Languages:                                  ║
║     • JavaScript (ES6+)                                     ║
║     • Python                                                ║
║     • HTML5 / CSS3                                          ║
║     • SQL                                                   ║
║                                                              ║
║  🎨 Frontend Development:                                   ║
║     • React.js                                              ║
║     • Vue.js                                                ║
║     • HTML5 Canvas                                          ║
║     • CSS Animations                                        ║
║     • Responsive Design                                     ║
║                                                              ║
║  ⚙️  Backend Development:                                   ║
║     • Node.js                                               ║
║     • Express.js                                            ║
║     • REST APIs                                             ║
║     • Database Design                                       ║
║                                                              ║
║  🎮 Game Development:                                       ║
║     • HTML5 Canvas Games                                    ║
║     • Game Physics                                          ║
║     • Animation Systems                                     ║
║                                                              ║
║  🛠️  Tools & Technologies:                                  ║
║     • Git & GitHub                                          ║
║     • VS Code                                               ║
║     • Chrome DevTools                                       ║
║     • npm / yarn                                            ║
║     • Figma                                                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
        }
    },

    contact: {
        description: 'Contact information',
        execute: () => {
            return `╔══════════════════════════════════════════════════════════════╗
║                      CONTACT ME                                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  📧 Email:    sneha.amballa@example.com                     ║
║  💼 LinkedIn: linkedin.com/in/sneha-amballa                 ║
║  🐙 GitHub:   github.com/Sneha-Amballa                       ║
║  🐦 Twitter:  @SnehaAmballa                                  ║
║                                                              ║
║  Feel free to reach out for collaborations, questions,      ║
║  or just to say hello! I'm always excited to connect        ║
║  with fellow developers and creative minds.                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;
        }
    },

    clear: {
        description: 'Clear the terminal',
        execute: () => {
            document.getElementById('terminal-output').innerHTML = '';
            return '';
        }
    },

    date: {
        description: 'Show current date',
        execute: () => {
            return `Current date: ${new Date().toLocaleString()}`;
        }
    },

    whoami: {
        description: 'Show current user',
        execute: () => {
            return 'guest@retro-terminal';
        }
    },

    ls: {
        description: 'List directory contents',
        execute: () => {
            return `drwxr-xr-x  2 guest guest 4096 Jan 26 23:12 .
drwxr-xr-x 15 guest guest 4096 Jan 26 23:12 ..
-rw-r--r--  1 guest guest 1024 Jan 26 23:12 README.md
-rw-r--r--  1 guest guest 2048 Jan 26 23:12 portfolio.html
drwxr-xr-x  2 guest guest 4096 Jan 26 23:12 projects/
drwxr-xr-x  2 guest guest 4096 Jan 26 23:12 assets/`;
        }
    },

    pwd: {
        description: 'Show current directory',
        execute: () => {
            return '/home/guest/portfolio';
        }
    },

    echo: {
        description: 'Echo text to terminal',
        execute: (args) => {
            return args.join(' ');
        }
    }
};

// Terminal state
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

// DOM elements
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

// Initialize terminal
function initTerminal() {
    terminalInput.addEventListener('keydown', handleKeyDown);
    terminalInput.addEventListener('input', handleInput);

    // Focus input on click anywhere
    document.addEventListener('click', () => {
        terminalInput.focus();
    });

    // Show welcome message with typing animation
    typeText('Welcome to Retro Terminal v1.0.0\nType \'help\' for available commands.\n\n', () => {});
}

// Handle keyboard input
function handleKeyDown(event) {
    if (isTyping) return;

    switch (event.key) {
        case 'Enter':
            event.preventDefault();
            executeCommand(terminalInput.value.trim());
            terminalInput.value = '';
            break;
        case 'ArrowUp':
            event.preventDefault();
            navigateHistory(-1);
            break;
        case 'ArrowDown':
            event.preventDefault();
            navigateHistory(1);
            break;
        case 'Tab':
            event.preventDefault();
            autoComplete();
            break;
    }
}

function handleInput(event) {
    // Prevent input during typing animation
    if (isTyping) {
        event.preventDefault();
        return;
    }
}

// Execute command
function executeCommand(input) {
    if (!input) return;

    // Add command to history
    commandHistory.push(input);
    historyIndex = commandHistory.length;

    // Display command
    const commandLine = `C:\\Users\\Guest>${input}\n`;
    appendOutput(commandLine);

    // Parse command
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Execute command
    if (commands[command]) {
        try {
            const result = commands[command].execute(args);
            if (result) {
                typeText(result + '\n\n', () => {});
            } else {
                appendOutput('\n');
            }
        } catch (error) {
            typeText(`Error executing command: ${error.message}\n\n`, () => {});
        }
    } else {
        typeText(`Command not found: ${command}. Type 'help' for available commands.\n\n`, () => {});
    }
}

// Navigate command history
function navigateHistory(direction) {
    const newIndex = historyIndex + direction;
    if (newIndex >= 0 && newIndex < commandHistory.length) {
        historyIndex = newIndex;
        terminalInput.value = commandHistory[historyIndex];
    }
}

// Auto-complete commands
function autoComplete() {
    const input = terminalInput.value.toLowerCase();
    const matches = Object.keys(commands).filter(cmd => cmd.startsWith(input));

    if (matches.length === 1) {
        terminalInput.value = matches[0];
    } else if (matches.length > 1) {
        appendOutput(`\nPossible completions: ${matches.join(', ')}\n`);
        appendOutput(`C:\\Users\\Guest>${input}`);
    }
}

// Type text with animation
function typeText(text, callback) {
    isTyping = true;
    let index = 0;
    const element = document.createElement('span');
    element.className = 'typing';
    terminalOutput.appendChild(element);

    const timer = setInterval(() => {
        element.textContent += text[index];
        index++;

        if (index >= text.length) {
            clearInterval(timer);
            element.classList.remove('typing');
            isTyping = false;
            if (callback) callback();
        }
    }, 30);
}

// Append output without animation
function appendOutput(text) {
    const element = document.createElement('span');
    element.textContent = text;
    terminalOutput.appendChild(element);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// Start the terminal
document.addEventListener('DOMContentLoaded', initTerminal);