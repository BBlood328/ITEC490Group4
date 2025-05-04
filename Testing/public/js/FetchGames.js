let storedGames = []; // Global array to store game data

// Fetch games data
async function fetchGames() {
  // disable fetch games button
  document.getElementById("fetch").disabled = true;
  displayLoadingSpinner();

  const hoursPlayedValue = parseInt(
    document.getElementById("hoursPlayed").value,
    10
  );
  const reviewScoreValue =
    parseInt(document.getElementById("reviewScore").value, 10) / 100; // Convert to decimal

  try {
    const response = await fetch(`/api/games`);
    const data = await response.json();

    // Store game data in the global array, filtering by playtime and review ratio
    storedGames = await Promise.all(
      (data.response.games || [])
        .filter((game) => game.playtime_forever / 60 < hoursPlayedValue) // Filter by playtime
        .map(async (game) => {
          const reviewRatio = await fetchGameReviews(game.appid);
          if (reviewRatio === null || reviewRatio < reviewScoreValue) {
            return null;
          } // Exclude games with invalid review ratio or a fetch error

          const details = await fetchGameDetails(game.appid);
          if (details == null) {
            return null; // Return null if details are not available
          } // Exclude games with invalid details or a fetch error

          return {
            name: game.name,
            appid: game.appid,
            playtime: (game.playtime_forever / 60).toFixed(1), // Convert minutes to hours
            reviewRatio: reviewRatio !== null ? reviewRatio : "N/A", // Use "N/A" if review ratio is unavailable
            price: details.price,
            genres: details.genres,
          };
        })
    );

    storedGames = storedGames.filter((game) => game !== null); // Remove null values from the array

    console.log("Stored Games:", storedGames); // Log the stored games array for debugging

    document.getElementById("fetch").disabled = false;
    displayFullBacklog(); // Display the games in the full backlog table
  } catch (error) {
    console.error("Error fetching games data:", error);
  }
}

// Fetch game reviews
async function fetchGameReviews(appid) {
  if (!appid) {
    console.error("Missing appid parameter for fetching reviews.");
    return null; // Return null if appid is missing
  }

  try {
    const response = await fetch(`/api/gameReviews?appid=${appid}`);
    if (!response.ok) {
      console.error(
        `HTTP error while fetching reviews for appid ${appid}: ${response.status}`
      );
      return null; // Return null if an HTTP error occurs
    }
    const data = await response.json();

    const { total_positive, total_reviews } = data.query_summary;
    const ratio = total_positive / (total_reviews || 1); // Avoid division by zero

    if (ratio == 1 || ratio == 0) {
      return null; // Return null if the ratio is invalid
    }

    return ratio;
  } catch (error) {
    console.error(`Error fetching game reviews for appid ${appid}:`, error);
    return null; // Return null if an exception occurs
  }
}

// Fetch game details (price and genres)
async function fetchGameDetails(appid) {
  if (!appid) {
    console.error("Missing appid parameter for fetching game details.");
    return { price: "Unknown", genres: ["Unknown"] }; // Default values if appid is missing
  }

  try {
    const response = await fetch(`/api/gameDetails?appid=${appid}`);
    if (!response.ok) {
      console.warn(
        `HTTP error while fetching details for appid ${appid}: ${response.status}`
      );
      return null;
    }
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
    console.error(`Error fetching game details for appid ${appid}:`, error);
    return null; // Default values if an exception occurs
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
  backlogStats.textContent = `${
    storedGames.length
  } Games | Total Price (MSRP): $${totalPrice.toFixed(2)}`;

  // Create a table
  const table = document.createElement("table");

  // Create table header
  const headerRow = document.createElement("tr");
  ["Name", "Genres", "Price", "Playtime", "Rating"].forEach(
    (headerText, index) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.style.cursor = "pointer";
      th.onclick = () => sortTable(index); // Add sorting functionality
      headerRow.appendChild(th);
    }
  );
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

    // Create a cell for the genres
    const genresCell = document.createElement("td");
    genresCell.textContent = game.genres.join(", "); // Separate genres with a comma
    row.appendChild(genresCell);

    // Create a cell for the price
    const priceCell = document.createElement("td");
    priceCell.textContent = game.price;
    row.appendChild(priceCell);

    // Create a cell for the playtime
    const playtimeCell = document.createElement("td");
    playtimeCell.textContent = game.playtime + "hrs";
    row.appendChild(playtimeCell);

    // Create a cell for the % Rating
    const reviewCell = document.createElement("td");
    reviewCell.textContent = Math.round(game.reviewRatio * 100) + "%"; // Convert to percentage and round
    row.appendChild(reviewCell);

    table.appendChild(row);
  });

  gamesList.appendChild(table); // Append the table to the gamesList div
}

// Sort the table by column index
function sortTable(columnIndex) {
  const table = document.querySelector("#fullBacklog table");
  const rows = Array.from(table.rows).slice(1); // Exclude header row

  const isNumericColumn =
    columnIndex === 2 || columnIndex === 3 || columnIndex === 4; // Price, Playtime, Rating
  const isAscending = table.dataset.sortOrder !== "asc";

  rows.sort((a, b) => {
    const cellA = a.cells[columnIndex].textContent.trim();
    const cellB = b.cells[columnIndex].textContent.trim();

    if (isNumericColumn) {
      const valueA =
        columnIndex === 2 && cellA === "Free"
          ? 0
          : parseFloat(cellA.replace(/[^0-9.-]+/g, ""));
      const valueB =
        columnIndex === 2 && cellB === "Free"
          ? 0
          : parseFloat(cellB.replace(/[^0-9.-]+/g, ""));
      return isAscending ? valueA - valueB : valueB - valueA;
    } else {
      return isAscending
        ? cellA.localeCompare(cellB)
        : cellB.localeCompare(cellA);
    }
  });

  rows.forEach((row) => table.appendChild(row)); // Re-append rows in sorted order
  table.dataset.sortOrder = isAscending ? "asc" : "desc"; // Toggle sort order
}

// Fetch player profile and update header
async function updatePlayerProfile() {
  try {
    const response = await fetch("/api/playerSummary", {
      credentials: "include", // IMPORTANT: include cookies in requests
    });
    const data = await response.json();

    const player = data.response.players[0];
    if (player) {
      const avatar = document.getElementById("playerAvatar");
      const personaName = document.getElementById("playerName");

      avatar.src = player.avatarfull;
      personaName.textContent = ` ${player.personaname}`;
    }
  } catch (error) {
    console.error("Error fetching player profile:", error);
  }
}
updatePlayerProfile(); // Call the function on login

// Updates the displayed value of the hoursPlayed slider
function updateHoursPlayedValue(value) {
  document.getElementById("hoursPlayedValue").textContent = value;
}

// Updates the displayed value of the reviewScore slider
function updateReviewScoreValue(value) {
  document.getElementById("reviewScoreValue").textContent = value;
}

function displayLoadingSpinner() {
  // 3 bars loader
  document.getElementById("fullBacklog").innerHTML =
    '<div class="lds-bars"><div></div><div></div><div></div></div>';
}
