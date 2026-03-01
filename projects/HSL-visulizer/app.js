const defaultColor = "#4a90e2";
const colorPicker = document.querySelector(".color-picker");

const hueCheckbox = document.getElementById("hueValueDefault");
const saturationCheckbox = document.getElementById("saturationValueDefault");
const lightCheckbox = document.getElementById("lightValueDefault");
const alphaCheckbox = document.getElementById("alphaValueDefault");

const fromValueStyle = document.querySelector("[data-from]");
const lightValueStyle = document.querySelector("[data-l]");
const saturationValueStyle = document.querySelector("[data-s]");
const hueValueStyle = document.querySelector("[data-h]");
const alphaValueStyle = document.querySelector("[data-a]");

hueCheckbox.addEventListener("change", function () {
	if (this.checked) {
		document.documentElement.style.setProperty("--hue-value", "h");
		hueValueDisplay.textContent = "h";
		hueValueStyle.innerHTML = "h";
		hueValueStyle.classList.add("highlight");
		setTimeout(() => {
			hueValueStyle.classList.remove("highlight");
		}, 1000);
		hueValueRange.setAttribute("disabled", "");
	} else {
		document.documentElement.style.setProperty("--hue-value", "180");
		hueValueDisplay.textContent = "180";
		hueValueStyle.innerHTML = "180";
		hueValueStyle.classList.add("highlight");
		setTimeout(() => {
			hueValueStyle.classList.remove("highlight");
		}, 1000);
		hueValueRange.removeAttribute("disabled", "");
		hueValueRange.setAttribute("value", "180");
	}
});

saturationCheckbox.addEventListener("change", function () {
	if (this.checked) {
		document.documentElement.style.setProperty("--saturation-value", "s");
		saturationValueDisplay.textContent = "s";
		saturationValueStyle.innerHTML = "s";
		saturationValueStyle.classList.add("highlight");
		setTimeout(() => {
			saturationValueStyle.classList.remove("highlight");
		}, 1000);
		saturationValueRange.setAttribute("disabled", "");
		//saturationValueRange.setAttribute("value", "");
	} else {
		document.documentElement.style.setProperty("--saturation-value", "50");
		saturationValueDisplay.textContent = "50";
		saturationValueStyle.innerHTML = "50";
		saturationValueStyle.classList.add("highlight");
		setTimeout(() => {
			saturationValueStyle.classList.remove("highlight");
		}, 1000);
		saturationValueRange.removeAttribute("disabled", "");
		saturationValueRange.setAttribute("value", "50");
	}
});

lightCheckbox.addEventListener("change", function () {
	if (this.checked) {
		document.documentElement.style.setProperty("--light-value", "l");
		lightValueDisplay.textContent = "l";
		lightValueStyle.innerHTML = "l";
		lightValueStyle.classList.add("highlight");
		setTimeout(() => {
			lightValueStyle.classList.remove("highlight");
		}, 1000);
		lightValueRange.setAttribute("disabled", "");
		//lightValueRange.setAttribute("value", "");
	} else {
		document.documentElement.style.setProperty("--light-value", "50");
		lightValueDisplay.textContent = "50";
		lightValueStyle.innerHTML = "50";
		lightValueStyle.classList.add("highlight");
		setTimeout(() => {
			lightValueStyle.classList.remove("highlight");
		}, 1000);
		lightValueRange.removeAttribute("disabled", "");
		lightValueRange.setAttribute("value", "50");
	}
});

alphaCheckbox.addEventListener("change", function () {
	if (this.checked) {
		document.documentElement.style.setProperty("--alpha-value", "1");
		alphaValueDisplay.textContent = "1";
		alphaValueStyle.innerHTML = "1";
		alphaValueRange.setAttribute("disabled", "");
		alphaValueStyle.innerHTML = alphaValueDecimal;
		alphaValueStyle.classList.add("highlight");
		setTimeout(() => {
			alphaValueStyle.classList.remove("highlight");
		}, 1000);
	} else {
		document.documentElement.style.setProperty("--alpha-value", "1");
		alphaValueDisplay.textContent = "1";
		alphaValueStyle.innerHTML = "1";
		alphaValueRange.removeAttribute("disabled", "");
		alphaValueStyle.innerHTML = alphaValueDecimal;
		alphaValueStyle.classList.add("highlight");
		setTimeout(() => {
			alphaValueStyle.classList.remove("highlight");
		}, 1000);
	}
});

