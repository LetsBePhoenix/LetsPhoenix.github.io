document.addEventListener('DOMContentLoaded', () => {
  /* -- Theme switching -- */
  const themeLink = document.getElementById('theme-stylesheet');
  const select    = document.getElementById('style-select');

  const saved = localStorage.getItem('lp_theme') || 'style_Phoenix.css';
  if (themeLink) themeLink.href = saved;
  if (select)    select.value  = saved;

  applySakura(saved);

  if (select) {
    select.addEventListener('change', () => {
      const val = select.value;
      if (themeLink) themeLink.href = val;
      localStorage.setItem('lp_theme', val);
      applySakura(val);
    });
  }

  /* -- Active nav link -- */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[href], .nav-mobile-panel a[href]').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  /* -- Mobile hamburger menu -- */
  injectMobileNav();
});

/* -- Sakura Petal Effect -- */
let petalInterval = null;

function applySakura(theme) {
  const isSakura = theme === 'style_Sakura.css';
  document.documentElement.setAttribute('data-theme', isSakura ? 'sakura' : '');
  if (isSakura) startPetals();
  else stopPetals();
}

function startPetals() {
  stopPetals();
  const colors = ['#f9bdd1', '#f5a8c4', '#fde0ec', '#f2c4d8', '#fbb6ce', '#f9a8d4'];
  let count = 0;

  function spawnPetal() {
    if (count >= 18) return;
    count++;
    const petal = document.createElement('div');
    petal.className = 'sakura-petal';

    const size   = 8 + Math.random() * 8;
    const left   = Math.random() * 100;
    const dur    = 6 + Math.random() * 8;
    const sway   = 4 + Math.random() * 6;
    const delay  = Math.random() * -dur;
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const rotate = Math.random() * 360;

    petal.style.cssText = `
      left: ${left}vw;
      width: ${size}px;
      height: ${size * 1.1}px;
      background: ${color};
      animation-duration: ${dur}s, ${sway}s;
      animation-delay: ${delay}s, 0s;
      transform: rotate(${rotate}deg);
      box-shadow: inset -2px -2px 4px rgba(180,60,100,0.12);
    `;

    document.body.appendChild(petal);

    petal.addEventListener('animationend', () => {
      petal.remove();
      count--;
    }, { once: true });
  }

  for (let i = 0; i < 10; i++) setTimeout(spawnPetal, i * 200);
  petalInterval = setInterval(spawnPetal, 900);
}

function stopPetals() {
  if (petalInterval) { clearInterval(petalInterval); petalInterval = null; }
  document.querySelectorAll('.sakura-petal').forEach(p => p.remove());
}

/* -- Mobile hamburger menu -- */
function injectMobileNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  /* Create hamburger button */
  const burger = document.createElement('button');
  burger.className = 'nav-hamburger';
  burger.setAttribute('aria-label', 'Men\u00FC \u00F6ffnen');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(burger);

  /* Create mobile panel */
  const panel = document.createElement('div');
  panel.className = 'nav-mobile-panel';
  panel.setAttribute('role', 'navigation');

  const navLinks = [
    { href: 'index.html',      icon: '\u26A1', label: 'Startseite' },
    { href: 'projects.html',   icon: '\uD83D\uDCE6', label: 'Projekte' },
    { href: 'regelwerke.html', icon: '\uD83D\uDCCB', label: 'Regelwerke' },
    { href: 'karte.html',      icon: '\uD83D\uDDFA\uFE0F', label: 'Live Map' },
    { href: 'games.html',      icon: '\uD83C\uDFAE', label: 'Games' },
  ];

  const currentPage = location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.icon + ' ' + link.label;
    if (link.href === currentPage) a.classList.add('active');
    panel.appendChild(a);
  });

  /* Theme switcher in mobile panel */
  const divider = document.createElement('div');
  divider.className = 'nav-mobile-divider';
  panel.appendChild(divider);

  const themeWrap = document.createElement('div');
  themeWrap.className = 'nav-mobile-theme';
  themeWrap.innerHTML = `
    <label for="mobile-style-select">Theme</label>
    <select id="mobile-style-select">
      <option value="style_Phoenix.css">\u26A1 Phoenix</option>
      <option value="style_War-Crime.css">\uD83D\uDD34 War-Crime</option>
      <option value="style_Glacier.css">&#10052; Glacier</option>
      <option value="style_Midnight.css">\uD83C\uDF19 Midnight</option>
      <option value="style_Ruins.css">\uD83C\uDF3F Ruins</option>
      <option value="style_Sakura.css">\uD83C\uDF38 Sakura</option>
    </select>`;
  panel.appendChild(themeWrap);

  document.body.insertBefore(panel, document.querySelector('header, main, .map-wrapper'));

  /* Sync mobile theme select */
  const mobileSelect = panel.querySelector('#mobile-style-select');
  const saved = localStorage.getItem('lp_theme') || 'style_Phoenix.css';
  if (mobileSelect) mobileSelect.value = saved;

  mobileSelect.addEventListener('change', () => {
    const val = mobileSelect.value;
    const themeLink = document.getElementById('theme-stylesheet');
    const desktopSelect = document.getElementById('style-select');
    if (themeLink) themeLink.href = val;
    if (desktopSelect) desktopSelect.value = val;
    localStorage.setItem('lp_theme', val);
    applySakura(val);
  });

  /* Toggle */
  function toggleMenu(open) {
    burger.classList.toggle('open', open);
    panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(!panel.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !nav.contains(e.target) && !panel.contains(e.target)) {
      toggleMenu(false);
    }
  });

  panel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 640 && panel.classList.contains('open')) {
      toggleMenu(false);
    }
  });
}
