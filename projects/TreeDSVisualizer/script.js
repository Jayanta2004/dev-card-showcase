class TrieNode {
  constructor(char = "") {
    this.char = char;
    this.children = {};
    this.end = false;
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  insert(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode(ch);
      }
      node = node.children[ch];
    }
    node.end = true;
  }

  search(word) {
    let node = this.root;
    for (let ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.end;
  }

  delete(word) {
    const remove = (node, depth) => {
      if (!node) return false;

      if (depth === word.length) {
        if (!node.end) return false;
        node.end = false;
        return Object.keys(node.children).length === 0;
      }

      const ch = word[depth];
      if (remove(node.children[ch], depth + 1)) {
        delete node.children[ch];
        return !node.end && Object.keys(node.children).length === 0;
      }
      return false;
    };

    remove(this.root, 0);
  }
}

const trie = new Trie();
const container = document.getElementById("trieContainer");
const result = document.getElementById("result");

function renderTrie() {
  container.innerHTML = "";

  function traverse(node, prefix = "") {
    for (let key in node.children) {
      const child = node.children[key];
      const div = document.createElement("div");
      div.className = "node";
      if (child.end) div.classList.add("end");
      div.textContent = prefix + key;
      container.appendChild(div);
      traverse(child, prefix + key);
    }
  }

  traverse(trie.root);
}

document.getElementById("insertBtn").addEventListener("click", () => {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  trie.insert(word);
  renderTrie();
  result.textContent = `Result: Inserted "${word}"`;
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  const found = trie.search(word);
  result.textContent = found
    ? `Result: "${word}" found`
    : `Result: "${word}" not found`;
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const word = document.getElementById("wordInput").value.trim();
  if (!word) return;

  trie.delete(word);
  renderTrie();
  result.textContent = `Result: Deleted "${word}"`;
});

document.getElementById("resetBtn").addEventListener("click", () => {
  location.reload();
});

renderTrie();