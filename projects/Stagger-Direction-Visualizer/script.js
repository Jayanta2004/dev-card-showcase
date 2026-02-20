const split = new SplitType("h1", {
  types: "chars"
});

let tween = gsap.from(split.chars, {
  yPercent: 100,
  stagger: 0.05
});




const code = document.getElementById('code')
const radios = document.querySelectorAll('input[name="position"]');

function handleRadioChange(event) {
	console.log("Selected value:", event.target.value)
	code.classList.remove('prettyprinted');
	code.innerHTML = `gsap.from(split.chars, {
  yPercent:100,
  stagger: {
    each:0.05,
    from:"${event.target.value}"
  }
})`
	PR.prettyPrint()
	tween.kill()
	tween = gsap.fromTo(split.chars, {yPercent:100}, 
	{
		yPercent: 0,
		stagger: {
			each:0.05,
			from:event.target.value
		}
})
}

radios.forEach(radio => {
   radio.addEventListener('click', handleRadioChange);
});