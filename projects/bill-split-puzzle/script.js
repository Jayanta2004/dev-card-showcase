const peopleDiv = document.getElementById("people");
const resultDiv = document.getElementById("result");

function addPerson() {
  const div = document.createElement("div");
  div.className = "person";
  div.innerHTML = `
    <input type="text" placeholder="Name">
    <input type="number" placeholder="Paid ₹">
  `;
  peopleDiv.appendChild(div);
}

addPerson();
addPerson();

function calculateSplit() {
  const totalBill = Number(document.getElementById("totalBill").value);
  const people = document.querySelectorAll(".person");

  if (!totalBill || people.length === 0) {
    resultDiv.innerHTML = "<p>Please enter valid details.</p>";
    return;
  }

  let totalPaid = 0;
  let data = [];

  people.forEach(p => {
    const name = p.children[0].value || "Someone";
    const paid = Number(p.children[1].value) || 0;
    totalPaid += paid;
    data.push({ name, paid });
  });

  const fairShare = totalBill / data.length;
  resultDiv.innerHTML = `<strong>Each person should pay: ₹${fairShare.toFixed(2)}</strong><br><br>`;

  data.forEach(person => {
    const diff = person.paid - fairShare;
    if (diff > 0) {
      resultDiv.innerHTML += `<p>✅ ${person.name} should receive ₹${diff.toFixed(2)}</p>`;
    } else if (diff < 0) {
      resultDiv.innerHTML += `<p>❌ ${person.name} owes ₹${Math.abs(diff).toFixed(2)}</p>`;
    } else {
      resultDiv.innerHTML += `<p>👌 ${person.name} is settled</p>`;
    }
  });

  if (totalPaid !== totalBill) {
    resultDiv.innerHTML += `<br><em>⚠ Total paid (₹${totalPaid}) does not match total bill.</em>`;
  }
}