colorPicker.value = defaultColor;
colorPicker.addEventListener("input", updateFirst);
colorPicker.addEventListener("change", updateAll);
colorPicker.select();

function updateFirst(event) {
	document.documentElement.style.setProperty(
		"--primary-color",
		event.target.value
	);
	//fromValueDisplay.textContent = event.target.value;
	fromValueStyle.innerHTML = event.target.value;
	fromValueStyle.classList.add("highlight");
	setTimeout(() => {
		fromValueStyle.classList.remove("highlight");
	}, 1000);
}

function updateAll(event) {
	document.documentElement.style.setProperty(
		"--primary-color",
		event.target.value
	);
	fromValueStyle.innerHTML = event.target.value;
	fromValueStyle.classList.add("highlight");
	setTimeout(() => {
		fromValueStyle.classList.remove("highlight");
	}, 1000);
}

const lightValueRangeSlider = document.querySelector(
	"[data-light-value-range-slider]"
);
const lightValueDisplay = document.getElementById("lightValue");

const saturationValueRangeSlider = document.querySelector(
	"[data-saturation-value-range-slider]"
);
const saturationValueDisplay = document.getElementById("saturationValue");

const hueValueRangeSlider = document.querySelector(
	"[data-hue-value-range-slider]"
);
const hueValueDisplay = document.getElementById("hueValue");

const alphaValueRangeSlider = document.querySelector(
	"[data-alpha-value-range-slider]"
);
const alphaValueDisplay = document.getElementById("alphaValue");

lightValueRangeSlider.addEventListener("input", () => {
	const lightValue = lightValueRangeSlider.value;
	document.documentElement.style.setProperty("--light-value", lightValue + "%");
	lightValueDisplay.textContent = lightValue + "%";
	lightValueStyle.innerHTML = lightValue + "%";
	lightValueStyle.classList.add("highlight");
	setTimeout(() => {
		lightValueStyle.classList.remove("highlight");
	}, 1000);
});

saturationValueRangeSlider.addEventListener("input", () => {
	const saturationValue = saturationValueRangeSlider.value;
	document.documentElement.style.setProperty(
		"--saturation-value",
		saturationValue + "%"
	);
	saturationValueDisplay.textContent = saturationValue + "%";
	saturationValueStyle.innerHTML = saturationValue + "%";
	saturationValueStyle.classList.add("highlight");
	setTimeout(() => {
		saturationValueStyle.classList.remove("highlight");
	}, 1000);
});

hueValueRangeSlider.addEventListener("input", () => {
	const hueValue = hueValueRangeSlider.value;
	document.documentElement.style.setProperty("--hue-value", hueValue);
	hueValueDisplay.textContent = hueValue;
	hueValueStyle.innerHTML = hueValue;
	hueValueStyle.classList.add("highlight");
	setTimeout(() => {
		hueValueStyle.classList.remove("highlight");
	}, 1000);
});

alphaValueRangeSlider.addEventListener("input", () => {
	const alphaValue = alphaValueRangeSlider.value;
	const convertToDecimal = alphaValue / 100;
	const alphaValueDecimal = convertToDecimal.toFixed(1); // 3.5 (number)
	document.documentElement.style.setProperty("--alpha-value", alphaValueDecimal);
	alphaValueDisplay.textContent = alphaValueDecimal;
	alphaValueStyle.innerHTML = alphaValueDecimal;
	alphaValueStyle.classList.add("highlight");
	setTimeout(() => {
		alphaValueStyle.classList.remove("highlight");
	}, 1000);
});

function percentageToDecimal(percent) {
	return percent / 100;
}
