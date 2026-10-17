const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");
const result = document.getElementById("result");

// Open-Meteo: free, no API key needed
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

// Weather codes -> readable text
const WEATHER_CODES = {
  0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Freezing fog",
  51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  56: "Freezing drizzle", 57: "Heavy freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Heavy freezing rain",
  71: "Light snow", 73: "Snow", 75: "Heavy snow", 77: "Snow grains",
  80: "Light showers", 81: "Showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Heavy snow showers",
  95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Severe thunderstorm with hail"
};

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) {
    showMessage("Enter a city name first.", true);
    return;
  }

  searchBtn.disabled = true;
  result.hidden = true;
  showMessage("Loading weather...");

  try {
    // Step 1: city name -> latitude/longitude
    const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1`);
    if (!geoRes.ok) throw new Error("Could not look up that city.");
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`No city found for "${city}". Check the spelling and try again.`);
    }

    const { latitude, longitude, name, admin1, country } = geoData.results[0];

    // Step 2: coordinates -> current weather
    const params = new URLSearchParams({
      latitude,
      longitude,
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
      timezone: "auto"
    });
    const weatherRes = await fetch(`${WEATHER_URL}?${params}`);
    if (!weatherRes.ok) throw new Error("Could not load the weather data.");
    const weatherData = await weatherRes.json();

    showWeather(weatherData.current, [name, admin1, country].filter(Boolean).join(", "));
    showMessage("");
  } catch (err) {
    showMessage(err.message || "Something went wrong. Check your connection and try again.", true);
  } finally {
    searchBtn.disabled = false;
  }
}

function showWeather(current, placeName) {
  document.getElementById("place").textContent = placeName;
  document.getElementById("temp").textContent = Math.round(current.temperature_2m);
  document.getElementById("condition").textContent = WEATHER_CODES[current.weather_code] || "Unknown";
  document.getElementById("feels").textContent = `${Math.round(current.apparent_temperature)}°C`;
  document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
  document.getElementById("wind").textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById("rain").textContent = `${current.precipitation} mm`;
  result.hidden = false;
}

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});