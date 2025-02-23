function fetchAPI() {
    fetch("https://codecyprus.org/th/test-api/list?number-of-ths=2")
        .then(response => response.json())
        .then(data => {
            document.body.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
        })
        .catch(error => {
            document.body.innerHTML = "<p>Error fetching: " + error.message + "</p>";
            console.error("Error fetching data: ", error);
        });
}

window.onload = fetchAPI;
