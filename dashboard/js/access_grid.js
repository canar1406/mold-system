// Giao diện Access Data Grid (Mô phỏng MS Access)

const API_BASE = 'http://' + window.location.hostname + ':3001/api/query';

// Cấu hình các bảng
const TABLES = {
  don_hang: { title: "ĐƠN ĐẶT HÀNG", columns: [ { key: "so_don", label: "Số Đơn" }, { key: "ngay_don", label: "Ngày Đơn" }, { key: "ghi_chu_don", label: "Ghi Chú" }, { key: "trang_1", label: "Trang 1" }, { key: "trang_2", label: "Trang 2" } ] },

  dat_khuon: {
    title: "KIỂM TRA ĐẶT KHUÔN",
    columns: [
      { key: 'id', label: 'ID', type: 'number', width: '60px', readonly: true },
      { key: 'ngay_dat', label: 'Ngày đặt', type: 'date', width: '110px' },
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '150px' },
      { key: 'kgmet', label: 'Kg/mét', type: 'number', width: '80px' },
      { key: 'sosoi', label: 'Sợi', type: 'number', width: '60px' },
      { key: 'kieu', label: 'Kiểu', type: 'text', width: '70px' },
      { key: 'kich_thuoc', label: 'Kích thước', type: 'text', width: '90px' },
      { key: 'phoi_icn', label: 'Phôi', type: 'text', width: '80px' },
      { key: 'hang_khuon', label: 'Hãng khuôn', type: 'text', width: '100px' },
      { key: 'don_hang_dat', label: 'Đơn hàng', type: 'text', width: '100px' },
      { key: 'ghichu', label: 'Ghi chú', type: 'text', width: '200px' }
    ]
  },


  tonghop_phoi: {
    title: "TỔNG HỢP KHUÔN THEO PHÔI",
    columns: [
      { key: 'ten_khuon', label: 'Tên Khuôn' },
      { key: 'dot', label: 'Đợt' },
      { key: 'do_day', label: 'Đ.Đ' },
      { key: 'lc', label: 'Lc' },
      { key: 'hq', label: 'Hq' },
      { key: 'minkg', label: 'MinKg' },
      { key: 'maxkg', label: 'MaxKg' },
      { key: 'tinh_trang', label: 'Tình trạng' },
      { key: 'ngay_nhap', label: 'Nhập ngày' },
      { key: 'ngay_thu', label: 'Ngày thử' },
      { key: 'ngay_cuoi', label: 'Ngày cuối' },
      { key: 'hong', label: 'Hỏng' },
      { key: 'ghichu', label: 'Ghi chú' }
    ]
  },


  tong_khuon: {
    title: "BẢNG TỔNG KHUÔN",
    pk: 'ten_khuon', // Khóa chính thật trong DB (cột id có dòng NULL/trùng)
    columns: [
      { key: 'id', label: 'ID', type: 'number', width: '60px', readonly: true },
      { key: 'ngay', label: 'Ngày nhập', type: 'date', width: '100px' },
      { key: 'ten_khuon', label: 'Tên Khuôn', type: 'text', width: '150px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '80px' },
      { key: 'do_day', label: 'Đ.Dày', type: 'number', width: '60px' },
      { key: 'do_cung', label: 'Đc', type: 'number', width: '60px' },
      { key: 'sosoi', label: 'Sợi', type: 'number', width: '60px' },
      { key: 'kieu', label: 'Kiểu', type: 'text', width: '60px' },
      { key: 'kich_thuoc', label: 'Kth', type: 'text', width: '80px' },
      { key: 'kt_phoi', label: 'Phôi', type: 'text', width: '80px' },
      { key: 'don_hang', label: 'Đơn hàng', type: 'text', width: '100px' },
      { key: 'vi_tri', label: 'Vị trí', type: 'text', width: '120px' },
      { key: 'tra', label: 'Trả', type: 'text', width: '60px' },
      { key: 'nt', label: 'NT', type: 'text', width: '60px' },
      { key: 'nnt', label: 'N.NT', type: 'text', width: '60px' },
      { key: 'tly', label: 'T.lý', type: 'text', width: '60px' },
      { key: 'ngay_tl', label: 'Ngày Tl', type: 'date', width: '100px' },
      { key: 'ghichu', label: 'Ghi chú', type: 'text', width: '200px' }
    ],
    subdatasheet: 'nhatky_khuon',
    subKey: 'ten_khuon'
  },
  nhatky_khuon: {
    title: "BẢNG NHẬT KÝ KHUÔN",
    columns: [
      { key: 'ngay', label: 'Ngày', type: 'date', width: '100px' },
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '150px' },
      { key: 'hieuqua', label: 'Hiệu quả', type: 'number', width: '80px' },
      { key: 'so_thanh', label: 'Số thanh', type: 'number', width: '80px' },
      { key: 'kgthanh', label: 'Kg/thanh', type: 'number', width: '80px' },
      { key: 'sx_met', label: 'Mét', type: 'number', width: '80px' },
      { key: 'kgthtt', label: 'Kg/6m', type: 'number', width: '80px' },
      { key: 'tinh_trang', label: 'Tình trạng', type: 'text', width: '200px' },
      { key: 'sk', label: 'Sửa', type: 'text', width: '80px' },
      { key: 'phoi', label: 'Phôi', type: 'text', width: '80px' }
    ]
  },
  nhatky_khuon_thanh_ly: {
    title: "NHẬT KÝ KHUÔN THANH LÝ",
    columns: [
      { key: 'ngay', label: 'Ngày', type: 'date', width: '100px' },
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '150px' },
      { key: 'hieuqua', label: 'Hieuqua', type: 'number', width: '80px' },
      { key: 'so_thanh', label: 'SoThanh', type: 'number', width: '80px' },
      { key: 'kgthanh', label: 'Kgthanh', type: 'number', width: '80px' },
      { key: 'tinh_trang', label: 'TinhTrang', type: 'text', width: '200px' },
      { key: 'phoi', label: 'Phoi', type: 'text', width: '80px' },
      { key: 'sk', label: 'Sk', type: 'text', width: '80px' }
    ]
  },
  nhan_khuon: {
    title: "BẢNG NHẬN KHUÔN",
    pk: 'dot_khuon', // Bảng này không có cột id
    columns: [
      { key: 'dot_khuon', label: 'Đợt nhận', type: 'text', width: '150px' },
      { key: 'sx', label: 'Hãng', type: 'text', width: '100px' },
      { key: 'ngay_nhap', label: 'Ngày nhập', type: 'date', width: '120px' },
      { key: 'ghichu', label: 'Ghi chú', type: 'text', width: '250px' }
    ],
    subdatasheet: 'tong_khuon',
    parentKey: 'dot_khuon',
    childKey: 'dot'
  },
  khuon_hong: {
    title: "BẢNG KHUÔN HỎNG",
    columns: [
      { key: 'ngay', label: 'Ngày hỏng', type: 'date', width: '120px' },
      { key: 'ten_khuon', label: 'Ký hiệu', type: 'text', width: '150px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '100px' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text', width: '250px' },
      { key: 'hong', label: 'Hỏng', type: 'text', width: '80px' },
      { key: 'tly', label: 'Thanh lý', type: 'text', width: '80px' }
    ]
  },
  thanh_ly: {
    title: "BẢNG THANH LÝ",
    columns: [
      { key: 'ngay', label: 'Ngày T.lý', type: 'date', width: '120px' },
      { key: 'ten_khuon', label: 'Ký hiệu', type: 'text', width: '150px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '100px' },
      { key: 'ng_sua', label: 'Người sửa', type: 'text', width: '120px' },
      { key: 'tl', label: 'TL', type: 'text', width: '80px' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text', width: '250px' }
    ],
    subdatasheet: 'nhatky_khuon',
    subKey: 'ten_khuon'
  },
  lich_su_thanh_ly: {
    title: "BẢNG LƯU KHUÔN THANH LÝ",
    columns: [
      { key: 'ngay', label: 'Ngày T.lý', type: 'date', width: '120px' },
      { key: 'ten_khuon', label: 'Ký hiệu', type: 'text', width: '150px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '100px' },
      { key: 'ng_sua', label: 'Người sửa', type: 'text', width: '120px' },
      { key: 'tl', label: 'TL', type: 'text', width: '80px' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text', width: '250px' }
    ],
    subdatasheet: 'nhatky_khuon_thanh_ly',
    subKey: 'ten_khuon'
  },
  nghiem_thu: {
    title: "BẢNG SỐ LIỆU NGHIỆM THU",
    columns: [
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '120px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '80px' },
      { key: 'lc', label: 'Lc', type: 'number', width: '60px' },
      { key: 'hq', label: 'Hụi/Phôi', type: 'number', width: '80px' },
      { key: 'sth', label: 'Sth', type: 'number', width: '60px' },
      { key: 'hq_kg', label: 'Hạt Kg', type: 'number', width: '80px' },
      { key: 'min_kg', label: 'Min', type: 'number', width: '60px' },
      { key: 'max_kg', label: 'Max', type: 'number', width: '60px' },
      { key: 'tinh_trang', label: 'Tình trạng', type: 'text', width: '150px' },
      { key: 'ngay_nhap', label: 'Nhập ngày', type: 'date', width: '100px' },
      { key: 'ngay_thu', label: 'Ngày thử', type: 'date', width: '100px' },
      { key: 'ngay_cuoi', label: 'Ngày cuối', type: 'date', width: '100px' },
      { key: 'ngay_nt', label: 'NgàyNT', type: 'date', width: '100px' },
      { key: 'dat', label: 'Y-N', type: 'text', width: '60px' },
      { key: 'hong', label: 'Hỏng', type: 'text', width: '60px' },
      { key: 'tl', label: 'TL', type: 'text', width: '60px' },
      { key: 'ghichu', label: 'Ghi chú', type: 'text', width: '150px' }
    ]
  },
  tonghop_timkiem: {
    title: "TỔNG HỢP KHUÔN TÌM KIẾM",
    readonly: true, // View là read-only
    columns: [
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '120px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '80px' },
      { key: 'lc', label: 'Lc', type: 'text', width: '60px' },
      { key: 'hq', label: 'Bụi/Phôi', type: 'number', width: '80px' },
      { key: 'sth', label: 'Sth', type: 'number', width: '60px' },
      { key: 'hq_kg', label: 'Bụi Kg', type: 'number', width: '80px' },
      { key: 'min_kg', label: 'Min', type: 'number', width: '60px' },
      { key: 'max_kg', label: 'Max', type: 'number', width: '60px' },
      { key: 'tinh_trang', label: 'Tình trạng', type: 'text', width: '150px' },
      { key: 'vi_tri', label: 'Đế ở', type: 'text', width: '80px' },
      { key: 'ngay_thu', label: 'Ngày thử', type: 'date', width: '100px' },
      { key: 'ngay_cuoi', label: 'Ngày cuối', type: 'date', width: '100px' },
      { key: 'ngay_nt', label: 'NgàyNT', type: 'date', width: '100px' },
      { key: 'dat', label: 'Y-N', type: 'text', width: '60px' },
      { key: 'hong', label: 'Hỏng', type: 'text', width: '60px' },
      { key: 'bao_hong', label: 'Báo hỏng', type: 'text', width: '120px' },
      { key: 'tl', label: 'TL', type: 'text', width: '60px' },
      { key: 'kich_thuoc', label: 'Kĩ', type: 'text', width: '80px' },
      { key: 'don_hang', label: 'ĐH', type: 'text', width: '80px' }
    ]
  },
  khuon_nt_kt: {
    title: "KHUÔN KIỂM TRA ĐỂ NGHIỆM THU",
    columns: [
      { key: 'id', label: 'ID', type: 'number', width: '60px', readonly: true },
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '150px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '100px' },
      { key: 'do_day', label: 'Độ dày', type: 'text', width: '80px' },
      { key: 'do_cung', label: 'Độ cứng', type: 'text', width: '80px' },
      { key: 'ghi_chu', label: 'Ghi chú', type: 'text', width: '250px' }
    ],
    subdatasheet: 'nhatky_khuon',
    subKey: 'ten_khuon'
  },
  tonghop_nghiem_thu: {
    title: "SỐ LIỆU KHUÔN NGHIỆM THU (BẢNG TÍNH TẠM)",
    pk: 'ten_khuon',
    columns: [
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '130px', readonly: true },
      { key: 'dot', label: 'Đợt', type: 'text', width: '80px' },
      { key: 'lc', label: 'Lc', type: 'number', width: '55px' },
      { key: 'hq', label: 'Hq/Phôi', type: 'number', width: '80px' },
      { key: 'sth', label: 'S.thanh', type: 'number', width: '75px' },
      { key: 'hq_kg', label: 'Kg', type: 'number', width: '90px' },
      { key: 'min_kg', label: 'Min', type: 'number', width: '60px' },
      { key: 'max_kg', label: 'Max', type: 'number', width: '60px' },
      { key: 'tinh_trang', label: 'Tình trạng', type: 'text', width: '150px' },
      { key: 'ngay_nhap', label: 'Nhập', type: 'date', width: '95px' },
      { key: 'ngay_thu', label: 'Ngày thử', type: 'date', width: '95px' },
      { key: 'ngay_cuoi', label: 'Ngày cuối', type: 'date', width: '95px' },
      { key: 'hong', label: 'Hỏng', type: 'text', width: '55px' },
      { key: 'ngay_hong', label: 'Ngày hỏng', type: 'date', width: '95px' },
      { key: 'tl', label: 'TL', type: 'text', width: '50px' },
      { key: 'ngay_nt', label: 'NT gần nhất', type: 'date', width: '95px' },
      { key: 'dat', label: 'Đạt', type: 'text', width: '55px' },
      { key: 'vi_tri', label: 'Vị trí', type: 'text', width: '100px' },
      { key: 'ghichu', label: 'Ghi chú', type: 'text', width: '180px' }
    ],
    subdatasheet: 'nhatky_khuon',
    subKey: 'ten_khuon'
  },
  luu_nghiem_thu: {
    title: "BẢNG LƯU KHUÔN NGHIỆM THU",
    columns: [
      { key: 'ngay_nt', label: 'Ng.NT', type: 'date', width: '100px' },
      { key: 'id', label: 'ID', type: 'number', width: '60px', readonly: true },
      { key: 'ten_khuon', label: 'Tên khuôn', type: 'text', width: '120px' },
      { key: 'dot', label: 'Đợt', type: 'text', width: '80px' },
      { key: 'lc', label: 'Lc', type: 'number', width: '60px' },
      { key: 'hq', label: 'Phôi', type: 'number', width: '80px' },
      { key: 'sth', label: 'S.tha', type: 'number', width: '60px' },
      { key: 'hq_kg', label: 'Kg', type: 'number', width: '80px' },
      { key: 'min_kg', label: 'Min', type: 'number', width: '60px' },
      { key: 'max_kg', label: 'Max', type: 'number', width: '60px' },
      { key: 'dat', label: 'Đạt', type: 'text', width: '60px' },
      { key: 'ngay_nhap', label: 'Nhập', type: 'date', width: '100px' },
      { key: 'ngay_thu', label: 'Start', type: 'date', width: '100px' },
      { key: 'ngay_cuoi', label: 'Last', type: 'date', width: '100px' },
      { key: 'hong', label: 'Hỏng', type: 'text', width: '60px' },
      { key: 'tl', label: 'T.Lý', type: 'text', width: '60px' },
      { key: 'loai', label: 'SP', type: 'text', width: '80px' },
      { key: 'ghichu', label: 'Ghi chú', type: 'text', width: '150px' },
      { key: 'hangx', label: 'Hãng', type: 'text', width: '80px' },
      { key: 'duoi', label: 'Lk', type: 'text', width: '80px' }
    ]
  }
};

let currentGridTable = 'tong_khuon';
let gridFilters = {};
let gridPage = 1;
let gridTotalPages = 1;

// Khóa chính của bảng (mặc định 'id')
function getPk(tableName) {
  return (TABLES[tableName] && TABLES[tableName].pk) || 'id';
}

// Cắt phần giờ của chuỗi ISO timestamp (bất kể múi giờ) để hiển thị ngày
function formatCellValue(val) {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
    return val.split('T')[0];
  }
  return val;
}

let gridSort = '';
window.handleMainSort = function(colKey) {
  if (gridSort === colKey) {
    gridSort = '-' + colKey;
  } else {
    gridSort = colKey;
  }
  gridPage = 1;
  loadGridData();
};


async function openGrid(tableName, presetFilters) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  let gridPageEl = document.getElementById('page-access-grid');
  if (!gridPageEl) {
    gridPageEl = document.createElement('div');
    gridPageEl.className = 'page';
    gridPageEl.id = 'page-access-grid';
    
    gridPageEl.innerHTML = `
      <div class="app-container">
        <div id="grid-sidebar" class="grid-sidebar hidden"></div>
        <div id="grid-main-content" class="grid-main-content"></div>
      </div>
    `;
    document.querySelector('.main-container').appendChild(gridPageEl);
    
    // Copy the dashboard switchboard into the sidebar
    const dashboardGrid = document.querySelector('#page-dashboard .switchboard-grid');
    if (dashboardGrid) {
      const sidebarContent = dashboardGrid.cloneNode(true);
      // Disable ID duplicates if any, but since it's just classes mostly it's fine
      document.getElementById('grid-sidebar').appendChild(sidebarContent);
    }
  }
  
  gridPageEl.classList.add('active');

  currentGridTable = tableName;
  gridFilters = (presetFilters && typeof presetFilters === 'object') ? presetFilters : {};
  gridPage = 1;

  renderGridContainer(gridPageEl);
  // Đổ giá trị lọc sẵn vào ô lọc trên header để người dùng thấy
  if (presetFilters) {
    setTimeout(() => {
      for (const [col, val] of Object.entries(presetFilters)) {
        const input = document.querySelector(`.page.active .col-filter[data-col="${col}"]`);
        if (input && typeof val === 'string') input.value = val;
      }
    }, 50);
  }
  await loadGridData();
}

