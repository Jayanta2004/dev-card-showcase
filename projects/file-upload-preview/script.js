
        // DOM elements
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        const fileDetails = document.getElementById('fileDetails');
        const replaceBtn = document.getElementById('replaceBtn');
        const removeBtn = document.getElementById('removeBtn');
        const validationContainer = document.querySelector('.validation-container');

        // Allowed file types and max size (2MB)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes

        // Current file state
        let currentFile = null;

        // Event Listeners
        browseBtn.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag & drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        // File input change event
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });

        // Replace button event
        replaceBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Remove button event
        removeBtn.addEventListener('click', () => {
            resetUploader();
        });

        // Handle selected/dropped file
        function handleFile(file) {
            currentFile = file;

            // Validate file
            const validation = validateFile(file);

            if (validation.isValid) {
                // Show preview
                showPreview(file);
                // Show success message
                showValidationMessage('Image selected successfully and ready for upload!', 'success');
                // Enable remove button
                removeBtn.disabled = false;
            } else {
                // Show error message
                showValidationMessage(validation.message, validation.type);
                // Reset file input
                fileInput.value = '';
                currentFile = null;
            }
        }

        // Validate file type and size
        function validateFile(file) {
            // Check file type
            if (!allowedTypes.includes(file.type)) {
                return {
                    isValid: false,
                    type: 'error',
                    message: `Invalid file type. Please select a JPG, PNG, or WEBP image.`
                };
            }

            // Check file size
            if (file.size > maxSize) {
                return {
                    isValid: false,
                    type: 'warning',
                    message: `File is too large (${(file.size / (1024*1024)).toFixed(2)} MB). Maximum size is 2MB.`
                };
            }

            return {
                isValid: true,
                type: 'success',
                message: 'File is valid.'
            };
        }

        // Show image preview
        function showPreview(file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewContainer.classList.add('active');

                // Update file details
                updateFileDetails(file);
            };

            reader.readAsDataURL(file);
        }

        // Update file details panel
        function updateFileDetails(file) {
            const fileSize = file.size < 1024 * 1024 
                ? `${(file.size / 1024).toFixed(2)} KB` 
                : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

            const fileName = file.name.length > 25 
                ? file.name.substring(0, 22) + '...' 
                : file.name;

            const fileType = file.type.split('/')[1].toUpperCase();

            // Create file details HTML
            fileDetails.innerHTML = `
                <div class="file-detail">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${fileName}</span>
                </div>
                <div class="file-detail">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">${fileType}</span>
                </div>
                <div class="file-detail">
                    <span class="detail-label">Size:</span>
                    <span class="detail-value">${fileSize}</span>
                </div>
                <div class="file-detail">
                    <span class="detail-label">Last Modified:</span>
                    <span class="detail-value">${new Date(file.lastModified).toLocaleDateString()}</span>
                </div>
            `;
        }

        // Show validation message
        function showValidationMessage(message, type) {
            // Remove any existing message
            const existingMessage = validationContainer.querySelector('.validation-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Create new message element
            const messageEl = document.createElement('div');
            messageEl.className = `validation-message ${type} active`;

            // Set icon based on message type
            let icon = 'info-circle';
            if (type === 'success') icon = 'check-circle';
            if (type === 'error') icon = 'exclamation-circle';
            if (type === 'warning') icon = 'exclamation-triangle';

            messageEl.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            `;

            validationContainer.appendChild(messageEl);

            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.classList.remove('active');
                        setTimeout(() => {
                            if (messageEl.parentNode) {
                                messageEl.remove();
                            }
                        }, 300);
                    }
                }, 5000);
            }
        }

        // Reset uploader to initial state
        function resetUploader() {
            // Reset file input
            fileInput.value = '';
            currentFile = null;

            // Hide preview
            previewContainer.classList.remove('active');

            // Clear preview image
            previewImage.src = '';

            // Clear file details
            fileDetails.innerHTML = '';

            // Disable remove button
            removeBtn.disabled = true;

            // Clear validation messages
            const existingMessage = validationContainer.querySelector('.validation-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Show reset message
            showValidationMessage('Image removed. You can select a new image.', 'success');
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Show initial instructions
            showValidationMessage('Select an image or drag & drop it here to preview', 'info');
        });
