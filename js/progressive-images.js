'use strict';

(function() {
    function initProgressiveImages() {
        const images = document.querySelectorAll('.card-img[loading="lazy"]');
        
        images.forEach(function(img) {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', function() {
                    img.classList.add('loaded');
                });
                
                img.addEventListener('error', function() {
                    img.classList.add('error');
                    img.src = 'images/user.png';
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProgressiveImages);
    } else {
        initProgressiveImages();
    }

    if (typeof window !== 'undefined') {
        window.initProgressiveImages = initProgressiveImages;
    }
})();
