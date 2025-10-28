const container = document.getElementById('projectContainer');
const searchInput = document.getElementById('searchInput');
const filterArchived = document.getElementById('filterArchived');
const filterTag = document.getElementById('filterTag');
const filterPlayer = document.getElementById('filterPlayer');

// Dynamically populate player dropdown sorted A-Z
const allPlayers = [...new Set(projects.flatMap(p => p.participants))].sort((a, b) => a.localeCompare(b));
allPlayers.forEach(player => {
    const option = document.createElement('option');
    option.value = player;
    option.textContent = player;
    filterPlayer.appendChild(option);
});

// Dynamically populate tag dropdown sorted A-Z
const allTags = [...new Set(projects.flatMap(p => p.tags))].sort((a,b) => a.localeCompare(b));
allTags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    filterTag.appendChild(option);
});

function renderProjects() {
    const searchValue = searchInput.value.toLowerCase();
    const archivedValue = filterArchived.value;
    const tagValue = filterTag.value;
    const playerValue = filterPlayer.value;

    container.innerHTML = '';

    projects.filter(p => {
        const matchName = p.name.toLowerCase().includes(searchValue);
        const matchArchived = archivedValue === 'all' || (archivedValue === 'archived' ? p.archived : !p.archived);
        const matchTag = tagValue === '' || p.tags.includes(tagValue);
        const matchPlayer = playerValue === '' || p.participants.includes(playerValue);
        return matchName && matchArchived && matchTag && matchPlayer;
    }).forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <img src="${project.cover || 'https://via.placeholder.com/400x200?text=Kein+Bild'}" alt="${project.name}">
            <div class="project-info">
                <h3>${project.name}</h3>
                <p>${project.from} - ${project.to}</p>
                <div>${project.tags.map(t => `<span class='tag'>${t}</span>`).join('')}</div>
                ${project.download ? `<a href="${project.download}" class="download-btn" download>
                    <i class="fas fa-download"></i> Download
                </a>` : ''}
            </div>
        `;
        card.addEventListener('click', (e) => {
            // Verhindert, dass Klick auf den Download-Button das Modal öffnet
            if (!e.target.closest('.download-btn')) {
                openModal(project);
            }
        });
        container.appendChild(card);
    });
}

function openModal(project) {
    const modal = document.getElementById('projectModal');
    const modalContent = modal.querySelector('.modal-content');

    document.getElementById('modalTitle').textContent = project.name;
    document.getElementById('modalDates').textContent = `${project.from} - ${project.to}`;
    document.getElementById('modalDescription').textContent = project.short;

    const list = document.getElementById('modalParticipants');
    list.innerHTML = project.participants.map(p => `<li>${p}</li>`).join('');

    const gallery = document.getElementById('modalGallery');
    gallery.innerHTML = project.images.length > 0
        ? project.images.map(img => `<img src="${img}" alt="${project.name}">`).join('')
        : '<p>Keine Bilder verfügbar.</p>';

    // Falls das Projekt einen Download hat → Button im Modal einfügen
    if (project.download) {
        const existingBtn = modalContent.querySelector('.modal-download-btn');
        if (existingBtn) existingBtn.remove(); // alten Button entfernen, falls vorhanden

        const downloadBtn = document.createElement('a');
        downloadBtn.href = project.download;
        downloadBtn.className = 'modal-download-btn';
        downloadBtn.setAttribute('download', '');
        downloadBtn.innerHTML = `<i class="fas fa-download"></i> Projekt herunterladen`;
        modalContent.appendChild(downloadBtn);
    }

    modal.style.display = 'flex';

    gallery.querySelectorAll('img').forEach(image => {
        image.addEventListener('click', () => openLightbox(image.src));
    });

    // Close modal when clicking outside modal content
    modal.addEventListener('click', function handler(e) {
        if (!modalContent.contains(e.target)) {
            modal.style.display = 'none';
            modal.removeEventListener('click', handler);
        }
    });
}

function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    lightbox.querySelector('img').src = src;
    lightbox.style.display = 'flex';
}

document.getElementById('lightbox').addEventListener('click', () => {
    document.getElementById('lightbox').style.display = 'none';
});

document.getElementById('closeModal').onclick = () => {
    document.getElementById('projectModal').style.display = 'none';
};

[searchInput, filterArchived, filterTag, filterPlayer].forEach(el => el.addEventListener('input', renderProjects));

renderProjects();
