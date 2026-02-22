// Digital Time Capsule - Write, Upload, Record, and Lock for the Future

let recordedVideoBlob = null;

function getCapsules() {
    return JSON.parse(localStorage.getItem('timeCapsules') || '[]');
}
function saveCapsule(capsule) {
    const capsules = getCapsules();
    capsules.push(capsule);
    localStorage.setItem('timeCapsules', JSON.stringify(capsules));
}

function renderCapsules() {
    const capsules = getCapsules();
    const capsuleList = document.getElementById('capsuleList');
    capsuleList.innerHTML = '';
    const today = new Date().toISOString().slice(0,10);
    capsules.slice().reverse().forEach((c, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="capsule-title">To: ${c.recipient}</span> <span class="capsule-date">(Open on: ${c.openDate})</span><br>
            <span class="capsule-message">${c.message}</span>`;
        // Files
        if (c.files && c.files.length) {
            const filesDiv = document.createElement('div');
            filesDiv.className = 'capsule-files';
            c.files.forEach((f, i) => {
                const a = document.createElement('a');
                a.href = f.data;
                a.download = f.name;
                a.textContent = f.name;
                filesDiv.appendChild(a);
            });
            li.appendChild(filesDiv);
        }
        // Video
        if (c.video) {
            const video = document.createElement('video');
            video.src = c.video;
            video.controls = true;
            video.className = 'capsule-video';
            li.appendChild(video);
        }
        // Only show if open date is today or past
        if (c.openDate <= today) {
            capsuleList.appendChild(li);
        }
    });
}

function readFiles(input, callback) {
    const files = Array.from(input.files);
    if (!files.length) return callback([]);
    let loaded = 0;
    const result = [];
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            result.push({ name: file.name, data: e.target.result });
            loaded++;
            if (loaded === files.length) callback(result);
        };
        reader.readAsDataURL(file);
    });
}

// Video recording
let mediaRecorder, videoChunks = [];
document.getElementById('startRecord').onclick = async function() {
    const videoPreview = document.getElementById('videoPreview');
    videoPreview.style.display = 'block';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Video recording not supported.');
        return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoPreview.srcObject = stream;
    videoChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => videoChunks.push(e.data);
    mediaRecorder.onstop = () => {
        recordedVideoBlob = new Blob(videoChunks, { type: 'video/webm' });
        videoPreview.srcObject = null;
        videoPreview.src = URL.createObjectURL(recordedVideoBlob);
        stream.getTracks().forEach(track => track.stop());
    };
    mediaRecorder.start();
    this.textContent = 'Stop Recording';
    this.onclick = function() {
        mediaRecorder.stop();
        this.textContent = 'Record Video';
        this.onclick = arguments.callee;
    };
};

document.addEventListener('DOMContentLoaded', () => {
    renderCapsules();
    document.getElementById('capsuleForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const recipient = document.getElementById('recipient').value.trim();
        const message = document.getElementById('message').value.trim();
        const openDate = document.getElementById('openDate').value;
        const fileInput = document.getElementById('fileUpload');
        readFiles(fileInput, files => {
            let videoData = null;
            if (recordedVideoBlob) {
                videoData = URL.createObjectURL(recordedVideoBlob);
                recordedVideoBlob = null;
                document.getElementById('videoPreview').src = '';
                document.getElementById('videoPreview').style.display = 'none';
            }
            saveCapsule({ recipient, message, openDate, files, video: videoData });
            renderCapsules();
            document.getElementById('capsuleForm').reset();
        });
    });
});
