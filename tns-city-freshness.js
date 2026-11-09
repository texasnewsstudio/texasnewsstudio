/* TNS city news freshness: client-side classification, no database required. */
(function () {
  const DAYS = 14;
  const now = new Date();
  const main = document.querySelector('main');
  if (!main) return;
  const heading = Array.from(main.querySelectorAll('h2')).find(h => /news reports/i.test(h.textContent));
  if (!heading) return;
  const panel = heading.closest('section');
  if (!panel) return;
  heading.textContent = 'Recent TNS news';
  const stories = Array.from(panel.querySelectorAll(':scope > article.story'));
  const archive = document.createElement('section');
  archive.className = 'panel';
  archive.style.marginTop = '18px';
  archive.innerHTML = '<h2>Previous coverage</h2><p class="note">Older reports are retained with their original publication dates for reference.</p>';
  const archiveItems = document.createElement('div');
  archive.appendChild(archiveItems);
  const cutoff = new Date(now.getTime() - DAYS * 86400000);
  let count = 0;
  for (const story of stories) {
    const meta = story.querySelector('.note');
    const match = meta && meta.textContent.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/);
    const published = match ? new Date(match[0] + ' 12:00:00') : null;
    if (!published || isNaN(published.getTime()) || published < cutoff || published > now) archiveItems.appendChild(story);
    else count++;
  }
  if (!count) {
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = 'No new TNS reports for this city at this time. Check previous coverage below or view current weather and alerts above.';
    panel.appendChild(note);
  }
  if (archiveItems.children.length) panel.insertAdjacentElement('afterend', archive);
})();
