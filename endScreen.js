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
    document.cookie = "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "index.html";
}

fetchFinalScore();