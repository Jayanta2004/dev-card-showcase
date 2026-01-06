document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");
  
    cards.forEach((card) => {
      // Add transition for smooth reset
      card.style.transition = "transform 0.1s ease";

      const cardInner = card.querySelector('.card-inner'); // If exists
      const title = card.querySelector('h2');
      const img = card.querySelector('img');
      const role = card.querySelector('.role');
      const desc = card.querySelector('p');
      const btn = card.querySelector('.card-btn');

      // Add depth to elements (Parallax)
      if(title) title.style.transform = "translateZ(50px)";
      if(img) img.style.transform = "translateZ(30px)";
      if(role) role.style.transform = "translateZ(40px)";
      if(desc) desc.style.transform = "translateZ(20px)";
      if(btn) btn.style.transform = "translateZ(60px)";
      if(cardInner) cardInner.style.transformStyle = "preserve-3d";

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
  
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
  
        const mouseX = (x - centerX) / centerX;
        const mouseY = (y - centerY) / centerY;
  
        const maxRotate = 15; // Increased rotation for more drama
  
        const rotateX = -mouseY * maxRotate; 
        const rotateY = mouseX * maxRotate;
  
        // Apply rotation to card
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        
        // Glare logic
        let glare = card.querySelector('.card-glare');
        if(!glare) {
            glare = document.createElement('div');
            glare.classList.add('card-glare');
            card.appendChild(glare);
        }
        
        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`;
        glare.style.opacity = '1';
        
        // Element Parallax (Dynamic shifting based on mouse)
        // We can slightly shift elements X/Y opposite to movement for floating effect
        if(title) title.style.transform = `translateZ(50px) translateX(${mouseX * -10}px) translateY(${mouseY * -10}px)`;
        if(img) img.style.transform = `translateZ(30px) translateX(${mouseX * -5}px) translateY(${mouseY * -5}px)`;

      });
  
      card.addEventListener("mouseleave", () => {
        // Reset card
        card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
        
        // Reset glare
        const glare = card.querySelector('.card-glare');
        if(glare) {
            glare.style.opacity = '0';
        }

        // Reset elements
        if(title) title.style.transform = "translateZ(50px)"; // Keep Z depth
        if(img) img.style.transform = "translateZ(30px)";
        // ... other resets if needed
      });
    });
  });


document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('imagePreview');
    const dropZoneContent = document.getElementById('dropZoneContent');
    const removeBtn = document.getElementById('removeBtn');
    const replaceBtn = document.getElementById('replaceBtn');
    const errorMsg = document.getElementById('errorMsg');

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    // Trigger file input
    dropZone.addEventListener('click', (e) => {
        if (e.target !== removeBtn && !removeBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    // Handle File Selection
    fileInput.addEventListener('change', function() {
        handleFiles(this.files[0]);
    });

    // Drag and Drop Logic
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        handleFiles(dt.files[0]);
    });

    function handleFiles(file) {
        if (!file) return;

        errorMsg.textContent = ""; // Clear errors

        // Validation
        if (!ALLOWED_TYPES.includes(file.type)) {
            showError("Invalid file type. Please upload JPG, PNG, or WEBP.");
            return;
        }

        if (file.size > MAX_SIZE) {
            showError("File is too large. Max size is 2MB.");
            return;
        }

        // Preview Logic
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            previewImage.src = reader.result;
            showPreview(true);
        };
    }

    function showPreview(hasImage) {
        if (hasImage) {
            dropZoneContent.style.opacity = "0";
            setTimeout(() => {
                dropZoneContent.style.display = "none";
                previewContainer.style.display = "block";
                setTimeout(() => previewContainer.classList.add('show'), 10);
            }, 300);
            removeBtn.disabled = false;
        } else {
            previewContainer.classList.remove('show');
            setTimeout(() => {
                previewContainer.style.display = "none";
                dropZoneContent.style.display = "block";
                setTimeout(() => dropZoneContent.style.opacity = "1", 10);
                previewImage.src = "";
            }, 300);
            removeBtn.disabled = true;
            fileInput.value = "";
        }
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        // Animation for error
        errorMsg.style.animation = "shake 0.5s ease";
        setTimeout(() => errorMsg.style.animation = "", 500);
    }

    removeBtn.addEventListener('click', () => showPreview(false));
    replaceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
});
