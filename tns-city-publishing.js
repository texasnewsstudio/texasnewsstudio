/* Optional on-demand TNS city article index. Static existing reports remain intact. */
(async function(){
  const list=document.querySelector('.tns-city-new-stories');
  const recent=document.getElementById('tns-recent-city-reports');
  if(!list&&!recent)return;
  try {
    const res=await fetch('tns-city-stories.json',{cache:'no-store'});
    if(!res.ok)return;
    const entries=await res.json();
    if(!Array.isArray(entries))return;
    const sorted=entries.filter(x=>x&&x.city&&x.title&&x.date&&x.url).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    const cutoff=new Date(Date.now()-14*86400000);
    const isRecent=x=>{const d=new Date(x.date+'T12:00:00');return !isNaN(d.getTime())&&d>=cutoff&&d<=new Date();};
    function render(root,items,withCity){
      root.replaceChildren();
      if(!items.length){const p=document.createElement('p');p.className='note';p.textContent='No additional reports published yet.';root.append(p);return;}
      for(const item of items){
        const p=document.createElement('p');p.className='story';
        const a=document.createElement('a');
        // Only internal article paths allowed: no external news links.
        if(!/^[a-z0-9][a-z0-9-]*\.html$/i.test(item.url))continue;
        a.href=item.url;a.textContent=item.title;
        const meta=document.createElement('span');meta.className='note';meta.textContent=' — '+item.date+(withCity?' · '+(item.cityName||item.city):'');
        p.append(a,meta);root.append(p);
      }
    }
    if(list){
      const cityItems=sorted.filter(x=>x.city===list.dataset.city);
      render(list,cityItems.filter(isRecent),false);
      const old=cityItems.filter(x=>!isRecent(x));
      if(old.length){let section=document.querySelector('.tns-city-extra-archive');
        if(!section){section=document.createElement('section');section.className='panel tns-city-extra-archive';section.style.marginTop='18px';section.innerHTML='<h2>Previous additional coverage</h2>';list.closest('section').insertAdjacentElement('afterend',section);}
        const container=document.createElement('div');section.append(container);render(container,old,false);
      }
    }
    if(recent)render(recent,sorted.filter(isRecent).slice(0,12),true);
  }catch(e){/* Static content and live weather still work without this optional feed. */}
})();
