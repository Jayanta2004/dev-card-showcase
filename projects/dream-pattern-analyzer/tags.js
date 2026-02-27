// Dream Pattern Analyzer - Tagging System

function getTags() {
    return JSON.parse(localStorage.getItem('dreamTags') || '[]');
}

function saveTag(tag) {
    const tags = getTags();
    if (!tags.includes(tag)) {
        tags.push(tag);
        localStorage.setItem('dreamTags', JSON.stringify(tags));
    }
}

function tagDream(dreamIdx, tag) {
    const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
    if (dreams[dreamIdx]) {
        dreams[dreamIdx].tags = dreams[dreamIdx].tags || [];
        if (!dreams[dreamIdx].tags.includes(tag)) {
            dreams[dreamIdx].tags.push(tag);
            localStorage.setItem('dreams', JSON.stringify(dreams));
        }
        saveTag(tag);
    }
}

function getDreamTags(dreamIdx) {
    const dreams = JSON.parse(localStorage.getItem('dreams') || '[]');
    return dreams[dreamIdx] && dreams[dreamIdx].tags ? dreams[dreamIdx].tags : [];
}

window.DreamTags = { getTags, saveTag, tagDream, getDreamTags };
