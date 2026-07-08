// dashboard.js — Logic chính cho KM21.00 Dashboard

const fmt = (n) => n == null ? '--' : Number(n).toLocaleString('vi-VN');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';
const getMay = (tt) => tt ? tt.substring(1, 4) : '--';

// ── Navigation ──────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(`page-${page}`)?.classList.add('active');
    document.getElementById('page-title').textContent = link.textContent.trim();
    loadPage(page);
  });
});

function loadPage(page) {
  if (page === 'khuon')     loadDanhMuc();
  if (page === 'khuon-hong') loadKhuonHong();
  if (page === 'thanh-ly')  loadThanhLy();
  if (page === 'hieu-qua')  loadHieuQua();
}

// ── Khởi tạo ────────────────────────────────────────────────
let chartKgThang = null, chartMay = null, chartHqThang = null, chartTopKhuon = null;
let chartDataCache = null;

const API_REF = API;

async function init() {
  // Gắn sự kiện cho nút Tab
  document.querySelectorAll('.nav-links li').forEach(li => {
    li.addEventListener('click', () => switchTab(li.dataset.tab));
  });

  // Gắn sự kiện Đăng xuất
  document.getElementById('btn-logout').addEventListener('click', () => {
    API_REF.logout();
    document.getElementById('login-overlay').style.display = 'flex';
    document.getElementById('current-user-email').textContent = 'Chưa đăng nhập';
  });

  // Gắn sự kiện Đăng nhập
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errDiv = document.getElementById('login-error');
    const btn = document.getElementById('btn-login-submit');
    
    btn.textContent = 'Đang xử lý...';
    btn.style.opacity = '0.7';
    errDiv.style.display = 'none';

    const ok = await API_REF.login(email, password);
    
    btn.textContent = 'Đăng Nhập';
    btn.style.opacity = '1';

    if (ok) {
      document.getElementById('login-overlay').style.display = 'none';
      document.getElementById('current-user-email').textContent = API_REF.currentUser;
      loadDashboard();
    } else {
      errDiv.style.display = 'block';
    }
  });

  // Kiểm tra nếu đã có token thì vào luôn
  if (API_REF.token) {
    // Thử fetch để kiểm tra token có sống không (gọi tạm hàm login)
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('current-user-email').textContent = API_REF.currentUser;
    loadDashboard();
  } else {
    document.getElementById('login-overlay').style.display = 'flex';
  }
}

// ── Dashboard chính ─────────────────────────────────────────
async function loadDashboard() {
  try {
    const [tongKhuon, nhatky, khuonHong, thanhLy] = await Promise.all([
      API.query('v_thong_ke_khuon', { limit: 1 }),
      null, null, null
    ]);

    // Fallback to direct PostgreSQL query stats (via Directus meta)
    loadKpiDirect();
  } catch(e) {
    loadDemoData();
  }
}

async function loadKpiDirect() {
  try {
    const [tong, hong, tl] = await Promise.all([
      API.count('tong_khuon'),
      API.count('khuon_hong'),
      API.count('lich_su_thanh_ly')
    ]);

    const dangChay = tong - hong - tl;
    document.getElementById('kpi-tong-khuon').textContent = fmt(tong);
    document.getElementById('kpi-dang-chay').textContent  = fmt(Math.max(0, dangChay));
    document.getElementById('kpi-khuon-hong').textContent = fmt(hong);
    document.getElementById('kpi-thanh-ly').textContent   = fmt(tl);
    
    // Tạm để tĩnh vì truy vấn SUM cần backend tính toán hoặc Directus aggregation
    document.getElementById('kpi-tong-kg').textContent    = '185 T';
    document.getElementById('kpi-tong-lc').textContent    = '184K';
  } catch (err) {
    console.error("Lỗi khi load KPI:", err);
  }

  try {
    const chartsRes = await fetch(`http://${window.location.hostname}:3001/api/charts`);
    chartDataCache = await chartsRes.json();
  } catch (err) {
    console.error("Lỗi khi load biểu đồ:", err);
  }
  
  renderRecentTable();
  renderChartKgThang();
  renderChartMay();
}

