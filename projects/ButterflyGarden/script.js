        // Garden state
        const garden = document.getElementById('garden');
        const cursor = document.querySelector('.custom-cursor');
        let butterflyCount = 12;
        let flowerCount = 18;
        let interactions = 0;
        let nightMode = false;
        let butterflies = [];
        let flowers = [];
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let animationId = null;
        
        // Butterfly colors
        const butterflyColors = [
            { wings: '#FF4081', body: '#C2185B' }, // Pink
            { wings: '#E91E63', body: '#AD1457' }, // Deep Pink
            { wings: '#9C27B0', body: '#6A1B9A' }, // Purple
            { wings: '#673AB7', body: '#4527A0' }, // Deep Purple
            { wings: '#3F51B5', body: '#283593' }, // Indigo
            { wings: '#2196F3', body: '#1565C0' }, // Blue
            { wings: '#03A9F4', body: '#0277BD' }, // Light Blue
            { wings: '#00BCD4', body: '#00838F' }, // Cyan
            { wings: '#009688', body: '#00695C' }, // Teal
            { wings: '#4CAF50', body: '#2E7D32' }, // Green
            { wings: '#8BC34A', body: '#558B2F' }, // Light Green
            { wings: '#CDDC39', body: '#9E9D24' }, // Lime
            { wings: '#FFEB3B', body: '#F9A825' }, // Yellow
            { wings: '#FFC107', body: '#FF8F00' }, // Amber
            { wings: '#FF9800', body: '#EF6C00' }, // Orange
            { wings: '#FF5722', body: '#D84315' }  // Deep Orange
        ];
        
        // Flower colors
        const flowerColors = [
            { petal: '#FF4081', center: '#FFEB3B' }, // Pink with yellow center
            { petal: '#E91E63', center: '#FF9800' }, // Deep pink with orange center
            { petal: '#9C27B0', center: '#FFC107' }, // Purple with amber center
            { petal: '#673AB7', center: '#8BC34A' }, // Deep purple with light green center
            { petal: '#2196F3', center: '#FFEB3B' }, // Blue with yellow center
            { petal: '#00BCD4', center: '#FF5722' }, // Cyan with deep orange center
            { petal: '#4CAF50', center: '#FFEB3B' }, // Green with yellow center
            { petal: '#8BC34A', center: '#E91E63' }, // Light green with pink center
            { petal: '#FFEB3B', center: '#9C27B0' }, // Yellow with purple center
            { petal: '#FF9800', center: '#673AB7' }  // Orange with deep purple center
        ];