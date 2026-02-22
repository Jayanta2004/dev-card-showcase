// Export and Import functionality for Dream Pattern Analyzer

function exportDreams() {
    const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dreams, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "dreams_export.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function importDreams(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                localStorage.setItem('dreams', JSON.stringify(imported));
                callback(true);
            } else {
                callback(false);
            }
        } catch {
            callback(false);
        }
    };
    reader.readAsText(file);
}

window.DreamExport = { exportDreams, importDreams };