function loadDemoData() {
  document.getElementById('kpi-tong-khuon').textContent = '12,051';
  document.getElementById('kpi-dang-chay').textContent  = '8,432';
  document.getElementById('kpi-khuon-hong').textContent = '2,356';
  document.getElementById('kpi-thanh-ly').textContent   = '1,134';
  document.getElementById('kpi-tong-kg').textContent    = '185 T';
  document.getElementById('kpi-tong-lc').textContent    = '184K';
  document.getElementById('status-dot').style.background = '#f97316';
  document.getElementById('update-time').textContent = 'Demo mode — chờ server';
  renderRecentTable();
  renderChartKgThang();
  renderChartMay();
}

// ── Chart: KG Theo Tháng ────────────────────────────────────
function renderChartKgThang() {
  let labels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  let data = [12400,13200,11800,14100,13900,15200,14800,16100,15600,17200,16800,18400];
  if (chartDataCache && chartDataCache.kgThang) {
    labels = chartDataCache.kgThang.map(d => 'T' + parseInt(d.month));
    data = chartDataCache.kgThang.map(d => parseInt(d.total_kg) || 0);
  }

  const ctx = document.getElementById('chart-kg-thang').getContext('2d');
  if (chartKgThang) chartKgThang.destroy();
  chartKgThang = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'KG Sản Phẩm',
        data,
        backgroundColor: 'rgba(99,102,241,0.6)',
        borderColor: '#6366f1',
        borderWidth: 1.5,
        borderRadius: 4,
      }, {
        label: 'Xu hướng',
        data: data.map((v, i) => v * (1 + i * 0.01)),
        type: 'line',
        borderColor: '#22c55e',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8', font: {size: 11} } } },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#1e2235' } },
        y: { ticks: { color: '#64748b', callback: v => fmt(v) + ' kg' }, grid: { color: '#1e2235' } }
      }
    }
  });
}

// ── Chart: Theo Máy ─────────────────────────────────────────
function renderChartMay() {
  let labels = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10'];
  let data = [18,15,14,12,11,10,9,7,6,8];
  if (chartDataCache && chartDataCache.may) {
    labels = chartDataCache.may.map(d => d.may || 'Khác');
    data = chartDataCache.may.map(d => parseInt(d.count));
  }

  const ctx = document.getElementById('chart-may').getContext('2d');
  if (chartMay) chartMay.destroy();
  chartMay = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#6366f1','#818cf8','#22c55e','#4ade80','#f97316',
          '#fb923c','#a855f7','#c084fc','#ef4444','#f87171'
        ],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right', labels: { color: '#94a3b8', font: {size: 11}, boxWidth: 12 } }
      }
    }
  });
}

// ── Bảng Recent ─────────────────────────────────────────────
function renderRecentTable() {
  const tbody = document.getElementById('tbody-recent');
  const demo = [
    ['07/07/2026','30X-001.A','AM1','M1','85%','1,250'],
    ['07/07/2026','150H-002.B','BM2','M2','92%','980'],
    ['07/07/2026','200R-003.A','AM3','M3','78%','2,100'],
    ['06/07/2026','30X-005.C','CM1','M1','88%','1,450'],
    ['06/07/2026','150H-010.A','AM4','M4','95%','870'],
  ];
  tbody.innerHTML = demo.map(r => `
    <tr>
      <td>${r[0]}</td>
      <td><b>${r[1]}</b></td>
      <td><span class="badge badge-gray">${r[2]}</span></td>
      <td><span class="badge badge-orange">${r[3]}</span></td>
      <td><span class="badge badge-green">${r[4]}</span></td>
      <td>${r[5]} kg</td>
    </tr>`).join('');
}

let currentKhuonPage = 1;
const KHUON_PAGE_SIZE = 100;

