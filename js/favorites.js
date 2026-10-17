/* ============================================================
   AURA BEAUTY — страница «Избранное»
   ============================================================ */

function favCard(product) {
  const old = product.oldPrice ? `<span class="price--old">${formatPrice(product.oldPrice)}</span>` : '';
  return `
    <article class="card">
      <div class="card__media">
        <a href="product.html?id=${product.id}"><img src="${productImage(product)}" alt="${product.name}"></a>
      </div>
      <div class="card__body">
        <span class="card__cat">${CATEGORIES[product.category].name}</span>
        <h3 class="card__name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
        <span class="card__rating">${formatRating(product.rating)} · ${product.reviews} отзывов</span>
        <div class="card__price">
          <span class="price">${formatPrice(product.price)}</span>${old}
        </div>
        <div class="card__actions">
          <button class="btn btn--sm" data-add-cart="${product.id}">В корзину</button>
          <button class="btn btn--sm btn--ghost" data-fav-remove="${product.id}">Убрать</button>
        </div>
      </div>
    </article>`;
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('favEmpty');
  const sub = document.getElementById('favSub');
  const favs = getFavs().map(getProduct).filter(Boolean);

  grid.innerHTML = favs.map(favCard).join('');
  empty.classList.toggle('hide', favs.length > 0);
  sub.textContent = favs.length
    ? `Сохранила ${favs.length} ${favs.length === 1 ? 'товар' : favs.length < 5 ? 'товара' : 'товаров'} — можно добавить в корзину в один клик.`
    : '';
}

window.initPage = renderFavorites;

/* Удаление из избранного на этой странице */
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-fav-remove]');
  if (!btn) return;
  const id = Number(btn.dataset.favRemove);
  localStorage.setItem(FAV_KEY, JSON.stringify(getFavs().filter(f => f !== id)));
  updateCounters();
  showToast('Удалено из избранного');
  renderFavorites();
});
