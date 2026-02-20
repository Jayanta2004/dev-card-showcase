function countText() 
{
  const text = document.getElementById("textInput").value;

  const characters = text.length;
  const charactersNoSpace = text.replace(/\s/g, "").length;
  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  document.getElementById("words").innerText = words;
  document.getElementById("characters").innerText = characters;
  document.getElementById("charactersNoSpace").innerText = charactersNoSpace;
}

function clearText() 
{
  document.getElementById("textInput").value = "";
  countText();
}