// Ô "Tìm Khuôn" / "Vào khuôn": hỏi tên khuôn rồi mở tổng khuôn đã lọc
window.timKhuon = function() {
  const ten = prompt('Nhập tên (hoặc một phần tên) khuôn cần tìm:');
  if (ten && ten.trim()) openGrid('tong_khuon', { ten_khuon: ten.trim() });
};

async function searchTongKhuon() {
  // Lấy dữ liệu từ màn hình Switchboard
  const tenK = document.getElementById('sw-filter-ten').value.trim();
  const date1 = document.getElementById('sw-filter-date1').value;
  const date2 = document.getElementById('sw-filter-date2').value;
  const dh = document.getElementById('sw-filter-dh').value.trim();
  
  // Thiết lập biến lọc
  gridFilters = {};
  if (tenK) gridFilters.ten_khuon = tenK;
  if (dh) gridFilters.don_hang = dh;
  if (date1 && date2) {
    gridFilters.ngay = { type: 'between', start: date1, end: date2 };
  }
  
  // Mở grid và nạp
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  let gridPageEl = document.getElementById('page-access-grid');
  if (!gridPageEl) {
    gridPageEl = document.createElement('div');
    gridPageEl.className = 'page';
    gridPageEl.id = 'page-access-grid';
    
    gridPageEl.innerHTML = `
      <div class="app-container">
        <div id="grid-sidebar" class="grid-sidebar hidden"></div>
        <div id="grid-main-content" class="grid-main-content"></div>
      </div>
    `;
    document.querySelector('.main-container').appendChild(gridPageEl);
    
    // Copy the dashboard switchboard into the sidebar
    const dashboardGrid = document.querySelector('#page-dashboard .switchboard-grid');
    if (dashboardGrid) {
      const sidebarContent = dashboardGrid.cloneNode(true);
      // Disable ID duplicates if any, but since it's just classes mostly it's fine
      document.getElementById('grid-sidebar').appendChild(sidebarContent);
    }
  }
  gridPageEl.classList.add('active');
  
  currentGridTable = 'tong_khuon';
  gridPage = 1;
  renderGridContainer(gridPageEl);
  
  // Đổ dữ liệu ngược lại vào lưới filter
  setTimeout(() => {
    if (tenK) document.querySelector('.col-filter[data-col="ten_khuon"]').value = tenK;
    if (dh) document.querySelector('.col-filter[data-col="don_hang"]').value = dh;
  }, 100);
  
  await loadGridData();
}

