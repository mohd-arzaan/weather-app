const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('Weather API Backend is running...');
});

// Weather Route
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    
    // OpenWeather API ko call karo (metric= C temperature ke liye)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    // Frontend ko data bhej do
    res.status(200).json(response.data);
  } catch (error) {
    // Agar city nahi mili (404) ya koi aur error aaya
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found. Please check spelling.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Server start karo
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});