/* ============================================================
   AURA BEAUTY — страница товара
   ============================================================ */

function renderProduct() {
  const root = document.getElementById('productRoot');
  const id = new URLSearchParams(location.search).get('id');
  const product = getProduct(id);

  if (!product) {
    root.innerHTML = `
      <div class="empty-state" style="padding:100px 20px">
        <div class="big">🤷‍♀️</div>
        <h3>Товар не найден</h3>
        <p>Возможно, он был удалён из каталога.</p>
        <a class="btn" href="catalog.html" style="margin-top:18px">Вернуться в каталог</a>
      </div>`;
    document.title = 'Товар не найден — AURA Beauty';
    return;
  }

  document.title = `${product.name} — AURA Beauty`;
  document.getElementById('crumbCat').href = `catalog.html?cat=${product.category}`;
  document.getElementById('crumbCat').textContent = CATEGORIES[product.category].name;
  document.getElementById('crumbName').textContent = product.name;

  const old = product.oldPrice ? `<span class="price--old">${formatPrice(product.oldPrice)}</span>` : '';
  const favCls = isFav(product.id) ? 'is-on' : '';
  const compList = product.composition ? product.composition.split(',').map(s => s.trim()).map(s => `<li>${s}</li>`).join('') : '';

  root.innerHTML = `
    <section class="product">
      <div class="product__gallery reveal">
        <img src="${productImage(product, 900)}" alt="${product.name}">
      </div>
      <div class="product__info reveal">
        <span class="product__cat">${CATEGORIES[product.category].name} · ${product.brand}</span>
        <h1 class="product__title">${product.name}</h1>
        <div class="product__meta">
          <span class="review__stars" style="letter-spacing:2px">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= .5 ? '½' : ''}</span>
          <span>Рейтинг ${product.rating.toFixed(1)}</span>
          <span>· ${product.reviews} отзывов</span>
        </div>
        <div class="product__price-row">
          <span class="price">${formatPrice(product.price)}</span>${old}
          <span class="card__badge card__badge--new" style="position:static">${product.volume}</span>
        </div>
        <p class="product__desc">${product.description}</p>

        <div class="product__props">
          <h4>Состав</h4>
          <ul>${compList}</ul>
        </div>

        <div class="product__props">
          <h4>Способ применения</h4>
          <p style="font-size:15px;color:#4c433d">${product.howToUse}</p>
        </div>

        <div class="product__buy">
          <div class="qty">
            <button data-qty="down" aria-label="Меньше">−</button>
            <output id="qtyOut">1</output>
            <button data-qty="up" aria-label="Больше">+</button>
          </div>
          <button class="btn" id="buyBtn">В корзину</button>
          <button class="btn btn--outline ${favCls}" id="favBtn" type="button">${isFav(product.id) ? '♥ В избранном' : '♡ В избранное'}</button>
        </div>

        <div class="product__note">
          <span>🚚 Бесплатная доставка от 3 000 ₽</span>
          <span>↩️ Возврат 30 дней</span>
          <span>✅ Оригинальная продукция</span>
        </div>
      </div>
    </section>

    <section class="similar">
      <div class="section-head">
        <div>
          <span class="kicker">Вам может понравиться</span>
          <h2>Похожие товары</h2>
        </div>
      </div>
      <div class="catalog-grid" id="similarGrid"></div>
    </section>`;

  // Количество
  let qty = 1;
  const qtyOut = document.getElementById('qtyOut');
  document.querySelectorAll('[data-qty]').forEach(btn => btn.addEventListener('click', () => {
    qty += btn.dataset.qty === 'up' ? 1 : -1;
    if (qty < 1) qty = 1;
    qtyOut.textContent = qty;
  }));

  // Добавление в корзину с выбранным количеством
  document.getElementById('buyBtn').addEventListener('click', () => {
    addToCart(product.id, qty);
  });

  // Избранное (своя кнопка — без глобального делегирования)
  const favBtn = document.getElementById('favBtn');
  favBtn.addEventListener('click', () => {
    const on = toggleFav(product.id);
    favBtn.classList.toggle('is-on', on);
    favBtn.textContent = on ? '♥ В избранном' : '♡ В избранное';
  });

  // Похожие
  const similar = PRODUCTS
    .filter(p => p.id !== product.id && p.category === product.category)
    .concat(PRODUCTS.filter(p => p.id !== product.id && p.category !== product.category))
    .slice(0, 4);
  document.getElementById('similarGrid').innerHTML = similar.map(renderCard).join('');

  initReveal();
}

window.initPage = renderProduct;