function renderGridContainer(container) {
  const tableConfig = TABLES[currentGridTable];
  
  let html = `
    <div class="chart-card" style="padding: 10px; height: 100%; display: flex; flex-direction: column;">
      <div class="chart-header" style="margin-bottom: 5px; display: flex; align-items: center;">
        <button class="btn-toggle-menu" onclick="toggleGridSidebar()">
          <i class="fas fa-bars"></i> Menu
        </button>
        <span class="grid-title">📋 ${tableConfig.title || 'BẢNG ' + currentGridTable.replace('_', ' ').toUpperCase()}</span>
        <div style="margin-left: auto;">
          <button class="btn-sm btn-primary" onclick="addNewRow()">➕ Thêm Mới</button>
          <button class="btn-sm btn-danger" onclick="openSwitchboard()">❌ Đóng</button>
        </div>
      </div>
      <div class="access-table-wrapper" style="flex: 1; overflow: auto;">
        <table class="access-table" id="access-main-table">
          <thead>
            <tr>
              <th style="min-width: 30px;"></th>
              ${tableConfig.columns.map(c => `<th style="cursor:pointer; min-width:${c.width || '100px'}" onclick="handleMainSort('${c.key}')">${c.label} <span style="font-size:10px;color:#00f0ff">↕</span></th>`).join('')}
              <th style="min-width: 40px;">Xóa</th>
            </tr>
            <tr class="filter-row">
              <th><i class="fas fa-search" style="color:#64748b"></i></th>
              ${tableConfig.columns.map(c => `<th><input type="text" class="col-filter" data-col="${c.key}" placeholder="Lọc..." oninput="handleFilterInput(this)"></th>`).join('')}
              <th></th>
            </tr>
          </thead>
          <tbody id="access-main-tbody">
            <!-- Rows will be rendered here -->
          </tbody>
        </table>
      </div>
      
      <div class="access-grid-footer">
        <span id="grid-record-count" style="font-weight: 500;">Record: 0</span>
        <div style="flex: 1"></div>
        <button class="pagination-btn" onclick="changeGridPage(-1)">◀</button>
        <select id="grid-page-select" onchange="jumpToGridPage(this.value)" style="background: rgba(15, 23, 42, 0.8); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 4px; outline: none; font-weight: bold; cursor: pointer; padding: 4px 12px; appearance: none; text-align: center; box-shadow: 0 0 10px rgba(56,189,248,0.2);"><option value="1">Page 1</option></select>
        <button class="pagination-btn" onclick="changeGridPage(1)">▶</button>
      </div>
    </div>
  `;
  
  const mainContent = container.querySelector('#grid-main-content');
  if (mainContent) {
    mainContent.innerHTML = html;
  } else {
    // fallback if container structure doesn't match
    container.innerHTML = html;
  }
}

