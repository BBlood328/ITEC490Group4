// FetchGames.js

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
        console.log('Steam User data: ', data);
        
        // Extracting game names and playtime from the JSON
        const games = data.response.games;
        const gamesList = document.getElementById('gamesList');
        gamesList.innerHTML = ''; // Clear previous results
        if (!games) {
            const emptyStateELement = document.createElement("p");
            emptyStateELement.textContent = 'No games found from your steam account, time to get some games bud.'; 
            gamesList.appendChild(emptyStateELement);
        } else {
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
        }
        
    } catch (error) {
        console.error('Error fetching games data:', error);
    }
}