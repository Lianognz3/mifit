/* ===================================================================
   MiFit – Gestor de Tallas y Marcas (PWA)
   =================================================================== */

// ───────────── Data Layer ─────────────

const DEFAULT_CATEGORIES = [
  { id: 'playera', name: 'Playera', icon: '👕', cssClass: 'playera' },
  { id: 'tenis', name: 'Tenis', icon: '👟', cssClass: 'tenis' },
  { id: 'pantalon', name: 'Pantalón', icon: '👖', cssClass: 'pantalon' },
  { id: 'camisa', name: 'Camisa', icon: '👔', cssClass: 'camisa' },
  { id: 'sudadera', name: 'Sudadera', icon: '🧥', cssClass: 'sudadera' },
];

const DEFAULT_ITEMS = [
  // Playeras
  { id: crypto.randomUUID(), categoryId: 'playera', brand: 'Karhim', size: 'M', model: '', color: '', condition: '', notes: '', toBuy: false, purchased: false },
  // Tenis
  { id: crypto.randomUUID(), categoryId: 'tenis', brand: 'Gaona', size: '7.5', model: '', color: '', condition: '', notes: '', toBuy: false, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'tenis', brand: 'Gaona', size: '7.5', model: 'Theo 613', color: 'Negro', condition: '', notes: '', toBuy: true, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'tenis', brand: 'Gaona', size: '7.5', model: 'Theo 613', color: 'Avellana', condition: '', notes: '', toBuy: true, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'tenis', brand: 'Gaona', size: '7.5', model: 'Exon 308', color: '', condition: '', notes: '', toBuy: true, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'tenis', brand: 'Gaona', size: '7.5', model: 'Oaxaca 307', color: '', condition: '', notes: '', toBuy: true, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'tenis', brand: 'Gaona', size: '7.5', model: 'Ivan 306', color: '', condition: '', notes: '', toBuy: true, purchased: false },
  // Pantalones 73kg >
  { id: crypto.randomUUID(), categoryId: 'pantalon', brand: 'Oggi Jeans', size: '30', model: 'Super Base Vaxter', color: '', condition: '73kg >', notes: '', toBuy: false, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'pantalon', brand: 'Oggi Jeans', size: '30', model: 'Vintage Base Iron', color: '', condition: '73kg >', notes: '', toBuy: false, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'pantalon', brand: 'Oggi Jeans', size: '30', model: 'Blue Base Vaxter', color: '', condition: '73kg >', notes: '', toBuy: false, purchased: false },
  // Pantalones 72kg <
  { id: crypto.randomUUID(), categoryId: 'pantalon', brand: 'Oggi Jeans', size: '30', model: 'Vintage Base Vaxter', color: '', condition: '72kg <', notes: '', toBuy: false, purchased: false },
  { id: crypto.randomUUID(), categoryId: 'pantalon', brand: 'Oggi Jeans', size: '30', model: 'Super Base Iron', color: '', condition: '72kg <', notes: '', toBuy: false, purchased: false },
];

class Store {
  constructor() {
    this.categories = this.load('mifit_categories') || [...DEFAULT_CATEGORIES];
    this.items = this.load('mifit_items') || [...DEFAULT_ITEMS];
  }

  load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  save() {
    localStorage.setItem('mifit_categories', JSON.stringify(this.categories));
    localStorage.setItem('mifit_items', JSON.stringify(this.items));
  }

  // Categories
  addCategory(name, icon) {
    const id = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
    if (this.categories.find(c => c.id === id)) return null;
    const cat = { id, name, icon: icon || '🏷️', cssClass: 'default' };
    this.categories.push(cat);
    this.save();
    return cat;
  }

