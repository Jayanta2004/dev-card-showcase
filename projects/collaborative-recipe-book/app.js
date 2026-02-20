// Collaborative Recipe Book - app.js
// Core logic for recipe CRUD, ratings, comments, and UI interactions

const recipeListSection = document.getElementById('recipe-list-section');
const recipeList = document.getElementById('recipe-list');
const recipeDetailSection = document.getElementById('recipe-detail-section');
const recipeDetail = document.getElementById('recipe-detail');
const addRecipeBtn = document.getElementById('add-recipe-btn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');
const recipeForm = document.getElementById('recipe-form');
const modalTitle = document.getElementById('modal-title');
const backToListBtn = document.getElementById('back-to-list');

let recipes = [];
let editingRecipeIdx = null;

function saveRecipes() {
  localStorage.setItem('recipes', JSON.stringify(recipes));
}

function loadRecipes() {
  const data = localStorage.getItem('recipes');
  if (data) {
    recipes = JSON.parse(data);
  } else {
    recipes = [];
  }
}

function renderRecipeList() {
  recipeList.innerHTML = '';
  if (recipes.length === 0) {
    recipeList.innerHTML = '<li>No recipes yet. Add one!</li>';
    return;
  }
  recipes.forEach((recipe, idx) => {
    const li = document.createElement('li');
    li.className = 'recipe-item';
    li.innerHTML = `
      <span>${recipe.title}</span>
      <span class="rating">${renderStars(recipe.rating || 0, idx)}</span>
    `;
    li.addEventListener('click', () => showRecipeDetail(idx));
    recipeList.appendChild(li);
  });
}

function renderStars(rating, recipeIdx) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star${i <= rating ? '' : ' inactive'}" data-recipe="${recipeIdx}" data-star="${i}">&#9733;</span>`;
  }
  return stars;
}

function showRecipeDetail(idx) {
  const recipe = recipes[idx];
  recipeDetailSection.classList.remove('hidden');
  recipeListSection.classList.add('hidden');
  recipeDetail.innerHTML = `
    <h2>${recipe.title}</h2>
    <h4>Ingredients</h4>
    <ul>${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}</ul>
    <h4>Steps</h4>
    <ol>${recipe.steps.map(step => `<li>${step}</li>`).join('')}</ol>
    <div class="rating">${renderStars(recipe.rating || 0, idx)}</div>
    <button id="edit-recipe">Edit</button>
    <button id="delete-recipe">Delete</button>
    <section class="comments-section">
      <h3>Comments</h3>
      <div id="comments-list">
        ${recipe.comments && recipe.comments.length ? recipe.comments.map(c => `<div class="comment">${c}</div>`).join('') : '<div>No comments yet.</div>'}
      </div>
      <form id="comment-form">
        <input type="text" id="comment-input" placeholder="Add a comment..." required>
        <button type="submit">Post</button>
      </form>
    </section>
  `;
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', e => {
      e.stopPropagation();
      const starNum = parseInt(star.getAttribute('data-star'));
      const rIdx = parseInt(star.getAttribute('data-recipe'));
      recipes[rIdx].rating = starNum;
      saveRecipes();
      renderRecipeList();
      showRecipeDetail(rIdx);
    });
  });
  document.getElementById('edit-recipe').addEventListener('click', () => openEditRecipe(idx));
  document.getElementById('delete-recipe').addEventListener('click', () => deleteRecipe(idx));
  document.getElementById('comment-form').addEventListener('submit', e => {
    e.preventDefault();
    const commentInput = document.getElementById('comment-input');
    const comment = commentInput.value.trim();
    if (comment) {
      if (!recipes[idx].comments) recipes[idx].comments = [];
      recipes[idx].comments.push(comment);
      saveRecipes();
      showRecipeDetail(idx);
    }
    commentInput.value = '';
  });
}

function openAddRecipe() {
  editingRecipeIdx = null;
  modalTitle.textContent = 'Add Recipe';
  recipeForm.reset();
  modal.classList.remove('hidden');
}

function openEditRecipe(idx) {
  editingRecipeIdx = idx;
  modalTitle.textContent = 'Edit Recipe';
  const recipe = recipes[idx];
  document.getElementById('recipe-title').value = recipe.title;
  document.getElementById('recipe-ingredients').value = recipe.ingredients.join('\n');
  document.getElementById('recipe-steps').value = recipe.steps.join('\n');
  modal.classList.remove('hidden');
}

function closeModalFunc() {
  modal.classList.add('hidden');
}

function deleteRecipe(idx) {
  if (confirm('Delete this recipe?')) {
    recipes.splice(idx, 1);
    saveRecipes();
    renderRecipeList();
    recipeDetailSection.classList.add('hidden');
    recipeListSection.classList.remove('hidden');
  }
}

recipeForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('recipe-title').value.trim();
  const ingredients = document.getElementById('recipe-ingredients').value.split('\n').map(s => s.trim()).filter(Boolean);
  const steps = document.getElementById('recipe-steps').value.split('\n').map(s => s.trim()).filter(Boolean);
  if (title && ingredients.length && steps.length) {
    if (editingRecipeIdx !== null) {
      // Edit
      recipes[editingRecipeIdx].title = title;
      recipes[editingRecipeIdx].ingredients = ingredients;
      recipes[editingRecipeIdx].steps = steps;
    } else {
      // Add
      recipes.push({ title, ingredients, steps, rating: 0, comments: [] });
    }
    saveRecipes();
    renderRecipeList();
    closeModalFunc();
  }
});

addRecipeBtn.addEventListener('click', openAddRecipe);
closeModal.addEventListener('click', closeModalFunc);
window.addEventListener('click', e => {
  if (e.target === modal) closeModalFunc();
});
backToListBtn.addEventListener('click', () => {
  recipeDetailSection.classList.add('hidden');
  recipeListSection.classList.remove('hidden');
});

// Initial load
loadRecipes();
renderRecipeList();
