function check() {
  const responses = [
    "Yes 😵‍💫 You are overthinking. Take a deep breath 🌬️",
    "No 😊 You're doing just fine. Stay calm 🌿"
  ];

  const random = Math.floor(Math.random() * responses.length);
  document.getElementById("result").innerText = responses[random];
}