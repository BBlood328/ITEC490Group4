// FetchGames.js

// Function to fetch games data
async function fetchGames() {
    const steamId = document.getElementById('steamID').value;

    if (!steamId) {
        alert('Please enter your Steam ID.');
        return;
    }

    try {
        // Doesn't work without user inputting a valid steamid64. Need to implement steam login* or find some method of conversion.
        //const response = await fetch(`http://localhost:3000/api/games?steamid=${steamId}`); 

        const response = await fetch(`http://localhost:3000/api/games?steamid=76561197998872013`); //brute force a valid steam id
        const data = await response.json();
        
        // Process the JSON data here
        console.log(data);
        
        // Extracting game names and playtime from the JSON
        const games = data.response.games;
        const gamesList = document.getElementById('gamesList');
        gamesList.innerHTML = ''; // Clear previous results
        for (let i = 0; i < games.length; i++) {
            const gameInstance = document.createElement('tr');
            const gameName = document.createElement('td');
            const gameRating = document.createElement('td');
            const gameRelease = document.createElement('td');
            const gamePlaytime = document.createElement('td');
            gameInstance.appendChild(gameName)
            gameInstance.appendChild(gameRating)
            gameInstance.appendChild(gameRelease)
            gameInstance.appendChild(gamePlaytime)
            gameName.textContent = `${games[i].name}`;
            gameRating.textContent = `TBD`;
            gameRelease.textContent = `TBD`;
            gamePlaytime.textContent = `${games[i].playtime_forever} minutes`;
            gamesList.appendChild(gameInstance);
        }
    } catch (error) {
        console.error('Error fetching games data:', error);
    }
}