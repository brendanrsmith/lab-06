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
    res.send('server is running!')
});

// ==== Helper functions ====


// ==== Start the server ====
app.listen(PORT, () => console.log(`we are up on PORT ${PORT}`));