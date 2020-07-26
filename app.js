// Author:Mitisha Gangwal
// api key : 6b4711b7f82057e9646f35acea87900d

// SELECT ELEMENTS
const iconElement = document.querySelector(".weather-icon");
const tempElement = document.querySelector(".temperature-value p");
const descElement = document.querySelector(".temperature-description p");
const locationElement = document.querySelector(".location p");
const notificationElement = document.querySelector(".notification");
const dateElement = document.querySelector(".date-value");
const forecastIconElement = document.querySelector(".rain-icon");
const forecastDescElement = document.querySelector(".rain-description p");
var searchbutton = document.querySelector(".searchButton");
var inputVal = document.querySelector(".inputValue");
var myLineChart;

// App data
const weather = {};
const forecastChartData = {
    chart: null,
    //city: "",
    dates: [],
    //temps: [],
	rain: [],
	weather: [],
	probability: [],
	//probabilityText: [],
    loading: false,
    errored: false
  }
  
 const hourlyData = {};
 
weather.temperature = {
    unit : "celsius"
}

// APP CONSTS AND VARS
const KELVIN = 273;
// API KEY GENERATED FROM OPENWEATHER MAP 
const key = "6b4711b7f82057e9646f35acea87900d";

// CHECK IF BROWSER SUPPORTS GEOLOCATION
if('geolocation' in navigator){
	handlePermission();
}else{
    notificationElement.style.display = "block";
    notificationElement.innerHTML = "<p>Browser doesn't Support Geolocation</p>";
}

function handlePermission() {
  navigator.permissions.query({name:'geolocation'}).then(function(result) {
    if (result.state == 'granted') {
      report(result.state);
	  navigator.geolocation.getCurrentPosition(setPosition,showError,geoSettings);
    } else if (result.state == 'prompt') {
      report(result.state);
      navigator.geolocation.getCurrentPosition(setPosition,showError,geoSettings);
    } else if (result.state == 'denied') {
      report(result.state);
    }
    result.onchange = function() {
      report(result.state);
    }
  });
}

function report(state) {
  console.log('Permission ' + state);
}

var geoSettings = {
  enableHighAccuracy: false,
  maximumAge        : 30000,
  timeout           : 20000
};

//GET WEATHER INFORMATION BASED ON THE CITY NAME
function getWeatherForCity(){
	//fetch the longitude and latitude of the city based on city name 
	let api = `https://api.openweathermap.org/data/2.5/find?q=`+inputVal.value+`&appid=${key}&units=metric`;
    
    fetch(api)
		.then(function(response){
			data = response.json();
			return data;
		}).then(function(data){
			this.latitude = data.list[0].coord.lat;
			this.longitude = data.list[0].coord.lon;
	
	//call the method to fetch the rain forecast information 
	getRainForecast(this.latitude, this.longitude);
	
	//call the method to call the current weather information 
	getWeather(this.latitude,this.longitude);
		})
		.catch(err => alert("Wrong City Name!!"));
	
}
// SET USER'S POSITION
function setPosition(position){
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
	
    //call the method to fetch the rain forecast information 
    getRainForecast(latitude, longitude);
	
	//call the method to call the current weather information
	getWeather(latitude,longitude);
}

// SHOW ERROR WHEN THERE IS AN ISSUE WITH GEOLOCATION SERVICE
function showError(error){
    notificationElement.style.display = "block";
    notificationElement.innerHTML = `<p> ${error.message} </p>`;
}