function toggleGridSidebar() {
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    const sidebar = activePage.querySelector('.grid-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
    }
  }
}

let filterTimeout;
function handleFilterInput(input) {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    const col = input.getAttribute('data-col');
    const val = input.value.trim();
    if (val) {
      gridFilters[col] = val;
    } else {
      delete gridFilters[col];
    }
    gridPage = 1;
    loadGridData();
  }, 500);
}

async function loadGridData() {
  const activePage = document.querySelector('.page.active');
  const tbody = activePage ? activePage.querySelector('#access-main-tbody') : document.getElementById('access-main-tbody');
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="100" style="text-align:center;">Đang tải...</td></tr>`;
  
  try {
    const filtersParam = encodeURIComponent(JSON.stringify(gridFilters));
    const offset = (gridPage - 1) * 100;
    const res = await fetch(`${API_BASE}/${currentGridTable}?limit=100&offset=${offset}&filters=${filtersParam}&sort=${gridSort}`);
    const data = await res.json();
    
    (document.querySelector('.page.active #grid-record-count') || document.getElementById('grid-record-count')).innerText = `Record: ${data.pageInfo.totalRows}`;
    
    const totalPages = Math.ceil(data.pageInfo.totalRows / 100) || 1;
    gridTotalPages = totalPages;
    const selectEl = (document.querySelector('.page.active #grid-page-select') || document.getElementById('grid-page-select'));
    if (selectEl) {
      let opts = '';
      for (let i = 1; i <= totalPages; i++) {
        opts += `<option value="${i}" ${i === gridPage ? 'selected' : ''} style="background: #0f172a; color: #e2e8f0; font-weight: 500;">Page ${i}</option>`;
      }
      selectEl.innerHTML = opts;
    }

    
    renderGridRows(data.list, tbody);
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="100" style="text-align:center;color:red;">Lỗi: ${e.message}</td></tr>`;
  }
}

