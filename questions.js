// Function to get the current question from the API
async function getCurrentQuestion() {
    const sessionId = getCookie("sessionId");

    if (!sessionId) {
        alert("Session not found. Please start a hunt first.");
        return;
    }

    const url = `https://codecyprus.org/th/api/question?session=${sessionId}`;
    const response = await fetchData(url);

    if (response && response.status === "OK") {
        // Check if the current question is the last one
        if (response.currentQuestionIndex + 1 >= response.numOfQuestions) {
            alert("🎉 Congratulations! You've completed the treasure hunt.");
            window.location.href = "endScreen.html";
            return;
        }

        displayQuestion(response);

        // Check if the question requires location
        if (response.requiresLocation) {
            const isAtCorrectLocation = await checkLocation(sessionId, response);
            if (!isAtCorrectLocation) {
                alert("You are at the wrong location. Please move to the correct location to answer this question.");
                disableAnswerSubmission();
            } else {
                enableAnswerSubmission();
            }
        }
    } else {
        alert("🎉 Congratulations! The treasure hunt is completed.");
        window.location.href = "endScreen.html";
    }
}

// Function to check if the user is at the correct location
async function checkLocation(sessionId, questionData) {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported.");
        return false;
    }

    // Get the users current location
    const userLocation = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    });

    // Fetch the location for the question
    const requiredLocation = questionData.location;
    if (!requiredLocation) {
        console.error("location not provided.");
        return false;
    }

    // Compare users and required location
    const distance = calculateDistance(
        userLocation.latitude, userLocation.longitude,
        requiredLocation.latitude, requiredLocation.longitude
    );

    const allowedDistance = 5;
    return distance <= allowedDistance;
}

// Disable submit button
function disableAnswerSubmission() {
    const submitButton = document.getElementById("submit-btn");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerText = "Move to the correct location to answer";
    }
}

// Enable submit button
function enableAnswerSubmission() {
    const submitButton = document.getElementById("submit-btn");
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerText = "Submit Answer";
    }
}
// Enable or disable the submit button
function monitorAnswerSelection() {
    const submitButton = document.getElementById("submit-btn");
    if (!submitButton) return;
    submitButton.disabled = true;
    document.getElementById("answer-container").addEventListener("input", () => {
        submitButton.disabled = !document.querySelector('input[name="answer"]:checked, input[name="answer"]:not([type="radio"])');
    });
}


// Function to display the current question
function displayQuestion(questionData) {
    if (!document.getElementById('question-text')) {
        return;
    }

    document.getElementById('question-text').innerHTML = questionData.questionText;

    let answerInput = "";

    switch (questionData.questionType) {
        case "BOOLEAN":
            answerInput = `
                <label><input type="radio" name="answer" value="true"> True</label>
                <label><input type="radio" name="answer" value="false"> False</label>
            `;
            break;
        case "INTEGER":
            answerInput = `<input type="number" name="answer" placeholder="Enter an integer">`;
            break;
        case "NUMERIC":
            answerInput = `<input type="number" step="any" name="answer" placeholder="Enter a numeric value">`;
            break;
        case "MCQ":
            answerInput = `
                <label><input type="radio" name="answer" value="A"> A</label>
                <label><input type="radio" name="answer" value="B"> B</label>
                <label><input type="radio" name="answer" value="C"> C</label>
                <label><input type="radio" name="answer" value="D"> D</label>
            `;
            break;
        case "TEXT":
            answerInput = `<input type="text" name="answer" placeholder="Enter your answer">`;
            break;
        default:
    }

    const answerContainer = document.getElementById('answer-container');
    if (answerContainer) {
        answerContainer.innerHTML = answerInput;
    }

    const questionInfo = document.getElementById('question-info');
    if (questionInfo) {
        questionInfo.innerText = `Question ${questionData.currentQuestionIndex + 1} of ${questionData.numOfQuestions}`;
    }

    if (document.getElementById('skip-btn')) {
        document.getElementById('skip-btn').style.display = questionData.canBeSkipped ? 'block' : 'none';
    }
    monitorAnswerSelection();

}

// Function to submit the answer
async function submitAnswer(sessionId) {
    const userAnswerElement = document.querySelector('input[name="answer"]:checked') || document.querySelector('input[name="answer"]');
    if (!userAnswerElement) {
        alert("Please answer the question before submitting.");
        return;
    }

    const userAnswer = userAnswerElement.value;
    const url = `https://codecyprus.org/th/api/answer?session=${sessionId}&answer=${encodeURIComponent(userAnswer)}`;

    const response = await fetchData(url);

    if (response && response.status === "OK") {
        if (response.correct) {
            alert(`Correct answer! Points won: ${response.scoreAdjustment}`);
        } else {
            alert(`Wrong answer! Points lost: ${response.scoreAdjustment}`);
        }
        getCurrentQuestion();
    } else {
        alert("Error submitting answer. Please try again.");
    }
}

// Function to skip the current question
function skipQuestion(sessionId) {
    const url = `https://codecyprus.org/th/api/skip?session=${sessionId}`;

    fetchData(url).then(response => {
        if (response && response.status === "OK") {
            getCurrentQuestion();
        } else {
            alert("Failed to skip question.");
        }
    });
}

// Function to send the users current location to the API
async function sendLocationUpdate(sessionId) {
    if (!navigator.geolocation) {
        return;
    }

    const userLocation = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );
    });

    // Send the location to the API
    const url = `https://codecyprus.org/th/api/location?session=${sessionId}&latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`;
    const response = await fetchData(url);

    if (response && response.status === "OK") {
        console.log("Location updated successfully.");
    } else {
        console.error("Failed to update location.");
    }
}

function locationUpdates(sessionId) {
    const updateInterval = 10000;

    sendLocationUpdate(sessionId);

    setInterval(() => {
        sendLocationUpdate(sessionId);
    }, updateInterval);
}

document.addEventListener("DOMContentLoaded", function () {
    const sessionId = getCookie("sessionId");

    if (sessionId) {
        locationUpdates(sessionId);
    } else {
        console.error("Session not found. Please start a hunt first.");
    }

    getCurrentQuestion();

    document.getElementById("submit-btn")?.addEventListener("click", async () => {
        if (!sessionId) {
            alert("Session not found. Please start a hunt first.");
            return;
        }

        await submitAnswer(sessionId);
    });

    document.getElementById("skip-btn")?.addEventListener("click", () => {
        const sessionId = getCookie("sessionId");
        skipQuestion(sessionId);
    });
});

async function fetchData(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        return null;
    }
}