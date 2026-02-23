// app.js - Custom Meme Generator
// Meme templates (add more URLs as needed)
const memeTemplates = [
    { name: 'Distracted Boyfriend', url: 'https://i.imgflip.com/1ur9b0.jpg' },
    { name: 'Drake Hotline Bling', url: 'https://i.imgflip.com/30b1gx.jpg' },
    { name: 'Two Buttons', url: 'https://i.imgflip.com/1g8my4.jpg' },
    { name: 'Expanding Brain', url: 'https://i.imgflip.com/1jwhww.jpg' },
    { name: 'Change My Mind', url: 'https://i.imgflip.com/24y43o.jpg' },
    { name: 'Mocking Spongebob', url: 'https://i.imgflip.com/1otk96.jpg' },
    { name: 'UNO Draw 25', url: 'https://i.imgflip.com/3lmzyx.jpg' },
    { name: 'Left Exit 12 Off Ramp', url: 'https://i.imgflip.com/22bdq6.jpg' }
];

const templateSelect = document.getElementById('template-select');
const randomTemplateBtn = document.getElementById('random-template');
const topCaptionInput = document.getElementById('top-caption');
const bottomCaptionInput = document.getElementById('bottom-caption');
const suggestCaptionBtn = document.getElementById('suggest-caption');
const memeCanvas = document.getElementById('meme-canvas');
const downloadBtn = document.getElementById('download-meme');
const shareBtn = document.getElementById('share-meme');

// Populate template dropdown
memeTemplates.forEach((tpl, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = tpl.name;
    templateSelect.appendChild(opt);
});

// Draw meme
function drawMeme() {
    const ctx = memeCanvas.getContext('2d');
    const idx = templateSelect.value;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = memeTemplates[idx].url;
    img.onload = function() {
        memeCanvas.width = img.width;
        memeCanvas.height = img.height;
        ctx.clearRect(0, 0, memeCanvas.width, memeCanvas.height);
        ctx.drawImage(img, 0, 0);
        ctx.font = `bold ${Math.floor(img.height/10)}px Impact, Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.fillStyle = '#fff';
        // Top caption
        drawCaption(ctx, topCaptionInput.value, img.width/2, img.height*0.12);
        // Bottom caption
        drawCaption(ctx, bottomCaptionInput.value, img.width/2, img.height*0.92);
    };
}

function drawCaption(ctx, text, x, y) {
    if (!text) return;
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.strokeText(text.toUpperCase(), x, y);
    ctx.fillText(text.toUpperCase(), x, y);
    ctx.restore();
}

templateSelect.addEventListener('change', drawMeme);
topCaptionInput.addEventListener('input', drawMeme);
bottomCaptionInput.addEventListener('input', drawMeme);
randomTemplateBtn.addEventListener('click', () => {
    templateSelect.value = Math.floor(Math.random() * memeTemplates.length);
    drawMeme();
});

// Download meme
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = memeCanvas.toDataURL('image/png');
    link.click();
});

// Share meme (Web Share API)
shareBtn.addEventListener('click', async () => {
    memeCanvas.toBlob(async (blob) => {
        const file = new File([blob], 'meme.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Check out my meme!',
                text: 'Made with Meme Generator!'
            });
        } else {
            alert('Sharing not supported on this device.');
        }
    });
});

// AI Caption Suggestion
suggestCaptionBtn.addEventListener('click', async () => {
    suggestCaptionBtn.disabled = true;
    suggestCaptionBtn.textContent = 'Thinking...';
    try {
        const idx = templateSelect.value;
        const memeName = memeTemplates[idx].name;
        const prompt = `Suggest a witty meme caption for the meme template: "${memeName}". Return two lines: top and bottom.`;
        const captions = await getAICaption(prompt);
        if (captions.top) topCaptionInput.value = captions.top;
        if (captions.bottom) bottomCaptionInput.value = captions.bottom;
        drawMeme();
    } catch (e) {
        alert('AI caption failed.');
    }
    suggestCaptionBtn.disabled = false;
    suggestCaptionBtn.textContent = 'Suggest Witty Caption (AI)';
});

// OpenAI API integration
async function getAICaption(prompt) {
    // Replace with your OpenAI API key
    const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a witty meme caption generator.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 60,
            temperature: 0.9
        })
    });
    if (!response.ok) throw new Error('OpenAI API error');
    const data = await response.json();
    // Expecting: Top: ...\nBottom: ...
    const text = data.choices[0].message.content;
    const match = text.match(/top\s*[:\-]?\s*(.*)\n+bottom\s*[:\-]?\s*(.*)/i);
    return match ? { top: match[1], bottom: match[2] } : { top: text, bottom: '' };
}

// Initial draw
templateSelect.value = 0;
drawMeme();
