const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const apiKey = "7902896BCA5AE5A60C7CC073AE6E3883"; // API key *hide this from githib in config file later*

app.use(cors()); // Enable CORS
app.use(express.static("public")); // Handles requests to the html pages

// https://www.npmjs.com/package/steam-signin implement later for steam login?

app.get("/api/games", async (req, res) => {
  const { steamid } = req.query;

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
        const response = await fetch(`http://store.steampowered.com/api/appdetails?appids=${appid}`);
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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
