'use strict';

// ==== packages ====
const express = require('express'); // implies express has been downloaded 
const cors = require('cors'); //Cross origin Resource Sharing (this week only)
const { response } = require('express');
require('dotenv').config(); // runs once and loads all the environment variables if they were declared in a file


// ==== setup the application ====
const app = express(); //creates a server from express library
app.use(cors()); // loads middleware cors


// ==== other global variables ====
const PORT = process.env.PORT || 3111;


// ==== Routes ====

//       /home
app.get('/', (req, res) => {
    res.send(`<h1>This server is running on PORT ${PORT}</h1>`);
});

//       /location
app.get('/location', (req, res) => {
    
    // check for bad query
    if(! req.query.city){
        res.status(500).send('Sorry, something went wrong');
        return;
    }
    // Normalize data with Location constructor
    const dataArrayFromJsonLocation = require('./data/location.json'); // Gets loc data from JSON location file
    const dataFromJsonLocation = dataArrayFromJsonLocation[0];

    // data from client 
    console.log('req.query', req.query);
    const searchedCity = req.query.city;

    const searchedLocation = new Location(
        searchedCity,
        dataFromJsonLocation.display_name,
        dataFromJsonLocation.lon,
        dataFromJsonLocation.lat
    );
    res.send(searchedLocation);
});

//      /weather
app.get('/weather', (req, res) => {

    // dummy weather data
    const weatherData = require('./data/weather.json');
    // const dummyWeatherData = [
    //     {
    //       "forecast": "Partly cloudy until afternoon.",
    //       "time": "Mon Jan 01 2001"
    //     },
    //     {
    //       "forecast": "Mostly cloudy in the morning.",
    //       "time": "Tue Jan 02 2001"
    //     },
    //   ]

    // return new weather object 
    const arr = [];
    weatherData.data.forEach(jsonObj => {
        const newWeather = new Weather(jsonObj);
    })
    // dummyWeatherData.forEach(jsonObj => {
    //     const weather = new Weather(jsonObj);
    //     arr.push(weather);
    // })

    res.send(arr);
});

// ==== Helper functions ====

function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.longitude = longitude;
    this.latitude = latitude;
}

function Weather(jsonObj){
    this.forecast = jsonObj.data.weather.description; //Check syntax here***
    this.time = jsonObj.data.valid_date;
}

// ==== Start the server ====
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));