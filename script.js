document.addEventListener('DOMContentLoaded', () => {
  /* ── Theme switching ── */
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

  /* ── Active nav link ── */
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[href]').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
});

/* ── Sakura Petal Effect ── */
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
    if (count >= 18) return; // max concurrent petals
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

  // Initial burst
  for (let i = 0; i < 10; i++) setTimeout(spawnPetal, i * 200);
  // Continuous spawn
  petalInterval = setInterval(spawnPetal, 900);
}

function stopPetals() {
  if (petalInterval) { clearInterval(petalInterval); petalInterval = null; }
  document.querySelectorAll('.sakura-petal').forEach(p => p.remove());
}
