const feed = document.getElementById("feed");
const postBtn = document.getElementById("postBtn");
const text = document.getElementById("text");
const image = document.getElementById("image");
const loader = document.getElementById("loader");

const users = ["Aarav","Meera","Zoya","Rohit","Isha","Kiran"];
const lines = [
  "Writing my thoughts ✍️",
  "Another beautiful day.",
  "Dreaming big.",
  "Learning JavaScript.",
  "Building apps."
];

let posts = JSON.parse(localStorage.getItem("notegram")) || [];
let visible = 0;

function save(){
  localStorage.setItem("notegram", JSON.stringify(posts));
}

function fake(n = 6){
  return Array.from({length: n}, () => ({
    user: users[Math.random() * users.length | 0],
    text: lines[Math.random() * lines.length | 0],
    image: `https://picsum.photos/seed/${Math.random()}/500/300`,
    time: Date.now() - Math.random() * 1e9,
    likes: 0,
    comments: []
  }));
}

function render(){
  const slice = posts.slice(visible, visible + 6);
  slice.forEach((p, i) => {
    const idx = visible + i;
    const d = document.createElement("div");
    d.className = "post";
    d.innerHTML = `
      <div class="user">@${p.user}</div>
      <div class="time">${new Date(p.time).toLocaleString()}</div>
      <p>${p.text}</p>
      ${p.image ? `<img src="${p.image}" onclick="openImage('${p.image}')">` : ""}
      <div class="actions">
        <button onclick="like(${idx})">Like ${p.likes}</button>
        <button onclick="toggle(${idx})">Comment ${(p.comments || []).length}</button>
        ${p.user === "You" ? `<button onclick="del(${idx})">Delete</button>` : ""}
      </div>

      <div class="comments" id="c${idx}" style="display:none">
        ${(p.comments || []).map(c => `<div>• ${c}</div>`).join("")}
        <input class="comment-input" placeholder="Write a comment..."
          onkeydown="comment(event, ${idx})">
      </div>
    `;
    feed.appendChild(d);
  });
  visible += slice.length;
}

postBtn.onclick = () => {
  if(!text.value && !image.files[0]) return;

  const r = new FileReader();
  r.onload = () => {
    posts.unshift({
      user: "You",
      text: text.value,
      image: r.result || null,
      time: Date.now(),
      likes: 0,
      comments: []
    });
    save();
    feed.innerHTML = "";
    visible = 0;
    render();
    text.value = "";
    image.value = "";
  };

  image.files[0] ? r.readAsDataURL(image.files[0]) : r.onload();
};

function like(i){
  posts[i].likes++;
  save();
  feed.innerHTML = "";
  visible = 0;
  render();
}

function toggle(i){
  const e = document.getElementById("c" + i);
  e.style.display = e.style.display === "none" ? "block" : "none";
}

function comment(e, i){
  if(e.key === "Enter" && e.target.value.trim()){
    posts[i].comments = posts[i].comments || [];
    posts[i].comments.push(e.target.value);
    save();
    feed.innerHTML = "";
    visible = 0;
    render();
  }
}

window.addEventListener("scroll", () => {
  if(innerHeight + scrollY >= document.body.offsetHeight - 200){
    loader.style.display = "block";
    setTimeout(() => {
      render();
      loader.style.display = "none";
    }, 300);
  }
});

if(posts.length === 0){
  posts = fake(20);
  save();
}

function openImage(src){
  const modal = document.getElementById("imageModal");
  const img = document.getElementById("modalImg");
  img.src = src;
  modal.style.display = "flex";
}

function closeImage(){
  document.getElementById("imageModal").style.display = "none";
}

function del(i){
  if(confirm("Delete this post?")){
    posts.splice(i,1);
    save();
    feed.innerHTML = "";
    visible = 0;
    render();
  }
}


render();
