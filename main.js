

// MAIN.JS


const APP_ID = "8e4998b8";
const API_KEY = "adb9b375b1bf447d1ce4f687f4c14ace";
let FIRST_HALF_API_URL = "https://api.edamam.com/api/food-database/parser?ingr=";
let SECOND_HALF_API_URL = "&app_id=" + APP_ID + "&app_key=" + API_KEY;
const formElemet = document.querySelector('form');
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
        queryURL += "1%20" + "serving%20" + foodQueryArr[0] + SECOND_HALF_API_URL;
    }
    return queryURL;
}

function queryAPI() {
    addLoadingSpinner();
    let formedURL = formAPIQuery();
    fetch(formedURL, {
        method: 'GET',
        body: JSON.stringify(),
        headers: {
            'content-type' : 'application/json',
            'Accept' : 'application/json'
        }
    })
    .then(response => {
        responseStatus = response.status;
        return response.json();
    })
    .then(result => {
        switch(responseStatus) {
            case 200:
                let parsedData = getNutrientParsedData(result);
                getNutrientDataPerQuantity(parsedData);
                break;
            case 400:
                console.log('Client error');
                break;
            default:
                console.log('Unhandled Error');
                break;
        }      
    })
    .catch(err => {
        
        console.log(err);
    })
}

// MARK: - Respond to data from api.
function getNutrientParsedData(foodData) {
    console.log(foodData);
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
            
            if (result != undefined) {
                let totalNutrients = getTotalNutrients(result);
                let mealItemObject = makeMealItemObject(totalNutrients);
                updateMealMacronutrients(mealItemObject);
                createMealItem(foodLabel, mealItemObject);
            }
            
    });
    removeLoadingSpinner();
}

function getTotalNutrients(parsedData) {
    //
    let nutrients = parsedData.totalNutrients;
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
    return mealItemObject;
}




// MARK: - UI UPDATE FUNCTIONS
function updateMealMacronutrients(mealItemObject) {
    let mealCaloriesLabel = document.querySelector('#mealCaloriesLabel');
    let mealCarbohydratesLabel = document.querySelector('#mealCarbohydratesLabel');
    let mealFatsLabel = document.querySelector('#mealFatsLabel');
    let mealProteinLabel = document.querySelector('#mealProteinLabel');

    let macroNutrientArr = [mealCaloriesLabel, mealCarbohydratesLabel, mealFatsLabel, mealProteinLabel];
    let itemObjectKeys = Object.keys(mealItemObject);
    for (var i = 0; i < macroNutrientArr.length; i++) {
        var num = Number(macroNutrientArr[i].innerHTML);
        num += mealItemObject[itemObjectKeys[i]];
        num = num.toFixed(2);
        macroNutrientArr[i].innerHTML = num.toString();
    }
}

function createRow() {
    let mealItemsContainer = document.querySelector('#mealItemsContainer');
    let rowEle = document.createElement('div');
    rowEle.setAttribute('class', 'row');
    mealItemsContainer.appendChild(rowEle)
}

function createColMd4() {
    let mealItemsContainer = document.querySelector('#mealItemsContainer');
    let furthestRow = mealItemsContainer.lastChild;
    let colMd4Ele = document.createElement('div');
    colMd4Ele.setAttribute('class', 'col-md-4');
    furthestRow.appendChild(colMd4Ele);
}

function rowHasLessThanThreeColumns(ele) {
    if (ele.childElementCount < 3) {
        return true
    } 
    return false;
}



function formCardID(foodLabel) {
    let foodLabelArr = foodLabel.split(' ');
    if (foodLabelArr.length > 1) {
        var cardID = foodLabelArr[0];
        for (var i = 1; i < foodLabelArr.length; i++) {
            let word = foodLabelArr[i];
            let capitalized = word[0].toUpperCase() + word.slice(1);
            cardID += capitalized;
            return cardID;
        }
    } else {
        return foodLabel;
    }
}

function createElementWithClass(classValue, elementValue) {
    let paraEle = document.createElement(elementValue);
    paraEle.setAttribute('class', classValue);
    return paraEle;
}

function findFurthestCol(rowContainerId) {
    let rowContainer = document.querySelector(rowContainerId);
    let furthestRow = rowContainer.lastChild;
    let furthestColumn = furthestRow.lastChild;
    return furthestColumn
}

