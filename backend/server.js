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

// Current Weather Route
app.get('/api/weather', async (req, res) => {
  try {
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found. Please check spelling.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Forecast Route (Graph ke liye)
app.get('/api/forecast', async (req, res) => {
  try {
    const city = req.query.city;
    
    if (!city) {
      return res.status(400).json({ message: 'City name is required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );

    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reverse Geocoding Route (Lat/Lon se City nikalne ke liye)
app.get('/api/location', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const apiKey = process.env.WEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
    );

    if (response.data.length === 0) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // API array return karti hai, humein pehla element chahiye
    res.status(200).json({ city: response.data[0].name });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Server start karo
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});