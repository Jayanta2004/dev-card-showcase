const data = {
  australopithecus:{
    img:"images/australopithecus.webp",
    title:"Australopithecus",
    text:"Early bipedal hominins with small brains (~400cc). They lived in Africa and marked the beginning of upright walking."
  },
  habilis:{
    img:"images/habilis.webp",
    title:"Homo habilis",
    text:"Known as the 'handy man'. First species to use stone tools, showing early problem-solving skills."
  },
  erectus:{
    img:"images/erectus.webp",
    title:"Homo erectus",
    text:"First to control fire and migrate out of Africa. Brain size increased significantly (~900cc)."
  },
  neanderthal:{
    img:"images/neanderthal.webp",
    title:"Neanderthals",
    text:"Strong, intelligent humans adapted to cold climates with advanced tools and social behavior."
  },
  sapiens:{
    img:"images/sapiens.webp",
    title:"Homo sapiens",
    text:"Modern humans with complex language, art, culture, and advanced technology."
  }
};

function openModal(key){
  document.getElementById("modalImg").src = data[key].img;
  document.getElementById("modalTitle").innerText = data[key].title;
  document.getElementById("modalText").innerText = data[key].text;
  document.getElementById("modal").style.display = "flex";
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}

/* Scroll reveal */
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add("show");
    }
  });
},{threshold:.2});

document.querySelectorAll(".hidden").forEach(el=>observer.observe(el));