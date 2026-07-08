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
        loginOverlay.style.display = 'none';
      } else {
        errDiv.style.display = 'block';
      }
    });
  }

  // Kiểm tra nếu đã có token thì vào luôn
  if (API_REF.token) {
    loginOverlay.style.display = 'none';
  } else {
    loginOverlay.style.display = 'flex';
  }

  // Gắn sự kiện và đổi icon cho các nút chưa có tính năng
  document.querySelectorAll('.sw-btn').forEach(btn => {
    if (!btn.getAttribute('onclick')) {
      const dot = btn.querySelector('.sw-dot');
      if (dot) {
        dot.innerHTML = '<i class="fas fa-lock" style="color: #94a3b8; font-size: 10px; display: flex; align-items: center; justify-content: center; height: 100%;"></i>';
        dot.style.background = 'transparent';
        dot.style.boxShadow = 'none';
      }
      
      btn.addEventListener('click', () => {
        alert('Tính năng đang bị khóa chờ nâng cấp dữ liệu.');
      });
    }
  });
}

// Khởi chạy
document.addEventListener('DOMContentLoaded', init);
