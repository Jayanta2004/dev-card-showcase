const video = document.getElementById('cameraVideo');
const canvas = document.getElementById('remixCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const overlayTint = document.getElementById('overlayTint');
const worldsList = document.getElementById('worldsList');
const questBox = document.getElementById('questBox');
const storyLog = document.getElementById('storyLog');
const toast = document.getElementById('toast');

const worldLabel = document.getElementById('worldLabel');
const hotspotCountLabel = document.getElementById('hotspotCount');
const questProgressLabel = document.getElementById('questProgress');
const recordingStatus = document.getElementById('recordingStatus');

const startCameraBtn = document.getElementById('startCameraBtn');
const captureFrameBtn = document.getElementById('captureFrameBtn');
const recordClipBtn = document.getElementById('recordClipBtn');
const shareBtn = document.getElementById('shareBtn');
const downloadLink = document.getElementById('downloadLink');

const hotspots = Array.from(document.querySelectorAll('.hotspot'));

let currentWorld = 'cyberpunk';
let animationId = null;
let mediaStream = null;
let foundHotspots = new Set();
let questDone = new Set();
let latestCapture = null;
let lastRecordedClip = null;

const worldConfig = {
  cyberpunk: {
    label: 'Cyberpunk City',
    tint: 'linear-gradient(135deg, rgba(31,206,255,0.25), rgba(234,74,255,0.22))',
    quest: 'Find and activate 3 city nodes to restore neon power.',
    hotspotStory: [
      'Node A online: hologram billboard wakes up.',
      'Node B online: drone lane lights ignite.',
      'Node C online: skyline pulses with neon rhythm.'
    ],
    transformPixel: (r, g, b) => [Math.min(255, r * 0.8 + 40), Math.min(255, g * 1.15 + 20), Math.min(255, b * 1.4 + 35)]
  },
  empire: {
    label: 'Ancient Empire',
    tint: 'linear-gradient(135deg, rgba(255,199,96,0.27), rgba(164,94,28,0.2))',
    quest: 'Recover 3 relic sigils to reopen the ceremonial gate.',
    hotspotStory: [
      'Relic 1 found: marble lions begin to glow.',
      'Relic 2 found: courtyard fountain starts flowing.',
      'Relic 3 found: gate to the archive opens.'
    ],
    transformPixel: (r, g, b) => {
      const sepiaR = r * 0.393 + g * 0.769 + b * 0.189;
      const sepiaG = r * 0.349 + g * 0.686 + b * 0.168;
      const sepiaB = r * 0.272 + g * 0.534 + b * 0.131;
      return [Math.min(255, sepiaR), Math.min(255, sepiaG), Math.min(255, sepiaB)];
    }
  },
  underwater: {
    label: 'Underwater World',
    tint: 'linear-gradient(135deg, rgba(74,185,255,0.3), rgba(51,255,201,0.2))',
    quest: 'Stabilize 3 coral beacons to guide the deep-sea caravan.',
    hotspotStory: [
      'Beacon 1 lit: fish swarm forms a path.',
      'Beacon 2 lit: coral tower blooms in color.',
      'Beacon 3 lit: sea caravan arrives safely.'
    ],
    transformPixel: (r, g, b) => [Math.min(255, r * 0.7), Math.min(255, g * 1.08 + 18), Math.min(255, b * 1.2 + 30)]
  }
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function resetQuest() {
  foundHotspots = new Set();
  questDone = new Set();
  hotspots.forEach((spot) => spot.classList.remove('found'));
  updateStats();
  renderQuest();
}

function renderQuest() {
  const world = worldConfig[currentWorld];
  questBox.innerHTML = `<p><strong>${world.label} Quest:</strong> ${world.quest}</p><p>${questDone.size === 3 ? '✅ Quest complete. Ready to export your 30s remix.' : 'Tap glowing hotspots in the remix view.'}</p>`;
}

function addLog(text) {
  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<p>${text}</p>`;
  storyLog.prepend(item);
  while (storyLog.children.length > 6) {
    storyLog.removeChild(storyLog.lastChild);
  }
}

function updateStats() {
  worldLabel.textContent = worldConfig[currentWorld].label;
  hotspotCountLabel.textContent = `${foundHotspots.size} / 3`;
  questProgressLabel.textContent = `${questDone.size} / 3`;
}

function applyWorld(worldKey) {
  currentWorld = worldKey;
  overlayTint.style.background = worldConfig[currentWorld].tint;
  worldsList.querySelectorAll('.world-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.world === worldKey));
  resetQuest();
  addLog(`Switched universe to ${worldConfig[currentWorld].label}.`);
}

function drawFrame() {
  if (video.readyState >= 2) {
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = img.data;
    const transform = worldConfig[currentWorld].transformPixel;

    for (let i = 0; i < pixels.length; i += 4) {
      const [nr, ng, nb] = transform(pixels[i], pixels[i + 1], pixels[i + 2]);
      pixels[i] = nr;
      pixels[i + 1] = ng;
      pixels[i + 2] = nb;
    }

    ctx.putImageData(img, 0, 0);
  }

  animationId = requestAnimationFrame(drawFrame);
}

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
    video.srcObject = mediaStream;
    await video.play();
    if (animationId) cancelAnimationFrame(animationId);
    drawFrame();
    showToast('Camera started');
    addLog('Live remix stream is active.');
  } catch (error) {
    showToast('Camera permission denied or unavailable');
  }
}

function captureImage() {
  if (!canvas.width) {
    showToast('Start camera first');
    return;
  }
  latestCapture = canvas.toDataURL('image/png');
  downloadLink.href = latestCapture;
  downloadLink.download = `reality-remix-${currentWorld}-${Date.now()}.png`;
  downloadLink.click();
  addLog('Captured remix frame as image.');
  showToast('Image captured');
}

async function exportClip30s() {
  if (!canvas.width) {
    showToast('Start camera first');
    return;
  }

  if (questDone.size < 3) {
    showToast('Complete mini-quest before export');
    return;
  }

  const stream = canvas.captureStream(30);
  const audioTrack = mediaStream?.getAudioTracks?.()[0];
  if (audioTrack) {
    stream.addTrack(audioTrack);
  }

  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    lastRecordedClip = blob;
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `reality-remix-${currentWorld}-${Date.now()}.webm`;
    downloadLink.click();
    recordingStatus.textContent = 'Ready';
    addLog('30-second remix clip exported.');
    showToast('30s clip exported');
  };

  recordingStatus.textContent = 'Recording...';
  recorder.start();
  addLog('Recording started: 30s export in progress.');
  showToast('Recording started');

  setTimeout(() => {
    if (recorder.state === 'recording') recorder.stop();
  }, 30000);
}

async function shareLatest() {
  try {
    if (lastRecordedClip && navigator.canShare) {
      const file = new File([lastRecordedClip], `reality-remix-${currentWorld}.webm`, { type: 'video/webm' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Reality Remix Camera',
          text: `Check my ${worldConfig[currentWorld].label} remix!`,
          files: [file]
        });
        addLog('Shared latest remix clip.');
        showToast('Shared successfully');
        return;
      }
    }

    if (latestCapture && navigator.share) {
      await navigator.share({
        title: 'Reality Remix Camera',
        text: `Check my ${worldConfig[currentWorld].label} remix frame!`,
        url: latestCapture
      });
      addLog('Shared latest remix image link.');
      showToast('Shared successfully');
      return;
    }

    showToast('No share target. Export clip/image and post manually.');
  } catch (error) {
    showToast('Share cancelled or unsupported');
  }
}

hotspots.forEach((spot, index) => {
  spot.addEventListener('click', () => {
    const id = index + 1;
    if (!foundHotspots.has(id)) {
      foundHotspots.add(id);
      questDone.add(id);
      spot.classList.add('found');
      addLog(worldConfig[currentWorld].hotspotStory[index]);
      showToast(`Hotspot ${id} activated`);
      updateStats();
      renderQuest();

      if (questDone.size === 3) {
        addLog(`Quest complete in ${worldConfig[currentWorld].label}.`);
        showToast('Quest complete! You can export a 30s clip.');
      }
    }
  });
});

worldsList.addEventListener('click', (event) => {
  const target = event.target.closest('.world-btn');
  if (!target) return;
  applyWorld(target.dataset.world);
});

startCameraBtn.addEventListener('click', startCamera);
captureFrameBtn.addEventListener('click', captureImage);
recordClipBtn.addEventListener('click', exportClip30s);
shareBtn.addEventListener('click', shareLatest);

applyWorld('cyberpunk');
renderQuest();
updateStats();
addLog('Pick a world and start camera to begin your remix.');
