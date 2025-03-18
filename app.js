// Set the cookie
function setCookie(name, value, days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
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
// Function to save the users data
function saveUserData(event) {
    event.preventDefault();
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;

    if (name && email) {
        setCookie("username", name, 365);
        setCookie("useremail", email, 365);

        // Create and set a unique session ID
        let sessionId = generateSessionId();
        setCookie("sessionId", sessionId, 365);

        getUserLocation();
        displayTreasureHunts();

        document.getElementById("login-form").style.display = 'none';
        document.getElementById("treasure-hunts-list").style.display = 'block';
    } else {
        alert("Please enter both name and email.");
    }
}
// Generate users random session id
function generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 9);
}


//Function to auto login if users information are saved
function autoLogin() {
    let name = getCookie("username");
    let email = getCookie("useremail");
    let sessionId = getCookie("sessionId");

    if (name && email && sessionId) {
        document.getElementById("name").value = name;
        document.getElementById("email").value = email;
        document.getElementById("savedData").innerHTML = "Auto-logged in as " + name + "!";
        getUserLocation();
        displayTreasureHunts();

        document.getElementById("login-form").style.display = 'none';
        document.getElementById("treasure-hunts-list").style.display = 'block';
    } else {
        alert("No saved login found. Please enter your details.");
    }
}

//Get the user location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                checkLocationAnswer(latitude, longitude);
            },
            function (error) {
                alert("Could not retrieve location.");
            },
            {
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    } else {
        alert("Geolocation is not supported.");
    }
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data.', error);
        document.getElementById("error-message").innerText = "Failed to fetch data.";
        return null;
    }
}

//Function to retrieve the available treasure hunts
async function getAvailableTreasureHunts(numberOfHunts = 10) {
    const url = `https://codecyprus.org/th/api/list`;
    const data = await fetchData(url);
    return data;
}

//Function to display available treasure hunts
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

    // Add identifier to ensure the player name is unique
    playerName = playerName + "_" + new Date().getTime();

    setCookie("sessionId", "", -1);

    const appName = "TreasureHunt";

    // Start the hunt with the unique player name
    const sessionId = await startTreasureHunt(playerName, appName, huntId);
    if (sessionId) {
        window.location.href = "questions.html";
    }
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



document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login-form")?.addEventListener("submit", saveUserData);

    autoLogin();
});

async function fetchScore(sessionId) {
    const url = `https://codecyprus.org/th/api/score?session=${sessionId}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "OK") {
            updateScoreUI(data);
        } else {
            console.error("Failed to fetch score:", data.status);
            alert("Error fetching score.");
        }
    } catch (error) {
        console.error("Error fetching score data:", error);
        alert("An error occurred while fetching the score.");
    }
}
function updateScoreUI(data) {
    const scoreContainer = document.getElementById('score-container'); // Assuming this is where the score will be displayed
    if (scoreContainer) {
        scoreContainer.innerHTML = `
            <p>Player: ${data.player}</p>
            <p>Score: ${data.score}</p>
            <p>Prize: ${data.hasPrize ? 'Yes' : 'No'}</p>
            <p>Completed: ${data.completed ? 'Yes' : 'No'}</p>
            <p>Finished: ${data.finished ? 'Yes' : 'No'}</p>
        `;
    }
}
const sessionId = getCookie("sessionId");
if (sessionId) {
    fetchScore(sessionId);
} else {
    alert("No active session found.");
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
    container.innerHTML = '';
    const list = document.createElement('ol');

    leaderboard.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.player}: ${entry.score} points`;
        list.appendChild(listItem);
    });

    container.appendChild(list);
}


