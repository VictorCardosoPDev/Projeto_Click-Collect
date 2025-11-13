// Usa a mesma chave do carrinho.js
const CART_KEY = 'cc_cart_v1';

// Lista de produtos (podes trocar pelas tuas imagens e preços)
const products = [
  { id: 1, name: "Fone Bluetooth", price: 19.90, img: "../assets/imagens/produto1.jpeg" },
  { id: 2, name: "Smartphone XYZ", price: 29.90, img: "../assets/imagens/produto2.jpeg" },
  { id: 3, name: "Camiseta Básica", price: 39.90, img: "../assets/imagens/produto3.jpeg" }
];

const productsContainer = document.getElementById('products');
const cartCountEl = document.getElementById('cart-count');

// Funções para manipular o carrinho no localStorage
function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
  if (cartCountEl) cartCountEl.textContent = count;
}

// Renderiza os produtos na tela
function renderProducts(list) {
  productsContainer.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}" onerror="this.src='../assets/imagens/placeholder.png'"/>
      <div class="title">${p.name}</div>
      <div class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
      <div class="actions">
        <button class="info-btn" onclick="viewProduct(${p.id})">Ver</button>
        <button class="add-btn" onclick="addToCart(${p.id})">Adicionar</button>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function viewProduct(id) {
  alert('Visualizar produto ' + id);
}

// Adiciona produto ao carrinho
function addToCart(id) {
  const cart = getCart();
  const p = products.find(x => x.id === id);
  if (!p) return;

  // Se o produto já existir, aumenta a quantidade
  const existing = cart.find(i => i.id === p.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...p, qty: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

// Inicializa a página
renderProducts(products);
updateCartCount();
