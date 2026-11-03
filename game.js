const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ui = {
  day: document.getElementById('dayValue'),
  time: document.getElementById('timeValue'),
  cash: document.getElementById('cashValue'),
  rep: document.getElementById('repValue'),
  energy: document.getElementById('energyValue'),
  staff: document.getElementById('staffValue'),
  queue: document.getElementById('queueValue'),
  inventory: document.getElementById('inventoryList'),
  log: document.getElementById('logList'),
};

const itemMeta = {
  coffee: { label: 'Coffee', price: 11, color: '#fda65d', restock: 8 },
  lunch: { label: 'Lunch', price: 18, color: '#60a5fa', restock: 7 },
  snacks: { label: 'Snacks', price: 9, color: '#fbbc24', restock: 10 },
  merch: { label: 'Merch', price: 25, color: '#c084fc', restock: 5 },
};

const items = Object.keys(itemMeta);

const initialState = () => ({
  day: 1,
  time: 8 * 60,
  open: true,
  cash: 1200,
  reputation: 50,
  energy: 90,
  staff: 1,
  customers: [],
  inventory: { coffee: 8, lunch: 6, snacks: 10, merch: 4 },
  dayRevenue: 0,
  dayCustomers: 0,
  log: [
    'Opening day. Your store is ready for the morning rush.',
    'Click a customer to serve them with the needed item.'
  ],
  shopLevel: 1,
  adLevel: 0,
  spawnCooldown: 1.8,
  lastCustomerId: 1,
});

let state = initialState();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const money = (amount) => `$${Math.round(amount).toLocaleString()}`;
const timeLabel = (minutes) => {
  const safe = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hrs = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 7);
  renderLog();
}

function renderLog() {
  ui.log.innerHTML = state.log.map((entry) => `<li>${entry}</li>`).join('');
}

function randomItem() {
  return items[Math.floor(Math.random() * items.length)];
}

function spawnCustomer() {
  if (!state.open || state.customers.length >= 7) {
    return;
  }

  const item = randomItem();
  const baseMood = 0.8 + Math.random() * 0.9;

  state.customers.push({
    id: state.lastCustomerId++,
    item,
    patience: 18 + Math.random() * 18,
    mood: baseMood,
    x: 120,
    y: 180,
    radius: 18,
    color: `hsl(${Math.random() * 360}, 60%, ${52 + Math.random() * 18}%)`,
    queueIndex: state.customers.length,
  });

  addLog(`A customer wants ${itemMeta[item].label}.`);
}

function updateHUD() {
  ui.day.textContent = String(state.day);
  ui.time.textContent = timeLabel(state.time);
  ui.cash.textContent = money(state.cash);
  ui.rep.textContent = `${Math.round(state.reputation)}%`;
  ui.energy.textContent = `${Math.round(state.energy)}%`;
  ui.staff.textContent = String(state.staff);
  ui.queue.textContent = String(state.customers.length);

  ui.inventory.innerHTML = items
    .map((key) => {
      const count = state.inventory[key] || 0;
      return `
        <div class="inventory-item">
          <span>${itemMeta[key].label}</span>
          <strong>${count}</strong>
        </div>
      `;
    })
    .join('');
}

function closeShop() {
  state.open = false;
  state.customers = [];
  addLog('The shop is closed for the day. Time to reset and plan for tomorrow.');
}

function advanceDay() {
  state.day += 1;
  state.time = 8 * 60;
  state.open = true;
  state.energy = clamp(state.energy + 12, 0, 100);
  state.reputation = clamp(state.reputation + 4, 0, 100);
  state.dayRevenue = 0;
  state.dayCustomers = 0;
  state.spawnCooldown = 1.6;
  addLog(`Day ${state.day} begins. Fresh energy and a new crowd.`);
}

function handleServe(customer) {
  const item = customer.item;
  const stock = state.inventory[item] || 0;

  if (stock <= 0) {
    state.reputation = clamp(state.reputation - 8, 0, 100);
    addLog(`Out of ${itemMeta[item].label}. The customer leaves angry.`);
    state.customers = state.customers.filter((entry) => entry.id !== customer.id);
    return;
  }

  const sale = itemMeta[item].price * (1 + (state.shopLevel - 1) * 0.18 + state.adLevel * 0.12);
  state.inventory[item] -= 1;
  state.cash += sale;
  state.dayRevenue += sale;
  state.dayCustomers += 1;
  state.reputation = clamp(state.reputation + 2.4, 0, 100);
  state.energy = clamp(state.energy - 1.5, 0, 100);
  state.customers = state.customers.filter((entry) => entry.id !== customer.id);

  addLog(`Sold ${itemMeta[item].label} for ${money(sale)}.`);
}

