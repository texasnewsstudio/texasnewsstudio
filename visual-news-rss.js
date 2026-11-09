/* Texas News Studio visual showcase: publisher-provided RSS imagery; optional local manual overrides. */
(()=>{'use strict';
const root=document.querySelector('.tns-showcase');if(!root)return;
const img=document.getElementById('tns-feed-image'),link=document.getElementById('tns-feed-link'),meta=document.getElementById('tns-feed-meta'),counter=document.getElementById('tns-feed-count'),disclosure=document.getElementById('tns-feed-disclosure');
const feeds=[
['Fox News','https://moxie.foxnews.com/google-publisher/latest.xml'],
['Fox News World','https://moxie.foxnews.com/google-publisher/world.xml'],
['Newsmax','https://www.newsmax.com/rss/Newsfront/16'],
['RedState','https://redstate.com/feed/'],
['The Gateway Pundit','https://www.thegatewaypundit.com/feed/'],
['The Daily Signal','https://www.dailysignal.com/feed/'],
['Live Science','https://www.livescience.com/feeds/all'],
['NASA','https://www.nasa.gov/feed/']
];
const excluded=/\b(sports?|nfl|nba|mlb|nhl|soccer|football|basketball|baseball|golf|tennis|celebrity|hollywood|entertainment|gossip|porn|sexual|nude|fashion|horoscope|recipe|shopping|dating)\b/i;
const interesting=/\b(breaking|urgent|earthquake|volcano|storm|hurricane|tornado|wildfire|military|war|space|nasa|discovery|scientists?|unusual|mystery|satellite|asteroid|meteor|explosion|evacuation|president|congress|election|texas|china|russia|ukraine|israel|iran)\b/i;
const fmt=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
const KEY='tns-visual-rss-last-good-v1',MAX_AGE=48*3600000;
let stories=[],position=0,working=false;
function validImage(url){try{const u=new URL(url);return u.protocol==='https:'&&!/(\.svg(?:\?|$)|pixel|tracking|favicon|avatar|logo)/i.test(url)}catch{return false}}
function decode(t){const el=document.createElement('textarea');el.innerHTML=t||'';return el.value}
function imageFrom(x){const fields=[x.thumbnail,x.enclosure?.link,x.enclosure?.url,x.image,x['media:thumbnail']?.url,x['media:content']?.url];const body=[x.content,x.description,x.contentEncoded].join(' ');for(const m of body.matchAll(/<img\b[^>]*?(?:src|data-src)\s*=\s*["']([^"']+)["']/gi))fields.push(m[1]);for(let u of fields){u=decode(String(u||'').trim());if(validImage(u))return u}return ''}
function normalize(items,source){return(items||[]).map(x=>({title:decode(String(x.title||'').replace(/<[^>]+>/g,'')).trim(),url:String(x.link||x.url||''),image:imageFrom(x),source,when:Date.parse(x.pubDate||x.published||x.isoDate||x.date||'')})).filter(x=>x.title.length>18&&x.image&&/^https:\/\//.test(x.url)&&Number.isFinite(x.when)&&Date.now()-x.when<MAX_AGE&&x.when<Date.now()+300000&&!excluded.test(x.title))}
function parseXML(xml,source){const doc=new DOMParser().parseFromString(xml,'text/xml');if(doc.querySelector('parsererror'))return [];return Array.from(doc.querySelectorAll('item,entry')).map(node=>{
const val=(tag)=>node.querySelector(tag)?.textContent?.trim()||'';
const attrs=(tag,attr)=>node.getElementsByTagName(tag)[0]?.getAttribute(attr)||'';
const media=Array.from(node.getElementsByTagName('*')).filter(n=>['thumbnail','content'].includes(n.localName)&&/media/i.test(n.namespaceURI||n.prefix||''));
const enclosure=node.querySelector('enclosure');const body=val('description')||val('summary')||val('content');const im=media.map(n=>n.getAttribute('url')).find(validImage)||enclosure?.getAttribute('url')||'';
const title=val('title');const href=node.querySelector('link')?.getAttribute('href')||val('link');const date=val('pubDate')||val('published')||val('updated');
return {title,link:href,pubDate:date,description:body,thumbnail:im}
}).filter(x=>x.link).map(x=>({...x,source}));}
async function getText(url){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),11000);try{const r=await fetch(url,{signal:ctrl.signal,cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return await r.text()}finally{clearTimeout(timer)}}
async function fetchFeed([source,url]){
// Independent routes: one blocked RSS gateway no longer disables the entire panel.
const endpoints=[
'https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(url),
'https://api.allorigins.win/raw?url='+encodeURIComponent(url),
'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(url)
];
for(let i=0;i<endpoints.length;i++)try{
const raw=await getText(endpoints[i]);
const items=i===0?normalize((JSON.parse(raw).items||[]),source):normalize(parseXML(raw,source),source);
if(items.length)return items;
}catch(e){console.warn('Visual RSS route unavailable:',source,i+1,e.message)}
return [];
}
function draw(){if(!stories.length){link.textContent='Visual news images unavailable — check feed connection';link.removeAttribute('href');meta.textContent='Waiting for current RSS stories with images';img.classList.remove('has-image');img.removeAttribute('src');counter.textContent='—';return}
const x=stories[position%stories.length];link.textContent=x.title+' ↗';link.href=x.url;meta.textContent=x.source+' · '+fmt.format(new Date(x.when));counter.textContent=(position+1)+' / '+stories.length;img.classList.remove('has-image');img.onload=()=>img.classList.add('has-image');img.onerror=()=>img.classList.remove('has-image');img.alt='Publisher-provided illustration or photograph accompanying: '+x.title;img.src=x.image;disclosure.textContent=x.manual?'AI illustration · Not a news photograph':'Publisher-provided image · Source credited';}
function step(n){if(!stories.length)return;position=(position+n+stories.length)%stories.length;draw()}
root.querySelector('#tns-prev').addEventListener('click',()=>step(-1));root.querySelector('#tns-next').addEventListener('click',()=>step(1));
async function update(){if(working)return;working=true;try{
const results=await Promise.all(feeds.map(fetchFeed));
let manual=[];try{const r=await fetch('visual-news-manual.json',{cache:'no-store'});if(r.ok){const d=await r.json();manual=(Array.isArray(d)?d:[]).filter(x=>x.title&&validImage(x.image)&&/^https:\/\//.test(x.url)&&x.source).map(x=>({...x,manual:true,when:Date.parse(x.date)||Date.now()}))}}catch{}
const seen=new Set(),all=[...manual,...results.flat().sort((a,b)=>(Number(interesting.test(b.title))-Number(interesting.test(a.title)))*1e12+b.when-a.when)];
const selected=[];for(const x of all){const key=x.title.toLowerCase().replace(/\W+/g,' ').trim();if(seen.has(key))continue;seen.add(key);selected.push(x);if(selected.length>=15)break}
if(selected.length){stories=selected;position=0;draw();try{localStorage.setItem(KEY,JSON.stringify(stories))}catch{}}
else if(!stories.length){draw()}
}finally{working=false}}
try{const cached=JSON.parse(localStorage.getItem(KEY)||'[]');stories=Array.isArray(cached)?cached.filter(x=>x&&x.when&&Date.now()-x.when<MAX_AGE&&validImage(x.image)).slice(0,15):[];if(stories.length)draw()}catch{}
update();setInterval(update,10*60*1000);setInterval(()=>{if(stories.length)step(1)},9000);
})();
