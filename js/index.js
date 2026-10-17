/* ============================================================
   AURA BEAUTY — логика главной страницы
   ============================================================ */

function renderHome() {
  // Категории
  const catsEl = document.getElementById('homeCats');
  if (catsEl) {
    catsEl.innerHTML = Object.entries(CATEGORIES).map(([key, c]) => `
      <a class="cat-tile" href="catalog.html?cat=${key}" data-mt-goal="category_click">
        <div class="cat-tile__icon">${c.icon}</div>
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
      </a>`).join('');
  }

  // Хиты продаж: сначала «Хит», затем с максимальным рейтингом
  const hits = [...PRODUCTS]
    .sort((a, b) => (b.badge === 'Хит') - (a.badge === 'Хит') || b.rating - a.rating)
    .slice(0, 8);
  const hitsEl = document.getElementById('homeHits');
  if (hitsEl) hitsEl.innerHTML = hits.map(renderCard).join('');

  initReveal();
}

window.initPage = renderHome;

/* ---------- Подписка ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('subscribeForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('subscribeEmail');
    const note = document.getElementById('subscribeNote');
    const email = input.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!re.test(email)) {
      note.textContent = 'Пожалуйста, введите корректный e-mail.';
      note.className = 'form-note err';
      input.style.borderColor = 'var(--danger)';
      return;
    }
    note.textContent = 'Спасибо! Промокод AURA15 уже летит к вам на почту.';
    note.className = 'form-note ok';
    input.style.borderColor = 'var(--ok)';
    form.reset();
    track('subscribe_user');
  });
});
