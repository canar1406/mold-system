// api.js — Directus API Client
const DIRECTUS_URL = `http://${window.location.hostname}:8080`;

const API = {
  token: localStorage.getItem('directus_token') || null,
  currentUser: localStorage.getItem('directus_user') || null,

  async login(email, password) {
    try {
      const r = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!r.ok) throw new Error('Login failed');
      
      const d = await r.json();
      this.token = d.data?.access_token;
      this.currentUser = email;
      
      localStorage.setItem('directus_token', this.token);
      localStorage.setItem('directus_user', this.currentUser);
      
      document.getElementById('status-dot').style.background = '#22c55e';
      document.getElementById('update-time').textContent = 'Đã kết nối ' + new Date().toLocaleTimeString('vi-VN');
      return true;
    } catch {
      this.logout();
      return false;
    }
  },

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('directus_token');
    localStorage.removeItem('directus_user');
    document.getElementById('status-dot').style.background = '#ef4444';
    document.getElementById('update-time').textContent = 'Chưa đăng nhập';
  },

  // Lấy dữ liệu từ bảng PostgreSQL qua backend Node (port 3001)
  async query(tableName, { limit = 100, offset = 0, filter = '', sort = '', search = '' } = {}) {
    try {
      const url = new URL(`http://${window.location.hostname}:3001/api/query/${tableName}`);
      url.searchParams.set('limit', limit);
      url.searchParams.set('offset', offset);
      if (sort) url.searchParams.set('sort', sort);
      if (search) url.searchParams.set('search', search);

      const r = await fetch(url);
      const d = await r.json();

      return {
        list: d.list || [],
        pageInfo: d.pageInfo || { totalRows: 0 }
      };
    } catch (err) {
      alert('API query error for ' + tableName + ': ' + err.message);
      console.error('API query error:', err);
      return { list: [], pageInfo: { totalRows: 0 } };
    }
  },

  // Lấy tổng số dòng của một bảng
  async count(tableName) {
    try {
      const r = await fetch(`${DIRECTUS_URL}/items/${tableName}?limit=0&meta=filter_count`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const d = await r.json();
      return d.meta?.filter_count || 0;
    } catch {
      return 0;
    }
  }
};
