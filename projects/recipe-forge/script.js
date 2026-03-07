        const ingredients = document.querySelectorAll('.ingredient');
        const potionColor = document.getElementById('potionColor');
        const cauldron = document.getElementById('cauldron');
        const recipeBook = document.getElementById('recipeBook');
        
        let selectedIngredients = [];
        let currentPotion = [];
        
        const ingredientColors = {
            dragonfruit: '#ff4d4d',
            moonflower: '#c2c2f0',
            starlight: '#ffff99',
            shadow: '#4d4d4d',
            crystal: '#b3ecff',
            phoenix: '#ff9933',
            mermaid: '#66ccff',
            dream: '#d9b3ff'
        };
        
        const recipes = {
            love: { ingredients: ['dragonfruit', 'moonflower'], color: '#ffb3b3', name: 'Love Potion' },
            wisdom: { ingredients: ['starlight', 'crystal'], color: '#b3b3ff', name: 'Wisdom Brew' },
            strength: { ingredients: ['dragonfruit', 'phoenix'], color: '#ff6666', name: 'Strength Elixir' },
            invisibility: { ingredients: ['shadow', 'dream'], color: '#404040', name: 'Invisibility' },
            flight: { ingredients: ['phoenix', 'dream'], color: '#ffb366', name: 'Flight' }
        };
        
        ingredients.forEach(ingredient => {
            ingredient.addEventListener('click', () => {
                ingredient.classList.toggle('selected');
                const ingredientName = ingredient.dataset.ingredient;
                
                if (ingredient.classList.contains('selected')) {
                    selectedIngredients.push(ingredientName);
                } else {
                    selectedIngredients = selectedIngredients.filter(i => i !== ingredientName);
                }
            });
        });
        
        function mixPotion() {
            if (selectedIngredients.length === 0) {
                potionColor.style.background = '#6b4f3a';
                return;
            }
            
            // Mix colors
            let r = 0, g = 0, b = 0;
            selectedIngredients.forEach(ing => {
                const color = ingredientColors[ing];
                if (color) {
                    const rgb = parseInt(color.slice(1), 16);
                    r += (rgb >> 16) & 255;
                    g += (rgb >> 8) & 255;
                    b += rgb & 255;
                }
            });
            
            r = Math.min(255, Math.floor(r / selectedIngredients.length));
            g = Math.min(255, Math.floor(g / selectedIngredients.length));
            b = Math.min(255, Math.floor(b / selectedIngredients.length));
            
            potionColor.style.background = `rgb(${r}, ${g}, ${b})`;
            
            // Check if matches any recipe
            let matchedRecipe = null;
            for (const [key, recipe] of Object.entries(recipes)) {
                const match = recipe.ingredients.every(ing => selectedIngredients.includes(ing)) &&
                             selectedIngredients.every(ing => recipe.ingredients.includes(ing));
                if (match) {
                    matchedRecipe = recipe;
                    break;
                }
            }
            
            if (matchedRecipe) {
                cauldron.style.boxShadow = `inset 0 -30px 0 #2a1e0e, 0 20px 0 #5e4f3a, 0 0 100px ${matchedRecipe.color}`;
                recipeBook.innerHTML = `<h3>📖 RECIPES</h3>
                    <div style="background: ${matchedRecipe.color}; padding: 20px; border-radius: 30px; color: white;">
                        ✨ You brewed: ${matchedRecipe.name}! ✨
                    </div>`;
            } else {
                cauldron.style.boxShadow = 'inset 0 -30px 0 #2a1e0e, 0 20px 0 #5e4f3a';
            }
        }
        
        function cleanCauldron() {
            selectedIngredients = [];
            ingredients.forEach(i => i.classList.remove('selected'));
            potionColor.style.background = '#6b4f3a';
            cauldron.style.boxShadow = 'inset 0 -30px 0 #2a1e0e, 0 20px 0 #5e4f3a';
            recipeBook.innerHTML = `<h3>📖 RECIPES</h3>
                <div class="recipe-entry" data-recipe="love">💕 Love Potion</div>
                <div class="recipe-entry" data-recipe="wisdom">🦉 Wisdom Brew</div>
                <div class="recipe-entry" data-recipe="strength">💪 Strength Elixir</div>
                <div class="recipe-entry" data-recipe="invisibility">👻 Invisibility</div>
                <div class="recipe-entry" data-recipe="flight">🕊️ Flight</div>`;
        }
        
        document.getElementById('brewBtn').addEventListener('click', mixPotion);
        document.getElementById('cleanBtn').addEventListener('click', cleanCauldron);
        
        // Recipe shortcuts
        document.querySelectorAll('.recipe-entry').forEach(entry => {
            entry.addEventListener('click', () => {
                const recipe = entry.dataset.recepe;
                // Auto-select ingredients for that recipe
                cleanCauldron();
                if (recipe && recipes[recipe]) {
                    recipes[recipe].ingredients.forEach(ing => {
                        ingredients.forEach(i => {
                            if (i.dataset.ingredient === ing) {
                                i.classList.add('selected');
                                selectedIngredients.push(ing);
                            }
                        });
                    });
                    mixPotion();
                }
            });
        });