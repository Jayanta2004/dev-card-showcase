// Create Project with Image Upload
const form = document.getElementById('create-project-form');
const imageInput = document.getElementById('project-image');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');

imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.src = '';
        imagePreviewContainer.style.display = 'none';
    }
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('project-name').value.trim();
    const location = document.getElementById('location').value.trim();
    const description = document.getElementById('description').value.trim();
    const progress = parseInt(document.getElementById('progress').value, 10);
    let imageData = '';
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            saveProject({ name, location, description, progress, imageData });
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        saveProject({ name, location, description, progress, imageData });
    }
});

function saveProject(project) {
    const projects = JSON.parse(localStorage.getItem('communityProjects') || '[]');
    projects.push(project);
    localStorage.setItem('communityProjects', JSON.stringify(projects));
    alert('Project created successfully!');
    window.location.href = '../filter-search.html';
}
