const calendarPage = document.getElementById("calendarPage");
const eventPage = document.getElementById("eventPage");
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const selectedDateText = document.getElementById("selectedDateText");
const eventTitle = document.getElementById("eventTitle");
const eventDesc = document.getElementById("eventDesc");

const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const backBtn = document.getElementById("backBtn");
const saveBtn = document.getElementById("saveBtn");

let currentDate = new Date();
let selectedDateKey = "";

let events = JSON.parse(localStorage.getItem("events")) || {};

function showCalendarPage() {
  calendarPage.classList.add("active");
  eventPage.classList.remove("active");
}

function showEventPage() {
  calendarPage.classList.remove("active");
  eventPage.classList.add("active");
}

function renderCalendar() {
  calendar.innerHTML = "";
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = `${currentDate.toLocaleString("default", { month: "long" })} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "day";
    div.textContent = day;

    const key = `${year}-${month + 1}-${day}`;

    if (events[key]) {
      div.classList.add("has-event");
      const dot = document.createElement("div");
      dot.className = "event-dot";
      div.appendChild(dot);
    }

    div.onclick = () => openEventPage(key);
    calendar.appendChild(div);
  }
}

function openEventPage(key) {
  selectedDateKey = key;
  selectedDateText.textContent = `Event for ${key}`;
  eventTitle.value = events[key]?.title || "";
  eventDesc.value = events[key]?.desc || "";
  showEventPage();
}

saveBtn.onclick = () => {
  if (!eventTitle.value.trim()) {
    alert("Please enter a title");
    return;
  }

  events[selectedDateKey] = {
    title: eventTitle.value,
    desc: eventDesc.value
  };

  localStorage.setItem("events", JSON.stringify(events));
  renderCalendar();
  showCalendarPage();
};

backBtn.onclick = showCalendarPage;

prevMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

nextMonthBtn.onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

renderCalendar();
