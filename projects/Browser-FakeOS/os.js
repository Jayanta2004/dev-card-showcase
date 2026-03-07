

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     VIRTUAL FILE SYSTEM
  ══════════════════════════════════════════════════════ */
  const FS = {
    '/': { type: 'dir', children: ['home', 'sys', 'usr'] },
    '/home': { type: 'dir', children: ['guest'] },
    '/home/guest': { type: 'dir', children: ['documents', 'pictures', 'readme.txt', 'notes.txt'] },
    '/home/guest/documents': { type: 'dir', children: ['project.txt', 'todo.txt'] },
    '/home/guest/pictures': { type: 'dir', children: ['wallpaper.png', 'screenshot.png'] },
    '/home/guest/readme.txt': { type: 'file', content: 'Welcome to FAKE OS v3.1!\n\nThis is a simulated desktop environment.\nOpen the Terminal and type "help" to get started.\n\nEnjoy exploring!', icon: '📄' },
    '/home/guest/notes.txt': { type: 'file', content: 'My Notes\n--------\n- Learn FAKE OS\n- Explore the terminal\n- Check out the file system\n- Build something awesome', icon: '📝' },
    '/home/guest/documents/project.txt': { type: 'file', content: '# Project FAKE OS\n\nObjective: Build a browser-based OS simulation.\nStatus: COMPLETE\n\nFeatures implemented:\n✓ Boot sequence\n✓ Login screen\n✓ Desktop environment\n✓ Window management\n✓ File explorer\n✓ Terminal emulator\n✓ Notepad\n✓ Fake browser\n✓ Settings', icon: '📄' },
    '/home/guest/documents/todo.txt': { type: 'file', content: 'TODO LIST\n---------\n[ ] Explore the terminal\n[ ] Open some files\n[ ] Customize wallpaper\n[x] Log in to FAKE OS', icon: '📋' },
    '/home/guest/pictures/wallpaper.png': { type: 'file', content: '[Binary image data — 1920x1080 PNG]\nUse Settings to change wallpaper.', icon: '🖼' },
    '/home/guest/pictures/screenshot.png': { type: 'file', content: '[Binary image data — screenshot.png]\nTaken on FAKE OS v3.1', icon: '🖼' },
    '/sys': { type: 'dir', children: ['kernel', 'drivers'] },
    '/sys/kernel': { type: 'dir', children: ['core.sys'] },
    '/sys/kernel/core.sys': { type: 'file', content: 'FAKE KERNEL v3.1.0\nBUILD: 2025.02.27\nSTATUS: RUNNING', icon: '⚙' },
    '/sys/drivers': { type: 'dir', children: ['gpu.drv', 'net.drv'] },
    '/sys/drivers/gpu.drv': { type: 'file', content: 'GPU Driver — NX-Graphics 4.2', icon: '🖥' },
    '/sys/drivers/net.drv': { type: 'file', content: 'NET Driver — NX-Net 2.1\nStatus: Connected', icon: '🌐' },
    '/usr': { type: 'dir', children: ['bin', 'share'] },
    '/usr/bin': { type: 'dir', children: ['terminal', 'explorer', 'notepad'] },
    '/usr/share': { type: 'dir', children: ['themes'] },
  };

  let cwdPath = '/home/guest';

  function fsGet(path) { return FS[path]; }
  function fsResolve(name, base) {
    if (name === '..') {
      const parts = base.split('/').filter(Boolean);
      if (parts.length === 0) return '/';
      parts.pop();
      return '/' + parts.join('/') || '/';
    }
    if (name.startsWith('/')) return name;
    return (base === '/' ? '' : base) + '/' + name;
  }
  function fsList(path) {
    const node = fsGet(path);
    if (!node || node.type !== 'dir') return null;
    return node.children.map(child => {
      const childPath = (path === '/' ? '' : path) + '/' + child;
      const childNode = fsGet(childPath);
      return { name: child, path: childPath, type: childNode ? childNode.type : 'file', icon: getFileIcon(child, childNode) };
    });
  }
  function getFileIcon(name, node) {
    if (!node) return '❓';
    if (node.type === 'dir') return '📁';
    if (node.icon) return node.icon;
    const ext = name.split('.').pop();
    const icons = { txt: '📄', png: '🖼', jpg: '🖼', sys: '⚙', drv: '🔧', md: '📝' };
    return icons[ext] || '📄';
  }

  /* ══════════════════════════════════════════════════════
     WINDOW MANAGER
  ══════════════════════════════════════════════════════ */
  let zTop = 200;
  let windowCount = 0;
  const openWindows = {}; // id -> { el, app, title, minimized }

  function createWindow(app, title, width = 600, height = 420, x, y) {
    const id = 'win_' + (++windowCount);
    const container = document.getElementById('window-container');
    const desktop = document.getElementById('desktop');

    const dw = desktop.clientWidth;
    const dh = desktop.clientHeight - 42;

    if (x === undefined) x = 60 + (windowCount * 30) % (dw - width - 80);
    if (y === undefined) y = 40 + (windowCount * 24) % (dh - height - 80);

    const el = document.createElement('div');
    el.className = 'os-window focused';
    el.id = id;
    el.style.cssText = `left:${x}px; top:${y}px; width:${width}px; height:${height}px; z-index:${++zTop}`;

    el.innerHTML = `
    <div class="win-titlebar" data-id="${id}">
      <div class="win-controls">
        <button class="win-btn close"  title="Close"></button>
        <button class="win-btn min"    title="Minimise"></button>
        <button class="win-btn max"    title="Maximise"></button>
      </div>
      <div class="win-title">${title}</div>
    </div>
    <div class="win-body" id="${id}-body"></div>
    <div class="win-resize" data-id="${id}"></div>
  `;

    container.appendChild(el);
    openWindows[id] = { el, app, title, minimized: false };

    /* Focus */
    el.addEventListener('mousedown', () => focusWindow(id));

    /* Title bar drag */
    const titleBar = el.querySelector('.win-titlebar');
    makeDraggable(titleBar, el);

    /* Resize */
    const resizeHandle = el.querySelector('.win-resize');
    makeResizable(resizeHandle, el);

    /* Buttons */
    el.querySelector('.win-btn.close').addEventListener('click', e => { e.stopPropagation(); closeWindow(id); });
    el.querySelector('.win-btn.min').addEventListener('click', e => { e.stopPropagation(); minimizeWindow(id); });
    el.querySelector('.win-btn.max').addEventListener('click', e => { e.stopPropagation(); maximizeWindow(id); });

    /* Build content */
    buildApp(id, app);

    /* Taskbar button */
    addTaskbarBtn(id, title);

    focusWindow(id);
    return id;
  }

  function focusWindow(id) {
    Object.keys(openWindows).forEach(k => {
      const w = openWindows[k];
      if (w && w.el) w.el.classList.remove('focused');
    });
    const w = openWindows[id];
    if (w && w.el) {
      w.el.classList.add('focused');
      w.el.style.zIndex = ++zTop;
    }
    document.querySelectorAll('.taskbar-btn').forEach(b => b.classList.remove('active'));
    const tb = document.querySelector(`.taskbar-btn[data-id="${id}"]`);
    if (tb) tb.classList.add('active');
  }

  function closeWindow(id) {
    const w = openWindows[id];
    if (!w) return;
    w.el.remove();
    const tb = document.querySelector(`.taskbar-btn[data-id="${id}"]`);
    if (tb) tb.remove();
    delete openWindows[id];
  }

  function minimizeWindow(id) {
    const w = openWindows[id];
    if (!w) return;
    w.minimized = !w.minimized;
    w.el.classList.toggle('minimized', w.minimized);
    const tb = document.querySelector(`.taskbar-btn[data-id="${id}"]`);
    if (tb) tb.classList.toggle('active', !w.minimized);
  }

  let maximizedState = {};
  function maximizeWindow(id) {
    const w = openWindows[id];
    if (!w) return;
    if (maximizedState[id]) {
      const s = maximizedState[id];
      Object.assign(w.el.style, { left: s.x, top: s.y, width: s.w, height: s.h });
      delete maximizedState[id];
    } else {
      maximizedState[id] = { x: w.el.style.left, y: w.el.style.top, w: w.el.style.width, h: w.el.style.height };
      const desktop = document.getElementById('desktop');
      Object.assign(w.el.style, { left: '0px', top: '0px', width: desktop.clientWidth + 'px', height: (desktop.clientHeight - 42) + 'px' });
    }
  }

  function addTaskbarBtn(id, title) {
    const tb = document.getElementById('taskbar-apps');
    const btn = document.createElement('div');
    btn.className = 'taskbar-btn active';
    btn.dataset.id = id;
    btn.textContent = title;
    btn.addEventListener('click', () => {
      const w = openWindows[id];
      if (!w) return;
      if (w.minimized) { minimizeWindow(id); focusWindow(id); }
      else if (w.el.classList.contains('focused')) { minimizeWindow(id); }
      else { focusWindow(id); }
    });
    tb.appendChild(btn);
  }

  /* ── Drag ── */
  function makeDraggable(handle, el) {
    let ox, oy, startX, startY, dragging = false;
    handle.addEventListener('mousedown', e => {
      if (e.target.classList.contains('win-btn')) return;
      dragging = true;
      ox = el.offsetLeft; oy = el.offsetTop;
      startX = e.clientX; startY = e.clientY;
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      el.style.left = Math.max(0, ox + dx) + 'px';
      el.style.top = Math.max(0, oy + dy) + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  }

  /* ── Resize ── */
  function makeResizable(handle, el) {
    let startX, startY, startW, startH, resizing = false;
    handle.addEventListener('mousedown', e => {
      resizing = true;
      startX = e.clientX; startY = e.clientY;
      startW = el.offsetWidth; startH = el.offsetHeight;
      e.preventDefault(); e.stopPropagation();
    });
    document.addEventListener('mousemove', e => {
      if (!resizing) return;
      el.style.width = Math.max(280, startW + (e.clientX - startX)) + 'px';
      el.style.height = Math.max(180, startH + (e.clientY - startY)) + 'px';
    });
    document.addEventListener('mouseup', () => { resizing = false; });
  }

  /* ══════════════════════════════════════════════════════
     APP BUILDER
  ══════════════════════════════════════════════════════ */
  function buildApp(id, app) {
    const body = document.getElementById(id + '-body');
    switch (app) {
      case 'files': buildFiles(body, cwdPath); break;
      case 'terminal': buildTerminal(body); break;
      case 'about': buildAbout(body); break;
      case 'notepad': buildNotepad(body); break;
      case 'browser': buildBrowser(body); break;
      case 'settings': buildSettings(body); break;
    }
  }

  /* ── FILE EXPLORER ── */
  function buildFiles(body, path) {
    body.innerHTML = `
    <div class="files-toolbar">
      <button class="notepad-tb-btn" id="files-back-${body.id}">◀ Back</button>
      <input class="files-path" id="files-path-${body.id}" value="${path}" readonly/>
    </div>
    <div class="files-grid" id="files-grid-${body.id}"></div>
  `;
    body.id = body.id || 'fb' + Date.now();
    renderFiles(body, path);

    body.querySelector(`[id^="files-back-"]`).addEventListener('click', () => {
      const up = fsResolve('..', path);
      buildFiles(body, up);
    });
  }

  function renderFiles(body, path) {
    const grid = body.querySelector('[id^="files-grid-"]');
    if (!grid) return;
    const items = fsList(path);
    if (!items) { grid.innerHTML = '<p style="color:var(--text-dim);padding:12px;font-size:0.68rem;">Empty or not found.</p>'; return; }
    grid.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'file-item';
      div.innerHTML = `<div class="file-icon">${item.icon}</div><div class="file-name">${item.name}</div>`;
      div.addEventListener('dblclick', () => {
        if (item.type === 'dir') {
          buildFiles(body, item.path);
        } else {
          const node = fsGet(item.path);
          if (node && node.content) openFileViewer(item.name, node.content);
        }
      });
      grid.appendChild(div);
    });
  }

  function openFileViewer(name, content) {
    const id = createWindow('notepad', '📄 ' + name, 480, 340);
    const body = document.getElementById(id + '-body');
    const ta = body.querySelector('.notepad-textarea');
    if (ta) ta.value = content;
  }

  /* ── TERMINAL ── */
  const termHistory = [];
  let termHistIdx = -1;

  function buildTerminal(body) {
    body.style.display = 'flex';
    body.style.flexDirection = 'column';
    body.style.height = '100%';
    body.innerHTML = `
    <div class="terminal-body" id="term-output-${body.dataset.id || 't' + Date.now()}">
      <div class="term-line info">FAKE OS Terminal v3.1</div>
      <div class="term-line info">Type <span style="color:var(--accent)">help</span> for available commands.</div>
      <div class="term-line info">──────────────────────────────</div>
    </div>
    <div class="term-input-row">
      <span class="term-prompt" id="term-prompt-span">guest@FAKE:${cwdPath}$</span>
      <input class="term-input" id="term-input-field" placeholder="type command..." autocomplete="off" spellcheck="false"/>
    </div>
  `;
    const output = body.querySelector('[id^="term-output-"]');
    const input = body.querySelector('#term-input-field');
    const prompt = body.querySelector('#term-prompt-span');

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        if (cmd) { termHistory.unshift(cmd); termHistIdx = -1; }
        appendLine(output, `guest@fake:${cwdPath}$ ${cmd}`, 'cmd');
        processCommand(cmd, output, prompt);
        input.value = '';
        scrollTerminal(output);
      }
      if (e.key === 'ArrowUp') {
        termHistIdx = Math.min(termHistIdx + 1, termHistory.length - 1);
        input.value = termHistory[termHistIdx] || '';
      }
      if (e.key === 'ArrowDown') {
        termHistIdx = Math.max(termHistIdx - 1, -1);
        input.value = termHistIdx === -1 ? '' : termHistory[termHistIdx];
      }
    });

    // focus input on body click
    body.addEventListener('click', () => input.focus());
    setTimeout(() => input.focus(), 50);
  }

  function appendLine(output, text, cls = '') {
    const div = document.createElement('div');
    div.className = 'term-line ' + cls;
    div.innerHTML = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    output.appendChild(div);
  }

  function scrollTerminal(output) {
    output.scrollTop = output.scrollHeight;
  }

  function processCommand(raw, output, prompt) {
    const parts = raw.trim().split(/\s+/);
    const cmd = (parts[0] || '').toLowerCase();
    const args = parts.slice(1);

    const print = (t, c) => appendLine(output, t, c || '');
    const ok = (t) => appendLine(output, t, 'success');
    const err = (t) => appendLine(output, t, 'err');
    const info = (t) => appendLine(output, t, 'info');

    switch (cmd) {
      case '':
        break;

      case 'help':
        info('Available commands:');
        [
          ['help', 'Show this help message'],
          ['ls [path]', 'List directory contents'],
          ['cd <dir>', 'Change directory'],
          ['pwd', 'Print working directory'],
          ['cat <file>', 'Show file contents'],
          ['mkdir <name>', 'Create a directory (virtual)'],
          ['touch <name>', 'Create a file (virtual)'],
          ['rm <name>', 'Remove a file (virtual)'],
          ['echo <text>', 'Print text'],
          ['clear', 'Clear terminal'],
          ['date', 'Show current date/time'],
          ['whoami', 'Show current user'],
          ['uname', 'System information'],
          ['open <app>', 'Open an app (files/terminal/about/notepad/browser/settings)'],
          ['neofetch', 'System info with logo'],
          ['matrix', 'Run the Matrix...'],
        ].forEach(([c, d]) => info(`  <span style="color:var(--accent)">${c.padEnd(16)}</span>${d}`));
        break;

      case 'ls': {
        const target = args[0] ? fsResolve(args[0], cwdPath) : cwdPath;
        const items = fsList(target);
        if (!items) { err(`ls: cannot access '${target}': No such directory`); break; }
        const line = items.map(i => `<span style="color:${i.type === 'dir' ? 'var(--accent)' : 'var(--accent2)'}">${i.name}${i.type === 'dir' ? '/' : ''}</span>`).join('  ');
        print(line || '(empty)');
        break;
      }

      case 'cd': {
        if (!args[0]) { cwdPath = '/home/guest'; }
        else {
          const target = fsResolve(args[0], cwdPath);
          const node = fsGet(target);
          if (!node) { err(`cd: no such directory: ${args[0]}`); break; }
          if (node.type !== 'dir') { err(`cd: not a directory: ${args[0]}`); break; }
          cwdPath = target;
        }
        if (prompt) prompt.textContent = `guest@fake:${cwdPath}$`;
        break;
      }

      case 'pwd':
        ok(cwdPath);
        break;

      case 'cat': {
        if (!args[0]) { err('cat: missing file operand'); break; }
        const p = fsResolve(args[0], cwdPath);
        const node = fsGet(p);
        if (!node) { err(`cat: ${args[0]}: No such file`); break; }
        if (node.type === 'dir') { err(`cat: ${args[0]}: Is a directory`); break; }
        node.content.split('\n').forEach(l => info(l));
        break;
      }

      case 'echo':
        ok(args.join(' '));
        break;

      case 'clear':
        output.innerHTML = '';
        break;

      case 'date':
        ok(new Date().toString());
        break;

      case 'whoami':
        ok('guest');
        break;

      case 'uname':
        ok('FAKE 3.1.0 fake-kernel 2025.02 x86_64 FAKEOS');
        break;

      case 'mkdir': {
        if (!args[0]) { err('mkdir: missing operand'); break; }
        const p = fsResolve(args[0], cwdPath);
        if (FS[p]) { err(`mkdir: cannot create directory '${args[0]}': File exists`); break; }
        FS[p] = { type: 'dir', children: [] };
        const parent = fsGet(cwdPath);
        if (parent && parent.children) parent.children.push(args[0]);
        ok(`mkdir: created directory '${args[0]}'`);
        break;
      }

      case 'touch': {
        if (!args[0]) { err('touch: missing file operand'); break; }
        const p = fsResolve(args[0], cwdPath);
        if (!FS[p]) {
          FS[p] = { type: 'file', content: '', icon: '📄' };
          const parent = fsGet(cwdPath);
          if (parent && parent.children) parent.children.push(args[0]);
        }
        ok(`touched '${args[0]}'`);
        break;
      }

      case 'rm': {
        if (!args[0]) { err('rm: missing operand'); break; }
        const p = fsResolve(args[0], cwdPath);
        if (!FS[p]) { err(`rm: cannot remove '${args[0]}': No such file`); break; }
        delete FS[p];
        const parent = fsGet(cwdPath);
        if (parent && parent.children) parent.children = parent.children.filter(c => c !== args[0]);
        ok(`removed '${args[0]}'`);
        break;
      }

      case 'open': {
        const apps = ['files', 'terminal', 'about', 'notepad', 'browser', 'settings'];
        if (!args[0] || !apps.includes(args[0])) {
          err(`open: invalid app. Choose: ${apps.join(', ')}`);
          break;
        }
        launchApp(args[0]);
        ok(`Opening ${args[0]}...`);
        break;
      }
      ///////////////////////////
      case 'neofetch': {
        const logo = `<span style="color:var(--accent)">
 ███████╗ █████╗ ██╗  ██╗███████╗
██╔════╝██╔══██╗██║ ██╔╝██╔════╝
█████╗  ███████║█████╔╝ █████╗
██╔══╝  ██╔══██║██╔═██╗ ██╔══╝
██║     ██║  ██║██║  ██╗███████╗
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
</span>`;
        print(logo);
        [
          ['OS', 'FAKE OS 3.1.0'],
          ['Kernel', 'fake-kernel 2025.02'],
          ['Shell', 'nsh 2.1'],
          ['CPU', 'FAKE-Core @ 4.8 GHz'],
          ['Memory', '16384MB / 32768MB'],
          ['GPU', 'FAKE-Graphics 4.2'],
          ['Uptime', '0h 5m'],
          ['User', 'guest'],
        ].forEach(([k, v]) => info(`  <span style="color:var(--accent2)">${k.padEnd(10)}</span>${v}`));
        break;
      }

      case 'matrix': {
        info('Initializing matrix sequence...');
        let n = 0;
        const iv = setInterval(() => {
          const row = Array.from({ length: 60 }, () => String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))).join('');
          info(`<span style="color:#00ff41">${row}</span>`);
          scrollTerminal(output);
          if (++n > 30) { clearInterval(iv); info('[Matrix simulation complete]'); }
        }, 80);
        break;
      }

      default:
        err(`${cmd}: command not found. Type 'help' for available commands.`);
    }
    scrollTerminal(output);
  }

  /* ── NOTEPAD ── */
  function buildNotepad(body) {
    body.innerHTML = `
    <div class="notepad-body">
      <div class="notepad-toolbar">
        <button class="notepad-tb-btn" id="np-new">New</button>
        <button class="notepad-tb-btn" id="np-save">Save</button>
        <button class="notepad-tb-btn" id="np-upper">UPPER</button>
        <button class="notepad-tb-btn" id="np-lower">lower</button>
        <span style="margin-left:auto;font-size:0.6rem;color:var(--text-dim)" id="np-wc">0 words</span>
      </div>
      <textarea class="notepad-textarea" id="np-text" placeholder="Start typing..." spellcheck="false"></textarea>
    </div>
  `;
    const ta = body.querySelector('#np-text');
    const wc = body.querySelector('#np-wc');

    ta.addEventListener('input', () => {
      const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
      wc.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    });

    body.querySelector('#np-new').addEventListener('click', () => { ta.value = ''; wc.textContent = '0 words'; });
    body.querySelector('#np-save').addEventListener('click', () => {
      showNotification('Notepad', 'File saved to /home/guest/notes.txt');
      FS['/home/guest/notes.txt'].content = ta.value;
    });
    body.querySelector('#np-upper').addEventListener('click', () => { ta.value = ta.value.toUpperCase(); });
    body.querySelector('#np-lower').addEventListener('click', () => { ta.value = ta.value.toLowerCase(); });
  }

  /* ── ABOUT ── */
  function buildAbout(body) {
    body.innerHTML = `
    <div class="about-body">
      <div class="about-logo">⬡</div>
      <div class="about-title">FAKE OS</div>
      <div class="about-sub">VERSION 3.1.0 — KERNEL BUILD 2025.02</div>
      ${[
        ['OS Name', 'FAKE OS'],
        ['Version', '3.1.0'],
        ['Kernel', 'fake-kernel 2025.02.27'],
        ['Architecture', 'x86_64'],
        ['Shell', 'nsh 2.1.0'],
        ['Desktop', 'FAKE Desktop Environment 3'],
        ['Display', window.innerWidth + '×' + window.innerHeight],
        ['CPU', 'FAKE-Core Quad @ 4.8 GHz'],
        ['Memory', '16 GB / 32 GB'],
        ['GPU', 'FAKE-Graphics 4.2 — 8 GB VRAM'],
        ['Storage', '512 GB SSD'],
        ['User', 'guest'],
        ['Built With', 'HTML · CSS · JavaScript'],
      ].map(([k, v]) => `<div class="about-row"><span>${k}</span><span>${v}</span></div>`).join('')}
    </div>
  `;
  }

  /* ── BROWSER ── */
  const fakeSites = {
    'fake.home': { title: 'FAKE Home Portal', html: `<h2>🏠 FAKE Home Portal</h2><p>Welcome to the internal FAKE OS browser.</p><p>Try visiting: <a class="fk-link" data-url="fake.docs">fake.docs</a> · <a class="fk-link" data-url="fake.news">fake.news</a> · <a class="fk-link" data-url="fake.about">fake.about</a></p>` },
    'fake.docs': { title: 'FAKE Docs', html: `<h2>📚 Documentation</h2><p>FAKE OS v3.1 Documentation Hub.</p><p><strong style="color:var(--accent2)">Terminal Commands:</strong> Open the terminal and type <code style="color:var(--accent)">help</code> to see all commands.</p><p><strong style="color:var(--accent2)">File System:</strong> Virtual FS rooted at /. Use the File Explorer to navigate.</p>` },
    'fake.news': { title: 'FAKE News', html: `<h2>📰 FAKE NEWS — Today</h2><p><strong style="color:var(--accent)">BREAKING:</strong> FAKE OS 3.1.0 released with redesigned desktop environment.</p><p>New features include procedural wallpapers, improved terminal, and enhanced window management.</p><p><em style="color:var(--text-dim)">Weather: 22°C · Partly cloudy · FAKE City</em></p>` },
    'fake.about': { title: 'About FAKE', html: `<h2>🧬 About FAKE OS</h2><p>FAKE OS is a browser-based simulated desktop environment built entirely with HTML, CSS, and JavaScript.</p><p>It features a full virtual file system, terminal emulator, draggable/resizable windows, and more — all without any external frameworks.</p>` },
  };

  function buildBrowser(body) {
    body.innerHTML = `
    <div class="browser-toolbar">
      <input class="browser-url" id="br-url" value="fake.home"/>
      <button class="browser-go">GO</button>
    </div>
    <div class="browser-content" id="br-content"></div>
  `;
    const urlInput = body.querySelector('#br-url');
    const content = body.querySelector('#br-content');
    const goBtn = body.querySelector('.browser-go');

    function navigate(url) {
      urlInput.value = url;
      const site = fakeSites[url.toLowerCase().trim()];
      if (site) {
        content.innerHTML = site.html;
        content.querySelectorAll('.fk-link').forEach(a => {
          a.addEventListener('click', () => navigate(a.dataset.url));
        });
      } else {
        content.innerHTML = `<h2>🔴 404 — Not Found</h2><p>The address <strong>${url}</strong> could not be resolved.</p><p>Try: <a class="fk-link" data-url="fake.home" style="color:var(--accent2);cursor:pointer;">fake.home</a></p>`;
        content.querySelectorAll('.fk-link').forEach(a => {
          a.addEventListener('click', () => navigate(a.dataset.url));
        });
      }
    }

    goBtn.addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keydown', e => { if (e.key === 'Enter') navigate(urlInput.value); });
    navigate('fake.home');
  }

  /* ── SETTINGS ── */
  function buildSettings(body) {
    body.innerHTML = `
    <div class="settings-body">
      <div class="settings-section">
        <div class="settings-title">APPEARANCE</div>
        <div class="settings-row">
          <span>Scanline Overlay</span>
          <div class="toggle on" id="toggle-scan"></div>
        </div>
        <div class="settings-row">
          <span>Animated Wallpaper</span>
          <div class="toggle on" id="toggle-wp"></div>
        </div>
        <div class="settings-row">
          <span>Wallpaper Style</span>
          <div class="wallpaper-grid">
            <div class="wp-swatch active" style="background:linear-gradient(135deg,#07090f,#0a1a2e)" data-wp="0" title="Dark"></div>
            <div class="wp-swatch" style="background:linear-gradient(135deg,#0a0020,#220040)" data-wp="1" title="Violet"></div>
            <div class="wp-swatch" style="background:linear-gradient(135deg,#001a0a,#002a14)" data-wp="2" title="Matrix"></div>
            <div class="wp-swatch" style="background:linear-gradient(135deg,#1a0a00,#2a1000)" data-wp="3" title="Ember"></div>
          </div>
        </div>
      </div>
      <div class="settings-section">
        <div class="settings-title">SYSTEM</div>
        <div class="settings-row"><span>OS Version</span><span style="color:var(--accent2)">FAKE OS 3.1.0</span></div>
        <div class="settings-row"><span>Kernel</span><span style="color:var(--accent2)">fake-kernel 2025.02</span></div>
        <div class="settings-row"><span>User</span><span style="color:var(--accent2)">guest</span></div>
      </div>
      <div class="settings-section">
        <div class="settings-title">DISPLAY</div>
        <div class="settings-row"><span>Resolution</span><span style="color:var(--accent2)" id="st-res">${window.innerWidth}×${window.innerHeight}</span></div>
        <div class="settings-row"><span>Color Depth</span><span style="color:var(--accent2)">32-bit</span></div>
      </div>
    </div>
  `;

    body.querySelectorAll('.toggle').forEach(t => {
      t.addEventListener('click', () => t.classList.toggle('on'));
    });

    body.querySelectorAll('.wp-swatch').forEach(s => {
      s.addEventListener('click', () => {
        body.querySelectorAll('.wp-swatch').forEach(x => x.classList.remove('active'));
        s.classList.add('active');
        wallpaperTheme = parseInt(s.dataset.wp);
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     WALLPAPER CANVAS
  ══════════════════════════════════════════════════════ */
  let wallpaperTheme = 0;
  const WALLPAPER_COLORS = [
    { bg: '#07090f', line: 'rgba(0,212,255,0.07)', star: '#00d4ff' },
    { bg: '#0a0020', line: 'rgba(160,0,255,0.08)', star: '#cc00ff' },
    { bg: '#001a0a', line: 'rgba(0,255,100,0.07)', star: '#00ff64' },
    { bg: '#1a0a00', line: 'rgba(255,100,0,0.08)', star: '#ff6400' },
  ];
  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 0.4 + Math.random() * 1.2,
    sp: 0.00002 + Math.random() * 0.00008,
    phase: Math.random() * Math.PI * 2
  }));

  function drawWallpaper(canvas, t) {
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    const theme = WALLPAPER_COLORS[wallpaperTheme];

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);

    /* Grid */
    const gs = 50;
    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    /* Stars */
    const sc = theme.star;
    stars.forEach(s => {
      const alpha = 0.4 + 0.6 * Math.sin(t * s.sp * 1000 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = sc.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('##', '#');
      // simple alpha approach
      ctx.globalAlpha = alpha;
      ctx.fillStyle = sc;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    /* Subtle radial vignette */
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function initWallpaper() {
    const canvas = document.getElementById('wallpaper-canvas');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    function loop(t) { drawWallpaper(canvas, t); requestAnimationFrame(loop); }
    requestAnimationFrame(loop);
  }

  /* ══════════════════════════════════════════════════════
     NOTIFICATIONS
  ══════════════════════════════════════════════════════ */
  function showNotification(title, msg) {
    const el = document.createElement('div');
    el.className = 'os-notif';
    el.innerHTML = `<div class="notif-title">${title}</div><div class="notif-msg">${msg}</div>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  /* ══════════════════════════════════════════════════════
     CONTEXT MENU
  ══════════════════════════════════════════════════════ */
  function buildContextMenu(x, y) {
    removeContextMenu();
    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.style.left = x + 'px'; menu.style.top = y + 'px';
    menu.innerHTML = `
    <div class="ctx-item" data-action="files">📁 Open Files</div>
    <div class="ctx-item" data-action="terminal">⌨ Open Terminal</div>
    <div class="ctx-item" data-action="notepad">📝 New Note</div>
    <div class="ctx-divider"></div>
    <div class="ctx-item" data-action="settings">⚙ Settings</div>
    <div class="ctx-divider"></div>
    <div class="ctx-item" data-action="about">🧬 About FAKE OS</div>
  `;
    menu.querySelectorAll('.ctx-item[data-action]').forEach(item => {
      item.addEventListener('click', () => { launchApp(item.dataset.action); removeContextMenu(); });
    });
    document.body.appendChild(menu);

    // Keep menu inside viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (x - rect.width) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (y - rect.height) + 'px';
  }
  function removeContextMenu() { document.getElementById('context-menu')?.remove(); }

  /* ══════════════════════════════════════════════════════
     APP LAUNCHER
  ══════════════════════════════════════════════════════ */
  const appTitles = {
    files: '📁 File Explorer', terminal: '⌨ Terminal', about: '🧬 About',
    notepad: '📝 Notepad', browser: '🌐 Browser', settings: '⚙ Settings'
  };
  const appSizes = {
    files: [680, 440], terminal: [620, 400], about: [420, 480],
    notepad: [560, 380], browser: [700, 460], settings: [460, 400]
  };

  function launchApp(app) {
    const [w, h] = appSizes[app] || [600, 420];
    const title = appTitles[app] || app;
    createWindow(app, title, w, h);
  }

  /* ══════════════════════════════════════════════════════
     CLOCK
  ══════════════════════════════════════════════════════ */
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('tray-clock').textContent = `${h}:${m}:${s}`;
    document.getElementById('tray-date').textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }

  /* ══════════════════════════════════════════════════════
     BOOT SEQUENCE
  ══════════════════════════════════════════════════════ */
  const BOOT_MESSAGES = [
    'Initializing FAKE kernel 2025.02...',
    'Loading hardware abstraction layer...',
    'Starting FAKE-Graphics 4.2 driver...',
    'Mounting virtual file system...',
    'Initializing FAKE-Net 2.1...',
    'Loading user environment...',
    'Starting desktop environment...',
    'Applying system policies...',
    'Boot complete. Launching login manager...',
  ];

  function runBoot() {
    const log = document.getElementById('boot-log');
    const bar = document.getElementById('boot-bar');
    let i = 0;

    function step() {
      if (i >= BOOT_MESSAGES.length) {
        setTimeout(showLogin, 400);
        return;
      }
      const div = document.createElement('div');
      div.textContent = '[ OK ]  ' + BOOT_MESSAGES[i];
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
      bar.style.width = ((i + 1) / BOOT_MESSAGES.length * 100) + '%';
      i++;
      setTimeout(step, 220 + Math.random() * 180);
    }
    setTimeout(step, 600);
  }

  function showLogin() {
    document.getElementById('boot-screen').style.opacity = '0';
    document.getElementById('boot-screen').style.transition = 'opacity 0.6s';
    setTimeout(() => {
      document.getElementById('boot-screen').classList.add('hidden');
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('login-input').focus();
    }, 650);
  }

  function showDesktop() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('desktop').classList.remove('hidden');
    initWallpaper();
    setInterval(updateClock, 1000);
    updateClock();
    setTimeout(() => showNotification('FAKE OS', 'Welcome back, Guest! System ready.'), 800);
    setTimeout(() => launchApp('terminal'), 1200);
  }

  /* ══════════════════════════════════════════════════════
     EVENTS
  ══════════════════════════════════════════════════════ */
  document.getElementById('login-btn').addEventListener('click', tryLogin);
  document.getElementById('login-input').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

  function tryLogin() {
    const val = document.getElementById('login-input').value;
    const err = document.getElementById('login-err');
    if (val === 'guest' || val === '') {
      err.classList.add('hidden');
      showDesktop();
    } else {
      err.classList.remove('hidden');
      document.getElementById('login-input').value = '';
      document.getElementById('login-input').classList.add('shake');
      setTimeout(() => document.getElementById('login-input').classList.remove('shake'), 400);
    }
  }

  /* Desktop icons */
  document.getElementById('desktop-icons').addEventListener('dblclick', e => {
    const icon = e.target.closest('.desk-icon');
    if (icon) launchApp(icon.dataset.app);
  });

  /* Context menu */
  document.getElementById('desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.os-window') || e.target.closest('#taskbar')) return;
    e.preventDefault();
    buildContextMenu(e.clientX, e.clientY);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('#context-menu')) removeContextMenu();
    if (!e.target.closest('#start-menu') && !e.target.closest('#taskbar-start')) {
      document.getElementById('start-menu').classList.add('hidden');
    }
  });

  /* Start menu */
  document.getElementById('taskbar-start').addEventListener('click', () => {
    document.getElementById('start-menu').classList.toggle('hidden');
  });
  document.getElementById('start-menu').addEventListener('click', e => {
    const item = e.target.closest('.sm-item[data-app]');
    if (item) { launchApp(item.dataset.app); document.getElementById('start-menu').classList.add('hidden'); }
  });
  document.getElementById('sm-logout').addEventListener('click', () => {
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-input').value = '';
    document.getElementById('start-menu').classList.add('hidden');
    // Close all windows
    Object.keys(openWindows).forEach(k => { openWindows[k].el.remove(); delete openWindows[k]; });
    document.getElementById('taskbar-apps').innerHTML = '';
  });

  /* Keyboard shortcut: Ctrl+Alt+T = terminal */
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.altKey && e.key === 't') launchApp('terminal');
  });

  /* ══════════════════════════════════════════════════════
     START
  ══════════════════════════════════════════════════════ */
  runBoot();

})();
