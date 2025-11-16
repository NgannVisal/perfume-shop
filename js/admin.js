// ===== API base =====
const API = "https://perfume-shop-api.onrender.com/api/products";

// ===== modal & form refs =====
const modal = document.getElementById("adminModal");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const cancelForm = document.getElementById("cancelForm");
const adminForm = document.getElementById("adminForm");
const toast = document.getElementById("toast");

// form fields
const fMode = document.getElementById("formMode");
const rowId = document.getElementById("idRow");
const fId = document.getElementById("id");
const fName = document.getElementById("name");
const fBrand = document.getElementById("brand");
const fPrice = document.getElementById("price");
const fTag = document.getElementById("tag");
const fRating = document.getElementById("rating");
const fImage = document.getElementById("image");
const fDesc = document.getElementById("description");

// buttons
const btnAdd = document.getElementById("btnAdd");
const btnUpdate = document.getElementById("btnUpdate");
const btnDelete = document.getElementById("btnDelete");

// ===== helpers =====
function openModal(mode, title) {
  fMode.value = mode;
  modalTitle.textContent = title;
  rowId.classList.toggle("hidden", mode === "add");
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  adminForm.reset();
  fId.value = "";
}

function showToast(msg, ok = true) {
  toast.textContent = msg;
  toast.style.background = ok
    ? "linear-gradient(90deg,#27ae60,#219150)"
    : "linear-gradient(90deg,#e74c3c,#c0392b)";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// ===== API calls =====
async function addProduct(product) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });

  if (!res.ok) throw new Error("Add failed");
  return res.json();
}

async function updateProduct(id, product) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product)
  });

  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

async function deleteProduct(id) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE"
  });

  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

async function getProductById(id) {
  const res = await fetch(API);
  const list = await res.json();
  return list.find(p => String(p.id) === String(id));
}

// ===== refresh homepage list =====
function refreshProductsUI() {
  if (window.fetchProducts) {
    fetchProducts().then(() => {
      if (window.applySearchSort) applySearchSort();
    });
  }
}

// ===== wire up buttons =====
btnAdd?.addEventListener("click", () => {
  openModal("add", "Add product");
});

btnUpdate?.addEventListener("click", async () => {
  const id = prompt("Enter Product ID to edit:");
  if (!id) return;

  const p = await getProductById(id);
  if (!p) {
    showToast("Product not found", false);
    return;
  }

  openModal("update", "Update product");
  fId.value = p.id;
  fName.value = p.name;
  fBrand.value = p.brand;
  fPrice.value = p.price;
  fTag.value = p.tag;
  fRating.value = p.rating;
  fImage.value = p.image;
  fDesc.value = p.description;
});

btnDelete?.addEventListener("click", async () => {
  const id = prompt("Enter Product ID to delete:");
  if (!id) return;

  if (!confirm("Delete product #" + id + "?")) return;

  try {
    await deleteProduct(id);
    showToast("Deleted 🗑️");
    refreshProductsUI();
  } catch (err) {
    console.error(err);
    showToast("Delete failed", false);
  }
});

// Modal close
modalClose.addEventListener("click", closeModal);
cancelForm.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Form submit
adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = {
    name: fName.value.trim(),
    brand: fBrand.value.trim(),
    price: Number(fPrice.value),
    image: fImage.value.trim(),
    tag: fTag.value.trim(),
    rating: Number(fRating.value),
    description: fDesc.value.trim()
  };

  try {
    if (fMode.value === "add") {
      await addProduct(product);
      showToast("Product added ✅");
    } else {
      if (!fId.value) return showToast("Missing ID", false);
      await updateProduct(fId.value, product);
      showToast("Product updated ✅");
    }

    closeModal();
    refreshProductsUI();

  } catch (err) {
    console.error(err);
    showToast("Action failed", false);
  }
});
