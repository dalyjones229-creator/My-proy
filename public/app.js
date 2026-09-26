const CURRENCY = "COP";

const CATALOG = [
  {
    id: "p1",
    name: "Jabon de Lavanda",
    description:
      "Jabon relajante con aceite esencial de lavanda, ideal para la noche.",
    price: 850,
    category: "soap",
    ingredients: ["aceite de oliva", "manteca de cacao", "lavanda"],
    organicIngredients: ["aceite de oliva", "lavanda"],
    recommendedSkinType: "sensitive",
    handmade: true,
    stock: 12,
    batch: "LOT-LAV-01",
    available: true,
    color1: "#c9b6ef",
    color2: "#8e7cc3",
    emoji: "🧼",
  },
  {
    id: "p2",
    name: "Jabon de Carbon Activado",
    description: "Detox profundo para piel grasa y con poros abiertos.",
    price: 950,
    category: "soap",
    ingredients: ["aceite de coco", "carbon activado"],
    organicIngredients: ["aceite de coco"],
    recommendedSkinType: "oily",
    handmade: true,
    stock: 8,
    batch: "LOT-CAR-01",
    available: true,
    color1: "#6b7280",
    color2: "#1f2937",
    emoji: "🌑",
  },
  {
    id: "p3",
    name: "Jabon de Avena y Miel",
    description: "Exfoliacion suave y humectacion con miel organica.",
    price: 900,
    category: "soap",
    ingredients: ["aceite de oliva", "avena", "miel"],
    organicIngredients: ["aceite de oliva", "avena", "miel"],
    recommendedSkinType: "dry",
    handmade: true,
    stock: 0,
    batch: "LOT-AVE-01",
    available: false,
    color1: "#f3d9a0",
    color2: "#e0b96a",
    emoji: "🍯",
  },
  {
    id: "p4",
    name: "Balsamo de Cacao",
    description: "Balsamo labial nutritivo hecho a mano.",
    price: 720,
    category: "lip_balm",
    ingredients: ["manteca de cacao", "cera de abeja"],
    organicIngredients: ["manteca de cacao"],
    recommendedSkinType: "all",
    handmade: true,
    stock: 20,
    batch: "LOT-BAL-01",
    available: true,
    color1: "#c79a72",
    color2: "#8a5a32",
    emoji: "🍫",
  },
  {
    id: "p5",
    name: "Jabon de Calendula",
    description: "Calma irritaciones con flores de calendula bio.",
    price: 780,
    category: "soap",
    ingredients: ["aceite de oliva", "calendula"],
    organicIngredients: ["aceite de oliva", "calendula"],
    recommendedSkinType: "sensitive",
    handmade: true,
    stock: 15,
    batch: "LOT-CAL-01",
    available: true,
    color1: "#f6c453",
    color2: "#ef9f1f",
    emoji: "🌼",
  },
  {
    id: "p6",
    name: "Jabon de Menta",
    description: "Sensacion fresca y tonificante para el dia a dia.",
    price: 800,
    category: "soap",
    ingredients: ["aceite de coco", "menta"],
    organicIngredients: ["aceite de coco", "menta"],
    recommendedSkinType: "combination",
    handmade: true,
    stock: 10,
    batch: "LOT-MEN-01",
    available: true,
    color1: "#a7e8c0",
    color2: "#5cc88a",
    emoji: "🌱",
  },
  {
    id: "p7",
    name: "Jabon de Rosas",
    description: "Hidratacion aromatica con petalos de rosa.",
    price: 990,
    category: "soap",
    ingredients: ["aceite de oliva", "rosa"],
    organicIngredients: ["aceite de oliva", "rosa"],
    recommendedSkinType: "dry",
    handmade: true,
    stock: 6,
    batch: "LOT-ROS-01",
    available: true,
    color1: "#f4b6c2",
    color2: "#e07a90",
    emoji: "🌹",
  },
  {
    id: "p8",
    name: "Manteca de Karite",
    description: "Crema corporal reconstituyente de karite puro.",
    price: 1200,
    category: "body_butter",
    ingredients: ["manteca de karite", "aceite de almendras"],
    organicIngredients: ["manteca de karite", "aceite de almendras"],
    recommendedSkinType: "all",
    handmade: true,
    stock: 9,
    batch: "LOT-KAR-01",
    available: true,
    color1: "#efe2c0",
    color2: "#d8c089",
    emoji: "🧈",
  },
  {
    id: "p9",
    name: "Shampoo Solido",
    description: "Barra lavante sin envase para cabello normal.",
    price: 1100,
    category: "shampoo_bar",
    ingredients: ["tensoactivos vegetales", "aceite de jojoba"],
    organicIngredients: ["aceite de jojoba"],
    recommendedSkinType: "normal",
    handmade: true,
    stock: 11,
    batch: "LOT-SHA-01",
    available: true,
    color1: "#cfe3f0",
    color2: "#9cc4dd",
    emoji: "🧴",
  },
  {
    id: "p10",
    name: "Jabon Exfoliante de Cafe",
    description: "Exfoliacion energizante con cafe de comercio justo.",
    price: 1050,
    category: "soap",
    ingredients: ["aceite de oliva", "cafe molido"],
    organicIngredients: ["aceite de oliva", "cafe molido"],
    recommendedSkinType: "oily",
    handmade: true,
    stock: 7,
    batch: "LOT-CFE-01",
    available: true,
    color1: "#c8a98a",
    color2: "#9c7a56",
    emoji: "☕",
  },
];

