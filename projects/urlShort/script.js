const resultDiv = document.getElementById("result");

function shortenURL() {
  const longUrl = document.getElementById("longUrl").value;

  if (longUrl === "") {
    resultDiv.innerHTML = "⚠️ Please enter a URL";
    return;
  }

  resultDiv.innerHTML = "⏳ Shortening...";

  fetch(`https://api.shrtco.de/v2/shorten?url=${longUrl}`)
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        const shortUrl = data.result.full_short_link;
        resultDiv.innerHTML = `
          ✅ Short URL:<br>
          <a href="${shortUrl}" target="_blank">${shortUrl}</a>
          <br>
          <button class="copy-btn" onclick="copyURL('${shortUrl}')">Copy</button>
        `;
      } else {
        resultDiv.innerHTML = "❌ Invalid URL";
      }
    })
    .catch(() => {
      resultDiv.innerHTML = "⚠️ Error connecting to API";
    });
}

function copyURL(url) {
  navigator.clipboard.writeText(url);
  alert("Copied to clipboard!");
}
