// MAIN.JS
const APP_ID = "8e4998b8";
const API_KEY = "adb9b375b1bf447d1ce4f687f4c14ace";
let FIRST_HALF_API_URL = "https://api.edamam.com/api/food-database/parser?ingr=";
let SECOND_HALF_API_URL = "&app_id=" + APP_ID + "&app_key=" + API_KEY;
const formElemet = document.querySelector('form');
let mealCaloriesLabelElement = document.querySelector('#mealCaloriesLabel');
// let API_URL = `https://api.edamam.com/api/food-database/parser?ingr=${queryString}&app_id=${APP_ID}&app_key=${API_KEY}`



// MARK: - Functions for handling user input and requesting info from the API
function parseUserInfo() {
    //
    let foodItem = document.querySelector('#foodItem');
    let userInputDict = {
        "foodItem" : foodItem.value
    }
    formElemet.reset();
    return userInputDict;
}

function formAPIQuery() {
    let userInputDict = parseUserInfo();
    var queryURL = FIRST_HALF_API_URL;
    let foodQueryArr = userInputDict["foodItem"].split(' ')
    if (foodQueryArr.length > 1) {
       for (var i = 0; i < foodQueryArr.length; i++) {
            if (i < foodQueryArr.length - 1) {
                queryURL += foodQueryArr[i] + "%20";
            } else {
                queryURL += foodQueryArr[i];
            }
        }
        queryURL += SECOND_HALF_API_URL; 
    } else {
        queryURL += foodQueryArr[0] + SECOND_HALF_API_URL;
    }
    return queryURL;
}

function queryAPI() {

    let formedURL = formAPIQuery();
    fetch(formedURL, {
        method: 'GET',
        body: JSON.stringify(),
        headers: {
            'content-type' : 'application/json',
            'Accept' : 'application/json'
        }
    }).then(response => response.json()).then(result => {
        let Calories = getNutrientData(result);
        updateMealCaloriesLabel(Calories);
    });
    
}

// MARK: - Respond to data from api.
function getNutrientData(foodData) {
    console.log(foodData);
    let parsedData = foodData.parsed;
    console.log(parsedData);
    let nutrients = parsedData[0].food.nutrients;
    console.log(nutrients);
    return nutrients["ENERC_KCAL"];

}
// MARK: - UI UPDATE FUNCTIONS
function updateMealCaloriesLabel(Calories) {
    var intMealCalories = Number(mealCaloriesLabel.innerHTML);
    intMealCalories += Calories;
    newCalorieString = intMealCalories.toString();
    mealCaloriesLabel.innerHTML = newCalorieString;
}

// MARK: - CLEAR BUTTON FUNCTIONALITY

function clearMealCaloriesLabel() {
    mealCaloriesLabel.innerHTML = "0000";
}

const clearButton = document.querySelector('#startOverButton');

clearButton.addEventListener('click', (event) => {
    clearMealCaloriesLabel();
});


formElemet.addEventListener('submit', (event) => {
    event.preventDefault();
    queryAPI();
});
