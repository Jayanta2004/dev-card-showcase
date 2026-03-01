document.addEventListener("DOMContentLoaded", () => {

let events = JSON.parse(localStorage.getItem("timelineEvents")) || [];

const timeline = document.getElementById("timeline");
const progressLine = document.getElementById("progressLine");

function save() {
  localStorage.setItem("timelineEvents", JSON.stringify(events));
}

function render() {
  timeline.innerHTML = "";

  events.sort((a,b) => new Date(a.date) - new Date(b.date));

  events.forEach((event, index) => {
    const div = document.createElement("div");
    div.className = "timeline-item " + (index % 2 === 0 ? "left" : "right");
    div.draggable = true;

    div.innerHTML = `
      <h3>${event.date} - ${event.title}</h3>
      <p>${event.desc}</p>
    `;

    div.addEventListener("click", () => {
      div.classList.toggle("expanded");
    });

    div.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("index", index);
    });

    div.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    div.addEventListener("drop", (e) => {
      const from = e.dataTransfer.getData("index");
      const temp = events[from];
      events.splice(from,1);
      events.splice(index,0,temp);
      save();
      render();
    });

    timeline.appendChild(div);
  });

  progressLine.style.height = events.length * 120 + "px";
}

document.getElementById("addEvent").addEventListener("click", () => {
  const date = document.getElementById("eventDate").value;
  const title = document.getElementById("eventTitle").value;
  const desc = document.getElementById("eventDesc").value;

  if (!date || !title) return;

  events.push({ date, title, desc });
  save();
  render();
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(events, null, 2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "timeline.json");
  dlAnchor.click();
});

render();

});