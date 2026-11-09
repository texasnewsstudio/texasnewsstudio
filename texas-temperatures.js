/* TNS Texas observed temperatures — NWS primary, Iowa Mesonet fallback. */
(()=>{'use strict';
const stations=[['Dallas','KDAL'],['Fort Worth','KFTW'],['Arlington','KGKY'],['Plano','KADS'],['McKinney','KTKI'],['Denton','KDTO'],['Houston','KHOU'],['Sugar Land','KSGR'],['The Woodlands','KDWH'],['Galveston','KGLS'],['Beaumont','KBPT'],['Port Arthur','KPAO'],['Austin','KAUS'],['Round Rock','KGTU'],['Georgetown','KGTU'],['Horseshoe Bay','KDZB'],['Marble Falls','KBMQ'],['Fredericksburg','KT82'],['San Antonio','KSAT'],['New Braunfels','KBAZ'],['San Marcos','KHYI'],['Corpus Christi','KCRP'],['Kingsville','KNQI'],['Victoria','KVCT'],['Brownsville','KBRO'],['Harlingen','KHRL'],['McAllen','KMFE'],['Laredo','KLRD'],['El Paso','KELP'],['Midland','KMAF'],['Odessa','KODO'],['Lubbock','KLBB'],['Amarillo','KAMA'],['Abilene','KABI'],['Waco','KACT'],['Temple','KTPL'],['Killeen','KGRK'],['Bryan','KCFD'],['College Station','KCLL'],['Tyler','KTYR'],['Longview','KGGG'],['Texarkana','KTXK'],['Lufkin','KLFK'],['Wichita Falls','KSPS'],['Sherman','KGYI'],['San Angelo','KSJT'],['Del Rio','KDRT'],['Eagle Pass','K5T9'],['Alpine','KE38']];
const track=document.getElementById('tx-temp-track'),status=document.getElementById('tx-temp-status');if(!track)return;
let readings=[],offset=0,working=false;
const forecastCities={Dallas:[32.7767,-96.797], 'Fort Worth':[32.7555,-97.3308],Houston:[29.7604,-95.3698],Austin:[30.2672,-97.7431],'Horseshoe Bay':[30.548,-98.376],'Marble Falls':[30.578,-98.273], 'San Antonio':[29.4241,-98.4936],'Corpus Christi':[27.8006,-97.3964],ElPaso:[31.7619,-106.485],Midland:[31.9973,-102.0779],Lubbock:[33.5779,-101.8552],Amarillo:[35.222,-101.8313],Waco:[31.5493,-97.1467],Brownsville:[25.9017,-97.4975], 'El Paso':[31.7619,-106.485]};
let forecasts={};const forecastKey='tnsNwsForecastV1';
try{const cached=JSON.parse(localStorage.getItem(forecastKey)||'null');if(cached&&Date.now()-cached.time<4*3600000)forecasts=cached.forecasts||{}}catch(_){}
const key='tnsTexasNwsIemV1';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function count(){return innerWidth<520?2:innerWidth<850?3:innerWidth<1200?5:7}
function render(){if(!readings.length)return;const n=Math.min(count(),readings.length);track.innerHTML=Array.from({length:n},(_,i)=>{const x=readings[(offset+i)%readings.length];return '<span class="tx-temp-item">'+esc(x.name)+' <b>'+Math.round(x.temp)+'°F</b>'+(forecasts[x.name]?'<small class="tx-forecast">'+esc(forecasts[x.name])+'</small>':'')+'</span>'}).join('')}
try{const x=JSON.parse(localStorage.getItem(key)||'null');if(x&&Date.now()-x.time<3*3600000&&Array.isArray(x.readings)){readings=x.readings;render();status.textContent='Last observed · refreshing'}}catch(_){}
async function json(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),11000);try{const r=await fetch(url,{headers:{Accept:'application/geo+json'},signal:c.signal,cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}}
async function nws(station){const j=await json('https://api.weather.gov/stations/'+encodeURIComponent(station)+'/observations/latest');const p=j.properties||{};const c=p.temperature&&p.temperature.value;const ts=Date.parse(p.timestamp||'');if(c===null||c===undefined||!Number.isFinite(Number(c))||!Number.isFinite(ts)||Date.now()-ts>3*3600000)throw Error('NWS missing/stale');return {temp:Number(c)*9/5+32,ts}}
async function iowa(station){const u='https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?station='+encodeURIComponent(station.replace(/^K/,''))+'&data=tmpf&hours=3&tz=UTC&format=onlycomma&missing=M';const c=new AbortController(),t=setTimeout(()=>c.abort(),11000);try{const r=await fetch(u,{signal:c.signal,cache:'no-store'});if(!r.ok)throw Error('IEM HTTP '+r.status);const lines=(await r.text()).trim().split(/\r?\n/);let found=null;for(const line of lines.slice(1)){const cells=line.split(',');if(cells.length<3)continue;const temp=Number(cells[2]),ts=Date.parse(cells[1].trim().replace(' ','T')+'Z');if(Number.isFinite(temp)&&Number.isFinite(ts)&&Date.now()-ts<3*3600000&&(!found||ts>found.ts))found={temp,ts}}if(!found)throw Error('IEM missing/stale');return found}finally{clearTimeout(t)}}
async function refreshForecasts(){
 const entries=Object.entries(forecastCities);let idx=0,success=0;
 async function worker(){while(idx<entries.length){const [name,coord]=entries[idx++];try{
 const point=await json('https://api.weather.gov/points/'+coord.join(','));const url=point.properties&&point.properties.forecast;
 if(!url||!url.startsWith('https://api.weather.gov/'))continue;
 const data=await json(url);const periods=data.properties&&data.properties.periods;
 if(!Array.isArray(periods)||!periods.length)continue;
 const p=periods[0];if(!Number.isFinite(Number(p.temperature)))continue;
 const short=String(p.name||'Next').replace(/^(This )/,'');
 forecasts[name]=short+' '+Math.round(Number(p.temperature))+'°';success++;
 }catch(e){console.warn('TNS forecast unavailable:',name,e.message)}}}
 await Promise.all(Array.from({length:3},worker));
 if(success){try{localStorage.setItem(forecastKey,JSON.stringify({time:Date.now(),forecasts}))}catch(_){}render()}
}
async function one(station){try{return await nws(station)}catch(_){return await iowa(station)}}
async function refresh(){if(working)return;working=true;let good=0;const result=new Map(readings.map(x=>[x.name,x]));const unique=[...new Set(stations.map(x=>x[1]))];const values=new Map();let cursor=0;
async function worker(){while(cursor<unique.length){const s=unique[cursor++];try{values.set(s,await one(s));good++}catch(e){console.warn('TNS station unavailable:',s,e.message)}}}
try{await Promise.all(Array.from({length:5},worker));for(const [name,s] of stations){if(values.has(s))result.set(name,{name,temp:values.get(s).temp})}readings=stations.map(([name])=>result.get(name)).filter(Boolean);render();if(good){try{localStorage.setItem(key,JSON.stringify({time:Date.now(),readings}))}catch(_){}status.textContent='NWS / Iowa observations · '+new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',hour:'numeric',minute:'2-digit'}).format(new Date())}else{if(!readings.length)track.textContent='Texas observations temporarily unavailable';status.textContent='Weather feeds unavailable · retrying'}}finally{working=false}}
refresh();refreshForecasts();setInterval(refresh,15*60*1000);setInterval(refreshForecasts,60*60*1000);addEventListener('online',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});setInterval(()=>{if(readings.length){offset=(offset+count())%readings.length;render()}},12000);addEventListener('resize',render);
})();