function updateState(dt) {
  state.time += dt * 7.2;
  state.energy = clamp(state.energy - dt * 0.12, 0, 100);

  if (state.time >= 24 * 60) {
    advanceDay();
  }

  if (state.open) {
    state.spawnCooldown -= dt;
    if (state.spawnCooldown <= 0 && state.customers.length < 7) {
      spawnCustomer();
      state.spawnCooldown = Math.max(0.8, 2.8 - state.staff * 0.26 - state.adLevel * 0.18 - Math.random() * 1.1);
    }
  }

  state.customers.forEach((customer, index) => {
    customer.queueIndex = index;
    customer.patience -= dt * (1 + index * 0.15);
    if (customer.patience <= 0) {
      state.reputation = clamp(state.reputation - 6, 0, 100);
      state.customers = state.customers.filter((entry) => entry.id !== customer.id);
      addLog(`${itemMeta[customer.item].label} customer left in frustration.`);
    }
  });

  if (state.time >= 21 * 60) {
    state.open = false;
    if (state.customers.length === 0) {
      addLog('The shop closes as the evening crowd tapers off.');
      state.time = 22 * 60;
      state.dayRevenue = 0;
      state.dayCustomers = 0;
    }
  }

  if (!state.open && state.time >= 23 * 60) {
    state.time = 23 * 60;
  }
}

function restock() {
  const totalCost = 125 + state.shopLevel * 18;
  if (state.cash < totalCost) {
    addLog('Not enough cash for a restock.');
    return;
  }

  state.cash -= totalCost;
  Object.keys(itemMeta).forEach((key) => {
    state.inventory[key] += itemMeta[key].restock + Math.ceil(state.shopLevel / 2);
  });
  addLog(`Restocked shelves for ${money(totalCost)}.`);
}

function hireHelper() {
  const cost = 320 + state.staff * 180;
  if (state.staff >= 4) {
    addLog('Your shop is at max staffing.');
    return;
  }
  if (state.cash < cost) {
    addLog('Not enough cash to hire more staff.');
    return;
  }

  state.cash -= cost;
  state.staff += 1;
  addLog(`You hired a helper. Service speed improved.`);
}

function runMarketing() {
  const cost = 220 + state.adLevel * 90;
  if (state.cash < cost) {
    addLog('Marketing budget is too low.');
    return;
  }

  state.cash -= cost;
  state.adLevel += 1;
  state.reputation = clamp(state.reputation + 10, 0, 100);
  addLog(`A local ad campaign boosted your reputation.`);
}

function upgradeShop() {
  const cost = 420 + state.shopLevel * 170;
  if (state.cash < cost) {
    addLog('Not enough cash to upgrade the shop.');
    return;
  }

  state.cash -= cost;
  state.shopLevel += 1;
  state.reputation = clamp(state.reputation + 6, 0, 100);
  addLog(`The shop upgrade made the space feel premium.`);
}

function toggleOpen() {
  if (state.time > 21 * 60) {
    addLog('The shop is closed for the evening.');
    return;
  }

  state.open = !state.open;
  if (state.open) {
    state.spawnCooldown = 1.2;
    addLog('The shop is open. Customers are flowing in.');
  } else {
    state.customers = [];
    addLog('The shop is temporarily closed.');
  }
}

function resetRun() {
  state = initialState();
  addLog('A fresh run has started. Build the corner business from scratch.');
  updateHUD();
}

function handleAction(action) {
  if (action === 'restock') restock();
  if (action === 'hire') hireHelper();
  if (action === 'marketing') runMarketing();
  if (action === 'upgrade') upgradeShop();
  if (action === 'open') toggleOpen();
  if (action === 'reset') resetRun();
  updateHUD();
}

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => handleAction(button.dataset.action));
});

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  for (let i = state.customers.length - 1; i >= 0; i -= 1) {
    const customer = state.customers[i];
    const dx = x - (customer.x + 20);
    const dy = y - (customer.y + 24);
    if (Math.hypot(dx, dy) < customer.radius + 12) {
      handleServe(customer);
      updateHUD();
      return;
    }
  }
});

