// Local Plant Identifier & Care Guide (Demo: Mocked Plant ID)
// Author: EWOC Contributors
// Description: Snap a photo of a plant, get its name, and receive tailored care instructions.

const form = document.getElementById('plantForm');
const resultDiv = document.getElementById('result');
const careGuideDiv = document.getElementById('careGuide');

const PLANTS = [
    {
        name: 'Monstera Deliciosa',
        keywords: ['split', 'leaf', 'monstera', 'hole'],
        care: 'Bright, indirect light. Water when top inch of soil is dry. Loves humidity. Fertilize monthly in growing season.'
    },
    {
        name: 'Snake Plant',
        keywords: ['snake', 'sansevieria', 'upright', 'striped'],
        care: 'Low to bright light. Allow soil to dry between waterings. Tolerates neglect. Avoid overwatering.'
    },
    {
        name: 'Spider Plant',
        keywords: ['spider', 'arch', 'baby', 'chlorophytum'],
        care: 'Bright, indirect light. Water moderately. Trim brown tips. Produces baby plants easily.'
    },
    {
        name: 'Aloe Vera',
        keywords: ['aloe', 'succulent', 'gel', 'spiky'],
        care: 'Bright light. Water deeply but infrequently. Use well-draining soil. Avoid cold drafts.'
    },
    {
        name: 'Peace Lily',
        keywords: ['peace', 'lily', 'white', 'spathiphyllum'],
        care: 'Low to medium light. Keep soil moist but not soggy. Mist leaves for humidity. Remove spent blooms.'
    }
];

function mockIdentifyPlant(file) {
    // Demo: Use filename keywords to "identify" plant
    const name = file.name.toLowerCase();
    for (const plant of PLANTS) {
        if (plant.keywords.some(k => name.includes(k))) {
            return plant;
        }
    }
    // Default fallback
    return {
        name: 'Unknown Plant',
        care: 'Care instructions unavailable. Try a clearer photo or different angle.'
    };
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = form.plantPhoto;
    if (!fileInput.files.length) return;
    const file = fileInput.files[0];
    const plant = mockIdentifyPlant(file);
    resultDiv.textContent = `Identified: ${plant.name}`;
    resultDiv.classList.remove('hidden');
    careGuideDiv.innerHTML = `<b>Care Guide:</b><br>${plant.care}`;
    careGuideDiv.classList.remove('hidden');
});
