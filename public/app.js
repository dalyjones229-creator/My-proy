const CURRENCY = "COP";

function formatMoney(amount, currency = CURRENCY) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCartId() {
  let id = localStorage.getItem("cartId");
  if (!id) {
    id =
      "cart_" +
      (crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now() + "_" + Math.random().toString(16).slice(2));
    localStorage.setItem("cartId", id);
  }
  return id;
}

const state = {
  cart: { items: [], total: { amount: 0, currency: CURRENCY }, isEmpty: true },
};

const els = {
  catalog: document.getElementById("catalog"),
  search: document.getElementById("search"),
  skin: document.getElementById("skin"),
  handmade: document.getElementById("handmade"),
  organic: document.getElementById("organic"),
  available: document.getElementById("available"),
  cartBtn: document.getElementById("cartBtn"),
  cartCount: document.getElementById("cartCount"),
  cartTotal: document.getElementById("cartTotal"),
  cartPanel: document.getElementById("cartPanel"),
  closeCart: document.getElementById("closeCart"),
  cartItems: document.getElementById("cartItems"),
  cartTotalBig: document.getElementById("cartTotalBig"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  checkoutMsg: document.getElementById("checkoutMsg"),
  overlay: document.getElementById("overlay"),
};

const SKIN_LABELS = {
  dry: "Piel seca",
  oily: "Piel grasa",
  combination: "Piel mixta",
  sensitive: "Piel sensible",
  normal: "Piel normal",
  all: "Todas las pieles",
};

async function loadProducts() {
  const params = new URLSearchParams();
  if (els.search.value) params.set("search", els.search.value);
  if (els.skin.value) params.set("skin", els.skin.value);
  if (els.handmade.checked) params.set("handmade", "true");
  if (els.organic.checked) params.set("organic", "true");
  if (els.available.checked) params.set("available", "true");

  const res = await fetch("/api/products?" + params.toString());
  const data = await res.json();
  renderCatalog(data.products || []);
}

function renderCatalog(products) {
  els.catalog.innerHTML = "";
  if (products.length === 0) {
    els.catalog.innerHTML =
      '<p class="text-stone-500 p-6 col-span-full">No hay productos que coincidan con el filtro.</p>';
    return;
  }
  for (const p of products) {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden flex flex-col transition";
    const out = !p.available;
    const badges = [];
    if (p.handmade)
      badges.push(
        '<span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Hecho a mano</span>',
      );
    if (p.organicIngredients && p.organicIngredients.length)
      badges.push(
        '<span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Organico</span>',
      );
    if (p.recommendedSkinType)
      badges.push(
        `<span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">${SKIN_LABELS[p.recommendedSkinType] || p.recommendedSkinType}</span>`,
      );
    if (out)
      badges.push(
        '<span class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">Agotado</span>',
      );

    card.innerHTML = `
      ${
        p.image
          ? `<img src="${p.image}" alt="${p.name}" class="h-32 w-full object-cover" />`
          : `<div class="h-32 bg-gradient-to-br from-brand-200 to-green-200 flex items-center justify-center text-5xl">🧼</div>`
      }
      <div class="p-4 flex flex-col gap-2 flex-1">
        <h3 class="font-semibold text-lg">${p.name}</h3>
        <p class="text-sm text-stone-500 flex-1">${p.description}</p>
        <div class="flex flex-wrap gap-2">${badges.join("")}</div>
        <div class="font-bold text-base">${formatMoney(p.price.amount, p.price.currency)}</div>
        <button ${out ? "disabled" : ""} data-id="${p.id}"
          class="mt-1 w-full bg-brand-600 text-white rounded-lg py-2 font-semibold hover:bg-brand-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition">
          ${out ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>`;
    const btn = card.querySelector("button");
    if (!out) {
      btn.addEventListener("click", () => addToCart(p.id));
    }
    els.catalog.appendChild(card);
  }
}

async function addToCart(productId) {
  const res = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId: getCartId(), productId, quantity: 1 }),
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || "No se pudo agregar al carrito");
    return;
  }
  state.cart = data;
  updateCartUI();
  openCart();
}

async function loadCart() {
  const res = await fetch("/api/cart/" + getCartId());
  if (res.ok) {
    state.cart = await res.json();
    updateCartUI();
  }
}

function updateCartUI() {
  const items = state.cart.items || [];
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = state.cart.total || { amount: 0, currency: CURRENCY };
  els.cartCount.textContent = count;
  els.cartTotal.textContent = formatMoney(total.amount, total.currency);
  els.cartTotalBig.textContent = formatMoney(total.amount, total.currency);

  els.cartItems.innerHTML = "";
  if (items.length === 0) {
    els.cartItems.innerHTML =
      '<p class="text-stone-500">Tu carrito esta vacio.</p>';
    return;
  }
  for (const i of items) {
    const row = document.createElement("div");
    row.className = "flex justify-between gap-3 border-b border-stone-100 pb-2";
    row.innerHTML = `
      <div>
        <strong>${i.name}</strong><br/>
        <small class="text-stone-500">${i.quantity} x ${formatMoney(i.unitPrice.amount, i.unitPrice.currency)}</small>
      </div>
      <div>${formatMoney(i.lineTotal.amount, i.lineTotal.currency)}</div>`;
    els.cartItems.appendChild(row);
  }
}

function openCart() {
  els.cartPanel.classList.remove("translate-x-full");
  els.overlay.classList.remove("hidden");
}

function closeCart() {
  els.cartPanel.classList.add("translate-x-full");
  els.overlay.classList.add("hidden");
}

els.cartBtn.addEventListener("click", openCart);
els.closeCart.addEventListener("click", closeCart);
els.overlay.addEventListener("click", closeCart);

els.checkoutBtn.addEventListener("click", async () => {
  els.checkoutMsg.textContent = "Procesando pago...";
  els.checkoutMsg.className = "text-sm text-center mt-3 text-stone-500";
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartId: getCartId() }),
  });
  const data = await res.json();
  if (!res.ok) {
    els.checkoutMsg.textContent = data.error || "Pago fallido";
    els.checkoutMsg.className =
      "text-sm text-center mt-3 text-red-700 font-medium";
    return;
  }
  els.checkoutMsg.textContent = `Pedido ${data.orderId} · ${data.status.toUpperCase()} · Txn ${data.transactionId}`;
  els.checkoutMsg.className =
    "text-sm text-center mt-3 text-brand-700 font-medium";
  state.cart = { items: [], total: { amount: 0, currency: CURRENCY }, isEmpty: true };
  updateCartUI();
  await loadCart();
});

[els.search, els.skin, els.handmade, els.organic, els.available].forEach(
  (el) => el.addEventListener("input", loadProducts),
);
els.search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadProducts();
});

loadProducts();
loadCart();
