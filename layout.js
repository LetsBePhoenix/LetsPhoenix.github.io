/* ───────────────────────────────────────────────────
   LetsPhoenix — layout.js
   Fügt auf jeder Seite dieselben Teile ein: Navigation mit „Anpassen“,
   animierten Hintergrund, Statusleiste, Cursor, Toast und Cookie-Abfrage.
   Änderungen an der Navigation also nur hier machen.

   Jede Seite setzt <body data-page="…"> (home, projects, rules, map, games)
   und lädt am Ende:  layout.js → (eigene Skripte) → script.js
   ─────────────────────────────────────────────────── */
(() => {
  'use strict';

  const PAGES = [
    { id: 'home',     href: 'index.html',      label: 'Startseite', icon: 'fa-house' },
    { id: 'projects', href: 'projects.html',   label: 'Projekte',   icon: 'fa-code-branch' },
    { id: 'rules',    href: 'regelwerke.html', label: 'Regelwerke', icon: 'fa-scroll' },
    { id: 'map',      href: 'karte.html',      label: 'Live Map',   icon: 'fa-map-location-dot' },
    { id: 'games',    href: 'games.html',      label: 'Games',      icon: 'fa-gamepad' }
  ];
  const current = document.body.dataset.page || 'home';

  const links = PAGES.map((p) => p.id === current
    ? `<a href="${p.href}" class="active" aria-current="page"><i class="fas ${p.icon} nav-ico" aria-hidden="true"></i>${p.label}</a>`
    : `<a href="${p.href}"><i class="fas ${p.icon} nav-ico" aria-hidden="true"></i>${p.label}</a>`).join('');

  const NAV = `
<nav id="lp-nav">
  <a href="index.html" class="nav-brand" data-cursor="Home">
    <span class="nav-mark" aria-hidden="true"><i class="fas fa-fire-flame-curved"></i></span>
    <span class="nav-name">LETS<b>PHOENIX</b></span>
  </a>
  <div class="nav-links" id="nav-links">${links}</div>
  <div class="nav-spacer"></div>
  <div class="customize">
    <button type="button" class="customize-btn" id="customize-btn" aria-expanded="false" aria-controls="customize-panel" data-cursor="Anpassen">
      <i class="fas fa-sliders" aria-hidden="true"></i><span>Anpassen</span>
    </button>
    <div class="customize-panel" id="customize-panel" role="dialog" aria-label="Seite anpassen" hidden>
      <div class="cp-head">
        <span class="cmd"><span>$</span> settings --edit</span>
        <button type="button" class="cp-close" id="cp-close" aria-label="Schließen"><i class="fas fa-xmark" aria-hidden="true"></i></button>
      </div>
      <div class="cp-tabs" role="tablist" aria-label="Einstellungen">
        <button type="button" role="tab" id="tab-theme" aria-controls="pane-theme" aria-selected="true"  data-tab="theme"><i class="fas fa-palette" aria-hidden="true"></i> Farben</button>
        <button type="button" role="tab" id="tab-bg"    aria-controls="pane-bg"    aria-selected="false" data-tab="bg" tabindex="-1"><i class="fas fa-image" aria-hidden="true"></i> Hintergrund</button>
        <button type="button" role="tab" id="tab-look"  aria-controls="pane-look"  aria-selected="false" data-tab="look" tabindex="-1"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i> Look</button>
      </div>
      <div class="cp-pane" role="tabpanel" id="pane-theme" aria-labelledby="tab-theme">
        <p class="cp-label">Modus</p>
        <div class="cp-mode" role="radiogroup" aria-label="Modus" data-group="mode"></div>
        <p class="cp-label">Farbschema <span class="cp-label-note" id="cp-mode-note"></span></p>
        <div class="cp-options" role="radiogroup" aria-label="Farbschema" data-setting="theme"></div>
      </div>
      <div class="cp-pane" role="tabpanel" id="pane-bg" aria-labelledby="tab-bg" hidden>
        <button type="button" class="cp-switch" id="cp-anim" role="switch" aria-checked="true" data-cursor="Umschalten">
          <span class="cp-switch-text"><b><i class="fas fa-film" aria-hidden="true"></i> Animation</b><small id="cp-anim-hint">Hintergrund bewegt sich</small></span>
          <span class="cp-switch-track" aria-hidden="true"><span class="cp-switch-thumb"></span></span>
        </button>
        <p class="cp-label">Hintergrund</p>
        <div class="cp-options" role="radiogroup" aria-label="Hintergrund" data-setting="bg"></div>
      </div>
      <div class="cp-pane" role="tabpanel" id="pane-look" aria-labelledby="tab-look" hidden>
        <div class="cp-options" role="radiogroup" aria-label="Look" data-setting="look"></div>
      </div>
      <p class="cp-foot" id="cp-foot"></p>
    </div>
  </div>
  <button type="button" class="nav-burger" id="nav-burger" aria-expanded="false" aria-controls="nav-links" aria-label="Menü öffnen">
    <span></span><span></span><span></span>
  </button>
</nav>
<canvas id="bg-canvas" aria-hidden="true"></canvas>`;

  const FOOTER = `
<footer>
  <div class="footer-inner">
    <div class="status">
      <span class="status-item status-accent"><i class="fas fa-fire-flame-curved" aria-hidden="true"></i> LetsPhoenix</span>
      <span class="status-item"><i class="fas fa-palette" aria-hidden="true"></i> <span id="sb-theme">Phoenix</span></span>
      <span class="status-item"><i class="fas fa-cookie-bite" aria-hidden="true"></i> <span id="sb-cookies">Speichern aus</span></span>
      <span class="status-item hide-sm"><i class="fas fa-image" aria-hidden="true"></i> <span id="sb-bg">Vierecke</span></span>
      <span class="status-item hide-sm"><i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i> <span id="sb-look">Gaming</span></span>
      <span class="status-item hide-md"><i class="fas fa-arrow-pointer" aria-hidden="true"></i> <span id="sb-cursor">Cursor: eigener</span></span>
    </div>
    <div class="footer-links">
      <a href="regelwerke.html">Regelwerke</a>
      <a href="https://github.com/LetsBePhoenix" target="_blank" rel="noopener">GitHub</a>
      <button type="button" class="link-btn" data-open-cookies>Cookies</button>
      <span>&copy; <span id="year">${new Date().getFullYear()}</span> LetsPhoenix</span>
    </div>
  </div>
</footer>

<div class="lp-cursor" id="lp-cursor" aria-hidden="true">
  <svg viewBox="0 0 24 28"><path d="M3.2 2.6C3.2 1.6 4.3 1.1 5.1 1.8L19.6 14.2C20.4 14.9 20 16.1 18.9 16.2L13.2 16.7L16.4 23.4C16.7 24.1 16.4 24.8 15.8 25.1L13.9 26C13.2 26.3 12.5 26 12.2 25.4L9.1 18.8L5.1 22.6C4.3 23.3 3.2 22.8 3.2 21.8Z"/></svg>
  <span class="lp-cursor-label" id="lp-cursor-label" hidden></span>
</div>

<div class="lp-toast" id="lp-toast" role="status" aria-live="polite"></div>

<div class="lp-cookie hud" id="lp-cookie" role="dialog" aria-labelledby="lp-cookie-title" aria-describedby="lp-cookie-text" hidden>
  <p class="cmd"><span>$</span> cookies --consent <span class="c-dim" id="lp-cookie-state"></span></p>
  <h3 id="lp-cookie-title"><i class="fas fa-cookie-bite" aria-hidden="true"></i> Spielstand speichern?</h3>
  <p id="lp-cookie-text">Ich würde dein Farbschema, Hell oder Dunkel, deinen Hintergrund, deinen Look und deine Cursor-Einstellung in Cookies speichern, damit beim nächsten Besuch alles so aussieht wie jetzt. Ohne Zustimmung wird nichts gespeichert.</p>
  <button type="button" class="link-btn" id="lp-cookie-more" aria-expanded="false" aria-controls="lp-cookie-details">Was genau gespeichert wird</button>
  <table id="lp-cookie-details" hidden>
    <tr><td><code>lp_consent</code></td><td>Deine Zustimmung</td></tr>
    <tr><td><code>lp_theme</code></td><td>Gewähltes Farbschema</td></tr>
    <tr><td><code>lp_mode</code></td><td>Hell, Dunkel oder System</td></tr>
    <tr><td><code>lp_bg</code></td><td>Gewählter Hintergrund</td></tr>
    <tr><td><code>lp_anim</code></td><td>Hintergrund-Animation an oder aus</td></tr>
    <tr><td><code>lp_look</code></td><td>Gewählter Look</td></tr>
    <tr><td><code>lp_cursor</code></td><td>Eigener Cursor an oder aus</td></tr>
    <tr><td colspan="2" class="note">Laufzeit 1 Jahr · keine Weitergabe · jederzeit über Rechtsklick oder die Statusleiste änderbar</td></tr>
  </table>
  <div class="lp-cookie-actions">
    <button type="button" class="btn btn-ghost" id="lp-cookie-no" data-cursor="Nein">Ablehnen</button>
    <button type="button" class="btn" id="lp-cookie-yes" data-cursor="Ja"><i class="fas fa-floppy-disk" aria-hidden="true"></i> Erlauben</button>
  </div>
</div>`;

  document.body.insertAdjacentHTML('afterbegin', NAV);
  document.body.insertAdjacentHTML('beforeend', FOOTER);

  /* ── Mobiles Menü ───────────────────────────────── */
  const nav = document.getElementById('lp-nav');
  const burger = document.getElementById('nav-burger');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  document.addEventListener('pointerdown', (e) => { if (nav.classList.contains('open') && !nav.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });
  addEventListener('resize', () => { if (innerWidth > 720) setMenu(false); });

  /* ── Kleine Helfer für die Seiten-Skripte ───────── */
  const toast = document.getElementById('lp-toast');
  let t;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const copy = async (text, okMsg) => {
    try { await navigator.clipboard.writeText(text); say(okMsg || 'Kopiert'); }
    catch (e) { say('Kopieren nicht erlaubt – bitte von Hand markieren'); }
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.LP = { say, copy, esc };
})();
