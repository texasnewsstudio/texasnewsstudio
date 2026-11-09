TNS INTELLIGENT HOT TOPICS (NOV 7, 2026)
The existing Hot Topics strip keeps the same appearance.
It now calculates the five most frequently covered subject clusters from tns-featured-stories.json, weighted toward recent entries.
Every link points to an existing featured article, and the strip updates automatically in readers' browsers after each static publishing update.
This is a local, rule-based intelligent ranking, not a generative AI service or a measurement of visitor searches. No Workers, paid API, or database required.
To update: publish new stories using the existing build_tns_featured.py and tns-featured-stories.json workflow.
Fallback links display if the JSON file cannot be loaded.
