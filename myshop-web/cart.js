// ---- Cart storage (localStorage, no backend needed) ----

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image_url: product.image_url || (product.images && product.images[0]) || '',
      qty: qty
    });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
}

function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) item.qty = Math.max(1, qty);
  saveCart(cart);
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = cartCount();
}

function formatKsh(amount) {
  return 'KSh ' + Number(amount).toLocaleString();
}

function checkoutViaWhatsApp() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  let message = "Hi, I'd like to order:\n\n";
  cart.forEach(item => {
    const subtotal = item.price * item.qty;
    message += `- ${item.name} x${item.qty} - ${formatKsh(subtotal)}\n`;
  });
  message += `\nTotal: ${formatKsh(cartTotal())}`;

  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