function renderGridRows(list, tbody) {
  const tableConfig = TABLES[currentGridTable];
  if (!list || list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${tableConfig.columns.length + 2}" style="text-align:center;">Không có dữ liệu</td></tr>`;
    return;
  }
  
  const pk = getPk(currentGridTable);
  let html = '';
  list.forEach((row, idx) => {
    const rowKey = row[pk] != null ? String(row[pk]) : '';
    html += `<tr class="data-row" data-id="${rowKey.replace(/"/g, '&quot;')}">`;

    if (tableConfig.subdatasheet) {
      let pKey = tableConfig.parentKey || tableConfig.subKey;
      // Dùng idx làm DOM id (giá trị khóa có thể chứa khoảng trắng/ký tự lạ)
      html += `<td class="expand-cell" onclick="toggleSubdatasheet(this, '${idx}', '${String(row[pKey] || '').replace(/'/g, "\\'")}')"><span class="expand-btn" style="cursor:pointer;font-weight:bold;color:#38bdf8;">+</span></td>`;
    } else {
      html += `<td></td>`;
    }

    tableConfig.columns.forEach(c => {
      let val = formatCellValue(row[c.key] != null ? row[c.key] : '');
      html += `<td ondblclick="editCell(this, '${c.key}')" style="cursor: cell;">${val}</td>`;
    });

    html += `<td style="text-align:center; color: #ef4444; cursor: pointer;" onclick="deleteRowFromTr(this)">✖</td>`;
    html += `</tr>`;
  });

  tbody.innerHTML = html;
}

async function toggleSubdatasheet(td, rowId, subKeyValue) {
  const tr = td.parentElement;
  const btn = td.querySelector('.expand-btn');
  const tableConfig = TABLES[currentGridTable];
  
  // Nếu đã mở thì đóng lại
  if (tr.nextElementSibling && tr.nextElementSibling.classList.contains('sub-row')) {
    tr.nextElementSibling.remove();
    btn.innerText = '+';
    return;
  }
  
  // Đóng tất cả các bảng con khác đang mở để tránh bị "sổ ra 1 đống"
  document.querySelectorAll('.sub-row').forEach(row => {
    const prevBtn = row.previousElementSibling?.querySelector('.expand-btn');
    if (prevBtn) prevBtn.innerText = '+';
    row.remove();
  });
  
  // Đổi nút thành -
  btn.innerText = '-';
  
  // Tạo row con
  const subTr = document.createElement('tr');
  subTr.className = 'sub-row';
  const colsCount = tableConfig.columns.length + 2;
  
  subTr.innerHTML = `
    <td></td>
    <td colspan="${colsCount - 1}" style="padding: 10px; background: #1e293b;">
      <div style="background: #0f172a; padding: 10px; border: 1px solid #475569;">
        <div style="color: #38bdf8; font-weight: bold; margin-bottom: 10px;">📋 Lịch sử / Chi tiết của: ${subKeyValue}</div>
        <div style="max-height: 450px; overflow-y: auto;">
          <table class="access-table" style="width: 100%;">
            <thead>
              <tr>${TABLES[tableConfig.subdatasheet].columns.map((c, i) => `<th style="cursor:pointer" onclick="handleClientSubSort(this, '${rowId}', ${i})">${c.label} <span style="font-size:10px;color:#00f0ff">↕</span></th>`).join('')}</tr>
              <tr class="filter-row">
                ${TABLES[tableConfig.subdatasheet].columns.map((c, i) => `<th><input type="text" class="col-filter sub-col-filter" data-col-index="${i}" placeholder="Lọc..." oninput="handleClientSubFilter('${rowId}')"></th>`).join('')}
              </tr>
            </thead>
            <tbody id="sub-tbody-${rowId}"><tr><td colspan="100">Đang tải...</td></tr></tbody>
          </table>
        </div>
      </div>
    </td>
  `;
  tr.after(subTr);
  
  // Fetch dữ liệu con
  try {
    const filters = {};
    const cKey = tableConfig.childKey || tableConfig.subKey;
    filters[cKey] = { type: 'exact', value: subKeyValue };
    const filtersParam = encodeURIComponent(JSON.stringify(filters));
    const res = await fetch(`${API_BASE}/${tableConfig.subdatasheet}?limit=100&offset=0&filters=${filtersParam}`);
    const data = await res.json();
    
    const subTbody = document.getElementById(`sub-tbody-${rowId}`);
    if (!data.list || data.list.length === 0) {
      subTbody.innerHTML = `<tr><td colspan="100" style="text-align:center;">Chưa có dữ liệu</td></tr>`;
      return;
    }
    
    const subPk = getPk(tableConfig.subdatasheet);
    let subHtml = '';
    data.list.forEach(row => {
      const subRowKey = String(row[subPk] != null ? row[subPk] : '').replace(/'/g, "\\'");
      subHtml += `<tr>`;
      TABLES[tableConfig.subdatasheet].columns.forEach(c => {
        let val = formatCellValue(row[c.key] != null ? row[c.key] : '');
        subHtml += `<td ondblclick="editCell(this, '${c.key}', '${tableConfig.subdatasheet}', '${subRowKey}')" style="cursor: cell;">${val}</td>`;
      });
      subHtml += `</tr>`;
    });
    subTbody.innerHTML = subHtml;
  } catch (e) {
    document.getElementById(`sub-tbody-${rowId}`).innerHTML = `<tr><td colspan="100">Lỗi: ${e.message}</td></tr>`;
  }
}

function changeGridPage(delta) {
  const next = gridPage + delta;
  if (next < 1 || next > gridTotalPages) return;
  gridPage = next;
  loadGridData();
}

function openSwitchboard() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-dashboard').classList.add('active');
}

