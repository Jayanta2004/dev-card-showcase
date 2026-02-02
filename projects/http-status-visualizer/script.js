function check() {
  const code = document.getElementById("code").value;
  let msg = "Unknown status";

  if (code == 200) msg = "✅ OK – Request successful";
  else if (code == 404) msg = "❌ Not Found";
  else if (code == 500) msg = "⚠️ Server Error";

  document.getElementById("result").innerText = msg;
}