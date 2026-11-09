/* ───────────────────────────────────────────────────
   LetsPhoenix — projects_script.js
   Baut die Projekte-Seite aus den Daten in projects.js:
   laufender Server, Filter, Karten, Projekt-Fenster und Bildansicht.
   Neue Projekte also nur in projects.js eintragen.
   ─────────────────────────────────────────────────── */
(() => {
  'use strict';
  if (typeof projects === 'undefined') return;
  const { esc, copy, say } = window.LP;
  const $ = (s) => document.querySelector(s);

  /* Filtergruppen (aus den Kommentaren in projects.js). Unbekannte Tags landen in der letzten Gruppe. */
  const GROUPS = [
    { id: 'series', label: 'Reihe',            tags: ['Vileon', 'FlameCraft', 'ModCraft', 'LenoxServer', 'TorchCraft'] },
    { id: 'type',   label: 'Typ',              tags: ['Vanilla', 'Vanilla+', 'Plugins', 'Mods'] },
    { id: 'more',   label: 'Modus & Besonderes', tags: ['Survival', 'Creative', 'YouTube', 'Coming SOON'] }
  ];
  const allTags = [...new Set(projects.flatMap((p) => p.tags || []))];
  allTags.forEach((t) => { if (!GROUPS.some((g) => g.tags.includes(t))) GROUPS[GROUPS.length - 1].tags.push(t); });
  GROUPS.forEach((g) => { g.tags = g.tags.filter((t) => allTags.includes(t)); });
  const TAG_LABEL = { LenoxServer: 'Lenox', 'Coming SOON': 'Demnächst' };
  const tagLabel = (t) => TAG_LABEL[t] || t;

  /* ── Hilfsfunktionen ──────────────────────────── */
  const isRunning = (p) => !p.archived && /running|läuft/i.test(`${p.from} ${p.short}`);
  const isPlanned = (p) => !p.archived && !isRunning(p);
  const statusOf = (p) => (p.archived ? 'done' : isRunning(p) ? 'live' : 'new');
  const badge = (p) => ({
    live: '<span class="badge is-live"><span class="live-dot" aria-hidden="true"></span>Läuft</span>',
    new:  '<span class="badge is-new"><i class="fas fa-hourglass-half" aria-hidden="true"></i>Geplant</span>',
    done: '<span class="badge is-done"><i class="fas fa-box-archive" aria-hidden="true"></i>Beendet</span>'
  }[statusOf(p)]);

  function period(p) {
    const f = (p.from || '').trim(), t = (p.to || '').trim();
    if (/running/i.test(f)) return 'Läuft gerade' + (t ? ' · ' + t : '');
    if (/coming/i.test(f)) return 'Demnächst' + (t ? ' · ' + t : '');
    if (/unbekannt/i.test(f) && /unbekannt/i.test(t)) return 'Zeitraum unbekannt';
    if (f === t) return f;
    return `${f || '?'} – ${t || 'heute'}`;
  }
  const serverAddress = (p) => {
    const m = `${p.short || ''}`.match(/\b(mc\.[a-z0-9-]+(?:\.[a-z0-9-]+)+)/i);
    return m ? m[1].toLowerCase() : '';
  };
  const hasRealCover = (p) => p.cover && !/imgs\.search\.brave\.com/.test(p.cover);

  // Kürzel für generierte Cover, z. B. "FlameCraft 4 - FeuerTee" → "FC4"
  function shortName(p) {
    const base = (p.name || '').split(' - ')[0];
    const caps = (base.match(/[A-Z]/g) || []).join('');
    const num = (base.match(/\d+/) || [''])[0];
    return (caps.length >= 2 ? caps.slice(0, 2) : base.slice(0, 2).toUpperCase()) + num;
  }
  const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  function genCover(p) {
    const series = (p.tags || [])[0] || '';
    const ang = 20 + Math.abs(hash(series)) % 140;
    return `<div class="gen-cover" style="--ang:${ang}deg" aria-hidden="true"><b>${esc(shortName(p))}</b><small>${esc(tagLabel(series))}</small></div>`;
  }
  const coverHtml = (p) => (hasRealCover(p)
    ? `<img src="${esc(p.cover)}" alt="" loading="lazy" data-fallback="${esc(p.id)}">`
    : genCover(p));

  // Bild lädt nicht → generiertes Cover
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.fallback) {
      const p = projects.find((x) => x.id === img.dataset.fallback);
      if (p) img.outerHTML = genCover(p);
    } else if (img.closest('.pm-gallery')) {
      img.replaceWith(Object.assign(document.createElement('i'), { className: 'fas fa-image', ariaHidden: 'true' }));
    }
  }, true);

  /* ── Kennzahlen ───────────────────────────────── */
  const players = [...new Set(projects.flatMap((p) => p.participants || []))].sort((a, b) => a.localeCompare(b, 'de'));
  const imageCount = projects.reduce((n, p) => n + (p.images || []).length, 0);
  $('#p-stats').innerHTML = [
    [projects.length, 'Projekte'],
    [projects.filter((p) => !p.archived).length, 'Aktiv & geplant'],
    [players.length, 'Spieler'],
    [imageCount, 'Screenshots']
  ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');

  /* ── Laufender Server ─────────────────────────── */
  const live = projects.find(isRunning);
  if (live) {
    const addr = serverAddress(live);
    const slot = $('#live-slot');
    slot.hidden = false;
    slot.innerHTML = `
      <article class="live hud">
        <div class="live-cover">${coverHtml(live)}</div>
        <div class="live-body">
          <span class="badge is-live"><span class="live-dot" aria-hidden="true"></span>Server läuft gerade</span>
          <h2 class="feature-title">${esc(live.name)}</h2>
          <p class="feature-desc">${esc(live.short || '')}</p>
          ${addr ? `<div class="addr"><span>Server</span><code>${esc(addr)}</code><button type="button" class="btn btn-sm" id="live-copy" data-cursor="Kopieren"><i class="fas fa-copy" aria-hidden="true"></i> Kopieren</button></div>` : ''}
          <div class="live-actions">
            <button type="button" class="btn" id="live-open" data-cursor="Öffnen"><i class="fas fa-folder-open" aria-hidden="true"></i> Details & Bilder</button>
            <a href="karte.html" class="btn btn-ghost" data-cursor="Karte"><i class="fas fa-map-location-dot" aria-hidden="true"></i> Live Map</a>
            ${live.download ? `<a href="${esc(live.download)}" class="btn btn-ghost" target="_blank" rel="noopener" data-cursor="Download"><i class="fas fa-download" aria-hidden="true"></i> Welt-Download</a>` : ''}
          </div>
          <div class="live-meta">
            <span><i class="fas fa-users" aria-hidden="true"></i>${(live.participants || []).length} Spieler</span>
            <span><i class="fas fa-images" aria-hidden="true"></i>${(live.images || []).length} Bilder</span>
            <span><i class="fas fa-clock" aria-hidden="true"></i>${esc(live.to || '')}</span>
          </div>
        </div>
      </article>`;
    const c = $('#live-copy');
    if (c) c.addEventListener('click', () => copy(addr, 'Serveradresse kopiert'));
    $('#live-open').addEventListener('click', (e) => openModal(live, e.currentTarget));
  }

  /* ── Filter aufbauen ──────────────────────────── */
  const state = { q: '', status: 'all', player: '', tags: new Set() };
  const STATUS = [
    { id: 'all',    label: 'Alle',    n: projects.length },
    { id: 'active', label: 'Aktiv',   n: projects.filter((p) => !p.archived).length },
    { id: 'done',   label: 'Beendet', n: projects.filter((p) => p.archived).length }
  ];
  const statusBox = $('#p-status');
  statusBox.innerHTML = STATUS.map((s) =>
    `<button type="button" class="seg-btn" data-status="${s.id}" aria-pressed="${s.id === 'all'}">${s.label} <span class="n">${s.n}</span></button>`).join('');
  statusBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-status]');
    if (!b) return;
    state.status = b.dataset.status;
    render();
  });

  const playerSel = $('#p-player');
  players.forEach((name) => {
    const n = projects.filter((p) => (p.participants || []).includes(name)).length;
    playerSel.insertAdjacentHTML('beforeend', `<option value="${esc(name)}">${esc(name)} (${n})</option>`);
  });
  playerSel.addEventListener('change', () => { state.player = playerSel.value; render(); });

  $('#p-groups').innerHTML = GROUPS.map((g) => `
    <div>
      <p class="filter-label">${esc(g.label)}</p>
      <div class="chip-row">${g.tags.map((t) => {
        const n = projects.filter((p) => (p.tags || []).includes(t)).length;
        return `<button type="button" class="chip" data-tag="${esc(t)}" aria-pressed="false">${esc(tagLabel(t))} <span class="n">${n}</span></button>`;
      }).join('')}</div>
    </div>`).join('');
  $('#p-groups').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tag]');
    if (!b) return;
    const t = b.dataset.tag;
    state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t);
    render();
  });

  const search = $('#p-search');
  const clear = $('#p-search-clear');
  search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); render(); });
  clear.addEventListener('click', () => { search.value = ''; state.q = ''; render(); search.focus(); });

  $('#p-reset').addEventListener('click', () => {
    state.q = ''; state.status = 'all'; state.player = ''; state.tags.clear();
    search.value = ''; playerSel.value = '';
    render();
  });

  /* ── Filtern & Karten zeichnen ────────────────── */
  function matches(p) {
    if (state.status === 'active' && p.archived) return false;
    if (state.status === 'done' && !p.archived) return false;
    if (state.player && !(p.participants || []).includes(state.player)) return false;
    if (state.q) {
      const hay = `${p.name} ${p.short} ${(p.participants || []).join(' ')} ${(p.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(state.q)) return false;
    }
    // innerhalb einer Gruppe "oder", zwischen Gruppen "und"
    for (const g of GROUPS) {
      const picked = g.tags.filter((t) => state.tags.has(t));
      if (picked.length && !picked.some((t) => (p.tags || []).includes(t))) return false;
    }
    return true;
  }

  const grid = $('#p-grid');
  function card(p) {
    const pics = (p.images || []).length;
    const tags = (p.tags || []).map((t) => `<span class="tag">${esc(tagLabel(t))}</span>`).join('');
    return `
      <button type="button" class="pcard hud" data-id="${esc(p.id)}" data-cursor="Öffnen" aria-label="${esc(p.name)} öffnen">
        <span class="pcard-cover">${coverHtml(p)}${badge(p)}
          ${pics ? `<span class="badge pcard-pics"><i class="fas fa-images" aria-hidden="true"></i>${pics}</span>` : ''}
        </span>
        <span class="pcard-body">
          <span class="pcard-title">${esc(p.name)}</span>
          <span class="pcard-date"><i class="fas fa-calendar" aria-hidden="true"></i>${esc(period(p))}</span>
          <span class="pcard-tags">${tags}</span>
          <span class="pcard-foot">
            <span><i class="fas fa-users" aria-hidden="true"></i> ${(p.participants || []).length || '–'} Spieler</span>
            <span class="go">Öffnen <i class="fas fa-angles-right" aria-hidden="true"></i></span>
          </span>
        </span>
      </button>`;
  }

  function render() {
    const list = projects.filter(matches);
    grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="empty-state"><b>Keine Treffer</b>Kein Projekt passt zu diesen Filtern.</div>';

    statusBox.querySelectorAll('[data-status]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.status === state.status)));
    document.querySelectorAll('#p-groups [data-tag]').forEach((b) => b.setAttribute('aria-pressed', String(state.tags.has(b.dataset.tag))));
    clear.hidden = !search.value;
    const filtered = state.q || state.status !== 'all' || state.player || state.tags.size;
    $('#p-reset').hidden = !filtered;
    $('#p-count').innerHTML = filtered
      ? `<b>${list.length}</b> von ${projects.length} Projekten`
      : `<b>${projects.length}</b> Projekte · neueste zuerst`;
  }
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.pcard');
    if (!b) return;
    const p = projects.find((x) => x.id === b.dataset.id);
    if (p) openModal(p, b);
  });

  /* ── Projekt-Fenster ──────────────────────────── */
  const modal = $('#p-modal');
  const box = $('#p-modal-box');
  let lastFocus = null;
  let current = null;

  const avatar = (name) => `<span class="pl-av" style="--h:${Math.abs(hash(name)) % 360}" aria-hidden="true">${esc(name.slice(0, 1).toUpperCase())}</span>`;

  function setHash(id) {
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) {}
  }

  function openModal(p, from) {
    current = p;
    lastFocus = from || document.activeElement;
    const imgs = p.images || [];
    const addr = serverAddress(p);
    const ppl = p.participants || [];
    box.innerHTML = `
      <button type="button" class="lp-modal-close" id="pm-close" aria-label="Schließen"><i class="fas fa-xmark" aria-hidden="true"></i></button>
      <div class="pm-hero">${coverHtml(p)}
        <div class="pm-hero-text">
          ${badge(p)}
          <h2 id="pm-title">${esc(p.name)}</h2>
          <span class="pm-period"><i class="fas fa-calendar" aria-hidden="true"></i>${esc(period(p))}</span>
        </div>
      </div>
      <div class="pm-body">
        <div class="pm-main">
          <p class="filter-label">Beschreibung</p>
          <p class="pm-desc">${esc(p.short || p.description || 'Zu diesem Projekt gibt es noch keine Beschreibung.')}</p>
          <p class="filter-label">Bilder${imgs.length ? ` · ${imgs.length}` : ''}</p>
          ${imgs.length
            ? `<div class="pm-gallery">${imgs.map((src, i) => `<button type="button" data-i="${i}" aria-label="Bild ${i + 1} von ${imgs.length} öffnen"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>`
            : '<p class="pm-none">Von diesem Projekt gibt es keine Bilder.</p>'}
        </div>
        <aside class="pm-side">
          <div>
            <p class="filter-label">Tags</p>
            <div class="chip-row">${(p.tags || []).map((t) => `<span class="tag">${esc(tagLabel(t))}</span>`).join('')}</div>
          </div>
          <div>
            <p class="filter-label">Teilnehmer${ppl.length ? ` · ${ppl.length}` : ''}</p>
            ${ppl.length
              ? `<ul class="pm-players">${ppl.map((n) => `<li>${avatar(n)}${esc(n)}</li>`).join('')}</ul>`
              : '<p class="pm-none">Noch niemand eingetragen.</p>'}
          </div>
          <div class="pm-actions">
            ${addr ? `<button type="button" class="btn" id="pm-addr" data-cursor="Kopieren"><i class="fas fa-server" aria-hidden="true"></i> ${esc(addr)} kopieren</button>` : ''}
            ${p.download ? `<a href="${esc(p.download)}" class="btn ${addr ? 'btn-ghost' : ''}" target="_blank" rel="noopener" data-cursor="Download"><i class="fas fa-download" aria-hidden="true"></i> Welt herunterladen</a>` : ''}
            <button type="button" class="btn btn-ghost" id="pm-link" data-cursor="Kopieren"><i class="fas fa-link" aria-hidden="true"></i> Link zum Projekt kopieren</button>
          </div>
        </aside>
      </div>`;

    box.querySelector('#pm-close').addEventListener('click', closeModal);
    const a = box.querySelector('#pm-addr');
    if (a) a.addEventListener('click', () => copy(addr, 'Serveradresse kopiert'));
    box.querySelector('#pm-link').addEventListener('click', () => copy(location.href.split('#')[0] + '#' + p.id, 'Link kopiert'));
    const gal = box.querySelector('.pm-gallery');
    if (gal) gal.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) openLightbox(imgs, +b.dataset.i, b);
    });

    modal.hidden = false;
    box.scrollTop = 0;
    document.documentElement.classList.add('lp-locked');
    setHash(p.id);
    box.querySelector('#pm-close').focus({ preventScroll: true });
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    current = null;
    document.documentElement.classList.remove('lp-locked');
    setHash('');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  /* ── Bildansicht ──────────────────────────────── */
  const lb = $('#p-lightbox');
  const lbImg = $('#lb-img');
  let lbList = [], lbIndex = 0, lbFrom = null;
  function showImage() {
    lbImg.src = lbList[lbIndex];
    lbImg.alt = `${current ? current.name + ', ' : ''}Bild ${lbIndex + 1}`;
    $('#lb-count').textContent = `${lbIndex + 1} / ${lbList.length}`;
    $('#lb-prev').hidden = $('#lb-next').hidden = lbList.length < 2;
  }
  function openLightbox(list, i, from) {
    lbList = list; lbIndex = i; lbFrom = from;
    showImage();
    lb.hidden = false;
    $('#lb-close').focus({ preventScroll: true });
  }
  function closeLightbox() {
    if (lb.hidden) return;
    lb.hidden = true;
    if (lbFrom && document.contains(lbFrom)) lbFrom.focus({ preventScroll: true });
  }
  const step = (d) => { lbIndex = (lbIndex + d + lbList.length) % lbList.length; showImage(); };
  $('#lb-prev').addEventListener('click', () => step(-1));
  $('#lb-next').addEventListener('click', () => step(1));
  $('#lb-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  // Wischen auf dem Handy
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && lbList.length > 1) step(dx < 0 ? 1 : -1);
  });

  /* ── Tastatur ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeLightbox(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      return;
    }
    if (!modal.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key === 'Tab') {                         // Fokus im Fenster halten
        const f = [...box.querySelectorAll('button, a[href]')].filter((el) => !el.hidden);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }, true);

  /* ── Direktlink: projects.html#project-14 ────── */
  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const p = id && projects.find((x) => x.id === id);
    if (p && (!current || current.id !== p.id)) openModal(p);
    if (!p && !modal.hidden) closeModal();
  }
  addEventListener('hashchange', fromHash);

  render();
  fromHash();
})();
