import { useState } from 'react';
import axios from 'axios';
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning,
  CloudFog, CloudSun, Droplets, Wind, Thermometer, Gauge, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const THEMES = {
  idle:         { bg: '#EDEDED', accent: '#FFFFFF', Icon: CloudSun, chartColor: '#888888' },
  Clear:        { bg: '#FFC933', accent: '#FF8A3D', Icon: Sun, chartColor: '#D97706' },
  Clouds:       { bg: '#AFC3D6', accent: '#F5F8FB', Icon: Cloud, chartColor: '#64748B' },
  Rain:         { bg: '#7FB2FF', accent: '#E4EFFF', Icon: CloudRain, chartColor: '#3B82F6' },
  Drizzle:      { bg: '#7FB2FF', accent: '#E4EFFF', Icon: CloudDrizzle, chartColor: '#3B82F6' },
  Thunderstorm: { bg: '#B79CFF', accent: '#FFE14D', Icon: CloudLightning, chartColor: '#7C3AED' },
  Snow:         { bg: '#DCEBF2', accent: '#FFFFFF', Icon: CloudSnow, chartColor: '#60A5FA' },
  Mist:         { bg: '#B9B4A8', accent: '#E8E4D8', Icon: CloudFog, chartColor: '#78716C' },
};
['Haze', 'Fog', 'Smoke', 'Dust', 'Sand', 'Ash'].forEach((k) => (THEMES[k] = THEMES.Mist));

function Badge({ theme }) {
  const { Icon, accent } = theme;
  return (
    // FIX: z-0 diya (taaki content z-10 ke peeche rahe) aur position center mein fix ki hai
    <div aria-hidden="true" className="pointer-events-none absolute z-0 right-[5vw] top-[10vh] sm:top-1/2 sm:-translate-y-1/2 w-[35vmin] h-[35vmin] sm:w-[45vmin] sm:h-[45vmin] opacity-90">
      <div className="absolute rounded-full border-[1.5px] border-black" style={{ inset: '-7%' }} />
      <div className="w-full h-full rounded-full flex items-center justify-center transition-colors duration-700" style={{ background: accent }}>
        <div style={{ width: '55%', height: '55%' }}>
          <Icon size="100%" strokeWidth={1} color="#000" />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="border-t-2 border-black pt-2">
      <div className="flex items-center gap-1.5 opacity-80">
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/weather?city=${encodeURIComponent(query)}`),
        axios.get(`http://localhost:5000/api/forecast?city=${encodeURIComponent(query)}`)
      ]);

      setWeather(weatherRes.data);
      
      const formattedForecast = forecastRes.data.list
        .filter((_, index) => index % 8 === 0)
        .map(item => ({
          time: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(item.main.temp)
        }));

      setForecast(formattedForecast);
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

  const condition = weather?.weather?.[0]?.main;
  const theme = weather ? THEMES[condition] || THEMES.Clouds : THEMES.idle;

  return (
    <main className="poster relative min-h-screen overflow-hidden text-black transition-colors duration-700" style={{ background: theme.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&display=swap');
        .poster { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
        .poster input::placeholder { color: #000; opacity: .45; }
        .poster input:focus, .poster input:focus-visible { outline: none; box-shadow: 0 4px 0 0 #000; }
        .poster button:focus-visible { outline: 3px solid #000; outline-offset: 4px; }
        @keyframes rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .rise { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
      `}</style>

      {/* Yahan main content ke peeche rakhne ke liye z-0 diya hai */}
      <Badge theme={theme} />

      <div className="relative z-10 flex flex-col min-h-screen max-w-5xl mx-auto w-full px-6 sm:px-10 py-6">
        <form onSubmit={fetchWeather} className="flex items-end gap-3 w-full max-w-md">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Type a city"
            aria-label="City name"
            className="flex-1 min-w-0 bg-transparent border-b-2 border-black py-1.5 text-xl sm:text-2xl font-bold"
          />
          <button type="submit" className="px-4 py-2 font-bold text-base bg-black text-white active:scale-95 transition-transform">
            Search
          </button>
        </form>

        <div className="flex-1 flex flex-col justify-center py-6">
          {loading && (
            <div className="flex items-center gap-3" role="status">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-2xl font-bold">Fetching weather...</p>
            </div>
          )}

          {error && !loading && (
            <div role="alert">
              <h1 className="font-bold tracking-tight leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
                No luck.
              </h1>
              <p className="mt-2 text-xl font-semibold max-w-md">{error}</p>
            </div>
          )}

          {weather && !loading && (
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {weather.name}, {weather.sys.country}
              </h1>
              <p className="mt-0.5 text-base sm:text-lg font-semibold capitalize opacity-70">
                {weather.weather[0].description}
              </p>

              <div className="rise flex items-start mt-2 select-none">
                <span className="font-bold leading-none" style={{ fontSize: 'clamp(5rem, 15vw, 10rem)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(weather.main.temp)}
                </span>
                <span className="font-semibold ml-2 sm:ml-3 mt-1 sm:mt-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                  °C
                </span>
              </div>
            </div>
          )}

          {!weather && !loading && !error && (
            <div>
              <h1 className="font-bold tracking-tight leading-[0.95]" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                Which city?
              </h1>
              <p className="mt-2 text-lg font-semibold opacity-70 max-w-sm">
                The whole screen changes colour with the weather.
              </p>
            </div>
          )}
        </div>

        {/* Forecast Graph */}
        {forecast && weather && !loading && (
          <div className="mt-2 mb-6 bg-white/30 backdrop-blur-md border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-sm sm:text-base font-bold mb-2 uppercase tracking-widest">5-Day Forecast</h2>
            <div className="w-full h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.2)" vertical={false} />
                  <XAxis dataKey="time" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12, fontFamily: 'Bricolage Grotesque' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold', fontSize: 12, fontFamily: 'Bricolage Grotesque' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', fontWeight: 'bold', fontSize: '12px', fontFamily: 'Bricolage Grotesque' }}
                    itemStyle={{ color: '#000' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="#000" 
                    strokeWidth={2.5} 
                    fill={theme.chartColor} 
                    fillOpacity={0.5} 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {weather && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
            <Stat icon={Droplets} label="Humidity" value={`${weather.main.humidity}%`} />
            <Stat icon={Wind} label="Wind" value={`${weather.wind.speed} m/s`} />
            <Stat icon={Thermometer} label="Feels like" value={`${Math.round(weather.main.feels_like)}°C`} />
            {weather.main.pressure !== undefined && (
              <Stat icon={Gauge} label="Pressure" value={`${weather.main.pressure} hPa`} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;