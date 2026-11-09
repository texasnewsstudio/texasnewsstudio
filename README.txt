TEXAS NEWS STUDIO — DIRECT UPLOAD VISUAL + RSS BUILD

Upload this ZIP to Cloudflare Pages using Upload static files.

Includes local imagery assets, existing YouTube/Twitch player and weather studio, and browser RSS feed loading through the public rss2json.com service.

IMPORTANT: This public feed converter is third-party and may rate-limit, reject feeds, or become unavailable. If headlines do not populate, deploy the included separate RSS Worker and set its URL in config.js for a more dependable solution. Headlines always link to publishers; no fabricated headlines.

The sponsor and payment links remain unconfigured until you provide actual URLs.


IMPORTANT REGIONAL HEADLINES FIX (October 2026)
The uploaded site was making 15 separate browser requests to the free rss2json.com API.
That public service can rate-limit or reject those requests. A static-only ZIP cannot
guarantee live RSS retrieval across 15 regions.

To make regional headlines reliable:
1. In Cloudflare dashboard, open Workers & Pages > Create application > Worker.
2. Paste the contents of texas-regional-worker.js into the Worker editor, save and deploy.
3. Copy the resulting HTTPS workers.dev URL.
4. In config.js set texasNewsWorker: 'https://YOUR-WORKER.workers.dev',
5. Upload the site files (excluding texas-regional-worker.js) to Cloudflare Pages.
6. Test the Worker URL with ?region=2 appended: it should return JSON with items.
   If items is empty, the publisher/Google feeds were unavailable upstream.
The Worker fetches RSS server-side, caches successful responses for 10 minutes,
and uses a regional publisher as fallback. Dates render in America/Chicago time.
No current news headlines have been invented or pre-filled.

MULTI-PAGE UPDATE: Separate news.html, military-world.html, markets.html, about.html, support.html, advertise.html. Existing weather.html and texas-news.html retained. Main nav now uses page links; homepage content preserved.
