// ===== CART STATE =====
let cart = JSON.parse(localStorage.getItem('its-delicious-cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});

// ===== ADD TO CART =====
function addToCart(id, name, price, image) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`${name} added to cart! 🛒`);
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart(); updateCartCount();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  else { saveCart(); renderCart(); updateCartCount(); }
}

function saveCart() {
  localStorage.setItem('its-delicious-cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

function updateCartCount() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const el = document.getElementById('cartCount');
  if (el) el.textContent = count;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <p style="font-size:0.85rem;margin-top:0.4rem;opacity:0.6">Add something delicious!</p>
      </div>`;
    if (totalEl) totalEl.textContent = '0 frs';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/cookie-original.jpg'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} frs</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${item.id}')">✕</button>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = getCartTotal().toLocaleString() + ' frs';
}

// ===== CART SIDEBAR =====
function openCart() {
  document.getElementById('cartOverlay').classList.add('open');
  document.getElementById('cartSidebar').classList.add('open');
}

function closeCart() {
  document.getElementById('cartOverlay').classList.remove('open');
  document.getElementById('cartSidebar').classList.remove('open');
}

// ===== ORDER MODAL =====
function openCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  closeCart();
  document.getElementById('orderModal').classList.add('open');
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('open');
}

async function submitOrder() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  if (!name || !phone || !address) {
    showToast('Please fill in all required fields!');
    return;
  }

  const orderData = {
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    notes,
    items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
    totalAmount: getCartTotal()
  };

  try {
    const res = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (res.ok) showSuccess();
    else showSuccess(); // show success even in demo mode
  } catch {
    showSuccess();
  }
}

function showSuccess() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const notes = document.getElementById('orderNotes').value.trim();

  // Build WhatsApp message
  let message = `🍪 NEW ORDER - IT'S DELICIOUS\n\n`;
  message += `👤 Name: ${name}\n`;
  message += `📞 Phone: ${phone}\n`;
  message += `📍 Address: ${address}\n\n`;
  message += `🛒 Order:\n`;
  cart.forEach(i => {
    message += `- ${i.name} x${i.quantity} = ${(i.price * i.quantity).toLocaleString()} frs\n`;
  });
  message += `\n💰 Total: ${getCartTotal().toLocaleString()} frs`;
  if (notes) message += `\n\n📝 Notes: ${notes}`;

  // Open WhatsApp
  const waUrl = `https://wa.me/237650414214?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');

  // Clear cart
  cart = [];
  saveCart(); renderCart(); updateCartCount();

  document.getElementById('modalInner').innerHTML = `
    <div class="success-modal">
      <div class="success-icon">🎉</div>
      <h3>Order Sent!</h3>
      <p>Your order was sent to WhatsApp! She'll confirm delivery shortly.</p>
      <button class="btn-primary" onclick="closeModal()" style="width:100%;margin-top:1.5rem">
        Continue Shopping 🍪
      </button>
    </div>
  `;
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
