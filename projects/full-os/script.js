  (function() {
    // get elements
    const editor = document.getElementById('codeEditor');
    const outputDiv = document.getElementById('liveOutput');
    const frame = document.getElementById('outputFrame');

    // helper to render code into outputDiv using srcdoc trick (unique live coding)
    function renderOutput() {
      const code = editor.value;
      // construct a full document, preserve styling, allow script
      const doc = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><style>body { background: #0f0d1a; color: #d8d0ff; font-family: 'Inter', sans-serif; padding:1rem; }</style></head>
        <body>${code}</body>
        </html>
      `;
      // we can render using iframe srcdoc, but we show preview in liveOutput div via iframe injection? 
      // Actually we will write into iframe and then copy? more stable: use iframe and show in liveOutput?
      // better: replace content of liveOutput with iframe (styled) – but we want seamless.
      // Using iframe srcdoc and display it inside #liveOutput (as embedded iframe).
      // For simplicity, we put an iframe inside outputDiv (or replace).
      // But we already have hidden iframe. Let's create a visible iframe inside outputDiv.
      outputDiv.innerHTML = ''; // clear
      const previewFrame = document.createElement('iframe');
      previewFrame.style.width = '100%';
      previewFrame.style.height = '120px';
      previewFrame.style.border = 'none';
      previewFrame.style.borderRadius = '10px 2px 10px 2px';
      previewFrame.style.background = '#0b0916';
      previewFrame.srcdoc = doc;
      outputDiv.appendChild(previewFrame);
    }

    // default render on load
    window.addEventListener('load', () => {
      renderOutput();
    });

    // run on button click
    window.runCode = function() {
      renderOutput();
    };

    // reset to html demo (like first card)
    window.resetEditor = function() {
      editor.value = `<!-- default playful example -->
<h2 style="color:#bcaef0;">✨ fresh start</h2>
<p>write any <strong>html/css/js</strong> – it renders below</p>
<script>
  document.write('<span style=\"color:#82f0c2;\">✓ live update</span>');
<\/script>`;
      renderOutput();
    };

    // update snippet based on lesson card click (unique content per card)
    window.updateCodeSnippet = function(topic) {
      let snippet = '';
      if (topic === 'html') {
        snippet = `<!-- HTML deep dive : semantic structure -->
<article style="border:2px solid #6d5ac9; padding:1rem; border-radius:20px 4px;">
  <header><h2>📘 nav header</h2></header>
  <main><p>open source learning model</p></main>
  <footer>✨ footer note</footer>
</article>`;
      } else if (topic === 'css') {
        snippet = `<!-- CSS grid + flex example -->
<div style="display:flex; gap:10px; flex-wrap:wrap;">
  <div style="background:#4b3b8b; padding:1rem; border-radius:18px 2px;">cell A</div>
  <div style="background:#6d5ac9; padding:1rem; border-radius:18px 2px;">cell B</div>
  <div style="background:#332b60; padding:1rem; border-radius:18px 2px;">cell C</div>
</div>
<style>
  /* unique gradient hover */
  div:hover { filter: brightness(1.3); }
</style>`;
      } else if (topic === 'js') {
        snippet = `<!-- JS closure demo -->
<div id="closureDemo" style="padding:1rem; background:#23203b;">✨ click counter</div>
<script>
  let count = 0;
  const demo = document.getElementById('closureDemo');
  if (demo) {
    demo.addEventListener('click', function() {
      count++;
      demo.innerText = 'click count: ' + count;
    });
  }
<\/script>`;
      } else if (topic === 'challenge') {
        snippet = `<!-- array method remix challenge -->
<h4>🧩 unique array output</h4>
<div id="arrayOut" style="background:#171429; padding:1rem;">[ ... ]</div>
<script>
  const arr = [3, 7, 11, 5];
  const mapped = arr.map(x => x * 2).join(' · ');
  document.getElementById('arrayOut').innerText = '[' + mapped + ']';
<\/script>`;
      }
      if (snippet) {
        editor.value = snippet;
        renderOutput();
      }
    };

    // optional: ctrl+enter run
    editor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        renderOutput();
      }
    });

    // initial render also on any change? we keep manual run, but to make interactive we can add "live" toggle? but unique enough.
    // we also attach to blur? just run with button. but we can call renderOutput after updateCodeSnippet already does.

    // additionally, for extra interactive vibe, we can provide default demo.
  })();