// GET WEATHER FROM API PROVIDER
function getRainForecast(latitude, longitude){
    let api = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&appid=${key}`;
    
    fetch(api)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
			weather.forecasticonId = data.daily[0].weather[0].icon;
			weather.forecastdescription = data.daily[0].weather[0].description;
			
			//Prepare data for creating the chart of rain probability 
			forecastChartData.dates = data.hourly.map(list=> {return list.dt;});
			//forecastChartData.temps = data.hourly.map(list=> {return list.temp;});
			forecastChartData.rain = data.hourly.map(list=> {return list.rain ? list.rain["1h"] : 0;});
			//forecastChartData.probabilityText = data.hourly.map(list=> {return Math.round(100 * list.pop) + "%";});
			forecastChartData.probability = data.hourly.map(list=> {return Math.round(100 * list.pop);});
			forecastChartData.weather = data.hourly.map(list=> {return list.weather[0].description;});
			// hourlyData = data.hourly;
			plotChart();
			
        })
        .then(function(){
            displayRainForeCast();
        });
}

//CREATE THE X LABEL FOR CHART - HOURS
 function getlabelsData() {
                    for (var t = forecastChartData.dates, e = [], n = 0; n < 24; n++) {
                        var a = void 0;
						0 === n ? a = "now" : a= "now + " + n + "H";
						e.push(a)
                    }
                    return e
                }

//CREATE CHART OF RAIN PROBABILTY AND RAIN DESCRIPTION
function plotChart(){
	
	var labelsData = getlabelsData();
	var labels = [];
	var label2 = [];
	
	//since the API returns 48 , we use the aplice method to get the first 24 weather details 
	labels = forecastChartData.weather.splice(0,24);
	label2 = forecastChartData.rain.splice(0,24);
	
	//fetch the unique value to get the label for the chart 
	var uniqLabel = [...new Set(labels)];
	var rainLabel = [...new Set(label2)];
	
	var options = {
  type: 'bar',
  data: {
    labels: labelsData,//forecastChartData.dates,
    datasets: [
	    {
			borderColor: "aqua",
			//backgroundColor: "aqua",
			label: 'Probability in %',
			data: forecastChartData.probability,
			borderWidth: 1,
			yAxisID: 'Probability',
			order:2
    	},		
	    {
			borderColor: "blue",
			label: 'Rain(mm)',
			data: label2,//temp1,
			borderWidth: 1,
			type: 'line',
			yAxisID: 'Rainy',
			order: 1
    	}
		]
  },
  options: {
  	scales: {
    	yAxes: [{
			id: 'Probability',
			scaleLabel: { labelString: 'Rain Probability in %',display: true},
			gridLines: {zeroLineColor: "#78CBBF", zeroLineWidth:2, display: false},
			label: 'Probability',
			type: 'linear',
			ticks: { min: 0, beginAtZero: true, max: 100, stepSize: 10, fontcolor: "blue"}
      },{
			id: 'Rainy',
			//ticks: { min: temp1[0], beginAtZero: true, max: temp1[23], fontcolor: "blue"},
			scaleLabel: { labelString: 'Rain Vol in mm/h',display: true},
			gridLines: {zeroLineColor: "#78CBBF", zeroLineWidth:2},
			label: 'Rainfall',
			//labels: rainLabel,
			type: 'linear',
			ticks: { min: 0, beginAtZero: true, fontcolor: "blue"},
			position: 'right'
      }]
    }/*,
	tooltips: {
		enabled: false
	}*/
  }
}

//Display the chart on UI 
var ctx = document.getElementById('myChart').getContext('2d');

if (myLineChart !== undefined){myLineChart.destroy();}
myLineChart = new Chart(ctx, options);
}

// GET WEATHER FROM API PROVIDER
function getWeather(latitude, longitude){
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
    
    fetch(api)
        .then(function(response){
            let data = response.json();
            return data;
        })
        .then(function(data){
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
        })
        .then(function(){
            displayWeather();
        });
}

// DISPLAY WEATHER TO UI
function displayRainForeCast(){
	var d = new Date();
	dateElement.innerHTML = d.toUTCString();
	forecastIconElement.innerHTML = `<img src="icons/${weather.forecasticonId}.png"/>`;
	forecastDescElement.innerHTML = weather.forecastdescription;
	
}

// DISPLAY WEATHER TO UI
function displayWeather(){
    iconElement.innerHTML = `<img src="icons/${weather.iconId}.png"/>`;
    tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
		
}

// C to F conversion
function celsiusToFahrenheit(temperature){
    return (temperature * 9/5) + 32;
}

//WHEN THE USER CLICKS ON THE SEARCH BUTTON 
searchbutton.addEventListener("click", function(){
	getWeatherForCity();
	notificationElement.style.display = "none";
})
inputVal.addEventListener("keyup", function(keyEvent){
	if (keyEvent.keyCode === 13) {
    keyEvent.preventDefault();
    searchbutton.click();
  }
})

// WHEN THE USER CLICKS ON THE TEMPERATURE ELEMENET
tempElement.addEventListener("click", function(){
    if(weather.temperature.value === undefined) return;
    
    if(weather.temperature.unit == "celsius"){
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        
        tempElement.innerHTML = `${fahrenheit}°<span>F</span>`;
        weather.temperature.unit = "fahrenheit";
    }else{
        tempElement.innerHTML = `${weather.temperature.value}°<span>C</span>`;
        weather.temperature.unit = "celsius"
    }
});

