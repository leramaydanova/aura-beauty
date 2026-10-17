/* ============================================================
   AURA BEAUTY — общая логика сайта
   Шапка/футер, корзина и избранное (localStorage), генерация
   изображений-заглушек, тосты.
   ============================================================ */

/* ---------- Изображение товара (SVG-заглушка) ---------- */
function productImage(product, size = 600) {
  const c1 = product.color[0];
  const c2 = product.color[1];
  const emoji = CATEGORIES[product.category].icon;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 600 600">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <circle cx="90" cy="70" r="140" fill="rgba(255,255,255,.14)"/>
    <circle cx="520" cy="520" r="170" fill="rgba(255,255,255,.12)"/>
    <circle cx="300" cy="300" r="128" fill="rgba(255,255,255,.30)"/>
    <text x="300" y="340" font-size="110" text-anchor="middle">${emoji}</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ---------- Карточка товара (общая) ---------- */
function renderCard(product) {
  const badge =
    product.badge === 'Хит' ? '<span class="card__badge">Хит</span>' :
    product.badge === 'Новинка' ? '<span class="card__badge card__badge--new">Новинка</span>' :
    product.oldPrice ? '<span class="card__badge card__badge--sale">Скидка</span>' : '';
  const old = product.oldPrice ? `<span class="price--old">${formatPrice(product.oldPrice)}</span>` : '';
  const favCls = isFav(product.id) ? 'is-on' : '';
  return `
    <article class="card reveal">
      <div class="card__media">
        <button class="card__fav ${favCls}" data-fav="${product.id}" title="В избранное" aria-label="В избранное">♥</button>
        ${badge}
        <a href="product.html?id=${product.id}"><img src="${productImage(product)}" alt="${product.name}" loading="lazy"></a>
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
          <a class="btn btn--sm btn--ghost" href="product.html?id=${product.id}">Подробнее</a>
        </div>
      </div>
    </article>`;
}

/* ---------- Корзина ---------- */
const CART_KEY = 'aura_cart';
const FAV_KEY = 'aura_favs';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCounters();
}
function cartTotalQty() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}
function cartTotalSum() {
  return getCart().reduce((s, i) => {
    const p = getProduct(i.id);
    return p ? s + p.price * i.qty : s;
  }, 0);
}
function addToCart(id, qty = 1) {
  const cart = getCart();
  const line = cart.find(i => i.id === Number(id));
  if (line) line.qty += qty;
  else cart.push({ id: Number(id), qty });
  saveCart(cart);
  renderCartModal();
  showToast('Товар добавлен в корзину ✨');
}
function changeQty(id, delta) {
  const cart = getCart();
  const line = cart.find(i => i.id === Number(id));
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) removeFromCart(id);
  else saveCart(cart);
  renderCartModal();
}
function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== Number(id)));
  renderCartModal();
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCounters();
  renderCartModal();
}

/* ---------- Избранное ---------- */
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function toggleFav(id) {
  const favs = getFavs();
  id = Number(id);
  const idx = favs.indexOf(id);
  if (idx >= 0) {
    favs.splice(idx, 1);
    showToast('Удалено из избранного');
  } else {
    favs.push(id);
    showToast('Добавлено в избранное ♥');
  }
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
  updateCounters();
  return idx < 0;
}
function isFav(id) {
  return getFavs().includes(Number(id));
}

/* ---------- Счётчики в шапке ---------- */
function updateCounters() {
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    const n = cartTotalQty();
    el.textContent = n;
    el.classList.toggle('hide', n === 0);
  });
  document.querySelectorAll('[data-fav-count]').forEach(el => {
    const n = getFavs().length;
    el.textContent = n;
    el.classList.toggle('hide', n === 0);
  });
}

/* ---------- Тост ---------- */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Модалка корзины ---------- */
function renderCartModal() {
  const body = document.getElementById('cartModalBody');
  const foot = document.getElementById('cartModalFoot');
  if (!body) return;
  const cart = getCart();
  if (!cart.length) {
    body.innerHTML = '<div class="modal__empty"><div class="big">🛍️</div>В корзине пока пусто.<br>Загляните в каталог — там много интересного!</div>';
    if (foot) foot.innerHTML = '';
    return;
  }
  const items = cart.map(line => {
    const p = getProduct(line.id);
    if (!p) return '';
    return `
      <div class="cart-line">
        <img src="${productImage(p)}" alt="${p.name}">
        <div class="cart-line__info">
          <b>${p.name}</b>
          <span class="price">${formatPrice(p.price)}</span>
        </div>
        <div class="qty">
          <button data-cq="${p.id}" data-delta="-1" aria-label="Меньше">−</button>
          <output>${line.qty}</output>
          <button data-cq="${p.id}" data-delta="1" aria-label="Больше">+</button>
        </div>
        <button class="cart-line__del" data-cdel="${p.id}" title="Удалить">✕</button>
      </div>`;
  }).join('');
  body.innerHTML = items;
  if (foot) {
    foot.innerHTML = `
      <div class="row"><span>Итого:</span><b class="modal-total">${formatPrice(cartTotalSum())}</b></div>
      <button class="btn btn--block btn--dark" id="cartCheckoutBtn">Оформить заказ</button>
      <p style="font-size:12px;color:var(--ink-soft);margin-top:10px;text-align:center">Доставка — от 290 ₽, бесплатно от 3000 ₽</p>`;
  }
}

