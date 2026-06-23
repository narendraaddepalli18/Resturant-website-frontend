
(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const hide = () => {
    preloader.style.opacity = "0";
    preloader.style.transition = "opacity 0.6s ease";
    setTimeout(() => preloader.remove(), 650);
  };

  if (document.readyState === "complete") {
    setTimeout(hide, 800);
  } else {
    window.addEventListener("load", () => setTimeout(hide, 800));
  }
})();


/* ── 2. NAVBAR: scroll class + mobile toggle ──────────────── */
(function () {
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  /* scroll-tinted navbar */
  const onScroll = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* hamburger open/close */
  toggle && toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen);
  });

  /* close mobile menu on link click */
  navLinks && navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggle && toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* close mobile menu on outside click */
  document.addEventListener("click", (e) => {
    if (
      navLinks &&
      navLinks.classList.contains("open") &&
      !navLinks.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      navLinks.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();


/* ── 3. ACTIVE NAV LINK on scroll ─────────────────────────── */
(function () {
  const sections = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-links a[href^='#']");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = document.querySelector(
            `.nav-links a[href="#${entry.target.id}"]`
          );
          active && active.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  sections.forEach((s) => observer.observe(s));

  /* inject active style */
  const style = document.createElement("style");
  style.textContent = `.nav-links a.active { color: var(--ivory); }
    .nav-links a.active::after { width: 100%; }`;
  document.head.appendChild(style);
})();


/* ── 4. SCROLL-REVEAL ─────────────────────────────────────── */
(function () {
  const style = document.createElement("style");
  style.textContent = `
    .sr { opacity: 0; transform: translateY(36px); transition: opacity 0.65s ease, transform 0.65s ease; }
    .sr.visible { opacity: 1; transform: none; }
    .sr-delay-1 { transition-delay: 0.10s; }
    .sr-delay-2 { transition-delay: 0.20s; }
    .sr-delay-3 { transition-delay: 0.30s; }
    .sr-delay-4 { transition-delay: 0.40s; }
  `;
  document.head.appendChild(style);

  /* mark elements */
  document.querySelectorAll(".card").forEach((el, i) => {
    el.classList.add("sr", `sr-delay-${(i % 4) + 1}`);
  });
  document.querySelectorAll(".gallery img").forEach((el, i) => {
    el.classList.add("sr", `sr-delay-${(i % 4) + 1}`);
  });
  document.querySelectorAll(".stat").forEach((el, i) => {
    el.classList.add("sr", `sr-delay-${i + 1}`);
  });

  /* observe */
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".sr").forEach((el) => io.observe(el));
})();


/* ── 5. CART ──────────────────────────────────────────────── */
const Cart = (function () {
  /* ---- state ---- */
  let items = [];

  /* ---- helpers ---- */
  function parsePrice(str) {
    return parseInt(str.replace(/[^\d]/g, ""), 10) || 0;
  }

  /* ---- build sidebar HTML ---- */
  function buildSidebar() {
    const sidebar = document.createElement("aside");
    sidebar.id = "cart-sidebar";
    sidebar.innerHTML = `
      <div class="cart-overlay"></div>
      <div class="cart-panel">
        <div class="cart-header">
          <h3><i class="fa-solid fa-bag-shopping"></i> Your Order</h3>
          <button class="cart-close" aria-label="Close cart">&times;</button>
        </div>
        <ul class="cart-list"></ul>
        <div class="cart-footer">
          <div class="cart-total">Total: <span class="cart-total-amt">₹0</span></div>
          <button class="cart-checkout-btn">Proceed to Checkout</button>
          <button class="cart-clear-btn">Clear Cart</button>
        </div>
      </div>
    `;
    document.body.appendChild(sidebar);

    /* inject cart styles */
    const style = document.createElement("style");
    style.textContent = `
      #cart-sidebar { position: fixed; inset: 0; z-index: 2000; pointer-events: none; }
      #cart-sidebar.open { pointer-events: all; }
      .cart-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); opacity: 0;
        transition: opacity 0.3s; backdrop-filter: blur(4px); }
      #cart-sidebar.open .cart-overlay { opacity: 1; }
      .cart-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(400px, 92vw);
        background: var(--netflix-black); border-left: 1px solid rgba(229,9,20,0.3);
        display: flex; flex-direction: column; transform: translateX(100%);
        transition: transform 0.36s cubic-bezier(0.4,0,0.2,1); }
      #cart-sidebar.open .cart-panel { transform: none; }
      .cart-header { display: flex; align-items: center; justify-content: space-between;
        padding: 20px 22px; border-bottom: 1px solid rgba(229,9,20,0.2); }
      .cart-header h3 { font-family: var(--font-display); font-size: 20px; color: var(--ivory);
        display: flex; align-items: center; gap: 10px; }
      .cart-header h3 i { color: var(--netflix-red); }
      .cart-close { background: none; border: none; color: var(--muted); font-size: 26px;
        cursor: pointer; line-height: 1; transition: color 0.2s; }
      .cart-close:hover { color: var(--netflix-red); }
      .cart-list { flex: 1; overflow-y: auto; padding: 16px 22px; display: flex;
        flex-direction: column; gap: 14px; }
      .cart-list:empty::after { content: "Your cart is empty.";
        color: var(--muted); font-size: 15px; margin: auto; text-align: center; }
      .cart-item { display: flex; align-items: center; gap: 14px;
        background: var(--netflix-surface); border-radius: 8px; padding: 12px 14px;
        border: 1px solid rgba(255,255,255,0.06); }
      .cart-item-info { flex: 1; min-width: 0; }
      .cart-item-name { font-size: 14px; font-weight: 600; color: var(--ivory);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .cart-item-price { font-size: 13px; color: var(--gold-soft); margin-top: 2px; }
      .cart-qty { display: flex; align-items: center; gap: 8px; }
      .cart-qty button { width: 26px; height: 26px; border-radius: 50%;
        background: rgba(229,9,20,0.15); border: 1px solid var(--netflix-red);
        color: var(--ivory); font-size: 16px; line-height: 1; cursor: pointer;
        transition: background 0.2s; display: flex; align-items: center; justify-content: center; }
      .cart-qty button:hover { background: var(--netflix-red); }
      .cart-qty span { min-width: 20px; text-align: center; font-weight: 700;
        color: var(--ivory); font-size: 15px; }
      .cart-remove { background: none; border: none; color: var(--muted); cursor: pointer;
        font-size: 18px; padding: 2px 4px; transition: color 0.2s; }
      .cart-remove:hover { color: var(--netflix-red); }
      .cart-footer { padding: 20px 22px; border-top: 1px solid rgba(229,9,20,0.2);
        display: flex; flex-direction: column; gap: 12px; }
      .cart-total { font-size: 17px; font-weight: 700; color: var(--ivory);
        display: flex; justify-content: space-between; }
      .cart-total-amt { color: var(--gold-soft); font-family: var(--font-display); font-size: 20px; }
      .cart-checkout-btn { padding: 14px; background: var(--netflix-red); border: none;
        border-radius: 4px; color: var(--ivory); font-size: 15px; font-weight: 700;
        cursor: pointer; transition: background 0.25s, transform 0.2s;
        box-shadow: 0 4px 18px var(--netflix-red-glow); }
      .cart-checkout-btn:hover { background: var(--netflix-red-dark); transform: translateY(-2px); }
      .cart-clear-btn { padding: 10px; background: transparent;
        border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; color: var(--muted);
        font-size: 14px; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
      .cart-clear-btn:hover { border-color: var(--netflix-red); color: var(--netflix-red); }
      /* badge */
      .cart-badge { display: inline-flex; align-items: center; justify-content: center;
        background: var(--netflix-red); color: #fff; font-size: 10px; font-weight: 700;
        width: 18px; height: 18px; border-radius: 50%; margin-left: 4px;
        animation: badge-pop 0.25s ease; }
      @keyframes badge-pop { 0% { transform: scale(0.5); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
    `;
    document.head.appendChild(style);
    return sidebar;
  }

  const sidebar = buildSidebar();
  const overlay = sidebar.querySelector(".cart-overlay");
  const closeBtn = sidebar.querySelector(".cart-close");
  const listEl = sidebar.querySelector(".cart-list");
  const totalEl = sidebar.querySelector(".cart-total-amt");
  const checkoutBtn = sidebar.querySelector(".cart-checkout-btn");
  const clearBtn = sidebar.querySelector(".cart-clear-btn");

  /* ---- open / close ---- */
  function open() { sidebar.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { sidebar.classList.remove("open"); document.body.style.overflow = ""; }

  overlay.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => e.key === "Escape" && close());

  /* cart nav link */
  document.querySelector(".cart-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });

  /* ---- render ---- */
  function render() {
    listEl.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price} × ${item.qty}</div>
        </div>
        <div class="cart-qty">
          <button class="dec" aria-label="Decrease">−</button>
          <span>${item.qty}</span>
          <button class="inc" aria-label="Increase">+</button>
        </div>
        <button class="cart-remove" aria-label="Remove">×</button>
      `;
      li.querySelector(".inc").addEventListener("click", () => changeQty(item.id, 1));
      li.querySelector(".dec").addEventListener("click", () => changeQty(item.id, -1));
      li.querySelector(".cart-remove").addEventListener("click", () => removeItem(item.id));
      listEl.appendChild(li);
    });

    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    totalEl.textContent = `₹${total}`;
    updateBadge();
  }

  function updateBadge() {
    const link = document.querySelector(".cart-link");
    if (!link) return;
    const old = link.querySelector(".cart-badge");
    old && old.remove();
    const count = items.reduce((s, i) => s + i.qty, 0);
    if (count > 0) {
      const badge = document.createElement("span");
      badge.className = "cart-badge";
      badge.textContent = count > 99 ? "99+" : count;
      link.appendChild(badge);
    }
  }

  /* ---- item operations ---- */
  function addItem(name, price) {
    const id = name.trim().toLowerCase();
    const existing = items.find((i) => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      items.push({ id, name, price, qty: 1 });
    }
    render();
    showToast(`"${name}" added to cart`);
  }

  function changeQty(id, delta) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) items = items.filter((i) => i.id !== id);
    render();
  }

  function removeItem(id) {
    items = items.filter((i) => i.id !== id);
    render();
  }

  clearBtn.addEventListener("click", () => {
    if (!items.length) return;
    if (confirm("Clear all items from your cart?")) { items = []; render(); }
  });

  checkoutBtn.addEventListener("click", () => {
    if (!items.length) { showToast("Your cart is empty!", "warn"); return; }
    showToast("Order placed! We'll confirm via email 🎉", "success");
    items = [];
    render();
    setTimeout(close, 1200);
  });

  /* ---- wire "Add" buttons ---- */
  document.querySelectorAll(".card button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const name = card.querySelector("h3").textContent.trim();
      const priceStr = card.querySelector(".price").textContent.trim();
      addItem(name, parsePrice(priceStr));
    });
  });

  /* ---- "Order Now" hero button ---- */
  document.querySelector(".btn-primary")?.addEventListener("click", open);

  return { open, close };
})();


/* ── 6. TOAST NOTIFICATION ────────────────────────────────── */
function showToast(msg, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
    const s = document.createElement("style");
    s.textContent = `
      #toast-container { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
        display: flex; flex-direction: column; gap: 10px; z-index: 3000; align-items: center; }
      .toast { padding: 13px 26px; border-radius: 6px; font-size: 14px; font-weight: 600;
        color: #fff; box-shadow: 0 6px 24px rgba(0,0,0,0.45); animation: toast-in 0.3s ease,
        toast-out 0.3s ease 2.5s forwards; white-space: nowrap; max-width: 90vw;
        text-overflow: ellipsis; overflow: hidden; }
      .toast.info    { background: var(--saddle-light); border-left: 4px solid var(--gold-soft); }
      .toast.success { background: #1a4a1a; border-left: 4px solid #4caf50; }
      .toast.warn    { background: #3a1a1a; border-left: 4px solid var(--netflix-red); }
      @keyframes toast-in  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
      @keyframes toast-out { from { opacity:1; } to { opacity:0; } }
    `;
    document.head.appendChild(s);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 2900);
}


/* ── 7. BOOK TABLE MODAL ──────────────────────────────────── */
(function () {
  /* Build modal */
  const modal = document.createElement("div");
  modal.id = "book-modal";
  modal.innerHTML = `
    <div class="bm-overlay"></div>
    <div class="bm-panel" role="dialog" aria-modal="true" aria-label="Book a table">
      <button class="bm-close" aria-label="Close">&times;</button>
      <p class="section-eyebrow" style="text-align:left;margin-bottom:6px;">Reservations</p>
      <h2 style="text-align:left;font-size:28px;margin-bottom:26px;">Book a Table</h2>
      <form id="book-form" novalidate>
        <input type="text"   id="bm-name"   placeholder="Full Name"   required autocomplete="name">
        <input type="email"  id="bm-email"  placeholder="Email"       required autocomplete="email">
        <input type="tel"    id="bm-phone"  placeholder="Phone (optional)" autocomplete="tel">
        <div class="form-row">
          <input type="date" id="bm-date"  required>
          <input type="time" id="bm-time"  required>
        </div>
        <input type="number" id="bm-guests" placeholder="Number of Guests" min="1" max="20" required>
        <textarea id="bm-notes" placeholder="Special requests (optional)" rows="3"></textarea>
        <button type="submit">Confirm Reservation</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const s = document.createElement("style");
  s.textContent = `
    #book-modal { position:fixed; inset:0; z-index:2100; pointer-events:none; }
    #book-modal.open { pointer-events:all; }
    .bm-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.65);
      opacity:0; transition:opacity 0.3s; backdrop-filter:blur(6px); }
    #book-modal.open .bm-overlay { opacity:1; }
    .bm-panel { position:absolute; top:50%; left:50%; transform:translate(-50%,-44%) scale(0.94);
      width:min(520px,94vw); background:var(--netflix-black);
      border:1px solid rgba(229,9,20,0.35); border-radius:12px; padding:40px 36px 36px;
      transition:transform 0.36s cubic-bezier(0.4,0,0.2,1), opacity 0.36s;
      opacity:0; max-height:90vh; overflow-y:auto; }
    #book-modal.open .bm-panel { transform:translate(-50%,-50%) scale(1); opacity:1; }
    .bm-close { position:absolute; top:16px; right:18px; background:none; border:none;
      color:var(--muted); font-size:28px; cursor:pointer; line-height:1; transition:color 0.2s; }
    .bm-close:hover { color:var(--netflix-red); }
    #book-form { display:flex; flex-direction:column; gap:16px; }
    #book-form textarea { padding:14px 16px; border:1px solid rgba(229,9,20,0.25);
      border-radius:4px; background:var(--netflix-surface); color:var(--ivory);
      font-family:var(--font-body); font-size:15px; resize:vertical;
      transition:border-color 0.25s, box-shadow 0.25s; }
    #book-form textarea::placeholder { color:var(--muted); }
    #book-form textarea:focus { border-color:var(--netflix-red);
      box-shadow:0 0 0 3px rgba(229,9,20,0.18); outline:none; }
    #book-form button[type=submit] { padding:16px; background:var(--netflix-red); border:none;
      border-radius:4px; color:var(--ivory); font-size:16px; font-weight:700; cursor:pointer;
      box-shadow:0 6px 24px var(--netflix-red-glow); transition:background 0.25s, transform 0.2s; }
    #book-form button[type=submit]:hover { background:var(--netflix-red-dark); transform:translateY(-2px); }
  `;
  document.head.appendChild(s);

  const overlay = modal.querySelector(".bm-overlay");
  const closeBtn = modal.querySelector(".bm-close");
  const form = document.getElementById("book-form");

  function openModal() { modal.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }

  overlay.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  document.querySelector(".book-btn")?.addEventListener("click", openModal);

  /* Set min date to today */
  const dateInput = document.getElementById("bm-date");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name   = document.getElementById("bm-name").value.trim();
    const email  = document.getElementById("bm-email").value.trim();
    const date   = document.getElementById("bm-date").value;
    const time   = document.getElementById("bm-time").value;
    const guests = document.getElementById("bm-guests").value;

    if (!name || !email || !date || !time || !guests) {
      showToast("Please fill in all required fields.", "warn");
      return;
    }
    showToast(`Table booked for ${name} on ${date} at ${time} 🎉`, "success");
    form.reset();
    setTimeout(closeModal, 1400);
  });
})();


/* ── 8. CONTACT / RESERVATION FORM (inline section) ─────── */
(function () {
  const form = document.querySelector("#contact form");
  if (!form) return;

  /* Set min date */
  const dateInput = form.querySelector("input[type='date']");
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll("input[required]");
    let valid = true;
    inputs.forEach((i) => { if (!i.value.trim()) valid = false; });
    if (!valid) { showToast("Please fill all required fields.", "warn"); return; }
    showToast("Reservation confirmed! See you soon 🙏", "success");
    form.reset();
  });
})();


