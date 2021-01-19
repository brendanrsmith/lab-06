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
app.get('/', (req, res) => {
    res.send(`<h1>This server is running on PORT ${PORT}</h1>`);
});

app.get('/location', (req, res) => {
    
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

// ==== Helper functions ====
function Location(search_query, formatted_query, latitude, longitude) {
    this.search_query = search_query;
    this.formatted_query = formatted_query;
    this.longitude = longitude;
    this.latitude = latitude;
}

// ==== Start the server ====
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));