// INLINE EDITING
let editingCell = null;
function editCell(td, colKey, overrideTable = null, overrideId = null) {
  if (editingCell) return;
  const originalValue = td.innerText;
  const rowId = overrideId || td.parentElement.getAttribute('data-id');
  const targetTable = overrideTable || currentGridTable;
  
  td.innerHTML = `<input type="text" class="inline-edit" value="${originalValue}" style="width: 100%; box-sizing: border-box; background: white; color: black; padding: 2px;">`;
  const input = td.querySelector('input');
  input.focus();
  editingCell = input;
  
  input.onblur = async () => {
    const newValue = input.value;
    td.innerHTML = newValue;
    editingCell = null;
    
    if (newValue !== originalValue) {
      td.style.backgroundColor = 'rgba(234, 179, 8, 0.2)'; // Yellow flash
      try {
        const payload = {};
        payload[colKey] = newValue;
        
        const res = await fetch(`${API_BASE}/${targetTable}/${encodeURIComponent(rowId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('API Error');
        // Nếu vừa sửa chính cột khóa thì cập nhật lại data-id của dòng
        if (!overrideId && colKey === getPk(targetTable)) {
          td.parentElement.setAttribute('data-id', newValue);
        }
        
        td.style.backgroundColor = 'rgba(34, 197, 94, 0.2)'; // Green flash
        setTimeout(() => td.style.backgroundColor = '', 1000);
      } catch (e) {
        alert('Lỗi khi lưu dữ liệu!');
        td.innerHTML = originalValue;
        td.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; // Red flash
      }
    }
  };
  
  input.onkeydown = (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      td.innerHTML = originalValue;
      editingCell = null;
    }
  };
}

// Xóa dòng: lấy khóa từ data-id của <tr> (tránh lỗi khi giá trị khóa chứa ký tự đặc biệt)
async function deleteRowFromTr(el) {
  const tr = el.closest('tr');
  const id = tr ? tr.getAttribute('data-id') : null;
  if (id == null || id === '' || id === 'null' || id === 'undefined') {
    alert('Không xác định được khóa của bản ghi này!');
    return;
  }
  await deleteRow(id);
}

async function deleteRow(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;
  try {
    const res = await fetch(`${API_BASE}/${currentGridTable}/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('API Error');
    loadGridData();
  } catch (e) {
    alert('Lỗi khi xóa: ' + e.message);
  }
}

async function addNewRow() {
  const tableConfig = TABLES[currentGridTable];
  const pk = getPk(currentGridTable);
  // Ưu tiên hỏi cột khóa chính (nếu không phải id tự tăng), sau đó tới cột đầu tiên không readonly
  const promptCol = (pk !== 'id' && tableConfig.columns.find(c => c.key === pk))
    || tableConfig.columns.find(c => !c.readonly)
    || tableConfig.columns[0];
  const newValue = prompt(`Nhập ${promptCol.label} cho bản ghi mới:`);
  if (!newValue) return;

  try {
    const payload = {};
    payload[promptCol.key] = newValue;
    
    const res = await fetch(`${API_BASE}/${currentGridTable}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API Error');
    loadGridData();
  } catch (e) {
    alert('Lỗi khi thêm: ' + e.message);
  }
}


window.handleClientSubFilter = function(rowId) {
  const subTbody = document.getElementById(`sub-tbody-${rowId}`);
  if (!subTbody) return;
  const filterInputs = subTbody.parentElement.querySelectorAll('.sub-col-filter');
  const rows = subTbody.querySelectorAll('tr');
  rows.forEach(row => {
    let match = true;
    // Skip if it's the "No data" or "Loading" row
    if (row.children.length === 1) return;
    
    filterInputs.forEach(input => {
      const val = input.value.trim().toLowerCase();
      if (!val) return;
      const idx = input.getAttribute('data-col-index');
      if (row.children[idx]) {
        const tdVal = row.children[idx].innerText.toLowerCase();
        if (!tdVal.includes(val)) match = false;
      }
    });
    row.style.display = match ? '' : 'none';
  });
};

window.handleClientSubSort = function(th, rowId, colIndex) {
  const subTbody = document.getElementById(`sub-tbody-${rowId}`);
  if (!subTbody) return;
  const rows = Array.from(subTbody.querySelectorAll('tr'));
  if (rows.length <= 1 && rows[0].children.length === 1) return;
  
  const isAsc = th.getAttribute('data-sort') === 'asc';
  th.setAttribute('data-sort', isAsc ? 'desc' : 'asc');
  
  rows.sort((a, b) => {
    if (!a.children[colIndex] || !b.children[colIndex]) return 0;
    const valA = a.children[colIndex].innerText.toLowerCase();
    const valB = b.children[colIndex].innerText.toLowerCase();
    const numA = parseFloat(valA);
    const numB = parseFloat(valB);
    let res = 0;
    if (!isNaN(numA) && !isNaN(numB) && valA.trim() !== '' && valB.trim() !== '') {
      res = numA - numB;
    } else {
      res = valA.localeCompare(valB);
    }
    return isAsc ? res : -res;
  });
  
  rows.forEach(r => subTbody.appendChild(r));
};

window.jumpToGridPage = function(pageStr) {
  gridPage = parseInt(pageStr) || 1;
  loadGridData();
};


window.aggregateMoldData = async function(evt) {
  if (!confirm('Bạn có chắc chắn muốn quét và cập nhật lại toàn bộ Sổ Nhật Ký vào Bảng Tổng Hợp? Quá trình này có thể mất vài giây.')) {
    return;
  }

  // Nhận event qua tham số (biến global `event` không tồn tại trên Firefox)
  const btn = (evt && (evt.currentTarget || evt.target)) || null;
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    btn.style.pointerEvents = 'none';
  }

  try {
    const res = await fetch(`http://${window.location.hostname}:3001/api/aggregate-mold-data`, {
      method: 'POST'
    });
    const data = await res.json();
    if (data.success) {
      alert('Thành công: ' + data.message);
    } else {
      alert('Lỗi: ' + data.error);
    }
  } catch (err) {
    alert('Lỗi kết nối: ' + err.message);
  } finally {
    if (btn) {
      btn.innerHTML = originalText;
      btn.style.pointerEvents = 'auto';
    }
  }
};


// -----------------------------------------
// DUAL GRID FOR VÀO SỐ LIỆU
// -----------------------------------------
window.openDualGrid = function(leftTable, rightTable) {
  // Reset trạng thái login
  const loginOverlay = document.getElementById('login-overlay');
  if (loginOverlay) loginOverlay.style.display = 'none';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  let dualPageEl = document.getElementById('page-dual-grid');
  if (!dualPageEl) {
    dualPageEl = document.createElement('div');
    dualPageEl.className = 'page active';
    dualPageEl.id = 'page-dual-grid';
    document.querySelector('.main-container').appendChild(dualPageEl);
  } else {
    dualPageEl.classList.add('active');
  }

  const html = `
    <div class="app-container">
      <div id="grid-sidebar" class="grid-sidebar hidden"></div>
      <div style="display: flex; height: 100vh; width: 100%; padding: 10px; gap: 10px; background: var(--bg-dark); box-sizing: border-box; flex: 1;">
        <div style="flex: 6; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-panel);" id="grid-main-content">
        </div>
        <div style="flex: 4; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-panel);" id="right-grid-content">
        </div>
      </div>
    </div>
  `;
  dualPageEl.innerHTML = html;
  
  const dashboardGrid = document.querySelector('#page-dashboard .switchboard-grid');
  if (dashboardGrid) {
    const sidebarContent = dashboardGrid.cloneNode(true);
    dualPageEl.querySelector('#grid-sidebar').appendChild(sidebarContent);
  }
  
  // Left Grid
  currentGridTable = leftTable;
  gridPage = 1;
  gridFilters = {};
  renderGridContainer(dualPageEl); 
  loadGridData(); 
  
  // Right Grid
  rightGridFilters = {};
  renderRightGrid(rightTable);
};

window.rightGridFilters = {};

window.handleRightFilterInput = function(input, table) {
  const col = input.getAttribute('data-col');
  const val = input.value.trim();
  if (val) {
    rightGridFilters[col] = { type: 'like', value: val };
  } else {
    delete rightGridFilters[col];
  }
  
  if (window.rightFilterTimeout) clearTimeout(window.rightFilterTimeout);
  window.rightFilterTimeout = setTimeout(() => {
    loadRightGridData(table);
  }, 500);
};

window.handleRightSort = function(colKey, table) {
  if (window.rightGridSort === colKey) {
    window.rightGridSort = '-' + colKey;
  } else {
    window.rightGridSort = colKey;
  }
  loadRightGridData(table);
};

window.renderRightGrid = function(table) {
  const container = document.getElementById('right-grid-content');
  if (!container) return;
  const tableConfig = TABLES[table];
  
  const html = `
    <div class="chart-card" style="padding: 10px; height: 100%; display: flex; flex-direction: column;">
      <div class="chart-header" style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between;">
        <span class="grid-title">📋 ${tableConfig.title}</span>
        <button class="btn-sm btn-primary" onclick="addNewRightRow('${table}')">➕ Thêm Mới</button>
      </div>
      <div class="access-table-wrapper" style="flex: 1; overflow: auto;">
        <table class="access-table" id="right-access-table">
          <thead>
            <tr>
              <th style="width: 30px;"></th>
              ${tableConfig.columns.map(c => `<th style="cursor:pointer" onclick="handleRightSort('${c.key}', '${table}')">${c.label} <span style="font-size:10px;color:#00f0ff">↕</span></th>`).join('')}
              <th style="width: 40px;">Xóa</th>
            </tr>
            <tr class="filter-row">
              <th><i class="fas fa-search" style="color:#64748b"></i></th>
              ${tableConfig.columns.map(c => `<th><input type="text" class="col-filter" data-col="${c.key}" placeholder="Lọc..." oninput="handleRightFilterInput(this, '${table}')"></th>`).join('')}
              <th></th>
            </tr>
          </thead>
          <tbody id="right-tbody">
            <tr><td colspan="100" style="text-align:center">Đang tải...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  container.innerHTML = html;
  loadRightGridData(table);
};

window.loadRightGridData = async function(table) {
  try {
    const filtersParam = encodeURIComponent(JSON.stringify(window.rightGridFilters || {}));
    const sortParam = window.rightGridSort || '-ngay';
    const res = await fetch(`${API_BASE}/${table}?limit=200&offset=0&sort=${sortParam}&filters=${filtersParam}`);
    const data = await res.json();
    const tbody = document.getElementById('right-tbody');
    const tableConfig = TABLES[table];
    
    let html = '';
    if (!data.list || data.list.length === 0) {
      html = `<tr><td colspan="100" style="text-align:center">Không có dữ liệu</td></tr>`;
    } else {
      const pk = getPk(table);
      data.list.forEach(row => {
        const rowKey = String(row[pk] != null ? row[pk] : '').replace(/'/g, "\\'");
        html += `<tr class="data-row" data-id="${rowKey.replace(/"/g, '&quot;')}">`;
        html += `<td></td>`;
        tableConfig.columns.forEach(c => {
          let val = formatCellValue(row[c.key] != null ? row[c.key] : '');

          if (c.key === 'hong' || c.key === 'tly') {
            const checked = (val === 'x' || val === 'X' || val === true || val === 'true') ? 'checked' : '';
            html += `<td style="text-align:center"><input type="checkbox" ${checked} onchange="updateRightCheckbox('${table}', '${rowKey}', '${c.key}', this.checked)"></td>`;
          } else {
            html += `<td ondblclick="editRightCell(this, '${table}', '${rowKey}', '${c.key}')">${val}</td>`;
          }
        });
        html += `<td style="text-align:center; color: #ef4444; cursor: pointer;" onclick="deleteRightRow('${table}', '${rowKey}')">✖</td>`;
        html += `</tr>`;
      });
    }
    tbody.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
};

