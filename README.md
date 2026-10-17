# Weather Now

A simple weather website. Type a city name, click the button, and the current weather is fetched from an API and shown on the page.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure: input box, button and result area |
| `style.css` | Layout and styling |
| `script.js` | Fetches the weather and updates the page |

## How to run

1. Keep all three files in the same folder.
2. Open `index.html` in any modern browser.
3. Type a city name (for example `Jorhat`) and click **Get weather**. Pressing Enter also works.

An internet connection is required. No installation or API key is needed.

## How it works

The app uses [Open-Meteo](https://open-meteo.com/), a free weather API.

1. **Geocoding:** the city name is sent to `https://geocoding-api.open-meteo.com/v1/search`, which returns the latitude and longitude.
2. **Weather:** those coordinates are sent to `https://api.open-meteo.com/v1/forecast`, which returns the current conditions.
3. The result is shown on the page: temperature (°C), condition, feels-like temperature, humidity, wind speed and rain.

## Error handling

- Empty input: asks you to enter a city name.
- City not found: shows a message to check the spelling.
- Network or API failure: shows an error message instead of breaking the page.

## Customizing

- **Units:** add `temperature_unit=fahrenheit` or `wind_speed_unit=mph` to the weather request in `script.js`.
- **More data:** add fields to the `current` parameter in `script.js` (see the Open-Meteo docs), then add matching elements in `index.html`.
- **Colors:** change the variables at the top of `style.css`.

## Notes

Open-Meteo's free tier is meant for non-commercial use. Check their terms before using this in a commercial project.
