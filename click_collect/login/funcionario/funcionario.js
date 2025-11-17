// NO SEU ARQUIVO: funcionario.js

// =========================
// SEGURANÇA E CHAVES
// =========================
if (localStorage.getItem("tipoUsuario") !== "funcionario") {
    // CORREÇÃO DE CAMINHO: Da pasta /funcionario para /login
    window.location.href = "../login.html";
}


const ORDERS_KEY = 'cc_orders_v1';
const CART_KEY = 'cc_cart_v1';
const STORE_KEY = 'lojaSelecionada';


// =========================
// FUNÇÕES DE UTILIDADE
// =========================
function getSelectedStore() {
    return localStorage.getItem(STORE_KEY) || "1";
}

function formatCurrency(v) {
    return v.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        const count = cart.reduce((s, i) => s + i.qty, 0);
        const el = document.getElementById('cartCountHeader');
        if (el) el.innerText = count;
    } catch {}
}


// =========================
// 1. GERENCIAMENTO DE PEDIDOS
// =========================

function getOrders() {
    try {
        const raw = localStorage.getItem(ORDERS_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    // Se não tiver nada, cria uma lista vazia
    return []; 
}

function saveOrders(list) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

function renderEmployeePage() {
    const listEl = document.getElementById("ordersList");
    if (!listEl) return;

    const store = getSelectedStore();
    // Filtra por loja
    let orders = getOrders().filter(o => o.store === store); 

    listEl.innerHTML = "";

    if (orders.length === 0) {
        listEl.innerHTML = '<p class="empty-list">Nenhum pedido pendente para esta loja.</p>';
        return;
    }

    orders.forEach(order => {
        // ... (O código de renderização do pedido é o mesmo) ...
        const item = document.createElement("div");
        const statusClass =
            order.status === "Pendente" ? "status-pendente" :
            order.status === "Pronto" ? "status-pronto" :
            "status-finalizado";

        item.className = "order";
        item.innerHTML = `
            <div class="order-header">
                <div>
                    <div style="font-weight:700">${order.id}
                        <span class="status-pill ${statusClass}">
                            ${order.status}
                        </span>
                    </div>
                    <div class="order-meta">${order.customer} • ${order.email}</div>
                </div>

                <div style="text-align:right;">
                    <div class="order-meta">
                        Retirada ${order.pickup?.date || ""} ${order.pickup?.time || ""}
                    </div>
                </div>
            </div>

            <div style="margin-top:10px; font-size:14px;">
                <div style="font-weight:700; margin-bottom:6px;">Itens:</div>
                ${
                    order.items.map(it => `
                        <div style="display:flex; justify-content:space-between; padding:4px 0;">
                            <div>${it.qty}x ${it.name}</div>
                            <div style="color:var(--muted)">
                                ${formatCurrency(it.price * it.qty)}
                            </div>
                        </div>
                    `).join("")
                }
            </div>

            <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                <div class="order-meta">Criado: ${new Date(order.createdAt).toLocaleString()}</div>
                <div style="display:flex; gap:8px;">
                    ${
                        order.status === "Pendente"
                            ? `<button class="btn-primary mark-ready" data-id="${order.id}">Marcar Pronto</button>`
                            : ""
                    }
                    ${
                        order.status === "Pronto"
                            ? `<button class="btn-primary confirm-pick" data-id="${order.id}">Confirmar Retirada</button>`
                            : ""
                    }
                    ${
                        order.status === "Finalizado"
                            ? `<div class="order-meta">Pedido Retirado</div>`
                            : ""
                    }
                </div>
            </div>
        `;
        listEl.appendChild(item);
    });


    // Event listeners para ações dos pedidos
    document.querySelectorAll(".mark-ready").forEach(btn =>
        btn.onclick = () => mudarStatus(btn.dataset.id, "Pronto")
    );

    document.querySelectorAll(".confirm-pick").forEach(btn =>
        btn.onclick = () => mudarStatus(btn.dataset.id, "Finalizado")
    );
}


function mudarStatus(id, novoStatus) {
    let orders = getOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index !== -1) {
        orders[index].status = novoStatus;
        saveOrders(orders);
        renderEmployeePage();
    }
}


// =========================
// 2. GERENCIAMENTO DE ACESSOS PENDENTES (NOVO)
// =========================

function getPendentes() {
    try {
        const raw = localStorage.getItem("cc_acessos_pendentes");
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function savePendentes(list) {
    localStorage.setItem("cc_acessos_pendentes", JSON.stringify(list));
}

function aprovarCliente(email, senhaPadrao) {
    // 1. Pega a lista de pendentes e remove o cliente
    let pendentes = getPendentes();
    const clienteParaAprovar = pendentes.find(c => c.email === email);
    
    if (!clienteParaAprovar) {
        alert("Erro: Cliente pendente não encontrado.");
        return;
    }

    // Remove da lista de pendentes
    pendentes = pendentes.filter(c => c.email !== email);
    savePendentes(pendentes); 

    // 2. Cria o objeto cliente completo
    const novoCliente = {
        nome: clienteParaAprovar.nome,
        email: clienteParaAprovar.email,
        senha: senhaPadrao // A senha definida pelo funcionário
    };

    // 3. Pega a lista de clientes aprovados e adiciona o novo
    const clientesRaw = localStorage.getItem("clientes");
    let clientes = clientesRaw ? JSON.parse(clientesRaw) : [];
    clientes.push(novoCliente);
    localStorage.setItem("clientes", JSON.stringify(clientes));

    alert(`Cliente ${novoCliente.nome} aprovado! Senha definida: ${senhaPadrao}. O cliente pode logar.`);
    renderAcessosPendentes(); // Atualiza a tela
}

function renderAcessosPendentes() {
    const listEl = document.getElementById("pendentesList");
    if (!listEl) return;

    const pendentes = getPendentes();
    listEl.innerHTML = "";
    
    if (pendentes.length === 0) {
        listEl.innerHTML = '<p class="empty-list">Nenhuma solicitação de acesso pendente.</p>';
        return;
    }
    
    pendentes.forEach(cliente => {
        const item = document.createElement("div");
        item.className = "pending-request";
        item.style.border = "1px solid #ccc";
        item.style.padding = "10px";
        item.style.marginBottom = "10px";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.alignItems = "center";
        
        item.innerHTML = `
            <div>
                <div style="font-weight:700">${cliente.nome}</div>
                <div class="order-meta">E-mail: ${cliente.email}</div>
                <div class="order-meta">Data da Solicitação: ${cliente.data}</div>
            </div>
            <div style="text-align:right;">
                <input type="text" class="senha-input" id="senha-${cliente.email}" placeholder="Definir Senha" style="padding: 5px; margin-bottom: 5px; display: block;"/>
                <button class="btn-primary aprovar-btn" data-email="${cliente.email}" style="background-color: green; color: white; padding: 5px 10px; border: none; cursor: pointer;">Aprovar</button>
            </div>
        `;
        listEl.appendChild(item);
    });

    // Adiciona o Event Listener para o botão de aprovação
    document.querySelectorAll(".aprovar-btn").forEach(btn => {
        btn.onclick = () => {
            const email = btn.dataset.email;
            const senhaInput = document.getElementById(`senha-${email}`);
            const senha = senhaInput.value;
            
            if (senha.length < 3) {
                alert("A senha deve ter pelo menos 3 caracteres.");
                return;
            }
            // Chama a função de aprovação
            aprovarCliente(email, senha);
        };
    });
}


// =========================
// INICIALIZAÇÃO E CONTROLES DE LOJA
// =========================
function carregarLojaSelecionada() {
    // ID unificado
    const el = document.getElementById("lojaSelecionadaFuncionario");
    if (!el) return;

    const store = getSelectedStore();
    el.value = store;

    // Evento de troca de loja
    el.addEventListener("change", () => {
        localStorage.setItem(STORE_KEY, el.value);
        renderEmployeePage();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarLojaSelecionada();
    renderEmployeePage();
    updateCartCount();
    
    // CHAMADA PRINCIPAL PARA RENDERIZAR CLIENTES PENDENTES
    renderAcessosPendentes(); 
});