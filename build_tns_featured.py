#!/usr/bin/env python3
"""TNS static-site feature builder. Python 3 + beautifulsoup4 required.
Run from the unzipped site directory: python build_tns_featured.py
Upload the rebuilt directory to Cloudflare Pages. No Workers or Functions needed.
"""
import json, html
from pathlib import Path
from datetime import date
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parent
stories=json.loads((root/'tns-featured-stories.json').read_text(encoding='utf-8'))['stories']
assert isinstance(stories,list) and all(isinstance(x,dict) for x in stories)
for story in stories:
    for key in ('url','headline','summary','category','image','date'):
        assert story.get(key),f"Missing {key} in {story}"
    assert not story['url'].startswith(('http:','https:','/')), "Use local relative URLs"
    assert (root/story['url']).is_file(),f"Missing article file: {story['url']}"
    assert (root/story['image']).is_file(),f"Missing image file: {story['image']}"
# Build from original layout templates to preserve visual design and avoid duplication.
s=BeautifulSoup((root/'tns-featured-index-template.html').read_text(encoding='utf-8'),'html.parser')
hero=s.select_one('.tns-military-carousel')
grid=s.select_one('.tns-three-story-grid')
assert hero and grid, 'Expected hero/card elements not found'
for el in list(hero.select(':scope > a.tns-iran-hero')): el.decompose()
for el in list(grid.select(':scope > a.tns-three-story-card')): el.decompose()
controls=hero.select_one('.tns-military-controls')
assert controls
capacity=min(10,max(2,int(json.loads((root/'tns-featured-stories.json').read_text(encoding='utf-8')).get('hero_capacity',10))))
for i,st in enumerate(stories[:capacity]):
    a=s.new_tag('a',href=st['url'])
    a['class']=['tns-iran-hero']+(['is-active'] if i==0 else [])
    a['aria-label']='Read TNS report: '+st['headline']
    img=s.new_tag('img',src=st['image'],alt=st.get('image_alt') or st['headline'],loading='lazy',decoding='async')
    a.append(img)
    body=s.new_tag('div',attrs={'class':'tns-iran-hero-content'})
    h=s.new_tag('h2');h.string=st['headline'];body.append(h)
    p=s.new_tag('p');p.string=st['summary'];body.append(p)
    footer=s.new_tag('div',attrs={'class':'tns-iran-hero-footer'})
    span=s.new_tag('span');span.string=st['category'];footer.append(span)
    span2=s.new_tag('span');span2['aria-hidden']='true';span2.string='▤';footer.append(span2)
    body.append(footer)
    note=s.new_tag('div',attrs={'class':'tns-iran-hero-note'})
    note.string=st['date']+' · TEXAS NEWS STUDIO';body.append(note)
    a.append(body);controls.insert_before(a)
dots=hero.select_one('.tns-military-dots')
dots.clear()
for i in range(min(capacity,len(stories))):
    b=s.new_tag('button',type='button');b['aria-label']=f'Show story {i+1}';b['data-slide']=str(i);b['aria-current']='true' if i==0 else 'false';dots.append(b)
for st in stories[capacity:capacity+3]:
    a=s.new_tag('a',href=st['url']);a['class']='tns-three-story-card'
    a.append(s.new_tag('img',src=st['image'],alt=st.get('image_alt') or st['headline'],loading='lazy'))
    body=s.new_tag('div',attrs={'class':'tns-three-story-body'})
    tag=s.new_tag('span');tag.string=st['category'];body.append(tag)
    h=s.new_tag('h3');h.string=st['headline'];body.append(h)
    p=s.new_tag('p');p.string=st['summary'];body.append(p)
    a.append(body);grid.append(a)
# Archive ALL published stories, not only the ones visible in hero/cards.
archive=BeautifulSoup((root/'tns-featured-archive-template.html').read_text(encoding='utf-8'),'html.parser')
ol=archive.find('ol')
assert ol
existing={a.get('href') for a in ol.find_all('a')}
for st in sorted(stories,key=lambda x:x['date']):
    if st['url'] in existing:continue
    li=archive.new_tag('li')
    tm=archive.new_tag('time',datetime=st['date'])
    tm.string=date.fromisoformat(st['date']).strftime('%B %-d, %Y')
    link=archive.new_tag('a',href=st['url']);link.string=st['headline']
    li.append(tm);li.append(link);ol.insert(0,li)
(root/'index.html').write_text(str(s),encoding='utf-8')
(root/'news-archive.html').write_text(str(archive),encoding='utf-8')
print(f'Built {min(len(stories),capacity)} hero slides, {min(max(len(stories)-capacity,0),3)} cards; archived all {len(stories)} featured stories.')
