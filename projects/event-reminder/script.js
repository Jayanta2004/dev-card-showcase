const eventList = document.getElementById("eventList");
let events = JSON.parse(localStorage.getItem("events")) || [];

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

function addEvent() {
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const desc = document.getElementById("desc").value.trim();

  if (!title || !date) {
    alert("Please enter event title and date");
    return;
  }

  events.push({ title, date, desc });
  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveEvents();
  renderEvents();

  document.getElementById("title").value = "";
  document.getElementById("date").value = "";
  document.getElementById("desc").value = "";
}

function getStatus(date) {
  const today = new Date();
  const eventDate = new Date(date);
  today.setHours(0,0,0,0);
  eventDate.setHours(0,0,0,0);

  const diff = (eventDate - today) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 3) return "soon";
  return "";
}

function deleteEvent(index) {
  events.splice(index, 1);
  saveEvents();
  renderEvents();
}

function renderEvents() {
  eventList.innerHTML = "";

  events.forEach((e, i) => {
    const status = getStatus(e.date);
    const li = document.createElement("li");

    li.className = "event";
    li.innerHTML = `
      <strong>${e.title}</strong>
      <small>📅 ${e.date}</small>
      ${e.desc ? `<small>${e.desc}</small>` : ""}
      ${status ? `<span class="badge ${status}">${status.toUpperCase()}</span>` : ""}
      <span class="delete" onclick="deleteEvent(${i})">✖</span>
    `;

    eventList.appendChild(li);
  });
}

renderEvents();
