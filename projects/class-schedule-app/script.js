const subjectInput = document.getElementById("subject");
const timeInput = document.getElementById("time");
const dayInput = document.getElementById("day");
const scheduleList = document.getElementById("scheduleList");

let classes = JSON.parse(localStorage.getItem("classes")) || [];

function addClass() {
  const subject = subjectInput.value.trim();
  const time = timeInput.value;
  const day = dayInput.value;

  if (subject === "" || time === "" || day === "") {
    alert("Please fill all fields");
    return;
  }

  const newClass = { subject, time, day };
  classes.push(newClass);
  localStorage.setItem("classes", JSON.stringify(classes));

  displayClasses();
  clearInputs();
}

function displayClasses() {
  scheduleList.innerHTML = "";

  classes.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "class-item";

    div.innerHTML = `
      <div class="class-info">
        <strong>${item.subject}</strong><br>
        ${item.day} at ${item.time}
      </div>
      <button class="delete-btn" onclick="deleteClass(${index})">Delete</button>
    `;

    scheduleList.appendChild(div);
  });
}

function deleteClass(index) {
  classes.splice(index, 1);
  localStorage.setItem("classes", JSON.stringify(classes));
  displayClasses();
}

function clearInputs() {
  subjectInput.value = "";
  timeInput.value = "";
  dayInput.value = "";
}

// Load saved classes
displayClasses();
