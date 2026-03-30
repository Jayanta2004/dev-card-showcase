// --- Diagnostics Placeholder ---
if (diagnosticForm) {
	diagnosticForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const fileInput = document.getElementById('plant-photo');
		if (!fileInput.files || fileInput.files.length === 0) {
			diagnosticResult.innerHTML = '<em>Please upload a plant photo for analysis.</em>';
			return;
		}
		const file = fileInput.files[0];
		// Show image preview
		const reader = new FileReader();
		reader.onload = function(ev) {
			diagnosticResult.innerHTML = `<img src="${ev.target.result}" alt="Plant photo" style="max-width:180px;max-height:120px;display:block;margin-bottom:10px;border-radius:8px;" />` +
				'<em>Analyzing photo with AI...</em>';
			setTimeout(() => {
				diagnosticResult.innerHTML = `<img src="${ev.target.result}" alt="Plant photo" style="max-width:180px;max-height:120px;display:block;margin-bottom:10px;border-radius:8px;" />` +
					'<b>AI Diagnostic Result:</b> Your plant looks healthy! (This is a placeholder. Real AI integration needed.)';
			}, 2000);
		};
		reader.readAsDataURL(file);
	});
}
// Entry point for Virtual Plant Caretaker
// App logic for plant logging, reminders, and diagnostics

// --- Data Model ---
let plants = JSON.parse(localStorage.getItem('plants') || '[]');

// --- UI Elements ---
const plantForm = document.getElementById('plant-form');
const plantsContent = document.getElementById('plants-content');
const remindersContent = document.getElementById('reminders-content');
const diagnosticForm = document.getElementById('diagnostic-form');
const diagnosticResult = document.getElementById('diagnostic-result');

// --- Utility Functions ---
function savePlants() {
	localStorage.setItem('plants', JSON.stringify(plants));
}

function addPlant(name, species, added) {
	plants.push({ name, species, added, lastWatered: null, lastFertilized: null });
	savePlants();
	updatePlants();
	updateReminders();
}

// --- UI Update Functions ---
function updatePlants() {
	if (plants.length === 0) {
		plantsContent.innerHTML = '<em>No plants logged yet.</em>';
		return;
	}
	let html = '';
	plants.forEach((p, idx) => {
		html += `<div class="plant-card">
			<h3>${p.name}</h3>
			<div><small>${p.species ? p.species : 'Unknown species'}</small></div>
			<div>Added: ${p.added}</div>
			<div>Last watered: ${p.lastWatered ? p.lastWatered : 'Never'}</div>
			<div>Last fertilized: ${p.lastFertilized ? p.lastFertilized : 'Never'}</div>
			<button class="water-btn" data-idx="${idx}">Water</button>
			<button class="fertilize-btn" data-idx="${idx}">Fertilize</button>
			<button class="delete-btn" data-idx="${idx}">Delete</button>
		</div>`;
	});
	plantsContent.innerHTML = html;
	// Attach event listeners
	document.querySelectorAll('.water-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			plants[idx].lastWatered = new Date().toISOString().slice(0,10);
			savePlants();
			updatePlants();
			updateReminders();
		});
	});
	document.querySelectorAll('.fertilize-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			plants[idx].lastFertilized = new Date().toISOString().slice(0,10);
			savePlants();
			updatePlants();
			updateReminders();
		});
	});
	document.querySelectorAll('.delete-btn').forEach(btn => {
		btn.addEventListener('click', function() {
			const idx = parseInt(this.getAttribute('data-idx'));
			plants.splice(idx, 1);
			savePlants();
			updatePlants();
			updateReminders();
		});
	});
}

function updateReminders() {
	if (plants.length === 0) {
		remindersContent.innerHTML = '<em>No plants to remind you about yet.</em>';
		return;
	}
	let html = '<ul>';
	const today = new Date().toISOString().slice(0,10);
	plants.forEach(p => {
		// Watering reminder: every 7 days
		let waterMsg = '';
		if (!p.lastWatered) {
			waterMsg = 'Needs watering!';
		} else {
			const days = Math.floor((new Date(today) - new Date(p.lastWatered))/(1000*60*60*24));
			if (days >= 7) waterMsg = `Needs watering! (${days} days since last)`;
			else waterMsg = `Water in ${7-days} days`;
		}
		// Fertilizing reminder: every 30 days
		let fertMsg = '';
		if (!p.lastFertilized) {
			fertMsg = 'Needs fertilizing!';
		} else {
			const days = Math.floor((new Date(today) - new Date(p.lastFertilized))/(1000*60*60*24));
			if (days >= 30) fertMsg = `Needs fertilizing! (${days} days since last)`;
			else fertMsg = `Fertilize in ${30-days} days`;
		}
		html += `<li><b>${p.name}</b>: ${waterMsg} | ${fertMsg}</li>`;
	});
	html += '</ul>';
	remindersContent.innerHTML = html;
}

// --- Event Listeners ---
if (plantForm) {
	plantForm.addEventListener('submit', function(e) {
		e.preventDefault();
		const name = document.getElementById('plant-name').value.trim();
		const species = document.getElementById('plant-species').value.trim();
		const added = document.getElementById('plant-added').value;
		if (!name || !added) {
			alert('Please enter plant name and date added.');
			return;
		}
		addPlant(name, species, added);
		plantForm.reset();
	});
}

// --- Initial Render ---
updatePlants();
updateReminders();
