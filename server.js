const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Load the JSON file
const dataFilePath = path.join(__dirname, 'countries+states+cities.json');
let data;

try {
  data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  console.log("Data successfully loaded");
} catch (err) {
  console.error("Error loading or parsing the JSON file:", err);
}

/* -----------------------------------------
 * Route to get all countries
 * -----------------------------------------
 */
app.get('/countries', (req, res) => {
  console.log("Received request for /countries");

  if (!data || !Array.isArray(data)) {
    console.error("Countries data not found or not an array");
    return res.status(500).json({ message: 'Countries data not found' });
  }

  const countries = data.map((country) => ({
    id: country.id,
    name: country.name,
  }));

  res.json(countries);
});

/* -----------------------------------------
 * Route to get states by country ID
 * -----------------------------------------
 */
app.get('/states/:countryId', (req, res) => {
  console.log("Received request for /states/:countryId");
  const countryId = parseInt(req.params.countryId, 10);
  const country = data.find((c) => c.id === countryId);

  if (!country || !country.states) {
    console.error(`Country with ID ${countryId} or states not found`);
    return res.status(404).json({ message: 'Country or states not found' });
  }

  const states = country.states.map((state) => ({
    id: state.id,
    name: state.name,
  }));
  res.json(states);
});

/* -----------------------------------------
 * Route to get cities by state ID
 * -----------------------------------------
 */
app.get('/cities/:stateId', (req, res) => {
  console.log("Received request for /cities/:stateId");
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
    console.error(`State with ID ${stateId} or cities not found`);
    return res.status(404).json({ message: 'State or cities not found' });
  }

  res.json(cities);
});

// Start the server, use Render's assigned port or default to 3000 for local development
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
