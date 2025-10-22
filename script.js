// ---------- Demo product data ----------
const PRODUCTS = [
  {
    id: 'p1',
    title: 'Mobile Phone',
    price: 22000,
    category: 'Electronics',
    desc: 'Powerful mobile with great camera.',
  },
  {
    id: 'p2',
    title: 'Smart Watch',
    price: 4500,
    category: 'Electronics',
    desc: 'Track your health & notifications.',
  },
  {
    id: 'p3',
    title: 'Running Shoes',
    price: 3200,
    category: 'Footwear',
    desc: 'Comfortable running shoes.',
  },
  {
    id: 'p4',
    title: 'Laptop',
    price: 56000,
    category: 'Computers',
    desc: 'Lightweight laptop for work & study.',
  },
  {
    id: 'p5',
    title: 'Headphone',
    price: 1500,
    category: 'Accessories',
    desc: 'Clear sound, comfortable fit.',
  },
  {
    id: 'p6',
    title: 'Formal Shoes',
    price: 4200,
    category: 'Footwear',
    desc: 'Classic formal shoes.',
  },
  {
    id: 'p7',
    title: 'Backpack',
    price: 1200,
    category: 'Accessories',
    desc: 'Durable backpack for daily use.',
  },
  {
    id: 'p8',
    title: 'Mechanical Keyboard',
    price: 3200,
    category: 'Computers',
    desc: 'Tactile keys with RGB.',
  },
];

// ---------- State ----------
let state = {
  products: [...PRODUCTS],
  query: '',
  category: 'all',
  sort: 'popular',
  cart: JSON.parse(localStorage.getItem('cart_v1') || '{}'), // { productId: qty }
};

// ---------- Helpers ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const format = n => n.toLocaleString('bn-BD') + ' ৳';

function saveCart() {
  localStorage.setItem('cart_v1', JSON.stringify(state.cart));
  renderCartCount();
  renderCartPanel();
}

// ---------- Render categories ----------
function populateCategories() {
  const cats = ['all', ...new Set(PRODUCTS.map(p => p.category))];
  const sel = $('#categoryFilter');
  sel.innerHTML = cats
    .map(
      c => `<option value="${c}">${c === 'all' ? 'সকল ক্যাটেগরি' : c}</option>`
    )
    .join('');
}

// ---------- Render product grid ----------
function renderProducts() {
  const grid = $('#productsGrid');
  let list = PRODUCTS.filter(p => {
    const q = state.query.trim().toLowerCase();
    if (q && !`${p.title} ${p.desc} ${p.category}`.toLowerCase().includes(q))
      return false;
    if (state.category !== 'all' && p.category !== state.category) return false;
    return true;
  });

  // sort
  if (state.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; background:#fff; border-radius:12px;">❌ কোনো পণ্য পাওয়া যায়নি</div>`;
    return;
  }

  grid.innerHTML = list
    .map(
      p => `
        <div class="card" data-id="${p.id}">
          <div class="thumb" aria-hidden="true">${p.title.split(' ')[0]}</div>
          <div style="flex:1;">
            <div style="font-weight:800">${p.title}</div>
            <div class="muted" style="font-size:13px">${p.category}</div>
          </div>
          <div class="meta">
            <div>
              <div class="price">${format(p.price)}</div>
              <div class="muted" style="font-size:13px">${p.desc}</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
              <button class="add" data-add="${p.id}">Add</button>
              <button class="btn" data-view="${p.id}">View</button>
            </div>
          </div>
        </div>
      `
    )
    .join('');
}

// ---------- Product modal ----------
function openProductModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const modal = $('#productModal');
  modal.innerHTML = `
        <div style="display:flex; gap:14px; align-items:flex-start;">
          <div style="flex:0 0 40%;">
            <div style="height:220px; border-radius:10px; background:linear-gradient(180deg,#eef2ff,#c7d2fe); display:grid; place-items:center; font-weight:800;">${
              p.title
            }</div>
          </div>
          <div style="flex:1;">
            <h2 style="margin:0 0 6px 0">${p.title}</h2>
            <div class="muted">${p.category}</div>
            <p style="margin-top:12px">${p.desc}</p>
            <div style="margin-top:12px; font-weight:900; font-size:18px">${format(
              p.price
            )}</div>
            <div style="margin-top:14px; display:flex; gap:8px;">
              <button class="add" data-add="${p.id}">Add to cart</button>
              <button class="btn" id="closeModal">Close</button>
            </div>
          </div>
        </div>
      `;
  $('#modalBackdrop').classList.add('open');
}

// ---------- Cart functions ----------
function addToCart(id, qty = 1) {
  state.cart[id] = (state.cart[id] || 0) + qty;
  saveCart();
}

function removeFromCart(id) {
  delete state.cart[id];
  saveCart();
}

function updateCartQty(id, qty) {
  if (qty <= 0) removeFromCart(id);
  else state.cart[id] = qty;
  saveCart();
}

function cartItemsArray() {
  return Object.entries(state.cart).map(([id, qty]) => {
    const p = PRODUCTS.find(x => x.id === id);
    return { ...p, qty };
  });
}

function cartTotal() {
  return cartItemsArray().reduce((s, it) => s + it.price * it.qty, 0);
}

