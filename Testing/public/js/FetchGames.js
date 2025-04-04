// FetchGames.js

let storedGames = []; // Global array to store game data

// Function to fetch games data
async function fetchGames() {
    // const steamId = document.getElementById('steamID').value;
    const hoursPlayedValue = parseInt(document.getElementById('hoursPlayed').value, 10);

    // if (!steamId) {
    //     alert('Please enter your SteamID64.');
    //     return;
    // }

    try {
        const response = await fetch(`http://localhost:3000/api/games`);
        const data = await response.json();
        
        // Store game data in the global array, filtering by playtime
        storedGames = data.response.games
            .filter(game => game.playtime_forever / 60 < hoursPlayedValue) // Filter games
            .map(game => ({
                name: game.name,
                appid: game.appid,
                playtime: (game.playtime_forever / 60).toFixed(1) // Convert minutes to hours
            }));

        console.log('Stored Games:', storedGames); // Log the stored games for debugging

        // Display the games in a dynamic table
        displayGames();
    } catch (error) {
        console.error('Error fetching games data:', error);
    }
}

// TODO add fetchGameDetails() fetch and add game details to storedGames and the dynamic table


// TODO add filterGames() filter the storedGames array by additional user inputs and copy them to a clean filteredStoredGames array


// TODO edit displayGames() to only display a few games at a time picked at random from the filteredStoredGames array


// Function to display games in a dynamic table
function displayGames() {
    const gamesList = document.getElementById('gamesList');
    gamesList.innerHTML = ''; // Clear previous content

    if (storedGames.length === 0) {
        gamesList.textContent = 'No games to display.';
        return;
    }

    // Create a table
    const table = document.createElement('table');

    // Create table header
    const headerRow = document.createElement('tr');
    ['Name', 'App ID', 'Playtime (hours)'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Populate table rows with game data
    storedGames.forEach(game => {
        const row = document.createElement('tr');
        Object.values(game).forEach(value => {
            const td = document.createElement('td');
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
    document.getElementById('hoursPlayedValue').textContent = value;
}