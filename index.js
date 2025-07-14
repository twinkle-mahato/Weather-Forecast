
// Fetch the document element using query Selector
const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const notFound=document.querySelector(".error-container");
const errorBtn = document.querySelector("[data-errorBtn]");
const errorText = document.querySelector("[data-errorText]");
const errorImage = document.querySelector("[data-errorImg]");

// initially vairables need

// oldTab is currently is pointing to the userTab
let oldTab=userTab; 
const API_KEY="6eb46466b7c59b4fc7ef5b859dd62886";
// When a new tab is clicked, add a CSS class like .current-tab to it, which changes its style (gray border/background)-highlight the clicked Tab
oldTab.classList.add("current-tab");
// calling a function named getfromSessionStorage, and its purpose is usually to load saved data from the browser’s session storage (like weather info, user location, etc.) when the page loads or when a tab is clicked.If not saved location, ask the user to grant location access

getfromSessionStorage();

// Tab Switching
// This function runs when a tab is clicked. It takes the newTab (clicked tab) as a parameter.
 
function switchTab(newTab){

// This hides any "City Not Found" error message. if You don't want the error box visible when switching to another tab.
     notFound.classList.remove("active"); 
     errorImage.classList.remove("active");

// Only switch if the new tab is different from the currently active one or oldTab
     if(newTab!=oldTab){
// The previously selected tab/ old Tab should no longer look active ,You remove the class(current-tab) responsible for its active styling, Remove the gray border, Remove the background highlight, Make it look like a normal, inactive tab
      oldTab.classList.remove("current-tab");
// Now we update oldTab to point to the newly clicked tab
        oldTab=newTab;
// This adds the current-tab class to the newly clicked tab so it gets the active tab styling (like highlight or border).
        newTab.classList.add("current-tab");

         
// check which tab is selected - search tab / your tab

// if searchform container is invisible if yes, That means the user has just clicked the Search tab add the active class, so now we need to show the search UI.
         if(!searchForm.classList.contains("active")) {
// This hides the "Your Weather" info (user's local weather) if it's currently visible
        userInfoContainer.classList.remove("active");
// This hides the "Grant Location Access" section — because we're now using city name search, not location-based weather.
        grantAccessContainer.classList.remove("active");
// This makes the Search form visible, so the user can enter a city name.
        searchForm.classList.add("active");
        }
          
    // your weather
         
        else{
// Hides the Search form UI, since we’re no longer in search mode, remove the active class
           searchForm.classList.remove("active");
// This hides the weather info container, which might have shown the result of a city search. We hide it first because we will fetch location-based weather and update the UI.
           userInfoContainer.classList.remove("active"); 
// If user's coordinates are saved in sessionStorage,then It calls fetchUserWeatherInfo() to show local weather. If not saved,then It shows the Grant Access screen to request geolocation permission.
            getfromSessionStorage();
        }
        
    }

}
//This block adds event listeners to your tab buttons (userTab and searchTab) so that when a user clicks on them, the switchTab() function gets triggered. 

userTab.addEventListener("click",()=>{
// When clicked, it calls the switchTab function and passes userTab as the parameter, telling the app Hey, the user clicked on the 'Your Weather' tab. Show the corresponding UI
switchTab(userTab);
});


searchTab.addEventListener("click",()=>{
// When clicked, it triggers the UI switch to the search section.
switchTab(searchTab);
});

 
//check if cordinates are already present in session storage
function getfromSessionStorage() {

// This line tries to retrieve saved coordinates (as a string) from session storage using the key "user-coordinates"
    const localCoordinates = sessionStorage.getItem("user-coordinates");

// This checks if coordinates do not exist (i.e., the user hasn’t granted access yet or data was cleared).
    if(!localCoordinates) {
// Shows the “Grant Access” UI so the user can allow location access (probably with a button that triggers navigator.geolocation).
    grantAccessContainer.classList.add("active");
    }
    else { 
// If coordinates do exist : Parse the JSON string into an object ({ lat, lon }). Call fetchUserWeatherInfo() to fetch and display weather based on those coordinates
        const coordinates = JSON.parse(localCoordinates);
       fetchUserWeatherInfo(coordinates);
    }
}

// This function is async, meaning it will handle asynchronous operations like fetch() using await.It takes a coordinates object as input.

