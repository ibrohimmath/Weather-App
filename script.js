"use strict";

const weekDays = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const monthDays = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const myApi = "c6997387f3559e448b61bb5aa1cf8e36";
const API = "bd5e378503939ddaee76f12ad7a97608";

const citiesUrl = ["Tashkent", "Andijan", "Namangan", "Sirdaryo", "Jizzakh", "Qashqadaryo", "Xorezm", "Navoiy", "Bukhara", "Karakalpakstan", "Fergana"];
const citiesNames = ["Toshkent", "Andijon", "Namangan", "Sirdaryo", "Jizza", "Qashqadaryo", "Xorazm", "Navoiy", "Buxoro", "Qoraqalpog'iston", "Farg'ona"];

const cityChosen = document.querySelector(".city--choose");
const todayDate = document.querySelector(".weather--today");
const today = new Date();
const hour = today.getHours();

const temperatureNow = document.querySelector(".now--temperature");
const iconNow = document.querySelector(".now--icon");

const weatherHourly = document.querySelector(".weather__hourly");

const daytoMs = 24 * 60 * 60 * 1000;

const firstDiv = document.querySelector(".weather__daily--first");
const secondDiv = document.querySelector(".weather__daily--second");

const sections = document.querySelector(".sections");

const bar = document.querySelector("label:not(.close)");
const labelClose = document.querySelector(".close");
const checkBox = document.querySelector("#check");