/* ---------- Шапка и подвал ---------- */
const NAV_ITEMS = [
  { href: 'index.html', label: 'Главная' },
  { href: 'catalog.html', label: 'Каталог' },
  { href: 'about.html', label: 'О бренде' },
  { href: 'delivery.html', label: 'Доставка' }
];

function renderChrome() {
  const header = document.getElementById('siteHeader');
  const footer = document.getElementById('siteFooter');
  const page = document.body.dataset.page || '';

  if (header) {
    header.innerHTML = `
      <div class="topbar">Бесплатная доставка по всей России от <b>3 000 ₽</b> · Скидка <b>15%</b> на первый заказ по промокоду <b>AURA15</b></div>
      <div class="header">
        <div class="container header__row">
          <a class="logo" href="index.html">
            <span class="logo__mark">AURA<span>.</span></span>
            <span class="logo__tag">beauty</span>
          </a>
          <nav class="nav"><ul>
            ${NAV_ITEMS.map(i => `<li><a href="${i.href}" class="${page === i.href ? 'is-active' : ''}">${i.label}</a></li>`).join('')}
          </ul></nav>
          <div class="header-icons">
            <a class="icon-btn" href="favorites.html" title="Избранное" aria-label="Избранное">♥
              <span class="count hide" data-fav-count>0</span>
            </a>
            <button class="icon-btn" id="openCartBtn" title="Корзина" aria-label="Корзина">🛍️
              <span class="count hide" data-cart-count>0</span>
            </button>
          </div>
        </div>
      </div>`;
  }
  if (footer) {
    footer.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer__top">
            <div class="footer__brand">
              <a class="logo" href="index.html" style="color:#fff">
                <span class="logo__mark" style="color:#fff">AURA<span style="color:var(--accent)">.</span></span>
                <span class="logo__tag" style="color:#9a908a">beauty</span>
              </a>
              <p>Косметика и парфюмерия, созданные бережно — к коже и к природе. Не тестируем на животных, используем перерабатываемую упаковку.</p>
            </div>
            <div>
              <h4>Магазин</h4>
              <ul>
                <li><a href="catalog.html">Каталог</a></li>
                <li><a href="favorites.html">Избранное</a></li>
                <li><a href="catalog.html#form">Промокоды</a></li>
              </ul>
            </div>
            <div>
              <h4>Покупателям</h4>
              <ul>
                <li><a href="delivery.html">Доставка и оплата</a></li>
                <li><a href="delivery.html#returns">Возврат</a></li>
                <li><a href="delivery.html#faq">Вопросы и ответы</a></li>
              </ul>
            </div>
            <div>
              <h4>Компания</h4>
              <ul>
                <li><a href="about.html">О бренде</a></li>
                <li><a href="about.html#contacts">Контакты</a></li>
                <li><a href="about.html#sustainability">Экологичность</a></li>
              </ul>
            </div>
          </div>
          <div class="footer__bottom">
            <span>© 2026 AURA Beauty. Учебный проект.</span>
            <span>Сделано с ♥ для практики вёрстки</span>
          </div>
        </div>
      </footer>`;
  }

  /* Модалка корзины на всех страницах */
  if (!document.getElementById('cartModal')) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'cartModal';
    modal.innerHTML = `
      <div class="modal__overlay" data-close-cart></div>
      <div class="modal__panel">
        <div class="modal__head">
          <h2>Корзина</h2>
          <button class="modal__close" data-close-cart aria-label="Закрыть">✕</button>
        </div>
        <div class="modal__body" id="cartModalBody"></div>
        <div class="modal__foot" id="cartModalFoot"></div>
      </div>`;
    document.body.appendChild(modal);
  }

  updateCounters();
  renderCartModal();
  bindCommonEvents();
}

/* ---------- Общие обработчики ---------- */
function bindCommonEvents() {
  // Открытие/закрытие корзины
  const openBtn = document.getElementById('openCartBtn');
  const modal = document.getElementById('cartModal');
  if (openBtn) openBtn.addEventListener('click', () => modal.classList.add('open'));
  modal.querySelectorAll('[data-close-cart]').forEach(el => {
    el.addEventListener('click', () => modal.classList.remove('open'));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.classList.remove('open');
  });

  // Кнопки внутри корзины (делегирование)
  modal.addEventListener('click', e => {
    const cq = e.target.closest('[data-cq]');
    const cd = e.target.closest('[data-cdel]');
    const checkout = e.target.closest('#cartCheckoutBtn');
    if (cq) changeQty(cq.dataset.cq, Number(cq.dataset.delta));
    else if (cd) removeFromCart(cd.dataset.cdel);
    else if (checkout) {
      modal.classList.remove('open');
      showToast('Заказ оформлен! Мы свяжемся с вами для подтверждения 🎉');
      clearCart();
    }
  });

  // Кнопки «в корзину» на любой странице (делегирование по документу)
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add-cart]');
    if (add) addToCart(add.dataset.addCart, 1);
  });
}

/* ---------- Кнопки избранного (делегирование) ---------- */
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    const id = fav.dataset.fav;
    const nowOn = toggleFav(id);
    fav.classList.toggle('is-on', nowOn);
  }
});

/* ---------- Reveal-анимация при скролле ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .12 });
  els.forEach(el => io.observe(el));
}

/* ---------- Старт ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderChrome();
  if (window.initPage) initPage();
  initReveal();
});
