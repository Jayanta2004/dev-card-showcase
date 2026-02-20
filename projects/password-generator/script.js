function generatePassword() {
  const length = document.getElementById("length").value;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";

  if (length < 4) {
    document.getElementById("result").textContent = "Enter length between 4 and 20";
    return;
  }

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  document.getElementById("result").textContent = password;
}