#!/usr/bin/env python3
"""Refresh three independent FAA news links from Google News RSS."""
import json, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path

queries = [
  'National Weather Service nationwide internet communications issues when:1d',
  'FAA nationwide ground stop when:1d',
  'FAA air traffic control communications outage when:1d'
]
target = Path('data/faa-breaking-feed.json')
previous = json.loads(target.read_text()) if target.exists() else {'items': []}
items = []
now = datetime.now(timezone.utc)
for i, query in enumerate(queries):
    try:
        url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q':query,'hl':'en-US','gl':'US','ceid':'US:en'})
        request = urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; TNSNewsUpdater/1.0)'})
        with urllib.request.urlopen(request,timeout=20) as response:
            root = ET.fromstring(response.read())
        candidates = []
        for entry in root.findall('./channel/item'):
            title = (entry.findtext('title') or '').strip()
            link = (entry.findtext('link') or '').strip()
            published = entry.findtext('pubDate') or ''
            if not title or not link.startswith('https://'): continue
            try: date = parsedate_to_datetime(published).astimezone(timezone.utc)
            except Exception: continue
            if now-date > timedelta(hours=24) or date>now+timedelta(minutes=30): continue
            if not any(k in title.lower() for k in (('national weather service','nws','weather service') if i == 0 else ('faa','flight','airport','air traffic','ground stop'))): continue
            candidates.append({'title':title[:155],'url':link,'published':date.isoformat()})
        if candidates:
            items.append(candidates[0])
        elif i < len(previous.get('items',[])):
            items.append(previous['items'][i])
    except Exception as exc:
        print('Feed',i,'unavailable:',exc)
        if i < len(previous.get('items',[])): items.append(previous['items'][i])
if len(items)==3 and items != previous.get('items'):
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(json.dumps({'updated':now.isoformat(),'items':items},indent=2)+'\n')
    print('Updated 3 feeds')
else:
    print('No new complete feed; keeping prior data')
