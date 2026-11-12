// Cloudflare Pages Function: server-side ERCOT public dashboard proxy.
// No API key required. Cache briefly; never manufacture grid readings.
export async function onRequestGet({ request }) {
  const url = "https://www.ercot.com/api/1/services/read/dashboards/supply-demand.json";
  try {
    const upstream = await fetch(url, { headers: { "Accept": "application/json", "User-Agent": "TexasNewsStudio-GridMonitor/1.0" }, cf: { cacheTtl: 120, cacheEverything: true } });
    if (!upstream.ok) throw new Error("ERCOT returned " + upstream.status);
    const raw = await upstream.json();
    const rows = Array.isArray(raw.data) ? raw.data : [];
    const records = rows.map(x => {
      const demand = Number(x.demand), capacity = Number(x.capacity), available = Number(x.available);
      const rawTime = x.timestamp ?? x.datetime ?? x.interval ?? x.time ?? x.hour ?? null;
      return { time: rawTime, demand: Number.isFinite(demand) ? demand : null, capacity: Number.isFinite(capacity) ? capacity : null, available: Number.isFinite(available) ? available : null, forecast: x.forecast ?? null };
    }).filter(x => x.demand !== null && (x.capacity !== null || x.available !== null));
    if (!records.length) throw new Error("ERCOT data format unavailable");
    return Response.json({ source: "ERCOT Supply and Demand dashboard", sourceUpdated: raw.lastUpdated ?? raw.last_updated ?? null, retrievedAt: new Date().toISOString(), records }, { headers: { "Cache-Control": "public, max-age=120, s-maxage=120", "Access-Control-Allow-Origin": "*" } });
  } catch (error) {
    return Response.json({ error: "Live ERCOT readings are temporarily unavailable", retrievedAt: new Date().toISOString() }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}