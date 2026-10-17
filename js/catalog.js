/* ============================================================
   AURA BEAUTY — каталог: фильтры, поиск, сортировка
   ============================================================ */

const state = {
  categories: [],
  priceMin: null,
  priceMax: null,
  query: '',
  sort: 'popular'
};

function getFilteredProducts() {
  let list = PRODUCTS.filter(p => {
    if (state.categories.length && !state.categories.includes(p.category)) return false;
    if (state.priceMin !== null && p.price < state.priceMin) return false;
    if (state.priceMax !== null && p.price > state.priceMax) return false;
    if (state.query && !p.name.toLowerCase().includes(state.query)) return false;
    return true;
  });

  switch (state.sort) {
    case 'price-asc':  list = list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list = list.sort((a, b) => b.price - a.price); break;
    case 'rating':     list = list.sort((a, b) => b.rating - a.rating); break;
    default:           list = list.sort((a, b) => b.reviews - a.reviews);
  }
  return list;
}

function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  const empty = document.getElementById('catalogEmpty');
  const count = document.getElementById('catalogCount');
  const list = getFilteredProducts();

  grid.innerHTML = list.map(p => window.renderCard ? renderCard(p) : '').join('');
  count.textContent = `Найдено товаров: ${list.length} из ${PRODUCTS.length}`;
  empty.classList.toggle('hide', list.length > 0);
  initReveal();
}

function initCatalog() {
  // Чекбоксы категорий
  const catsBox = document.getElementById('categoryFilters');
  catsBox.innerHTML = Object.entries(CATEGORIES).map(([key, c]) => {
    const n = PRODUCTS.filter(p => p.category === key).length;
    return `<label><input type="checkbox" value="${key}"> ${c.name} <span class="count">${n}</span></label>`;
  }).join('');

  // Категория из адреса (?cat=perfume)
  const preset = new URLSearchParams(location.search).get('cat');
  if (preset && CATEGORIES[preset]) {
    state.categories = [preset];
    catsBox.querySelectorAll('input').forEach(cb => { cb.checked = cb.value === preset; });
  }

  // События
  catsBox.addEventListener('change', e => {
    const v = e.target.value;
    state.categories = e.target.checked
      ? [...state.categories, v]
      : state.categories.filter(c => c !== v);
    renderCatalog();
    track('filter_applied');
  });

  const priceMin = document.getElementById('priceMin');
  const priceMax = document.getElementById('priceMax');
  [priceMin, priceMax].forEach(inp => inp.addEventListener('change', () => {
    state.priceMin = priceMin.value === '' ? null : Number(priceMin.value);
    state.priceMax = priceMax.value === '' ? null : Number(priceMax.value);
    renderCatalog();
    track('filter_applied');
  }));

  // Поиск — отправляем событие с задержкой, чтобы не слать на каждый символ
  let searchTimer = null;
  document.getElementById('searchInput').addEventListener('input', e => {
    state.query = e.target.value.trim().toLowerCase();
    renderCatalog();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => track('search_used'), 800);
  });

  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sort = e.target.value;
    renderCatalog();
    track('sort_used');
  });

  document.getElementById('resetFilters').addEventListener('click', () => {
    state.categories = [];
    state.priceMin = null;
    state.priceMax = null;
    state.query = '';
    state.sort = 'popular';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'popular';
    priceMin.value = '';
    priceMax.value = '';
    catsBox.querySelectorAll('input').forEach(cb => { cb.checked = false; });
    renderCatalog();
  });

  renderCatalog();
}

window.initPage = initCatalog;
