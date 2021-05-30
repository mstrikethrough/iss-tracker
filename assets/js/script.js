const apiSpaceStation = "https://api.wheretheiss.at/v1/satellites/25544";
const todayDate = moment();
const displayTodayDate = document.getElementById("today-date");

displayTodayDate.innerHTML = todayDate.format("LL");


async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

async function getSpaceStationData() {
  const data = await fetchData(apiSpaceStation);
  const spaceStationData = {
      lat: data.latitude,
      lng: data.longitude,
      alt: data.altitude,
      vel: data.velocity
  }
  return spaceStationData;
};

function updateSpaceStationData(lat, lng, alt, vel) {
  document.getElementById("latitude").textContent = lat;
  document.getElementById("longitude").textContent = lng;
  document.getElementById("altitude").textContent = alt;
  document.getElementById("velocity").textContent = vel;
};

function updateSatellitePosition(coords, marker) {
  const newPosition = new google.maps.LatLng(coords.lat, coords.lng);
  marker.setPosition(newPosition);
};


function initMap() {  // Initialize and add the map
  const myLatLng = { lat: 40, lng: -86 }; // starting map location in Indiana
  const currentLatLng = { updateSatellitePosition };

  updateSpaceStationData("Searching Latitude...", "Searching Longitude...", // Showing acquire stats prior to showing when satellite appears
        "Searching Altitude...", "Searching Velocity....");

  
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    mapTypeId: "hybrid",
    streetViewControl: false
});

  const satelliteMarker = new google.maps.Marker({
    position: myLatLng,
    map,
    icon: {
        url: "images/iss-emblem.png",
        scaledSize: new google.maps.Size(80, 80),
    },
});

  setInterval(() => {
    const promise = getSpaceStationData();
    promise.then(spaceStationData => {
      const coordinates = { lat: spaceStationData.lat, lng: spaceStationData.lng };
      map.setCenter(coordinates);
      updateSpaceStationData(spaceStationData.lat, spaceStationData.lng, spaceStationData.alt, spaceStationData.vel);
      updateSatellitePosition(coordinates, satelliteMarker);
    });
  },  2000);
};

window.onload = () => initMap();
// END GOOGLE MAPS TRACKER AND LAT/LNG TRACKER

//START QUIZ
//Code for the Quiz
const API_URL = "https://opentdb.com/api.php?amount=10";
const CategoriesURL = "https://opentdb.com/api_category.php";
let index = 0;
let score = 0;

// This function fetches the raw data from the API
async function fetchData(APIurl) {
    const response = await fetch(APIurl);
    return response.json();
}

// fetches the categories data from the API
async function fetchCategoriesFromAPI() {
    const data = await fetchData(CategoriesURL);
    return data.trivia_categories;
}

// fetches questions from the API and returns an object of questions with answers
async function fetchQuestionsFromAPI(APIurl) {
    const data = await fetchData(APIurl);
    if (data.response_code === 0) {
        const quizQuestions = data.results;
        const list = [];
        quizQuestions.forEach(element => {
            const question = {
                question: decodeCharacters(element.question),
                answers: shuffleQuiz(element.incorrect_answers.concat(element.correct_answer)), 
                correct: decodeCharacters(element.correct_answer)
            }
            list.push(question);
        });
        return list;
    }
    return false;
}

// Fisher-Yates array shuffling algorithm that shuffles through the questions randomly. 
function shuffleQuiz(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i)
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array;
}

//Decodes special HTML characters
function decodeCharacters(specialCharacterString) {
    const text = document.createElement('textarea');
    text.innerHTML = specialCharacterString;
    return text.value;
}

//Sets the title for the h1 tag that is displayed at the top of the screen
function title(string) {
    const title = document.getElementById('questionTitle'); //The title constant is set to be equal to the questionTitle div, which will allow the tite text to be displayed to the webpage.
    title.innerText = string; //Displays that title to the associated div
}

//Removes buttons from the div tag so that they are only displayed when needed
function removeButtons() {
    const div = document.getElementById('questionButton');
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
}

