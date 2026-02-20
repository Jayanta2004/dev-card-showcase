const recipesContainer = document.getElementById("recipes");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");

document.getElementById("searchBtn").addEventListener("click", searchMeal);
document.getElementById("favBtn").addEventListener("click", showFavorites);
document.getElementById("homeBtn").addEventListener("click", loadFeatured);
document.getElementById("closeModal").addEventListener("click", ()=> modal.style.display="none");

window.onclick = (e)=>{
  if(e.target==modal) modal.style.display="none";
}

/* LOAD FEATURED ON START */
loadFeatured();

async function loadFeatured(){
  document.getElementById("sectionTitle").textContent="Featured Recipes";
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=");
  const data = await res.json();
  displayMeals(data.meals.slice(0,8));
}

async function searchMeal(){
  const query = document.getElementById("searchInput").value;
  if(!query) return;

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  const data = await res.json();
  displayMeals(data.meals);
}

async function filterCategory(category){
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
  const data = await res.json();
  displayMeals(data.meals);
}

function displayMeals(meals){
  recipesContainer.innerHTML="";
  if(!meals){
    recipesContainer.innerHTML="<p>No recipes found</p>";
    return;
  }

  meals.forEach(meal=>{
    const card=document.createElement("div");
    card.classList.add("card");

    card.innerHTML=`
      <img src="${meal.strMealThumb}">
      <div class="card-content">
        <h3>${meal.strMeal}</h3>
        <div class="card-buttons">
          <button onclick="viewRecipe('${meal.idMeal}')">View</button>
          <button onclick="saveFavorite('${meal.idMeal}')">❤️</button>
        </div>
      </div>
    `;

    recipesContainer.appendChild(card);
  });
}

async function viewRecipe(id){
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  const meal=data.meals[0];

  let ingredients="";
  for(let i=1;i<=20;i++){
    if(meal[`strIngredient${i}`]){
      ingredients+=`<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
    }
  }

  modalBody.innerHTML=`
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" style="width:100%;border-radius:10px;margin:10px 0;">
    <h3>Ingredients</h3>
    <ul>${ingredients}</ul>
    <h3>Instructions</h3>
    <p>${meal.strInstructions}</p>
    ${meal.strYoutube ? `<a href="${meal.strYoutube}" target="_blank" style="color:#ff7e5f;">Watch on YouTube</a>`:""}
  `;

  modal.style.display="flex";
}

function saveFavorite(id){
  let favs=JSON.parse(localStorage.getItem("favorites"))||[];
  if(!favs.includes(id)){
    favs.push(id);
    localStorage.setItem("favorites",JSON.stringify(favs));
    alert("Added to favorites ❤️");
  }
}

async function showFavorites(){
  let favs=JSON.parse(localStorage.getItem("favorites"))||[];
  if(favs.length===0){
    recipesContainer.innerHTML="<p>No favorites yet</p>";
    return;
  }

  let meals=[];
  for(let id of favs){
    const res=await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data=await res.json();
    meals.push(data.meals[0]);
  }

  displayMeals(meals);
}
