/* POS v2 – theme-matching, mobile clean, Custom Plate price entry */

const money = (n) => `$${Number(n).toFixed(2)}`;

const PRODUCTS = [
  { id: "plate1", name: "Plate One", price: 60.00, tag: "Plate" },
  { id: "plate2", name: "Plate Two", price: 75.00, tag: "Plate" },
  { id: "plate3", name: "Plate Three", price: 75.00, tag: "Plate" },
  { id: "plate4", name: "Plate Four", price: 75.00, tag: "Plate" },
  { id: "vegan",  name: "Vegan Plate", price: 55.00, tag: "Plate" },

  // ✅ Custom Plate: price blank, user enters
  { id: "custom", name: "Custom Plate", price: null, tag: "Custom", type: "custom" },
  { id: "custom", name: "Deposit", price: null, tag: "Custom", type: "deposit" },
  { id: "custom", name: "Travel Fee", price: null, tag: "Custom", type: "custom" }


];

let cart = []; // { id, name, unitPrice, qty, lineTotal, note? }

const menuGrid = document.getElementById("menuGrid");
const orderList = document.getElementById("orderList");
const totalAmount = document.getElementById("totalAmount");
const btnClear = document.getElementById("btnClear");
const btnCheckout = document.getElementById("btnCheckout");
const checkoutMsg = document.getElementById("checkoutMsg");

/* Modal */
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const modalAdd = document.getElementById("modalAdd");
const modalName = document.getElementById("modalName");
const modalTag = document.getElementById("modalTag");

const priceRow = document.getElementById("priceRow");
const priceInput = document.getElementById("priceInput");
const qtyInput = document.getElementById("qtyInput");
const qtyMinus = document.getElementById("qtyMinus");
const qtyPlus = document.getElementById("qtyPlus");
const itemTotal = document.getElementById("itemTotal");

let activeProduct = null;

function openModal(product){
  activeProduct = product;

  modalName.textContent = product.name;
  modalTag.textContent = product.tag || "Add Item";

  // reset qty
  qtyInput.value = 1;

  // Custom plate: show price input blank
  if (product.type === "custom" || product.type === "deposit") {
    priceRow.style.display = "block";
    priceInput.value = ""; // ✅ blank
    setTimeout(() => priceInput.focus(), 50);
  } else {
    priceRow.style.display = "none";
    priceInput.value = "";
    setTimeout(() => qtyInput.focus(), 50);
  }

  updatePreview();
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.setAttribute("aria-hidden", "true");
  activeProduct = null;
}

function getQty(){
  const q = parseInt(qtyInput.value, 10);
  return Number.isFinite(q) && q > 0 ? q : 1;
}

function getUnitPrice(){
  if (!activeProduct) return 0;

  if (activeProduct.type === "custom") {
    const v = parseFloat(priceInput.value);
    return Number.isFinite(v) && v >= 0 ? v : NaN; // invalid until user enters
  }

  else if (activeProduct.type === "deposit" ) {
    const v = -(parseFloat(priceInput.value));
    return Number.isFinite(v) && v <= 0 ? v : NaN; // invalid until user enters
  }
  return activeProduct.price;
}

function updatePreview(){
  const qty = getQty();
  const unit = getUnitPrice();

  if (Number.isNaN(unit)) {
    itemTotal.textContent = "$0.00";
    return;
  }
  itemTotal.textContent = money(unit * qty);
}

qtyMinus.addEventListener("click", () => {
  const q = getQty();
  qtyInput.value = Math.max(1, q - 1);
  updatePreview();
});

qtyPlus.addEventListener("click", () => {
  const q = getQty();
  qtyInput.value = q + 1;
  updatePreview();
});

qtyInput.addEventListener("input", updatePreview);
priceInput.addEventListener("input", updatePreview);

modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);

// click outside modal card closes
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

modalAdd.addEventListener("click", () => {
  if (!activeProduct) return;

  const qty = getQty();
  const unit = getUnitPrice();

  // ✅ validate custom price
  if (activeProduct.type === "custom") {
    if (!Number.isFinite(unit) || unit <= 0) {
      priceInput.focus();
      priceInput.style.outline = "2px solid rgba(239,68,68,.7)";
      setTimeout(() => (priceInput.style.outline = "none"), 900);
      return;
    }
  }

  const lineTotal = unit * qty;

  cart.push({
    id: activeProduct.id,
    name: activeProduct.name,
    unitPrice: unit,
    qty,
    lineTotal,
    note: activeProduct.type === "custom" ? "Manual price" : ""
  });

  renderOrder();
  closeModal();
});

function renderMenu(){
  menuGrid.innerHTML = "";

  PRODUCTS.forEach((p) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item";

    const priceText = (p.type === "custom")
      ? "Enter price"
      : money(p.price);

    btn.innerHTML = `
      <div class="name">${p.name}</div>
      <div class="meta">
        <span class="pill">${p.tag || "Item"}</span>
        <span class="pill">${priceText}</span>
      </div>
    `;

    btn.addEventListener("click", () => openModal(p));
    menuGrid.appendChild(btn);
  });
}

function renderOrder(){
  orderList.innerHTML = "";

  let total = 0;

  cart.forEach((line, idx) => {
    total += line.lineTotal;

    const row = document.createElement("div");
    row.className = "order-line";

    row.innerHTML = `
      <div class="left">
        <div class="title">${line.qty}× ${line.name}</div>
        <div class="sub">${money(line.unitPrice)} each${line.note ? " • " + line.note : ""}</div>
      </div>
      <div class="right">
        <div class="price">${money(line.lineTotal)}</div>
        <button class="remove-btn" type="button" data-i="${idx}">Remove</button>
      </div>
    `;

    orderList.appendChild(row);
  });

  totalAmount.textContent = money(total);

  // bind remove buttons
  orderList.querySelectorAll(".remove-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const i = parseInt(b.getAttribute("data-i"), 10);
      if (!Number.isFinite(i)) return;
      cart.splice(i, 1);
      renderOrder();
    });
  });
}

btnClear.addEventListener("click", () => {
  cart = [];
  checkoutMsg.textContent = "";
  renderOrder();
});

btnCheckout.addEventListener("click", () => {
  if (cart.length === 0) {
    checkoutMsg.textContent = "Add items first.";
    return;
  }

  // For now: just show summary message (no database yet)
  const total = cart.reduce((sum, x) => sum + x.lineTotal, 0);
  checkoutMsg.textContent = `Order ready. Total: ${money(total)} (saving/printing later)`;
});

renderMenu();
renderOrder();
