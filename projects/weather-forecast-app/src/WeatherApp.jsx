import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Gauge } from 'lucide-react';

const WeatherApp = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_KEY = import.meta.env.VITE_API_KEY;


  const fetchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!weatherRes.ok) throw new Error('City not found');
      
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();
      
      const dailyForecast = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 5);
      setForecast(dailyForecast.map(item => ({
        dt: item.dt * 1000,
        temp: Math.round(item.main.temp),
        weather: item.weather[0].main,
        icon: item.weather[0].icon
      })));
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weather) => {
    switch (weather) {
      case 'Clear': return <Sun className="text-warning" size={48} />;
      case 'Clouds': return <Cloud className="text-secondary" size={48} />;
      case 'Rain': return <CloudRain className="text-primary" size={48} />;
      default: return <Cloud className="text-secondary" size={48} />;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') fetchWeather();
  };

  return (
    <div className="min-vh-100 bg-gradient-primary py-5">
      <div className="container container-custom px-4">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="text-center mb-4">
              <h1 className="display-4 fw-bold text-white mb-2">Weather Forecast</h1>
              <p className="text-white-50">Get current weather and 5-day forecast</p>
            </div>

            <div className="card weather-card shadow-lg rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="input-group input-group-lg">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter city name..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="btn btn-primary px-4" 
                    onClick={fetchWeather}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
                {error && (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {weather && (
              <>
                <div className="card weather-card shadow-lg rounded-4 mb-4 card-hover">
                  <div className="card-body p-5">
                    <div className="row align-items-center">
                      <div className="col-md-6 text-center text-md-start mb-4 mb-md-0">
                        <h2 className="display-6 fw-bold mb-1">{weather.name}</h2>
                        <p className="text-muted mb-3 text-capitalize">{weather.weather[0].description}</p>
                        <h1 className="display-1 fw-bold mb-0">{Math.round(weather.main.temp)}°C</h1>
                        <p className="text-muted">Feels like {Math.round(weather.main.feels_like)}°C</p>
                      </div>
                      <div className="col-md-6 text-center">
                        {getWeatherIcon(weather.weather[0].main)}
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="row text-center g-3">
                      <div className="col-6 col-md-3">
                        <Wind size={24} className="text-primary mb-2" />
                        <p className="mb-0 small text-muted">Wind Speed</p>
                        <p className="fw-bold mb-0">{weather.wind.speed} m/s</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <Droplets size={24} className="text-info mb-2" />
                        <p className="mb-0 small text-muted">Humidity</p>
                        <p className="fw-bold mb-0">{weather.main.humidity}%</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <Eye size={24} className="text-success mb-2" />
                        <p className="mb-0 small text-muted">Visibility</p>
                        <p className="fw-bold mb-0">{(weather.visibility / 1000).toFixed(1)} km</p>
                      </div>
                      <div className="col-6 col-md-3">
                        <Gauge size={24} className="text-warning mb-2" />
                        <p className="mb-0 small text-muted">Pressure</p>
                        <p className="fw-bold mb-0">{weather.main.pressure} hPa</p>
                      </div>
                    </div>
                  </div>
                </div>

                {forecast.length > 0 && (
                  <div className="card weather-card shadow-lg rounded-4">
                    <div className="card-body p-4">
                      <h4 className="fw-bold mb-4">5-Day Forecast</h4>
                      <div className="row g-3">
                        {forecast.map((day, index) => (
                          <div key={index} className="col">
                            <div className="card h-100 border-0 bg-light card-hover">
                              <div className="card-body text-center p-3">
                                <p className="small text-muted mb-2">
                                  {new Date(day.dt).toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                {getWeatherIcon(day.weather)}
                                <h5 className="fw-bold mt-2 mb-0">{day.temp}°C</h5>
                                <p className="small text-muted mb-0">{day.weather}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;