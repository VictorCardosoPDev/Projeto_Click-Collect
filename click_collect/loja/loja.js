// NO SEU ARQUIVO: loja.js

// CORREÇÃO DE CAMINHO: Sobe para a pasta 'login'
if (localStorage.getItem("tipoUsuario") !== "cliente") {
    window.location.href = "../login/login.html"; 
}


const CART_KEY = 'cc_cart_v1';

// ==========================
// PRODUTOS POR LOJA (Mantido)
// ==========================
const produtosPorLoja = {
  1: [
    { id: 1, name: "Fone Bluetooth", price: 19.90, img: "../assets/imagens/produto1.jpeg" },
    { id: 2, name: "Smartphone XYZ", price: 29.90, img: "../assets/imagens/produto2.jpeg" },
    { id: 3, name: "Camiseta Básica", price: 39.90, img: "../assets/imagens/produto3.jpeg" }
  ],

  2: [
    { id: 1, name: "Fone Bluetooth (Loja 2)", price: 18.90, img: "../assets/imagens/produto1.jpeg" },
    { id: 2, name: "Smartphone XYZ (Loja 2)", price: 27.90, img: "../assets/imagens/produto2.jpeg" },
    { id: 3, name: "Camiseta Básica (Loja 2)", price: 35.90, img: "../assets/imagens/produto3.jpeg" }
  ],

  3: [
    { id: 1, name: "Fone Bluetooth (Loja 3)", price: 21.90, img: "../assets/imagens/produto1.jpeg" },
    { id: 2, name: "Smartphone XYZ (Loja 3)", price: 31.90, img: "../assets/imagens/produto2.jpeg" },
    { id: 3, name: "Camiseta Básica (Loja 3)", price: 42.90, img: "../assets/imagens/produto3.jpeg" }
  ]
};

// Elementos da página
const productsContainer = document.getElementById('products');
const cartCountEl = document.getElementById('cart-count');

// ==========================
// Carrinho - localStorage
// ==========================
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

// ==========================
// Renderização dos produtos
// ==========================
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

// Visualizar produto (placeholder)
function viewProduct(id) {
  alert('Visualizar produto ' + id);
}

// ==========================
// Adicionar ao carrinho
// ==========================
function addToCart(id) {
  const loja = localStorage.getItem("lojaSelecionada") || "1";
  const products = produtosPorLoja[loja];

  const cart = getCart();
  const p = products.find(x => x.id === id);
  if (!p) return;

  const existing = cart.find(i => i.id === p.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    // Adiciona a loja ao item do carrinho
    cart.push({ ...p, qty: 1, loja: loja }); 
  }

  saveCart(cart);
  updateCartCount();
}

// ==========================
// Carregar produtos por loja
// ==========================
function carregarProdutosPorLoja(loja) {
  const lista = produtosPorLoja[loja] || produtosPorLoja[1];
  renderProducts(lista);
}

// ==========================
// Lógica de seleção de loja (transferida do HTML)
// ==========================
function definirLoja() {
    const loja = document.getElementById("lojaSelecionada").value;
    localStorage.setItem("lojaSelecionada", loja);
    atualizarCatalogoPelaLoja();
}

function atualizarCatalogoPelaLoja() {
    const loja = localStorage.getItem("lojaSelecionada") || "1";
    carregarProdutosPorLoja(loja);
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    const lojaSalva = localStorage.getItem("lojaSelecionada");

    if (lojaSalva) {
        // Assegura que o SELECT reflete a loja salva
        const selectEl = document.getElementById("lojaSelecionada");
        if (selectEl) selectEl.value = lojaSalva;
    }
    
    // Carrega a loja inicial
    atualizarCatalogoPelaLoja();
    updateCartCount();
});