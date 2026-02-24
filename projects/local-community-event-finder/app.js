// Sample event data
const events = [
  {
    id: 1,
    title: "Spring Art Festival",
    date: "2026-03-15",
    location: "Central Park",
    description: "Celebrate local artists with live music, food stalls, and art displays.",
    tags: ["Art", "Music", "Food"]
  },
  {
    id: 2,
    title: "Tech Meetup",
    date: "2026-03-20",
    location: "Innovation Hub",
    description: "Network with tech enthusiasts and attend talks on AI and Web Development.",
    tags: ["Technology", "Networking"]
  },
  {
    id: 3,
    title: "Community Clean-Up",
    date: "2026-03-22",
    location: "Riverside",
    description: "Join hands to clean up the riverside and make a positive impact.",
    tags: ["Environment", "Volunteering"]
  },
  {
    id: 4,
    title: "Book Club Gathering",
    date: "2026-03-25",
    location: "City Library",
    description: "Discuss this month's book and meet fellow book lovers.",
    tags: ["Books", "Discussion"]
  },
  {
    id: 5,
    title: "Food Truck Fiesta",
    date: "2026-03-28",
    location: "Market Square",
    description: "Taste the best local food trucks and enjoy live entertainment.",
    tags: ["Food", "Entertainment"]
  },
  {
    id: 6,
    title: "Yoga in the Park",
    date: "2026-04-01",
    location: "Green Meadows",
    description: "Morning yoga session for all levels. Bring your mat!",
    tags: ["Health", "Fitness"]
  },
  {
    id: 7,
    title: "Coding Bootcamp",
    date: "2026-04-05",
    location: "Tech Center",
    description: "Learn coding basics in a hands-on workshop. Beginners welcome!",
    tags: ["Technology", "Education"]
  },
  {
    id: 8,
    title: "Gardening Workshop",
    date: "2026-04-10",
    location: "Community Garden",
    description: "Tips and tricks for growing your own vegetables and flowers.",
    tags: ["Gardening", "Education"]
  },
  {
    id: 9,
    title: "Movie Night",
    date: "2026-04-15",
    location: "Open Air Theater",
    description: "Watch a classic movie under the stars. Bring snacks!",
    tags: ["Movies", "Entertainment"]
  },
  {
    id: 10,
    title: "Local History Tour",
    date: "2026-04-20",
    location: "Town Hall",
    description: "Guided tour exploring the history of our community.",
    tags: ["History", "Education"]
  }
];

let userProfile = {
  name: "Guest",
  rsvps: []
};

// Navigation
const homeBtn = document.getElementById("homeBtn");
const eventsBtn = document.getElementById("eventsBtn");
const profileBtn = document.getElementById("profileBtn");
const eventListSection = document.getElementById("eventListSection");
const eventDetailSection = document.getElementById("eventDetailSection");
const profileSection = document.getElementById("profileSection");
const eventList = document.getElementById("eventList");
const eventDetail = document.getElementById("eventDetail");
const backToEvents = document.getElementById("backToEvents");
const profileInfo = document.getElementById("profileInfo");
const rsvpList = document.getElementById("rsvpList");

function showSection(section) {
  eventListSection.style.display = section === "events" ? "block" : "none";
  eventDetailSection.style.display = section === "eventDetail" ? "block" : "none";
  profileSection.style.display = section === "profile" ? "block" : "none";
}

homeBtn.addEventListener("click", () => showSection("events"));
eventsBtn.addEventListener("click", () => showSection("events"));
profileBtn.addEventListener("click", () => {
  showSection("profile");
  renderProfile();
});
backToEvents.addEventListener("click", () => showSection("events"));

// Render event cards
function renderEvents() {
  eventList.innerHTML = "";
  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <div class="event-title">${event.title}</div>
      <div class="event-date">${event.date}</div>
      <div class="event-location">${event.location}</div>
      <div class="event-description">${event.description}</div>
      <div class="event-tags">${event.tags.map(tag => `<span>${tag}</span>`).join(" ")}</div>
      <button class="rsvp-btn" data-id="${event.id}">RSVP</button>
    `;
    card.addEventListener("click", e => {
      if (e.target.classList.contains("rsvp-btn")) {
        handleRSVP(event.id);
        e.stopPropagation();
      } else {
        renderEventDetail(event.id);
        showSection("eventDetail");
      }
    });
    eventList.appendChild(card);
  });
}

// Render event detail
function renderEventDetail(eventId) {
  const event = events.find(ev => ev.id === eventId);
  if (!event) return;
  eventDetail.innerHTML = `
    <div class="event-title">${event.title}</div>
    <div class="event-date">${event.date}</div>
    <div class="event-location">${event.location}</div>
    <div class="event-description">${event.description}</div>
    <div class="event-tags">${event.tags.map(tag => `<span>${tag}</span>`).join(" ")}</div>
    <button class="rsvp-btn" data-id="${event.id}">RSVP</button>
  `;
  eventDetail.querySelector(".rsvp-btn").addEventListener("click", () => handleRSVP(event.id));
}

// Handle RSVP
function handleRSVP(eventId) {
  if (!userProfile.rsvps.includes(eventId)) {
    userProfile.rsvps.push(eventId);
    alert("RSVP confirmed!");
    renderProfile();
  } else {
    alert("You have already RSVPed to this event.");
  }
}

// Render profile
function renderProfile() {
  profileInfo.innerHTML = `<strong>Name:</strong> ${userProfile.name}`;
  rsvpList.innerHTML = "";
  userProfile.rsvps.forEach(eventId => {
    const event = events.find(ev => ev.id === eventId);
    if (event) {
      const li = document.createElement("li");
      li.textContent = `${event.title} (${event.date})`;
      rsvpList.appendChild(li);
    }
  });
}

// Initial render
showSection("events");
renderEvents();
