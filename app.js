(()=>{'use strict';const c=window.TNS_CONFIG||{};const $=id=>document.getElementById(id);const safeUrl=v=>{try{let u=new URL(v);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}};function setLink(id,url){const e=$(id),v=safeUrl(url);if(e&&v)e.href=v}setLink('youtube-link',c.youtubeLiveVideoId?'https://www.youtube.com/watch?v='+c.youtubeLiveVideoId:c.youtubeChannelUrl);setLink('youtube-player-fallback',c.youtubeLiveVideoId?'https://www.youtube.com/watch?v='+c.youtubeLiveVideoId:c.youtubeChannelUrl);setLink('latest-youtube',c.youtubeChannelUrl);setLink('twitch-link',c.twitchUrl);setLink('bits',c.twitchUrl);setLink('rumble-link',c.rumbleUrl);setLink('rumble-sub',c.rumbleSubscribeUrl);setLink('rumble-rant',c.rumbleRantsUrl||c.rumbleUrl);setLink('paypal',c.paypalUrl);setLink('givesendgo',c.giveSendGoUrl);setLink('superchat',c.youtubeChannelUrl);// Preserve the homepage sponsorship link to advertise.html#contact.// YouTube IFrame API reports playback errors; Twitch is the automatic backup.
// Neither platform reliably exposes whether a channel is merely offline.
const player=$('player');
const videoId=/^[\w-]{11}$/.test(c.youtubeLiveVideoId||'')?c.youtubeLiveVideoId:null;
const channelId=/^UC[\w-]{22}$/.test(c.youtubeChannelId||'')?c.youtubeChannelId:null;
let activePlayer='youtube', youtubeReady=false, ytInstance=null, loadTimer=null;
const status=document.createElement('div');status.className='player-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
const controls=document.createElement('div');controls.className='player-controls';
const ytButton=document.createElement('button');ytButton.type='button';ytButton.className='player-switch';ytButton.textContent='YouTube player';
const twButton=document.createElement('button');twButton.type='button';twButton.className='player-switch';twButton.textContent='Twitch backup';
controls.append(ytButton,twButton);
player.after(controls,status);
function setStatus(message){status.textContent=message;ytButton.setAttribute('aria-pressed',String(activePlayer==='youtube'));twButton.setAttribute('aria-pressed',String(activePlayer==='twitch'))}
function clearVideo(){clearTimeout(loadTimer);if(ytInstance){try{ytInstance.destroy()}catch{}ytInstance=null}player.replaceChildren()}
function twitchParent(){const host=location.hostname.toLowerCase();return host&&host!=='localhost'&&host!=='127.0.0.1'&&host!=='0.0.0.0'?host:null}
function showTwitch(message){activePlayer='twitch';clearVideo();const parent=twitchParent();if(!parent){const e=document.createElement('div');e.className='video-placeholder';e.innerHTML='<strong>Twitch backup is ready for the published website.</strong><p>Twitch requires a public website domain for embedded playback. Open the channel directly while previewing this file.</p>';const a=document.createElement('a');a.href=c.twitchUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Watch Texas News Studio TV on Twitch ↗';e.append(a);player.append(e);setStatus(message||'Twitch backup available on the published website');return}
const frame=document.createElement('iframe');frame.className='video-frame';frame.title='Texas News Studio TV Twitch live stream';frame.allow='autoplay; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src='https://player.twitch.tv/?channel=texasnewsstudiotv&parent='+encodeURIComponent(parent)+'&autoplay=false&muted=true';player.append(frame);setStatus(message||'Twitch backup player selected')}
function showYouTube(){activePlayer='youtube';youtubeReady=false;clearVideo();if(!videoId&&!channelId){showTwitch('YouTube channel not configured; using Twitch');return}
const holder=document.createElement('div');holder.className='video-frame';holder.id='tns-youtube-embed';player.append(holder);setStatus('Connecting to Texas News Studio on YouTube…');
const create=()=>{if(activePlayer!=='youtube'||!window.YT||!window.YT.Player)return;ytInstance=new YT.Player(holder,{height:'360',width:'640',videoId:videoId||undefined,playerVars:{autoplay:0,playsinline:1,rel:0, ...(videoId?{}:{listType:'playlist',list:'',})},events:{onReady:()=>{if(activePlayer!=='youtube')return;youtubeReady=true;clearTimeout(loadTimer);setStatus('YouTube player ready. Twitch is available as backup.')},onError:()=>{if(activePlayer==='youtube')showTwitch('YouTube playback unavailable; switched to Twitch')}}});
// The channel-live URL is used when there is no fixed video ID.
if(!videoId){try{ytInstance.loadVideoByUrl('https://www.youtube.com/embed/live_stream?channel='+channelId)}catch{}}};
// For channel-live playback, use a regular iframe: the YouTube IFrame API
// cannot reliably load channel IDs via loadVideoByUrl.
if(!videoId){player.replaceChildren();const frame=document.createElement('iframe');frame.className='video-frame';frame.title='Texas News Studio live YouTube channel';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.src='https://www.youtube.com/embed/live_stream?channel='+encodeURIComponent(channelId)+'&autoplay=0&enablejsapi=1&origin='+encodeURIComponent(location.origin==='null'?'https://example.com':location.origin);player.append(frame);frame.addEventListener('load',()=>{if(activePlayer==='youtube'){youtubeReady=true;clearTimeout(loadTimer);setStatus('YouTube player loaded. If the channel is offline, choose Twitch backup.')}});loadTimer=setTimeout(()=>{if(activePlayer==='youtube'&&!youtubeReady)showTwitch('YouTube did not load; switched to Twitch')},18000);return}
if(window.YT&&window.YT.Player)create();else{window.onYouTubeIframeAPIReady=create;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{if(activePlayer==='youtube')showTwitch('YouTube API unavailable; switched to Twitch')};document.head.append(script)}loadTimer=setTimeout(()=>{if(activePlayer==='youtube'&&!youtubeReady)showTwitch('YouTube timed out; switched to Twitch')},18000)}
ytButton.addEventListener('click',showYouTube);twButton.addEventListener('click',()=>showTwitch());showYouTube();
const tabs=[...document.querySelectorAll('.tab')],list=$('feed-list');let current='top',cache={};const labels={top:'Top Stories',world:'World & Military',weather:'Weather',markets:'Markets',politics:'Politics',conservative:'Conservative News'};const sourceLinks={top:[['Fox News','https://www.foxnews.com/'],['Newsmax','https://www.newsmax.com/']],world:[['Fox World','https://www.foxnews.com/world'],['Defense News','https://www.defensenews.com/']],weather:[['NOAA','https://www.noaa.gov/news'],['NWS','https://www.weather.gov/']],markets:[['CNBC','https://www.cnbc.com/markets/'],['MarketWatch','https://www.marketwatch.com/']],conservative:[['The Christian Post','https://www.christianpost.com/rss/'],['Judicial Watch','https://www.judicialwatch.org/feed/'],['The Daily Signal','https://www.dailysignal.com/feed/'],['The Federalist','https://thefederalist.com/feed/'],['Washington Free Beacon','https://freebeacon.com/feed/'],['Power Line','https://www.powerlineblog.com/feed'],['The Liberty Daily','https://thelibertydaily.com/feed/'],['Just the News','https://justthenews.com/rss.xml'],['RedState','https://redstate.com/feed/'],['The Gateway Pundit','https://www.thegatewaypundit.com/feed/'],['PJ Media','https://pjmedia.com/feed'],['Townhall','https://townhall.com/rss/']],politics:[['Fox Politics','https://www.foxnews.com/politics'],['Newsmax Politics','https://www.newsmax.com/politics/']]};function msg(title,sub){list.replaceChildren();let e=document.createElement('div');e.className='story';let b=document.createElement('strong');b.textContent=title;let s=document.createElement('small');s.textContent=sub;e.append(b,s);list.append(e)}function draw(cat){current=cat;tabs.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.cat===cat)));if(!cache[cat]){msg('Loading current headlines…','Publisher RSS feeds update automatically.');return}list.replaceChildren();const items=cache[cat];if(!items.length){msg('No current headlines available.','Try another category later.');return}for(const item of items.slice(0,cat==='conservative'?24:5)){let u=safeUrl(item.url);if(!u)continue;const e=document.createElement('article');e.className='story';const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';a.textContent=item.title||'Read original story';const meta=document.createElement('small');meta.textContent=[item.source,formatPublished(item.published)].filter(Boolean).join(' · ');e.append(a,meta);list.append(e)}}function parsePublished(value){if(!value)return null;let v=String(value).trim();/* rss2json supplies UTC timestamps as YYYY-MM-DD HH:mm:ss without a timezone. */if(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(v))v=v.replace(' ','T')+'Z';const d=new Date(v);return Number.isNaN(d.getTime())?null:d;}function formatPublished(value){const d=parsePublished(value);return d?new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(d):'Publication time unavailable';}function renderMini(cat){const root=$(cat+'-feed');if(!root)return;root.replaceChildren();const items=(cache[cat]||[]).slice(0,5);if(items.length){items.forEach(item=>{const url=safeUrl(item.url);if(!url)return;const article=document.createElement('article');article.className='story';const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=item.title;const small=document.createElement('small');small.textContent=[item.source||'Publisher',formatPublished(item.published)].join(' · ');article.append(link,small);root.append(article)})}else{const p=document.createElement('div');p.className='story';p.textContent='Current headlines are temporarily unavailable. Read directly from these publishers:';root.append(p);for(const [name,url] of sourceLinks[cat]||[]){const div=document.createElement('div');div.className='story';const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=name+' ↗';div.append(a);root.append(div)}}}
let watchPage=0;
const tnsSignals={quake:[],solar:[],updated:0};
const tnsSignalLinks={
 quake:'https://earthquake.usgs.gov/earthquakes/map/',
 solar:'https://www.swpc.noaa.gov/',
 unusual:'https://www.usgs.gov/programs/earthquake-hazards'
};
function tnsCard(root,label,className,item,fallback){
 const card=document.createElement(item&&item.url?'a':'div');
 card.className='tns-watch-card '+className;
 if(item&&item.url){const url=safeUrl(item.url);if(url){card.href=url;card.target='_blank';card.rel='noopener noreferrer';}}
 const badge=document.createElement('b');badge.textContent=label;
 const title=document.createElement('span');title.textContent=item?item.title:fallback;
 card.append(badge,title);root.append(card);
}
function tnsNewsItems(items){
 const seen=new Set();
 return (items||[]).filter(i=>{const k=(i.title||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,80);if(!k||seen.has(k)||!safeUrl(i.url))return false;seen.add(k);return true});
}
function renderNewsWatch(){
 const root=$('tns-news-watch-grid');if(!root)return;
 root.replaceChildren();
 const lanes=[
 {label:'WORLD & MILITARY',cls:'tns-watch-world',items:cache.world||[]},
 {label:'U.S. DEVELOPMENTS',cls:'tns-watch-us',items:cache.top||[]},
 {label:'INDEPENDENT VOICES',cls:'tns-watch-analysis',items:cache.conservative||[]}
 ];
 lanes.forEach(lane=>{
  const items=tnsNewsItems(lane.items);
  tnsCard(root,lane.label,lane.cls,items.length?items[watchPage%items.length]:null,'Latest publisher headlines temporarily unavailable');
 });
 const quakes=tnsSignals.quake;
 tnsCard(root,'EARTHQUAKES · USGS','tns-watch-quake',quakes.length?quakes[watchPage%quakes.length]:null,'Checking recent USGS earthquakes…');
 const solar=tnsSignals.solar;
 tnsCard(root,'SOLAR ACTIVITY · NOAA','tns-watch-solar',solar.length?solar[watchPage%solar.length]:null,'Checking NOAA space weather…');
 const unusual=tnsNewsItems([...(cache.world||[]),...(cache.weather||[]),...(cache.top||[])]).filter(i=>/earthquake|volcano|eruption|tsunami|geomagnetic|solar flare|aurora|meteor|asteroid|outbreak|blackout|explosion|emergency|evacuat|space weather/i.test(i.title||''));
 const unusualItem=unusual.length?unusual[watchPage%unusual.length]:null;
 tnsCard(root,'UNUSUAL DEVELOPMENTS','tns-watch-unusual',unusualItem,'No unusual developments identified in the available news feeds');
 const label=$('tns-news-watch-page');if(label)label.textContent='NEWS · EARTHQUAKES · SPACE WEATHER';
}
async function tnsLoadSignals(){
 // USGS GeoJSON: last 24 hours, magnitude 2.5+ worldwide.
 try{
  const r=await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',{signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error('USGS unavailable');
  const d=await r.json();
  tnsSignals.quake=(d.features||[]).filter(x=>Number.isFinite(x.properties?.mag)).sort((a,b)=>b.properties.time-a.properties.time).slice(0,25).map(x=>{
   const p=x.properties,when=new Date(p.time);
   return {title:'M'+Number(p.mag).toFixed(1)+' · '+(p.place||'Location unavailable')+' · '+when.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'UTC'})+' UTC',url:p.url||tnsSignalLinks.quake};
  });
 }catch(e){tnsSignals.quake=[];}
 // NOAA SWPC observed Kp index, not speculative storm warnings.
 try{
  const r=await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',{signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error('NOAA unavailable');
  const d=await r.json();
  const recent=(Array.isArray(d)?d.slice(1):[]).filter(row=>Array.isArray(row)&&Number.isFinite(Number(row[1]))).slice(-12).reverse();
  tnsSignals.solar=recent.map(row=>{
   const kp=Number(row[1]),grade=kp>=9?'G5 extreme':kp>=8?'G4 severe':kp>=7?'G3 strong':kp>=6?'G2 moderate':kp>=5?'G1 minor':'Below storm level';
   return {title:'Observed planetary Kp '+kp.toFixed(1)+' · '+grade+' · '+String(row[0]).replace(' ',' ')+' UTC',url:'https://www.swpc.noaa.gov/products/planetary-k-index'};
  });
 }catch(e){tnsSignals.solar=[];}
 renderNewsWatch();
}
tnsLoadSignals();
setInterval(tnsLoadSignals,10*60*1000);
setInterval(()=>{watchPage++;renderNewsWatch()},15000);
let deskItems=[],deskIndex=0;
function refreshNewsDesk(){
 const allowed=new Set(['Newsmax','Washington Examiner','RedState','Breitbart','RealClearPolitics','The Gateway Pundit','The War Zone','Defense News','Breaking Defense','Newsmax World','Sky News']);
 const candidates=[...(cache.top||[]),...(cache.world||[])].filter(i=>allowed.has(i.source));
 const seen=new Set();deskItems=candidates.filter(i=>{const k=(i.title||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,90);if(!k||seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>(parsePublished(b.published)?.getTime()||0)-(parsePublished(a.published)?.getTime()||0)).slice(0,12);
 deskIndex=0;showDeskHeadline();
}
function showDeskHeadline(){/* Dedicated news-desk.js now controls the ticker. */}
setInterval(showDeskHeadline,9000);
tabs.forEach(b=>b.addEventListener('click',()=>draw(b.dataset.cat)));document.querySelectorAll('[data-category]').forEach(a=>a.addEventListener('click',()=>draw(a.dataset.category)));async function load(cat){try{let data;
if(c.rssEndpoint){const url=new URL(c.rssEndpoint,location.href);url.searchParams.set('category',cat);const res=await fetch(url,{signal:AbortSignal.timeout(11000)});if(!res.ok)throw Error('Worker feed unavailable');data=await res.json();}
else{
const sources={
top:[['The Liberty Daily','https://thelibertydaily.com/feed/'],['Liberty Daily Top Links','https://thelibertydaily.com/category/top-links/feed/'],['Newsmax','https://www.newsmax.com/rss/Newsfront/16'],['Washington Examiner','https://www.washingtonexaminer.com/section/news/feed'],['RedState','https://redstate.com/feed/'],['Breitbart','https://feeds.feedburner.com/breitbart'],['RealClearPolitics','https://www.realclearpolitics.com/index.xml'],['The Gateway Pundit','https://www.thegatewaypundit.com/feed/'],['The War Zone','https://www.twz.com/feed'],['Defense News','https://www.defensenews.com/arc/outboundfeeds/rss/'],['Sky News','https://feeds.skynews.com/feeds/rss/home.xml'],['BBC','https://feeds.bbci.co.uk/news/rss.xml']],
world:[['The War Zone','https://www.twz.com/feed'],['Defense News','https://www.defensenews.com/arc/outboundfeeds/rss/'],['Breaking Defense','https://breakingdefense.com/feed/'],['Newsmax World','https://www.newsmax.com/rss/GlobalTalk/162'],['Sky News','https://feeds.skynews.com/feeds/rss/world.xml'],['BBC World','https://feeds.bbci.co.uk/news/world/rss.xml']],
weather:[['National Hurricane Center','https://www.nhc.noaa.gov/index-at.xml'],['NOAA Weather','https://www.weather.gov/rss_page.php?site_name=nws'],['Fox Weather','https://moxie.foxweather.com/google-publisher/latest.xml']],
markets:[['Newsmax Finance','https://www.newsmax.com/rss/FinanceNews/4'],['MarketWatch','https://feeds.marketwatch.com/marketwatch/topstories/'],['CNBC','https://www.cnbc.com/id/100003114/device/rss/rss.html'],['Fox Business','https://moxie.foxbusiness.com/google-publisher/markets.xml']],
conservative:[['The Christian Post','https://www.christianpost.com/rss/'],['Judicial Watch','https://www.judicialwatch.org/feed/'],['The Daily Signal','https://www.dailysignal.com/feed/'],['The Federalist','https://thefederalist.com/feed/'],['Washington Free Beacon','https://freebeacon.com/feed/'],['Power Line','https://www.powerlineblog.com/feed'],['The Liberty Daily','https://thelibertydaily.com/feed/'],['Just the News','https://justthenews.com/rss.xml'],['RedState','https://redstate.com/feed/'],['The Gateway Pundit','https://www.thegatewaypundit.com/feed/'],['PJ Media','https://pjmedia.com/feed'],['Townhall','https://townhall.com/rss/']],politics:[['The Liberty Daily','https://thelibertydaily.com/feed/'],['Newsmax Politics','https://www.newsmax.com/rss/Politics/1'],['Washington Examiner','https://www.washingtonexaminer.com/section/news/feed'],['RedState','https://redstate.com/feed/'],['RealClearPolitics','https://www.realclearpolitics.com/index.xml'],['Breitbart','https://feeds.feedburner.com/breitbart'],['The Gateway Pundit','https://www.thegatewaypundit.com/feed/']]};
// One headline per publisher in the visible selection. Do not pad a short
// list with repeated BBC (or any other publisher) headlines.
const batches=await Promise.all((sources[cat]||[]).map(async ([name,rss])=>{try{
const endpoint='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(rss);
const res=await fetch(endpoint,{signal:AbortSignal.timeout(11000)});
if(!res.ok)throw Error('RSS unavailable');const raw=await res.json();
if(raw.status!=='ok'||!Array.isArray(raw.items))return [];
return raw.items.slice(0,12).map(i=>({title:i.title,url:i.link,source:name,published:i.pubDate})).filter(i=>i.title&&i.url);
}catch{return []}}));
// Round-robin publishers: diversity first, then additional fresh stories.
const seen=new Set();const items=[];const maxItems=cat==='markets'?5:cat==='top'?12:cat==='conservative'?24:10;
const sorted=batches.map(batch=>batch.filter(i=>{const date=parsePublished(i.published)?.getTime();return date==null||Date.now()-date<7*86400000}).sort((a,b)=>(parsePublished(b.published)?.getTime()||0)-(parsePublished(a.published)?.getTime()||0)));
for(let round=0;round<12&&items.length<maxItems;round++){
 for(const batch of sorted){
  const item=batch[round];if(!item)continue;
  const key=(item.title||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,90);
  if(!key||seen.has(key))continue;
  seen.add(key);items.push(item);
  if(items.length>=maxItems)break;
 }
}
items.sort((a,b)=>(parsePublished(b.published)?.getTime()||0)-(parsePublished(a.published)?.getTime()||0));
if(items.length)data={items};
if(!data)throw Error('RSS unavailable');
}
if(!Array.isArray(data.items))throw Error('Invalid feed');cache[cat]=data.items;if(current===cat)draw(cat);renderMini(cat);if(cat==='top'||cat==='world')refreshNewsDesk();if(cat==='top'||cat==='world'||cat==='conservative')renderNewsWatch();}catch{if(current===cat)msg('Live headlines temporarily unavailable.','Choose a publisher below or check back shortly.');renderMini(cat)}}draw('top');renderNewsWatch();['world','politics','markets','conservative'].forEach(renderMini);Object.keys(labels).forEach(load);setInterval(()=>Object.keys(labels).forEach(load),15*60*1000);})();
