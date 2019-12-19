// MAIN.JS
const APP_ID = "8e4998b8";
const API_KEY = "adb9b375b1bf447d1ce4f687f4c14ace";
let FIRST_HALF_API_URL = "https://api.edamam.com/api/food-database/parser?ingr=";
let SECOND_HALF_API_URL = "&app_id=" + APP_ID + "&app_key=" + API_KEY;
const formElemet = document.querySelector('form');
let mealCaloriesLabelElement = document.querySelector('#mealCaloriesLabel');
let NUTRIENT_API = "https://api.edamam.com/api/food-database/nutrients?";
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
        let parsedData = getNutrientParsedData(result);
        console.log(parsedData);
        getNutrientDataPerQuantity(parsedData);
    });
}

// MARK: - Respond to data from api.
function getNutrientParsedData(foodData) {
    let parsedData = foodData.parsed;
    return parsedData;
}



function getNutrientDataPerQuantity(parsedData) {
    // This function will place the post request for the 
    // Specified amount of nutrients for the servings given.
    let parsedArr = parsedData[0];
    let quantity = parsedArr.quantity;
    let measureURI = parsedArr.measure.uri;
    let foodId = parsedArr.food.foodId;
    let foodLabel = parsedArr.food.label
    let ingredients = {
        "ingredients": [
            {
                "quantity": quantity,
                "measureURI": measureURI,
                "foodId": foodId
            }
        ]
    };

    fetch(NUTRIENT_API + SECOND_HALF_API_URL , {
        method: "POST",
        body: JSON.stringify(ingredients),
        headers: {
            'content-type': 'application/json'
        }
    }).then(response => response.json()).then(result => {
        let totalNutrients = getTotalNutrients(result);
        let mealItemObject = makeMealItemObject(totalNutrients);
        updateMealCaloriesLabel(mealItemObject.Calories);
        createMealItem(foodLabel, mealItemObject);
    });
}

function getTotalNutrients(parsedData) {
    //
    let nutrients = parsedData.totalNutrients;
    console.log(nutrients);
    return nutrients;
}



// MARK: - GET MEAL ITEM DETAILS FUNCTIONS
function getkCal(nutrients) {
    let calories = nutrients.ENERC_KCAL.quantity;
    return calories;
}

function getCarbohydrates(nutrients) {
    let carbohydrates = nutrients.CHOCDF.quantity;
    return carbohydrates;
}

function getFats(nutrients) {
    let fats = nutrients.FAT.quantity;
    return fats;
}

function getProtein(nutrients) {
    let protein = nutrients.PROCNT.quantity;
    return protein;
}

function makeMealItemObject(nutrients) {
    let calories = getkCal(nutrients);
    let carbohydrates = getCarbohydrates(nutrients);
    let fats = getFats(nutrients);
    let protein = getProtein(nutrients);
    let mealItemObject = {
        'Calories': calories,
        'Carbohydrates': carbohydrates,
        'Fats': fats,
        'Protein': protein
    };
    console.log(mealItemObject);
    return mealItemObject;
}




// MARK: - UI UPDATE FUNCTIONS
function updateMealCaloriesLabel(Calories) {
    var intMealCalories = Number(mealCaloriesLabel.innerHTML);
    intMealCalories += Calories;
    newCalorieString = intMealCalories.toString();
    mealCaloriesLabel.innerHTML = newCalorieString;
}
// TO-DO: - CREATE NODES TO ATTACH THE ELEMENTS TO THE PAGE. 
function createMealItem(foodLabel, itemObject) {
    let itemTitle = document.querySelector('.card-title');
    itemTitle.innerHTML = foodLabel;
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
    createMealItem();
});
