require("dotenv").config();

const express = require('express');
const cors = require('cors');
const spotifyRoute = require("../api/routes/spotifyRoute");

const app = express();

app.use(cors());

// Route Spotify
app.use("/spotify", spotifyRoute);

app.listen(8888, () => {
    console.log('Server is running on port http://localhost:8888');
    console.log('Spotify access http://localhost:8888/spotify/login');
});