'use strict';

// ==== packages ====
const express = require('express'); // implies express has been downloaded 
const cors = require('cors'); //Cross origin Resource Sharing (this week only)
const superagent = require('superagent'); // Implies superagent has been installed
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
    
    const key = process.env.GEOCODE_API_KEY;
    const searchedCity = req.query.city;

    // check for bad query
    if(! req.query.city){
        res.status(500).send('Sorry, something went wrong');
        return;
    }

    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
    superagent.get(url)
        .then(result => {

            // pull data from returned json object
            const dataFromJsonLocation = result.body[0]; // same as lab-06, replaced with result.body[0] from superagent request
            
            // Normalize data with Location constructor
            const searchedLocation = new Location(
                searchedCity,
                dataFromJsonLocation.display_name,
                dataFromJsonLocation.lon,
                dataFromJsonLocation.lat
            );
            // send location object to client
            res.send(searchedLocation);
        })
        // error handling
        .catch(error => {
            res.status(500).send('LocationIQ Failed');
            console.log(error.message);
        });

});

//      /weather
app.get('/weather', (req, res) => {

    const key = process.env.WEATHER_API_KEY;
    // lat/long coming out transposed from front-end???
    const longitude = req.query.latitude;
    const latitude = req.query.longitude;

    // get weather data from api
    const url = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${key}`;
    superagent.get(url)
        .then(result => {
            console.log(result.body.data);
            // create new weather object 
            const newWeather = result.body.data.map(weatherObj => {
                return new Weather(weatherObj);
            });
            // return new weather object 
            res.send(newWeather);
        })
        // error handling
        .catch(error => {
            res.status(500).send('weatherbit Failed');
            console.log(error.message);
        });
    

});

// ==== Helper functions ====

function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.longitude = longitude;
    this.latitude = latitude;
} 

function Weather(jsonObj){
    this.forecast = jsonObj.weather.description; //Check syntax here***
    this.time = jsonObj.valid_date;
}

// ==== Start the server ====
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));