// MAIN.JS
const APP_ID = "8e4998b8";
const API_KEY = "adb9b375b1bf447d1ce4f687f4c14ace";
let API_URL = `https://api.edamam.com/api/food-database/parser?ingr=red%20apple&app_id=${APP_ID}&app_key=${API_KEY}`

function getNutrientData(foodData) {
    let parsedData = foodData.parsed;
    let nutrients = parsedData[0].food.nutrients;
    console.log(nutrients);
}

fetch(API_URL, {
    method: 'GET',
    body: JSON.stringify(),
    headers: {
        'content-type' : 'application/json',
        'Accept' : 'application/json'
    }
}).then(response => response.json()).then(result => {
    console.log(result);
    getNutrientData(result);
});