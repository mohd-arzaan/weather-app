import { useState } from 'react';
import axios from 'axios';
import { Search, Cloud, Droplets, Wind, MapPin, Loader2, Sun, CloudRain, CloudLightning } from 'lucide-react';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e) => {
    e.preventDefault();
    if (!city) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/weather?city=${city}`);
      setWeather(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('City not found. Please check the spelling.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Background Logic: Time aur Condition ke hisaab se theme change
  const getDynamicBackground = () => {
    if (!weather) return 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600'; // Default

    // City ka local time nikaalo (timezone seconds mein hota hai)
    const utcTime = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
    const cityLocalTime = new Date(utcTime + (weather.timezone * 1000));
    const hours = cityLocalTime.getHours();
    const condition = weather.weather[0].main; // Clear, Clouds, Rain, etc.

    // 1. Agar Rain ya Thunderstorm hai
    if (condition === 'Rain' || condition === 'Drizzle' || condition === 'Thunderstorm') {
      return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
    }

    // 2. Agar Clouds hain
    if (condition === 'Clouds') {
      if (hours >= 6 && hours < 18) return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
      return 'bg-gradient-to-br from-slate-800 via-slate-900 to-black';
    }

    // 3. Agar Clear sky hai (Time ke hisaab se)
    if (hours >= 5 && hours < 12) {
      // Morning
      return 'bg-gradient-to-br from-orange-300 via-orange-400 to-yellow-500'; 
    } else if (hours >= 12 && hours < 17) {
      // Afternoon
      return 'bg-gradient-to-br from-blue-400 via-sky-500 to-blue-600';
    } else if (hours >= 17 && hours < 20) {
      // Evening
      return 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400';
    } else {
      // Night
      return 'bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900';
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-1000 ease-in-out ${getDynamicBackground()}`}>
      
      <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 text-white">
        
        <h1 className="text-3xl font-extrabold text-center mb-6 drop-shadow-md">Weather App</h1>

        <form onSubmit={fetchWeather} className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-white/70" />
          </div>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city..."
            className="w-full py-3 pl-12 pr-4 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg font-medium shadow-inner"
          />
          <button type="submit" className="hidden">Search</button>
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-white/80" />
            <p className="mt-4 text-white/80 font-medium">Fetching weather...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-500/30 border border-red-500/50 rounded-2xl p-4 text-center">
            <p className="text-white font-medium">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="w-6 h-6 text-white/90" />
              <h2 className="text-2xl font-bold tracking-wide drop-shadow-sm">
                {weather.name}, {weather.sys.country}
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center mb-8">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt="weather icon"
                className="w-32 h-32 drop-shadow-xl"
              />
              <div className="flex items-start">
                <h3 className="text-6xl font-extrabold drop-shadow-md">{Math.round(weather.main.temp)}</h3>
                <span className="text-3xl font-bold mt-1">°C</span>
              </div>
              <p className="text-xl font-medium capitalize mt-2 text-white/90 drop-shadow-sm">
                {weather.weather[0].description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center shadow-lg">
                <Droplets className="w-6 h-6 mb-2 text-blue-200" />
                <p className="text-sm text-white/80">Humidity</p>
                <p className="text-lg font-bold">{weather.main.humidity}%</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center shadow-lg">
                <Wind className="w-6 h-6 mb-2 text-gray-200" />
                <p className="text-sm text-white/80">Wind Speed</p>
                <p className="text-lg font-bold">{weather.wind.speed} m/s</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center col-span-2 shadow-lg">
                <Sun className="w-6 h-6 mb-2 text-yellow-200" />
                <p className="text-sm text-white/80">Feels Like</p>
                <p className="text-lg font-bold">{Math.round(weather.main.feels_like)}°C</p>
              </div>
            </div>
          </div>
        )}

        {!weather && !loading && !error && (
          <div className="flex flex-col items-center justify-center py-10 opacity-70">
            <Cloud className="w-16 h-16 mb-4 drop-shadow-lg" />
            <p className="text-lg font-medium">Search a city to see the weather</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;