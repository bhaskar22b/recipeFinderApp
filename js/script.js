// DOM Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const mealsContainer = document.getElementById("meals");
const resultHeading = document.getElementById("result-heading");
const errorContainer = document.getElementById("error-container");
const mealDetails = document.getElementById("meal-details");
const mealDetailsContent = document.querySelector(".meal-details-content");
const backBtn = document.getElementById("back-btn");

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";     //api url same 
const SEARCH_URL = `${BASE_URL}search.php?s=`;                   //when you search (that url)
const LOOKUP_URL = `${BASE_URL}lookup.php?i=`;                   //when you click on search to get deatails(that url)

searchBtn.addEventListener("click", searchMeals);       // search with click btn

mealsContainer.addEventListener("click", handleMealClick);     // when we click on meal card it's show meal deatails

backBtn.addEventListener("click", () => mealDetails.classList.add("hidden"));     //back btn in result page

// search with enter key
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMeals();
});

async function searchMeals() {
  const searchTerm = searchInput.value.trim();     //trim for no space

  // handled the edge case    // agar without text search then error show 
  if (!searchTerm) {
    errorContainer.textContent = "Please enter a search term";
    errorContainer.classList.remove("hidden");
    return;
  }

  //show in result heading Searching for + what we search
  try {
    resultHeading.textContent = `Searching for "${searchTerm}"...`;
    mealsContainer.innerHTML = "";
    errorContainer.classList.add("hidden");    // error container hide

    // fetch meals from API
    // www.themealdb.com/api/json/v1/1/search.php?s=chicken
    const response = await fetch(`${SEARCH_URL}${searchTerm}`);
    const data = await response.json();
    
    // if result = not found then notnig show
    if (data.meals === null) {
      // no meals found
      resultHeading.textContent = ``;
      mealsContainer.innerHTML = "";
      errorContainer.textContent = `No recipes found for "${searchTerm}". Try another search term!`;
      errorContainer.classList.remove("hidden");
    }
    // if result = found then result show
    else {
      resultHeading.textContent = `Search results for "${searchTerm}":`;      
      displayMeals(data.meals);
      searchInput.value = "";
    }
  } catch (error) {
    errorContainer.textContent = "Something went wrong. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}

//meals display or show
function displayMeals(meals) {
  mealsContainer.innerHTML = "";

  // loop through meals and create a card for each meal    // we acess all meal card through loop
  meals.forEach((meal) => {
    mealsContainer.innerHTML += `
      <div class="meal" data-meal-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <div class="meal-info">
          <h3 class="meal-title">${meal.strMeal}</h3>
          ${meal.strCategory ? `<div class="meal-category">${meal.strCategory}</div>` : ""}
        </div>
      </div>
    `;
  });
}

//when we click on meals we get full deatils form api
async function handleMealClick(e) {
  const mealEl = e.target.closest(".meal");          //nearest parent element from what we search 
  if (!mealEl) return;            //If no .meal element is found then function stop

  const mealId = mealEl.getAttribute("data-meal-id");        //get id to meals to store in html 

  try {
    const response = await fetch(`${LOOKUP_URL}${mealId}`);
    const data = await response.json();

      // console.log(data)

    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];

      const ingredients = [];

        // checks if an ingredient exists and is not an empty string tne we push  ingredient & measure {i} mean one by one all i & m
      for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim() !== "") {
          ingredients.push({
            ingredient: meal[`strIngredient${i}`],
            measure: meal[`strMeasure${i}`],
          });
        }
      }

      // geting full deatils form api then // display meal details in ui
      mealDetailsContent.innerHTML = `
           <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="meal-details-img">
           <h2 class="meal-details-title">${meal.strMeal}</h2>
           <div class="meal-details-category">
             <span>${meal.strCategory || "Uncategorized"}</span>
           </div>
           <div class="meal-details-instructions">
             <h3>Instructions</h3>
             <p>${meal.strInstructions}</p>
           </div>
           <div class="meal-details-ingredients">
             <h3>Ingredients</h3>
             <ul class="ingredients-list">
               ${ingredients
                 .map(
                   (item) => `
                 <li><i class="fas fa-check-circle"></i> ${item.measure} ${item.ingredient}</li>
               `
                 ) //data.join() mathod to convert string  //data = .map()   //.map() is array
                 .join("")}        
             </ul>
           </div>
           ${
             meal.strYoutube          //if there is yt line then put in it  // if not then empty
               ? `
             <a href="${meal.strYoutube}" target="_blank" class="youtube-link">
               <i class="fab fa-youtube"></i> Watch Video
             </a>
           `
               : ""
           }
         `;

      mealDetails.classList.remove("hidden");      //remove hidden class 
      mealDetails.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    errorContainer.textContent = "Could not load recipe details. Please try again later.";
    errorContainer.classList.remove("hidden");
  }
}





