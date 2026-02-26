const input = document.getElementById("textInput");
const mainText = document.getElementById("mainText");
const reflectionText = document.getElementById("reflectionText");

input.addEventListener("input", () => {
  const value = input.value.trim();

  if (value === "") {
    mainText.textContent = "Mirror Text World";
    reflectionText.textContent = "Mirror Text World";
  } else {
    mainText.textContent = value;
    reflectionText.textContent = value;
  }
});