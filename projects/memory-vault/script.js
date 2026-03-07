        const memoryGrid = document.getElementById('memoryGrid');
        const memoryInput = document.getElementById('memoryInput');
        const yearDisplay = document.getElementById('yearDisplay');
        
        let memories = JSON.parse(localStorage.getItem('timeCapsule')) || [];
        let currentYear = 2024;
        let sealed = true;
        
        function createGrid() {
            memoryGrid.innerHTML = '';
            
            for (let i = 0; i < 12; i++) {
                const cell = document.createElement('div');
                cell.className = `memory-cell ${sealed ? 'sealed' : ''}`;
                cell.dataset.index = i;
                
                if (memories[i]) {
                    cell.innerHTML = `📼<br><span style="font-size: 16px;">${memories[i].year}</span>`;
                } else {
                    cell.innerHTML = '🔒';
                }
                
                cell.addEventListener('click', () => openMemory(i));
                memoryGrid.appendChild(cell);
            }
        }
        
        function openMemory(index) {
            if (sealed) {
                alert('Vault is sealed! Open it first.');
                return;
            }
            
            if (memories[index]) {
                memoryInput.value = memories[index].text;
                yearDisplay.textContent = memories[index].year;
            } else {
                memoryInput.value = '';
            }
        }
        
        function storeMemory() {
            if (sealed) {
                alert('Vault is sealed! Open it first.');
                return;
            }
            
            const text = memoryInput.value.trim();
            if (!text) return;
            
            // Find first empty slot
            for (let i = 0; i < 12; i++) {
                if (!memories[i]) {
                    memories[i] = {
                        text: text,
                        year: currentYear,
                        timestamp: Date.now()
                    };
                    break;
                }
            }
            
            localStorage.setItem('timeCapsule', JSON.stringify(memories));
            createGrid();
            memoryInput.value = '';
        }
        
        function sealVault() {
            sealed = true;
            createGrid();
        }
        
        function openVault() {
            sealed = false;
            createGrid();
        }
        
        function timeJump() {
            currentYear += 10;
            yearDisplay.textContent = currentYear;
            
            // Some memories degrade over time
            if (Math.random() > 0.7) {
                const randomIndex = Math.floor(Math.random() * memories.length);
                if (memories[randomIndex]) {
                    memories[randomIndex].text += ' [faded...]';
                    localStorage.setItem('timeCapsule', JSON.stringify(memories));
                }
            }
            
            createGrid();
        }
        
        document.getElementById('storeBtn').addEventListener('click', storeMemory);
        document.getElementById('sealBtn').addEventListener('click', sealVault);
        document.getElementById('openBtn').addEventListener('click', openVault);
        document.getElementById('timeBtn').addEventListener('click', timeJump);
        
        createGrid();