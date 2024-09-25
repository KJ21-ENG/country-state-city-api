const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS to allow API requests from different origins (e.g., FlutterFlow app)
app.use(cors());

// Load the JSON file
const dataFilePath = path.join(__dirname, 'countries+states+cities.json');
let data;
try {
  data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  console.log("Loaded data structure:", data);  // Debugging line to check the data structure
} catch (err) {
  console.error("Error loading or parsing the JSON file:", err);
}

/* -----------------------------------------
 * Change at 6:30 PM on 25th September 2024
 * Description: Fixed the issue where 'countries' were not found. 
 * Updated this route to directly use 'data' as it contains the array of countries.
 * -----------------------------------------
 */

// Route to get all countries
app.get('/countries', (req, res) => {
  console.log("Data:", data);  // Debugging line to check what 'data' contains

  // Now using 'data' directly because the array contains countries without a wrapping 'countries' key
  if (!data || !Array.isArray(data)) {
    return res.status(500).json({ message: 'Countries data not found' });
  }

  // Map over the countries array and return the ID and name of each country
  const countries = data.map((country) => ({
    id: country.id,
    name: country.name,
  }));
  res.json(countries);
});

// Route to get states for a specific country (using countryId)
app.get('/states/:countryId', (req, res) => {
  const countryId = parseInt(req.params.countryId, 10);
  const country = data.find((c) => c.id === countryId);

  if (!country || !country.states) {
    return res.status(404).json({ message: 'Country or states not found' });
  }

  const states = country.states.map((state) => ({
    id: state.id,
    name: state.name,
  }));
  res.json(states);
});

// Route to get cities for a specific state (using stateId)
app.get('/cities/:stateId', (req, res) => {
  const stateId = parseInt(req.params.stateId, 10);
  
  let cities = [];
  data.forEach((country) => {
    const state = country.states?.find((s) => s.id === stateId);
    if (state && state.cities) {
      cities = state.cities.map((city) => ({
        id: city.id,
        name: city.name,
      }));
    }
  });

  if (cities.length === 0) {
    return res.status(404).json({ message: 'State or cities not found' });
  }

  res.json(cities);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
