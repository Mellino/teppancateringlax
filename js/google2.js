const SHEET_ID = "1QcGvLIvun-lFujhqXjOTjdhS97dxFqZYp9695aX0ITI";
const SHEET_NAME = "Sheet2"; // Make sure this matches your sheet's name
const API_KEY = "AIzaSyBir9_EYIgiCTFYOdFcafgXggC-JpZNM8s"; // Replace with your API key
const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Fetch the sheet data
    const response = await fetch(sheetURL);
    const data = await response.json();

    let validLogin = false;

    // Loop through the sheet data and check for matching credentials
    const rows = data.values;
    if (rows) {
        for (let row of rows) {
            const storedUsername = row[0]; // Assuming the username is in the first column
            const storedPassword = row[1]; // Assuming the hashed password is in the second column

            // Simple password check (use bcrypt or another hashing method in production)
            if (username === storedUsername && password === storedPassword) {
                validLogin = true;
                break;
            }
        }
    }

    if (validLogin) {
        // Redirect to the restricted page or dashboard
        window.location.href = '/CustomerForms/index.html'; // Change to the URL of your restricted page
    } else {
        document.getElementById('error').style.display = 'block'; // Show error message
    }
}


const hamburger = document.querySelector(".hamburger");
hamburger.onclick = function() {
    const navBar = document.querySelector(".nav-bar");
    navBar.classList.toggle("active");
};