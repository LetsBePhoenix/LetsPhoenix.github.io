/* ─── Projects Render Script ─── */
(function () {
  const container     = document.getElementById('projectContainer');
  const searchInput   = document.getElementById('searchInput');
  const filterArchived = document.getElementById('filterArchived');
  const filterTag     = document.getElementById('filterTag');
  const filterPlayer  = document.getElementById('filterPlayer');

  if (!container || typeof projects === 'undefined') return;

  /* Populate dropdowns */
  const allPlayers = [...new Set(projects.flatMap(p => p.participants || []))].sort((a,b) => a.localeCompare(b));
  allPlayers.forEach(player => {
    const o = document.createElement('option');
    o.value = o.textContent = player;
    filterPlayer.appendChild(o);
  });

  const allTags = [...new Set(projects.flatMap(p => p.tags || []))].sort((a,b) => a.localeCompare(b));
  allTags.forEach(tag => {
    const o = document.createElement('option');
    o.value = o.textContent = tag;
    filterTag.appendChild(o);
  });

  /* Render */
  function renderProjects() {
    const search  = (searchInput.value || '').toLowerCase();
    const arch    = filterArchived.value;
    const tag     = filterTag.value;
    const player  = filterPlayer.value;

    const filtered = projects.filter(p => {
      const matchName   = (p.name || '').toLowerCase().includes(search);
      const matchArch   = arch === 'all' || (arch === 'archived' ? p.archived : !p.archived);
      const matchTag    = !tag    || (p.tags || []).includes(tag);
      const matchPlayer = !player || (p.participants || []).includes(player);
      return matchName && matchArch && matchTag && matchPlayer;
    });

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = '<div class="empty-state">Keine Projekte gefunden.</div>';
      return;
    }

    filtered.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-card';

      const status = project.archived
        ? '<span class="project-status archived">Beendet</span>'
        : '<span class="project-status active">Aktiv</span>';

      const tags = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

      card.innerHTML = `
        <img src="${project.cover || 'https://placehold.co/400x200/1a2030/00d4c8?text=' + encodeURIComponent(project.name)}" alt="${project.name}" loading="lazy">
        <div class="project-info">
          ${status}
          <h3>${project.name}</h3>
          <p class="project-dates">${project.from || '?'} – ${project.to || 'Heute'}</p>
          <div style="display:flex;flex-wrap:wrap;gap:4px">${tags}</div>
        </div>`;

      card.addEventListener('click', () => openModal(project));
      container.appendChild(card);
    });
  }

  /* Modal */
  function openModal(project) {
    const modal = document.getElementById('projectModal');
    const box   = modal.querySelector('.modal-box');

    const isArchived = project.archived;
    const statusClass = isArchived ? 'archived' : 'active';
    const statusLabel = isArchived ? 'Beendet' : 'Aktiv';

    const coverSrc = project.cover
      ? project.cover
      : `https://placehold.co/960x260/1a2030/00d4c8?text=${encodeURIComponent(project.name)}`;

    const tags = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

    const participants = (project.participants || []).length > 0
      ? (project.participants || []).map(p => `<li>${p}</li>`).join('')
      : '<li>Keine Angabe</li>';

    const galleryHtml = (project.images || []).length > 0
      ? project.images.map(img => `<img src="${img}" alt="${project.name}" loading="lazy">`).join('')
      : '<p class="modal-no-images">Keine Bilder verfügbar.</p>';

    const downloadHtml = project.download
      ? `<a href="${project.download}" class="modal-download-btn" download>
           <i class="fas fa-download"></i> Download
         </a>`
      : '';

    box.innerHTML = `
      <button class="modal-close" id="closeModal" aria-label="Schließen">&times;</button>

      <!-- Hero Image -->
      <div class="modal-hero">
        <img src="${coverSrc}" alt="${project.name}">
        <span class="modal-hero-status ${statusClass}">${statusLabel}</span>
      </div>

      <!-- Header -->
      <div class="modal-header">
        <h2>${project.name}</h2>
        <div class="modal-meta">
          <span class="modal-meta-date"><i class="fas fa-calendar-alt"></i>${project.from || '?'} – ${project.to || 'Heute'}</span>
        </div>
        <div class="modal-tags">${tags}</div>
      </div>

      <!-- Body -->
      <div class="modal-body">

        <!-- Main column -->
        <div class="modal-main">
          <div class="modal-section-label"><i class="fas fa-file-alt"></i> Beschreibung</div>
          <p class="modal-description">${project.short || project.description || 'Keine Beschreibung verfügbar.'}</p>

          <div class="modal-gallery-wrap">
            <div class="modal-section-label"><i class="fas fa-images"></i> Bilder</div>
            <div class="modal-gallery" id="modalGallery">${galleryHtml}</div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="modal-sidebar">
          <div>
            <div class="modal-section-label"><i class="fas fa-users"></i> Teilnehmer</div>
            <ul class="modal-participants-list">${participants}</ul>
          </div>
          ${downloadHtml ? `<div>${downloadHtml}</div>` : ''}
        </div>

      </div>
    `;

    /* Lightbox on gallery images */
    box.querySelectorAll('.modal-gallery img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src));
    });

    /* Close button */
    box.querySelector('#closeModal').onclick = () =>
      modal.classList.remove('open');

    modal.classList.add('open');
  }

  /* Lightbox */
  function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    lb.querySelector('img').src = src;
    lb.classList.add('open');
  }

  /* Close overlay by clicking outside */
  document.getElementById('projectModal').addEventListener('click', e => {
    if (e.target === document.getElementById('projectModal'))
      document.getElementById('projectModal').classList.remove('open');
  });

  document.getElementById('lightbox').addEventListener('click', () =>
    document.getElementById('lightbox').classList.remove('open'));

  /* Filter listeners */
  [searchInput, filterArchived, filterTag, filterPlayer]
    .forEach(el => el.addEventListener('input', renderProjects));

  renderProjects();
})();
