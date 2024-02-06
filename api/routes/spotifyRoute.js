const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const request = require("request");
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

router.get("/login", (req, res) => {
  const state = generateRandomString(16);
  const scope = "user-read-private user-read-email";
  console.log(clientId)

  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: "code",
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state,
    })}`
  );
});

router.get("/callback", (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;

  if (state === null) {
    res.redirect(`/#${querystring.stringify({ error: "state_mismatch" })}`);
  } else {
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      form: {
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: "authorization_code",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      json: true,
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const access_token = body.access_token;
        const refresh_token = body.refresh_token;

        res.cookie("access_token", access_token, { httpOnly: true });
        res.cookie("refresh_token", refresh_token, { httpOnly: true });

        res.send({ access_token: access_token, refresh_token: refresh_token });
      } else {
        res.redirect(`/#${querystring.stringify({ error: "invalid_token" })}`);
      }
    });
  }
});

router.get("/tracks/:playlistId", async (req, res) => {
  try {
    // Obtain an access token using the Client Credentials flow
    const tokenResponse = await getToken();
    const accessToken = tokenResponse.access_token;

    const playlist_id = req.params.playlistId;

    console.log(playlist_id);
    console.log(accessToken);

    const options = {
      url: `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      headers: { Authorization: `Bearer ${accessToken}` },
      json: true,
    };

    request.get(options, (error, response, playlistTracks) => {
      if (error || response.statusCode !== 200) {
        return res
          .status(500)
          .send("Internal Server Error: Failed to get playlist tracks");
      }

      // Count the number of tracks

      // Select the relevant information
      const simplifiedTracks = playlistTracks.items.reduce(function (
        tracks,
        item
      ) {
        const track = item.track;
        const previewUrl = track.preview_url;

        // Vérifie si previewUrl est défini et non nul
        if (previewUrl) {
          tracks.push({
            title: track.name,
            author: track.artists[0].name,
            preview_url: previewUrl,
            imageUrl:
              track.album.images && track.album.images.length > 0
                ? track.album.images[0].url
                : null,
          });
        }

        return tracks;
      },
      []);

      const trackCount = simplifiedTracks.length;

      // Shuffle the tracks randomly using Fisher-Yates algorithm
      for (let i = trackCount - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [simplifiedTracks[i], simplifiedTracks[j]] = [
          simplifiedTracks[j],
          simplifiedTracks[i],
        ];
      }

      // Modify the response object to include count and tracks with image URLs
      const responseObj = {
        trackCount,
        tracks: simplifiedTracks,
      };

      // Sending back the modified data
      res.json(responseObj);
    });
  } catch (error) {
    console.error("Error getting Spotify access token:", error);
    res
      .status(500)
      .send("Internal Server Error: Failed to obtain access token");
  }
});

// Function to obtain an access token using the Client Credentials flow
async function getToken() {
  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      grant_type: "client_credentials",
    },
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    json: true,
  };

  return new Promise((resolve, reject) => {
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        resolve(body);
      } else {
        reject(error || body);
      }
    });
  });
}

module.exports = router;