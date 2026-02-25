// Dream-to-Design Generator
// Upload sketch, prompt, generate wireframe, palette, fonts, UI suggestions, export HTML/CSS

let design = null;

function styleName(val) {
    return ['Minimal','Brutalist','Retro-Futuristic'][val];
}

function generatePalette(style) {
    if(style===0) return ['#f7f9fb','#7e57c2','#5bc0be','#388e3c','#fff'];
    if(style===1) return ['#222','#ffb300','#d32f2f','#fff','#7e57c2'];
    return ['#00eaff','#ff00c8','#222','#fff','#7e57c2'];
}

function generateFonts(style) {
    if(style===0) return ['Segoe UI','Montserrat'];
    if(style===1) return ['Oswald','Roboto Mono'];
    return ['Orbitron','Press Start 2P'];
}

function generateUI(style) {
    if(style===0) return ['Card','Button','Input','Navbar','List'];
    if(style===1) return ['Grid','Block','Bold Button','Banner','Modal'];
    return ['Panel','Slider','Pixel Button','Retro Navbar','Badge'];
}

function generateWireframe(sketch, prompt, style) {
    return `<img src="${sketch}" style="max-width:100px;border-radius:8px;"> <b>${prompt}</b> <br>Style: ${styleName(style)}`;
}

function renderPreview() {
    const preview = document.getElementById('designPreview');
    if(!design) { preview.innerHTML = 'No design generated yet.'; return; }
    preview.innerHTML = generateWireframe(design.sketch,design.prompt,design.style)+
        '<div class="palette">'+design.palette.map(c=>`<span style="background:${c}"></span>`).join('')+'</div>'+`<div class="font-pair">Fonts: ${design.fonts.join(' & ')}</div>`+
        '<ul class="ui-list">'+design.ui.map(u=>`<li>${u}</li>`).join('')+'</ul>';
}

function renderExport() {
    const exportCode = document.getElementById('exportCode');
    if(!design) { exportCode.textContent = 'No design generated yet.'; return; }
    exportCode.textContent = `<!DOCTYPE html>\n<html>\n<head>\n<style>body{background:${design.palette[0]};font-family:${design.fonts[0]};color:${design.palette[1]};}\n.card{background:${design.palette[4]};border-radius:8px;padding:16px;}\n.button{background:${design.palette[2]};color:${design.palette[3]};border:none;border-radius:6px;padding:8px 16px;}\n</style>\n</head>\n<body>\n<div class='card'>${design.prompt}</div>\n<button class='button'>Sample Button</button>\n</body>\n</html>`;
}

function setupNav() {
    const navInput = document.getElementById('navInput');
    const navPreview = document.getElementById('navPreview');
    const navExport = document.getElementById('navExport');
    const inputSection = document.getElementById('inputSection');
    const previewSection = document.getElementById('previewSection');
    const exportSection = document.getElementById('exportSection');
    function showSection(section) {
        [inputSection,previewSection,exportSection].forEach(s=>s.classList.remove('active'));
        section.classList.add('active');
        [navInput,navPreview,navExport].forEach(b=>b.classList.remove('active'));
        if(section===inputSection) navInput.classList.add('active');
        if(section===previewSection) navPreview.classList.add('active');
        if(section===exportSection) navExport.classList.add('active');
    }
    navInput.onclick = ()=>showSection(inputSection);
    navPreview.onclick = ()=>showSection(previewSection);
    navExport.onclick = ()=>showSection(exportSection);
}

function setupForm() {
    const designForm = document.getElementById('designForm');
    const sketchInput = document.getElementById('sketchInput');
    const promptInput = document.getElementById('promptInput');
    const styleSlider = document.getElementById('styleSlider');
    const styleLabel = document.getElementById('styleLabel');
    const inputStatus = document.getElementById('inputStatus');
    styleSlider.oninput = ()=>{
        styleLabel.textContent = styleName(parseInt(styleSlider.value));
    };
    designForm.onsubmit = e=>{
        e.preventDefault();
        const file = sketchInput.files[0];
        const prompt = promptInput.value.trim();
        const style = parseInt(styleSlider.value);
        if(!file||!prompt) { inputStatus.innerHTML = '<div class="error">Upload sketch and enter prompt.</div>'; return; }
        const reader = new FileReader();
        reader.onload = function(ev) {
            design = {
                sketch: ev.target.result,
                prompt,
                style,
                palette: generatePalette(style),
                fonts: generateFonts(style),
                ui: generateUI(style)
            };
            inputStatus.innerHTML = '<div class="status">Design generated!</div>';
            renderPreview();
            renderExport();
        };
        reader.readAsDataURL(file);
    };
}

function setupExport() {
    document.getElementById('exportBtn').onclick = ()=>{
        if(!design) return;
        const blob = new Blob([document.getElementById('exportCode').textContent],{type:'text/html'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'starter-design.html';
        a.click();
        URL.revokeObjectURL(url);
    };
}

window.onload = function() {
    setupNav();
    setupForm();
    setupExport();
    renderPreview();
    renderExport();
};