async function loadDanhMuc(page = 1) {
  const tbody = document.getElementById('tbody-khuon');
  tbody.innerHTML = '<tr><td colspan="9" class="loading">⏳ Đang tải dữ liệu từ server...</td></tr>';
  
  try {
    const offset = (page - 1) * KHUON_PAGE_SIZE;
    const res = await API.query('v_thong_ke_khuon', { 
      limit: KHUON_PAGE_SIZE, 
      offset: offset, 
      sort: '-lan_chay',
      search: window.currentKhuonSearch || ''
    });
    if (!res || !res.list || res.list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="loading">Chưa có dữ liệu</td></tr>';
      return;
    }
    
    currentKhuonPage = page;
    window.currentKhuonList = res.list;
    renderKhuonTable(res.list);
    
    // Cập nhật giao diện phân trang
    const totalRows = res.pageInfo?.totalRows || 0;
    const totalPages = Math.ceil(totalRows / KHUON_PAGE_SIZE);
    
    const startRange = offset + 1;
    const endRange = Math.min(offset + KHUON_PAGE_SIZE, totalRows);
    document.getElementById('page-info-khuon').textContent = `Đang hiển thị ${startRange}-${endRange} / ${fmt(totalRows)}`;
    
    // Tạo dãy số trang (giống Google)
    const pageNumbersContainer = document.getElementById('page-numbers-khuon');
    pageNumbersContainer.innerHTML = '';
    
    // Tính toán cửa sổ hiển thị trang (hiển thị 5 trang quanh trang hiện tại)
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    
    if (page <= 2) endPage = Math.min(totalPages, 5);
    if (page >= totalPages - 1) startPage = Math.max(1, totalPages - 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.style.padding = '5px 12px';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.border = '1px solid var(--border)';
      
      if (i === page) {
        btn.style.background = 'var(--accent)';
        btn.style.color = '#fff';
        btn.style.fontWeight = 'bold';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.background = 'var(--bg-lighter)';
        btn.style.color = '#fff';
        btn.onclick = () => loadDanhMuc(i);
      }
      pageNumbersContainer.appendChild(btn);
    }
    
    const btnPrev = document.getElementById('btn-prev-khuon');
    const btnNext = document.getElementById('btn-next-khuon');
    
    if (page <= 1) {
      btnPrev.style.opacity = '0.5';
      btnPrev.style.pointerEvents = 'none';
    } else {
      btnPrev.style.opacity = '1';
      btnPrev.style.pointerEvents = 'auto';
      btnPrev.onclick = () => loadDanhMuc(page - 1);
    }
    
    if (page >= totalPages) {
      btnNext.style.opacity = '0.5';
      btnNext.style.pointerEvents = 'none';
    } else {
      btnNext.style.opacity = '1';
      btnNext.style.pointerEvents = 'auto';
      btnNext.onclick = () => loadDanhMuc(page + 1);
    }

    // Bắt sự kiện tìm kiếm (Server-side)
    const searchInput = document.getElementById('search-khuon');
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = "true";
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          window.currentKhuonSearch = e.target.value.trim();
          loadDanhMuc(1);
        }, 400); // Đợi 400ms sau khi ngừng gõ
      });
    }

  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="9" class="loading" style="color: #ef4444">❌ Lỗi tải dữ liệu. Vui lòng kiểm tra máy chủ.</td></tr>';
  }
}

function renderKhuonTable(list) {
  const tbody = document.getElementById('tbody-khuon');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="loading">Không tìm thấy kết quả</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(r => `
    <tr>
      <td><b>${r.ten_khuon || ''}</b></td>
      <td>${r.dot || ''}</td>
      <td><span class="badge badge-gray">${r.loai || ''}</span></td>
      <td>${r.vi_tri || ''}</td>
      <td>${fmtDate(r.ngay_nhap)}</td>
      <td><span class="badge badge-orange">${fmt(r.lan_chay)}</span></td>
      <td><b>${fmt(r.hq_kg)} kg</b></td>
      <td>${r.tinh_trang || ''}</td>
      <td>${r.hong === 'Y' ? '<span class="badge badge-red">Hỏng</span>' : (r.tly === 'Y' ? '<span class="badge badge-gray">Thanh lý</span>' : '<span class="badge badge-green">Hoạt động</span>')}</td>
    </tr>
  `).join('');
}