const CATEGORY_LABELS = {
  soap: "Jabon",
  shampoo_bar: "Shampoo solido",
  body_butter: "Crema corporal",
  lip_balm: "Balsamo labial",
  lotion: "Locion",
  other: "Otro",
};

const SKIN_LABELS = {
  dry: "Piel seca",
  oily: "Piel grasa",
  combination: "Piel mixta",
  sensitive: "Piel sensible",
  normal: "Piel normal",
  all: "Todas las pieles",
};

function formatMoney(amount, currency = CURRENCY) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function productImage(p) {
  const safeName = escapeHtml(p.name);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${p.color1}'/>
        <stop offset='1' stop-color='${p.color2}'/>
      </linearGradient>
    </defs>
    <rect width='400' height='300' fill='url(#g)'/>
    <circle cx='200' cy='130' r='72' fill='#ffffff' opacity='0.85'/>
    <text x='200' y='162' font-size='72' text-anchor='middle'>${p.emoji}</text>
    <text x='200' y='250' font-size='22' font-family='Segoe UI, sans-serif' font-weight='bold' fill='#2c2a26' text-anchor='middle'>${safeName}</text>
  </svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg.trim());
}

const els = {
  nav: document.getElementById("nav"),
  search: document.getElementById("search"),
  skin: document.getElementById("skin"),
  handmade: document.getElementById("handmade"),
  organic: document.getElementById("organic"),
  available: document.getElementById("available"),
  catalog: document.getElementById("catalog"),
  catalogCount: document.getElementById("catalogCount"),
  year: document.getElementById("year"),
  leadForm: document.getElementById("leadForm"),
  leadMsg: document.getElementById("leadMsg"),
};

function activeFilters() {
  const term = els.search.value.trim().toLowerCase();
  const skin = els.skin.value;
  return {
    term,
    skin,
    handmade: els.handmade.checked,
    organic: els.organic.checked,
    onlyAvailable: els.available.checked,
  };
}

function matches(p, f) {
  if (f.handmade && !p.handmade) return false;
  if (f.onlyAvailable && !p.available) return false;
  if (f.organic && (!p.organicIngredients || p.organicIngredients.length === 0))
    return false;
  if (f.skin && f.skin !== "all" && p.recommendedSkinType !== f.skin)
    return false;
  if (f.term) {
    const haystack = [
      p.name,
      p.description,
      p.batch,
      p.ingredients.join(" "),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(f.term)) return false;
  }
  return true;
}