/* ── 9. GALLERY LIGHTBOX ──────────────────────────────────── */
(function () {
  const images = Array.from(document.querySelectorAll(".gallery img"));
  if (!images.length) return;

  const lb = document.createElement("div");
  lb.id = "lightbox";
  lb.innerHTML = `
    <div class="lb-overlay"></div>
    <button class="lb-prev" aria-label="Previous">&#8249;</button>
    <div class="lb-img-wrap"><img src="" alt="" class="lb-img"></div>
    <button class="lb-next" aria-label="Next">&#8250;</button>
    <button class="lb-close" aria-label="Close lightbox">&times;</button>
  `;
  document.body.appendChild(lb);

  const s = document.createElement("style");
  s.textContent = `
    #lightbox { position:fixed; inset:0; z-index:2500; display:flex; align-items:center;
      justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.3s; }
    #lightbox.open { opacity:1; pointer-events:all; }
    .lb-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.88); backdrop-filter:blur(8px); }
    .lb-img-wrap { position:relative; z-index:1; max-width:88vw; max-height:82vh;
      display:flex; align-items:center; justify-content:center; }
    .lb-img { max-width:88vw; max-height:82vh; object-fit:contain; border-radius:8px;
      box-shadow:0 0 0 2px var(--netflix-red), 0 0 40px var(--netflix-red-glow);
      transition:opacity 0.25s; }
    .lb-close { position:absolute; top:20px; right:24px; z-index:2; background:rgba(229,9,20,0.15);
      border:1px solid var(--netflix-red); color:var(--ivory); font-size:28px; width:44px; height:44px;
      border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:background 0.2s; }
    .lb-close:hover { background:var(--netflix-red); }
    .lb-prev, .lb-next { position:relative; z-index:2; background:rgba(229,9,20,0.15);
      border:1px solid var(--netflix-red); color:var(--ivory); font-size:36px; width:52px; height:52px;
      border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:background 0.2s; margin:0 12px; flex-shrink:0; }
    .lb-prev:hover, .lb-next:hover { background:var(--netflix-red); }
  `;
  document.head.appendChild(s);

  let current = 0;
  const imgEl = lb.querySelector(".lb-img");
  const overlay = lb.querySelector(".lb-overlay");
  const closeBtn = lb.querySelector(".lb-close");
  const prevBtn = lb.querySelector(".lb-prev");
  const nextBtn = lb.querySelector(".lb-next");

  function show(i) {
    current = (i + images.length) % images.length;
    imgEl.style.opacity = "0";
    setTimeout(() => {
      imgEl.src = images[current].src;
      imgEl.alt = images[current].alt;
      imgEl.style.opacity = "1";
    }, 180);
  }

  function open(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

  images.forEach((img, i) => img.addEventListener("click", () => open(i)));
  overlay.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));

  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "ArrowLeft")  show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "Escape") close();
  });
})();


/* ── 10. SMOOTH SCROLL for hash anchors ───────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});