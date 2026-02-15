  (function() {
    // --- in-memory data store
    let snippets = [
      { id: '1', title: 'Welcome note', content: 'Hello! This is your clipboard manager. You can save multiple text snippets.' },
      { id: '2', title: 'Colors palette', content: 'Primary: #e2a65b\nSecondary: #314e57\nAccent: #f7dab6' },
      { id: '3', title: 'Todo', content: '- design the layout\n- add search\n- implement copy' }
    ];

    let activeId = '1';      // first by default
    let searchTerm = '';

    // DOM elements
    const snippetListEl = document.getElementById('snippetList');
    const snippetCountEl = document.getElementById('snippetCount');
    const titleInput = document.getElementById('snippetTitleInput');
    const contentInput = document.getElementById('snippetContentInput');
    const searchInput = document.getElementById('searchInput');
    const footerStatus = document.getElementById('footerStatus');
    const actionFeedback = document.getElementById('actionFeedback');

    // Buttons
    const newBtn = document.getElementById('newSnippetBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const updateBtn = document.getElementById('updateSnippetBtn');
    const copyBtn = document.getElementById('copyToClipboardBtn');
    const deleteBtn = document.getElementById('deleteSnippetBtn');

    // Helper: generate short id
    function genId() { return Date.now().toString(36) + Math.random().toString(36).substring(2,6); }

    // Filter snippets based on searchTerm (title or content)
    function getFilteredSnippets() {
      if (!searchTerm.trim()) return snippets;
      const term = searchTerm.trim().toLowerCase();
      return snippets.filter(s => s.title.toLowerCase().includes(term) || s.content.toLowerCase().includes(term));
    }

    // render left list
    function renderList() {
      const filtered = getFilteredSnippets();
      if (filtered.length === 0) {
        snippetListEl.innerHTML = `<li style="opacity:0.6; justify-content:center; cursor:default;">📭 no snippets</li>`;
        snippetCountEl.innerText = `0 items`;
        return;
      }
      let html = '';
      filtered.forEach(s => {
        const isActive = (s.id === activeId);
        const activeClass = isActive ? 'active-snippet' : '';
        // simple icon based on title
        const icon = s.title.toLowerCase().includes('todo') ? '✅' : (s.title.toLowerCase().includes('color') ? '🎨' : '📄');
        html += `<li class="${activeClass}" data-id="${s.id}"><span class="thumb-icon">${icon}</span><span>${escapeHtml(s.title)}</span></li>`;
      });
      snippetListEl.innerHTML = html;
      snippetCountEl.innerText = filtered.length + (filtered.length === 1 ? ' item' : ' items');

      // attach click listeners to each li
      document.querySelectorAll('.snippet-list li').forEach(li => {
        li.addEventListener('click', (e) => {
          const id = li.dataset.id;
          if (id) setActiveSnippet(id);
        });
      });
    }

    // simple escape for title (prevent XSS)
    function escapeHtml(unsafe) {
      return unsafe.replace(/[&<>"]/g, function(m) {
        if(m === '&') return '&amp;'; if(m === '<') return '&lt;'; if(m === '>') return '&gt;'; if(m === '"') return '&quot;';
        return m;
      });
    }

    // set active snippet and populate editor
    function setActiveSnippet(id) {
      const snippet = snippets.find(s => s.id === id);
      if (!snippet) {
        // if id not found (maybe after delete), pick first filtered or null
        const filtered = getFilteredSnippets();
        if (filtered.length > 0) {
          activeId = filtered[0].id;
        } else {
          activeId = null;
          titleInput.value = '';
          contentInput.value = '';
        }
      } else {
        activeId = snippet.id;
      }
      // populate editor from activeId
      const activeSnippet = snippets.find(s => s.id === activeId);
      if (activeSnippet) {
        titleInput.value = activeSnippet.title;
        contentInput.value = activeSnippet.content;
      } else {
        titleInput.value = '';
        contentInput.value = '';
      }
      renderList();
      updateFooter('📌 loaded');
    }

    // show temporary message in footer
    function updateFooter(msg) {
      actionFeedback.innerText = msg;
      setTimeout(() => { actionFeedback.innerText = ''; }, 2000);
    }

    // ---- actions ----
    // new snippet
    function createNewSnippet() {
      const newTitle = 'snippet ' + (snippets.length + 1);
      const newContent = '';
      const newId = genId();
      snippets.push({ id: newId, title: newTitle, content: newContent });
      activeId = newId;
      setActiveSnippet(activeId);
      titleInput.focus();
      updateFooter('➕ new snippet created');
    }

    // update current snippet
    function updateCurrentSnippet() {
      if (!activeId) {
        // if no active, create new? but we can fallback: pick first if exists
        if (snippets.length === 0) {
          createNewSnippet();
        } else {
          activeId = snippets[0].id;
        }
      }
      const snippet = snippets.find(s => s.id === activeId);
      if (snippet) {
        const newTitle = titleInput.value.trim() || 'untitled';
        snippet.title = newTitle;
        snippet.content = contentInput.value;
        // re-render list, keep active
        renderList();
        updateFooter('💾 updated');
      } else {
        // orphan active? create new
        createNewSnippet();
      }
    }

    // delete active snippet
    function deleteActiveSnippet() {
      if (!activeId) {
        if (snippets.length > 0) activeId = snippets[0].id;
        else {
          updateFooter('nothing to delete');
          return;
        }
      }
      const index = snippets.findIndex(s => s.id === activeId);
      if (index !== -1) {
        snippets.splice(index, 1);
        // choose new active: try same index, previous, or first
        if (snippets.length > 0) {
          const nextIndex = Math.min(index, snippets.length-1);
          activeId = snippets[nextIndex].id;
        } else {
          activeId = null;
        }
        setActiveSnippet(activeId);
        updateFooter('🗑️ deleted');
      } else {
        // activeId not found, pick first if any
        if (snippets.length) {
          activeId = snippets[0].id;
          setActiveSnippet(activeId);
        } else {
          titleInput.value = ''; contentInput.value = '';
          renderList();
        }
      }
    }

    // copy to clipboard
    async function copyContent() {
      if (!activeId) {
        if (snippets.length === 0) {
          updateFooter('no snippet to copy');
          return;
        } else {
          activeId = snippets[0].id;
          setActiveSnippet(activeId);
        }
      }
      const snippet = snippets.find(s => s.id === activeId);
      if (snippet) {
        try {
          await navigator.clipboard.writeText(snippet.content);
          updateFooter('📋 copied to clipboard!');
        } catch (err) {
          updateFooter('❌ copy failed');
        }
      } else {
        updateFooter('error: not found');
      }
    }

    // clear all snippets (with confirmation)
    function clearAll() {
      if (snippets.length === 0) {
        updateFooter('already empty');
        return;
      }
      if (confirm('Delete all snippets?')) {
        snippets = [];
        activeId = null;
        titleInput.value = '';
        contentInput.value = '';
        renderList();
        updateFooter('🧹 all snippets cleared');
      }
    }

    // search handler
    function handleSearch() {
      searchTerm = searchInput.value;
      // preserve active if still in filtered, else set to first filtered
      const filtered = getFilteredSnippets();
      if (filtered.length > 0) {
        if (!filtered.some(s => s.id === activeId)) {
          activeId = filtered[0].id;
        }
      } else {
        activeId = null;
      }
      setActiveSnippet(activeId); // repopulate / clear
    }

    // ---- event listeners ----
    newBtn.addEventListener('click', createNewSnippet);
    updateBtn.addEventListener('click', updateCurrentSnippet);
    copyBtn.addEventListener('click', copyContent);
    deleteBtn.addEventListener('click', deleteActiveSnippet);
    clearAllBtn.addEventListener('click', clearAll);

    searchInput.addEventListener('input', () => {
      handleSearch();
    });

    // initial render
    setActiveSnippet('1');  // ensures activeId=1 exists
    renderList();

    // fallback if first not present (just in case)
    window.addEventListener('load', () => {
      if (snippets.length && !snippets.find(s => s.id === activeId)) {
        activeId = snippets[0].id;
        setActiveSnippet(activeId);
      }
    });
  })();