//Sets the question number at the bottom of the quiz by using the questionNumber div and uses the h1Element constant to display it to the screen
function QuestionNumber() {
    let questionNumber = index + 1;
    const h1Element = document.getElementById('questionNumber'); 
    h1Element.classList.add('number');
    h1Element.innerText = questionNumber + '/10';
}

//Sets the buttons for each question by setting the constant div equal to the questionButton ID and uses a loop to change the text displayed on the button based on the questions from the QuestionNumber function
function questionButtons(list, answers, correct) {
    const div = document.getElementById('questionButton'); 
    QuestionNumber();
    answers.forEach(element => {
        const button = document.createElement('button');
        const text = document.createTextNode(decodeCharacters(element)); // decoding special characters from answers
        button.appendChild(text);
        button.classList.add('btn');
        div.appendChild(button);
        button.addEventListener('click', () => questionButtonEventHandler(button, correct, list));
    });
}

//Event handler for the question buttons
function questionButtonEventHandler(button, correctAnswer, list) {
    const pressedButton = button.innerText;
    if (pressedButton === correctAnswer) { //If the user selects the correct answer, the score increments by one.
        score++;
        
    } else {
        alert('Wrong. The correct answer is: ' + correctAnswer); //If the user selects the incorrect answer, the user is alerted that they selected the wrong answer and told what the correct answer is.
        //Need to use a modal instead but having trouble
    
    }
    index++; //After each question, the index choses the next question until it reaches 10 questions. 
    removeButtons(); //Runs the removeButtons function that 
    quizStart(list); //Runs the Quiz Start function that includes the list of questions pulled from the API based on the category selected. 
}

//Removes the question number from the bottom when it is no longer needed
function removeQuestionNumber() {
    const h1Element = document.getElementById('questionNumber');
    h1Element.classList.remove('number');
    h1Element.innerText = '';
}

//Shows the restart button at the end of the quiz
function showRestartButton() {
    removeQuestionNumber();
    const div = document.getElementById('questionButton');
    const button = document.createElement('button');
    const text = document.createTextNode('Restart');
    button.classList.add('btn');
    button.appendChild(text);
    div.appendChild(button);
    button.addEventListener('click', () => document.location.reload(true));
}

//Starts the quiz and will load one question at a time from the API
function quizStart(questionList) {
    const numberOfQuestions = questionList.length - 1;
    if (index === numberOfQuestions) {
        title('Your final score is ' + score + '/10');
        showRestartButton();
        return;
    }
    title(questionList[index].question);
    questionButtons(questionList, questionList[index].answers, questionList[index].correct);
}

//Sets the categories from the API as buttons that the user can select to pick a cateogory
async function categoryButtons() {
    const categories = await fetchCategoriesFromAPI();
    const buttonList = document.getElementById('questionButton');

    for (const category of categories) {
        const button = document.createElement('button');
        const text = document.createTextNode(category.name);
        button.setAttribute('id', category.id);
        button.classList.add('btn');
        button.appendChild(text);
        buttonList.appendChild(button);
        button.addEventListener('click', () => categoryButtonEventHandler(button));
    }
}

//Event handler for the category buttons that determines whether a category was selected or not, removes all other buttons, and starts the quiz
async function categoryButtonEventHandler(button) {
    const api_url = API_URL + '&category=' + button.id;
    const list = await fetchQuestionsFromAPI(api_url);
    if (list === false) {
        alert('Could not load quiz. Try again later.');
        return;
    }
    removeButtons();
    quizStart(list);
}

function API_main_function() { //Sets the title for the quz and runs the categoryButtons function that displays the category buttons to the user. 
    title('Categories for Quiz');
    categoryButtons();
}

API_main_function();

// modal begin
let modalBtn = document.getElementById("modal-btn")
let modal = document.querySelector(".modal")
let closeBtn = document.querySelector(".close-btn")
modalBtn.onclick = function(){
  modal.style.display = "block"
}
closeBtn.onclick = function(){
  modal.style.display = "none"
}
window.onclick = function(e){
  if(e.target == modal){
    modal.style.display = "none"
  }
}
// modal end