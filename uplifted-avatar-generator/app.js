// Uplifted Avatar Generator App
// ...existing code...
const TRAITS = ['Kind', 'Creative', 'Brave', 'Optimistic', 'Helpful', 'Patient', 'Curious', 'Resilient', 'Generous', 'Joyful'];
class Avatar {
  constructor(traits) {
    this.traits = traits;
    this.image = this.generateImage();
  }
  generateImage() {
    // Simple avatar: colored circle with trait badges
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.arc(64,64,60,0,2*Math.PI);
    ctx.fill();
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.traits.join(', '), 64, 64);
    return canvas.toDataURL();
  }
}
class AvatarGallery {
  constructor() {
    this.avatars = [];
    this.load();
  }
  addAvatar(avatar) {
    this.avatars.push(avatar);
    this.save();
  }
  getAvatars() {
    return this.avatars.slice().reverse();
  }
  save() {
    localStorage.setItem('avatars', JSON.stringify(this.avatars));
  }
  load() {
    const data = localStorage.getItem('avatars');
    if (data) this.avatars = JSON.parse(data);
  }
}
const gallery = new AvatarGallery();
function renderTraitsSection() {
  const div = document.getElementById('traits-section');
  div.innerHTML = `<h2>Select Your Positive Traits</h2>` + TRAITS.map(t => `<label><input type="checkbox" value="${t}">${t}</label>`).join('') + `<br><button onclick="generateAvatar()">Generate Avatar</button>`;
}
function generateAvatar() {
  const selected = Array.from(document.querySelectorAll('#traits-section input:checked')).map(i => i.value);
  if (selected.length === 0) return alert('Select at least one trait!');
  const avatar = new Avatar(selected);
  renderAvatarSection(avatar);
  renderShareSection(avatar);
}
function renderAvatarSection(avatar) {
  const div = document.getElementById('avatar-section');
  div.innerHTML = `<h2>Your Avatar</h2><img src="${avatar.image}" class="avatar-canvas" width="128" height="128">` + avatar.traits.map(t => `<span class="trait-badge">${t}</span>`).join('');
}
function renderShareSection(avatar) {
  const div = document.getElementById('share-section');
  div.innerHTML = `<button onclick="shareAvatar()">Share to Gallery</button>`;
  window.shareAvatar = function() {
    gallery.addAvatar({ image: avatar.image, traits: avatar.traits });
    renderGallerySection();
  };
}
function renderGallerySection() {
  const div = document.getElementById('gallery-section');
  const avatars = gallery.getAvatars();
  div.innerHTML = avatars.length ? avatars.map(a => `<div class="gallery-card"><img src="${a.image}" class="gallery-avatar"><div>${a.traits.map(t => `<span class="trait-badge">${t}</span>`).join('')}</div></div>`).join('') : '<p>No avatars yet.</p>';
}
renderTraitsSection();
renderGallerySection();
