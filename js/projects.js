// Global variables
let allProjectsData = []; // Combined static and JSON projects
let filteredProjects = []; // Currently filtered projects
let projectCards = [];
let activeFilter = "all";
let currentPage = 1;
const projectsPerPage = 12;

const staticProjects = [
    {
        title: "Advanced Text Case Converter",
        description:
            "A powerful text utility that converts text into multiple cases including uppercase, lowercase, sentence case, title case, and toggle case with live preview, undo history, and keyboard shortcuts.",
        tags: ["HTML", "CSS", "JavaScript", "Utility Tool"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/advanced-text-case-converter",
            live: "https://sneha-amballa.github.io/advanced-text-case-converter/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Traffic Rules Quiz",
        description:
            "An interactive traffic awareness quiz that helps users test and reinforce their knowledge of road safety rules through multiple-choice questions, instant scoring, and performance-based feedback.",
        tags: ["HTML", "CSS", "JavaScript", "Education", "Quiz"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/dev-card-showcase/tree/feature/traffic-rules-quiz/projects/traffic-rules-quiz",
            live: "https://sneha-amballa.github.io/dev-card-showcase/projects/traffic-rules-quiz/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Word Memory Game",
        description:
            "Word Memory Game is an engaging web application that challenges players to memorize and recall words within a time limit. It enhances vocabulary and memory skills through multiple levels of difficulty and interactive gameplay.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/word-memory-game/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Code Editor",
        description:
            "A professional code editor with multi-language support, customizable themes, real-time preview, and essential features like code download and clearing.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/code-editor/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Traffic Awareness Mini Website",
        description:
            "An interactive educational mini website designed to spread awareness about road safety, traffic rules, and responsible behavior for pedestrians, cyclists, and drivers using simple visuals and interactivity.",
        tags: ["HTML", "CSS", "JavaScript", "Education", "Awareness"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/dev-card-showcase/tree/feature/traffic-awareness-mini-website/projects/traffic-awareness-mini-website",
            live: "https://sneha-amballa.github.io/dev-card-showcase/projects/traffic-awareness-mini-website/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Colorful Quiz Challenge",
        description:
            "A bright, engaging quiz website with cheerful pastel shades and random questions on various fun topics. Features score tracking, hints, and celebration animations.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            github: "./projects/Quiz/index.html",
            live: "./projects/Quiz/",
        },
        author: {
            name: "Armaan",
            github: "https://github.com/iarmaanx",
        },
    },
    {
        title: "GitHub PR Analyzer",
        description:
            "A web application that analyzes GitHub Pull Requests by extracting key metrics from any public PR URL. It displays lines added/deleted, files changed, and calculates an estimated effort score with visual indicators.",
        tags: ["HTML", "CSS", "JavaScript", "GitHub API"],
        links: {
            live: "./projects/PRanalyzer/",
        },
        author: {
            name: "Armaan",
            github: "https://github.com/iarmaanx",
        },
    },
    {
        title: "Traffic Rule Myths & Safety Tips",
        description:
            "An educational section that debunks common traffic rule myths and provides quick, practical safety tips to correct misconceptions and promote safer road behavior.",
        tags: ["HTML", "CSS", "JavaScript", "Education", "Awareness"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/dev-card-showcase/tree/feature/traffic-myths-safety-tips/projects/traffic-myths-safety-tips",
            live: "https://sneha-amballa.github.io/dev-card-showcase/projects/traffic-myths-safety-tips/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Lo-Fi Study Room 🎧",
        description:
            "A relaxing virtual study space with rain, fireplace, and lo-fi music ambience. Features day-night toggle, Pomodoro timer, interactive desk items with hover animations, and environmental controls. Perfect for focused studying sessions.",
        tags: [
            "Virtual Study Space",
            "Lo-Fi Music",
            "Pomodoro Timer",
            "Ambience Controls",
            "Interactive Desk",
        ],
        links: {
            github: "https://github.com/neeru24",
            live: "./projects/lo-fiSTUDYROOM/",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "Basket Ball Game",
        description:
            "A 3D basketball shooting game built with Three.js and Cannon.js where players can aim and shoot basketballs into a hoop, keeping track of their score and time.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/basket-ball-game/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Road Accident & Emergency Awareness",
        description:
            "An awareness-focused informational page that explains the correct actions to take during road accidents or emergency situations, helping users stay calm, safe, and informed.",
        tags: ["HTML", "CSS", "JavaScript", "Education", "Safety"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/dev-card-showcase/tree/feature/road-accident-emergency-awareness/projects/road-accident-emergency-awareness",
            live: "https://sneha-amballa.github.io/dev-card-showcase/projects/road-accident-emergency-awareness/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Unit Convertor",
        description:
            "A versatile unit converter that allows users to convert between various units of length, weight, temperature, and volume with a user-friendly interface.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Unit-Converter/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Pedestrian & Cyclist Safety Awareness",
        description:
            "An awareness-focused page highlighting essential safety rules, rights, and best practices for pedestrians and cyclists to help reduce road accidents and promote responsible road usage.",
        tags: ["HTML", "CSS", "Education", "Safety", "Awareness"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/dev-card-showcase/tree/feature/pedestrian-cyclist-safety-awareness/projects/pedestrian-cyclist-safety-awareness",
            live: "https://sneha-amballa.github.io/dev-card-showcase/projects/pedestrian-cyclist-safety-awareness/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Traffic Signs Recognition Guide",
        description:
            "A visual learning guide that helps users recognize common traffic signs by displaying sign images along with their names and descriptions, organized into clear categories for better understanding.",
        tags: ["HTML", "CSS", "JavaScript", "Education", "UI"],
        links: {
            github:
                "https://github.com/Sneha-Amballa/dev-card-showcase/tree/feature/traffic-signs-recognition-guide/projects/traffic-signs-recognition-guide",
            live: "https://sneha-amballa.github.io/dev-card-showcase/projects/traffic-signs-recognition-guide/",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Number Guess",
        description: "Think you can outsmart the number?",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/numberguess/",
        },
        author: {
            name: "Armaan",
            github: "https://github.com/iarmaanx",
        },
    },
    {
        title: "Countdown Timer",
        description: "Countdown Timer",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/countdown/",
        },
        author: {
            name: "Armaan",
            github: "https://github.com/iarmaanx",
        },
    },
    {
        title: "Random Dice Generator",
        description:
            "A simple and interactive dice rolling simulator. Press the button to roll the dice and get a random number from 1 to 6.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/random-dice-generator/",
        },
        author: {
            name: "Gemini",
            github: "https://github.com/gemini",
        },
    },
    {
        title: "Data Visualization",
        description:
            "A web application that visualizes data using interactive charts and graphs. Users can upload datasets and explore trends through various visualization types.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/data-visualization-tool/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Study Planer",
        description:
            "A web application that helps users create and manage their study schedules effectively. Users can add subjects, set study goals, and track their progress over time.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/studyplanner/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Advanced Text Case Convertor",
        description:
            "A web application that allows users to convert text into various cases such as uppercase, lowercase, title case, sentence case, and toggle case with additional features like live preview and undo history.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            github:
                "./projects/Advanced_TextCaseConverter_live_processing_clipboard_integration/",
            live: "./projects/Advanced_TextCaseConverter_live_processing_clipboard_integration/index.html",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "Tab Organizer",
        description: "Save and organize your URLs into Categories",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            github: "./projects/Tab-organiser",
            live: "./projects/Tab-organiser/index.html",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "Word Twist Challenge",
        description:
            "A fun and engaging word twist game where players create as many words as possible from a given set of letters within a time limit. Features scoring, hints, and a leaderboard.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/word-twist-challenge/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Quantum Dice Roller",
        description:
            "A quantum physics-inspired dice roller that simulates entangled dice, superposition collapse, and explores probability distributions with interactive quantum mechanics visualizations.",
        tags: [
            "HTML",
            "CSS",
            "JavaScript",
            "Quantum Physics",
            "Probability",
            "Visualization",
        ],
        links: {
            github: "https://github.com/neeru24",
            live: "./projects/quantumDiceRoll/index.html",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "KeyCode Reveal",
        description:
            "A web application that displays the keycode, key name, and other details of any key pressed on the keyboard in real-time.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            github: "./projects/keycodeReveal",
            live: "./projects/keycodeReveal/index.html",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "Mini Geo Guesser",
        description:
            "A fun geography game where players guess locations based on images and clues, testing their knowledge of world geography.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Mini Geo Guesser/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Space Invaders",
        description:
            "A classic arcade-style Space Invaders game featuring player lives, alien shooting, defensive shields, multiple waves, and increasing difficulty, built with pure web technologies.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/space-invaders/index.html",
        },
        author: {
            name: "Priyanshu",
            github: "https://github.com/PriyanshuSingh00-hub",
        },
    },
    {
        title: "Horse Run Game",
        description:
            "An exciting endless runner game where players control a horse to jump over obstacles and collect coins. Features increasing speed and score tracking for added challenge.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/horse-run-game/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Weather Sculprate Game",
        description:
            "An engaging weather-themed game where players sculpt clouds to match given weather conditions. Features multiple levels, scoring, and interactive gameplay.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/WeatherSculpture/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Hangman Game",
        description:
            "A classic Hangman game where players guess letters to reveal a hidden word before running out of attempts. Features multiple categories, hints, and a scoring system.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/hangman-game/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Typing Duel Game",
        description:
            "A competitive typing game where players race against an AI opponent to type words accurately and quickly. Features multiple difficulty levels and real-time score tracking.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Typing duel game/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Lottery Game",
        description:
            "A simple lottery game where players select numbers and check if they match randomly drawn winning numbers. Features instant feedback and a fun user interface.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/lottery-game/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Tab Focus Timer Project",
        description:
            "A productivity timer that tracks time spent on a task and pauses when the user switches browser tabs, helping maintain focus and manage time effectively.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/tab-focus-timer/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Reflex Game",
        description:
            "A fast-paced reflex-based mini game that measures how quickly users react to visual cues. The box changes color at a random time, challenging users to click instantly and test their reaction speed.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/reflex-game/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "File Size Converter",
        description:
            "A real-time utility that converts file sizes between Bytes, KB, MB, and GB instantly. Helps users quickly calculate and understand storage sizes with a clean, interactive interface.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/file-size-converter/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Date Based Note Taking App",
        description:
            "A private, browser-based diary application that lets users write, edit, search, and manage daily entries. Entries are stored securely in localStorage with a clean calendar-based and list-based view for easy navigation.",
        tags: ["HTML", "CSS", "JavaScript", "LocalStorage"],
        links: {
            live: "./projects/date-based-note-taking-app/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Focus Timer",
        description:
            "A productivity-focused timer that allows users to set custom focus and break durations, control the timer with start, pause, and reset actions, and track completed focus sessions to build consistent work habits.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/focus-timer/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Sorting Visualizer",
        description:
            "A web app that visually demonstrates various sorting algorithms like Bubble Sort, Merge Sort, and Quick Sort with adjustable speed and array size for educational purposes.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Sorting-Visualizer/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "CodeCanvas Editor",
        description:
            "A browser-based code editor with live preview for HTML, CSS, and JavaScript. Features include syntax highlighting, code snippet saving, multiple themes, auto-run, and responsive design. All data stored locally in browser.",
        tags: [
            "Code Editor",
            "Live Preview",
            "LocalStorage",
            "Theme Toggle",
            "Responsive",
        ],
        links: {
            github: "https://github.com/neeru24",
            live: "./projects/liveEditor/",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "VerboMemory",
        description:
            "An interactive word memory game that challenges players to recall words after a brief display. Improve focus, memory, and vocabulary in a fun way.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Verbo-memory/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Settings page Simulator",
        description:
            "A responsive settings page simulator with theme toggle, language selection, and notification preferences. Built with HTML, CSS, and JavaScript for a seamless user experience.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Settings_Page_Simulator/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Finance Tracker",
        description:
            "A simple and interactive personal finance app that allows users to track income and expenses, automatically calculates totals, and shows monthly balance. Perfect for managing budgets efficiently.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/finance-tracker/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Pino Project",
        description: "Pino",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/piano/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Number Challenge",
        description:
            "A fun and challenging number memory game where players memorize a sequence of numbers and recall them correctly within a limited time. Boosts focus, memory, and concentration.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/number-challenge/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Code Breaker",
        description:
            "A logic-based mini game where players crack a hidden numeric code using intelligent hints. Focuses on problem-solving, reasoning, and JavaScript conditional logic rather than speed or memory.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/code-breaker/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Todo List",
        description:
            "A simple and interactive To-Do List application that allows users to add, manage, and track their daily tasks with ease.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/todo-list/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Neno Snake Arena",
        description:
            "A classic snake game where players control a snake to eat food, grow longer, and avoid collisions. Features increasing speed and score tracking for added challenge.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Neon_Snake_Arena/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Text-particle converter",
        description:
            "Its an experimental and fun project which uses HTML Canvas to let users write a text which is then converted into particles with which the user can interact and have fun",
        tags: ["HTML", "CSS", "JavaScript", "Responsive", "Canvas"],
        links: {
            live: "./projects/text particle effect/index.html",
        },
        author: {
            name: "CodeMaster",
            github: "https://github.com/CodeMaster11000",
        },
    },
    {
        title: "Client-Side File Upload Handling",
        description:
            "A modern file upload feature with image, PDF, and document support. Users can preview files, view file size, and remove files before submission. Includes file type and size validation for a seamless experience.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/client-side-file-upload-preview/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Key Code",
        description:
            "An interactive web app that displays real-time key codes as users press keys on their keyboard. Useful for developers and enthusiasts to identify key codes for various keys.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/KeyCode/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Word Scrabble",
        description:
            "A daily Scrabble-style word puzzle where players create as many valid words as possible from a given set of letters. Boost vocabulary, spelling, and problem-solving skills.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/word-scrabble/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Pattern Match",
        description:
            "A color-based memory game inspired by the classic Simon game. Players memorize and repeat an increasing sequence of up to 30 dynamic colors, improving focus and visual memory.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/pattern-match/",
        },
        author: {
            name: "Anvesha",
            github: "https://github.com/your-github-username",
        },
    },
    {
        title: "Simple Interest Calculator",
        description:
            "A straightforward calculator that computes simple interest based on user-inputted principal amount, rate of interest, and time period.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/simple-interest-calculator/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "IF Else Decision Simulator",
        description:
            "A web application that simulates decision-making using if-else statements. Users can input conditions and see the corresponding outcomes based on their inputs.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/If-Else_Decision_Simulator/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Chess Game",
        description:
            "A web-based chess game that allows two players to play against each other with a user-friendly interface and basic game rules implemented.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/chess/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Keyboard Key Detector",
        description:
            "A simple QR code generator that allows users to create QR codes for URLs, text, or other data.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/keyboard-key-detector/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkar",
        },
    },
    {
        title: "Memory Card Flip Game",
        description:
            "A fun memory card flip game where players match pairs of cards by flipping them over. Test your memory skills and improve concentration!",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Memory Card Flip Game/index.html",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },
    {
        title: "Gradent Pattern",
        description:
            "A web application that generates random gradient patterns for backgrounds, allowing users to copy the CSS code for use in their own projects.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/GradientPattern/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkar",
        },
    },
    {
        title: "QR code Generator",
        description:
            "A simple QR code generator that allows users to create QR codes for URLs, text, or other data.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/qr-code-generator/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkar",
        },
    },
    {
        title: "Flappy Bird",
        description:
            "A polished Flappy Bird–style arcade game featuring smooth physics, start and game-over screens, collision detection, and real-time score tracking.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/flapping-bird/index.html",
        },
        author: {
            name: "Priyanshu",
            github: "https://github.com/PriyanshuSingh00-hub",
        },
    },
    {
        title: "Stick With Hero Game",
        description:
            "An engaging endless runner game where players control a hero character to jump over obstacles and collect points. Features increasing speed and score tracking for added challenge.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/stick-with-hero/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Predictor Game",
        description:
            "A premium, logic-based prediction game where players identify the next number or element in a sequence. Supports arithmetic, geometric, Fibonacci, alternating, and mixed patterns with instant feedback, score tracking, and a refined, luxurious user interface.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/predictor-game/index.html",
        },
        author: {
            name: "Priyanshu",
            github: "https://github.com/PriyanshuSingh00-hub",
        },
    },
    {
        title: "Music Player",
        description:
            "A web-based music player that allows users to play, pause, and skip through a playlist of songs with a user-friendly interface.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/music-player/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Dianosur running game",
        description:
            "A simple and addictive dinosaur running game where players control a dinosaur to jump over obstacles and score points.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/dianosur/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Git Commit App",
        description:
            "A web application that allows users to create and manage git commits with a user-friendly interface and essential git functionalities.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/GitCommit/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Ultimate Ride Game",
        description:
            "Ultimate Ride Game is an exciting web-based game where players navigate a vehicle through challenging terrains, avoiding obstacles and collecting rewards to achieve the highest score possible.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/ultimate-ride/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Pattern Predictor",
        description:
            "A logic-based prediction game where players analyze sequences and predict the next number, color, or symbol. Designed to improve pattern recognition and problem-solving skills.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/pattern-predictor/",
        },
        author: {
            name: "Priyanshu",
            github: "https://github.com/PriyanshuSingh00-hub",
        },
    },
    {
        title: "SQL Query Visualizer",
        description:
            "A web-based tool that helps users visualize SQL queries and their results in an interactive manner.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/SQL_Query_Visualizer/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Github User Finder",
        description:
            "A web application that allows users to search for GitHub profiles and view their details including repositories, followers, and more.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/gitHub-user-finder/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Responsive Card Slider",
        description:
            "A responsive card slider that allows users to navigate through a collection of cards with smooth animations and touch support.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Responsive Card Slider/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Connect Four Game project",
        description:
            "A classic Connect Four game where two players take turns dropping colored discs into a vertical grid, aiming to connect four in a row horizontally, vertically, or diagonally.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/connect-four-game/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Rock Paper Scissors Game",
        description:
            "A web application that allows users to play the classic Rock Paper Scissors game against the computer.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/rock-paper-scissor/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Terminal Motherlode Project",
        description:
            "A web-based terminal emulator that mimics a command-line interface, allowing users to execute basic commands and navigate through a simulated file system.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/terminal-typer/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Number Guessing Game",
        description:
            "An interactive number guessing game where users try to guess a secret number between 1 and 100 with limited attempts, real-time feedback, and helpful hints.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            github: "./projects/Number_Guessing_Game/",
            live: "./projects/Number_Guessing_Game/index.html",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Analog Clock",
        description:
            "An analog clock that displays the current time with hour, minute, and second hands, styled with CSS and updated using JavaScript.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/analog-clock/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Battery Detector",
        description:
            "A web application that detects and displays the current battery status of the user's device, including charge level and charging state.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/battery-detector-app/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "GIF Search App",
        description:
            "A web application that allows users to search for and view GIFs using the Giphy API.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/gif-search/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Breathing Interface",
        description:
            "A calming web application that guides users through breathing exercises with visual and audio cues to promote relaxation and mindfulness.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/BreathingInterface/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Pathfinding Visualizer",
        description:
            "An interactive pathfinding visualizer that demonstrates various algorithms like Dijkstra's, A*, BFS, and DFS on a grid with walls and weights.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Pathfinding_Visualizer/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "15 sliding pussle",
        description:
            "A classic 15 sliding puzzle game where players arrange numbered tiles in order by sliding them into an empty space.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/15 Sliding Puzzle/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Drag and Drop List",
        description:
            "A web application that allows users to create a list of items and reorder them using drag-and-drop functionality.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/DragAndDropList/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Mood Driven Music",
        description:
            "A web application that suggests music playlists based on the user's current mood.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Mood_Driven_Music_UI/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Typing speed test",
        description:
            "A web-based typing speed test that measures words per minute (WPM) and accuracy. Features a countdown timer, real-time feedback, and a summary of results at the end.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/typing-speed-test/",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Typing Quest",
        description:
            "An engaging typing game that challenges players to type words accurately and quickly to progress through levels and earn points.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Type-Quest/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Digital Clock",
        description:
            "A digital clock that displays the current time with hours, minutes, and seconds.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/digital-clock/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Whack a Project",
        description:
            "A fun and interactive Whack-a-Mole style game where players click on appearing targets to score points within a time limit.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Whack a Box/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Truth And Dare",
        description:
            "A fun web application that generates random truth questions and dare challenges for users to play with friends.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Truth&dare/index.html",
        },
        author: {
            name: "omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Virtual Control Pannel",
        description:
            "A virtual control panel that simulates various controls like buttons, switches, and sliders for interactive user experiences.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Virtual_Control_Panel/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Sudoku Solver",
        description:
            "A web application that solves Sudoku puzzles using backtracking algorithm and provides a user-friendly interface for inputting puzzles.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Sudoku_Solver/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Font Styler",
        description:
            "Convert input text into styled or fancy Unicode fonts for social media with one-click copy.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Font/index.html",
        },
        author: {
            name: "Neeru",
            github: "https://github.com/neeru24",
        },
    },

    {
        title: "Snake Game",
        description: "A classic snake game where players control a snake to eat food, grow longer, and avoid collisions. Features increasing speed and score tracking for added challenge.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/snake-game-project/index.html",
        },
        author: {
            name: "Kartikey Saxena",
            github: "https://github.com/kartikey-0",
        },
    },

    {
        title: "FruitMaster",
        description: "fruit hunting and collecting based game where players control a character to catch falling fruits while avoiding obstacles. Features increasing difficulty and score tracking for added fun.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/FruitMaster/index.html",
        },
        author: {
            name: "Kartikey Saxena",
            github: "https://github.com/kartikey-0",
        },
    },

    {
        title: "Imageular",
        description: "a lightweight image editing tool that allows users to upload images and perform essential adjustments such as rotation, flipping, cropping, brightness, contrast, and saturation control for improved visual output.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/Imageular/landing.html",
        },
        author: {
            name: "Kartikey Saxena",
            github: "https://github.com/kartikey-0",
        },
    },

    {
        title: "Solar System",
        description:
            "An interactive 3D model of the solar system that allows users to explore planets and their orbits.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/solar-system/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "URL Shorter",
        description:
            "A web application that shortens long URLs into concise, shareable links using a URL shortening service API.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/url-shortener/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Personal Diary",
        description:
            "A secure personal diary web application that allows users to write, save, and manage their daily entries with password protection.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/PersonalDiary/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Password Strength Checker",
        description:
            "Check the strength of your passwords to ensure they are secure and robust.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/password-strength-checker/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "PDF Merger Tool",
        description:
            "A web application that allows users to merge multiple PDF files into a single document.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/MergeDoc/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Unlimited Colors",
        description:
            "A web application that generates unlimited random colors in HEX, RGB, and HSL formats with copy-to-clipboard functionality.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/UnlimitedColors/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Glassmorphism generator",
        description:
            "A web application that generates glassmorphism CSS styles for backgrounds, allowing users to copy the CSS code for use in their own projects.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/glassmorphism-generator/index.html",
        },
        author: {
            name: "Omkar",
            github: "https://github.com/omkarhole",
        },
    },
    {
        title: "Sketchgrid",
        description:
            "SketchGrid Digit Trainer is an interactive web application where users draw digits on a grid and train the system by labeling their own examples.The app learns from this training data and predicts new drawings based on grid patterns, improving accuracy as more examples are added.",
        tags: ["HTML", "CSS", "JavaScript", "Creative Coding"],
        links: {
            github: "https://github.com/pavanakarthik12/sketchgrid",
            live: "./projects/sketchgrid/index.html",
        },
        author: {
            name: "PavanKarthik",
            github: "https://github.com/pavanakarthik12",
        },
    },
    {
        title: "Event Countdown Timer ⏳",
        description:
            "A modern and animated event countdown timer that lets users set an event name, date, and time. Features include real-time countdown updates, pause/resume control, reset functionality, visual warnings when time is low, and smooth number animations.",
        tags: ["HTML", "CSS", "JavaScript", "Timer", "Animations"],
        links: {
            live: "./projects/Event-Countdown-Timer/index.html",
        },
        author: {
            name: "Amballa Sneha",
            github: "https://github.com/Sneha-Amballa",
        },
    },
    {
        title: "Travel Itinerary Map 🗺️",
        description: "A feature that allows users to plan and visualize their travel itinerary on an interactive map with routes, destinations, and notes.",
        tags: ["HTML", "CSS", "JavaScript", "Map", "UI"],
        links: {
            live: "./projects/Travel Itinerary Map/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Pronunciation Trainer 🎤",
        description: "An interactive pronunciation trainer that helps users practice correct pronunciation using text-to-speech and audio feedback.",
        tags: ["HTML", "CSS", "JavaScript", "Audio", "Learning"],
        links: {
            live: "./projects/Pronunciation Trainer/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Art Trainer Canvas 🎨",
        description: "A drawing canvas app where users can practice and create digital art with multiple brush styles, colors, and effects.",
        tags: ["HTML", "CSS", "JavaScript", "Canvas", "Art"],
        links: {
            live: "./projects/Art Trainer Canvas/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Virtual Aquarium 🐠",
        description: "A virtual aquarium simulation with animated fish, underwater effects, and interactive feeding features.",
        tags: ["HTML", "CSS", "JavaScript", "Animation", "Simulation"],
        links: {
            live: "./projects/Virtual Aquarium/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Interactive Music Instrument 🎹",
        description: "A web app to play virtual musical instruments interactively using keyboard or mouse input with sound effects.",
        tags: ["HTML", "CSS", "JavaScript", "Music", "Audio"],
        links: {
            live: "./projects/Interactive Music Instrument/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Typing Speed Game with Visual Effects ⌨️",
        description: "A typing speed game that tests user typing skills with visual effects, timers, and performance feedback.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Typing"],
        links: {
            live: "./projects/Typing Speed Game/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Algorithm Visualizer 📊",
        description: "Visualizes common algorithms and data structures in real-time with step-by-step animations for better understanding.",
        tags: ["HTML", "CSS", "JavaScript", "Algorithms", "Visualization"],
        links: {
            live: "./projects/Algorithm Visualizer/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "DIY Workout Generator 🏋️",
        description: "Generates personalized workout plans based on user preferences, fitness goals, and available equipment.",
        tags: ["HTML", "CSS", "JavaScript", "Fitness", "Generator"],
        links: {
            live: "./projects/DIY Workout Generator/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "AI-Prompt Playground 🤖",
        description: "A playground for experimenting with AI prompts to generate creative outputs like text, suggestions, and ideas.",
        tags: ["HTML", "CSS", "JavaScript", "AI", "Prompt"],
        links: {
            live: "./projects/AI Prompt Playground/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Expense Categorizer 💰",
        description: "A tool to categorize personal expenses, track spending habits, and generate simple reports for budgeting.",
        tags: ["HTML", "CSS", "JavaScript", "Finance", "Tracking"],
        links: {
            live: "./projects/Expense Categorizer/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Weather + Advice App 🌦️",
        description: "Displays weather updates for any location along with practical advice and recommendations for the day.",
        tags: ["HTML", "CSS", "JavaScript", "Weather", "API"],
        links: {
            live: "./projects/Weather  Buddy/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Mini Dictionary Builder 📖",
        description: "Allows users to create and search a mini dictionary with words, definitions, and pronunciation tips.",
        tags: ["HTML", "CSS", "JavaScript", "Dictionary", "Learning"],
        links: {
            live: "./projects/Mini Dictionary Builder/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Logic Puzzle Trainer 🧩",
        description: "Interactive logic puzzles with hints and solution checking to improve problem-solving skills.",
        tags: ["HTML", "CSS", "JavaScript", "Logic", "Puzzle"],
        links: {
            live: "./projects/Logic Puzzle Trainer/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Mood-Based Color Generator 🎨",
        description: "Generates color palettes based on user-selected mood with previews and copy-to-clipboard functionality.",
        tags: ["HTML", "CSS", "JavaScript", "Colors", "Generator"],
        links: {
            live: "./projects/Mood Base Colour generator/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Recipe Finder 🍽️",
        description:
            "A modern web app to search recipes by ingredient or dish name using a free API. Displays beautiful square cards with images, allows users to view full recipes in a popup, and save favorites that persist using localStorage.",
        tags: ["HTML", "CSS", "JavaScript", "API", "Food", "UI"],
        links: {
            live: "./projects/Recipe Finder/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },

    {
        title: "NoteGram 📓",
        description:
            "A unique notebook-style social media web app where users can create posts with text and images, like and comment on posts, view an infinite feed, and interact in a real social-media-like environment. Features a left-side feed, right-side post creator, image preview modal, and data persistence using localStorage.",
        tags: ["HTML", "CSS", "JavaScript", "Social Media", "UI/UX", "localStorage"],
        links: {
            live: "./projects/Mini Social Media Feed/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },
    {
        title: "Daily Planner 📅",
        description:
            "A beautifully designed vintage-style calendar web app that lets users add, view, and manage daily events. Features a large month view, warm diary-like UI, and a dedicated page for adding or editing events when a date is clicked. All events are stored using localStorage for persistence.",
        tags: ["HTML", "CSS", "JavaScript", "Calendar", "Planner", "UI"],
        links: {
            live: "./projects/Calendar Planner/index.html",
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27",
        },
    },

    {
        title: "RageClicker",
        description: "A fast-paced clicking game that challenges users to test their reaction speed and endurance. It offers instant visual feedback and engaging interactions using pure HTML, CSS, and JavaScript.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/rageClicker/index.html",
        },
        author: {
            name: "PavanKarthik",
            github: "https://github.com/pavanakarthik12",
        },
    },
    {
        title: "Droidos",
        description: "DroidOS is a browser-based OS-style interface inspired by Android-like systems.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/droidos/index.html",
        },
        author: {
            name: "PavanKarthik",
            github: "https://github.com/pavanakarthik12",
        },
    },
    {
        title: "Kanban Board 🗂️",
        description: "A Kanban board with colorful, renameable main columns (To-Do, Doing, Done, or custom), draggable tasks, task assignment with user and due date, delete tasks from modal, unlimited columns, horizontal workflow arrows, and fully mobile responsive.",
        tags: ["HTML", "CSS", "JavaScript", "Kanban", "Productivity", "Drag & Drop", "UI/UX", "localStorage"],
        links: {
            live: "./projects/Project Management Board/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Pomodoro Focus ⏱️",
        description: "A timer-based productivity web app. Designed to help users stay focused, track progress, and avoid burnout with an engaging and visually stunning interface.",
        tags: ["HTML", "CSS", "JavaScript", "Productivity", "Timer", "UI/UX", "Animation"],
        links: {
            live: "./projects/Pomodoro Focus App/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Blockforge",
        description: "A system-level web application that models Bitcoin mining behavior, miner competition, difficulty adjustment, and energy economics using probabilistic logic instead of real cryptographic hashing.",
        tags: ["HTML", "CSS", "JavaScript"],
        links: {
            live: "./projects/blockforge/index.html"
        },
        author: {
            name: "Pavankarthik",
            github: "https://github.com/pavanakarthik12"
        }
    },
    {
        title: "Voice Controlled Maze Game 🎤🧩",
        description: "An interactive maze game where players navigate using voice commands like 'up', 'down', 'left', and 'right'. Built to make gaming hands-free, accessible, and engaging using modern browser speech recognition.",
        tags: ["HTML", "CSS", "JavaScript", "Web Speech API", "Voice Control", "Game", "Accessibility"],
        links: {
            live: "./projects/Voice-Controlled Maze Game/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Virtual Sticky Notes Board 🗒️",
        description: "A visual note-taking web app where users can create, drag, resize, edit, and delete colorful sticky notes on a virtual board. All changes are saved using localStorage for persistence.",
        tags: ["HTML", "CSS", "JavaScript", "localStorage", "Drag & Drop", "UI/UX"],
        links: {
            live: "./projects/Virtual Sticky Notes Board/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Pictionary-Style Drawing Game 🎨",
        description: "A pass-the-device multiplayer drawing and guessing game where players earn points based on speed and accuracy. Roles rotate each round with local score tracking.",
        tags: ["HTML", "CSS", "JavaScript", "Canvas", "Game", "Multiplayer"],
        links: {
            live: "./projects/DrawGuessGame/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Music Visualizer 🎵",
        description: "A web app that plays audio and displays real-time animated visuals synced to music using frequency data from the Web Audio API.",
        tags: ["HTML", "CSS", "JavaScript", "Web Audio API", "Animation"],
        links: {
            live: "./projects/Music Visualizer/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Pizza Customizer 🍕",
        description: "An interactive pizza builder where users choose size, crust, and toppings while viewing a live preview and real-time price updates.",
        tags: ["HTML", "CSS", "JavaScript", "UI/UX", "E-Commerce"],
        links: {
            live: "./projects/Pizza game/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Snake Game 🐍",
        description: "A classic Snake game where players control movement, eat food to grow longer, and avoid collisions for continuous gameplay.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Logic"],
        links: {
            live: "./projects/snake game/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "2048 Puzzle Game 🔢",
        description: "A sliding tile puzzle game where players combine numbers strategically to reach the 2048 tile while tracking scores.",
        tags: ["HTML", "CSS", "JavaScript", "Puzzle", "Game"],
        links: {
            live: "./projects/2048/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Flappy Cloud ☁️",
        description: "A Flappy Bird-inspired game where players control a cloud, avoid obstacles, and survive using physics-based movement.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Animation"],
        links: {
            live: "./projects/Flappy cloud/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Emoji Explorer 😄",
        description: "A searchable emoji library that allows users to quickly find, copy, and use emojis with ease.",
        tags: ["HTML", "CSS", "JavaScript", "Utility", "Search"],
        links: {
            live: "./projects/Emoji Picker/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Memory Palace Game 🧠",
        description: "A memory training game inspired by the memory palace technique, challenging users to recall object placements accurately.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Cognitive Skills"],
        links: {
            live: "./projects/Memory Palace Game/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Gravity Flip Platformer 🔄",
        description: "A platformer game where gravity periodically flips, forcing players to adapt quickly and navigate levels creatively.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Physics"],
        links: {
            live: "./projects/Gravity Flip/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Virtual Pet Simulator 🐾",
        description: "A digital pet game where users care for, interact with, and watch their pet grow and evolve over time.",
        tags: ["HTML", "CSS", "JavaScript", "Simulation", "Game"],
        links: {
            live: "./projects/Virtual Pet Evolution/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Digital Garden 🌱",
        description: "A calming digital garden experience where users plant seeds, water plants, and watch them grow with animations over time.",
        tags: ["HTML", "CSS", "JavaScript", "Simulation", "Relaxation"],
        links: {
            live: "./projects/Virtual Garden/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Interactive Solar System Explorer 🌌",
        description: "A digital solar system where users can explore planets, moons, and orbits interactively with animations, zoom controls, and informative popups.",
        tags: ["HTML", "CSS", "JavaScript", "Astronomy", "Visualization", "Education"],
        links: {
            live: "./projects/Virtual Planetarium/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Planetary Defense Game ☄️",
        description: "An interactive strategy game where players defend Earth by detecting, tracking, and deflecting incoming asteroids using realistic physics.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Physics", "Education"],
        links: {
            live: "./projects/Asteroid Defense/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Human Evolution Timeline 🧬",
        description: "An interactive timeline that visually demonstrates the evolution of humans from early ancestors to modern Homo sapiens using animations and scroll-based exploration.",
        tags: ["HTML", "CSS", "JavaScript", "Education", "Timeline", "Visualization"],
        links: {
            live: "./projects/Human Evolution Timeline/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Evolution Survival Game 🔥",
        description: "A choice-driven survival game where players evolve from early humans by gathering resources, avoiding predators, and adapting to changing environments.",
        tags: ["HTML", "CSS", "JavaScript", "Game", "Simulation", "Education"],
        links: {
            live: "./projects/Evolution Survival/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Empire Collapse Simulator 🏛️",
        description: "A strategy simulation game where players manage an empire and experience its gradual collapse based on political, economic, and social decisions.",
        tags: ["HTML", "CSS", "JavaScript", "Simulation", "Strategy", "History"],
        links: {
            live: "./projects/Empire Collapse/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Space Colony Simulator 🚀",
        description: "A space simulation game where players build, expand, and manage a colony on another planet while balancing oxygen, food, water, and energy resources.",
        tags: ["HTML", "CSS", "JavaScript", "Simulation", "Strategy", "Space"],
        links: {
            live: "./projects/Space Colony Simulator/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Startup Growth Simulator 📈",
        description: "A business simulation where players grow a startup into a global corporation by managing finances, employees, products, and market expansion.",
        tags: ["HTML", "CSS", "JavaScript", "Simulation", "Business", "Strategy"],
        links: {
            live: "./projects/Corporate Tycoon/index.html"
        },
        author: {
            name: "Bavanetha M.R",
            github: "https://github.com/Bavanetha27"
        }
    },
    {
        title: "Secure Multi-Tenant Isolation Architecture 🔒",
        description: "Interactive visualization of secure multi-tenant architecture with isolation controls, attack simulation, and real-time security metrics.",
        tags: ["HTML", "CSS", "JavaScript", "Security", "Architecture", "Multi-Tenant", "Visualization"],
        links: {
            live: "./projects/Secure Multi-Tenant Isolation Architecture/index.html"
        },
        author: {
            name: "Gupta-02",
            github: "https://github.com/Gupta-02"
        }
    },
    {
        title: "Autonomous Conversation Risk Assessor 🧭",
        description: "A contextual risk scoring cockpit that flags sensitive interactions, assigns oversight tiers, and captures audit-ready guidance for moderation teams.",
        tags: ["HTML", "CSS", "JavaScript", "Safety", "Moderation", "Analytics"],
        links: {
            live: "./projects/autonomous-conversation-risk-assessor/index.html"
        },
        author: {
            name: "Gupta-02",
            github: "https://github.com/Gupta-02"
        }
    },
    {
        title: "Distributed Event Recovery Coordinator 🛰️",
        description: "Designs replay plans for missed asynchronous events with durable logs, ordering safeguards, and deterministic recovery guidance.",
        tags: ["HTML", "CSS", "JavaScript", "Resilience", "Observability", "Eventing"],
        links: {
            live: "./projects/distributed-event-recovery-coordinator/index.html"
        },
        author: {
            name: "Gupta-02",
            github: "https://github.com/Gupta-02"
        }
    },
    {
        title: "Intelligent Resource Consumption Optimizer 🌿",
        description: "Continuously forecasts workloads and adapts scaling policies to balance utilization, cost, and sustainability goals.",
        tags: ["HTML", "CSS", "JavaScript", "Optimization", "Sustainability", "Scaling"],
        links: {
            live: "./projects/intelligent-resource-consumption-optimizer/index.html"
        },
        author: {
            name: "Gupta-02",
            github: "https://github.com/Gupta-02"
        }
    },
    {
        title: "Context-Aware Error Mitigation Engine 🧠",
        description: "Analyzes failure patterns and context signals to generate targeted recovery workflows and reduce downtime.",
        tags: ["HTML", "CSS", "JavaScript", "Reliability", "Automation", "Observability"],
        links: {
            live: "./projects/context-aware-error-mitigation-engine/index.html"
        },
        author: {
            name: "Gupta-02",
            github: "https://github.com/Gupta-02"
        }
    },
    {
        title: "Adaptive Model Precision Regulator ⚡",
        description: "Dynamically adjust model inference granularity based on task criticality and resource availability to balance performance and computational expense.",
        tags: ["HTML", "CSS", "JavaScript", "AI/ML", "Performance", "Optimization"],
        links: {
            live: "./projects/adaptive-model-precision-regulator/index.html"
        },
        author: {
            name: "Gupta-02",
            github: "https://github.com/Gupta-02"
        }
    }

];

function createProjectCard(project, index) {
    const card = document.createElement("div");
    card.className = "project-card";
    const projectIndex = (currentPage - 1) * projectsPerPage + index;
    card.style.setProperty('--project-index', index);

    const tagsHTML = (project.tags || [])
        .map(tag => `<span class="tag">${tag}</span>`)
        .join("");

    const authorName = (project.author && project.author.name) ? project.author.name : "Unknown Contributor";

    card.innerHTML = `
        <h2>${project.title || "Untitled Project"}</h2>
        <p class="project-desc">${project.description || "No description provided."}</p>

        <div class="project-tags">
            ${tagsHTML}
        </div>

        <div class="project-footer">
            <span>By ${authorName}</span>
            <div class="project-links">
                ${(project.links && project.links.github) ? `<a href="${project.links.github}" target="_blank"><i class="fab fa-github"></i></a>` : ""}
                ${(project.links && project.links.live) ? `<a href="${project.links.live}" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ""}
            </div>
        </div>
        `;

    return card;
}

async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        let fetchedProjects = [];
        if (response.ok) {
            fetchedProjects = await response.json();
        }

        // Combine and deduplicate
        const combined = [...staticProjects, ...fetchedProjects];
        allProjectsData = Array.from(new Map(combined
            .filter(p => p && p.title)
            .map(p => [p.title, p]))
            .values());

        // Initial set of filtered projects is all projects
        filteredProjects = [...allProjectsData];

        // Populate contributor filter
        populateContributorFilter();

        // Sort initially A-Z
        sortProjects("az");

        renderProjects();
    } catch (error) {
        console.error("Error loading projects:", error);
        const container = document.getElementById("projectsContainer");
        if (container) {
            container.innerHTML = '<div class="loading">Error loading projects. Please refresh the page.</div>';
        }
    }
}

function sortProjects(order) {
    filteredProjects.sort((a, b) => {
        if (order === "az") {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });
}

function populateContributorFilter() {
    const filter = document.getElementById("contributorFilter");
    if (!filter) return;

    // Clear existing options except the first one
    while (filter.options.length > 1) {
        filter.remove(1);
    }

    const contributors = [...new Set(allProjectsData
        .filter(p => p.author && p.author.name)
        .map(p => p.author.name))].sort();
    contributors.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        filter.appendChild(option);
    });

    filter.addEventListener("change", () => {
        currentPage = 1;
        runFilter(searchInput.value.toLowerCase(), activeFilter);
    });
}

function renderProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    container.innerHTML = "";
    projectCards = [];

    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const projectsToShow = filteredProjects.slice(startIndex, endIndex);

    if (projectsToShow.length === 0) {
        const emptyState = document.getElementById("noProjectsState");
        if (emptyState) emptyState.classList.add("visible");
    } else {
        const emptyState = document.getElementById("noProjectsState");
        if (emptyState) emptyState.classList.remove("visible");

        projectsToShow.forEach((project, index) => {
            const card = createProjectCard(project, index);
            container.appendChild(card);
            projectCards.push(card);
        });
    }

    updatePagination();

    // Circle cursor animation might need re-binding or just works if it's on document
}

function updatePagination() {
    const container = document.getElementById("paginationContainer");
    if (!container) return;

    container.innerHTML = "";
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement("button");
    prevBtn.className = "pagination-btn";
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        currentPage--;
        renderProjects();
        scrollToTop();
    };
    container.appendChild(prevBtn);

    // Page Numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstPage = createPageBtn(1);
        container.appendChild(firstPage);
        if (startPage > 2) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.innerText = "...";
            container.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageBtn(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "pagination-ellipsis";
            ellipsis.innerText = "...";
            container.appendChild(ellipsis);
        }
        const lastPage = createPageBtn(totalPages);
        container.appendChild(lastPage);
    }

    // Next Button
    const nextBtn = document.createElement("button");
    nextBtn.className = "pagination-btn";
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        currentPage++;
        renderProjects();
        scrollToTop();
    };
    container.appendChild(nextBtn);
}

function createPageBtn(page) {
    const btn = document.createElement("button");
    btn.className = `pagination-btn ${page === currentPage ? "active" : ""}`;
    btn.innerText = page;
    btn.onclick = () => {
        currentPage = page;
        renderProjects();
        scrollToTop();
    };
    return btn;
}
// Circle cursor animation
document.addEventListener("DOMContentLoaded", function () {
    const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");

    circles.forEach(function (circle) {
        circle.x = 0;
        circle.y = 0;
    });

    window.addEventListener("mousemove", function (e) {
        coords.x = e.pageX;
        coords.y = e.pageY - window.scrollY;
    });

    function animateCircles() {
        let x = coords.x;
        let y = coords.y;
        circles.forEach(function (circle, index) {
            circle.style.left = `${x - 12}px`;
            circle.style.top = `${y - 12}px`;
            circle.style.transform = `scale(${(circles.length - index) / circles.length})`;
            const nextCircle = circles[index + 1] || circles[0];
            circle.x = x;
            circle.y = y;
            x += (nextCircle.x - x) * 0.3;
            y += (nextCircle.y - y) * 0.3;
        });

        requestAnimationFrame(animateCircles);
    }

    animateCircles();
});


// 1. Navbar Hamburger Menu Logic
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger) {
    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

// 2. View Toggle (Grid vs List) Logic
const viewToggleBtn = document.getElementById("viewToggleBtn");
const projectsContainer = document.querySelector(".projects-container");
let isCompact = false;

if (viewToggleBtn) {
    viewToggleBtn.addEventListener("click", () => {
        isCompact = !isCompact;
        projectsContainer.classList.toggle("compact-view");
        viewToggleBtn.innerHTML = isCompact
            ? '<i class="fas fa-th-list"></i>'
            : '<i class="fas fa-th-large"></i>';
    });
}

// 3. Search, Filter, and Sort Logic
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");

// --- Search Event ---
searchInput.addEventListener("input", () => {
    currentPage = 1;
    runFilter(searchInput.value.toLowerCase(), activeFilter);
});

// --- Filter Button Events ---
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        activeFilter = btn.dataset.tech;
        currentPage = 1;
        runFilter(searchInput.value.toLowerCase(), activeFilter);
    });
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Show button only when scrolled down
window.addEventListener("scroll", function () {
    const btn = document.getElementById("scrollToTop");
    if (window.scrollY > 300) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
});


// --- Sort Event ---
sortSelect.addEventListener("change", () => {
    sortProjects(sortSelect.value);
    renderProjects();
});

// --- Core Filtering Function ---
function runFilter(query, tech) {
    const contributorValue = document.getElementById("contributorFilter")?.value || "";

    filteredProjects = allProjectsData.filter((project) => {
        const title = (project.title || "").toLowerCase();
        const description = (project.description || "").toLowerCase();
        const tags = (project.tags || []).join(" ").toLowerCase();
        const author = (project.author && project.author.name) ? project.author.name.toLowerCase() : "";

        const matchesSearch = title.includes(query) ||
            description.includes(query) ||
            tags.includes(query) ||
            author.includes(query);

        const matchesTech = (tech === "all") || tags.includes(tech.toLowerCase());

        const matchesContributor = !contributorValue || author === contributorValue.toLowerCase();

        return matchesSearch && matchesTech && matchesContributor;
    });

    // Re-apply current sort
    sortProjects(sortSelect.value);
    renderProjects();
}

document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
});

// Keyboard Shortcuts Overlay Functionality
document.addEventListener('DOMContentLoaded', function () {
    const shortcutsOverlay = document.getElementById('keyboardShortcutsOverlay');
    const closeShortcutsBtn = document.getElementById('closeShortcuts');

    // Function to show shortcuts overlay
    function showShortcutsOverlay() {
        shortcutsOverlay.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Function to hide shortcuts overlay
    function hideShortcutsOverlay() {
        shortcutsOverlay.classList.remove('show');
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    // Show overlay when "?" key is pressed
    document.addEventListener('keydown', function (e) {
        // Only trigger if not typing in an input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        if (e.key === '?' || e.key === '¿') {
            e.preventDefault();
            showShortcutsOverlay();
        }

        // Also hide overlay with Escape key
        if (e.key === 'Escape' && shortcutsOverlay.classList.contains('show')) {
            hideShortcutsOverlay();
        }
    });

    // Close overlay when close button is clicked
    if (closeShortcutsBtn) {
        closeShortcutsBtn.addEventListener('click', hideShortcutsOverlay);
    }

    // Close overlay when clicking outside the modal
    shortcutsOverlay.addEventListener('click', function (e) {
        if (e.target === shortcutsOverlay) {
            hideShortcutsOverlay();
        }
    });
});

