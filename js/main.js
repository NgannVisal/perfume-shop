/* ======================================================
   js/main.js
   Main interactive logic for Perfume Atelier demo:
   - Loads products from api/products.json
   - Renders featured and product grid
   - Add to cart / remove / update qty
   - Cart drawer UI
   - Checkout flow (simple, fake)
   - LocalStorage persistence
   - Search & sort & view toggles
   ====================================================== */

/* ---------------- Helpers ---------------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => `$${Number(n).toFixed(2)}`;

/* ---------------- State ---------------- */
let PRODUCTS = [];            // full product list loaded from API
let CART = [];                // array of { id, qty, ...product }
let VIEW = 'grid';            // grid or list
const STORAGE_KEY = 'perfume_atelier_cart_v1';

/* ---------------- API: fetch products.json ---------------- */
/* ---------------- API: fetch products from backend MySQL ---------------- */
/* --- Fetch products from MySQL backend --- */
async function fetchProducts() {
  try {
    const API = "https://perfume-shop-api.onrender.com/api";
    if (!res.ok) throw new Error("Failed to fetch products from API");

    const data = await res.json();
    PRODUCTS = data;
    return data;
  } catch (err) {
    console.error("fetchProducts error", err);
    PRODUCTS = [];
    return [];
  }
}



/* ---------------- Persistence ---------------- */
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { CART = []; return; }
    CART = JSON.parse(raw) || [];
  } catch (err) {
    CART = [];
  }
}
function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(CART));
  } catch (err) {
    console.warn('saveCart error', err);
  }
}

/* ---------------- Cart Core ---------------- */
function findProductById(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}
function addToCart(id, qty = 1) {
  const pid = Number(id);
  const existing = CART.find(i => i.id === pid);
  if (existing) existing.qty += qty;
  else {
    const prod = findProductById(pid);
    if (!prod) return;
    CART.push({ id: prod.id, qty: qty, name: prod.name, price: prod.price, image: prod.image, brand: prod.brand });
  }
  saveCartToStorage();
  renderCart();
  animateCartButton();
  openCart();
}
function removeFromCart(id) {
  CART = CART.filter(i => i.id !== Number(id));
  saveCartToStorage();
  renderCart();
}
function updateQty(id, qty) {
  const item = CART.find(i => i.id === Number(id));
  if (!item) return;
  item.qty = Math.max(1, Number(qty));
  saveCartToStorage();
  renderCart();
}
function clearCart() {
  CART = [];
  saveCartToStorage();
  renderCart();
}
function cartSubtotal() {
  return CART.reduce((s, i) => s + (i.price * i.qty), 0);
}

/* ---------------- UI: cart drawer ---------------- */
function openCart() {
  const drawer = $('#cartDrawer');
  if (!drawer) return;
  drawer.classList.remove('hidden');
  drawer.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  const drawer = $('#cartDrawer');
  if (!drawer) return;
  drawer.classList.add('hidden');
  drawer.setAttribute('aria-hidden', 'true');
}

/* animate cart button lightly */
function animateCartButton() {
  const btn = $('#openCartBtn');
  if (!btn) return;
  btn.animate([
    { transform: 'translateY(0)' },
    { transform: 'translateY(-6px)' },
    { transform: 'translateY(0)' }
  ], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)'});
}

