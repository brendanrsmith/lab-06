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
    // Normalize data with Location constructor
        // const dataArrayFromJsonLocation = require('./data/location.json'); // Gets loc data from JSON location file

    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
    superagent.get(url)
        .then(result => {

            const dataFromJsonLocation = result.body[0]; // 

            // data from client 
            console.log('req.query', req.query);
            console.log(result.body);
            const searchedLocation = new Location(
                searchedCity,
                dataFromJsonLocation.display_name,
                dataFromJsonLocation.lon,
                dataFromJsonLocation.lat
            );
            res.send(searchedLocation);
        })
        .catch(error => {
            res.status(500).send('LocationIQ Failed');
            console.log(error.message);
        });

});

//      /weather
app.get('/weather', (req, res) => {

    // get weather data from json file
    const weatherData = require('./data/weather.json');

    // return new weather object 
    const newWeather = weatherData.data.map(weatherObj => {
        return new Weather(weatherObj);
    });
    // const arr = [];
    // weatherData.data.forEach(weatherObj => {
    //     const newWeather = new Weather(weatherObj);
    //     arr.push(newWeather);
    // })
    res.send(newWeather);

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