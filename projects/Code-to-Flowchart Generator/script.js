import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.5/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad:false });

// Theme toggle
const themeBtn = document.getElementById('themeToggle');
if(themeBtn){
  themeBtn.addEventListener('click',()=>{
    document.body.classList.toggle('dark-theme');
    themeBtn.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  });
}

// Flowchart rendering
const renderBtn = document.getElementById('renderBtn');
if(renderBtn){
  renderBtn.addEventListener('click',()=>{
    const code = document.getElementById('code').value.trim();
    const chartDiv = document.getElementById('chart');
    chartDiv.innerHTML='';
    try{
      const tempDiv=document.createElement('div');
      tempDiv.className='mermaid';
      tempDiv.textContent=code;
      chartDiv.appendChild(tempDiv);
      mermaid.init({}, tempDiv);
    }catch(err){
      chartDiv.textContent='Syntax error: '+err.message;
    }
  });
}


// Save diagram as SVG
const saveBtn = document.getElementById('saveBtn');

if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    const svg = document.querySelector('#chart svg');

    if (!svg) {
      alert('Please render a flowchart first.');
      return;
    }

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });
}
