/* ───────────────────────────────────────────────────
   LetsPhoenix — script.js
   Themes · Speichern (nur mit Zustimmung) · eigener Cursor
   Rechtsklick-Menü · Hotkeys · Statusleiste · kleines Easter Egg
   ─────────────────────────────────────────────────── */
(() => {
  'use strict';
  const root = document.documentElement;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* ── Themes ─────────────────────────────────────── */
  // Jedes Farbschema gibt es hell und dunkel. Die Werte hier dienen nur der Vorschau im Panel/Menü,
  // die echten Farben stehen in den style_*.css-Dateien.
  const THEMES = [
    { file: 'style_Phoenix.css',   name: 'Phoenix',   dark: { bg: '#0f1117', acc: '#00d4c8' }, light: { bg: '#eef6f6', acc: '#00968d' } },
    { file: 'style_War-Crime.css', name: 'War-Crime', dark: { bg: '#110a0b', acc: '#ff3b3b' }, light: { bg: '#fbf1f0', acc: '#cc2424' } },
    { file: 'style_Glacier.css',   name: 'Glacier',   dark: { bg: '#0a1520', acc: '#4fb3ff' }, light: { bg: '#eef5fb', acc: '#1a86cf' } },
    { file: 'style_Midnight.css',  name: 'Midnight',  dark: { bg: '#0b0b1a', acc: '#8b7bff' }, light: { bg: '#f3f2fd', acc: '#5f4be6' } },
    { file: 'style_Ruins.css',     name: 'Ruins',     dark: { bg: '#12150f', acc: '#8fbf5a' }, light: { bg: '#f3f2ea', acc: '#4f7f22' } },
    { file: 'style_Sakura.css',    name: 'Sakura',    dark: { bg: '#170d13', acc: '#ff7aa8' }, light: { bg: '#fff5f8', acc: '#d9467c' } }
  ];
  const MODES_UI = [
    { id: 'dark',   name: 'Dunkel', icon: 'fa-solid fa-moon' },
    { id: 'light',  name: 'Hell',   icon: 'fa-solid fa-sun' },
    { id: 'system', name: 'System', icon: 'fa-solid fa-desktop' }
  ];
  const systemLight = matchMedia('(prefers-color-scheme: light)');
  const isTheme = (f) => THEMES.some((t) => t.file === f);
  const themeName = (f) => (THEMES.find((t) => t.file === f) || THEMES[0]).name;

  /* ── Hintergründe & Looks ───────────────────────── */
  const BGS = [
    { id: 'squares', name: 'Vierecke', icon: 'fa-solid fa-border-all',    desc: 'Leuchtende Kacheln' },
    { id: 'matrix',  name: 'Matrix',   icon: 'fa-solid fa-terminal',      desc: 'Fallender Code' },
    { id: 'sakura',  name: 'Sakura',   icon: 'fa-solid fa-spa',           desc: 'Kirschblüten' },
    { id: 'cracks',  name: 'Risse',    icon: 'fa-solid fa-bolt',          desc: 'Klick für neue Risse' }
  ];
  const LOOKS = [
    { id: 'gaming', name: 'Gaming', icon: 'fa-solid fa-gamepad',     desc: 'HUD und scharfe Kanten' },
    { id: 'cute',   name: 'Cute',   icon: 'fa-solid fa-heart',       desc: 'Rund, weich, verspielt' },
    { id: 'broken', name: 'Broken', icon: 'fa-solid fa-heart-crack', desc: 'Glitch und Chaos' },
    { id: 'retro',  name: 'Retro',  icon: 'fa-solid fa-ghost',       desc: '8-Bit-Arcade, Pixel' }
  ];
  const nameOf = (list, id) => (list.find((x) => x.id === id) || list[0]).name;

  /* ── Speicher ───────────────────────────────────────
     Schreibt Cookies. Blockiert der Browser sie (z. B. wenn die Seite
     eingebettet läuft), wird derselbe Wert im lokalen Speicher abgelegt.
     Beides passiert ausschließlich nach Zustimmung. */
  const PREFIX = 'lp_';
  const MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr
  const KEYS = ['theme', 'mode', 'bg', 'anim', 'look', 'cursor'];
  let framed = false;
  try { framed = window.top !== window; } catch (e) { framed = true; }
  const ATTRS = `path=/; ` + (framed && location.protocol === 'https:'
    ? 'SameSite=None; Secure; Partitioned'   // eingebettet: partitioniertes Cookie
    : 'SameSite=Lax');

  const cookie = {
    get(k) {
      try {
        const m = document.cookie.match(new RegExp('(?:^|; )' + PREFIX + k + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
      } catch (e) { return null; }
    },
    set(k, v) { try { document.cookie = `${PREFIX}${k}=${encodeURIComponent(v)}; max-age=${MAX_AGE}; ${ATTRS}`; } catch (e) {} },
    del(k)    { try { document.cookie = `${PREFIX}${k}=; max-age=0; ${ATTRS}`; } catch (e) {} }
  };
  const local = {
    get(k)    { try { return localStorage.getItem(PREFIX + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(PREFIX + k, v); return true; } catch (e) { return false; } },
    del(k)    { try { localStorage.removeItem(PREFIX + k); } catch (e) {} }
  };
  let backend = 'none'; // 'cookie' | 'local' | 'none'
  const storage = {
    read(k) { const c = cookie.get(k); return c !== null ? c : local.get(k); },
    write(k, v) {
      cookie.set(k, v);
      if (cookie.get(k) === String(v)) { local.del(k); backend = 'cookie'; return true; }
      if (local.set(k, v)) { backend = 'local'; return true; }
      backend = 'none'; return false;
    },
    remove(k) { cookie.del(k); local.del(k); }
  };

  let consent = storage.read('consent') === 'yes';
  if (consent) backend = cookie.get('consent') === 'yes' ? 'cookie' : 'local';

  // Animation ist standardmäßig an – außer das System wünscht reduzierte Bewegung
  const prefersStill = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const settings = { theme: 'style_Phoenix.css', mode: 'dark', bg: 'squares', anim: prefersStill ? 'off' : 'on', look: 'gaming', cursor: 'on' };
  if (consent) {
    const mo = storage.read('mode');  if (MODES_UI.some((x) => x.id === mo)) settings.mode = mo;
    const an = storage.read('anim');  if (an === 'on' || an === 'off') settings.anim = an;
    const t = storage.read('theme');  if (isTheme(t)) settings.theme = t;
    const b = storage.read('bg');     if (BGS.some((x) => x.id === b)) settings.bg = b;
    const l = storage.read('look');   if (LOOKS.some((x) => x.id === l)) settings.look = l;
    const c = storage.read('cursor'); if (c === 'on' || c === 'off') settings.cursor = c;
  }
  // Tatsächlich angezeigter Modus (System wird aufgelöst)
  const resolvedMode = () => settings.mode === 'system' ? (systemLight.matches ? 'light' : 'dark') : settings.mode;
  root.dataset.mode = resolvedMode();
  root.dataset.bg = settings.bg;
  root.dataset.anim = settings.anim;
  root.dataset.look = settings.look;
  const save = (k) => { if (consent) storage.write(k, settings[k]); };

  /* ── Toast ──────────────────────────────────────── */
  const toast = $('#lp-toast');
  let toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ── Statusleiste ───────────────────────────────── */
  function updateStatus() {
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('sb-theme', themeName(settings.theme) + ' · ' + nameOf(MODES_UI, resolvedMode()) + (settings.mode === 'system' ? ' (System)' : ''));
    set('sb-bg', nameOf(BGS, settings.bg) + (settings.anim === 'on' ? ' · animiert' : ' · still'));
    set('sb-look', nameOf(LOOKS, settings.look));
    set('sb-cookies', !consent ? 'Speichern aus' : backend === 'local' ? 'Gespeichert (lokal)' : 'Cookies an');
    set('sb-cursor', settings.cursor === 'on' ? 'Cursor: eigener' : 'Cursor: Standard');
  }

  /* ── Theme anwenden ─────────────────────────────── */
  const themeLink = $('#theme-stylesheet');
  const select = $('#style-select');
  function applyTheme(file, announce) {
    if (!isTheme(file)) return;
    settings.theme = file;
    if (themeLink && themeLink.getAttribute('href') !== file) themeLink.setAttribute('href', file);
    if (select) select.value = file;
    save('theme');
    updateStatus();
    document.dispatchEvent(new CustomEvent('lp:change', { detail: 'theme' }));
    if (announce) say('Farben: ' + themeName(file));
  }
  applyTheme(settings.theme);
  if (select) select.addEventListener('change', () => applyTheme(select.value, true));

  /* ── Hell / Dunkel / System ─────────────────────── */
  function applyMode(mode, announce) {
    if (!MODES_UI.some((x) => x.id === mode)) return;
    settings.mode = mode;
    root.dataset.mode = resolvedMode();
    save('mode');
    updateStatus();
    document.dispatchEvent(new CustomEvent('lp:change', { detail: 'mode' }));
    if (announce) say('Modus: ' + nameOf(MODES_UI, mode) + (mode === 'system' ? ' → ' + nameOf(MODES_UI, resolvedMode()) : ''));
  }
  systemLight.addEventListener('change', () => { if (settings.mode === 'system') applyMode('system'); });

  /* ── Jahr ───────────────────────────────────────── */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ── Eigener Cursor ─────────────────────────────── */
  const cur = $('#lp-cursor');
  const curLabel = $('#lp-cursor-label');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let mx = -100, my = -100, cx = mx, cy = my, snap = true, rafId = null;

  const place = () => { cur.style.transform = `translate3d(${cx - 3}px, ${cy - 2}px, 0)`; }; // Pfeilspitze bei (3|2)
  function loop() {
    cx += (mx - cx) * 0.38;
    cy += (my - cy) * 0.38;
    place();
    rafId = requestAnimationFrame(loop);
  }
  const cursorEnabled = () => finePointer && !!cur && settings.cursor === 'on';
  function applyCursor() {
    const on = cursorEnabled();
    root.classList.toggle('lp-cursor-on', on);
    if (!cur) return;
    if (on && !reduce && rafId === null) rafId = requestAnimationFrame(loop);
    if (!on) {
      cur.classList.remove('visible');
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }
  }
  if (cur) {
    addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !cursorEnabled()) return;
      mx = e.clientX; my = e.clientY;
      if (snap || reduce) { cx = mx; cy = my; place(); snap = false; }
      cur.classList.add('visible');
    }, { passive: true });
    document.addEventListener('mouseleave', () => { cur.classList.remove('visible'); snap = true; });
    addEventListener('pointerdown', (e) => { if (e.button === 0) cur.classList.add('down'); });
    addEventListener('pointerup', () => cur.classList.remove('down'));
    document.addEventListener('pointerover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, select, label[for]');
      const inMenu = !!e.target.closest('.lp-ctx');
      cur.classList.toggle('hover', !!target);
      const text = target && !inMenu ? (target.dataset.cursor || '') : '';
      curLabel.textContent = text;
      curLabel.hidden = !text;
    });
  }
  applyCursor();

  function setCursor(value) {
    settings.cursor = value;
    save('cursor');
    applyCursor();
    updateStatus();
    say(value === 'on' ? 'Eigener Cursor an' : 'Standard-Cursor aktiv');
  }

  /* ── Kopieren ───────────────────────────────────── */
  async function copy(text, okMsg) {
    try { await navigator.clipboard.writeText(text); say(okMsg); }
    catch (e) { say('Kopieren nicht erlaubt – bitte Strg + C nutzen'); }
  }

  /* ── Rechtsklick-Menü ───────────────────────────── */
  let menu = null;
  let lastFocus = null;

  function closeMenu() {
    if (!menu) return;
    menu.remove();
    menu = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function item(icon, label, fn, opts = {}) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'menuitem');
    b.tabIndex = -1;
    if (opts.disabled) b.disabled = true;
    b.innerHTML = `<i class="${icon}" aria-hidden="true"></i><span></span>${opts.key ? `<span class="k">${opts.key}</span>` : ''}`;
    b.querySelector('span').textContent = label;
    b.addEventListener('click', () => { closeMenu(); fn(); });
    return b;
  }
  const sep = () => document.createElement('hr');

  function openMenu(x, y, target) {
    closeMenu();
    lastFocus = document.activeElement;

    const selection = String(window.getSelection() || '').trim();
    const link = target.closest('a[href]');
    const img = target.closest('img');

    menu = document.createElement('div');
    menu.className = 'lp-ctx';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Phoenix-Menü');

    const head = document.createElement('div');
    head.className = 'lp-ctx-head';
    head.innerHTML = `<span>// Phoenix-Menü</span><span>X ${Math.round(x)} · Y ${Math.round(y)}</span>`;
    menu.appendChild(head);

    let contextual = false;
    if (selection) {
      menu.appendChild(item('fa-regular fa-copy', 'Auswahl kopieren', () => copy(selection, 'Auswahl kopiert'), { key: 'Strg C' }));
      contextual = true;
    }
    if (link) {
      const external = link.target === '_blank' || link.hostname !== location.hostname;
      menu.appendChild(item('fa-solid fa-arrow-right', 'Link öffnen', () => {
        if (external) window.open(link.href, '_blank', 'noopener'); else location.href = link.href;
      }));
      menu.appendChild(item('fa-solid fa-up-right-from-square', 'In neuem Tab öffnen', () => window.open(link.href, '_blank', 'noopener')));
      menu.appendChild(item('fa-solid fa-link', 'Link kopieren', () => copy(link.href, 'Link kopiert')));
      contextual = true;
    }
    if (img) {
      menu.appendChild(item('fa-regular fa-image', 'Bild in neuem Tab öffnen', () => window.open(img.src, '_blank', 'noopener')));
      menu.appendChild(item('fa-regular fa-copy', 'Bildadresse kopieren', () => copy(img.src, 'Bildadresse kopiert')));
      contextual = true;
    }
    if (contextual) menu.appendChild(sep());

    menu.appendChild(item('fa-solid fa-arrow-left', 'Zurück', () => history.back(), { disabled: history.length < 2, key: 'Alt ←' }));
    menu.appendChild(item('fa-solid fa-rotate-right', 'Neu laden', () => location.reload(), { key: 'F5' }));
    menu.appendChild(item('fa-solid fa-arrow-up', 'Nach oben', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }), { disabled: scrollY < 10 }));
    menu.appendChild(item('fa-solid fa-share-nodes', 'Seitenadresse kopieren', () => copy(location.href, 'Adresse kopiert')));
    menu.appendChild(sep());

    const label = document.createElement('div');
    label.className = 'lp-ctx-label';
    label.textContent = 'Farbschema · ' + themeName(settings.theme);
    menu.appendChild(label);
    const themes = document.createElement('div');
    themes.className = 'lp-ctx-themes';
    themes.setAttribute('role', 'group');
    themes.setAttribute('aria-label', 'Theme wählen');
    THEMES.forEach((t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      b.setAttribute('role', 'menuitemradio');
      b.setAttribute('aria-checked', String(t.file === settings.theme));
      b.setAttribute('aria-label', t.name);
      b.title = t.name;
      b.style.background = t[resolvedMode()].acc;
      b.addEventListener('click', () => { closeMenu(); applyTheme(t.file, true); });
      themes.appendChild(b);
    });
    menu.appendChild(themes);
    const isLight = resolvedMode() === 'light';
    menu.appendChild(item(
      isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun',
      isLight ? 'Dunklen Modus verwenden' : 'Hellen Modus verwenden',
      () => applyMode(isLight ? 'dark' : 'light', true)
    ));
    menu.appendChild(sep());

    if (finePointer) {
      menu.appendChild(item(
        'fa-solid fa-arrow-pointer',
        settings.cursor === 'on' ? 'Standard-Cursor verwenden' : 'Eigenen Cursor verwenden',
        () => setCursor(settings.cursor === 'on' ? 'off' : 'on')
      ));
    }
    menu.appendChild(item('fa-solid fa-image', 'Hintergrund · ' + nameOf(BGS, settings.bg), () => openPanel('bg')));
    menu.appendChild(item(
      settings.anim === 'on' ? 'fa-solid fa-pause' : 'fa-solid fa-play',
      settings.anim === 'on' ? 'Animation anhalten' : 'Animation abspielen',
      () => applyAnim(settings.anim === 'on' ? 'off' : 'on', true)
    ));
    menu.appendChild(item('fa-solid fa-wand-magic-sparkles', 'Look · ' + nameOf(LOOKS, settings.look), () => openPanel('look')));
    menu.appendChild(item('fa-solid fa-cookie-bite', 'Cookie-Einstellungen', showCookieDialog));

    document.body.appendChild(menu);

    const r = menu.getBoundingClientRect();
    const pad = 12;
    let left = x, top = y, ox = 'left', oy = 'top';
    if (left + r.width > innerWidth - pad)  { left = Math.max(pad, x - r.width);  ox = 'right'; }
    if (top + r.height > innerHeight - pad) { top = Math.max(pad, y - r.height); oy = 'bottom'; }
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.style.transformOrigin = `${oy} ${ox}`;

    const first = menuButtons()[0];
    if (first) first.focus({ preventScroll: true });
  }
  const menuButtons = () => (menu ? [...menu.querySelectorAll('button:not([disabled])')] : []);

  document.addEventListener('contextmenu', (e) => {
    if (e.shiftKey) return;
    if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    e.preventDefault();
    let x = e.clientX, y = e.clientY;
    if (!x && !y) {
      const el = document.activeElement;
      const b = el && el !== document.body ? el.getBoundingClientRect() : null;
      x = b ? b.left : 24;
      y = b ? b.bottom + 6 : 96;
    }
    openMenu(x, y, e.target);
  });
  document.addEventListener('pointerdown', (e) => { if (menu && !menu.contains(e.target)) closeMenu(); });
  addEventListener('scroll', closeMenu, { passive: true });
  addEventListener('resize', closeMenu);
  addEventListener('blur', closeMenu);

  /* ── Tastatur: Menü, Hotkeys, Easter Egg ────────── */
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konami = 0;

  document.addEventListener('keydown', (e) => {
    if (menu) {
      const list = menuButtons();
      const i = list.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      return;
    }
    if (e.key === 'Escape' && panel && !panel.hidden) { closePanel(true); return; }
    if (e.key === 'Escape' && dialog && !dialog.hidden) { dialog.hidden = true; return; }
    if (panel && !panel.hidden && panel.contains(e.target)) return; // keine Hotkeys im Panel
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;

    // Easter Egg: ↑ ↑ ↓ ↓ ← → ← → B A
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konami = k === KONAMI[konami] ? konami + 1 : (k === KONAMI[0] ? 1 : 0);
    if (konami === KONAMI.length) {
      konami = 0;
      const g = $('.glitch');
      if (g) { g.classList.add('turbo'); setTimeout(() => g.classList.remove('turbo'), 4000); }
      say('Cheat aktiviert: +30 Leben');
      return;
    }
    if (konami > 0) return; // während der Eingabe keine Hotkeys auslösen

    // Hotkeys der Level-Kacheln
    const tile = document.querySelector(`.area-tile[data-key="${k}"]`);
    if (tile) {
      e.preventDefault();
      tile.classList.add('pressed');
      tile.focus({ preventScroll: true });
      setTimeout(() => { location.href = tile.href; }, 160);
    }
  });

  /* ── Cookie-Abfrage ─────────────────────────────── */
  const dialog = $('#lp-cookie');
  function showCookieDialog() {
    if (!dialog) return;
    $('#lp-cookie-state').textContent = consent ? '# aktuell erlaubt' : '# aktuell nicht erlaubt';
    dialog.hidden = false;
    $(consent ? '#lp-cookie-no' : '#lp-cookie-yes').focus({ preventScroll: true });
  }
  if (dialog) {
    $('#lp-cookie-yes').addEventListener('click', () => {
      consent = true;
      const ok = storage.write('consent', 'yes');
      KEYS.forEach((k) => save(k));        // aktuelle Einstellungen sofort sichern
      dialog.hidden = true;
      updateStatus();
      if (!ok) say('Dein Browser erlaubt hier kein Speichern');
      else if (backend === 'local') say('Gespeichert – Cookies blockiert, lokaler Speicher genutzt');
      else say('Spielstand gespeichert');
    });
    $('#lp-cookie-no').addEventListener('click', () => {
      const had = consent;
      consent = false;
      backend = 'none';
      storage.remove('consent');
      KEYS.forEach((k) => storage.remove(k));
      dialog.hidden = true;
      updateStatus();
      say(had ? 'Gespeicherte Daten gelöscht' : 'Es wird nichts gespeichert');
    });
    $('#lp-cookie-more').addEventListener('click', (e) => {
      const d = $('#lp-cookie-details');
      d.hidden = !d.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!d.hidden));
    });
    $$('[data-open-cookies], #open-cookies').forEach((b) => b.addEventListener('click', showCookieDialog));
    if (!consent) setTimeout(showCookieDialog, 700);
  }
  updateStatus();

  /* ── Avatar: Ersatz, falls das Bild nicht lädt ──── */
  $$('.avatar img').forEach((img) => {
    const fail = () => img.closest('.avatar').classList.add('no-img');
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener('error', fail);
  });

  /* ── Lichtkegel auf HUD-Karten ──────────────────── */
  if (finePointer && !reduce) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.hud');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ───────────────────────────────────────────────────
     Anpassen-Panel: Reiter Farben · Hintergrund · Look
     ─────────────────────────────────────────────────── */
  const panel = $('#customize-panel');
  const panelBtn = $('#customize-btn');
  const tabs = $$('.cp-tabs [role="tab"]');

  function applyBg(id, announce) {
    if (!BGS.some((x) => x.id === id)) return;
    settings.bg = id;
    root.dataset.bg = id;
    save('bg');
    updateStatus();
    document.dispatchEvent(new CustomEvent('lp:change', { detail: 'bg' }));
    if (announce) say('Hintergrund: ' + nameOf(BGS, id));
  }
  function applyLook(id, announce) {
    if (!LOOKS.some((x) => x.id === id)) return;
    settings.look = id;
    root.dataset.look = id;
    save('look');
    updateStatus();
    document.dispatchEvent(new CustomEvent('lp:change', { detail: 'look' }));
    if (announce) say('Look: ' + nameOf(LOOKS, id));
  }

  function applyAnim(value, announce) {
    if (value !== 'on' && value !== 'off') return;
    settings.anim = value;
    root.dataset.anim = value;
    save('anim');
    updateStatus();
    renderAnimSwitch();
    document.dispatchEvent(new CustomEvent('lp:change', { detail: 'anim' }));
    if (announce) say(value === 'on' ? 'Hintergrund-Animation an' : 'Hintergrund-Animation aus');
  }

  // Segment-Umschalter (wie "Modus"), wird für Modus und Animation genutzt
  function renderSegment(group, items, current, onPick) {
    const box = panel.querySelector(`.cp-mode[data-group="${group}"]`);
    if (!box) return;
    box.innerHTML = '';
    items.forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cp-mode-btn';
      b.setAttribute('role', 'radio');
      b.dataset.value = group + ':' + m.id;
      b.dataset.cursor = m.name;
      const checked = current === m.id;
      b.setAttribute('aria-checked', String(checked));
      b.tabIndex = checked ? 0 : -1;
      b.innerHTML = `<i class="${m.icon}" aria-hidden="true"></i><span></span>`;
      b.querySelector('span').textContent = m.name;
      b.addEventListener('click', () => onPick(m.id));
      box.appendChild(b);
    });
  }
  // Schalter für die Hintergrund-Animation (oben im Reiter Hintergrund)
  const animSwitch = $('#cp-anim');
  function renderAnimSwitch() {
    if (!animSwitch) return;
    const on = settings.anim === 'on';
    animSwitch.setAttribute('aria-checked', String(on));
    const hint = $('#cp-anim-hint');
    if (hint) hint.textContent = on ? 'Hintergrund bewegt sich' : 'Ruhiges Standbild';
  }
  if (animSwitch) animSwitch.addEventListener('click', () => applyAnim(settings.anim === 'on' ? 'off' : 'on', true));

  function renderModes() {
    renderSegment('mode', MODES_UI, settings.mode, (v) => applyMode(v, true));
    const note = $('#cp-mode-note');
    if (note) note.textContent = settings.mode === 'system'
      ? '· System zeigt gerade ' + nameOf(MODES_UI, resolvedMode())
      : '· Vorschau ' + nameOf(MODES_UI, resolvedMode());
  }

  function renderOptions() {
    if (!panel) return;
    renderAnimSwitch();
    renderModes();
    const shown = resolvedMode();
    const groups = {
      theme: THEMES.map((t) => ({ id: t.file, name: t.name, swatch: t[shown], desc: shown === 'light' ? 'Hell' : 'Dunkel' })),
      bg: BGS,
      look: LOOKS
    };
    Object.entries(groups).forEach(([key, list]) => {
      const box = panel.querySelector(`.cp-options[data-setting="${key}"]`);
      if (!box) return;
      box.innerHTML = '';
      list.forEach((opt) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'cp-opt';
        b.setAttribute('role', 'radio');
        b.dataset.value = opt.id;
        b.dataset.cursor = 'Wählen';
        const checked = settings[key] === opt.id;
        b.setAttribute('aria-checked', String(checked));
        b.tabIndex = checked ? 0 : -1;
        b.innerHTML =
          (opt.swatch
            ? `<span class="cp-swatch" style="--sw-bg:${opt.swatch.bg};--sw:${opt.swatch.acc}" aria-hidden="true"><span></span></span>`
            : `<span class="cp-icon cp-prev-${opt.id}" aria-hidden="true"><i class="${opt.icon}"></i></span>`) +
          `<span class="cp-text"><b></b>${opt.desc ? '<small></small>' : ''}</span>` +
          `<i class="fas fa-check cp-check" aria-hidden="true"></i>`;
        b.querySelector('b').textContent = opt.name;
        if (opt.desc) b.querySelector('small').textContent = opt.desc;
        b.addEventListener('click', () => {
          if (key === 'theme') applyTheme(opt.id, true);
          else if (key === 'bg') applyBg(opt.id, true);
          else applyLook(opt.id, true);
        });
        box.appendChild(b);
      });
    });
    const foot = $('#cp-foot');
    if (foot) foot.textContent = consent
      ? 'Deine Auswahl wird gespeichert.'
      : 'Wird nicht gespeichert, solange Cookies abgelehnt sind.';
  }

  function selectTab(name, focus) {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  function openPanel(tab) {
    if (!panel) return;
    renderOptions();
    selectTab(tab || 'theme');
    panel.hidden = false;
    panelBtn.setAttribute('aria-expanded', 'true');
    const sel = panel.querySelector('.cp-pane:not([hidden]) [aria-checked="true"]');
    (sel || tabs[0]).focus({ preventScroll: true });
  }
  function closePanel(returnFocus) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    panelBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) panelBtn.focus({ preventScroll: true });
  }

  if (panel) {
    panelBtn.addEventListener('click', () => (panel.hidden ? openPanel() : closePanel()));
    $('#cp-close').addEventListener('click', () => closePanel(true));
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => selectTab(t.dataset.tab));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
          selectTab(n.dataset.tab, true);
        }
      });
    });
    panel.addEventListener('keydown', (e) => {   // Pfeiltasten innerhalb einer Auswahl
      const opt = e.target.closest('.cp-opt, .cp-mode-btn');
      if (!opt || !['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
      e.preventDefault();
      const list = [...opt.parentElement.children];
      const i = list.indexOf(opt);
      const next = list[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length];
      next.focus();
    });
    document.addEventListener('pointerdown', (e) => {
      if (!panel.hidden && !panel.contains(e.target) && !panelBtn.contains(e.target)) closePanel();
    });
    document.addEventListener('lp:change', () => { if (!panel.hidden) {
      const active = panel.querySelector('.cp-pane:not([hidden])');
      const focusedValue = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.value : null;
      renderOptions();
      if (focusedValue && active) { const f = active.querySelector(`.cp-opt[data-value="${CSS.escape(focusedValue)}"]`); if (f) f.focus({ preventScroll: true }); }
    } });
  }

  /* ───────────────────────────────────────────────────
     Look "Broken": Zeichen in Überschriften gehen kurz kaputt.
     Nur Überschriften und Beschreibungen – nie Links, Buttons oder Navigation.
     Der Originaltext ist nach spätestens einer halben Sekunde wieder da.
     Läuft nur, wenn die Animation an ist.
     ─────────────────────────────────────────────────── */
  const GLYPHS = '█▓▒░#@$%&?!<>/\\_|=+*01¿§';
  const CORRUPT_TARGETS = '.block-head h2, .profile-text h2, .area-title, .area-desc, .section-title, .hero-sub, .block-sub, .page-head h1, .page-sub, .feature-title, .feature-desc';
  let corruptTimer = null;
  function corruptOnce() {
    const els = $$(CORRUPT_TARGETS).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < innerHeight && !el.dataset.corrupting;   // nur sichtbare
    });
    if (!els.length) return;
    const el = els[(Math.random() * els.length) | 0];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.nodeValue.trim() ? 1 : 2 });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (!nodes.length) return;
    el.dataset.corrupting = '1';
    if (!el.hasAttribute('aria-label')) { el.setAttribute('aria-label', el.textContent.trim()); el.dataset.lpLabel = '1'; }
    const originals = nodes.map((n) => n.nodeValue);
    const restore = () => {
      nodes.forEach((n, i) => { n.nodeValue = originals[i]; });
      el.classList.remove('lp-corrupt');
      if (el.dataset.lpLabel) { el.removeAttribute('aria-label'); delete el.dataset.lpLabel; }
      delete el.dataset.corrupting;
    };
    const scramble = () => {
      nodes.forEach((n, i) => {
        const chars = originals[i].split('');
        const hits = Math.max(1, Math.round(chars.length * (Math.random() * .12 + .04)));
        for (let k = 0; k < hits; k++) {
          const j = (Math.random() * chars.length) | 0;
          if (chars[j].trim()) chars[j] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        n.nodeValue = chars.join('');
      });
      el.classList.add('lp-corrupt');
    };
    scramble();
    setTimeout(() => { nodes.forEach((n, i) => { n.nodeValue = originals[i]; }); el.classList.remove('lp-corrupt'); }, 90);
    setTimeout(scramble, 160);
    setTimeout(restore, 160 + 120 + Math.random() * 180);
  }
  function corruptionLoop() {
    clearTimeout(corruptTimer);
    corruptTimer = null;
    if (settings.look !== 'broken' || settings.anim !== 'on') return;
    corruptTimer = setTimeout(() => {
      if (!document.hidden) corruptOnce();
      corruptionLoop();
    }, 900 + Math.random() * 1800);
  }
  document.addEventListener('lp:change', (e) => { if (e.detail === 'look' || e.detail === 'anim') corruptionLoop(); });
  corruptionLoop();

  /* ───────────────────────────────────────────────────
     Animierter Hintergrund (Canvas)
     ─────────────────────────────────────────────────── */
  const canvas = $('#bg-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let W = 0, H = 0, DPR = 1, bgRaf = null, bgMode = null, lastT = 0;
  let px = -9999, py = -9999;                      // Mausposition für die Vierecke
  const col = { acc: '0,212,200', acc2: '0,153,230', petals: [], light: false };
  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; }, { passive: true });
  document.addEventListener('mouseleave', () => { px = py = -9999; });

  // Farbe in "r,g,b" umwandeln (versteht #hex, rgb() und "r,g,b")
  function toRgb(v) {
    v = (v || '').trim();
    if (/^#/.test(v)) {
      let h = v.slice(1);
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h.slice(0, 6), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    const m = v.match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/);
    return m ? [+m[1], +m[2], +m[3]] : [0, 212, 200];
  }
  // Mischt eine Farbe mit Weiß (t > 0) oder Schwarz (t < 0)
  const shade = ([r, g, b], t) => (t >= 0
    ? [r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t]
    : [r * (1 + t), g * (1 + t), b * (1 + t)]).map((x) => Math.round(x)).join(',');

  function readColors() {
    const cs = getComputedStyle(root);
    const acc = toRgb(cs.getPropertyValue('--accent-rgb') || cs.getPropertyValue('--accent'));
    const acc2 = toRgb(cs.getPropertyValue('--accent2'));
    col.acc = acc.join(',');
    col.acc2 = acc2.join(',');
    col.light = root.dataset.mode === 'light';
    // Blütenfarben aus dem aktuellen Farbschema:
    // dunkel → hellere Pastelltöne, die auf dunklem Grund leuchten
    // hell   → kräftigere, leicht abgedunkelte Töne, damit sie sich vom hellen Grund abheben
    col.petals = col.light
      ? [shade(acc, 0), shade(acc2, 0), shade(acc, .25), shade(acc2, -.12), shade(acc, -.15)]
      : [shade(acc, .35), shade(acc2, .25), shade(acc, .6), shade(acc2, .5), shade(acc, 0)];
  }
  const rnd = (a, b) => a + Math.random() * (b - a);

  /* Vierecke: Raster, Kacheln glimmen zufällig und rund um die Maus */
  const squares = {
    size: 46, cells: [], cols: 0, rows: 0,
    init() {
      this.cols = Math.ceil(W / this.size) + 1;
      this.rows = Math.ceil(H / this.size) + 1;
      this.cells = new Float32Array(this.cols * this.rows);
    },
    frame() {
      const s = this.size, c = this.cells;
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < 3; i++) if (Math.random() < .5) c[(Math.random() * c.length) | 0] = rnd(.5, 1);
      const pc = Math.floor(px / s), pr = Math.floor(py / s);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx2 = pc + dx, cy2 = pr + dy;
        if (cx2 >= 0 && cy2 >= 0 && cx2 < this.cols && cy2 < this.rows) {
          const k = cy2 * this.cols + cx2; c[k] = Math.max(c[k], dx === 0 && dy === 0 ? 1 : .55);
        }
      }
      for (let r = 0; r < this.rows; r++) for (let q = 0; q < this.cols; q++) {
        const k = r * this.cols + q, a = c[k];
        if (a > .01) {
          ctx.fillStyle = `rgba(${col.acc},${(a * .22).toFixed(3)})`;
          ctx.fillRect(q * s + 2, r * s + 2, s - 4, s - 4);
          c[k] = a * .965;
        }
      }
      ctx.strokeStyle = `rgba(${col.acc},.07)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += s) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
      for (let y = 0; y <= H; y += s) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
      ctx.stroke();
    }
  };

  /* Matrix: fallender Code */
  const matrix = {
    fs: 16, drops: [], chars: '01アイウエオカキクケコサシスセソ{}[]<>/=;:+*#$&ﾊﾐﾋｰｳｼﾅﾓﾆ',
    init() {
      this.drops = Array.from({ length: Math.ceil(W / this.fs) }, () => rnd(-H / this.fs, 0));
      ctx.clearRect(0, 0, W, H);
    },
    frame(t) {
      if (t - lastT < 55) return false;            // ca. 18 Bilder pro Sekunde
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.09)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = `${this.fs}px "JetBrains Mono", monospace`;
      this.drops.forEach((d, i) => {
        const ch = this.chars[(Math.random() * this.chars.length) | 0];
        const x = i * this.fs, y = d * this.fs;
        ctx.fillStyle = `rgba(${col.acc},.85)`;
        ctx.fillText(ch, x, y);
        ctx.fillStyle = `rgba(${col.acc},.25)`;
        ctx.fillText(this.chars[(Math.random() * this.chars.length) | 0], x, y - this.fs);
        this.drops[i] = y > H && Math.random() > .975 ? 0 : d + 1;
      });
      return true;
    }
  };

  /* Sakura: fallende Blütenblätter */
  /* Sakura: fallende Blütenblätter in den Farben des aktuellen Farbschemas.
     Jedes Blatt merkt sich nur einen Farb-Index – so färben sich beim Wechsel alle sofort um. */
  const sakura = {
    petals: [],
    make(top) {
      return {
        x: rnd(-40, W), y: top ? rnd(-H, 0) : rnd(0, H), s: rnd(6, 13),
        vy: rnd(.45, 1.2), vx: rnd(.2, .9), ph: rnd(0, 6.28), sp: rnd(.01, .03),
        rot: rnd(0, 6.28), vr: rnd(-.03, .03), ci: (Math.random() * 5) | 0, a: rnd(.5, .9)
      };
    },
    init() {
      const n = Math.min(80, Math.round(W * H / 20000));
      this.petals = Array.from({ length: n }, () => this.make(false));
    },
    frame() {
      ctx.clearRect(0, 0, W, H);
      this.petals.forEach((p, i) => {
        p.ph += p.sp; p.rot += p.vr;
        p.y += p.vy; p.x += p.vx + Math.sin(p.ph) * .6;
        if (p.y > H + 20 || p.x > W + 40) { this.petals[i] = this.make(true); return; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.abs(Math.cos(p.ph)) * .7 + .3);
        const c = col.petals[p.ci % col.petals.length] || col.acc;
        ctx.fillStyle = `rgba(${c},${(col.light ? Math.min(1, p.a + .1) : p.a).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(0, -p.s);
        ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
        ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s);
        ctx.fill();
        // feine Mittellinie, damit das Blatt nicht flach wirkt
        ctx.strokeStyle = col.light ? `rgba(255,255,255,${(p.a * .5).toFixed(2)})` : `rgba(255,255,255,${(p.a * .3).toFixed(2)})`;
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.moveTo(0, -p.s * .6);
        ctx.lineTo(0, p.s * .6);
        ctx.stroke();
        ctx.restore();
      });
    }
  };

  /* Risse: verzweigte Bruchlinien.
     Animiert: Risse wachsen Stück für Stück, neue entstehen, alte verblassen, das Glühen pulsiert.
     Still: alle Risse vollständig, kein Neuzeichnen. Klick erzeugt neue Risse. */
  const cracks = {
    paths: [], nextSpawn: 0, t: 0,
    grow(x, y, ang, len, w, depth, delay, grown) {
      const pts = [[x, y]];
      let d = 0;
      while (d < len) {
        const step = rnd(8, 18);
        ang += rnd(-.45, .45);
        x += Math.cos(ang) * step; y += Math.sin(ang) * step; d += step;
        pts.push([x, y]);
        // Verzweigung startet erst, wenn der Hauptriss diese Stelle erreicht hat
        if (depth > 0 && Math.random() < .09) this.grow(x, y, ang + rnd(-1.1, 1.1), len * rnd(.25, .5), w * .6, depth - 1, delay + pts.length, grown);
      }
      this.paths.push({ pts, w, p: grown ? pts.length : -delay, a: 1, fade: false });
    },
    burst(x, y, big, grown) {
      const n = big ? 6 : 5;
      for (let i = 0; i < n; i++) this.grow(x, y, (i / n) * 6.28 + rnd(-.3, .3), big ? rnd(160, 380) : rnd(60, 160), big ? 2.2 : 1.6, 3, 0, grown);
    },
    init() {
      this.paths = [];
      const n = Math.max(2, Math.round(W * H / 450000));
      for (let i = 0; i < n; i++) this.burst(rnd(0, W), rnd(0, H), true, true); // Startbild ist sofort vollständig
      this.nextSpawn = 0;
      this.draw(1);
    },
    draw(pulse) {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = `rgba(${col.acc},${(.6 * pulse).toFixed(3)})`;
      ctx.shadowBlur = 6 + 4 * (pulse - .8);
      this.paths.forEach((p) => {
        const count = Math.min(p.pts.length, Math.floor(p.p) + 1);
        if (count < 2 || p.a <= 0) return;
        ctx.strokeStyle = `rgba(${col.acc},${(.34 * p.a * pulse).toFixed(3)})`;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        for (let i = 0; i < count; i++) { const [x, y] = p.pts[i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
    },
    frame(t) {
      if (t - lastT < 33) return false;            // ca. 30 Bilder pro Sekunde
      if (!this.nextSpawn) this.nextSpawn = t + 1800;
      if (t > this.nextSpawn) {                     // neuer Riss an zufälliger Stelle
        this.burst(rnd(W * .05, W * .95), rnd(H * .05, H * .95), Math.random() < .5, false);
        this.nextSpawn = t + rnd(2200, 3800);
        // ältere Risse beginnen zu verblassen, damit es nicht zu voll wird
        let total = this.paths.length;
        for (const p of this.paths) { if (total <= 160) break; if (!p.fade) { p.fade = true; total--; } }
      }
      this.paths.forEach((p) => {
        if (p.p < p.pts.length) p.p += 1.6;          // Wachstum
        if (p.fade) p.a -= .012;
      });
      this.paths = this.paths.filter((p) => p.a > 0);
      this.draw(.85 + .15 * Math.sin(t / 700));    // sanftes Pulsieren
      return true;
    }
  };

  const MODES = { squares, matrix, sakura, cracks };

  function bgLoop(t) {
    const m = MODES[bgMode];
    if (!m) return;
    if (m.frame(t) !== false) lastT = t;
    bgRaf = requestAnimationFrame(bgLoop);
  }
  function startBg() {
    if (!ctx) return;
    if (bgRaf !== null) { cancelAnimationFrame(bgRaf); bgRaf = null; }
    bgMode = settings.bg;
    readColors();
    const m = MODES[bgMode];
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // Seiten mit data-no-bg (z. B. Live Map) verdecken den Hintergrund ohnehin – dort nichts rechnen
    if (document.body.hasAttribute('data-no-bg')) { bgMode = null; return; }
    m.init();
    lastT = 0;
    if (settings.anim !== 'on') {                  // Schalter aus: ruhiges Standbild
      if (bgMode === 'matrix') for (let i = 0; i < 60; i++) { lastT = -1e9; m.frame(1e9); }
      else if (bgMode === 'squares') { for (let i = 0; i < 40; i++) m.frame(0); }
      else if (bgMode === 'sakura') m.frame(0);
      return;                                       // Risse sind nach init() bereits vollständig
    }
    bgRaf = requestAnimationFrame(bgLoop);
  }
  function resizeBg() {
    if (!canvas) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    startBg();
  }
  if (canvas) {
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resizeBg, 150); });
    document.addEventListener('lp:change', (e) => {
      if (e.detail === 'bg' || e.detail === 'anim') startBg();
      if (e.detail === 'mode') {                    // gleiches Stylesheet, Farben sofort neu lesen
        readColors();
        if (bgMode === 'cracks') cracks.draw(1); else if (settings.anim !== 'on') startBg();
      }
      if (e.detail === 'theme') {
        // Farben erst lesen, wenn das neue Stylesheet geladen ist
        const done = () => { readColors(); if (bgMode === 'cracks') cracks.draw(1); else if (settings.anim !== 'on') startBg(); };
        if (themeLink) themeLink.addEventListener('load', done, { once: true });
        setTimeout(done, 400);
      }
    });
    // Risse: Klick auf freie Fläche erzeugt neue Risse
    document.addEventListener('click', (e) => {
      if (bgMode !== 'cracks') return;
      if (e.target.closest('a, button, input, select, textarea, label, .lp-ctx, .lp-cookie, .customize-panel, .terminal, nav')) return;
      const animated = settings.anim === 'on';
      cracks.burst(e.clientX, e.clientY, false, !animated);   // animiert: wächst vom Klickpunkt aus
      if (cracks.paths.length > 900) cracks.paths.splice(0, cracks.paths.length - 900);
      if (!animated) cracks.draw(1);
    });
    if (themeLink) themeLink.addEventListener('load', readColors);
    resizeBg();
  }
})();