function renderCatalog() {
  const f = activeFilters();
  const list = CATALOG.filter((p) => matches(p, f));

  els.catalog.innerHTML = "";
  els.catalogCount.textContent =
    list.length === 1
      ? "1 producto encontrado"
      : `${list.length} productos encontrados`;

  if (list.length === 0) {
    els.catalog.innerHTML =
      '<p class="text-stone-500 p-6 col-span-full text-center">No hay productos que coincidan con el filtro.</p>';
    return;
  }

  for (const p of list) {
    const card = document.createElement("article");
    card.className =
      "bg-white rounded-2xl shadow hover:shadow-lg overflow-hidden flex flex-col transition";

    const badges = [`<span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">${escapeHtml(
      CATEGORY_LABELS[p.category] || p.category,
    )}</span>`];
    if (p.handmade)
      badges.push(
        '<span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Hecho a mano</span>',
      );
    if (p.organicIngredients.length)
      badges.push(
        '<span class="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">Organico</span>',
      );
    badges.push(
      `<span class="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">${escapeHtml(
        SKIN_LABELS[p.recommendedSkinType] || p.recommendedSkinType,
      )}</span>`,
    );
    if (!p.available)
      badges.push(
        '<span class="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700">Agotado</span>',
      );

    card.innerHTML = `
      <img src="${productImage(p)}" alt="${escapeHtml(
        p.name,
      )}" class="h-32 w-full object-cover" loading="lazy" />
      <div class="p-4 flex flex-col gap-2 flex-1">
        <h3 class="font-semibold text-lg">${escapeHtml(p.name)}</h3>
        <p class="text-sm text-stone-500 flex-1">${escapeHtml(p.description)}</p>
        <div class="flex flex-wrap gap-2">${badges.join("")}</div>
        <p class="text-xs text-stone-400">Lote ${escapeHtml(p.batch)} · Stock ${p.stock}</p>
        <div class="font-bold text-base">${formatMoney(p.price)}</div>
        <button type="button" data-buy="${escapeHtml(
          p.id,
        )}" class="mt-1 w-full bg-brand-600 text-white rounded-lg py-2 font-semibold hover:bg-brand-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition">
          ${p.available ? "Consultar por este" : "Sin stock"}
        </button>
      </div>`;

    const btn = card.querySelector("button");
    if (p.available) {
      btn.addEventListener("click", () => requestProduct(p));
    }
    els.catalog.appendChild(card);
  }
}

function requestProduct(p) {
  const msg =
    `Hola, me interesa el ${p.name} (${p.batch}) que vi en la web. ` +
    "¿Sigue disponible?";
  const wa = "https://wa.me/573001234567?text=" + encodeURIComponent(msg);
  window.open(wa, "_blank", "noopener");
}

function initNav() {
  const onScroll = () => {
    const solid = window.scrollY > 40;
    els.nav.classList.toggle("bg-brand-900/95", solid);
    els.nav.classList.toggle("backdrop-blur", solid);
    els.nav.classList.toggle("shadow-lg", solid);
    if (!solid) {
      els.nav.classList.remove("bg-brand-900/95", "backdrop-blur", "shadow-lg");
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  targets.forEach((t) => io.observe(t));
}

function initLeadForm() {
  els.leadForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("leadName").value.trim();
    const message = document.getElementById("leadMessage").value.trim();
    const text =
      `Hola, soy ${name}. ${message}`.slice(0, 1000);
    const wa =
      "https://wa.me/573001234567?text=" + encodeURIComponent(text);
    window.open(wa, "_blank", "noopener");
    els.leadMsg.textContent =
      "Abrimos WhatsApp con tu mensaje. Si no abre, escribenos directo.";
    els.leadMsg.className = "sm:col-span-2 text-center text-sm text-amber-200";
    els.leadForm.reset();
  });
}

[els.search, els.skin, els.handmade, els.organic, els.available].forEach(
  (el) => el.addEventListener("input", renderCatalog),
);
els.search.addEventListener("keydown", (e) => {
  if (e.key === "Enter") renderCatalog();
});

els.year.textContent = String(new Date().getFullYear());

initNav();
initReveal();
initLeadForm();
renderCatalog();