/* ---------------- Render cart content ---------------- */
function renderCart() {
  const container = $('#cartContent');
  const counter = $('#cartCounter');
  const subtotalEl = $('#cartSubtotal');

  if (!container || !counter || !subtotalEl) return;
  container.innerHTML = '';

  if (CART.length === 0) {
    container.innerHTML = `<div class="muted">Your cart is empty. Add something lovely ✨</div>`;
    counter.textContent = '0';
    subtotalEl.textContent = fmt(0);
    return;
  }

  // count
  const totalQty = CART.reduce((s, i) => s + i.qty, 0);
  counter.textContent = totalQty;

  // items
  CART.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;">
          <strong>${item.name}</strong>
          <div class="small muted">${item.brand}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
          <button class="btn btn-small" data-decrease="${item.id}">−</button>
          <div class="small qty">${item.qty}</div>
          <button class="btn btn-small" data-increase="${item.id}">+</button>
          <div style="margin-left:auto;font-weight:800;">${fmt(item.price * item.qty)}</div>
        </div>
      </div>
      <div style="margin-left:8px;">
        <button class="icon-btn" data-remove="${item.id}" title="Remove">🗑</button>
      </div>
    `;
    container.appendChild(row);
  });

  // attach listeners
  $$('[data-remove]').forEach(b => b.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.remove;
    removeFromCart(id);
  }));
  $$('[data-decrease]').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.decrease);
    const it = CART.find(x => x.id === id);
    if (!it) return;
    updateQty(id, Math.max(1, it.qty - 1));
  }));
  $$('[data-increase]').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.increase);
    const it = CART.find(x => x.id === id);
    if (!it) return;
    updateQty(id, it.qty + 1);
  }));

  subtotalEl.textContent = fmt(cartSubtotal());
}

/* ---------------- Render products ---------------- */
function createProductCard(p) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-media">
      <img src="${p.image}" alt="${p.name}">
    </div>
    <div class="product-body">
      <div class="product-title">${p.name}</div>
      <div class="product-brand small muted">${p.brand}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;">
        <div class="product-price">${fmt(p.price)}</div>
        <div class="badge ${p.tag === 'New' ? 'badge-new' : 'badge-popular'}">${p.tag || 'Popular'}</div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary add-to-cart" data-id="${p.id}">Add to cart</button>
        <button class="btn btn-ghost quick-view" data-id="${p.id}">Quick view</button>
      </div>
    </div>
    <div class="product-quick">
      <button class="icon-btn" title="Wishlist">♡</button>
      <button class="icon-btn" title="Share">⤴</button>
    </div>
  `;
  return card;
}

