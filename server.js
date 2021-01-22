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
    
    // User input
    const searchedCity = req.query.city;

    // check for bad query
    if(! req.query.city){
        res.status(500).send('Sorry, something went wrong');
        return;
    }
    // dummy data to sql server:

    // Query SQL db for searchedCity 
    const sqlQuery = `SELECT * FROM location WHERE search_query=$1`;
    const sqlArray = [searchedCity]; // searchedCity
    
    client.query(sqlQuery, sqlArray).then(result => {

        // If searchedCity already in db, return that entry
        if (result.rows.length >= 1) {
            res.send(result.rows[0]);
            console.log(`found: ${searchedCity}`);

        //  Else, run api request and add new city data to sql database, then return that data to client
        } else {
            console.log(`${searchedCity} not found`);

            // query API for searchedCity location data
            const key = process.env.GEOCODE_API_KEY;
            const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${searchedCity}&format=json`;
            superagent.get(url)
                .then(result => {
        
                    // pull data from returned json object
                    const dataFromJsonLocation = result.body[0]; // same as lab-06, replaced with result.body[0] from superagent request
                    
                    // Normalize data with Location constructor
                    const searchedLocation = new Location(
                        searchedCity,
                        dataFromJsonLocation.display_name,
                        dataFromJsonLocation.lat,
                        dataFromJsonLocation.lon
                    );
                    // Add new searchedLocation to SQL locations db
                    const newLocationQuery = `INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)`;
                    const newLocationArray = [searchedLocation.search_query, searchedLocation.formatted_query, searchedLocation.latitude, searchedLocation.longitude];
                    client.query(newLocationQuery, newLocationArray);
                    console.log(`added city ${searchedCity}`);
                
                    // send location object to client
                    res.send(searchedLocation);
                })
                // error handling
                .catch(error => {
                    res.status(500).send('LocationIQ api Failed');
                    console.log(error.message);
                });
        }
    });

});

//      /weather
app.get('/weather', (req, res) => {

    const key = process.env.WEATHER_API_KEY;
    // lat/long coming out transposed from front-end???
    const latitude = req.query.latitude;
    const longitude = req.query.longitude;

    // get weather data from api
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&days=8&key=${key}&units=I`;
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

//      /movies
app.get('/movies', (req, res) => {

    const key = process.env.MOVIE_API_KEY;
    const city = req.query.search_query;

    // query movie db with superagent
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&language=en-US&query=${city}&page=1&include_adult=false`;
    superagent.get(url)
        .then(result => {
            // create new movie object
            console.log(result.body);
            // const newMovie = result.body 

            // send new movie object
        })
        // error handling
        .catch(error => {
            res.status(500).send('Movies api Failed');
            console.log(error.message);
        });                
})

// ==== Helper functions ====

function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.latitude = latitude;
    this.longitude = longitude;
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
client.connect() // Starts connection to postgres 
.then ( () => {
    app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`)); // Starts up server
});