window.updateRightCheckbox = async function(table, id, col, isChecked) {
  const val = isChecked ? 'x' : '';
  try {
    await fetch(`${API_BASE}/${table}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ [col]: val })
    });
  } catch(e) {
    alert('Lỗi cập nhật');
  }
};

window.addNewRightRow = async function(table) {
  try {
    const res = await fetch(`${API_BASE}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ngay: new Date().toISOString().split('T')[0] })
    });
    if (res.ok) {
      loadRightGridData(table);
    } else {
      alert('Không thể thêm dòng mới');
    }
  } catch (e) {
    console.error(e);
  }
};

window.deleteRightRow = async function(table, id) {
  if(!confirm('Xóa dòng này?')) return;
  try {
    const res = await fetch(`${API_BASE}/${table}/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      loadRightGridData(table);
    }
  } catch (e) {
    console.error(e);
  }
};

window.editRightCell = function(td, table, id, colKey) {
  const currentVal = td.innerText;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentVal;
  input.style.width = '100%';
  input.style.boxSizing = 'border-box';
  input.style.background = '#1e293b';
  input.style.color = '#fff';
  input.style.border = '1px solid #38bdf8';
  
  td.innerHTML = '';
  td.appendChild(input);
  input.focus();
  
  input.onblur = async () => {
    const newVal = input.value;
    td.innerText = newVal;
    if (newVal !== currentVal) {
      td.style.background = '#065f46';
      try {
        await fetch(`${API_BASE}/${table}/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [colKey]: newVal })
        });
        setTimeout(() => td.style.background = '', 1000);
      } catch (e) {
        td.style.background = '#991b1b';
      }
    }
  };
  input.onkeydown = (e) => {
    if (e.key === 'Enter') input.blur();
  };
};


// =========================================================
// LUỒNG THANH LÝ — gọi các endpoint nghiệp vụ trên Node API
// =========================================================
const ACTION_BASE = 'http://' + window.location.hostname + ':3001/api';