// ---------- Render cart UI ----------
function renderCartCount() {
  const count = cartItemsArray().reduce((s, it) => s + it.qty, 0);
  $('#cartCount').textContent = count;
  $('#cartTotalPrice').textContent = format(cartTotal());
}

function renderCartPanel() {
  const container = $('#cartItems');
  const items = cartItemsArray();
  if (items.length === 0) {
    container.innerHTML = `<div style="padding:18px; text-align:center;" class="muted">তুমি এখনও কোনো আইটেম যোগ করো নি</div>`;
  } else {
    container.innerHTML = items
      .map(
        it => `
          <div class="cart-item" data-id="${it.id}">
            <div class="ci-thumb">${it.title.split(' ')[0]}</div>
            <div style="flex:1">
              <div style="font-weight:800">${it.title}</div>
              <div class="muted" style="font-size:13px">${format(it.price)} × ${
          it.qty
        } = <strong>${format(it.price * it.qty)}</strong></div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
              <div class="qty">
                <button data-decrease="${it.id}">−</button>
                <div style="min-width:26px; text-align:center;">${it.qty}</div>
                <button data-increase="${it.id}">+</button>
              </div>
              <button class="muted" style="background:none; border:0; color:#ef4444; cursor:pointer;" data-remove="${
                it.id
              }">Remove</button>
            </div>
          </div>
        `
      )
      .join('');
  }
  $('#cartGrandTotal').textContent = format(cartTotal());
}

// ---------- Event Delegation ----------
document.addEventListener('click', e => {
  // Add to cart
  const addId = e.target.getAttribute('data-add');
  if (addId) {
    addToCart(addId, 1);
    return;
  }

  // View product
  const viewId = e.target.getAttribute('data-view');
  if (viewId) {
    openProductModal(viewId);
    return;
  }

  // Close modal
  if (e.target.id === 'closeModal' || e.target.id === 'modalBackdrop') {
    $('#modalBackdrop').classList.remove('open');
  }

  // Cart toggle
  if (e.target.id === 'cartToggle' || e.target.closest('#cartToggle')) {
    $('#cartPanel').classList.toggle('open');
  }

  // Clear cart
  if (e.target.id === 'clearCart') {
    state.cart = {};
    saveCart();
  }

  // Checkout open
  if (e.target.id === 'checkoutBtn') {
    if (cartItemsArray().length === 0) {
      alert('তোমার কার্ট খালি');
      return;
    }
    $('#checkoutBackdrop').classList.add('open');
  }

  // Remove item
  const rem = e.target.getAttribute('data-remove');
  if (rem) {
    removeFromCart(rem);
    return;
  }

  // Increase / decrease
  const inc = e.target.getAttribute('data-increase');
  if (inc) {
    updateCartQty(inc, (state.cart[inc] || 0) + 1);
    return;
  }
  const dec = e.target.getAttribute('data-decrease');
  if (dec) {
    updateCartQty(dec, (state.cart[dec] || 0) - 1);
    return;
  }
});

// Click outside modal backdrop to close
$('#modalBackdrop').addEventListener('click', ev => {
  if (ev.target === $('#modalBackdrop'))
    $('#modalBackdrop').classList.remove('open');
});

// Checkout cancel
$('#checkoutCancel').addEventListener('click', () =>
  $('#checkoutBackdrop').classList.remove('open')
);

// Checkout submit (mock)
$('#checkoutForm').addEventListener('submit', ev => {
  ev.preventDefault();
  const name = $('#name').value.trim();
  const email = $('#email').value.trim();
  const address = $('#address').value.trim();
  if (!name || !email || !address) {
    alert('সব তথ্য ভরাও');
    return;
  }
  // mock order placement
  const order = {
    id: 'ORD' + Date.now(),
    name,
    email,
    address,
    items: cartItemsArray(),
    total: cartTotal(),
  };
  console.log('Order placed (mock):', order);
  alert('অর্ডার প্লেস হয়েছে!\nOrder ID: ' + order.id);
  state.cart = {};
  saveCart();
  $('#checkoutBackdrop').classList.remove('open');
  $('#cartPanel').classList.remove('open');
});

// Search / filters
$('#searchBox').addEventListener('input', e => {
  state.query = e.target.value;
  renderProducts();
});
$('#categoryFilter').addEventListener('change', e => {
  state.category = e.target.value;
  renderProducts();
});
$('#sortSelect').addEventListener('change', e => {
  state.sort = e.target.value;
  renderProducts();
});
$('#clearFilters').addEventListener('click', () => {
  state.query = '';
  state.category = 'all';
  state.sort = 'popular';
  $('#searchBox').value = '';
  $('#categoryFilter').value = 'all';
  $('#sortSelect').value = 'popular';
  renderProducts();
});

// keyboard: Esc to close modals / cart
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $('#modalBackdrop').classList.remove('open');
    $('#checkoutBackdrop').classList.remove('open');
    $('#cartPanel').classList.remove('open');
  }
});

// init
(function init() {
  populateCategories();
  renderProducts();
  renderCartCount();
  renderCartPanel();
  $('#year').textContent = new Date().getFullYear();
})();
