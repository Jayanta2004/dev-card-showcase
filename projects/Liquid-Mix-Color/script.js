// --- ELEMENTS ---
const picker1 = document.getElementById("picker1");
const picker2 = document.getElementById("picker2");
const slider = document.getElementById("mixSlider");
const mixText = document.getElementById("mixText");
const sliderFill = document.getElementById("sliderFill");
const root = document.documentElement;
const card = document.getElementById("tiltCard");

// Blobs
const blob1 = document.querySelector(".blob-1");
const blob2 = document.querySelector(".blob-2");
const blob3 = document.querySelector(".blob-3");

// Droplets
const drop1 = document.getElementById("drop1");
const drop2 = document.getElementById("drop2");

// Hex displays
const hex1 = document.getElementById("hex1");
const hex2 = document.getElementById("hex2");
const hexResult = document.getElementById("hexResult");

// --- 3D TILT EFFECT ---
card.addEventListener("mousemove", (e) => {
	const rect = card.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	const centerX = rect.width / 2;
	const centerY = rect.height / 2;

	const rotateX = (y - centerY) / 20;
	const rotateY = (centerX - x) / 20;

	card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

card.addEventListener("mouseleave", () => {
	card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
});

// --- COLOR MIXING LOGIC ---
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
		  }
		: null;
}

function rgbToHex(r, g, b) {
	return (
		"#" +
		((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
	);
}

function mixColors(color1, color2, percentage) {
	const c1 = hexToRgb(color1);
	const c2 = hexToRgb(color2);
	const p = percentage / 100;

	const r = Math.round(c1.r + (c2.r - c1.r) * p);
	const g = Math.round(c1.g + (c2.g - c1.g) * p);
	const b = Math.round(c1.b + (c2.b - c1.b) * p);

	return rgbToHex(r, g, b);
}

// --- UPDATE FUNCTION ---
function updateColors() {
	const percent = parseInt(slider.value);
	const color1 = picker1.value;
	const color2 = picker2.value;

	// Update CSS variables
	root.style.setProperty("--color1", color1);
	root.style.setProperty("--color2", color2);
	root.style.setProperty("--percent", percent + "%");

	// Update blobs
	blob1.style.background = color1;
	blob2.style.background = color2;
	blob3.style.background = mixColors(color1, color2, percent);

	// Update droplets
	drop1.style.background = color1;
	drop1.style.boxShadow = `0 10px 30px ${color1}, inset 2px 2px 8px rgba(255,255,255,0.4), inset -2px -2px 8px rgba(0,0,0,0.3)`;

	drop2.style.background = color2;
	drop2.style.boxShadow = `0 10px 30px ${color2}, inset 2px 2px 8px rgba(255,255,255,0.4), inset -2px -2px 8px rgba(0,0,0,0.3)`;

	// Update text
	mixText.textContent = `${percent}%`;

	// Update slider fill
	sliderFill.style.width = percent + "%";

	// Update hex displays
	hex1.textContent = color1.toUpperCase();
	hex2.textContent = color2.toUpperCase();
	hexResult.textContent = mixColors(color1, color2, percent);
}

// --- COPY TO CLIPBOARD ---
function copyToClipboard(element) {
	const text = element.textContent;
	navigator.clipboard.writeText(text).then(() => {
		element.classList.add("copied");
		setTimeout(() => element.classList.remove("copied"), 2000);
	});
}

hex1.addEventListener("click", () => copyToClipboard(hex1));
hex2.addEventListener("click", () => copyToClipboard(hex2));
hexResult.addEventListener("click", () => copyToClipboard(hexResult));

// --- EVENT LISTENERS ---
picker1.addEventListener("input", updateColors);
picker2.addEventListener("input", updateColors);
slider.addEventListener("input", updateColors);

// Click droplets to trigger color picker
drop1.addEventListener("click", () => picker1.click());
drop2.addEventListener("click", () => picker2.click());

// --- INIT ---
updateColors();

// --- SMOOTH ENTRANCE ANIMATION ---
window.addEventListener("load", () => {
	card.style.opacity = "0";
	card.style.transform = "translateY(50px)";

	setTimeout(() => {
		card.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
		card.style.opacity = "1";
		card.style.transform = "translateY(0)";
	}, 100);
});