// ── Helper Phân Trang Chung ───────────────────────────────────
function renderPaginationUI(prefix, page, totalRows, pageSize, loadFn) {
  const totalPages = Math.ceil(totalRows / pageSize);
  const offset = (page - 1) * pageSize;
  const startRange = totalRows === 0 ? 0 : offset + 1;
  const endRange = Math.min(offset + pageSize, totalRows);
  
  const infoEl = document.getElementById(`page-info-${prefix}`);
  if (infoEl) infoEl.textContent = `Đang hiển thị ${startRange}-${endRange} / ${fmt(totalRows)}`;
  
  const container = document.getElementById(`page-numbers-${prefix}`);
  if (container) {
    container.innerHTML = '';
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    
    if (page <= 2) endPage = Math.min(totalPages, 5);
    if (page >= totalPages - 1) startPage = Math.max(1, totalPages - 4);
    
    for (let i = startPage; i <= endPage; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.style.padding = '5px 12px';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';
      btn.style.border = '1px solid var(--border)';
      
      if (i === page) {
        btn.style.background = 'var(--accent)';
        btn.style.color = '#fff';
        btn.style.fontWeight = 'bold';
        btn.style.pointerEvents = 'none';
      } else {
        btn.style.background = 'var(--bg-lighter)';
        btn.style.color = '#fff';
        btn.onclick = () => loadFn(i);
      }
      container.appendChild(btn);
    }
  }
  
  const btnPrev = document.getElementById(`btn-prev-${prefix}`);
  const btnNext = document.getElementById(`btn-next-${prefix}`);
  
  if (btnPrev) {
    if (page <= 1) {
      btnPrev.style.opacity = '0.5';
      btnPrev.style.pointerEvents = 'none';
    } else {
      btnPrev.style.opacity = '1';
      btnPrev.style.pointerEvents = 'auto';
      btnPrev.onclick = () => loadFn(page - 1);
    }
  }
  if (btnNext) {
    if (page >= totalPages || totalPages === 0) {
      btnNext.style.opacity = '0.5';
      btnNext.style.pointerEvents = 'none';
    } else {
      btnNext.style.opacity = '1';
      btnNext.style.pointerEvents = 'auto';
      btnNext.onclick = () => loadFn(page + 1);
    }
  }
}

// ── Khuôn Hỏng ──────────────────────────────────────────────
async function loadKhuonHong(page = 1) {
  const pageSize = 100;
  const tbody = document.getElementById('tbody-khuon-hong');
  tbody.innerHTML = '<tr><td colspan="5" class="loading">⏳ Đang tải...</td></tr>';
  
  try {
    const offset = (page - 1) * pageSize;
    const res = await API.query('khuon_hong', { limit: pageSize, offset: offset, sort: '-ngay' });
    if (!res || !res.list || res.list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading">Chưa có dữ liệu</td></tr>';
      renderPaginationUI('khuon-hong', 1, 0, pageSize, loadKhuonHong);
      return;
    }
    
    tbody.innerHTML = res.list.map(r => `
      <tr>
        <td>${fmtDate(r.ngay)}</td>
        <td><b>${r.ten_khuon || ''}</b></td>
        <td>${r.dot || ''}</td>
        <td>${r.ghi_chu || ''}</td>
        <td>${r.tly === 'Y' ? '<span class="badge badge-gray">Thanh lý</span>' : (r.hong === 'X' ? '<span class="badge badge-red">Hỏng</span>' : '')}</td>
      </tr>
    `).join('');
    
    const totalRows = res.pageInfo?.totalRows || 0;
    renderPaginationUI('khuon-hong', page, totalRows, pageSize, loadKhuonHong);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" class="loading" style="color: #ef4444">❌ Lỗi tải dữ liệu. Vui lòng kiểm tra máy chủ Directus.</td></tr>';
  }
}

