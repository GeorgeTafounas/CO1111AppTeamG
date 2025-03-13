// Function to get the current question from the api
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
            window.location.href = "endScreen.html"; // Redirect to the end screen
            return;
        }

        displayQuestion(response);
    } else {
        // If there are no more questions, redirect to the end screen
        alert("🎉 Congratulations! The treasure hunt is completed.");
        window.location.href = "endScreen.html";
    }
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
            answerInput = `<p>Invalid question type</p>`;
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
}

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
            alert(`✅ Correct answer! Points won: ${response.scoreAdjustment}`);
        } else {
            alert(`❌ Wrong answer! Points lost: ${response.scoreAdjustment}`);
        }
        getCurrentQuestion();
    } else {
        alert("⚠️ Error submitting answer. Please try again.");
    }
}


// Fetch the next question
async function fetchNextQuestion(sessionId) {
    const url = `https://codecyprus.org/th/api/question?session=${sessionId}`;
    const response = await fetchData(url);

    if (response && response.status === "OK") {
        // Check if all questions are answered
        if (response.currentQuestionIndex + 1 >= response.numOfQuestions) {
            alert("🎉 Treasure hunt completed!");
            window.location.href = "endScreen.html";
            return;
        }

        displayQuestion(response);
    } else {
        alert("🎉 Treasure hunt completed!");
        window.location.href = "endScreen.html";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    getCurrentQuestion();

    document.getElementById("submit-btn")?.addEventListener("click", async () => {
        const sessionId = getCookie("sessionId");

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

function skipQuestion(sessionId) {
    const url = `https://codecyprus.org/th/api/skip?session=${sessionId}`;

    fetchData(url).then(response => {
        if (response && response.status === "OK") {
            getCurrentQuestion();
        } else {
            alert("Failed to skip the question.");
        }
    });
}

