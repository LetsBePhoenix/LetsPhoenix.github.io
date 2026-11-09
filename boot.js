/* ───────────────────────────────────────────────────
   LetsPhoenix — boot.js
   Wird im <head> direkt nach dem Theme-Stylesheet geladen und setzt
   Farbschema, Modus, Look, Hintergrund und Animation, BEVOR die Seite
   gezeichnet wird. So blitzt beim Laden nichts in falschen Farben auf.
   Gespeicherte Werte werden nur genutzt, wenn der Besucher zugestimmt hat.
   ─────────────────────────────────────────────────── */
(function () {
  var html = document.documentElement;

  function read(k) {
    try {
      var m = document.cookie.match(new RegExp('(?:^|; )lp_' + k + '=([^;]*)'));
      if (m) return decodeURIComponent(m[1]);
    } catch (e) {}
    try { return localStorage.getItem('lp_' + k); } catch (e) { return null; }
  }

  // Standardwerte
  html.setAttribute('data-look', 'gaming');
  html.setAttribute('data-bg', 'squares');
  html.setAttribute('data-mode', 'dark');

  if (read('consent') !== 'yes') return;

  var mode = read('mode');
  if (mode === 'system') mode = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  if (mode === 'light' || mode === 'dark') html.setAttribute('data-mode', mode);

  var look = read('look');
  if (/^(gaming|cute|broken|retro)$/.test(look || '')) html.setAttribute('data-look', look);

  var bg = read('bg');
  if (/^(squares|matrix|sakura|cracks)$/.test(bg || '')) html.setAttribute('data-bg', bg);

  var anim = read('anim');
  if (anim === 'on' || anim === 'off') html.setAttribute('data-anim', anim);

  var theme = read('theme');
  if (theme && /^style_[\w-]+\.css$/.test(theme)) {
    var link = document.getElementById('theme-stylesheet');
    if (link) link.setAttribute('href', theme);
  }
})();