let cityName = citiesNames[0];
let cityUrl = citiesUrl[0];
let lonLatUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityUrl}&appid=9dd86907fe501cec50da3d087e4e9dc0`;


// Making cities bar responsive
window.addEventListener("resize", function(e) {
  const width = document.documentElement.clientWidth;
  if (width > 1500) {
    sections.style.zIndex = 0;
    labelClose.style.transform = 'translate(-100%)';
    return;
  }
  sections.style.zIndex = 10;
  // console.log(width, "Responsive");
});

// Change sections responsive functionalities when bar is clicked
const changeResponsive = function(e) {
  if (!checkBox.checked) {
    labelClose.style.transform = 'translate(0%)';
    sections.style.right = "0%";
    return;
  } 
  labelClose.style.transform = 'translate(-100%)';
};
bar.addEventListener("click", changeResponsive);

// Change sections responsive functionalities when label close is clicked
labelClose.addEventListener("click", function(e) {
  if (this.style.transform == "translate(0%)") {
    this.style.transform = 'translate(-100%)';
    sections.style.right = "-100%";
  }
});

// Building whole web page functionalities
const buildWebPage = function() {  
  // Increase given date by one day
  const increaseDate = function(date, ind) {
    return new Date(date.getTime() + ind * daytoMs);
  }
  
  // Build image with given icon format with proper url from openweathermap
  const buildImage = function(icon) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }
  
  // Current temperature and features
  const getTodayWeather = function(obj) {
    let {temp, weather: [{icon}]} = obj;  
    temp = Math.round(temp);
    temp = new Intl.NumberFormat(navigator.language, {style: "unit", unit: "celsius"}).format(temp);
    temperatureNow.textContent = temp;
    iconNow.setAttribute("src", buildImage(icon));
  };
  
  // Get coming 7 days weather datas
  const getNextDayWeather = function(obj, ind) {
    let {temp: {day: tempDay}, weather: [{icon}]} = obj;
    if (!ind) return;
    
    const dateNew = increaseDate(today, ind);
    let dayWeek = (dateNew.getDay() + 6) % 7;
    const weekdayName = weekDays[dayWeek];
    icon = buildImage(icon);
    tempDay = Math.round(tempDay);
    tempDay = new Intl.NumberFormat("en-US", {style: "unit", unit: "celsius"}).format(tempDay);
    const dayMonth = dateNew.getDate();
  
    const dateHTML = `
    <div class="weather weather__daily--date">
      <span class="date__first">${weekdayName}, ${dayMonth}</span>
      <span class="date__second"><img src="${icon}">${tempDay}</span>
    </div>`
  
    if (ind <= 4) {
      firstDiv.insertAdjacentHTML("beforeend", dateHTML);
    } else {
      secondDiv.insertAdjacentHTML("beforeend", dateHTML);
    }
  
    // console.log(weekdayName, dayMonth, icon, tempDay, ind, dateHTML);
  };
  
  const displayTodayData = function(current, daily) {
    getTodayWeather(current);

    firstDiv.textContent = "";
    secondDiv.textContent = "";
    daily.forEach((day, ind) => getNextDayWeather(day, ind));
  };
  
  // Get all weather datas daily (for now and coming 7 days)
  const getDailyWeather = function(lat, lon) {
    // Getting today's and next days' datas
    fetch(`https://api.openweathermap.org/data/2.8/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=9dd86907fe501cec50da3d087e4e9dc0&units=metric&lang=ru`)
      .then(response => response.json())
      .then(({current, daily}) => displayTodayData(current, daily));
  };
  
  // Adding hourly weather datas to web page
  const addHourlyData = function(data, ind) {
    let tempHour = (hour + ind) % 24;
    let {temp, weather: [{icon}]} = data;
  
    tempHour = !ind ? "Hozir" : `${tempHour}`.padStart(2, '0') + ":00";
    temp = new Intl.NumberFormat("en-US", {style: "unit", unit: "celsius"}).format(Math.round(temp));
    icon = buildImage(icon);
  
    let childElement = `
    <div class="weather__hour">
      <span class="weather__hour--time">${tempHour}</span>
      <span class="weather__hour--temperature">${temp}</span>
      <img class="weather__hour--icon" src="${icon}"></img>
    </div>`;
  
    weatherHourly.insertAdjacentHTML("beforeend", childElement);  
    // console.log(childElement);
  };
  
  // Get hourly weather datas for today
  const getHourlyWeather = function(lat, lon) {
    // Getting today's hourly datas
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API}&units=metric`)
      .then(response => response.json())
      .then(({hourly}) => hourly.slice(0, 8))
      .then(datas => {
        weatherHourly.textContent = "";
        datas.forEach((data, ind) => {
          addHourlyData(data, ind);
        });
      })
  };
  
  // Get Longitude and Latitude for url which was build by requested city in chosen section
  const getLonLat = function(url) {
    // Getting Longitude and Latitude
    fetch(url)
      .then(response => response.json())
      .then(([{lat, lon}]) => {
        getDailyWeather(lat, lon);
        getHourlyWeather(lat, lon);
      })
      // Error warning 
      .catch(err => console.log("Error!!!"));  
  };
  getLonLat(lonLatUrl);
  

  // Configuring now date
  const setToday = function() {
    // console.log(today);
    // console.log("city");
    todayDate.textContent = `${weekDays[today.getDay() - 1]}, ${today.getDate()} - ${monthDays[today.getMonth()]}`;
    cityChosen.textContent = cityName;
  }
  setToday();
};
buildWebPage();

// Changing datas due to selected cities from sections
let selectedPrev;
sections.addEventListener("click", function(e) {
  const parent = e.target.closest(".section__element");
  if (!parent || selectedPrev == parent) return;

  selectedPrev = parent;
  
  const radioButton = parent.querySelector("input");
  radioButton.checked = true;
  
  const ind = +parent.dataset.number;

  cityName = citiesNames[ind];
  cityUrl = citiesUrl[ind];
  lonLatUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityUrl}&appid=9dd86907fe501cec50da3d087e4e9dc0`;
  
  buildWebPage();
  // console.log(parent, ind, cityName, cityUrl);
});




// const getDatas = function(url) {
//   fetch(url)
//     .then(response => response.json())
//     // .then(data => console.log(data))
//     .then(({main: {temp}}) => console.log(temp - 273.15))
// };
// getDatas(anotherUrl);


// // XMLHttpRequest example
// const getDatas = (resource) => {
//   return new Promise((resolve, reject) => {
//     const request = new XMLHttpRequest();

//     request.addEventListener("readystatechange", function(e) {
//       if (request.readyState === 4) {
//         if (request.status === 200) {
//           const data = JSON.parse(request.responseText);
//           resolve(data);
//         } else {
//           reject("Datas was not found. Site was accessed!!!");
//         }
//       }
//     });

//     request.open("GET", API);

//     request.send();
//   });
// };

// getDatas(API)
//   .then(data => console.log(data))
//   .catch(err => console.log(err));




// // Fetch example
// fetch(API)
//   .then(response => response.json())
//   .then(data => console.log(data)) 
