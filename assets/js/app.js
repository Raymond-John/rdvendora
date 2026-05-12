/* ============================================================
   VENDORA - Core Application JavaScript
   Database, Auth, UI Components, Utilities
   ============================================================ */

// ---- Database Schema & Management ----
const DB = {
  key: 'vendora_db',
  version: '1.0',

  init() {
    if (!localStorage.getItem(this.key)) {
      this.seed();
    } else {
      const data = this.get();
      if (!data.version || data.version !== this.version) {
        this.migrate(data);
      }
    }
  },

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || {};
    } catch {
      return {};
    }
  },

  set(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },

  // Generic CRUD
  getAll(collection) {
    const data = this.get();
    return data[collection] || [];
  },

  getById(collection, id) {
    return this.getAll(collection).find(item => item.id === id);
  },

  create(collection, item) {
    const data = this.get();
    if (!data[collection]) data[collection] = [];
    item.id = item.id || this.generateId();
    item.created_at = item.created_at || new Date().toISOString();
    data[collection].push(item);
    this.set(data);
    return item;
  },

  update(collection, id, updates) {
    const data = this.get();
    const items = data[collection] || [];
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updated_at: new Date().toISOString() };
      data[collection] = items;
      this.set(data);
      return items[index];
    }
    return null;
  },

  delete(collection, id) {
    const data = this.get();
    data[collection] = (data[collection] || []).filter(item => item.id !== id);
    this.set(data);
  },

  query(collection, filterFn) {
    return this.getAll(collection).filter(filterFn);
  },

  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  },

  // Seed initial data
  seed() {
    const now = new Date().toISOString();
    const data = {
      version: this.version,
      initialized: true,
      initializedAt: now,

      users: [
        {
          id: 'user_admin',
          name: 'Alex Morgan',
          email: 'admin@vendora.com',
          password: 'admin123',
          role: 'admin',
          avatar: null,
          initials: 'AM',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
          last_login: now,
          subscription: { plan: 'empire', status: 'active', expires_at: '2025-12-31' }
        },
        {
          id: 'user_1',
          name: 'Sarah Chen',
          email: 'sarah@luminaboutique.com',
          password: 'password123',
          role: 'vendor',
          avatar: null,
          initials: 'SC',
          status: 'active',
          store_id: 'store_1',
          created_at: '2024-02-15T00:00:00Z',
          last_login: now,
          subscription: { plan: 'growth', status: 'active', expires_at: '2025-06-15', billing_cycle: 'monthly' }
        },
        {
          id: 'user_2',
          name: 'Marcus Johnson',
          email: 'marcus@techhive.com',
          password: 'password123',
          role: 'vendor',
          avatar: null,
          initials: 'MJ',
          status: 'active',
          store_id: 'store_2',
          created_at: '2024-03-01T00:00:00Z',
          last_login: now,
          subscription: { plan: 'scale', status: 'active', expires_at: '2025-09-01', billing_cycle: 'annual' }
        }
      ],

      stores: [
        {
          id: 'store_1',
          name: 'Lumina Boutique',
          subdomain: 'lumina',
          description: 'Curated fashion and lifestyle products for the modern individual.',
          logo: null,
          theme: 'minimal',
          status: 'active',
          owner_id: 'user_1',
          settings: { currency: 'USD', language: 'en', seo_title: 'Lumina Boutique', seo_description: 'Curated fashion and lifestyle products' },
          created_at: '2024-02-15T00:00:00Z',
          analytics: { total_revenue: 45230, total_orders: 186, total_customers: 124, total_products: 24 }
        },
        {
          id: 'store_2',
          name: 'TechHive Electronics',
          subdomain: 'techhive',
          description: 'Premium electronics and gadgets for tech enthusiasts.',
          logo: null,
          theme: 'dark',
          status: 'active',
          owner_id: 'user_2',
          settings: { currency: 'USD', language: 'en', seo_title: 'TechHive Electronics', seo_description: 'Premium electronics and gadgets' },
          created_at: '2024-03-01T00:00:00Z',
          analytics: { total_revenue: 128450, total_orders: 342, total_customers: 215, total_products: 36 }
        }
      ],

      products: this.generateSeedProducts(),

      orders: this.generateSeedOrders(),

      customers: this.generateSeedCustomers(),

      carts: {},

      wishlists: {},

      notifications: [
        { id: 'notif_1', user_id: 'user_1', type: 'order', title: 'New Order', message: 'Order #ORD-1001 has been placed for $149.99', read: false, created_at: '2024-12-15T10:30:00Z' },
        { id: 'notif_2', user_id: 'user_1', type: 'product', title: 'Low Stock Alert', message: 'Minimalist Watch is running low (3 remaining)', read: false, created_at: '2024-12-15T09:15:00Z' },
        { id: 'notif_3', user_id: 'user_1', type: 'review', title: 'New Review', message: 'Your product received a 5-star review', read: true, created_at: '2024-12-14T16:45:00Z' },
        { id: 'notif_4', user_id: 'user_1', type: 'system', title: 'Subscription Renewal', message: 'Your Growth plan renews in 7 days', read: true, created_at: '2024-12-14T08:00:00Z' }
      ],

      activity_log: [
        { id: 'act_1', user_id: 'user_1', store_id: 'store_1', action: 'Product created', details: 'Added "Minimalist Watch"', created_at: '2024-12-15T10:00:00Z' },
        { id: 'act_2', user_id: 'user_1', store_id: 'store_1', action: 'Order received', details: 'Order #ORD-1001 for $149.99', created_at: '2024-12-15T10:30:00Z' },
        { id: 'act_3', user_id: 'user_1', store_id: 'store_1', action: 'Product updated', details: 'Updated stock for "Leather Tote Bag"', created_at: '2024-12-14T14:20:00Z' },
        { id: 'act_4', user_id: 'user_1', store_id: 'store_1', action: 'Customer registered', details: 'New customer: Emily Watson', created_at: '2024-12-14T11:00:00Z' },
        { id: 'act_5', user_id: 'user_1', store_id: 'store_1', action: 'Discount created', details: 'Created coupon WELCOME20', created_at: '2024-12-13T09:30:00Z' }
      ],

      coupons: [
        { id: 'coupon_1', store_id: 'store_1', code: 'WELCOME20', type: 'percentage', value: 20, min_purchase: 50, usage_limit: 100, usage_count: 34, expires_at: '2025-12-31', status: 'active' },
        { id: 'coupon_2', store_id: 'store_1', code: 'FLASH15', type: 'percentage', value: 15, min_purchase: 0, usage_limit: 50, usage_count: 12, expires_at: '2025-01-31', status: 'active' },
        { id: 'coupon_3', store_id: 'store_1', code: 'SAVE10', type: 'fixed', value: 10, min_purchase: 100, usage_limit: 200, usage_count: 89, expires_at: '2025-06-30', status: 'active' }
      ],

      campaigns: [
        { id: 'camp_1', store_id: 'store_1', name: 'Holiday Sale 2024', type: 'email', status: 'active', sent: 1240, opened: 682, clicked: 186, created_at: '2024-12-01T00:00:00Z' },
        { id: 'camp_2', store_id: 'store_1', name: 'New Year Campaign', type: 'social', status: 'scheduled', sent: 0, opened: 0, clicked: 0, created_at: '2024-12-10T00:00:00Z' }
      ],

      reviews: [
        { id: 'rev_1', product_id: 'prod_1', customer_name: 'Jane S.', rating: 5, comment: 'Beautiful watch! The quality exceeded my expectations.', created_at: '2024-12-10T00:00:00Z' },
        { id: 'rev_2', product_id: 'prod_1', customer_name: 'Mike T.', rating: 4, comment: 'Great watch, fast shipping. Would recommend.', created_at: '2024-12-08T00:00:00Z' }
      ],

      billing_history: [
        { id: 'bill_1', user_id: 'user_1', description: 'Growth Plan - Monthly', amount: 49, status: 'paid', date: '2024-12-01', invoice: 'INV-2024-001' },
        { id: 'bill_2', user_id: 'user_1', description: 'Growth Plan - Monthly', amount: 49, status: 'paid', date: '2024-11-01', invoice: 'INV-2024-002' },
        { id: 'bill_3', user_id: 'user_1', description: 'Growth Plan - Monthly', amount: 49, status: 'paid', date: '2024-10-01', invoice: 'INV-2024-003' }
      ],

      domains: [
        { id: 'dom_1', store_id: 'store_1', domain: 'lumina.vendora.com', type: 'subdomain', status: 'active', is_primary: true },
        { id: 'dom_2', store_id: 'store_1', domain: 'luminaboutique.com', type: 'custom', status: 'pending', is_primary: false }
      ]
    };

    this.set(data);
  },

  generateSeedProducts() {
    const categories = ['electronics', 'fashion', 'accessories', 'home', 'beauty'];
    const products = [
      { id: 'prod_1', store_id: 'store_1', name: 'Minimalist Watch', description: 'A sleek, minimalist timepiece designed for the modern professional. Features a genuine leather strap and Swiss quartz movement.', price: 149.99, compare_price: 199.99, category: 'accessories', tags: ['watch', 'minimal', 'leather'], stock: 23, status: 'active', sku: 'LUM-WAT-001', sales: 18, views: 342, rating: 4.5, review_count: 12, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' },
      { id: 'prod_2', store_id: 'store_1', name: 'Leather Tote Bag', description: 'Handcrafted from premium full-grain leather. Spacious interior with multiple compartments for everyday essentials.', price: 189.00, compare_price: 229.00, category: 'fashion', tags: ['bag', 'leather', 'handcrafted'], stock: 15, status: 'active', sku: 'LUM-BAG-001', sales: 24, views: 518, rating: 4.8, review_count: 8, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop' },
      { id: 'prod_3', store_id: 'store_1', name: 'Ceramic Vase Set', description: 'Set of 3 handcrafted ceramic vases in neutral tones. Perfect for modern home decor.', price: 79.99, compare_price: 99.99, category: 'home', tags: ['vase', 'ceramic', 'decor'], stock: 8, status: 'active', sku: 'LUM-HOM-001', sales: 31, views: 423, rating: 4.6, review_count: 15, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop' },
      { id: 'prod_4', store_id: 'store_1', name: 'Silk Scarf', description: 'Luxurious 100% silk scarf with an elegant abstract print. Versatile accessory for any outfit.', price: 65.00, compare_price: 85.00, category: 'fashion', tags: ['scarf', 'silk', 'accessory'], stock: 42, status: 'active', sku: 'LUM-FAS-001', sales: 12, views: 267, rating: 4.3, review_count: 6, image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa33?w=400&h=400&fit=crop' },
      { id: 'prod_5', store_id: 'store_1', name: 'Essential Oil Diffuser', description: 'Ultrasonic aromatherapy diffuser with 7 LED color options. 300ml capacity, whisper-quiet operation.', price: 45.99, compare_price: 59.99, category: 'home', tags: ['diffuser', 'aromatherapy', 'wellness'], stock: 56, status: 'active', sku: 'LUM-HOM-002', sales: 45, views: 612, rating: 4.7, review_count: 23, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop' },
      { id: 'prod_6', store_id: 'store_1', name: 'Organic Face Serum', description: 'Vitamin C brightening serum with hyaluronic acid. Cruelty-free and vegan.', price: 38.00, compare_price: 48.00, category: 'beauty', tags: ['skincare', 'serum', 'organic'], stock: 34, status: 'active', sku: 'LUM-BEA-001', sales: 29, views: 389, rating: 4.9, review_count: 31, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop' },
      { id: 'prod_7', store_id: 'store_1', name: 'Wool Beanie', description: 'Premium merino wool beanie, ethically sourced. Soft, warm, and sustainably made.', price: 35.00, compare_price: 45.00, category: 'fashion', tags: ['beanie', 'wool', 'sustainable'], stock: 67, status: 'active', sku: 'LUM-FAS-002', sales: 38, views: 445, rating: 4.4, review_count: 14, image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=400&h=400&fit=crop' },
      { id: 'prod_8', store_id: 'store_1', name: 'Bluetooth Speaker', description: 'Portable wireless speaker with 360-degree sound. 12-hour battery life, waterproof design.', price: 79.99, compare_price: 99.99, category: 'electronics', tags: ['speaker', 'bluetooth', 'audio'], stock: 0, status: 'out_of_stock', sku: 'LUM-ELE-001', sales: 52, views: 734, rating: 4.6, review_count: 19, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop' },
      { id: 'prod_9', store_id: 'store_2', name: 'Wireless Earbuds Pro', description: 'Active noise cancelling earbuds with transparency mode. 24-hour battery with charging case.', price: 199.99, compare_price: 249.99, category: 'electronics', tags: ['earbuds', 'wireless', 'audio'], stock: 45, status: 'active', sku: 'TH-ELE-001', sales: 89, views: 1245, rating: 4.7, review_count: 42, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop' },
      { id: 'prod_10', store_id: 'store_2', name: 'Smart Watch Ultra', description: 'GPS + Cellular smartwatch with health monitoring. Water resistant to 100m.', price: 399.99, compare_price: 449.99, category: 'electronics', tags: ['smartwatch', 'gps', 'fitness'], stock: 18, status: 'active', sku: 'TH-ELE-002', sales: 34, views: 892, rating: 4.8, review_count: 27, image: 'https://images.unsplash.com/photo-1546868871-af0de7ee53a6?w=400&h=400&fit=crop' },
      { id: 'prod_11', store_id: 'store_2', name: 'Mechanical Keyboard', description: 'Hot-swappable mechanical keyboard with RGB backlighting. Gateron Brown switches.', price: 129.99, compare_price: 159.99, category: 'electronics', tags: ['keyboard', 'mechanical', 'rgb'], stock: 22, status: 'active', sku: 'TH-ELE-003', sales: 41, views: 678, rating: 4.5, review_count: 18, image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=400&fit=crop' },
      { id: 'prod_12', store_id: 'store_2', name: 'USB-C Hub', description: '7-in-1 USB-C hub with 4K HDMI, USB 3.0, SD card reader, and 100W power delivery.', price: 49.99, compare_price: 69.99, category: 'electronics', tags: ['hub', 'usb-c', 'adapter'], stock: 78, status: 'active', sku: 'TH-ELE-004', sales: 67, views: 934, rating: 4.3, review_count: 22, image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=400&fit=crop' }
    ];
    return products;
  },

  generateSeedOrders() {
    const orders = [];
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const statusWeights = [0.15, 0.25, 0.30, 0.25, 0.05];
    
    for (let i = 1; i <= 15; i++) {
      const rand = Math.random();
      let status = statuses[0];
      let cumulative = 0;
      for (let j = 0; j < statuses.length; j++) {
        cumulative += statusWeights[j];
        if (rand <= cumulative) { status = statuses[j]; break; }
      }
      
      const total = (Math.random() * 200 + 50).toFixed(2);
      orders.push({
        id: `ord_${i}`,
        store_id: 'store_1',
        order_number: `ORD-${1000 + i}`,
        customer: {
          name: ['Emily Watson', 'James Cooper', 'Sophia Lee', 'Daniel Brown', 'Olivia Martinez'][Math.floor(Math.random() * 5)],
          email: 'customer@example.com'
        },
        items: [
          { product_id: 'prod_1', name: 'Minimalist Watch', qty: 1, price: 149.99 }
        ],
        subtotal: parseFloat(total) - 10,
        shipping: 5.99,
        tax: (parseFloat(total) * 0.08).toFixed(2),
        total: parseFloat(total),
        status: status,
        payment_status: status === 'cancelled' ? 'refunded' : 'paid',
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return orders;
  },

  generateSeedCustomers() {
    return [
      { id: 'cust_1', store_id: 'store_1', name: 'Emily Watson', email: 'emily@example.com', phone: '+1 555-0101', orders_count: 5, total_spent: 523.97, last_order: '2024-12-10', created_at: '2024-03-15T00:00:00Z' },
      { id: 'cust_2', store_id: 'store_1', name: 'James Cooper', email: 'james@example.com', phone: '+1 555-0102', orders_count: 3, total_spent: 289.50, last_order: '2024-12-08', created_at: '2024-04-20T00:00:00Z' },
      { id: 'cust_3', store_id: 'store_1', name: 'Sophia Lee', email: 'sophia@example.com', phone: '+1 555-0103', orders_count: 8, total_spent: 891.25, last_order: '2024-12-12', created_at: '2024-02-10T00:00:00Z' },
      { id: 'cust_4', store_id: 'store_1', name: 'Daniel Brown', email: 'daniel@example.com', phone: '+1 555-0104', orders_count: 2, total_spent: 134.99, last_order: '2024-11-28', created_at: '2024-06-05T00:00:00Z' },
      { id: 'cust_5', store_id: 'store_1', name: 'Olivia Martinez', email: 'olivia@example.com', phone: '+1 555-0105', orders_count: 4, total_spent: 445.00, last_order: '2024-12-05', created_at: '2024-05-12T00:00:00Z' }
    ];
  },

  migrate(data) {
    data.version = this.version;
    this.set(data);
  }
};

// ---- Auth Utilities ----
const Auth = {
  sessionKey: 'vendora_session',

  login(email, password, remember = false) {
    const users = DB.getAll('users');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const session = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        store_id: user.store_id || null,
        initials: user.initials,
        expiresAt: remember ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000
      };
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      DB.update('users', user.id, { last_login: new Date().toISOString() });
      return { success: true, user: session };
    }
    return { success: false, error: 'Invalid email or password' };
  },

  register(userData) {
    const users = DB.getAll('users');
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = DB.create('users', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'vendor',
      avatar: null,
      initials: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      status: 'active',
      subscription: null
    });
    return { success: true, user: newUser };
  },

  logout() {
    localStorage.removeItem(this.sessionKey);
    window.location.href = 'index.html';
  },

  getSession() {
    try {
      const session = JSON.parse(localStorage.getItem(this.sessionKey));
      if (session && session.expiresAt > Date.now()) {
        return session;
      }
      localStorage.removeItem(this.sessionKey);
      return null;
    } catch {
      return null;
    }
  },

  isLoggedIn() {
    return this.getSession() !== null;
  },

  isAdmin() {
    const session = this.getSession();
    return session && session.role === 'admin';
  },

  isVendor() {
    const session = this.getSession();
    return session && (session.role === 'vendor' || session.role === 'admin');
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.isLoggedIn() || !this.isAdmin()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};

// ---- Theme Manager ----
const Theme = {
  init() {
    const saved = localStorage.getItem('vendora_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    this.set(theme);
  },

  set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vendora_theme', theme);
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.set(next);
    return next;
  },

  get() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
};

// ---- Toast Notifications ----
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    this.init();
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-primary, #e4e7ec);
      border-left: 4px solid ${colors[type]};
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      font-size: 14px;
      color: var(--text-primary, #1a1d23);
      pointer-events: all;
      transform: translateX(120%);
      transition: transform 0.3s ease;
      cursor: pointer;
    `;
    toast.innerHTML = `
      <span style="color: ${colors[type]}; flex-shrink: 0;">${icons[type]}</span>
      <span style="flex: 1; min-width: 0;">${message}</span>
      <button style="background: none; border: none; color: var(--text-muted, #8b95a5); cursor: pointer; padding: 4px; flex-shrink: 0;" onclick="this.parentElement.remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    toast.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      toast.style.transform = 'translateX(120%)';
      setTimeout(() => toast.remove(), 300);
    });

    this.container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }
};

// ---- Modal System ----
const Modal = {
  open(content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.50);
      backdrop-filter: blur(4px);
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: var(--bg-secondary, #ffffff);
      border: 1px solid var(--border-primary, #e4e7ec);
      border-radius: 16px;
      box-shadow: 0 24px 48px rgba(0,0,0,0.15);
      max-width: ${options.width || '520px'};
      width: 100%;
      max-height: calc(100vh - 40px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.95) translateY(-10px);
      transition: transform 0.25s ease;
    `;

    const header = options.title ? `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0;">
        <h3 style="font-size: 18px; font-weight: 600;">${options.title}</h3>
        <button class="modal-close-btn" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; transition: all 0.15s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    ` : '';

    const footer = options.footer ? `
      <div style="padding: 16px 24px; border-top: 1px solid var(--border-primary, #e4e7ec); display: flex; justify-content: flex-end; gap: 8px;">
        ${options.footer}
      </div>
    ` : '';

    container.innerHTML = `${header}<div style="padding: 20px 24px; overflow-y: auto; flex: 1;">${content}</div>${footer}`;
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      container.style.transform = 'scale(1) translateY(0)';
    });

    const close = () => {
      overlay.style.opacity = '0';
      container.style.transform = 'scale(0.95) translateY(-10px)';
      setTimeout(() => overlay.remove(), 200);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && options.backdropClose !== false) close();
    });

    const closeBtn = container.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    });

    overlay._close = close;
    return overlay;
  },

  close(overlay) {
    if (overlay && overlay._close) overlay._close();
  }
};

// ---- Cart Manager ----
const Cart = {
  key: 'vendora_cart',

  getItems() {
    const session = Auth.getSession();
    const cartKey = session ? `cart_${session.userId}` : 'cart_guest';
    const data = DB.get();
    return (data.carts && data.carts[cartKey]) || { items: [] };
  },

  saveItems(cart) {
    const session = Auth.getSession();
    const cartKey = session ? `cart_${session.userId}` : 'cart_guest';
    const data = DB.get();
    if (!data.carts) data.carts = {};
    data.carts[cartKey] = cart;
    DB.set(data);
    this.updateBadge();
  },

  addItem(product, qty = 1) {
    const cart = this.getItems();
    const existing = cart.items.find(item => item.product_id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty
      });
    }
    this.saveItems(cart);
    Toast.show(`${product.name} added to cart`, 'success');
    this.openDrawer();
  },

  removeItem(productId) {
    const cart = this.getItems();
    cart.items = cart.items.filter(item => item.product_id !== productId);
    this.saveItems(cart);
    this.renderDrawer();
  },

  updateQty(productId, qty) {
    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }
    const cart = this.getItems();
    const item = cart.items.find(i => i.product_id === productId);
    if (item) {
      item.qty = qty;
      this.saveItems(cart);
      this.renderDrawer();
    }
  },

  getCount() {
    return this.getItems().items.reduce((sum, item) => sum + item.qty, 0);
  },

  getTotal() {
    return this.getItems().items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  clear() {
    this.saveItems({ items: [] });
    this.updateBadge();
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge-count');
    const count = this.getCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  openDrawer() {
    let drawer = document.getElementById('cart-drawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'cart-drawer';
      drawer.className = 'cart-drawer';
      document.body.appendChild(drawer);
    }
    this.renderDrawer();
    requestAnimationFrame(() => drawer.classList.add('open'));

    let backdrop = document.getElementById('cart-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'cart-backdrop';
      backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 499; opacity: 0; transition: opacity 0.3s;';
      backdrop.addEventListener('click', () => this.closeDrawer());
      document.body.appendChild(backdrop);
    }
    requestAnimationFrame(() => { backdrop.style.opacity = '1'; backdrop.style.pointerEvents = 'all'; });
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) { backdrop.style.opacity = '0'; backdrop.style.pointerEvents = 'none'; }
    document.body.style.overflow = '';
  },

  renderDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (!drawer) return;
    const cart = this.getItems();
    const items = cart.items || [];
    const total = this.getTotal();

    if (items.length === 0) {
      drawer.innerHTML = `
        <div class="cart-drawer-header">
          <h3 class="cart-drawer-title">Shopping Cart</h3>
          <button class="btn-icon" onclick="Cart.closeDrawer()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>
        <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
          <div class="empty-state" style="padding: 40px;">
            <div class="empty-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg></div>
            <h4 class="empty-title">Your cart is empty</h4>
            <p class="empty-text">Looks like you haven't added any products yet.</p>
            <a href="storefront.html" class="btn btn-primary" style="margin-top: 16px;" onclick="Cart.closeDrawer()">Start Shopping</a>
          </div>
        </div>
      `;
      return;
    }

    drawer.innerHTML = `
      <div class="cart-drawer-header">
        <h3 class="cart-drawer-title">Shopping Cart (${items.length})</h3>
        <button class="btn-icon" onclick="Cart.closeDrawer()"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
      <div class="cart-drawer-items">
        ${items.map(item => `
          <div class="cart-item">
            <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
            <div class="cart-item-details">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-actions">
                <div class="cart-item-qty">
                  <button class="qty-btn" onclick="Cart.updateQty('${item.product_id}', ${item.qty - 1})">-</button>
                  <span class="qty-value">${item.qty}</span>
                  <button class="qty-btn" onclick="Cart.updateQty('${item.product_id}', ${item.qty + 1})">+</button>
                </div>
                <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
              </div>
            </div>
            <button class="btn-icon btn-icon-sm" style="color: var(--text-muted);" onclick="Cart.removeItem('${item.product_id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `).join('')}
      </div>
      <div class="cart-drawer-footer">
        <div class="cart-subtotal">
          <span class="cart-subtotal-label">Subtotal</span>
          <span class="cart-subtotal-value">$${total.toFixed(2)}</span>
        </div>
        <p class="cart-note">Shipping and taxes calculated at checkout</p>
        <a href="checkout.html" class="btn btn-primary w-full" style="justify-content: center;" onclick="Cart.closeDrawer()">Proceed to Checkout</a>
        <button class="btn btn-ghost w-full" style="margin-top: 8px;" onclick="Cart.closeDrawer()">Continue Shopping</button>
      </div>
    `;
  }
};

// ---- Navigation Component Injection ----
const UI = {
  injectNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const session = Auth.getSession();
    const isDashboard = document.body.classList.contains('dashboard-layout');
    
    nav.innerHTML = `
      <div class="navbar-inner">
        <a href="index.html" class="navbar-brand">
          <div class="navbar-brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          Vendora
        </a>
        <nav class="navbar-nav" id="navbar-nav">
          <a href="index.html" class="nav-link ${this.isActive('index')}">Home</a>
          <a href="features.html" class="nav-link ${this.isActive('features')}">Features</a>
          <a href="pricing.html" class="nav-link ${this.isActive('pricing')}">Pricing</a>
          <a href="about.html" class="nav-link ${this.isActive('about')}">About</a>
          <a href="contact.html" class="nav-link ${this.isActive('contact')}">Contact</a>
        </nav>
        <div class="navbar-actions">
          ${session
            ? `<a href="${session.role === 'admin' ? 'admin.html' : 'dashboard.html'}" class="btn btn-primary btn-sm">Dashboard</a>`
            : `<a href="login.html" class="btn btn-ghost btn-sm">Log in</a><a href="register.html" class="btn btn-primary btn-sm">Get Started</a>`
          }
          <button class="btn-icon mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    `;

    // Mobile menu toggle
    const toggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('navbar-nav');
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        toggle.classList.toggle('active');
      });
    }

    // Scroll behavior
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled', 'glass');
      } else {
        nav.classList.remove('scrolled', 'glass');
      }
    });
  },

  injectFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="navbar-brand" style="margin-bottom: 16px;">
              <div class="navbar-brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              Vendora
            </a>
            <p class="footer-brand-desc">The complete multi-vendor eCommerce platform. Build, manage, and scale your online business with powerful tools.</p>
          </div>
          <div class="footer-column">
            <h4>Product</h4>
            <div class="footer-links">
              <a href="features.html">Features</a>
              <a href="pricing.html">Pricing</a>
              <a href="storefront.html">Store Demo</a>
              <a href="#">Changelog</a>
            </div>
          </div>
          <div class="footer-column">
            <h4>Company</h4>
            <div class="footer-links">
              <a href="about.html">About</a>
              <a href="contact.html">Contact</a>
              <a href="faq.html">FAQ</a>
              <a href="#">Careers</a>
            </div>
          </div>
          <div class="footer-column">
            <h4>Legal</h4>
            <div class="footer-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright"> 2024 Vendora. All rights reserved.</p>
          <div class="footer-social">
            <a href="#" aria-label="Twitter"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" aria-label="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          </div>
        </div>
      </div>
    `;
  },

  isActive(page) {
    const current = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    return current === page ? 'active' : '';
  },

  injectSidebar(activePage = 'dashboard') {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const session = Auth.getSession();
    const isAdmin = session && session.role === 'admin';

    const menuItems = isAdmin ? [
      { section: 'Admin', items: [
        { id: 'admin', label: 'Overview', icon: this.icons.dashboard, href: 'admin.html' },
        { id: 'admin-users', label: 'Users', icon: this.icons.users, href: 'admin-users.html' },
        { id: 'admin-stores', label: 'Stores', icon: this.icons.store, href: 'admin-stores.html' },
        { id: 'admin-subscriptions', label: 'Subscriptions', icon: this.icons.creditCard, href: 'admin-subscriptions.html' },
        { id: 'admin-analytics', label: 'Analytics', icon: this.icons.barChart, href: 'admin-analytics.html' }
      ]}
    ] : [
      { section: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: this.icons.dashboard, href: 'dashboard.html' },
        { id: 'analytics', label: 'Analytics', icon: this.icons.barChart, href: 'analytics.html' },
        { id: 'orders', label: 'Orders', icon: this.icons.shoppingBag, href: 'orders.html', badge: 3 },
        { id: 'products', label: 'Products', icon: this.icons.package, href: 'products.html' },
        { id: 'customers', label: 'Customers', icon: this.icons.users, href: 'customers.html' }
      ]},
      { section: 'Management', items: [
        { id: 'inventory', label: 'Inventory', icon: this.icons.box, href: 'inventory.html' },
        { id: 'marketing', label: 'Marketing', icon: this.icons.megaphone, href: 'marketing.html' },
        { id: 'discounts', label: 'Discounts', icon: this.icons.tag, href: 'discounts.html' }
      ]},
      { section: 'Settings', items: [
        { id: 'settings', label: 'Settings', icon: this.icons.settings, href: 'settings.html' },
        { id: 'notifications', label: 'Notifications', icon: this.icons.bell, href: 'notifications.html', badge: 2 },
        { id: 'domains', label: 'Domains', icon: this.icons.globe, href: 'domains.html' },
        { id: 'billing', label: 'Billing', icon: this.icons.creditCard, href: 'billing.html' }
      ]}
    ];

    const navHtml = menuItems.map(section => `
      <div class="sidebar-section">
        <div class="sidebar-section-title">${section.section}</div>
        ${section.items.map(item => `
          <a href="${item.href}" class="sidebar-link ${activePage === item.id ? 'active' : ''}" data-tooltip="${item.label}">
            ${item.icon}
            <span class="sidebar-link-text">${item.label}</span>
            ${item.badge ? `<span class="sidebar-link-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </div>
    `).join('');

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-brand">
          <div class="sidebar-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span class="sidebar-brand-text">Vendora</span>
        </a>
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
        </button>
      </div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebar-user-dropdown-trigger">
          <div class="avatar avatar-md" style="background: var(--primary-light); color: var(--primary);">${session ? session.initials : 'U'}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${session ? session.name : 'User'}</div>
            <div class="sidebar-user-role">${session ? session.role : 'Guest'}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted); flex-shrink: 0;"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
    `;

    // Sidebar toggle
    const toggle = document.getElementById('sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('vendora_sidebar_collapsed', sidebar.classList.contains('collapsed'));
      });
    }

    // Restore collapsed state
    if (localStorage.getItem('vendora_sidebar_collapsed') === 'true') {
      sidebar.classList.add('collapsed');
    }

    // Mobile sidebar
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.classList.toggle('active');
      });
    }
  },

  injectTopbar() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;
    const session = Auth.getSession();
    const unreadNotifs = DB.query('notifications', n => n.user_id === (session?.userId) && !n.read).length;

    topbar.innerHTML = `
      <button class="btn-icon mobile-menu-toggle" id="mobile-sidebar-toggle" style="display: none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <div class="topbar-search">
        <button class="search-trigger" id="search-trigger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search anything...</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>
      <div class="topbar-actions">
        <button class="topbar-btn" id="theme-toggle" aria-label="Toggle theme">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="theme-icon-light"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="theme-icon-dark" style="display: none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <div class="dropdown" id="notifications-dropdown">
          <button class="topbar-btn" id="notifications-trigger" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            ${unreadNotifs > 0 ? `<span class="topbar-btn-badge"></span>` : ''}
          </button>
          <div class="dropdown-menu" style="min-width: 340px; max-height: 420px; overflow-y: auto;">
            <div class="dropdown-header">
              <div class="dropdown-header-title">Notifications</div>
            </div>
            <div id="notifications-list">
              ${this.renderNotifications()}
            </div>
          </div>
        </div>
        <div class="dropdown" id="user-dropdown">
          <button class="topbar-user" id="user-dropdown-trigger">
            <div class="avatar avatar-sm" style="background: var(--primary-light); color: var(--primary);">${session ? session.initials : 'U'}</div>
            <div style="text-align: left;">
              <div class="topbar-user-name">${session ? session.name : 'User'}</div>
              <div class="topbar-user-role">${session ? session.role : 'Guest'}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="dropdown-menu">
            <div class="dropdown-header">
              <div class="dropdown-header-title">${session ? session.name : 'User'}</div>
              <div class="dropdown-header-subtitle">${session ? session.email : ''}</div>
            </div>
            <div class="dropdown-divider"></div>
            <a href="settings.html" class="dropdown-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </a>
            <a href="billing.html" class="dropdown-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Billing
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item" onclick="Auth.logout()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log out
            </button>
          </div>
        </div>
      </div>
    `;

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const newTheme = Theme.toggle();
        themeBtn.querySelector('.theme-icon-light').style.display = newTheme === 'dark' ? 'none' : 'block';
        themeBtn.querySelector('.theme-icon-dark').style.display = newTheme === 'dark' ? 'block' : 'none';
      });
      // Set initial icon
      const currentTheme = Theme.get();
      themeBtn.querySelector('.theme-icon-light').style.display = currentTheme === 'dark' ? 'none' : 'block';
      themeBtn.querySelector('.theme-icon-dark').style.display = currentTheme === 'dark' ? 'block' : 'none';
    }

    // Dropdown toggles
    this.setupDropdown('user-dropdown', 'user-dropdown-trigger');
    this.setupDropdown('notifications-dropdown', 'notifications-trigger');

    // Search
    const searchTrigger = document.getElementById('search-trigger');
    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => this.openSearch());
    }
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
    });
  },

  setupDropdown(dropdownId, triggerId) {
    const dropdown = document.getElementById(dropdownId);
    const trigger = document.getElementById(triggerId);
    if (!dropdown || !trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close other dropdowns
      document.querySelectorAll('.dropdown.open').forEach(d => {
        if (d.id !== dropdownId) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  },

  renderNotifications() {
    const session = Auth.getSession();
    if (!session) return '<div class="empty-state" style="padding: 24px;"><p class="empty-text">No notifications</p></div>';
    const notifications = DB.query('notifications', n => n.user_id === session.userId).slice(0, 5);
    if (notifications.length === 0) return '<div class="empty-state" style="padding: 24px;"><p class="empty-text">No notifications</p></div>';

    const typeIcons = {
      order: '<div class="notification-icon" style="background: var(--primary-light); color: var(--primary);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>',
      product: '<div class="notification-icon" style="background: var(--warning-light); color: var(--warning-dark);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>',
      review: '<div class="notification-icon" style="background: var(--success-light); color: var(--success-dark);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>',
      system: '<div class="notification-icon" style="background: var(--info-light); color: var(--info-dark);"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>'
    };

    return notifications.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" onclick="UI.markNotificationRead('${n.id}')">
        ${typeIcons[n.type] || typeIcons.system}
        <div class="notification-content">
          <div class="notification-title">${n.title}</div>
          <div class="notification-text">${n.message}</div>
          <div class="notification-time">${this.timeAgo(n.created_at)}</div>
        </div>
      </div>
    `).join('');
  },

  markNotificationRead(id) {
    DB.update('notifications', id, { read: true });
    const list = document.getElementById('notifications-list');
    if (list) list.innerHTML = this.renderNotifications();
  },

  openSearch() {
    let overlay = document.getElementById('search-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'search-overlay';
      overlay.className = 'search-overlay';
      overlay.innerHTML = `
        <div class="search-modal">
          <div class="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search products, orders, customers..." id="global-search-input" autocomplete="off">
            <span class="search-shortcut">ESC</span>
          </div>
          <div id="search-results" style="max-height: 400px; overflow-y: auto; padding: 8px 0;"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
      });

      const input = document.getElementById('global-search-input');
      input.addEventListener('input', (e) => this.handleSearch(e.target.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.classList.remove('active');
      });
    }

    overlay.classList.add('active');
    setTimeout(() => document.getElementById('global-search-input').focus(), 100);
  },

  handleSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!query || query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }
    const q = query.toLowerCase();
    const products = DB.query('products', p => p.name.toLowerCase().includes(q)).slice(0, 4);
    const orders = DB.query('orders', o => o.order_number.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)).slice(0, 3);
    const customers = DB.query('customers', c => c.name.toLowerCase().includes(q)).slice(0, 3);

    let html = '';
    if (products.length) {
      html += `<div style="padding: 8px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Products</div>`;
      html += products.map(p => `
        <a href="product-details.html?id=${p.id}" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--text-primary); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
          <img src="${p.image}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;" alt="">
          <div style="flex: 1; min-width: 0;"><div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</div><div style="font-size: 12px; color: var(--text-muted);">$${p.price.toFixed(2)}</div></div>
        </a>
      `).join('');
    }
    if (orders.length) {
      html += `<div style="padding: 8px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Orders</div>`;
      html += orders.map(o => `
        <a href="orders.html" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--text-primary); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
          <div style="width: 36px; height: 36px; border-radius: 8px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/></svg></div>
          <div style="flex: 1;"><div style="font-size: 14px; font-weight: 500;">${o.order_number}</div><div style="font-size: 12px; color: var(--text-muted);">${o.customer.name}</div></div>
        </a>
      `).join('');
    }
    if (customers.length) {
      html += `<div style="padding: 8px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Customers</div>`;
      html += customers.map(c => `
        <a href="customers.html" style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; color: var(--text-primary); transition: background 0.15s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;">${c.name.split(' ').map(n => n[0]).join('')}</div>
          <div style="flex: 1;"><div style="font-size: 14px; font-weight: 500;">${c.name}</div><div style="font-size: 12px; color: var(--text-muted);">${c.email}</div></div>
        </a>
      `).join('');
    }
    if (!products.length && !orders.length && !customers.length) {
      html = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 14px;">No results found</div>';
    }
    resultsContainer.innerHTML = html;
  },

  // SVG Icons
  icons: {
    dashboard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    barChart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>',
    shoppingBag: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    package: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
    megaphone: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    tag: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
    settings: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    bell: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    globe: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    creditCard: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    store: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },

  // Utilities
  timeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  },

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  truncate(str, len) {
    return str.length > len ? str.substring(0, len) + '...' : str;
  },

  debounce(fn, ms) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), ms);
    };
  },

  // Scroll reveal
  initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(el => observer.observe(el));
  },

  // Counter animation
  animateCounter(el, target, duration = 1500, prefix = '', suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * eased);
      el.textContent = prefix + current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
};

// ---- Initialize on DOM Ready ----
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  Theme.init();
  UI.injectNavbar();
  UI.injectFooter();
  UI.initScrollReveal();
  Cart.updateBadge();

  // Password toggle
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const input = toggle.previousElementSibling || toggle.parentElement.querySelector('input');
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        toggle.innerHTML = input.type === 'password'
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      }
    });
  });

  // Form validation
  document.querySelectorAll('form[data-validate]').forEach(form => {
    form.addEventListener('submit', (e) => {
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
          const errorEl = field.parentElement.querySelector('.form-error');
          if (errorEl) errorEl.textContent = 'This field is required';
        } else {
          field.classList.remove('error');
        }
      });
      if (!valid) e.preventDefault();
    });
  });
});
