const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherBox = document.getElementById("weather");
const errorText = document.getElementById("error");

const cityNameEl = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");

// ⚠️ Replace with your own OpenWeatherMap API key
const API_KEY = "d6fb1d0974bad08b756fd8185cada787";

async function getWeather(city) {
  try {
    errorText.textContent = "";
    weatherBox.classList.add("hidden");

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();

    cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
    temperatureEl.textContent = `🌡️ Temperature: ${data.main.temp} °C`;
    descriptionEl.textContent = `☁️ Condition: ${data.weather[0].description}`;
    humidityEl.textContent = `💧 Humidity: ${data.main.humidity}%`;
    windEl.textContent = `💨 Wind Speed: ${data.wind.speed} m/s`;

    weatherBox.classList.remove("hidden");
  } catch (error) {
    errorText.textContent = "Unable to fetch weather. Check city name.";
  }
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
