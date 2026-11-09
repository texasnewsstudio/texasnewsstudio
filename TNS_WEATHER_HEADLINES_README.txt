TNS WEATHER HEADLINES — NOV 2026

Upload the contents of this ZIP to the existing Cloudflare Pages site as usual.

New page: /weather-headlines.html
The existing WEATHER dropdown links to the page wherever that shared navigation markup exists.
Texas alerts are fetched from https://tns-weather-automation.mdmeyers65.workers.dev/
National significant alerts are fetched directly from api.weather.gov.

IMPORTANT: This is a live-on-page-load alert viewer, not a scheduled publishing system. The Cron Trigger does not yet execute scheduled updates because the current Worker lacks a scheduled handler and storage. No AI-generated stories are published.

Some NWS browsers/CORS policies or source outages may temporarily prevent feeds from loading. The page shows an error rather than invented data.
