const CART_KEY = 'cc_cart_v1';
const ORDERS_KEY = 'cc_orders_v1';

function getCart() {
  try {
    const r = localStorage.getItem(CART_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getOrders() {
  try {
    const r = localStorage.getItem(ORDERS_KEY);
    return r ? JSON.parse(r) : [];
  } catch {
    return [];
  }
}

function saveOrders(list) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  const el = document.querySelector('#cartCountHeader, #cart-count, .cart-count');
  if (el) el.innerText = count;
}

function formatCurrency(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderCartPage() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  const cart = getCart();
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = `<div style="text-align:center; color:gray">Seu carrinho está vazio.</div>`;
    document.getElementById('cartTotal').innerText = formatCurrency(0);
    return;
  }

  cart.forEach(item => {
    const node = document.createElement('div');
    node.className = 'cart-item';
    node.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        <small>${formatCurrency(item.price)}</small>
      </div>
      <div>
        <button class="dec" data-id="${item.id}">-</button>
        <span>${item.qty}</span>
        <button class="inc" data-id="${item.id}">+</button>
        <button class="remove" data-id="${item.id}">Remover</button>
      </div>
    `;
    container.appendChild(node);
  });

  container.querySelectorAll('.inc').forEach(b => b.onclick = e => {
    const id = e.target.dataset.id;
    const cart = getCart();
    const item = cart.find(i => i.id == id);
    if (item) item.qty++;
    saveCart(cart);
    renderCartPage();
    updateCartCount();
  });

  container.querySelectorAll('.dec').forEach(b => b.onclick = e => {
    const id = e.target.dataset.id;
    let cart = getCart();
    const item = cart.find(i => i.id == id);
    if (item) {
      item.qty--;
      if (item.qty <= 0) cart = cart.filter(i => i.id != id);
    }
    saveCart(cart);
    renderCartPage();
    updateCartCount();
  });

  container.querySelectorAll('.remove').forEach(b => b.onclick = e => {
    const id = e.target.dataset.id;
    const newCart = getCart().filter(i => i.id != id);
    saveCart(newCart);
    renderCartPage();
    updateCartCount();
  });

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  document.getElementById('cartTotal').innerText = formatCurrency(total);

  const scheduleBtn = document.getElementById('schedulePickupBtn');
  if (scheduleBtn) {
    scheduleBtn.onclick = () => {
      if (cart.length === 0) {
        alert('Carrinho vazio!');
        return;
      }

      const orders = getOrders();
      const orderId = '#CC' + Math.floor(Math.random() * 900000 + 100000);
      const newOrder = {
        id: orderId,
        items: cart,
        loja:'Loja 1',
        total,
        createdAt: new Date().toLocaleString(),
        status: 'Pendente'
      };
      orders.unshift(newOrder);
      saveOrders(orders);

      saveCart([]); // limpa o carrinho
      updateCartCount();
      renderCartPage();

      alert(`Pedido ${orderId} agendado com sucesso!`);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  updateCartCount();
});
