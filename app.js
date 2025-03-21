// Set the cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};`;
}

// Get cookie information
function getCookie(name) {
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name + "=") == 0) {
            return cookie.substring(name.length + 1);
        }
    }
    return "";
}

// Function to save the users name
function saveUserData(event) {
    event.preventDefault();
    let name = document.getElementById("name").value.trim();

    if (name) {
        setCookie("username", name, 365);

        // Create a unique session id
        let sessionId = generateSessionId();
        setCookie("sessionId", sessionId, 365);

        displayTreasureHunts();

        document.getElementById("login-form").style.display = 'none';
        document.getElementById("treasure-hunts-list").style.display = 'block';
    } else {
        alert("Please enter your name.");
    }
}

// Generate random session ID
function generateSessionId() {
    return 'session-' + Math.random().toString(36).slice(2);
}

// Populate the form with the last used name
function useLastCredentials() {
    let name = getCookie("username");

    if (name) {
        document.getElementById("name").value = name;
        document.getElementById("savedData").innerText = "Loaded last used name.";
    } else {
        alert("No saved name found.");
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        document.getElementById("error-message").innerText = "Failed to fetch data.";
        return null;
    }
}

// Retrieve the available treasure hunts
async function getAvailableTreasureHunts(numberOfHunts = 10) {
    const url = `https://codecyprus.org/th/api/list`;
    const data = await fetchData(url);
    return data;
}

// Display available treasure hunts
async function displayTreasureHunts() {
    const hunts = await getAvailableTreasureHunts();
    const huntsList = document.getElementById('treasure-hunts-list');
    huntsList.innerHTML = '';

    if (hunts && hunts.treasureHunts && hunts.treasureHunts.length > 0) {
        hunts.treasureHunts.forEach(hunt => {
            const huntItem = document.createElement('div');
            huntItem.className = 'hunt-item';
            huntItem.innerHTML = `
                <h3>${hunt.name}</h3>
                <p>${hunt.description}</p>
                <p><strong>Visibility:</strong> ${hunt.visibility}</p>
                <button onclick="selectHunt('${hunt.uuid}')">Start Hunt</button>
            `;
            huntsList.appendChild(huntItem);
        });
    } else {
        huntsList.innerHTML = '<p>No hunts available right now.</p>';
    }
}

async function selectHunt(huntId) {
    let playerName = getCookie("username");
    if (!playerName) {
        alert("You must be logged in to start a hunt.");
        return;
    }

    // Ensure the player name is unique
    playerName = playerName + "_" + new Date().getTime();

    setCookie("sessionId", "", -1);

    const appName = "TreasureHunt";

    const sessionId = await startTreasureHunt(playerName, appName, huntId);
    if (sessionId) {
        window.location.href = "questions.html";
    }
}
document.getElementById('showLeaderboardBtn').addEventListener('click', function() {
    const sessionId = "ag9nfmNvZGVjeXBydXNvcmdyFAsSB1Nlc3Npb24YgICAotzxuwkM";
    fetch(`https://codecyprus.org/th/api/leaderboard?session=${sessionId}&sorted&limit=10`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                displayLeaderboard(data.leaderboard);
            } else {
                console.error('Error fetching leaderboard:', data.errorMessages);
            }
        })
        .catch(error => console.error('Fetch error:', error));
});

function displayLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboardContainer');
    container.innerHTML = '';  // Clear previous results
    const list = document.createElement('ol');

    leaderboard.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.player}: ${entry.score} points`;
        list.appendChild(listItem);
    });

    container.appendChild(list);
}


async function startTreasureHunt(playerName, appName, huntId) {
    const url = `https://codecyprus.org/th/api/start?player=${playerName}&app=${appName}&treasure-hunt-id=${huntId}`;

    const response = await fetchData(url);

    if (response && response.status === "OK") {
        alert(`Hunt started!, Number of Questions: ${response.numOfQuestions}`);
        setCookie("sessionId", response.session, 365);
        return response.session;
    }
}

function returnToIndex() {
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form")?.addEventListener("submit", saveUserData);
    document.getElementById("use-last-credentials")?.addEventListener("click", useLastCredentials);
    document.getElementById("return-to-index")?.addEventListener("click", returnToIndex);

});
