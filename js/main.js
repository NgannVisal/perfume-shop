/* ======================================================
   js/main.js (CLEANED)
   - Loads products from live API
   - Renders featured & product grid
   - Cart system with localStorage
   - Checkout flow
   - Search, sort, view toggle
====================================================== */

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => `$${Number(n).toFixed(2)}`;

let PRODUCTS = [];
let CART = [];
let VIEW = 'grid';

const STORAGE_KEY = 'perfume_atelier_cart_v1';

/* ---------------- Fetch from API ---------------- */
async function fetchProducts() {
  try {
    const res = await fetch("https://perfume-shop-api.onrender.com/api/products");
    if (!res.ok) throw new Error("Failed to get products");

    const data = await res.json();
    PRODUCTS = data;
    return data;
  } catch (err) {
    console.error("fetchProducts error:", err);
    PRODUCTS = [];
    return [];
  }
}

/* ---------------- Cart Persistence ---------------- */
function loadCartFromStorage() {
  try {
    CART = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    CART = [];
  }
}

function saveCartToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(CART));
}

/* ---------------- Cart Logic ---------------- */
function findProduct(id) {
  return PRODUCTS.find(p => p.id === Number(id));
}

function addToCart(id, qty = 1) {
  const existing = CART.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    const product = findProduct(id);
    if (!product) return;
    CART.push({ ...product, qty });
  }
  saveCartToStorage();
  renderCart();
  animateCartButton();
  openCart();
}

function removeFromCart(id) {
  CART = CART.filter(i => i.id !== id);
  saveCartToStorage();
  renderCart();
}

function updateQty(id, qty) {
  const item = CART.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCartToStorage();
    renderCart();
  }
}

function clearCart() {
  CART = [];
  saveCartToStorage();
  renderCart();
}

function cartSubtotal() {
  return CART.reduce((s, i) => s + (i.price * i.qty), 0);
}

/* ---------------- Cart Drawer UI ---------------- */
function openCart() {
  $('#cartDrawer')?.classList.remove('hidden');
}

function closeCart() {
  $('#cartDrawer')?.classList.add('hidden');
}

function animateCartButton() {
  const btn = $('#openCartBtn');
  if (!btn) return;
  btn.animate([
    { transform: 'translateY(0)' },
    { transform: 'translateY(-6px)' },
    { transform: 'translateY(0)' }
  ], { duration: 300 });
}

function renderCart() {
  const container = $('#cartContent');
  const counter = $('#cartCounter');
  const subtotalEl = $('#cartSubtotal');

  if (!container) return;

  container.innerHTML = '';

  if (CART.length === 0) {
    container.innerHTML = `<div class="muted">Your cart is empty.</div>`;
    counter.textContent = '0';
    subtotalEl.textContent = fmt(0);
    return;
  }

  counter.textContent = CART.reduce((s, i) => s + i.qty, 0);
  subtotalEl.textContent = fmt(cartSubtotal());

  CART.forEach(item => {
    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}">
        <div class="info">
          <strong>${item.name}</strong>
          <small>${item.brand}</small>
          <div class="qty-controls">
            <button data-dec="${item.id}">-</button>
            <span>${item.qty}</span>
            <button data-inc="${item.id}">+</button>
            <strong>${fmt(item.price * item.qty)}</strong>
          </div>
        </div>
        <button data-del="${item.id}">🗑</button>
      </div>
    `;
  });

  $$('[data-del]').forEach(b =>
    b.addEventListener('click', () => removeFromCart(Number(b.dataset.del)))
  );

  $$('[data-inc]').forEach(b =>
    b.addEventListener('click', () => {
      const id = Number(b.dataset.inc);
      updateQty(id, (CART.find(x => x.id === id).qty + 1));
    })
  );

  $$('[data-dec]').forEach(b =>
    b.addEventListener('click', () => {
      const id = Number(b.dataset.dec);
      updateQty(id, (CART.find(x => x.id === id).qty - 1));
    })
  );
}

/* ---------------- Product Grid ---------------- */
function createCard(p) {
  const el = document.createElement('div');
  el.className = 'product-card';
  el.innerHTML = `
    <img src="${p.image}">
    <h3>${p.name}</h3>
    <small>${p.brand}</small>
    <div class="p-meta">
      <span>${fmt(p.price)}</span>
      <span class="tag">${p.tag || 'Popular'}</span>
    </div>
    <button data-id="${p.id}" class="add-to-cart">Add to Cart</button>
  `;
  return el;
}

function renderProductGrid(list) {
  const grid = $('#productGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (list.length === 0) {
    $('#noResults')?.classList.remove('hidden');
    return;
  }
  $('#noResults')?.classList.add('hidden');

  list.forEach(p => grid.appendChild(createCard(p)));

  $$('.add-to-cart').forEach(btn =>
    btn.addEventListener('click', () =>
      addToCart(Number(btn.dataset.id), 1)
    )
  );
}

/* ---------------- Featured ---------------- */
function renderFeatured() {
  const top = PRODUCTS.slice(0, 3);
  const box = $('#featuredList');
  if (!box) return;

  box.innerHTML = top.map(p => `
    <div class="feat-card">
      <img src="${p.image}">
      <strong>${p.name}</strong>
      <small>${p.brand}</small>
      <span>${fmt(p.price)}</span>
    </div>
  `).join('');
}

/* ---------------- Search & Sort ---------------- */
function applySearchSort() {
  const q = $('#searchBox')?.value?.toLowerCase() || '';
  let list = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    (p.tag || '').toLowerCase().includes(q)
  );

  const sort = $('#sortSelect')?.value;
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));

  renderProductGrid(list);
}

/* ---------------- Checkout ---------------- */
function showCheckout() {
  $('#checkoutSection')?.classList.remove('hidden');
}

function hideCheckout() {
  $('#checkoutSection')?.classList.add('hidden');
}

function handleCheckoutSubmit(e) {
  e.preventDefault();

  const name = $('#fullName')?.value?.trim();
  if (!name) return alert("Fill form!");

  alert(`Order placed, ${name}! Total: ${fmt(cartSubtotal())}`);

  clearCart();
  hideCheckout();
}

/* ---------------- UI Attach ---------------- */
function attachUI() {
  $('#openCartBtn')?.addEventListener('click', openCart);
  $('#closeCartBtn')?.addEventListener('click', closeCart);
  $('#clearCartBtn')?.addEventListener('click', () => {
    if (confirm("Clear cart?")) clearCart();
  });

  $('#searchBox')?.addEventListener('input', applySearchSort);
  $('#sortSelect')?.addEventListener('change', applySearchSort);

  $('#checkoutBtn')?.addEventListener('click', () => {
    if (CART.length === 0) return alert("Cart empty");
    showCheckout();
  });

  $('#checkoutForm')?.addEventListener('submit', handleCheckoutSubmit);
}

/* ---------------- INIT ---------------- */
async function init() {
  loadCartFromStorage();
  await fetchProducts();
  renderFeatured();
  applySearchSort();
  renderCart();
  attachUI();
}

document.addEventListener('DOMContentLoaded', init);
