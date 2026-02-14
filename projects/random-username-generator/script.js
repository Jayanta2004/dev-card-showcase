// Word lists for different styles
const wordLists = {
  funny: {
    adjectives: ['Silly', 'Wobbly', 'Bouncy', 'Fuzzy', 'Squishy', 'Goofy', 'Wacky', 'Zany', 'Bubbly', 'Funky'],
    nouns: ['Penguin', 'Noodle', 'Pickle', 'Waffle', 'Muffin', 'Potato', 'Donut', 'Banana', 'Cookie', 'Unicorn']
  },
  professional: {
    adjectives: ['Smart', 'Swift', 'Bright', 'Sharp', 'Prime', 'Core', 'Pro', 'Elite', 'Expert', 'Master'],
    nouns: ['Developer', 'Coder', 'Builder', 'Maker', 'Creator', 'Engineer', 'Architect', 'Analyst', 'Consultant', 'Strategist']
  },
  fantasy: {
    adjectives: ['Mystic', 'Shadow', 'Crystal', 'Dragon', 'Phoenix', 'Silent', 'Ancient', 'Hidden', 'Sacred', 'Eternal'],
    nouns: ['Wizard', 'Knight', 'Ranger', 'Mage', 'Warrior', 'Hunter', 'Rogue', 'Paladin', 'Druid', 'Sorcerer']
  },
  tech: {
    adjectives: ['Cyber', 'Digital', 'Nano', 'Tech', 'Quantum', 'Binary', 'Neural', 'Virtual', 'System', 'Code'],
    nouns: ['Bot', 'Node', 'Byte', 'Pixel', 'Chip', 'Link', 'Core', 'Flux', 'Grid', 'Sync']
  },
  mixed: {
    adjectives: ['Happy', 'Cool', 'Super', 'Mega', 'Ultra', 'Hyper', 'Wild', 'Epic', 'Bold', 'Vivid'],
    nouns: ['Tiger', 'Eagle', 'Shark', 'Wolf', 'Bear', 'Lion', 'Falcon', 'Hawk', 'Raven', 'Phoenix']
  }
};

// DOM Elements
const styleSelect = document.getElementById('style');
const separatorSelect = document.getElementById('separator');
const includeNumberCheckbox = document.getElementById('includeNumber');
const lengthSlider = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const generateBtn = document.getElementById('generateBtn');
const resultDiv = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const historySearch = document.getElementById('historySearch');
const clearHistoryBtn = document.getElementById('clearHistory');

// State
let generatedUsernames = JSON.parse(localStorage.getItem('usernameHistory')) || [];

// Update length display
lengthSlider.addEventListener('input', () => {
  lengthValue.textContent = lengthSlider.value;
});

// Generate random number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate username
function generateUsername() {
  const style = styleSelect.value;
  const separator = separatorSelect.value;
  const includeNumber = includeNumberCheckbox.checked;
  const maxLength = parseInt(lengthSlider.value);

  const words = wordLists[style];
  const adjective = words.adjectives[getRandomNumber(0, words.adjectives.length - 1)];
  const noun = words.nouns[getRandomNumber(0, words.nouns.length - 1)];

  let username = adjective + separator + noun;

  if (includeNumber) {
    const number = getRandomNumber(1, 999);
    username += separator + number;
  }

  // Ensure username doesn't exceed max length
  if (username.length > maxLength) {
    username = username.substring(0, maxLength);
    // Remove trailing separator if present
    if (separator && username.endsWith(separator)) {
      username = username.slice(0, -1);
    }
  }

  return username;
}

// Display result
function displayResult(username) {
  resultDiv.textContent = username;
  resultDiv.classList.add('generated');
  copyBtn.disabled = false;

  // Add to history
  addToHistory(username);
}

// Add to history
function addToHistory(username) {
  // Avoid duplicates at the top
  if (generatedUsernames.length > 0 && generatedUsernames[0] === username) {
    return;
  }

  generatedUsernames.unshift(username);
  if (generatedUsernames.length > 10) {
    generatedUsernames.pop();
  }

  localStorage.setItem('usernameHistory', JSON.stringify(generatedUsernames));
  renderHistory();
}

// Render history with optional filter
function renderHistory(filter = '') {
  historyList.innerHTML = '';

  const filteredUsernames = filter
    ? generatedUsernames.filter(username => username.toLowerCase().includes(filter.toLowerCase()))
    : generatedUsernames;

  if (filteredUsernames.length === 0) {
    historyList.innerHTML = filter
      ? '<li style="text-align: center; color: #999;">No matching usernames</li>'
      : '<li style="text-align: center; color: #999;">No history yet</li>';
    return;
  }

  filteredUsernames.forEach(username => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${username}</span>
      <button onclick="copyFromHistory('${username}')">Copy</button>
    `;
    historyList.appendChild(li);
  });
}

// Copy to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showCopyFeedback();
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showCopyFeedback();
  }
}

// Show copy feedback
function showCopyFeedback() {
  const originalText = copyBtn.textContent;
  copyBtn.textContent = 'Copied!';
  copyBtn.style.background = '#45a049';

  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.background = '';
  }, 1500);
}

// Copy from history (global function for onclick)
window.copyFromHistory = function(username) {
  copyToClipboard(username);
};

// Event listeners
generateBtn.addEventListener('click', () => {
  const username = generateUsername();
  displayResult(username);
});

copyBtn.addEventListener('click', () => {
  const username = resultDiv.textContent;
  if (username && username !== 'Click generate to create a username') {
    copyToClipboard(username);
  }
});

clearHistoryBtn.addEventListener('click', () => {
  generatedUsernames = [];
  localStorage.removeItem('usernameHistory');
  historySearch.value = '';
  renderHistory();
});

// Search history
historySearch.addEventListener('input', (e) => {
  renderHistory(e.target.value);
});

// Initialize
renderHistory();
