"use strict";

const weekDays = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];
const monthDays = ["Dekabr", "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

const myApi = "c6997387f3559e448b61bb5aa1cf8e36";
const API = "bd5e378503939ddaee76f12ad7a97608";

const cityName = "Tashkent";
const lonLatUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=9dd86907fe501cec50da3d087e4e9dc0`;

const todayDate = document.querySelector(".weather--today");
const today = new Date();
const hour = today.getHours();

const temperatureNow = document.querySelector(".now--temperature");
const iconNow = document.querySelector(".now--icon");

const weatherHourly = document.querySelector(".weather__hourly");

// Build image with given icon format with proper url from openweathermap
const buildImage = function(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// Current temperature and features
const getTodayWeather = function(obj) {
  // console.log(obj);
  let {temp, weather: [{icon}]} = obj;  
  temp = Math.round(temp);
  temp = new Intl.NumberFormat(navigator.language, {style: "unit", unit: "celsius"}).format(temp);
  temperatureNow.textContent = temp;
  iconNow.setAttribute("src", buildImage(icon));
};

const getNextDayWeather = function(obj) {
  // console.log(obj);
  const {temp: {day}, weather: [{icon}]} = obj;
  console.log(day, icon);
};


const displayData = function(current, daily) {
  getTodayWeather(current);
  daily.forEach(day => getNextDayWeather(day));
};

const getDailyWeather = function(lat, lon) {
  // Getting today's and next days' datas
  fetch(`https://api.openweathermap.org/data/2.8/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=9dd86907fe501cec50da3d087e4e9dc0&units=metric&lang=ru`)
    .then(response => response.json())
    .then(({current, daily}) => displayData(current, daily))
};


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

const getHourlyWeather = function(lat, lon) {
  // Getting today's hourly datas
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API}&units=metric`)
    .then(response => response.json())
    .then(({hourly}) => hourly.slice(0, 8))
    .then(datas => {
      datas.forEach((data, ind) => {
        addHourlyData(data, ind);
      });
    })
};


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


const setToday = function() {
  // Configuring now date
  todayDate.textContent = `${weekDays[today.getDay() - 1]}, ${today.getDate()} - ${monthDays[today.getMonth() - 1]}`;
}
setToday();


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
