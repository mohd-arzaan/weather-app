import { useState } from 'react';
import axios from 'axios';
import {
  Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning,
  CloudFog, CloudSun, Droplets, Wind, Thermometer, Gauge, Loader2, MapPin
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList
} from 'recharts';

const THEMES = {
  idle:         { bg: '#EDEDED', accent: '#FFFFFF', Icon: CloudSun },
  Clear:        { bg: '#FFC933', accent: '#FF8A3D', Icon: Sun },
  Clouds:       { bg: '#AFC3D6', accent: '#F5F8FB', Icon: Cloud },
  Rain:         { bg: '#7FB2FF', accent: '#E4EFFF', Icon: CloudRain },
  Drizzle:      { bg: '#7FB2FF', accent: '#E4EFFF', Icon: CloudDrizzle },
  Thunderstorm: { bg: '#B79CFF', accent: '#FFE14D', Icon: CloudLightning },
  Snow:         { bg: '#DCEBF2', accent: '#FFFFFF', Icon: CloudSnow },
  Mist:         { bg: '#B9B4A8', accent: '#E8E4D8', Icon: CloudFog },
};
['Haze', 'Fog', 'Smoke', 'Dust', 'Sand', 'Ash'].forEach((k) => (THEMES[k] = THEMES.Mist));

const chartFont = {
  fill: '#000',
  fontWeight: 700,
  fontSize: 12,
  fontFamily: 'Bricolage Grotesque, system-ui, sans-serif',
};

function Badge({ theme }) {
  const { Icon, accent } = theme;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-0 right-[7vw] top-24 sm:top-[12vh] w-[32vmin] h-[32vmin] sm:w-[40vmin] sm:h-[40vmin]"
    >
      <div className="absolute rounded-full border-[1.5px] border-black" style={{ inset: '-7%' }} />
      <div
        className="w-full h-full rounded-full flex items-center justify-center transition-colors duration-700"
        style={{ background: accent }}
      >
        <div style={{ width: '55%', height: '55%' }}>
          <Icon size="100%" strokeWidth={1} color="#000" />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="border-t-2 border-black pt-2 h-full">
      <div className="flex items-center gap-1.5 opacity-80">
        <Icon className="w-3.5 h-3.5" strokeWidth={2} />
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black text-white px-3 py-1.5 text-sm font-bold">
      {label}: {payload[0].value}°C
    </div>
  );
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherData = async (query) => {
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast(null);

    try {
      const q = encodeURIComponent(query);
      // CHANGE: URL updated to Render
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://weather-app-w6k0.onrender.com/api/weather?city=${q}`),
        axios.get(`https://weather-app-w6k0.onrender.com/api/forecast?city=${q}`).catch(() => null),
      ]);

      setWeather(weatherRes.data);

      if (forecastRes?.data?.list) {
        const daily = forecastRes.data.list
          .filter((_, index) => index % 8 === 0)
          .map((item) => ({
            time: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(item.main.temp),
          }));
        setForecast(daily);
      }
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

  const fetchWeather = (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) return;
    fetchWeatherData(query);
  };

  const fetchByLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // CHANGE: URL updated to Render
          const locationRes = await axios.get(`https://weather-app-w6k0.onrender.com/api/location?lat=${latitude}&lon=${longitude}`);
          const cityName = locationRes.data.city;
          
          setCity(cityName);
          await fetchWeatherData(cityName);
        } catch (err) {
          setError('Could not fetch weather for your location.');
          setLoading(false);
        }
      },
      (err) => {
        setError('Location access denied or unavailable.');
        setLoading(false);
      }
    );
  };

  const condition = weather?.weather?.[0]?.main;
  const theme = weather ? THEMES[condition] || THEMES.Clouds : THEMES.idle;
  const showForecast = forecast && forecast.length > 1;

  return (
    <main
      className="poster relative min-h-screen overflow-hidden text-black transition-colors duration-700"
      style={{ background: theme.bg }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&display=swap');
        .poster { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
        .poster input::placeholder { color: #000; opacity: .45; }
        .poster input:focus, .poster input:focus-visible { outline: none; box-shadow: 0 3px 0 0 #000; }
        .poster button:focus-visible { outline: 3px solid #000; outline-offset: 4px; }
        .poster .recharts-wrapper, .poster .recharts-surface { outline: none; }
        @keyframes rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .rise { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
      `}</style>

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
          <button type="submit" className="px-4 py-2 font-bold text-base bg-black text-white active:scale-95 transition-transform shrink-0">
            Search
          </button>
          
          <button 
            type="button" 
            onClick={fetchByLocation} 
            title="Use my location"
            className="px-4 py-2 font-bold text-base border-2 border-black text-black active:scale-95 transition-transform hover:bg-black/5 shrink-0 flex items-center justify-center"
          >
            <MapPin className="w-5 h-5" strokeWidth={2.5} />
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
                <span
                  className="font-bold leading-none"
                  style={{ fontSize: 'clamp(5rem, 13vw, 9rem)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}
                >
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

        {weather && !loading && (
          <div className={`grid gap-6 items-stretch ${showForecast ? 'sm:grid-cols-[1.5fr_1fr]' : ''}`}>
            {showForecast && (
              <section className="border-t-2 border-black pt-2">
                <h2 className="text-sm font-bold">Next {forecast.length} days</h2>
                <div className="w-full h-40 sm:h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast} margin={{ top: 22, right: 18, left: 18, bottom: 0 }}>
                      <CartesianGrid stroke="#000" strokeOpacity={0.15} vertical={false} />
                      <XAxis dataKey="time" tick={chartFont} axisLine={false} tickLine={false} tickMargin={8} />
                      <YAxis hide domain={['dataMin - 4', 'dataMax + 4']} />
                      <Tooltip content={<ForecastTooltip />} cursor={{ stroke: '#000', strokeWidth: 1.5 }} />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#000"
                        strokeWidth={2.5}
                        fill={theme.accent}
                        fillOpacity={1}
                        dot={{ r: 4, fill: '#000', stroke: '#000' }}
                        activeDot={{ r: 6, fill: '#000', stroke: '#000' }}
                        animationDuration={900}
                      >
                        <LabelList dataKey="temp" position="top" offset={10} formatter={(v) => `${v}°`} style={{ ...chartFont, fontSize: 13 }} />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <div className="grid grid-cols-2 grid-rows-2 gap-x-4 gap-y-4 h-full">
              <Stat icon={Droplets} label="Humidity" value={`${weather.main.humidity}%`} />
              <Stat icon={Wind} label="Wind" value={`${weather.wind.speed} m/s`} />
              <Stat icon={Thermometer} label="Feels like" value={`${Math.round(weather.main.feels_like)}°C`} />
              {weather.main.pressure !== undefined && (
                <Stat icon={Gauge} label="Pressure" value={`${weather.main.pressure} hPa`} />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default App;