function renderProductGrid(list) {
  const grid = $('#productGrid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!list || list.length === 0) {
    $('#noResults').classList.remove('hidden');
    return;
  } else {
    $('#noResults').classList.add('hidden');
  }

  list.forEach(p => {
    const c = createProductCard(p);
    grid.appendChild(c);
  });

  // attach add to cart
  $$('.add-to-cart').forEach(b => b.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.id;
    addToCart(id, 1);
    // micro animation on button
    e.currentTarget.animate([{ transform: 'scale(0.96)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 320 });
  }));

  // quick view
  $$('.quick-view').forEach(b => b.addEventListener('click', (e) => {
    const id = Number(e.currentTarget.dataset.id);
    openQuickView(id);
  }));
}

/* ---------------- Featured render (top 3) ---------------- */
function renderFeatured() {
  const list = PRODUCTS.slice(0, 3);
  const container = $('#featuredList');
  if (!container) return;
  container.innerHTML = '';
  list.forEach(p => {
    const el = document.createElement('div');
    el.className = 'product-card';
    el.style.padding = '18px';
    el.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;">
        <img src="${p.image}" alt="${p.name}" style="width:88px;height:88px;border-radius:12px;object-fit:cover;">
        <div>
          <div style="font-weight:800;">${p.name}</div>
          <div class="small muted">${p.brand}</div>
          <div style="margin-top:8px;font-weight:800;color:var(--accent-dark);">${fmt(p.price)}</div>
        </div>
      </div>
    `;
    container.appendChild(el);
  });
}

/* ---------------- Search & Sort ---------------- */
function applySearchSort() {
  const q = ($('#searchBox')?.value || '').trim().toLowerCase();
  let list = PRODUCTS.slice();

  // search
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q));

  // sort
  const sort = $('#sortSelect')?.value || 'popular';
  if (sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  if (sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  if (sort === 'name-asc') list.sort((a,b)=>a.name.localeCompare(b.name));
  if (sort === 'popular') list.sort((a,b)=> (b.rating||0) - (a.rating||0));

  renderProductGrid(list);
}

/* ---------------- Quick view modal ---------------- */
function openQuickView(id) {
  const prod = findProduct(id);
  if (!prod) return;
  const modals = $('#modals');
  if (!modals) return;

  // create modal element
  const m = document.createElement('div');
  m.className = 'modal-backdrop';
  m.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="left">
        <img src="${prod.image}" alt="${prod.name}">
      </div>
      <div class="right">
        <h3>${prod.name}</h3>
        <div class="small muted">${prod.brand}</div>
        <p class="muted" style="margin-top:12px;">${prod.description || 'A refined scent.'}</p>
        <div style="margin-top:8px;font-weight:800;">${fmt(prod.price)}</div>
        <div style="margin-top:12px;display:flex;gap:8px;">
          <button class="btn btn-primary" id="qvAdd">Add to cart</button>
          <button class="btn btn-ghost" id="qvClose">Close</button>
        </div>
      </div>
    </div>
  `;

  modals.appendChild(m);

  // listeners
  m.querySelector('#qvClose').addEventListener('click', () => {
    m.remove();
  });
  m.querySelector('#qvAdd').addEventListener('click', () => {
    addToCart(prod.id, 1);
    m.remove();
  });

  // close on backdrop click
  m.addEventListener('click', (e) => {
    if (e.target === m) m.remove();
  });
}

function findProduct(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

/* ---------------- Checkout ---------------- */
function showCheckout() {
  $('#checkoutSection').classList.remove('hidden');
  window.scrollTo({ top: $('#checkoutSection').offsetTop || 0, behavior: 'smooth' });
}
function hideCheckout() {
  $('#checkoutSection').classList.add('hidden');
}

/* handle checkout submit */
function handleCheckoutSubmit(e) {
  e.preventDefault();

  const name = $('#fullName')?.value?.trim();
  const email = $('#email')?.value?.trim();
  const address = $('#address')?.value?.trim();
  const city = $('#city')?.value?.trim();

  if (!name || !email || !address || !city) {
    $('#checkoutMsg').textContent = '⚠️ Please fill all required fields!';
    $('#checkoutMsg').style.color = '#e74c3c';
    return;
  }

  // Simulate order success (fake processing)
  const btn = document.querySelector('.btn-checkout');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  setTimeout(() => {
    btn.textContent = '✅ Order Successful!';
    btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
    $('#checkoutMsg').textContent = `🎉 Thank you, ${name}! Your order has been placed successfully.`;
    $('#checkoutMsg').style.color = '#27ae60';

    // Save total BEFORE clearing
    const total = cartSubtotal();

    // Popup
    alert(`🟩 Order complete!\nName: ${name}\nTotal: ${fmt(total)}`);

     // Clear cart
    clearCart();

    // Reset form
    $('#checkoutForm').reset();

    setTimeout(() => {
      hideCheckout();
      btn.disabled = false;
      btn.textContent = 'Place Order';
      btn.style.background = 'linear-gradient(135deg, #c77dff, #6a11cb)';
    }, 2500);
  }, 2000);
}

  // basic validation
  


/* ---------------- UI Attachments ---------------- */
function attachUI() {
  // header buttons
  $('#openCartBtn')?.addEventListener('click', () => {
    openCart();
  });
  $('#closeCartBtn')?.addEventListener('click', () => {
    closeCart();
  });
  $('#clearCartBtn')?.addEventListener('click', () => {
    if (!confirm('Clear cart?')) return;
    clearCart();
  });

  // search clear
  $('#clearSearch')?.addEventListener('click', () => {
    $('#searchBox').value = '';
    applySearchSort();
  });

  // search input
  $('#searchBox')?.addEventListener('input', () => {
    applySearchSort();
  });

  // sort
  $('#sortSelect')?.addEventListener('change', () => {
    applySearchSort();
  });

  // view toggles
  $('#gridViewBtn')?.addEventListener('click', () => {
    VIEW = 'grid';
    $('#gridViewBtn').classList.add('active');
    $('#listViewBtn').classList.remove('active');
    $('#productGrid').classList.remove('list');
  });
  $('#listViewBtn')?.addEventListener('click', () => {
    VIEW = 'list';
    $('#listViewBtn').classList.add('active');
    $('#gridViewBtn').classList.remove('active');
    $('#productGrid').classList.add('list');
  });

  // shop now
  $('#shopNowBtn')?.addEventListener('click', () => {
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
  });

  // checkout flow
  $('#checkoutBtn')?.addEventListener('click', () => {
    if (CART.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    showCheckout();
  });
  $('#backToShop')?.addEventListener('click', (e) => {
    e.preventDefault();
    hideCheckout();
    document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });  
  });
  $('#checkoutForm')?.addEventListener('submit', handleCheckoutSubmit);

  // newsletter
  $('#newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const em = $('#newsletterEmail')?.value?.trim();
    if (!em) { $('#newsletterMsg').textContent = 'Enter a valid email.'; return; }
    $('#newsletterMsg').textContent = 'Thanks — check your email for updates!';
    $('#newsletterEmail').value = '';
  });
}

/* ---------------- Initialize app ---------------- */
async function init() {
  loadCartFromStorage();
  await fetchProducts();
  renderFeatured();
  applySearchSort();
  renderCart();
  attachUI();
}

/* auto-run */
document.addEventListener('DOMContentLoaded', init);


/* ---------------- Extra: expose some functions for debugging ---------------- */
window._PA = {
  addToCart,
  removeFromCart,
  updateQty,
  clearCart,
  PRODUCTS,
  CART,
  fetchProducts
};
