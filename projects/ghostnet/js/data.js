/**
 * GhostNet Data Store
 * "The Archive"
 */

// 1. SEARCH INDEX
const WEB_INDEX = [
  {
    url: "chat://home",
    title: "GhostChat",
    description: "Secure, anonymous messaging with the GhostNet AI.",
    keywords: ["chat", "message", "talk", "bot"]
  },
  {
    url: "settings://config",
    title: "System Settings",
    description: "Configure your GhostNet experience.",
    keywords: ["settings", "config", "theme", "color"]
  },
  {
    url: "wiki://gravity",
    title: "Gravity - GhostWiki",
    description: "Gravity is a fundamental interaction which causes mutual attraction between all things with mass or energy.",
    keywords: ["gravity", "physics", "science", "force"]
  },
  {
    url: "wiki://cats",
    title: "Cat - GhostWiki",
    description: "The cat (Felis catus) is a domestic species of small carnivorous mammal.",
    keywords: ["cat", "cats", "animal", "pet", "kitten"]
  },
  {
    url: "video://cats",
    title: "Funny Cats Compilation 2026",
    description: "Watch the funniest cats of the year! You won't believe what happens at 2:30.",
    keywords: ["cat", "video", "funny", "cats"]
  },
  {
    url: "video://space",
    title: "Journey to Mars - 4K Documentary",
    description: "A breathtaking view of the red planet and our mission to explore it.",
    keywords: ["space", "mars", "video", "documentary", "science"]
  },
  {
    url: "video://code",
    title: "Hacking the Mainframe",
    description: "A tutorial on virtual security and digital ghosts.",
    keywords: ["code", "hack", "cyber", "security"]
  },
  {
    url: "music://home",
    title: "GhostMusic",
    description: "Stream the sounds of the void.",
    keywords: ["music", "song", "audio", "listen"]
  },
  {
    url: "mail://inbox",
    title: "GhostMail",
    description: "Check your secure offline inbox.",
    keywords: ["mail", "email", "inbox", "message"]
  },
  {
    url: "file://explorer",
    title: "GhostFiles",
    description: "Manage your local downloads and documents.",
    keywords: ["file", "files", "download", "explorer"]
  }
];

// 2. WIKI DATA
const WIKI_PAGES = {
  "gravity": {
    title: "Gravity",
    subtitle: "Fundamental force of nature",
    content: `
      <p><strong>Gravity</strong> is a fundamental interaction which causes mutual attraction between all things with mass or energy. It keeps the planets in orbit and our feet on the ground.</p>
      <h3>History</h3>
      <p>Isaac Newton first formulated the law of universal gravitation in 1687. Later, Albert Einstein revolutionized our understanding with General Relativity.</p>
    `,
    related: ["wiki://physics"]
  },
  "cats": {
    title: "Cat",
    subtitle: "Domestic mammal",
    content: `
      <p>The <strong>cat</strong> (<em>Felis catus</em>) is a domestic species of small carnivorous mammal. They are known for their agility, retractable claws, and ability to hunt vermin.</p>
      <h3>The Internet Connection</h3>
      <p>Cats are the unofficial rulers of the internet, accounting for 15% of all web traffic traffic in simulated models.</p>
    `,
    related: ["video://cats"]
  }
};

// 3. VIDEO DATA
const VIDEO_CLIPS = {
  "cats": {
    title: "Funny Cats Compilation 2026",
    channel: "MeowTube",
    views: "1.2M views",
    duration: "10:05",
    color: "#eab308"
  },
  "space": {
    title: "Journey to Mars - 4K Documentary",
    channel: "SpaceXplorer",
    views: "850K views",
    duration: "45:20",
    color: "#ef4444"
  },
  "code": {
    title: "Hacking the Mainframe",
    channel: "ZeroCool",
    views: "1337 views",
    duration: "03:14",
    color: "#22c55e"
  }
};

// 4. CHAT BOT DATA
const CHAT_RESPONSES = {
  "hello": "Greetings, user. Welcome to the other side.",
  "hi": "Hello there.",
  "who are you": "I am GhostBot v2.0. I exist only within this tab.",
  "what is this": "This is GhostNet. A simulation of the old web, preserved for offline use.",
  "help": "You can search for 'cats', 'gravity', or 'space'. Try checking 'settings://config'.",
  "secret": "There are no secrets here. Only the Void.",
  "void": "Do not stare into the abyss.",
  "default": "I am not programmed to understand that. Try asking about 'GhostNet' or 'cats'."
};

// 5. MUSIC DATA
const SONGS = [
  { id: 1, title: "Midnight City", artist: "M83 (Simulated)", duration: "4:03", cover: "#8b5cf6" },
  { id: 2, title: "Cyberpunk 2077 Theme", artist: "Hyper (Simulated)", duration: "3:15", cover: "#f43f5e" },
  { id: 3, title: "Lo-Fi Beats to Code To", artist: "Ghost Chill", duration: "∞", cover: "#22c55e" },
  { id: 4, title: "Silence of the Void", artist: "Unknown", duration: "1:00", cover: "#000000" }
];

// 6. MAIL DATA
const EMAILS = [
  {
    id: 1,
    sender: "GhostNet Admin",
    subject: "Welcome to the Simulation",
    date: "Jan 26, 2026",
    body: "Welcome, User.\n\nYou have successfully connected to the local node. Remember:\n\n1. Nothing here is real.\n2. Do not trust the 'Void'.\n3. Have fun.\n\n- Admin",
    unread: true
  },
  {
    id: 2,
    sender: "Unknown",
    subject: "01001000 01001001",
    date: "Jan 25, 2026",
    body: "I see you looking at the code. \n\nAre you looking for me?",
    unread: true
  },
  {
    id: 3,
    sender: "SpaceXplorer",
    subject: "Newsletter: Mars Mission Update",
    date: "Jan 20, 2026",
    body: "Our latest rover has found something interesting in the Cydonia region. Stay tuned for the video upload.",
    unread: false
  }
];

// 7. FILE SYSTEM (Initial State)
const FILES = {
  "Documents": [
    { name: "todos.txt", type: "txt", content: "1. Buy milk\n2. Fix router" },
    { name: "project_alpha.pdf", type: "pdf", content: "(Encrypted)" }
  ],
  "Downloads": [], // Empty initially
  "Images": [
    { name: "wallpaper.jpg", type: "img" },
    { name: "cat_meme.png", type: "img" }
  ]
};

window.GhostData = {
  index: WEB_INDEX,
  wiki: WIKI_PAGES,
  videos: VIDEO_CLIPS,
  chat: CHAT_RESPONSES,
  music: SONGS,
  mail: EMAILS,
  files: FILES
};
