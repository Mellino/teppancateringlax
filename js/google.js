// Google Sheets API URL to fetch availability data
const SHEET_ID = "1QcGvLIvun-lFujhqXjOTjdhS97dxFqZYp9695aX0ITI";
const SHEET_NAME = "Sheet1";  // Change this if your sheet name is different
const API_KEY = "AIzaSyBir9_EYIgiCTFYOdFcafgXggC-JpZNM8s"; // Replace with your actual API key

// Build the URL to fetch the data from Google Sheets
const sheetURL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

// Function to check availability for a selected date
async function checkAvailability() {
    const dateInput = document.getElementById('datePicker').value;
    const resultDiv = document.getElementById('result');
    const containerDiv = document.querySelector('.container');

    if (!dateInput) {
        resultDiv.innerHTML = "Please select a date.";
        return;
    }

    // Show "Loading..." text while fetching data
    resultDiv.innerHTML = "Loading...";

    // Fetch data from Google Sheets
    try {
        const response = await fetch(sheetURL);
        const data = await response.json();
        const values = data.values;

        // Check if the date exists in the Google Sheet and get its availability status
        let status = "Not Found";
        for (let i = 1; i < values.length; i++) {  // Skip the header row
            const [sheetDate, availability] = values[i];
            if (sheetDate === dateInput) {
                if (availability === "Y") {
                    status = "Available";
                } else if (availability === "N") {
                    status = "Not Available";
                } else if (availability === "M") {
                    status = "Deposit Pending";
                }
                break;
            }
        }

        // Display the result based on the status
        if (status === "Not Available") {
            resultDiv.innerHTML = `Availability for ${dateInput}: <span class="not-available">Not Available</span>`;
            containerDiv.classList.add('flash-red');
            setTimeout(() => {
                containerDiv.classList.remove('flash-red');
            }, 500);
        } else if (status === "Deposit Pending") {
            resultDiv.innerHTML = `Availability for ${dateInput}:<br><span class="deposit-pending">Deposit Pending</span>`;
        } else {
            resultDiv.innerHTML = `Availability for ${dateInput}: ${status}`;
        }
    } catch (error) {
        resultDiv.innerHTML = "Error fetching availability data.";
        console.error("Error:", error);
    }
}