// ── Thanh Lý ────────────────────────────────────────────────
async function loadThanhLy(page = 1) {
  const pageSize = 100;
  const tbody = document.getElementById('tbody-thanh-ly');
  tbody.innerHTML = '<tr><td colspan="6" class="loading">⏳ Đang tải...</td></tr>';
  
  try {
    const offset = (page - 1) * pageSize;
    const res = await API.query('lich_su_thanh_ly', { limit: pageSize, offset: offset, sort: '-ngay' });
    if (!res || !res.list || res.list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading">Chưa có dữ liệu</td></tr>';
      renderPaginationUI('thanh-ly', 1, 0, pageSize, loadThanhLy);
      return;
    }
    
    tbody.innerHTML = res.list.map(r => `
      <tr>
        <td>${fmtDate(r.ngay)}</td>
        <td><b>${r.ten_khuon || ''}</b></td>
        <td>${r.dot || ''}</td>
        <td>${r.ng_sua || ''}</td>
        <td>${r.ghi_chu || ''}</td>
        <td><span class="badge badge-gray">Đã thanh lý</span></td>
      </tr>
    `).join('');
    
    const totalRows = res.pageInfo?.totalRows || 0;
    renderPaginationUI('thanh-ly', page, totalRows, pageSize, loadThanhLy);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6" class="loading" style="color: #ef4444">❌ Lỗi tải dữ liệu. Vui lòng kiểm tra máy chủ Directus.</td></tr>';
  }
}

// ── Nhật Ký ─────────────────────────────────────────────────
function loadNhatky() {
  document.getElementById('tbody-nhatky').innerHTML =
    '<tr><td colspan="7" class="loading">⏳ Đang tải dữ liệu...</td></tr>';
}

// ── Hiệu Quả ────────────────────────────────────────────────
function loadHieuQua() {
  const ctx1 = document.getElementById('chart-hq-thang')?.getContext('2d');
  const ctx2  = document.getElementById('chart-top-khuon')?.getContext('2d');
  
  let hqLabels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  let hqData = [82,85,80,88,86,90,87,91,89,93,91,94];
  if (chartDataCache && chartDataCache.hqThang) {
    hqLabels = chartDataCache.hqThang.map(d => 'T' + parseInt(d.month));
    hqData = chartDataCache.hqThang.map(d => Math.round(parseFloat(d.avg_hq) * 100) / 100);
  }

  let topLabels = ['30X-001','150H-002','200R-003','30X-005','150H-010','200R-007','30X-012','150H-015','30X-020','200R-001'];
  let topData = [95,93,92,91,90,89,88,87,86,85];
  if (chartDataCache && chartDataCache.topKhuon) {
    topLabels = chartDataCache.topKhuon.map(d => d.ten_khuon);
    topData = chartDataCache.topKhuon.map(d => Math.round(parseFloat(d.hieu_qua) * 100) / 100);
  }

  if (ctx1) {
    if (chartHqThang) chartHqThang.destroy();
    chartHqThang = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: hqLabels,
        datasets: [{
          label: 'Hiệu Quả TB (%)',
          data: hqData,
          borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)',
          fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: '#1e2235' } },
          y: { ticks: { color: '#64748b', callback: v => v + '%' }, grid: { color: '#1e2235' } }
        }
      }
    });
  }
  if (ctx2) {
    if (chartTopKhuon) chartTopKhuon.destroy();
    chartTopKhuon = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: topLabels,
        datasets: [{ label: 'Tổng số lần chạy / Hiệu quả', data: topData,
          backgroundColor: 'rgba(34,197,94,0.5)', borderColor: '#22c55e', borderWidth: 1.5, borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y', responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
          x: { ticks: { color: '#64748b', callback: v => v + '%' }, grid: { color: '#1e2235' } },
          y: { ticks: { color: '#64748b', font: {size: 11} }, grid: { color: '#1e2235' } }
        }
      }
    });
  }
}

// ── Start ────────────────────────────────────────────────────
init();
