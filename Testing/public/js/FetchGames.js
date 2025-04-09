// FetchGames.js

let storedGames = []; // Global array to store game data

// Function to fetch games data
async function fetchGames() {
  // const steamId = document.getElementById('steamID').value;
  const hoursPlayedValue = parseInt(
    document.getElementById("hoursPlayed").value,
    10
  );

  // if (!steamId) {
  //     alert('Please enter your SteamID64.');
  //     return;
  // }

  try {
    const response = await fetch(`http://localhost:3000/api/games`);
    const data = await response.json();

    // Store game data in the global array, filtering by playtime
    storedGames = await Promise.all(
      data.response.games
        .filter((game) => game.playtime_forever / 60 < hoursPlayedValue) // Filter games
        .map(async (game) => {
          const reviewRatio = await fetchGameReviews(game.appid); // Fetch review ratio
          return {
            name: game.name,
            appid: game.appid,
            playtime: (game.playtime_forever / 60).toFixed(1), // Convert minutes to hours
            reviewRatio: reviewRatio || 0, // Default to 0 if no review data
          };
        })
    );

    console.log("Stored Games with Reviews:", storedGames); // Log the stored games for debugging

    // Display the games in a dynamic table
    displayFullBacklog();
  } catch (error) {
    console.error("Error fetching games data:", error);
  }
}

// Function to fetch game reviews
async function fetchGameReviews(appid) {
  if (!appid) {
    console.error("Missing appid parameter for fetching reviews.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/gameReviews?appid=${appid}`
    );
    const data = await response.json();

    const { total_positive, total_reviews } = data.query_summary;
    const ratio = total_positive / (total_reviews || 1); // Avoid division by zero
    if (ratio == 1 || ratio == 0) {
      return null; // Return null if the ratio is 1 or 0
    }

    return ratio; // Return the ratio
  } catch (error) {
    console.error("Error fetching game reviews:", error);
    return null;
  }
}

// TODO add fetchGameDetails() fetch and add game details to storedGames and the dynamic table

// TODO add filterGames() filter the storedGames array by user survey inputs and copy them to a clean filteredStoredGames array
function filterGames() {
  // Display initial reccomendations
  displayRecommendedBacklog();
}

// TODO add displayRecommendedBacklog() to only display a few games at a time picked at random from the filteredStoredGames array
function displayRecommendedBacklog() {
  // Display a few games picked at random from the filteredStoredGames array
}

// Function to display the full backlog
function displayFullBacklog() {
  const gamesList = document.getElementById("fullBacklog");
  gamesList.innerHTML = ""; // Clear previous content

  if (storedGames.length === 0) {
    gamesList.textContent = "No games to display yet.";
    return;
  }

  // Create a table
  const table = document.createElement("table");

  // Create table header
  const headerRow = document.createElement("tr");
  ["Name", "Playtime (hours)", "Rating (%)"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Populate table rows with game data
  storedGames.forEach((game) => {
    const row = document.createElement("tr");

    // Create a cell for the name with a link
    const nameCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = `https://store.steampowered.com/app/${game.appid}`;
    link.textContent = game.name;
    link.target = "_blank"; // Open link in a new tab
    nameCell.appendChild(link);
    row.appendChild(nameCell);

    // Create a cell for the playtime
    const playtimeCell = document.createElement("td");
    playtimeCell.textContent = game.playtime;
    row.appendChild(playtimeCell);

    // Create a cell for the % Rating
    const reviewCell = document.createElement("td");
    reviewCell.textContent = Math.round(game.reviewRatio * 100) + "%"; // Convert to percentage and round
    row.appendChild(reviewCell);

    table.appendChild(row);
  });

  // Append the table to the gamesList div
  gamesList.appendChild(table);
}

// Function to update the displayed value of the hoursPlayed slider
function updateHoursPlayedValue(value) {
  document.getElementById("hoursPlayedValue").textContent = value;
}
