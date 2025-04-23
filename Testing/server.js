const express = require("express");
const session = require("express-session");
const SteamSignIn = require("steam-signin");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const apiKey = "7902896BCA5AE5A60C7CC073AE6E3883"; // API key *hide this from githib in config file later*

app.use(cors()); // Enable CORS
app.use(express.static("public")); // Handles requests to the html pages
app.use(session({
  secret: 'C<0TcVWd;dUg;^(tds]J5rj"GY<{w*', // random generated key
  resave: false,
  saveUninitialized: false
}))

const realm = 'http://localhost:3000' // Update to actual domain this when in production

const steamSignIn = new SteamSignIn(realm)

//Route to initiate Steam Authenication
app.get('/auth/steam', (req, res) => {
  const returnUrl = `${realm}/auth/steam/return`;
  const authUrl = steamSignIn.getUrl(returnUrl); // Get the Steam authentication URL
  console.log('Generated Steam Auth URL:', authUrl);
  res.redirect(authUrl); // Redirect user to Steam
});

// Route to handle the callback from Steam
app.get('/auth/steam/return', async (req, res) => {
  try {
    // Verify the login and get the user's SteamID
    const steamId = await steamSignIn.verifyLogin(req.url);
    const steamId64 = steamId.getSteamID64(); // Get the 64-bit SteamID

    // Store the SteamID in the session
    req.session.steamId = steamId64;

    // Redirect to a success page or homepage
    res.redirect('/APITest.html');
  } catch (error) {
    console.error('Authentication failed:', error);
    res.redirect('/login-failed'); // Redirect to an error page
  }
});

// Example login failed route
app.get('/login-failed', (req, res) => {
  res.send('Authentication failed. Please try again.');
});

// No longer needing to pass in steamId from query
app.get("/api/games", async (req, res) => {
  // const { steamid } = req.query;
  const steamid = req.session.steamId;

  if (!steamid) {
    res.status(400).send("Missing steamid parameter");
    return;
  }
  try {
    const response = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamid}&include_appinfo=1&format=json`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    res.json(json);
  } catch (error) {
    console.error("Error fetching games data:", error);
    res
      .status(500)
      .json({ error: `Error fetching games data: ${error.message}` });
  }
});

app.get('/api/gameDetails', async (req, res) => {
    const { appid } = req.query;

    if (!appid) {
        res.status(400).send('Missing appid parameter');
        return;
    }

    try {
        const response = await fetch(`http://store.steampowered.com/api/appdetails?appids=${appid}&format=json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        res.json(json);
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({ error: `Error fetching game details: ${error.message}` });
    }
});

app.get('/api/gameReviews', async (req, res) => {
    const { appid } = req.query;

    if (!appid) {
        res.status(400).send('Missing appid parameter');
        return;
    }

    try {
        const response = await fetch(`https://store.steampowered.com/appreviews/${appid}?json=1`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        res.json(json);
    } catch (error) {
        console.error('Error fetching game reviews:', error);
        res.status(500).json({ error: `Error fetching game reviews: ${error.message}` });
    }
});


//TODO DISPLAY PROFILE NAME IN HEADER https://developer.valvesoftware.com/wiki/Steam_Web_API#GetPlayerSummaries_.28v0002.29

app.get("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error logging out");
    } else{
      res.redirect("/landingPage.html"); // Redirect to home page after logout
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});