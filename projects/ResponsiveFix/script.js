// Detect screen size (optional enhancement)
function checkScreen() {
  if (window.innerWidth < 768) {
    console.log("Mobile View");
  } else {
    console.log("Desktop View");
  }
}

window.addEventListener("resize", checkScreen);
checkScreen();