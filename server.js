'use strict';

// ==== packages ====
const express = require('express'); // implies express has been downloaded 
const cors = require('cors'); //Cross origin Resource Sharing (this week only)
const superagent = require('superagent'); // Implies superagent has been installed
require('dotenv').config(); // runs once and loads all the environment variables if they were declared in a file
const pg = require('pg');


// ==== setup the application ====
const app = express(); //creates a server from express library
app.use(cors()); // loads middleware cors


// ==== other global variables ====
const PORT = process.env.PORT || 3111;
const DATABASE_URL = process.env.DATABASE_URL; // postgre url
const client = new pg.Client(DATABASE_URL); 
client.on('error', (error) => console.log(error));

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
            res.status(500).send('LocationIQ api Failed');
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
    // const url = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${key}`;
    const url = `https://api.weatherbit.io/v2.0/forecast/hourly?lat=${latitude}&lon=${longitude}&hours=24&key=${key}&units=I`;
    superagent.get(url)
        .then(result => {
            // create new weather object 
            const newWeather = result.body.data.map(weatherObj => {
                return new Weather(weatherObj);
            });
            // return new weather object 
            res.send(newWeather);
        })
        // error handling
        .catch(error => {
            res.status(500).send('weatherbit api Failed');
            console.log(error.message);
        });
});

//      /parks
app.get('/parks', (req, res) => {

    const key = process.env.PARKS_API_KEY;
    const city = req.query.search_query;

    // get parks data from api
    const url = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${key}`;
    superagent.get(url)
        .then(result => {
            // create new parks object
            const newPark = result.body.data.map(parkObj => {
                return new Park(parkObj);
            }) ;
            // send new park object
            res.send(newPark);
        })
        // error handling
        .catch(error => {
            res.status(500).send('Parks api Failed');
            console.log(error.message);
        });        
})

// ==== Helper functions ====

function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.longitude = longitude;
    this.latitude = latitude;
} 

function Weather(jsonObj){
    this.forecast = `${jsonObj.weather.description} and ${jsonObj.temp}ºF with winds of ${jsonObj.wind_spd} mph`;
    this.time = jsonObj.datetime;
}

function Park(parkObj){
    this.park_url = parkObj.url;
    this.name = parkObj.fullName;
    this.address = `${parkObj.addresses[0].line1} ${parkObj.addresses[0].city}, ${parkObj.addresses[0].stateCode} ${parkObj.addresses[0].postalCode}`;
    this.fee = '$' + parkObj.entranceFees[0].cost;
    this.description = parkObj.description;
}

// ==== Start the server ====
client.connect()
.then ( () => {
    app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`)); // Starts up server
}); // Starts connection to postgres 
