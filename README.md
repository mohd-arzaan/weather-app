# ⛅ Weather Dashboard

A modern, responsive, and dynamic Weather application built with the MERN stack (React + Express). It features a unique "Brutalist/Poster" UI that changes colors based on the current weather conditions.

## 🔴 Live Demo
- **Frontend:** [Add your Vercel link here]
- **Backend API:** [Add your Render link here]

## ✨ Key Features
- **Live Weather Search:** Search weather by city name.
- **Geolocation:** Get weather for your current location with a single click.
- **Dynamic Theming:** The entire app's color palette changes based on the weather (Sunny, Rainy, Cloudy, etc.).
- **5-Day Forecast:** Interactive Area Chart using `Recharts` to visualize temperature trends.
- **Detailed Stats:** Humidity, Wind Speed, Feels Like, and Pressure.
- **Brutalist UI:** High contrast, bold typography, and unique poster-style design.

## 🛠️ Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios, Recharts, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **API:** OpenWeatherMap API (Current Weather, Forecast, Reverse Geocoding).

## 🚀 Run Locally
1. Clone the repo: `git clone https://github.com/mohd-arzaan/weather-app.git`
2. Setup Backend:
   - `cd backend`
   - `npm install`
   - Create a `.env` file and add: `WEATHER_API_KEY=your_key_here`
   - `npm run dev`
3. Setup Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`