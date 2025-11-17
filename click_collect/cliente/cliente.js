// CORREÇÃO DE CAMINHO: Sobe para a pasta 'login'
if (localStorage.getItem("tipoUsuario") !== "cliente") {
    window.location.href = "../login/login.html";
}


const ORDERS_KEY = "cc_orders_v1";

function getOrders() {
    try {
        const r = localStorage.getItem(ORDERS_KEY);
        if (r) return JSON.parse(r);
    } catch (e) {}

    return [];
}

function formatCurrency(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function renderClientPage() {
    const listEl = document.getElementById("orders");
    if (!listEl) return;

    // Filtra apenas pedidos com status "Pronto"
    let orders = getOrders().filter(o => o.status === "Pronto");

    listEl.innerHTML = "";

    orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "order";

        div.innerHTML = `
            <div class="order-header">
                <div>
                    <div style="font-weight:700">${order.id}
                        <span class="status-pill status-pronto">Pronto</span>
                    </div>
                    <div class="order-meta">${order.customer} • ${order.email}</div>
                </div>
                <div style="text-align:right;">
                                        <div class="order-meta">Retirada na Loja ${order.store} ${order.pickup?.date || ""} ${order.pickup?.time || ""}</div>
                </div>
            </div>

            <div style="margin-top:10px; font-size:14px;">
                <div style="font-weight:700; margin-bottom:6px;">Itens:</div>
                ${order.items
                    .map(
                        it => `
                        <div style="display:flex; justify-content:space-between; padding:4px 0;">
                            <div>${it.qty}x ${it.name}</div>
                            <div style="color:#666">${formatCurrency(it.qty * it.price)}</div>
                        </div>
                    `
                    )
                    .join("")}
            </div>
        `;

        listEl.appendChild(div);
    });
}

// Chamada inicial
document.addEventListener('DOMContentLoaded', renderClientPage);

// Funções de atualização do carrinho (mesmo que não seja o foco principal aqui)
function getCart() {
    try {
        const data = localStorage.getItem('cc_cart_v1');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) cartCountEl.textContent = count;
}
document.addEventListener('DOMContentLoaded', updateCartCount);