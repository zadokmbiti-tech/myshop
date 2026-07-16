const SITE_NAME = "MARGSTITCH CROTCHET";

const LOGO_MARK_SVG = `
<svg viewBox="0 0 120 120" width="42" height="42" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="54" fill="none" stroke="#3D2233" stroke-width="2.5" stroke-dasharray="1 7" stroke-linecap="round"/>
  <circle cx="44" cy="70" r="21" fill="#B5542B"/>
  <path d="M 26 70 Q 44 55 62 70" fill="none" stroke="#F2E8D8" stroke-width="1.6" opacity="0.85"/>
  <path d="M 24 64 Q 44 78 64 62" fill="none" stroke="#F2E8D8" stroke-width="1.6" opacity="0.85"/>
  <path d="M 28 80 Q 44 62 60 80" fill="none" stroke="#F2E8D8" stroke-width="1.6" opacity="0.85"/>
  <path d="M 54 56 L 75 27" fill="none" stroke="#3D2233" stroke-width="3" stroke-linecap="round"/>
  <path d="M 75 27 Q 82 22 79 15 Q 76 10 70 14" fill="none" stroke="#3D2233" stroke-width="3" stroke-linecap="round"/>
  <path d="M 62 78 Q 67 85 64 89 L 73 66 L 81 89 L 89 66 L 97 89"
        fill="none" stroke="#3D2233" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function renderHeader() {
  const logoHtml = `${LOGO_MARK_SVG}<span>${SITE_NAME}</span>`;

  document.body.insertAdjacentHTML('afterbegin', `
    <header>
      <a href="index.html" class="logo">${logoHtml}</a>
      <nav>
        <a href="index.html">Home</a>
        <a href="shop.html">Shop</a>
        <a href="shop.html?category=men">Men</a>
        <a href="shop.html?category=women">Women</a>
        <a href="shop.html?category=children">Children</a>
        <a href="contact.html">Contact</a>
        <a href="cart.html" class="cart-link">Cart <span id="cart-count">0</span></a>
      </nav>
    </header>
  `);
}

function renderFooter() {
  document.body.insertAdjacentHTML('beforeend', `
    <footer>&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</footer>
  `);
}

function renderWhatsAppBubble() {
  const message = encodeURIComponent("Hi, I have a question about your products.");
  document.body.insertAdjacentHTML('beforeend', `
    <a href="https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}"
       target="_blank"
       aria-label="Chat with us on WhatsApp"
       style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #25D366;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.25);
        z-index: 999;
        text-decoration: none;
       ">
      <svg viewBox="0 0 32 32" width="30" height="30" fill="white">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.6 1.9 6.5L4 29l7.7-1.9c1.8 1 3.9 1.6 6.2 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-2 0-3.9-.5-5.5-1.5l-.4-.2-4.6 1.2 1.2-4.5-.3-.4C5.4 17.9 4.8 16 4.8 14c0-6.2 5-11.2 11.2-11.2S27.2 7.8 27.2 14 22.2 24.8 16 24.8zm6.1-8.4c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.7.2s-.8 1.1-1 1.3c-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.5.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"/>
      </svg>
    </a>
  `);
}

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderFooter();
  renderWhatsAppBubble();
  updateCartBadge();
});