function drawBackground() {
  ctx.fillStyle = '#18314e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#1f324c';
  ctx.fillRect(0, 0, canvas.width, 100);

  ctx.fillStyle = '#d9a66a';
  ctx.fillRect(0, 110, canvas.width, 320);

  ctx.fillStyle = '#7e5a3e';
  ctx.fillRect(35, 145, 240, 170);
  ctx.fillRect(525, 145, 260, 120);

  ctx.fillStyle = '#c88d51';
  ctx.fillRect(55, 170, 200, 125);
  ctx.fillRect(545, 170, 220, 95);

  for (let i = 0; i < 4; i += 1) {
    const x = 70 + i * 55;
    ctx.fillStyle = '#f8d8a6';
    ctx.fillRect(x, 178, 34, 54);
    ctx.fillStyle = '#bf8d60';
    ctx.fillRect(x + 12, 210, 10, 23);
  }

  for (let i = 0; i < 4; i += 1) {
    const x = 560 + i * 55;
    ctx.fillStyle = '#f8d8a6';
    ctx.fillRect(x, 178, 34, 54);
    ctx.fillStyle = '#bf8d60';
    ctx.fillRect(x + 12, 210, 10, 23);
  }

  ctx.fillStyle = '#2c3a52';
  ctx.fillRect(295, 120, 250, 220);
  ctx.fillStyle = '#1a2432';
  ctx.fillRect(315, 160, 210, 150);
  ctx.fillStyle = '#7cc4ff';
  ctx.fillRect(330, 176, 180, 40);

  ctx.fillStyle = '#d4b17d';
  ctx.fillRect(580, 170, 80, 90);

  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(90, 360, 140, 30);
  ctx.fillStyle = '#7dda9a';
  ctx.fillRect(95, 365, 130, 20);

  ctx.fillStyle = '#d8b77b';
  ctx.fillRect(78, 330, 110, 26);

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(610, 325);
  ctx.lineTo(610, 510);
  ctx.stroke();

  for (let i = 0; i < 5; i += 1) {
    const x = 100 + i * 40;
    const y = 440 - i * 3;
    ctx.fillStyle = '#1e2c3b';
    ctx.fillRect(x, y, 25, 70);
  }

  ctx.fillStyle = '#f0f7ff';
  ctx.font = '600 20px sans-serif';
  ctx.fillText(state.open ? 'OPEN' : 'CLOSED', 620, 118);
  ctx.font = '500 14px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('Counter', 602, 152);
}

function drawCustomer(customer) {
  const x = customer.x + 20;
  const y = customer.y + 24;

  ctx.fillStyle = customer.color;
  ctx.beginPath();
  ctx.arc(x, y - 18, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f9e8d3';
  ctx.fillRect(x - 12, y - 6, 24, 18);

  ctx.fillStyle = '#2d3748';
  ctx.fillRect(x - 15, y + 12, 8, 20);
  ctx.fillRect(x + 7, y + 12, 8, 20);

  ctx.fillStyle = '#f4b35f';
  ctx.fillRect(x - 8, y + 26, 7, 15);
  ctx.fillRect(x + 1, y + 26, 7, 15);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x - 16, y + 32, 18, 6);
  ctx.fillRect(x - 2, y + 32, 18, 6);

  ctx.fillStyle = '#fff';
  ctx.font = '600 12px sans-serif';
  ctx.fillText(itemMeta[customer.item].label, x - 26, y - 35);
  ctx.fillStyle = '#f8f8f8';
  ctx.fillRect(x - 28, y - 45, 56, 8);
  ctx.fillStyle = '#f58b5a';
  ctx.fillRect(x - 28, y - 45, 56 * (customer.patience / 32), 8);
}

function renderCustomers() {
  state.customers.forEach((customer, index) => {
    customer.x = 120 + index * 34;
    customer.y = 235 + (index % 2) * 24;
    drawCustomer(customer);
  });
}

function drawHudText() {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '600 18px sans-serif';
  ctx.fillText(`${itemMeta.coffee.label}: ${state.inventory.coffee}`, 40, 95);
  ctx.fillText(`${itemMeta.lunch.label}: ${state.inventory.lunch}`, 170, 95);
  ctx.fillText(`${itemMeta.snacks.label}: ${state.inventory.snacks}`, 300, 95);
  ctx.fillText(`${itemMeta.merch.label}: ${state.inventory.merch}`, 430, 95);
  ctx.fillText(`Cash ${money(state.cash)}`, 660, 95);
}

function draw() {
  drawBackground();
  renderCustomers();
  drawHudText();
}

let lastTimestamp = performance.now();
function loop(ts) {
  const dt = (ts - lastTimestamp) / 1000;
  lastTimestamp = ts;

  updateState(dt);
  updateHUD();
  draw();
  requestAnimationFrame(loop);
}

updateHUD();
renderLog();
requestAnimationFrame(loop);