function formMealItemCard(foodLabel, itemObject) {
    let card = createElementWithClass('card', 'div');
    let cardBody = createElementWithClass('card-body', 'div');
    let cardTitle = createElementWithClass('card-title', 'h5');
    cardTitle.innerHTML = foodLabel;
    let furthestCol = findFurthestCol('#mealItemsContainer');
    furthestCol.appendChild(card);
    card.appendChild(cardBody);
    cardBody.appendChild(cardTitle);
    let calorieParagraph = createElementWithClass('card-text', 'p');
    calorieParagraph.innerHTML = "Calories " + itemObject.Calories.toFixed(2);
    cardBody.appendChild(calorieParagraph);
    let carbParagraph = createElementWithClass('card-text', 'p');
    carbParagraph.innerHTML = 'Carbohydrates ' + itemObject.Carbohydrates.toFixed(2);
    cardBody.appendChild(carbParagraph);
    let fatsParagraph = createElementWithClass('card-text', 'p');
    fatsParagraph.innerHTML = 'Fats ' + itemObject.Fats.toFixed(2);
    cardBody.appendChild(fatsParagraph);
    let proteinParagraph = createElementWithClass('card-text', 'p');
    proteinParagraph.innerHTML = 'Protein ' + itemObject.Protein.toFixed(2);
    cardBody.appendChild(proteinParagraph);
    let cardId = formCardID(foodLabel);
    card.parentElement.setAttribute('id', cardId);
    addDeleteItemButton(card);
}

function addDeleteItemButton(parentElement) {
    let deleteItemButtonDiv = createElementWithClass('deleteItemButtonDiv', 'div');
    let deleteButton = createElementWithClass('deleteButton', 'button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.innerHTML = "Delete";
    deleteItemButtonDiv.appendChild(deleteButton)
    parentElement.appendChild(deleteItemButtonDiv);
}

function createMealItem(foodLabel, itemObject) {
    //
    let mealItemsContainer = document.querySelector('#mealItemsContainer');
    let furthestRow = mealItemsContainer.lastChild;
    if (rowHasLessThanThreeColumns(furthestRow)) {
        createColMd4();
        formMealItemCard(foodLabel, itemObject);
    } else {
        createRow();
        createColMd4();
        formMealItemCard(foodLabel, itemObject);
    }
}

// MARK: - CLEAR BUTTON FUNCTIONALITY

function clearMeal() {
    let mealCaloriesLabel = document.querySelector('#mealCaloriesLabel');
    let mealCarbohydratesLabel = document.querySelector('#mealCarbohydratesLabel');
    let mealFatsLabel = document.querySelector('#mealFatsLabel');
    let mealProteinLabel = document.querySelector('#mealProteinLabel');

    mealCaloriesLabel.innerHTML = '0';
    mealCarbohydratesLabel.innerHTML = '0';
    mealFatsLabel.innerHTML ='0';
    mealProteinLabel.innerHTML = '0';

    let mealItemsContainer = document.querySelector('#mealItemsContainer');
    mealItemsContainer.innerHTML = '';
    createRow();
}

let clearButton = document.querySelector('#startOverButton');

// Mark: - DELETE ITEM FUNCTIONALITY

function parseOutMacronutrientsFromMealItem(macronutrientElements) {
    let subtractionObject = {};
    for (var i = 0; i < macronutrientElements.length; i++) {

        let innerTextArr = macronutrientElements[i].innerHTML.split(' ');
    
        let macroNum = Number(innerTextArr[innerTextArr.length - 1]);

        let numToSubtract = macroNum * -1;

        subtractionObject[innerTextArr[0]] = numToSubtract;
    }
    console.log(subtractionObject);
    updateMealMacronutrients(subtractionObject);

}

function deleteItem(deleteButtonParent) {

    let cardBody = deleteButtonParent.parentElement;

    let macronutrientElements = cardBody.querySelectorAll('.card-text');

    parseOutMacronutrientsFromMealItem(macronutrientElements);

    let col = deleteButtonParent.parentElement;
    let row = col.parentElement;
    row.removeChild(col);
}

// MARK: - LOADING SPINNER FUNCTIONALITY

function addLoadingSpinner() {
    let loadingDiv = document.querySelector('#loadingSpinner');
    loadingDiv.classList.add('loadingSpinner');
}

function removeLoadingSpinner() {
    let loadingDiv = document.querySelector('#loadingSpinner');
    loadingDiv.classList.remove('loadingSpinner');
}


// MARK: - EVENT LISTENERS
document.addEventListener('click', (event) => {
        if (event.target.textContent == 'Delete') {
            let deleteButtonParent = event.target.parentElement;
            deleteItem(deleteButtonParent);
        }
});

clearButton.addEventListener('click', (event) => {
    clearMeal();
});


formElemet.addEventListener('submit', (event) => {
    event.preventDefault();
    queryAPI();
});
