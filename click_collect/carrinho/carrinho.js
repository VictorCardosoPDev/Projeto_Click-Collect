// NO SEU ARQUIVO: carrinho.js

// Verifica se o usuário é cliente OU funcionário para permitir o acesso.
const tipoUsuario = localStorage.getItem("tipoUsuario");

if (tipoUsuario !== "cliente" && tipoUsuario !== "funcionario") {
    // Redireciona para o login (caminho: /carrinho para /login)
    window.location.href = "../login/login.html"; 
}

const CART_KEY = 'cc_cart_v1';
const ORDERS_KEY = 'cc_orders_v1';


// =========================
// FUNÇÕES DE UTILIDADE
// =========================

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

function getOrders() {
    try {
        const raw = localStorage.getItem(ORDERS_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return [];
}

function saveOrders(list) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

function formatCurrency(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


// =========================
// RENDERIZAÇÃO
// =========================
function renderCart() {
    const cart = getCart();
    const listEl = document.getElementById('cartList');
    const totalEl = document.getElementById('cartTotal');
    
    if (!listEl || !totalEl) return;

    listEl.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        listEl.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
        totalEl.textContent = formatCurrency(0);
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.qty * item.price;
        total += itemTotal;
        
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div>
                <div class="item-name">${item.name}</div>
                <div class="item-meta">Loja ${item.loja} | ${formatCurrency(item.price)} x ${item.qty}</div>
            </div>
            <div class="item-price">${formatCurrency(itemTotal)}</div>
            <button class="remove-btn" data-id="${item.id}">Remover</button>
        `;
        listEl.appendChild(li);
    });

    totalEl.textContent = formatCurrency(total);

    // Event listeners para remover
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.onclick = () => removeFromCart(btn.dataset.id);
    });
}

function removeFromCart(id) {
    let cart = getCart();
    // Encontra o item pelo ID do produto (pode precisar de uma lógica mais complexa se produtos tiverem o mesmo ID em lojas diferentes, mas mantemos o ID simples por enquanto)
    const index = cart.findIndex(item => item.id == id); 

    if (index !== -1) {
        cart.splice(index, 1);
        saveCart(cart);
        renderCart();
    }
}


// =========================
// FINALIZAR PEDIDO
// =========================
function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert("Carrinho vazio!");
        return;
    }

    const customerEmail = localStorage.getItem("clienteLogado");
    if (!customerEmail) {
        alert("Erro: Cliente não logado.");
        return;
    }

    // Simulação de dados do cliente (deveria vir de uma base de clientes)
    const customerName = customerEmail.split('@')[0]; 
    const store = cart[0].loja; // Pega a loja do primeiro item (idealmente, só deve haver uma loja por carrinho)

    const newOrder = {
        id: "#CC" + Math.floor(Math.random() * 1000000),
        store: store,
        customer: customerName,
        email: customerEmail,
        items: cart.map(item => ({
            name: item.name,
            qty: item.qty,
            price: item.price
        })),
        total: cart.reduce((sum, item) => sum + (item.qty * item.price), 0),
        status: "Pendente",
        createdAt: new Date().toISOString(),
        pickup: { date: new Date().toLocaleDateString('pt-BR'), time: "14:00" } // Mockup de retirada
    };

    let orders = getOrders();
    orders.unshift(newOrder); // Adiciona no início da lista
    saveOrders(orders);

    // Limpa o carrinho
    saveCart([]);
    alert(`Pedido ${newOrder.id} realizado com sucesso! Aguarde a confirmação de PRONTO.`);
    window.location.href = "../cliente/cliente.html"; // Redireciona para o painel do cliente
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.onclick = checkout;
    }
});