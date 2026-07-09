// Logic Đăng Nhập cho Giao diện Access Clone
const API_REF = API;

async function init() {
  const btnLogout = document.getElementById('btn-logout');
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');

  // Gắn sự kiện Đăng xuất
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      API_REF.logout();
      loginOverlay.style.display = 'flex';
    });
  }

  // Gắn sự kiện Đăng nhập
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
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
        // Reload to apply RBAC smoothly
        window.location.reload();
      } else {
        errDiv.style.display = 'block';
      }
    });
  }

  // Khóa tính năng chờ cập nhật (ổ khóa xám)
  document.querySelectorAll('.sw-btn').forEach(btn => {
    if (!btn.getAttribute('onclick')) {
      const dot = btn.querySelector('.sw-dot');
      if (dot) {
        dot.innerHTML = '<i class="fas fa-lock" style="color: #94a3b8; font-size: 10px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>';
        dot.style.background = 'transparent';
        dot.style.boxShadow = 'none';
      }
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Tính năng đang bị khóa chờ nâng cấp dữ liệu.');
      });
    }
  });

  // Kiểm tra nếu đã có token thì vào luôn và áp dụng quyền
  if (API_REF.token) {
    loginOverlay.style.display = 'none';
    applyRBAC();
  } else {
    loginOverlay.style.display = 'flex';
  }
}

function applyRBAC() {
  const role = localStorage.getItem('directus_role') || 'Unknown';
  const fullName = localStorage.getItem('directus_fullname') || localStorage.getItem('directus_user');
  
  const menu = document.getElementById('user-profile-menu');
  if (menu) {
    menu.style.display = 'flex';
    document.getElementById('current-user-name').textContent = fullName;
    document.getElementById('current-user-role').textContent = role;
  }
  
  if (role === 'Administrator' || role === 'Admin') return; // All unlocked
  
  const lockBtn = (btn) => {
    btn.removeAttribute('onclick');
    btn.style.opacity = '0.6';
    btn.style.cursor = 'not-allowed';
    
    const icon = btn.querySelector('i.fa-lock');
    const dot = btn.querySelector('.sw-dot');
    
    // Chuyển sang ổ khóa màu vàng báo hiệu thiếu quyền
    if (dot) {
      dot.innerHTML = '<i class="fas fa-lock" style="color: #f39c12; font-size: 10px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>';
      dot.style.background = 'transparent';
      dot.style.boxShadow = 'none';
    } else if (icon) {
       icon.style.color = '#f39c12';
    }
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Bạn không có quyền truy cập vào chức năng này!');
    });
  };

  const allBtns = document.querySelectorAll('.sw-btn');
  allBtns.forEach(btn => {
    const action = btn.getAttribute('onclick') || '';
    if (!action) return; // đã khóa xám

    if (role === 'PKT' || role === 'Phòng Kỹ Thuật') {
      // PKT: đơn hàng, nhận khuôn, tổng khuôn, kiểm tra + nghiệm thu, đặt khuôn
      if (!action.includes('don_hang') && !action.includes('nhan_khuon') && !action.includes('tong_khuon')
          && !action.includes('khuon_nt_kt') && !action.includes('nghiemThu') && !action.includes('nghiem_thu')
          && !action.includes('dat_khuon')) {
        lockBtn(btn);
      }
    } else if (role === 'PXCE' || role === 'Phân Xưởng') {
      // PXCE: khóa mảng của PKT (đơn hàng, nhận khuôn, nghiệm thu, đặt khuôn)
      if (action.includes('don_hang') || action.includes('nhan_khuon') || action.includes('khuon_nt_kt')
          || action.includes('nghiemThu') || action.includes('dat_khuon')) {
        lockBtn(btn);
      }
    } else {
      // Các phòng khác: chỉ xem, khóa mọi thao tác nhập/xử lý
      if (action.includes('nhatky') || action.includes('nhan_khuon') || action.includes('don_hang')
          || action.includes('khuon_hong') || action.includes('thanh_ly') || action.includes('khuon_nt_kt')
          || action.includes('nghiemThu') || action.includes('Liquidation') || action.includes('aggregate')
          || action.includes('dat_khuon')) {
        lockBtn(btn);
      }
    }
  });
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', init);
