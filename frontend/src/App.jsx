import { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

/*
  Design idea: the whole screen is a flat colour-block poster.
  Each weather condition gets its own solid colour, ink colour and one bold
  geometric shape (sun = circle, rain = striped arch, thunder = bolt, etc).
  No cards, no gradients, no glass. The temperature is the hero.
*/
const THEMES = {
  idle:         { bg: '#EDEDED', ink: '#000000', accent: '#000000', shape: 'ring' },
  Clear:        { bg: '#FFC933', ink: '#000000', accent: '#FF5A36', shape: 'sun' },
  Clouds:       { bg: '#AFC3D6', ink: '#000000', accent: '#F5F8FB', shape: 'clouds' },
  Rain:         { bg: '#7FB2FF', ink: '#000000', accent: '#1E4BD6', shape: 'rain' },
  Thunderstorm: { bg: '#B79CFF', ink: '#000000', accent: '#FFE14D', shape: 'bolt' },
  Snow:         { bg: '#DCEBF2', ink: '#000000', accent: '#6FB3E0', shape: 'snow' },
  Mist:         { bg: '#B9B4A8', ink: '#000000', accent: '#E8E4D8', shape: 'mist' },
};
THEMES.Drizzle = THEMES.Rain;
['Haze', 'Fog', 'Smoke', 'Dust', 'Sand', 'Ash'].forEach((k) => (THEMES[k] = THEMES.Mist));

function Shape({ kind, accent }) {
  const fill = { width: '100%', height: '100%' };

  if (kind === 'sun') {
    return <div style={{ ...fill, borderRadius: '50%', background: accent }} />;
  }
  if (kind === 'clouds') {
    const blob = (style) => <div style={{ position: 'absolute', borderRadius: '50%', background: accent, ...style }} />;
    return (
      <div style={{ ...fill, position: 'relative' }}>
        {blob({ width: '55%', height: '55%', left: 0, top: '42%' })}
        {blob({ width: '72%', height: '72%', left: '20%', top: '8%' })}
        {blob({ width: '50%', height: '50%', left: '50%', top: '48%' })}
      </div>
    );
  }
  if (kind === 'rain') {
    return (
      <div
        style={{
          ...fill,
          borderRadius: '50% 50% 0 0 / 40% 40% 0 0',
          backgroundImage: `repeating-linear-gradient(110deg, ${accent} 0 10px, transparent 10px 30px)`,
        }}
      />
    );
  }
  if (kind === 'bolt') {
    return (
      <div
        style={{
          ...fill,
          background: accent,
          clipPath: 'polygon(55% 0, 15% 55%, 45% 55%, 30% 100%, 85% 38%, 52% 38%)',
        }}
      />
    );
  }
  if (kind === 'snow') {
    return (
      <div
        style={{
          ...fill,
          borderRadius: '50%',
          backgroundImage: `radial-gradient(circle, ${accent} 5px, transparent 6px)`,
          backgroundSize: '36px 36px',
        }}
      />
    );
  }
  if (kind === 'mist') {
    return (
      <div
        style={{
          ...fill,
          borderRadius: '50%',
          backgroundImage: `repeating-linear-gradient(0deg, ${accent} 0 12px, transparent 12px 28px)`,
        }}
      />
    );
  }
  // idle
  return <div style={{ ...fill, borderRadius: '50%', border: `12px solid ${accent}`, opacity: 0.9 }} />;
}

function Stat({ label, value }) {
  return (
    <div className="border-t-4 border-current pt-3">
      <p className="text-sm font-semibold opacity-70">{label}</p>
      <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e) => {
    e.preventDefault();
    const query = city.trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/weather?city=${encodeURIComponent(query)}`
      );
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

  const condition = weather?.weather?.[0]?.main;
  const t = weather ? THEMES[condition] || THEMES.Clouds : THEMES.idle;

  return (
    <main
      className="poster relative min-h-screen overflow-hidden transition-colors duration-700"
      style={{ background: t.bg, color: t.ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&display=swap');
        .poster { font-family: 'Bricolage Grotesque', system-ui, -apple-system, 'Segoe UI', sans-serif; }
        .poster input::placeholder { color: currentColor; opacity: .45; }
        .poster input:focus, .poster input:focus-visible { outline: none; box-shadow: 0 4px 0 0 currentColor; }
        .poster button:focus-visible { outline: 3px solid currentColor; outline-offset: 4px; }
        @keyframes rise { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .rise { animation: rise .6s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .rise { animation: none; } }
      `}</style>

      {/* Big geometric shape that follows the weather */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[14vmin] top-[10vh] w-[72vmin] h-[72vmin]"
      >
        <Shape kind={t.shape} accent={t.accent} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen max-w-6xl mx-auto w-full px-6 sm:px-10 py-8">
        {/* Search */}
        <form onSubmit={fetchWeather} className="flex items-end gap-3 w-full max-w-xl">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Type a city"
            aria-label="City name"
            className="flex-1 min-w-0 bg-transparent border-b-4 border-current py-2 text-2xl sm:text-3xl font-bold focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-3 font-bold text-lg active:scale-95 transition-transform"
            style={{ background: t.ink, color: t.bg }}
          >
            Search
          </button>
        </form>

        {/* Main area */}
        <div className="flex-1 flex flex-col justify-center py-10">
          {loading && (
            <div className="flex items-center gap-4" role="status">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="text-3xl font-bold">Fetching weather...</p>
            </div>
          )}

          {error && !loading && (
            <div role="alert">
              <h1 className="font-extrabold tracking-tight leading-none" style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}>
                No luck.
              </h1>
              <p className="mt-4 text-2xl font-semibold max-w-md">{error}</p>
            </div>
          )}

          {weather && !loading && (
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {weather.name}, {weather.sys.country}
              </h1>
              <p className="mt-1 text-xl sm:text-2xl font-semibold capitalize opacity-80">
                {weather.weather[0].description}
              </p>

              <div className="rise flex items-start -ml-1 sm:-ml-3 mt-2 select-none">
                <span
                  className="font-extrabold tracking-tighter leading-[0.85]"
                  style={{ fontSize: 'clamp(9rem, 32vw, 24rem)' }}
                >
                  {Math.round(weather.main.temp)}
                </span>
                <span className="font-bold mt-3 sm:mt-8" style={{ fontSize: 'clamp(2rem, 7vw, 5rem)' }}>
                  °C
                </span>
              </div>
            </div>
          )}

          {!weather && !loading && !error && (
            <div>
              <h1 className="font-extrabold tracking-tight leading-[0.9]" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>
                Which city?
              </h1>
              <p className="mt-4 text-xl font-semibold opacity-70 max-w-sm">
                The whole screen changes colour with the weather.
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        {weather && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-6">
            <Stat label="Humidity" value={`${weather.main.humidity}%`} />
            <Stat label="Wind" value={`${weather.wind.speed} m/s`} />
            <Stat label="Feels like" value={`${Math.round(weather.main.feels_like)}°C`} />
            {weather.main.pressure !== undefined && (
              <Stat label="Pressure" value={`${weather.main.pressure} hPa`} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;