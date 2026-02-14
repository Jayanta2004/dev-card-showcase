    (function() {
      "use strict";

      // ---------- INITIAL MEMORIES (preloaded scrapbook pages) ----------
      const defaultMemories = [
        {
          id: 'mem1',
          imageUrl: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=300',
          title: '🌊 Beach day',
          description: 'Salt wind and seashells. Perfect silence.',
          date: 'July 2025'
        },
        {
          id: 'mem2',
          imageUrl: 'https://images.pexels.com/photos/102127/pexels-photo-102127.jpeg?auto=compress&cs=tinysrgb&w=300',
          title: '☕ Coffee & pages',
          description: 'Saturday morning, old bookstore.',
          date: 'Oct 2025'
        },
        {
          id: 'mem3',
          imageUrl: 'https://images.pexels.com/photos/289586/pexels-photo-289586.jpeg?auto=compress&cs=tinysrgb&w=300',
          title: '🏔️ Road trip',
          description: 'Playlist on repeat. Open highway.',
          date: 'Dec 2025'
        }
      ];

      // ---------- STATE: memories array ----------
      let memories = [...defaultMemories.map(m => ({ ...m, id: m.id || crypto.randomUUID?.() || Date.now() + Math.random() }))];

      // ---------- DOM elements ----------
      const gridEl = document.getElementById('memoryGrid');
      const memoryCountEl = document.getElementById('memoryCount');
      const addBtn = document.getElementById('addMemoryBtn');
      
      // input fields
      const imageInput = document.getElementById('imageInput');
      const titleInput = document.getElementById('titleInput');
      const descInput = document.getElementById('descInput');
      const dateInput = document.getElementById('dateInput');

      // ---------- HELPER: generate unique id ----------
      function generateId() {
        return 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      }

      // ---------- RENDER all memory cards from array ----------
      function renderGrid() {
        if (!gridEl) return;

        if (memories.length === 0) {
          gridEl.innerHTML = `<div class="empty-message">📭 paste a memory — the page is blank ✨</div>`;
          memoryCountEl.textContent = '0';
          return;
        }

        let html = '';
        memories.forEach(memory => {
          html += `
            <div class="memory-card" data-id="${memory.id}">
              <img src="${escapeHtml(memory.imageUrl)}" alt="${escapeHtml(memory.title)}" class="memory-img" loading="lazy" onerror="this.src='https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=300';">
              <div class="memory-title">${escapeHtml(memory.title)}</div>
              <div class="memory-desc">${escapeHtml(memory.description)}</div>
              <div class="memory-date">📎 ${escapeHtml(memory.date || 'unknown date')}</div>
              <div class="card-actions">
                <button class="icon-btn edit-btn" aria-label="edit" data-id="${memory.id}" title="✎ edit (quick)">✎</button>
                <button class="icon-btn delete-btn" aria-label="delete" data-id="${memory.id}" title="delete memory">✕</button>
              </div>
            </div>
          `;
        });

        gridEl.innerHTML = html;
        memoryCountEl.textContent = memories.length;

        // attach delete events to each delete button
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            deleteMemory(id);
          });
        });

        // attach edit events (simple prompt-based edit)
        document.querySelectorAll('.edit-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            editMemoryPrompt(id);
          });
        });
      }

      // simple escape to prevent XSS
      function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      // ---------- DELETE memory ----------
      function deleteMemory(id) {
        memories = memories.filter(mem => mem.id !== id);
        renderGrid();
      }

      // ---------- EDIT memory (quick, prompt-based for simplicity) ----------
      function editMemoryPrompt(id) {
        const memory = memories.find(m => m.id === id);
        if (!memory) return;

        const newTitle = prompt('📝 Edit title:', memory.title);
        if (newTitle !== null && newTitle.trim() !== '') memory.title = newTitle.trim() || memory.title;
        
        const newDesc = prompt('✏️ Edit description:', memory.description);
        if (newDesc !== null) memory.description = newDesc.trim() || memory.description;
        
        const newDate = prompt('📅 Edit date:', memory.date);
        if (newDate !== null) memory.date = newDate.trim() || memory.date;

        const newImg = prompt('🌄 Edit image URL:', memory.imageUrl);
        if (newImg !== null && newImg.trim() !== '') memory.imageUrl = newImg.trim() || memory.imageUrl;

        renderGrid(); // re-render with updated fields
      }

      // ---------- ADD new memory ----------
      function addMemory() {
        // get values from form inputs
        let imgUrl = imageInput.value.trim();
        let title = titleInput.value.trim();
        let desc = descInput.value.trim();
        let date = dateInput.value.trim();

        // validation / fallbacks
        if (!imgUrl) imgUrl = 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=300';
        if (!title) title = '📌 untitled';
        if (!desc) desc = 'a gentle memory.';
        if (!date) {
          const today = new Date();
          date = today.toLocaleString('default', { month: 'short', year: 'numeric' });
        }

        // create new memory object
        const newMemory = {
          id: generateId(),
          imageUrl: imgUrl,
          title: title,
          description: desc,
          date: date
        };

        memories.push(newMemory);
        renderGrid();

        // optionally clear only if user wants? keep for convenience, but we can keep values for quick add
        // keep fields but update date placeholder
        dateInput.value = date; // keep consistency
      }

      // ---------- RESET to default examples (optional via double click on header) ----------
      function resetToDefaults() {
        memories = [...defaultMemories.map(m => ({ 
          ...m, 
          id: generateId() 
        }))];
        renderGrid();
      }

      // ---------- INITIAL load and event listeners ----------
      function initApp() {
        // load initial grid
        renderGrid();

        // add memory button listener
        addBtn.addEventListener('click', addMemory);

        // allow enter key in any input to trigger add?
        const inputs = [imageInput, titleInput, descInput, dateInput];
        inputs.forEach(input => {
          input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addMemory();
            }
          });
        });

        // secret: double-click on header to reset to default 3 cards (like a fresh scrapbook)
        const header = document.querySelector('h1');
        header.addEventListener('dblclick', function() {
          if (confirm('🔄 reset to sample memories?')) {
            resetToDefaults();
          }
        });
      }

      initApp();
    })();