// Online Learning Accountability Hub
// Track courses, set check-ins, and get peer/mentor support

const app = document.getElementById('app');

let courses = [];
let checkins = [];
let peers = ['Peer1', 'Peer2', 'Peer3'];
let mentors = ['Mentor1', 'Mentor2'];

function render() {
  app.innerHTML = `
    <div class="section">
      <button onclick="showAddCourse()">Add Course</button>
      <button onclick="showProgress()">Track Progress</button>
      <button onclick="showCheckins()">Check-Ins</button>
      <button onclick="showPeers()">Peer/Mentor Support</button>
    </div>
    <div id="main"></div>
  `;
}

window.showAddCourse = function() {
  document.getElementById('main').innerHTML = `
    <h2>Add a Course</h2>
    <form onsubmit="addCourse(event)">
      <input id="courseName" placeholder="Course Name" required />
      <input id="platform" placeholder="Platform (Coursera, Udemy, etc.)" required />
      <input id="goal" placeholder="Goal (e.g. finish by March)" required />
      <button type="submit">Add</button>
    </form>
    <div class="section">
      <h3>My Courses</h3>
      <ul>${courses.map((c,i)=>`<li>${c.name} (${c.platform}) - Goal: ${c.goal} <button onclick="removeCourse(${i})">❌</button></li>`).join('')}</ul>
    </div>
  `;
};

window.addCourse = function(e) {
  e.preventDefault();
  const name = document.getElementById('courseName').value;
  const platform = document.getElementById('platform').value;
  const goal = document.getElementById('goal').value;
  courses.push({name, platform, goal, progress: 0});
  showAddCourse();
};
window.removeCourse = function(i) {
  courses.splice(i,1);
  showAddCourse();
};

window.showProgress = function() {
  document.getElementById('main').innerHTML = `
    <h2>Track Progress</h2>
    <ul>${courses.map((c,i)=>`<li>${c.name} (${c.platform})<br>Goal: ${c.goal}<br>Progress: <input type='range' min='0' max='100' value='${c.progress}' onchange='updateProgress(${i},this.value)'/> ${c.progress}%</li>`).join('')}</ul>
    <button onclick="render()">Back</button>
  `;
};
window.updateProgress = function(i,val) {
  courses[i].progress = val;
  showProgress();
};

window.showCheckins = function() {
  document.getElementById('main').innerHTML = `
    <h2>Check-Ins</h2>
    <form onsubmit="addCheckin(event)">
      <input id="checkinCourse" placeholder="Course Name" required />
      <input id="date" type="date" required value="${today()}" />
      <textarea id="reflection" placeholder="What did you learn or struggle with?" required></textarea>
      <button type="submit">Add Check-In</button>
    </form>
    <div class="section">
      <h3>My Check-Ins</h3>
      <ul>${checkins.slice(-5).reverse().map(renderCheckin).join('')}</ul>
    </div>
    <button onclick="render()">Back</button>
  `;
};
function renderCheckin(c) {
  return `<li class='checkin'><strong>${c.course}</strong> on ${c.date}<br>${c.reflection}</li>`;
}
window.addCheckin = function(e) {
  e.preventDefault();
  const course = document.getElementById('checkinCourse').value;
  const date = document.getElementById('date').value;
  const reflection = document.getElementById('reflection').value;
  checkins.push({course, date, reflection});
  showCheckins();
};

window.showPeers = function() {
  document.getElementById('main').innerHTML = `
    <h2>Peer & Mentor Support</h2>
    <div class='section'>
      <h3>Peers</h3>
      <ul>${peers.map(p=>`<li>${p} <button onclick="message('peer','${p}')">Message</button></li>`).join('')}</ul>
    </div>
    <div class='section'>
      <h3>Mentors</h3>
      <ul>${mentors.map(m=>`<li>${m} <button onclick="message('mentor','${m}')">Message</button></li>`).join('')}</ul>
    </div>
    <button onclick="render()">Back</button>
  `;
};
window.message = function(type, name) {
  alert(`(Demo) Message sent to ${type}: ${name}`);
};

function today() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

render();
