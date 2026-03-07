        const soilProfile = document.getElementById('soilProfile');
        const soilInfo = document.getElementById('soilInfo');
        
        const soilLayers = [
            { name: 'O Horizon', desc: 'Organic matter - leaves, plants, living things', icon: '🍂', color: '#4a3a2a' },
            { name: 'A Horizon', desc: 'Topsoil - rich in minerals and humus', icon: '🌱', color: '#6b4a2a' },
            { name: 'B Horizon', desc: 'Subsoil - clay and minerals accumulate', icon: '🪨', color: '#8b5a3a' },
            { name: 'C Horizon', desc: 'Weathered bedrock - parent material', icon: '⛰️', color: '#b87c4a' },
            { name: 'R Horizon', desc: 'Bedrock - solid rock layer', icon: '🗻', color: '#5a4a3a' }
        ];
        
        function createSoilColumns() {
            // Create 3 soil columns for different profiles
            for (let col = 0; col < 3; col++) {
                const column = document.createElement('div');
                column.className = 'soil-column';
                column.dataset.column = col;
                
                // Add layers with some variation
                soilLayers.forEach((layer, index) => {
                    const layerDiv = document.createElement('div');
                    layerDiv.className = `soil-layer layer-${['o','a','b','c','r'][index]}`;
                    layerDiv.dataset.layer = index;
                    layerDiv.dataset.column = col;
                    
                    // Vary thickness based on column
                    const thickness = col === 1 ? 1.2 : col === 2 ? 0.8 : 1;
                    layerDiv.style.flex = thickness;
                    
                    const icon = document.createElement('div');
                    icon.className = 'layer-icon';
                    icon.textContent = layer.icon;
                    
                    const name = document.createElement('div');
                    name.className = 'layer-name';
                    name.textContent = layer.name;
                    
                    layerDiv.appendChild(icon);
                    layerDiv.appendChild(name);
                    
                    layerDiv.addEventListener('click', () => showLayerInfo(layer, col));
                    column.appendChild(layerDiv);
                });
                
                soilProfile.appendChild(column);
            }
        }
        
        function showLayerInfo(layer, column) {
            let extraInfo = '';
            if (column === 0) extraInfo = ' (sandy profile - good drainage)';
            else if (column === 1) extraInfo = ' (clay profile - holds water)';
            else extraInfo = ' (loamy profile - perfect for plants)';
            
            soilInfo.innerHTML = `
                <strong>${layer.icon} ${layer.name}</strong>${extraInfo}<br>
                ${layer.desc}<br>
                <em style="font-size: 16px;">depth: ${(column + 1) * 10}cm below surface</em>
            `;
        }
        
        function addWorms() {
            // Add worm animations to random layers
            const layers = document.querySelectorAll('.soil-layer');
            layers.forEach(layer => {
                if (Math.random() > 0.7) {
                    const worm = document.createElement('span');
                    worm.textContent = '🪱';
                    worm.style.position = 'absolute';
                    worm.style.left = Math.random() * 80 + '%';
                    worm.style.top = Math.random() * 80 + '%';
                    worm.style.fontSize = '20px';
                    worm.style.animation = 'wiggle 0.5s infinite';
                    layer.appendChild(worm);
                    
                    setTimeout(() => worm.remove(), 3000);
                }
            });
            
            soilInfo.innerHTML = '🪱 Worms are aerating the soil!';
        }
        
        function growRoots() {
            const columns = document.querySelectorAll('.soil-column');
            columns.forEach(column => {
                const root = document.createElement('div');
                root.className = 'root';
                root.style.left = Math.random() * 100 + '%';
                root.style.top = '0';
                root.style.height = (30 + Math.random() * 70) + '%';
                root.style.background = '#8b5a3a';
                column.appendChild(root);
                
                setTimeout(() => root.remove(), 5000);
            });
            
            soilInfo.innerHTML = '🌿 Roots are growing deeper...';
        }
        
        function addWater() {
            const layers = document.querySelectorAll('.soil-layer');
            layers.forEach(layer => {
                layer.style.filter = 'brightness(0.8) sepia(0.3)';
                setTimeout(() => layer.style.filter = '', 2000);
            });
            
            soilInfo.innerHTML = '💧 Water percolating through soil layers';
        }
        
        function addCompost() {
            const topLayers = document.querySelectorAll('[data-layer="0"]');
            topLayers.forEach(layer => {
                layer.style.background = '#6b5a3a';
                const compost = document.createElement('span');
                compost.textContent = '🍂';
                compost.style.position = 'absolute';
                compost.style.fontSize = '24px';
                compost.style.animation = 'fall 2s linear';
                layer.appendChild(compost);
                
                setTimeout(() => compost.remove(), 2000);
            });
            
            soilInfo.innerHTML = '🍂 Compost enriching the topsoil';
        }
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes wiggle {
                0% { transform: translateX(0px); }
                50% { transform: translateX(5px); }
                100% { transform: translateX(0px); }
            }
            @keyframes fall {
                0% { transform: translateY(-50px); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(50px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.querySelector('[data-tool="worm"]').addEventListener('click', addWorms);
        document.querySelector('[data-tool="root"]').addEventListener('click', growRoots);
        document.querySelector('[data-tool="water"]').addEventListener('click', addWater);
        document.querySelector('[data-tool="compost"]').addEventListener('click', addCompost);
        
        createSoilColumns();