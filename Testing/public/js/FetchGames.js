// FetchGames.js

let storedGames = []; // Global array to store game data

// Fetch games data
async function fetchGames() {
  const hoursPlayedValue = parseInt(
    document.getElementById("hoursPlayed").value,
    10
  );
  const reviewScoreValue =
    parseInt(document.getElementById("reviewScore").value, 10) / 100; // Convert to decimal

  try {
    const response = await fetch(`http://localhost:3000/api/games`);
    const data = await response.json();

    // Store game data in the global array, filtering by playtime and review ratio
    storedGames = await Promise.all(
      (data.response.games || [])
        .filter((game) => game.playtime_forever / 60 < hoursPlayedValue) // Filter by playtime
        .map(async (game) => {
          const reviewRatio = await fetchGameReviews(game.appid); // Fetch review ratio

          if (reviewRatio >= reviewScoreValue) {
            const details = await fetchGameDetails(game.appid); // Fetch additional details

            if (details) { // Details are not null
              return {
                name: game.name,
                appid: game.appid,
                playtime: (game.playtime_forever / 60).toFixed(1), // Convert minutes to hours
                reviewRatio: reviewRatio,
                price: details.price,
                genres: details.genres,
              };
            }
          }
          return null; // Does not meet the criteria
        })
    );

    storedGames = storedGames.filter((game) => game !== null); // Remove null values from the array

    console.log("Stored Games:", storedGames); // Log the stored games array for debugging

    displayFullBacklog(); // Display the games in the full backlog table
  } catch (error) {
    console.error("Error fetching games data:", error);
  }
}

// Fetch game reviews
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
      return null; // Return null if the ratio is invalid
    }

    return ratio;
  } catch (error) {
    console.error("Error fetching game reviews:", error);
    return null;
  }
}

// Fetch game details (price and genres)
async function fetchGameDetails(appid) {
  if (!appid) {
    console.error("Missing appid parameter for fetching game details.");
    return null;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/gameDetails?appid=${appid}`);
    const data = await response.json();

    const appData = data[appid]?.data;
    if (!appData) {
      console.error(`No data found for appid: ${appid}`);
      return null;
    }

    const price = appData.price_overview?.final_formatted || "Free";
    const genres = appData.genres?.map((genre) => genre.description) || [];

    return { price, genres };
  } catch (error) {
    console.error("Error fetching game details:", error);
    return null;
  }
}

// TODO add filterGames() filter the storedGames array by user survey inputs and copy them to a clean filteredStoredGames array
function filterGames() {
  // Display initial reccomendations
  displayRecommendedBacklog();
}

// TODO add displayRecommendedBacklog() to only display a few games at a time picked at random from the filteredStoredGames array
function displayRecommendedBacklog() {
  // Display a few games picked at random from the filteredStoredGames array
}

// Display the full backlog
function displayFullBacklog() {
  const backlogStats = document.getElementById("backlogStats"); // Stats element
  const gamesList = document.getElementById("fullBacklog"); // Table element
  gamesList.innerHTML = ""; // Clear previous content

  if (storedGames.length === 0) {
    gamesList.textContent = "No games to display yet.";
    backlogStats.textContent = "0 Games | Total Price (MSRP): $0.00";
    return;
  }

  // Calculate total price
  const totalPrice = storedGames.reduce((sum, game) => {
    const price = parseFloat(game.price.replace(/[^0-9.-]+/g, "")) || 0; // Extract numeric value from price
    return sum + price;
  }, 0);

  // Update backlog stats
  backlogStats.textContent = `${storedGames.length} Games | Total Price (MSRP): $${totalPrice.toFixed(2)}`;

  // Create a table
  const table = document.createElement("table");

  // Create table header
  const headerRow = document.createElement("tr");
  ["Name", "Genres", "Price", "Playtime", "Rating"].forEach((headerText) => {
    const th = document.createElement("th");
    th.textContent = headerText;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);


  //TODO MAKE HEADERS CLICKABLE WITH SORTING https://www.w3schools.com/howto/howto_js_sort_table.asp 


  // name, genre, price, playtime, rating
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

    // Create a cell for the genres
    const genresCell = document.createElement("td");
    genresCell.textContent = game.genres.join(", "); //Separate genres with a comma
    row.appendChild(genresCell);

    // Create a cell for the price
    const priceCell = document.createElement("td");
    priceCell.textContent = game.price;
    row.appendChild(priceCell);

    // Create a cell for the playtime
    const playtimeCell = document.createElement("td");
    playtimeCell.textContent = game.playtime + " hrs";
    row.appendChild(playtimeCell);

    // Create a cell for the % Rating
    const reviewCell = document.createElement("td");
    reviewCell.textContent = Math.round(game.reviewRatio * 100) + "%"; // Convert to percentage and round
    row.appendChild(reviewCell);

    table.appendChild(row);
  });

  gamesList.appendChild(table);   // Append the table to the gamesList div
}

// Updates the displayed value of the hoursPlayed slider
function updateHoursPlayedValue(value) {
  document.getElementById("hoursPlayedValue").textContent = value;
}

// Updates the displayed value of the reviewScore slider
function updateReviewScoreValue(value) {
  document.getElementById("reviewScoreValue").textContent = value;
}
