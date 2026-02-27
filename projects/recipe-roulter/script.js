    (function() {
      // ---------- RECIPE DATABASE (rich & playful) ----------
      const recipes = [
        {
          name: "SHAKSHUKA",
          cuisine: "🇮🇱 north african",
          ingredients: "🍅 eggs · tomatoes · bell pepper · cumin",
          description: "Poached eggs in spicy tomato & pepper sauce. Perfect with crusty bread."
        },
        {
          name: "MUSHROOM RISOTTO",
          cuisine: "🇮🇹 italiano",
          ingredients: "🍄 arborio · mushrooms · parmesan · broth",
          description: "Creamy, slow-stirred rice with woodsy mushrooms and a splash of white wine."
        },
        {
          name: "COCONUT CURRY",
          cuisine: "🇹🇭 thai inspired",
          ingredients: "🥥 coconut milk · curry paste · bamboo shoots · tofu",
          description: "Fragrant, mildly spicy coconut curry – serve with jasmine rice."
        },
        {
          name: "BLACK BEAN TACOS",
          cuisine: "🇲🇽 mexican",
          ingredients: "🌮 black beans · avocado · salsa · lime",
          description: "Quick mash of black beans, piled into warm tortillas with crema & cilantro."
        },
        {
          name: "LEMON HERB CHICKEN",
          cuisine: "🇬🇷 mediterranean",
          ingredients: "🍋 chicken · oregano · lemon · garlic",
          description: "Juicy oven-roasted chicken with potatoes, lemon and oregano."
        },
        {
          name: "SPINACH & FETA FILO PIE",
          cuisine: "🇬🇧 gr taste",
          ingredients: "🥬 spinach · feta · filo · dill",
          description: "Crispy layered pie with salty feta and wilted spinach (spanakopita style)."
        },
        {
          name: "CREAMY TOMATO SOUP",
          cuisine: "🥣 classic",
          ingredients: "🍅 tomatoes · onion · cream · basil",
          description: "Silky smooth tomato soup with a swirl of cream and fresh basil."
        },
        {
          name: "PEANUT NOODLE BOWL",
          cuisine: "🥜 asian fusion",
          ingredients: "🍜 noodles · peanut butter · soy · sesame",
          description: "Cold or warm noodles in a savory peanut sauce, topped with scallions."
        },
        {
          name: "BUTTERNUT SQUASH SOUP",
          cuisine: "🎃 autumn",
          ingredients: "🍂 squash · coconut · ginger · nutmeg",
          description: "Velvety roasted squash soup with hint of ginger and coconut milk."
        },
        {
          name: "CHICKPEA BURGERS",
          cuisine: "🥙 veggie",
          ingredients: "🧆 chickpeas · cumin · tahini · panko",
          description: "Hearty patties made from spiced chickpeas, pan-fried and tucked in bun."
        },
        {
          name: "SHAWARMA SPICE BOWL",
          cuisine: "🇱🇧 levant",
          ingredients: "🥩 lamb/chickpeas · rice · garlic yogurt",
          description: "Warm spices (cumin, coriander) over meat or cauliflower, with tangy yogurt."
        },
        {
          name: "BANANA PANCAKES",
          cuisine: "🥞 brunch",
          ingredients: "🍌 bananas · oats · eggs · maple",
          description: "Fluffy flourless pancakes, naturally sweetened with ripe banana."
        },
        {
          name: "SPICY RAMEN",
          cuisine: "🍜 japanese ",
          ingredients: "🥚 noodles · miso · chili · soft egg",
          description: "Rich miso-chili broth with corn, bamboo and a jammy soft-boiled egg."
        },
        {
          name: "CAPRESE SALAD",
          cuisine: "🇮🇹 insalata",
          ingredients: "🍅 mozzarella · basil · balsamic",
          description: "Simple summer classic: tomatoes, fresh mozzarella, fragrant basil."
        },
        {
          name: "LENTIL SHEPHERD'S PIE",
          cuisine: "🇬🇧 comfort",
          ingredients: "🥕 lentils · peas · mashed potatoes",
          description: "Hearty lentil & veggie filling topped with creamy mashed potato crust."
        },
        {
          name: "GARLIC BUTTER SHRIMP",
          cuisine: "🌊 seafood",
          ingredients: "🦐 shrimp · garlic · lemon · parsley",
          description: "Shrimp sizzled in garlic butter, finished with lemon – 10 minute meal."
        }
      ];

      // ---------- DOM elements ----------
      const recipeNameEl = document.getElementById('recipeName');
      const recipeCuisineEl = document.getElementById('recipeCuisine');
      const ingredientsEl = document.getElementById('ingredientsTag');
      const recipeDescEl = document.getElementById('recipeDesc');
      const spinBtn = document.getElementById('spinBtn');
      const recipeCountEl = document.getElementById('recipeCount');
      const randomBadge = document.getElementById('randomBadge');
      const resetHistoryBtn = document.getElementById('resetHistory');

      // ---------- state ----------
      let lastIndex = null;           // stores previous recipe index to avoid immediate repeat
      let spinHistory = [];            // array of indices that have been shown (max 10)
      let totalRecipes = recipes.length;

      // helper: update recipe count display
      function updateStats() {
        recipeCountEl.textContent = totalRecipes;
      }

      // helper: get random index (avoid repeat of lastIndex)
      function getRandomRecipeIndex() {
        if (totalRecipes === 0) return -1; // (never happens, but guard)
        if (totalRecipes === 1) return 0;    // only one choice

        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * totalRecipes);
        } while (newIndex === lastIndex);
        return newIndex;
      }

      // core function: render a recipe by index, update state and history
      function showRecipeByIndex(index) {
        if (index < 0 || index >= totalRecipes) return;

        const recipe = recipes[index];
        recipeNameEl.textContent = recipe.name;
        recipeCuisineEl.textContent = recipe.cuisine;
        ingredientsEl.textContent = recipe.ingredients;
        recipeDescEl.textContent = recipe.description;

        // update badge with small animation
        randomBadge.style.opacity = '0.7';
        randomBadge.textContent = `🍀 #${index + 1} selected`;
        setTimeout(() => { randomBadge.style.opacity = '1'; }, 50);

        // store last index to avoid consecutive repeat
        lastIndex = index;

        // manage history (last 10 unique spins? we store simple rolling)
        spinHistory.unshift(index);
        if (spinHistory.length > 10) spinHistory.pop();

        // optional subtle color change on display
        document.getElementById('recipeDisplay').style.transition = 'background 0.15s';
        document.getElementById('recipeDisplay').style.background = '#fff9f0';
        setTimeout(() => {
          document.getElementById('recipeDisplay').style.background = '#fcf7f0';
        }, 120);
      }

      // spin action: get random index and show it
      function spinRoulette() {
        if (totalRecipes === 0) return;   // sanity
        const idx = getRandomRecipeIndex();
        if (idx !== undefined) {
          showRecipeByIndex(idx);
        }
      }

      // reset history: only reset lastIndex and spinHistory (doesn't change current recipe)
      function resetHistoryOnly() {
        lastIndex = null;                // allow immediate repeat of current if someone spins again (but not forced)
        spinHistory = [];
        randomBadge.textContent = '♻️ history cleared';
        // keep current recipe untouched, just refresh badge message
        setTimeout(() => {
          if (lastIndex !== null) {
            randomBadge.textContent = `🍀 #${lastIndex + 1} on display`;
          } else {
            randomBadge.textContent = '🔥 random pick';
          }
        }, 1200);
      }

      // bonus: load a random recipe on first page load
      function initialRandomRecipe() {
        const initialIndex = Math.floor(Math.random() * totalRecipes);
        showRecipeByIndex(initialIndex);
      }

      // attach spin event
      spinBtn.addEventListener('click', spinRoulette);

      // reset history click
      resetHistoryBtn.addEventListener('click', resetHistoryOnly);

      // initial population
      updateStats();
      initialRandomRecipe();

      // optional: add tiny easter egg double click on title resets to very first recipe?
      // just for fun – not needed, but adds charm
      document.querySelector('h1').addEventListener('dblclick', function() {
        showRecipeByIndex(0);
        randomBadge.textContent = '🥄 back to start';
        setTimeout(() => {
          randomBadge.textContent = `🍀 #${lastIndex+1} on display`;
        }, 1200);
      });

      // also update count if any weirdness, but it's static
    })();