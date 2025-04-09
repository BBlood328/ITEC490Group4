// FetchGames.js

let storedGames = []; // Global array to store game data

// Function to fetch games data
async function fetchGames() {
  // * Don't need these code
  // const steamId = document.getElementById('steamID').value;

  // if (!steamId) {
  //     alert('Please enter your Steam ID.');
  //     return;
  // }

  try {
    const response = await fetch(`http://localhost:3000/api/games`);
    const data = await response.json();

    // Process the JSON data here
    console.log("Steam User data: ", data);

    // Extracting game names and playtime from the JSON
    const games = data.response.games;
    const gamesList = document.getElementById("gamesList");
    gamesList.innerHTML = ""; // Clear previous results
    if (!games) {
      const emptyStateELement = document.createElement("p");
      emptyStateELement.textContent =
        "No games found from your steam account, time to get some games bud.";
      gamesList.appendChild(emptyStateELement);
    } else {
      for (let i = 0; i < games.length; i++) {
        const gameInstance = document.createElement("tr");
        const gameName = document.createElement("td");
        const gameRating = document.createElement("td");
        const gameRelease = document.createElement("td");
        const gamePlaytime = document.createElement("td");
        gameInstance.appendChild(gameName);
        gameInstance.appendChild(gameRating);
        gameInstance.appendChild(gameRelease);
        gameInstance.appendChild(gamePlaytime);
        gameName.textContent = `${games[i].name}`;
        gameRating.textContent = `TBD`;
        gameRelease.textContent = `TBD`;
        gamePlaytime.textContent = `${games[i].playtime_forever} minutes`;
        gamesList.appendChild(gameInstance);
      }
    }
  } catch (error) {
    console.error("Error fetching games data:", error);
  }
}

// TODO add fetchGameDetails() fetch and add game details to storedGames and the dynamic table

// TODO add filterGames() filter the storedGames array by additional user inputs and copy them to a clean filteredStoredGames array

// TODO edit displayGames() to only display a few games at a time picked at random from the filteredStoredGames array

// Function to display games in a dynamic table
function displayGames() {
  const gamesList = document.getElementById("gamesList");
  gamesList.innerHTML = ""; // Clear previous content

  if (storedGames.length === 0) {
    gamesList.textContent = "No games to display.";
    return;
  }

  // Create a table
  const table = document.createElement("table");

  // Create table header
  const headerRow = document.createElement("tr");
  ["Name", "App ID", "Playtime (hours)"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Populate table rows with game data
  storedGames.forEach((game) => {
    const row = document.createElement("tr");
    Object.values(game).forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  // Append the table to the gamesList div
  gamesList.appendChild(table);
}

// Function to update the displayed value of the hoursPlayed slider
function updateHoursPlayedValue(value) {
  document.getElementById("hoursPlayedValue").textContent = value;
}
