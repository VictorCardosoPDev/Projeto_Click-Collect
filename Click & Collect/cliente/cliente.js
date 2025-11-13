// funcionario.js
const ORDERS_KEY = 'cc_orders_v1';
const CART_KEY = 'cc_cart_v1'; // usado só para contar itens
function getOrders(){ try{ const r = localStorage.getItem(ORDERS_KEY); if(r) return JSON.parse(r); }catch(e){} 
  // inicializa exemplos se não existir
  const sample = [
    { id:'#CC123456', customer:'Maria Silva', email:'maria@email.com',loja:'Loja 1',
      items:[{name:'Smartphone XYZ', qty:1, price:1299.99},{name:'Fone Bluetooth', qty:2, price:249.99}],
      total:1299.99 + 2*249.99, status:'Pendente', createdAt:'2025-10-10T09:30:00', pickup:{date:'10/10/2025', time:'14:00'} },
    { id:'#CC123457', customer:'João Santos', email:'joao@email.com',loja:'Loja 2',
      items:[{name:'Tênis Esportivo', qty:1, price:199.99}], total:199.99, status:'Pronto', createdAt:'2025-10-10T08:15:00', pickup:{date:'10/10/2025', time:'09:00'} }
  ];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(sample));
  return sample;
}
function saveOrders(list){ localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); }
function updateCartCount(){ const cart = (localStorage.getItem(CART_KEY) ? JSON.parse(localStorage.getItem(CART_KEY)) : []); const c = cart.reduce((s,i)=>s+i.qty,0); const el = document.getElementById('cartCountHeader'); if(el) el.innerText = c; }
function formatCurrency(v){ return v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' }); }
function renderClientPage() {
  const listEl = document.getElementById('orders');
  if (!listEl) return;

  let orders = getOrders();

  orders = orders.filter(order => order.status === 'Pronto');

  listEl.innerHTML = '';

  orders.forEach(order => {
    const orderNode = document.createElement('div');
    orderNode.className = 'order';

    const statusClass =
      order.status === 'Pendente'
        ? 'status-pendente'
        : order.status === 'Pronto'
        ? 'status-pronto'
        : 'status-finalizado';

    orderNode.innerHTML = `
      <div class="order-header">
        <div>
          <div style="font-weight:700">${order.id} 
            <span class="status-pill ${statusClass}">${order.status}</span>
          </div>
          <div class="order-meta">${order.customer} • ${order.email}</div>
        </div>
        <div style="text-align:right;">
          <div class="order-meta">Retirada na ${order.loja} ${order.pickup?.date || ''} ${order.pickup?.time || ''}</div>
        </div>
      </div>

      <div style="margin-top:10px; font-size:14px;">
        <div style="font-weight:700; margin-bottom:6px;">Itens:</div>
        ${order.items
          .map(
            it =>
              `<div style="display:flex; justify-content:space-between; padding:4px 0;">
                <div>${it.qty}x ${it.name}</div>
                <div style="color:var(--muted)">${formatCurrency(it.price * (it.qty || 1))}</div>
              </div>`
          )
          .join('')}
      </div>

    `;

    listEl.appendChild(orderNode);
  });
}


  // bind
  listEl.querySelectorAll('.mark-ready').forEach(b => b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    orders = getOrders();
    const idx = orders.findIndex(o=>o.id===id);
    if(idx !== -1){ orders[idx].status = 'Pronto'; saveOrders(orders); renderEmployeePage(); }
  }));
  listEl.querySelectorAll('.confirm-pick').forEach(b => b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    orders = getOrders();
    const idx = orders.findIndex(o=>o.id===id);
    if(idx !== -1){ orders[idx].status = 'Finalizado'; saveOrders(orders); renderEmployeePage(); }
  }));

  // search
  const search = document.getElementById('searchOrder');
  if(search){
    search.oninput = (ev) => {
      const q = ev.target.value.trim().toLowerCase();
      const all = getOrders();
      const filtered = all.filter(o => o.id.toLowerCase().includes(q) || (o.customer && o.customer.toLowerCase().includes(q)));
      // render filtered
      listEl.innerHTML = '';
      filtered.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order';
        const statusClass = order.status === 'Pendente' ? 'status-pendente' : (order.status === 'Pronto' ? 'status-pronto' : 'status-finalizado');
        div.innerHTML = `
          <div class="order-header">
            <div>
              <div style="font-weight:700">${order.id} <span class="status-pill ${statusClass}">${order.status}</span></div>
              <div class="order-meta">${order.customer} • ${order.email}</div>
            </div>
            <div style="text-align:right;">
              <div class="order-meta">Retirada ${order.pickup?.date || ''} ${order.pickup?.time || ''}</div>
            </div>
          </div>
          <div style="margin-top:10px; font-size:14px;">
            <div style="font-weight:700; margin-bottom:6px;">Itens:</div>
            ${order.items.map(it => `<div style="display:flex; justify-content:space-between; padding:4px 0;"><div>${it.qty}x ${it.name}</div><div style="color:var(--muted)">${formatCurrency(it.price * (it.qty||1))}</div></div>`).join('')}
          </div>
        `;
        listEl.appendChild(div);
      });
    };
  }