async function fetchUserWeatherInfo(coordinates) {

// This is destructuring the lat and lon values from the passed-in object
    const {lat, lon} = coordinates;
// Hides the “Grant Location Access” UI, because we already have coordinates and are proceeding to fetch weather data.
    grantAccessContainer.classList.remove("active");
// Shows a loading spinner or "Loading..." message to let the user know that weather info is being fetched.
    loadingScreen.classList.add("active");

// Make an API call to OpenWeatherMap
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
// Convert the response to JSON
        const  data = await response.json();

// !data.sys - This checks if the sys object (which contains system-level info like country) is missing or undefined. If it's missing, the data is likely corrupted or incomplete, so better to reject it.
// data.message- When the OpenWeatherMap API returns an error, the JSON response includes a message property explaining why the error happened.
// data.cod === "404" This checks if the API responded with a "404" code, which means "city not found" or invalid location. cod in OpenWeatherMap's response is a string, not a number. So comparing with "404" is correct.

        if (data.cod === "404" || !data.sys) {
    throw new Error(data.message || "Invalid data received");
      }
// Hides the loading spinner or loading screen.i had shown this earlier using .classList.add("active") when the fetch began. Now that the fetch is complete, you're removing the "active" class to hide it.
        loadingScreen.classList.remove("active");
// Shows the weather info UI container (usually where temperature, humidity, etc., are displayed).This container might have been hidden initially or while loading.Now that you have the data, you're making it visible again
        userInfoContainer.classList.add("active");
// is a function call that takes the data received from the weather API and displays it on the UI (i.e., fills in the weather info like temperature, city name,humidity,etc.).
        renderWeatherInfo(data);
    }

    catch(err) {
// Hides the loader spinner or loading screen, since fetching is done (but failed)        
        loadingScreen.classList.remove("active");
// Displays the error message container that says something like "City not found" or "Something went wrong"
        notFound.classList.add("active");
// Hide the error image by setting its display style to 'none' so it is not visible on the page
        errorImage.style.display = "none";
// Show the error message inside the errorText element
errorText.innerText = `Error: ${err?.message}`;
// When the user clicks the Retry button (errorBtn), call the fetchUserWeatherInfo function 
        errorBtn.addEventListener("click",fetchUserWeatherInfo);
        }

}

// This function receives the weather data (from fetchUserWeatherInfo() or fetchSearchWeatherInfo()) and displays it in the UI by updating text and image elements.

function renderWeatherInfo(weatherInfo) {
    
// fistly, we have to fetch the elements from the document

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

// This weatherInfo object is the parsed JSON response from the OpenWeatherMap API
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;



}

// This function tries to get the user’s current geographic location using the browser's Geolocation API
function getLocation() {

// This checks if the browser supports geolocation.navigator.geolocation is built into most modern browsers.
  if(navigator.geolocation) {

// If geolocation is supported, it calls this method.This method asks the user for permission to access their location.If the user allows, it calls your showPosition function with the position data.
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
// Hide the "Grant Access" button, because it's useless.

      grantAccessButton.style.display="none";
      alert("Geolocation is not supported in your browser.");
                
        }
    }

// This function is called automatically by the browser when the user grants location access
function showPosition(position) {
// You extract latitude and longitude from the browser's position object.Then you store them in a custom object named userCoordinates
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
// You store this userCoordinates object in the browser's sessionStorage.JSON.stringify() to convert the object into a string (because storage only accepts strings).
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
// This line calls the function that actually fetches the weather based on the user's current latitude and longitude.It passes userCoordinates to the API request.
    fetchUserWeatherInfo(userCoordinates);
}


const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);


// search For Weather
const searchInput = document.querySelector("[data-searchInput]");

// This adds an event listener to the search form. When the form is submitted (user presses Enter or clicks a button), this function runs
searchForm.addEventListener("submit", (e) => {
// Prevents the default behavior of the form — which is to reload the page
    e.preventDefault();
// Gets the city name entered by the user
    let cityName = searchInput.value;
// If the input is empty (user didn't type anything), exit the function — no API call happens.
    if(cityName === "")
        return;

// This code runs after the user enters a city name and submits the form.This function hides the error message section, in case an earlier search failed.
     hideError();
// This hides the current weather info section (if it’s visible)
     userInfoContainer.classList.remove("active"); 
// It calls the function fetchSearchWeatherInfo() and passes the city name that the user typed into the input box.   
        fetchSearchWeatherInfo(cityName);
    });

// It makes the error container visible and shows an error message + image + retry button
// Declares a function called showError, It takes an optional message parameter.If no message is passed, it defaults to "Something went wrong
function showError(message = "Something went wrong!") {
// Shows the error container, CSS uses .active to make it visible
    notFound.classList.add("active");
// Displays the error message text ("City not found" or the default)
    errorText.innerText = message;
// Sets the error image (could be a custom "404" image)
    errorImage.src = "./assets/not-found.png";
// Makes the retry button visible
    errorBtn.style.display = "block";
}


function hideError() {
    notFound.classList.remove("active"); // Hide the error container
    errorText.innerText = "";    // Clear any error message
    errorImage.src = "";    // // Remove the error image
    errorBtn.style.display = "none";  // // Hide the retry button
    searchInput.value = ""; // Clears the search input field too

}

errorBtn.addEventListener("click", () => {
    hideError();  // hide error UI
if (oldTab !== searchTab) {
        switchTab(searchTab); // this ensures you're on the search Tab
    }

    searchInput.focus(); // put cursor back into input
});



// Declares an async function that takes a city name and fetches weather info using the OpenWeatherMap API
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");  // Shows a loading spinner
    userInfoContainer.classList.remove("active");  // Hides any previous weather results
    grantAccessContainer.classList.remove("active"); // Hides the "Grant Location Access" UI in case it was visible
   




    try {

// Sends a GET request to the OpenWeatherMap API using the typed city. Awaits the response and parses it as JSON
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );
        const data = await response.json();
// If the API says the city is not found (404), it throws an error and jumps to the catch block.
        if (data.cod === "404") {
    throw new Error(data.message); // triggers catch block
}

    loadingScreen.classList.remove("active"); // Hides the loading spinner
    userInfoContainer.classList.add("active"); // Shows the weather container

    renderWeatherInfo(data);


    }
    catch(err) {
        loadingScreen.classList.remove("active");   // Hides loading spinner
        userContainer.classList.remove("active");   // Hides the overall container (optional, depends on your layout).
         showError( );
 
    
    }
}