  removeCategory(id) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.items = this.items.filter(i => i.categoryId !== id);
    this.save();
  }

  // Items
  addItem(data) {
    const item = { id: crypto.randomUUID(), purchased: false, ...data };
    this.items.push(item);
    this.save();
    return item;
  }

  updateItem(id, data) {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.items[idx] = { ...this.items[idx], ...data };
    this.save();
    return this.items[idx];
  }

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  togglePurchased(id) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.purchased = !item.purchased;
      this.save();
    }
    return item;
  }

  getItemsByCategory(catId) {
    return this.items.filter(i => i.categoryId === catId);
  }

  getShoppingList() {
    return this.items.filter(i => i.toBuy);
  }

  search(query) {
    const q = query.toLowerCase();
    return this.items.filter(i =>
      i.brand.toLowerCase().includes(q) ||
      i.model.toLowerCase().includes(q) ||
      i.size.toLowerCase().includes(q) ||
      i.color.toLowerCase().includes(q) ||
      i.condition.toLowerCase().includes(q) ||
      i.notes.toLowerCase().includes(q)
    );
  }

  exportData() {
    return JSON.stringify({ categories: this.categories, items: this.items }, null, 2);
  }

  importData(json) {
    try {
      const data = JSON.parse(json);
      if (data.categories && data.items) {
        this.categories = data.categories;
        this.items = data.items;
        this.save();
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  getStats() {
    const totalItems = this.items.length;
    const totalBrands = new Set(this.items.map(i => i.brand)).size;
    const toBuy = this.items.filter(i => i.toBuy && !i.purchased).length;
    const purchased = this.items.filter(i => i.toBuy && i.purchased).length;
    const categories = this.categories.length;
    return { totalItems, totalBrands, toBuy, purchased, categories };
  }
}

// ───────────── App Controller ─────────────

class App {
  constructor() {
    this.store = new Store();
    this.currentView = 'closet';
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.confirmCallback = null;
    this.deferredInstallPrompt = null;

    this.cacheDOM();
    this.bindEvents();
    this.render();
    this.registerSW();
    this.setupInstallPrompt();
  }

  cacheDOM() {
    this.contentArea = document.getElementById('content-area');
    this.tabNav = document.getElementById('tab-nav');
    this.searchInput = document.getElementById('search-input');
    this.toastContainer = document.getElementById('toast-container');

    // Modals
    this.modalItem = document.getElementById('modal-item');
    this.modalCategory = document.getElementById('modal-category');
    this.confirmDialog = document.getElementById('confirm-dialog');

    // Forms
    this.formItem = document.getElementById('form-item');
    this.formCategory = document.getElementById('form-category');

    // Nav buttons
    this.navButtons = document.querySelectorAll('.nav-item');
    this.btnAdd = document.getElementById('btn-add-item');

    // Install
    this.installBanner = document.getElementById('install-banner');
  }

  bindEvents() {
    // Navigation
    this.navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
      });
    });

    // Add button
    this.btnAdd.addEventListener('click', () => this.openItemModal());

    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this.renderContent();
    });

    // Item form
    this.formItem.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveItem();
    });
    document.getElementById('btn-cancel-item').addEventListener('click', () => this.closeModal(this.modalItem));

    // Category form
    this.formCategory.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCategory();
    });
    document.getElementById('btn-close-category').addEventListener('click', () => this.closeModal(this.modalCategory));

    // Confirm dialog
    document.getElementById('btn-confirm-cancel').addEventListener('click', () => this.closeConfirm());
    document.getElementById('btn-confirm-ok').addEventListener('click', () => {
      if (this.confirmCallback) this.confirmCallback();
      this.closeConfirm();
    });

    // Export / Import
    document.getElementById('btn-export').addEventListener('click', () => this.exportData());
    document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
    document.getElementById('file-import').addEventListener('change', (e) => this.importData(e));

    // Install
    document.getElementById('btn-install-app').addEventListener('click', () => this.installApp());
    document.getElementById('btn-dismiss-install').addEventListener('click', () => {
      this.installBanner.classList.remove('show');
    });

    // Close modals on overlay click
    [this.modalItem, this.modalCategory].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });
    this.confirmDialog.addEventListener('click', (e) => {
      if (e.target === this.confirmDialog) this.closeConfirm();
    });
  }

  // ───── Views ─────

  switchView(view) {
    this.currentView = view;
    this.navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    this.render();
  }

  render() {
    this.renderTabs();
    this.renderContent();
  }

  renderTabs() {
    if (this.currentView !== 'closet') {
      this.tabNav.style.display = 'none';
      return;
    }
    this.tabNav.style.display = 'flex';
    const cats = this.store.categories;
    let html = `<button class="tab-btn ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">Todos<span class="tab-count">${this.store.items.length}</span></button>`;
    cats.forEach(cat => {
      const count = this.store.getItemsByCategory(cat.id).length;
      html += `<button class="tab-btn ${this.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">${cat.icon} ${cat.name}<span class="tab-count">${count}</span></button>`;
    });
    html += `<button class="tab-btn" data-cat="__manage__">＋ Categorías</button>`;
    this.tabNav.innerHTML = html;

    this.tabNav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        if (cat === '__manage__') {
          this.openCategoryModal();
        } else {
          this.activeCategory = cat;
          this.render();
        }
      });
    });
  }

  renderContent() {
    switch (this.currentView) {
      case 'closet': this.renderCloset(); break;
      case 'shopping': this.renderShopping(); break;
      case 'stats': this.renderStats(); break;
      case 'settings': this.renderSettings(); break;
    }
  }

  // ───── Closet View ─────

  renderCloset() {
    let items = this.activeCategory === 'all'
      ? this.store.items
      : this.store.getItemsByCategory(this.activeCategory);

    if (this.searchQuery) {
      const searchResults = this.store.search(this.searchQuery);
      items = items.filter(i => searchResults.includes(i));
    }

    if (items.length === 0) {
      this.contentArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${this.searchQuery ? '🔍' : '👔'}</div>
          <h3>${this.searchQuery ? 'Sin resultados' : 'Tu closet está vacío'}</h3>
          <p>${this.searchQuery ? 'Intenta con otro término de búsqueda' : 'Toca el botón + para agregar tu primera prenda'}</p>
        </div>`;
      return;
    }

    // Group items by category
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.categoryId]) grouped[item.categoryId] = [];
      grouped[item.categoryId].push(item);
    });

    let html = '';
    Object.keys(grouped).forEach(catId => {
      const cat = this.store.categories.find(c => c.id === catId) || { name: catId, icon: '🏷️', cssClass: 'default' };
      const catItems = grouped[catId];

      // Group by condition within category
      const conditionGroups = {};
      catItems.forEach(item => {
        const key = item.condition || '__none__';
        if (!conditionGroups[key]) conditionGroups[key] = [];
        conditionGroups[key].push(item);
      });

      html += `
        <section class="category-section">
          <div class="category-header">
            <div class="category-title">
              <div class="category-icon ${cat.cssClass}">${cat.icon}</div>
              <div>
                <div class="category-name">${cat.name}</div>
                <div class="category-count">${catItems.length} prenda${catItems.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <div class="category-actions">
              <button class="btn-sm" data-add-cat="${catId}">+ Agregar</button>
            </div>
          </div>`;

      Object.keys(conditionGroups).forEach(condKey => {
        if (condKey !== '__none__') {
          html += `<div class="weight-condition"><span class="weight-icon">⚖️</span> ${condKey}</div>`;
        }
        html += `<div class="items-grid">`;
        conditionGroups[condKey].forEach(item => {
          html += this.renderItemCard(item);
        });
        html += `</div>`;
      });

      html += `</section>`;
    });

    this.contentArea.innerHTML = html;
    this.bindCardEvents();
  }

  renderItemCard(item) {
    let tags = '';
    if (item.size) tags += `<span class="item-tag size">Talla ${item.size}</span>`;
    if (item.model) tags += `<span class="item-tag model">${item.model}</span>`;
    if (item.color) tags += `<span class="item-tag color-tag">${item.color}</span>`;
    if (item.toBuy) tags += `<span class="item-tag buy">🛒 Comprar</span>`;

    return `
      <div class="item-card" data-id="${item.id}">
        ${item.toBuy ? '<div class="shopping-badge">🛒</div>' : ''}
        <div class="item-card-main">
          <div class="item-info">
            <div class="item-brand">${item.brand}</div>
            <div class="item-details">${tags}</div>
            ${item.notes ? `<div class="item-details" style="margin-top:4px;font-size:0.72rem;color:var(--text-muted)">📝 ${item.notes}</div>` : ''}
          </div>
          <div class="item-card-actions">
            <button class="btn-card-action edit" data-edit="${item.id}" title="Editar">✏️</button>
            <button class="btn-card-action delete" data-delete="${item.id}" title="Eliminar">🗑️</button>
          </div>
        </div>
      </div>`;
  }

  bindCardEvents() {
    this.contentArea.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openItemModal(btn.dataset.edit);
      });
    });

    this.contentArea.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showConfirm('¿Eliminar prenda?', 'Esta prenda se eliminará permanentemente.', () => {
          this.store.removeItem(btn.dataset.delete);
          this.render();
          this.toast('Prenda eliminada', 'success');
        });
      });
    });

    this.contentArea.querySelectorAll('[data-add-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openItemModal(null, btn.dataset.addCat);
      });
    });
  }

  // ───── Shopping View ─────

  renderShopping() {
    const shoppingItems = this.store.getShoppingList();

    if (shoppingItems.length === 0) {
      this.contentArea.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h3>Lista de compras vacía</h3>
          <p>Marca prendas como "Comprar" para verlas aquí</p>
        </div>`;
      return;
    }

    const pending = shoppingItems.filter(i => !i.purchased);
    const done = shoppingItems.filter(i => i.purchased);

    let html = '';

    if (pending.length > 0) {
      html += `<div class="shopping-section">
        <div class="shopping-section-title">🔴 Pendientes <span class="tab-count" style="margin-left:auto">${pending.length}</span></div>`;
      pending.forEach(item => { html += this.renderShoppingItem(item); });
      html += `</div>`;
    }

    if (done.length > 0) {
      html += `<div class="shopping-section">
        <div class="shopping-section-title">✅ Comprados <span class="tab-count" style="margin-left:auto">${done.length}</span></div>`;
      done.forEach(item => { html += this.renderShoppingItem(item); });
      html += `</div>`;
    }

    this.contentArea.innerHTML = html;
    this.bindShoppingEvents();
  }

  renderShoppingItem(item) {
    const cat = this.store.categories.find(c => c.id === item.categoryId);
    const catName = cat ? cat.name : '';
    const details = [item.model, item.color, item.size ? `Talla ${item.size}` : ''].filter(Boolean).join(' · ');

    return `
      <div class="shopping-item ${item.purchased ? 'purchased' : ''}">
        <div class="shopping-checkbox ${item.purchased ? 'checked' : ''}" data-toggle-buy="${item.id}">✓</div>
        <div class="shopping-item-info">
          <div class="shopping-item-name">${item.brand} ${details ? `– ${details}` : ''}</div>
          <div class="shopping-item-brand">${catName}</div>
        </div>
        <button class="shopping-delete" data-remove-buy="${item.id}" title="Quitar de compras">✕</button>
      </div>`;
  }

  bindShoppingEvents() {
    this.contentArea.querySelectorAll('[data-toggle-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.togglePurchased(btn.dataset.toggleBuy);
        this.renderShopping();
      });
    });

    this.contentArea.querySelectorAll('[data-remove-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.store.updateItem(btn.dataset.removeBuy, { toBuy: false, purchased: false });
        this.renderShopping();
        this.toast('Quitado de compras', 'info');
      });
    });
  }

  // ───── Stats View ─────

  renderStats() {
    const stats = this.store.getStats();

    // Brand breakdown
    const brandMap = {};
    this.store.items.forEach(item => {
      brandMap[item.brand] = (brandMap[item.brand] || 0) + 1;
    });
    const sortedBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]);
    const maxBrandCount = sortedBrands.length > 0 ? sortedBrands[0][1] : 1;

    let brandsHtml = '';
    sortedBrands.forEach(([brand, count]) => {
      const pct = (count / maxBrandCount) * 100;
      brandsHtml += `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px">
            <span style="font-weight:500">${brand}</span>
            <span style="color:var(--text-muted)">${count}</span>
          </div>
          <div style="height:6px;border-radius:3px;background:var(--bg-input);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:var(--gradient-primary);border-radius:3px;transition:width 0.6s ease"></div>
          </div>
        </div>`;
    });

    this.contentArea.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${stats.totalItems}</div>
          <div class="stat-label">Prendas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.totalBrands}</div>
          <div class="stat-label">Marcas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.toBuy}</div>
          <div class="stat-label">Por comprar</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.categories}</div>
          <div class="stat-label">Categorías</div>
        </div>
      </div>
      <div class="category-section">
        <div class="category-header">
          <div class="category-title">
            <div class="category-icon default">📊</div>
            <div>
              <div class="category-name">Marcas más usadas</div>
              <div class="category-count">Distribución de tus prendas</div>
            </div>
          </div>
        </div>
        <div style="background:var(--bg-card);border-radius:var(--radius-lg);padding:18px 16px;border:1px solid rgba(255,255,255,0.05)">
          ${brandsHtml || '<p style="color:var(--text-muted);font-size:0.82rem;text-align:center">Sin datos aún</p>'}
        </div>
      </div>`;
  }

  // ───── Settings View ─────

  renderSettings() {
    this.contentArea.innerHTML = `
      <div class="category-section">
        <div class="category-header">
          <div class="category-title">
            <div class="category-icon default">⚙️</div>
            <div>
              <div class="category-name">Ajustes</div>
              <div class="category-count">Gestiona tu app</div>
            </div>
          </div>
        </div>
        <div class="items-grid">
          <div class="item-card" id="settings-manage-cats" style="cursor:pointer">
            <div class="item-card-main">
              <div class="item-info">
                <div class="item-brand">📂 Gestionar Categorías</div>
                <div class="item-details">Agrega, edita o elimina categorías de ropa</div>
              </div>
            </div>
          </div>
          <div class="item-card" id="settings-export" style="cursor:pointer">
            <div class="item-card-main">
              <div class="item-info">
                <div class="item-brand">📤 Exportar Datos</div>
                <div class="item-details">Descarga un respaldo de tus prendas en JSON</div>
              </div>
            </div>
          </div>
          <div class="item-card" id="settings-import" style="cursor:pointer">
            <div class="item-card-main">
              <div class="item-info">
                <div class="item-brand">📥 Importar Datos</div>
                <div class="item-details">Restaura un respaldo desde un archivo JSON</div>
              </div>
            </div>
          </div>
          <div class="item-card" id="settings-clear" style="cursor:pointer">
            <div class="item-card-main">
              <div class="item-info">
                <div class="item-brand">🗑️ Borrar Todo</div>
                <div class="item-details" style="color:var(--accent-red)">Elimina todos los datos de la app</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="text-align:center;padding:30px 0;color:var(--text-muted);font-size:0.72rem">
        <p>MiFit v1.0</p>
        <p style="margin-top:4px">Hecho con 💜</p>
      </div>`;

    document.getElementById('settings-manage-cats').addEventListener('click', () => this.openCategoryModal());
    document.getElementById('settings-export').addEventListener('click', () => this.exportData());
    document.getElementById('settings-import').addEventListener('click', () => document.getElementById('file-import').click());
    document.getElementById('settings-clear').addEventListener('click', () => {
      this.showConfirm('¿Borrar todos los datos?', 'Se eliminarán todas las prendas, categorías y configuración. Esta acción no se puede deshacer.', () => {
        localStorage.clear();
        this.store = new Store();
        this.render();
        this.toast('Datos eliminados', 'success');
      });
    });
  }

  // ───── Modals ─────

  openItemModal(editId = null, presetCatId = null) {
    const title = document.getElementById('modal-item-title');
    const btnSubmit = document.getElementById('btn-submit-item');
    const catSelect = document.getElementById('item-category');

    // Populate categories
    catSelect.innerHTML = this.store.categories.map(c =>
      `<option value="${c.id}">${c.icon} ${c.name}</option>`
    ).join('');

    if (editId) {
      const item = this.store.items.find(i => i.id === editId);
      if (!item) return;
      title.textContent = 'Editar Prenda';
      btnSubmit.textContent = 'Actualizar';
      document.getElementById('item-edit-id').value = item.id;
      catSelect.value = item.categoryId;
      document.getElementById('item-brand').value = item.brand;
      document.getElementById('item-size').value = item.size;
      document.getElementById('item-model').value = item.model;
      document.getElementById('item-color').value = item.color;
      document.getElementById('item-condition').value = item.condition;
      document.getElementById('item-notes').value = item.notes;
      document.getElementById('item-tobuy').checked = item.toBuy;
    } else {
      title.textContent = 'Agregar Prenda';
      btnSubmit.textContent = 'Guardar Prenda';
      this.formItem.reset();
      document.getElementById('item-edit-id').value = '';
      if (presetCatId) catSelect.value = presetCatId;
    }

    this.openModal(this.modalItem);
  }

  saveItem() {
    const editId = document.getElementById('item-edit-id').value;
    const data = {
      categoryId: document.getElementById('item-category').value,
      brand: document.getElementById('item-brand').value.trim(),
      size: document.getElementById('item-size').value.trim(),
      model: document.getElementById('item-model').value.trim(),
      color: document.getElementById('item-color').value.trim(),
      condition: document.getElementById('item-condition').value.trim(),
      notes: document.getElementById('item-notes').value.trim(),
      toBuy: document.getElementById('item-tobuy').checked,
    };

    if (!data.brand) {
      this.toast('Ingresa una marca', 'error');
      return;
    }

    if (editId) {
      this.store.updateItem(editId, data);
      this.toast('Prenda actualizada', 'success');
    } else {
      this.store.addItem(data);
      this.toast('Prenda agregada', 'success');
    }

    this.closeModal(this.modalItem);
    this.render();
  }

  openCategoryModal() {
    this.renderCategoryChips();
    this.openModal(this.modalCategory);
  }

  renderCategoryChips() {
    const container = document.getElementById('category-chips');
    container.innerHTML = this.store.categories.map(cat =>
      `<span class="category-chip" data-cat-delete="${cat.id}">${cat.icon} ${cat.name} <span class="chip-delete">✕</span></span>`
    ).join('');

    container.querySelectorAll('[data-cat-delete]').forEach(chip => {
      chip.querySelector('.chip-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = chip.dataset.catDelete;
        const itemCount = this.store.getItemsByCategory(catId).length;
        this.showConfirm(
          `¿Eliminar "${chip.textContent.trim()}"?`,
          itemCount > 0
            ? `Se eliminarán también ${itemCount} prenda(s) de esta categoría.`
            : 'La categoría se eliminará permanentemente.',
          () => {
            this.store.removeCategory(catId);
            this.renderCategoryChips();
            this.render();
            this.toast('Categoría eliminada', 'success');
          }
        );
      });
    });
  }

  saveCategory() {
    const name = document.getElementById('cat-name').value.trim();
    const icon = document.getElementById('cat-icon').value.trim();
    if (!name) {
      this.toast('Ingresa un nombre', 'error');
      return;
    }
    const cat = this.store.addCategory(name, icon);
    if (!cat) {
      this.toast('Esa categoría ya existe', 'error');
      return;
    }
    document.getElementById('cat-name').value = '';
    document.getElementById('cat-icon').value = '';
    this.renderCategoryChips();
    this.render();
    this.toast(`Categoría "${name}" creada`, 'success');
  }

  openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ───── Confirm Dialog ─────

  showConfirm(title, message, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    this.confirmCallback = callback;
    this.confirmDialog.classList.add('active');
  }

  closeConfirm() {
    this.confirmDialog.classList.remove('active');
    this.confirmCallback = null;
  }

  // ───── Toast ─────

  toast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ───── Export / Import ─────

  exportData() {
    const data = this.store.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mifit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Datos exportados', 'success');
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const success = this.store.importData(e.target.result);
      if (success) {
        this.render();
        this.toast('Datos importados correctamente', 'success');
      } else {
        this.toast('Archivo inválido', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  // ───── PWA ─────

  async registerSW() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('sw.js');
      } catch (err) {
        console.warn('SW registration failed:', err);
      }
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      this.installBanner.classList.add('show');
    });
  }

  async installApp() {
    if (!this.deferredInstallPrompt) return;
    this.deferredInstallPrompt.prompt();
    const result = await this.deferredInstallPrompt.userChoice;
    if (result.outcome === 'accepted') {
      this.toast('¡App instalada!', 'success');
    }
    this.deferredInstallPrompt = null;
    this.installBanner.classList.remove('show');
  }
}

// ───────────── Bootstrap ─────────────
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