async function callAction(path, confirmMsg) {
  if (confirmMsg && !confirm(confirmMsg)) return;
  try {
    const res = await fetch(`${ACTION_BASE}/${path}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('✅ ' + (data.message || 'Hoàn thành'));
    } else {
      alert('❌ Lỗi: ' + (data.error || 'Không rõ'));
    }
  } catch (e) {
    alert('❌ Lỗi kết nối: ' + e.message);
  }
}

window.moveDamagedToLiquidation = function() {
  callAction('liquidation/move-damaged',
    'Chuyển tất cả khuôn hỏng đã đánh dấu thanh lý sang Bảng thanh lý?');
};

window.archiveLiquidation = function() {
  callAction('liquidation/archive',
    'Lưu trữ (sao lưu lịch sử) các khuôn trong Bảng thanh lý cùng nhật ký của chúng?');
};

window.softDeleteLiquidation = function() {
  callAction('liquidation/soft-delete',
    'Đánh dấu thanh lý (xóa mềm) trong Bảng tổng khuôn cho các khuôn đã thanh lý?\n\nLƯU Ý: chỉ đánh dấu, KHÔNG xóa hẳn — có thể khôi phục.');
};


// =========================================================
// LUỒNG NGHIỆM THU
// =========================================================

// "Cập nhật số liệu nghiệm thu": tính lại bảng tạm rồi mở bảng xem
window.nghiemThuUpdate = async function() {
  if (!confirm('Tính lại số liệu nghiệm thu cho các khuôn trong danh sách kiểm tra?\n(Chỉ cập nhật bảng tính tạm, KHÔNG ảnh hưởng lịch sử nghiệm thu)')) return;
  try {
    const res = await fetch(`${ACTION_BASE}/nghiemthu/update`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert('✅ ' + data.message);
      openGrid('tonghop_nghiem_thu');
    } else {
      alert('❌ Lỗi: ' + (data.error || 'Không rõ'));
    }
  } catch (e) { alert('❌ Lỗi kết nối: ' + e.message); }
};

// "Lưu khuôn nghiệm thu": hỏi ngày NT rồi APPEND vào lịch sử nghiem_thu
window.nghiemThuSave = async function() {
  const today = new Date().toISOString().split('T')[0];
  const ngay = prompt('Vào ngày nghiệm thu (YYYY-MM-DD):', today);
  if (!ngay) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ngay.trim())) { alert('Sai định dạng ngày! Ví dụ: ' + today); return; }
  try {
    const res = await fetch(`${ACTION_BASE}/nghiemthu/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ngay_nt: ngay.trim() })
    });
    const data = await res.json();
    alert(data.success ? '✅ ' + data.message : '❌ Lỗi: ' + (data.error || 'Không rõ'));
  } catch (e) { alert('❌ Lỗi kết nối: ' + e.message); }
};

// "Áp đợt khuôn nghiệm thu": điền Đợt còn thiếu từ bảng tổng khuôn
window.nghiemThuApDot = function() {
  callAction('nghiemthu/ap-dot',
    'Áp Đợt từ Bảng tổng khuôn cho các bản ghi nghiệm thu đang thiếu Đợt?');
};


// =========================================================
// MÀN HÌNH BÁO CÁO SẢN PHẨM THEO THÁNG / NĂM (bảng + biểu đồ SVG)
// =========================================================
window.openProductionReport = async function(by) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  let el = document.getElementById('page-report');
  if (!el) {
    el = document.createElement('div');
    el.className = 'page';
    el.id = 'page-report';
    document.querySelector('.main-container').appendChild(el);
  }
  el.classList.add('active');
  const tenLoai = by === 'year' ? 'NĂM' : 'THÁNG';
  el.innerHTML = `<div class="chart-card" style="padding:15px;height:100%;overflow:auto;">
    <div style="display:flex;align-items:center;margin-bottom:10px;">
      <span class="grid-title">📊 SẢN PHẨM THEO ${tenLoai}</span>
      <button class="btn-sm btn-danger" style="margin-left:auto" onclick="openSwitchboard()">❌ Đóng</button>
    </div>
    <div id="report-body">Đang tải...</div>
  </div>`;

  try {
    const res = await fetch(`${ACTION_BASE}/report/production?by=${by === 'year' ? 'year' : 'month'}`);
    const data = await res.json();
    const rows = data.rows || [];
    if (!rows.length) { document.getElementById('report-body').innerHTML = 'Không có dữ liệu'; return; }

    const label = r => by === 'year' ? `${r.nam}` : `${String(r.thang).padStart(2,'0')}/${r.nam}`;
    const maxKg = Math.max(...rows.map(r => Number(r.tong_kg) || 0)) || 1;

    // Biểu đồ cột SVG thuần (chạy offline, không cần thư viện)
    const bw = 34, gap = 12, chartH = 240;
    const svgW = rows.length * (bw + gap) + 40;
    let bars = '';
    rows.forEach((r, i) => {
      const kg = Number(r.tong_kg) || 0;
      const h = Math.round((kg / maxKg) * (chartH - 30));
      const x = 30 + i * (bw + gap);
      const y = chartH - h - 20;
      bars += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="#38bdf8" rx="3">
                 <title>${label(r)}: ${kg.toLocaleString('vi-VN')} kg</title></rect>
               <text x="${x + bw/2}" y="${chartH - 6}" font-size="9" fill="#94a3b8" text-anchor="middle" transform="rotate(0)">${label(r)}</text>`;
    });
    const svg = `<div style="overflow-x:auto;border:1px solid #334155;border-radius:8px;padding:10px;margin-bottom:15px;background:#0f172a;">
      <svg width="${svgW}" height="${chartH + 10}" style="min-width:100%">${bars}</svg></div>`;

    let table = `<table class="access-table" style="width:100%"><thead><tr>
      ${by === 'year' ? '<th>Năm</th>' : '<th>Tháng</th>'}
      <th>Lượt chạy</th><th>Tổng số thanh</th><th>Tổng KG</th><th>Hiệu quả TB</th></tr></thead><tbody>`;
    rows.forEach(r => {
      table += `<tr><td style="text-align:center">${label(r)}</td>
        <td style="text-align:right">${Number(r.luot_chay).toLocaleString('vi-VN')}</td>
        <td style="text-align:right">${Number(r.tong_thanh).toLocaleString('vi-VN')}</td>
        <td style="text-align:right">${Number(r.tong_kg).toLocaleString('vi-VN')}</td>
        <td style="text-align:right">${r.hieu_qua_tb ?? ''}</td></tr>`;
    });
    table += '</tbody></table>';
    document.getElementById('report-body').innerHTML = svg + table;
  } catch (e) {
    document.getElementById('report-body').innerHTML = 'Lỗi: ' + e.message;
  }
};
