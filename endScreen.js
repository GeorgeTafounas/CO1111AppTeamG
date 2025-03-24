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

async function fetchFinalScore() {
    const sessionId = getCookie("sessionId");
    if (!sessionId) {
        alert("No session found. Returning to main page.");
        window.location.href = "index.html";
        return;
    }

    const url = `https://codecyprus.org/th/api/score?session=${sessionId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK") {
        document.getElementById("player-name").innerText = `Player: ${data.player}`;
        document.getElementById("player-score").innerText = `Final Score: ${data.score}`;
    } else {
        alert("Error fetching final score.");
        window.location.href = "index.html";
    }
}

function restartHunt() {
    document.cookie = "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    window.location.href = "app.html";
}

document.addEventListener('DOMContentLoaded', function() {
    const sessionId = getCookie("sessionId");
    if (!sessionId) {
        alert("No session ID found. Returning to main page.");
        window.location.href = "index.html";
        return;
    }

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

fetchFinalScore();