# TỔNG QUAN DỰ ÁN: HỆ THỐNG QUẢN LÝ KHUÔN ĐÚC (KM21.00)

Tài liệu này tổng hợp toàn bộ kiến thức, kiến trúc, tính năng và luồng dữ liệu của dự án "Hệ Thống Quản Lý Khuôn Đúc", dùng để cung cấp context cho AI/Claude.

---

## 1. Mục Đích và Kiến Trúc Chung
- **Mục đích:** Chuyển đổi phần mềm quản lý từ nền tảng MS Access cũ sang Web-based hiện đại, xử lý lượng dữ liệu lớn siêu tốc, bảo mật phân quyền, và hỗ trợ nhiều thiết bị cùng lúc trên mạng LAN.
- **Kiến trúc (Microservices):** Chạy thông qua Docker Compose với 4 thành phần:
  1. **PostgreSQL (port 5432):** Cơ sở dữ liệu lõi, lưu trữ hàng vạn dòng lịch sử đúc khuôn.
  2. **Directus (port 8080):** Headless CMS kiêm ERP, quản lý Auth, Role-Based Access Control (RBAC), và giao diện CRUD cho Admin.
  3. **Node.js + Express API (port 3001):** Backend tùy chỉnh, đảm nhận tính toán phức tạp (thống kê hiệu suất), và cung cấp API truy xuất dữ liệu cực nhanh cho Frontend.
  4. **Frontend Dashboard (port 3000):** UI tĩnh (HTML/CSS/JS thuần, không dùng framework như React/Vue để giữ độ nhẹ) chạy trên Nginx, mô phỏng giao diện Switchboard và Data Grid của MS Access.

## 2. Cấu Trúc Thư Mục
```text
mold-system/
├── docker-compose.yml       # Cấu hình orchestration cho 4 container
├── KHOI_DONG.bat            # Script khởi động tự động toàn bộ hệ thống
├── MO_PORT_LAN.bat          # Script mở Firewall và tạo QR Code truy cập mạng LAN
├── cai_dat_he_thong.ps1     # Script hỗ trợ cài đặt môi trường
├── init-scripts/
│   └── 00_molddb_full_dump.sql # File Dump Data để khởi tạo PostgreSQL (schemas + dữ liệu cũ)
└── dashboard/               # Chứa toàn bộ Frontend & Custom API Backend
    ├── Dockerfile
    ├── server.js            # [BACKEND] Mã nguồn API Node.js/Express
    ├── index.html           # [FRONTEND] Màn hình chính Switchboard (MS Access Clone)
    ├── css/style.css
    └── js/
        ├── api_v2.js        # Giao tiếp HTTP Fetch với Directus & Node API
        ├── dashboard_v2.js  # Logic Login, RBAC, phân quyền bật/tắt nút giao diện
        └── access_grid.js   # Logic render Table, Inline-edit, Search, Pagination
```

## 3. Cấu Trúc Dữ Liệu (Các Bảng Chính)
Được định nghĩa schema thông qua PostgreSQL và cấu hình giao diện trong `access_grid.js` (`TABLES` object):
1. `nhatky_khuon`: Bảng cốt lõi chứa dữ liệu chạy máy hằng ngày (ngày, tên khuôn, hiệu quả, kg thành, tình trạng, phôi...).
2. `tong_khuon`: Quản lý danh mục khuôn tổng (kích thước, đợt, độ cứng, vị trí).
3. `tonghop_phoi`: Bảng báo cáo tổng hợp được tính toán roll-up từ nhật ký khuôn.
4. `khuon_hong`: Danh sách và ghi chú bảo trì khuôn hỏng.
5. `thanh_ly` & `lich_su_thanh_ly`: Bảng quản lý khuôn đã bị loại bỏ/thanh lý.
6. `don_hang` & `nhan_khuon`: Nghiệp vụ phòng Kỹ Thuật/Nhập liệu.
7. `khuon_nt_kt` & `nghiem_thu` & `luu_nghiem_thu`: Luồng kiểm tra và nghiệm thu chất lượng khuôn.

## 4. Các Tính Năng Cốt Lõi (Input / Output / Core Logic)

### 4.1. Phân Quyền & Bảo Mật (RBAC - Role Based Access Control)
- Phân quyền từ Backend Directus và map xuống UI qua `dashboard_v2.js`:
  - **Admin (Toàn quyền):** View/Edit toàn bộ hệ thống (`admin@khuon.com`).
  - **Phòng Kỹ Thuật (PKT):** View All. Edit: `đơn hàng`, `nhận khuôn`, `tổng khuôn`, `kiểm tra nghiệm thu`.
  - **Phân Xưởng (PXCE):** View All. Edit: `nhật ký`, `khuôn hỏng`, `thanh lý`.
  - **Các phòng khác:** Chỉ xem (Read-only).
- **Auto-Lock UI:** Hệ thống tự động khóa tính năng (nút có ổ khóa vàng) nếu User không có quyền, hoặc ổ khóa xám nếu tính năng chưa code xong.

### 4.2. Tính Năng Input (Thao tác Data)
- **Data Grid (MS Access Clone):** Giao diện bảng (Grid) cho phép hiển thị hàng nghìn dòng dữ liệu thông qua Phân trang (Pagination) và Offset/Limit gọi xuống Node API.
- **Inline Editing (Sửa trực tiếp ô):** Người dùng double-click vào một ô trong bảng, input hiện ra. Bấm Enter hoặc Click ra ngoài thì gọi API `PUT /api/query/:table/:id` để update trực tiếp (báo xanh nếu OK, đỏ nếu Lỗi).
- **Subdatasheet (Bảng Con Thông Minh):** Bấm dấu `+` đầu dòng ở bảng cha (VD: Bảng tổng khuôn), hệ thống sẽ thả xuống một bảng con (VD: Bảng nhật ký của khuôn đó), tự động gỡ bảng con cũ để UI không bị "sổ ra 1 đống".
- **Thêm/Xóa:** Nút ➕ Thêm mới và Nút ✖ Xóa bản ghi.
- **Filter (Lọc đa chiều):** Mỗi cột có một ô Input Search ở dưới Header để lọc `ILIKE` vào PostgreSQL.

### 4.3. Tính Năng Output (Xử lý & Thống kê)
- Cung cấp dữ liệu cho biểu đồ trên UI thông qua API `/api/charts`:
  - Lấy KG sản phẩm theo tháng.
  - Phân tích tỷ lệ sử dụng theo máy đúc.
  - Top 10 khuôn hiệu quả nhất.
- **API Xử Lý Nghiệp Vụ Cốt Lõi (`/api/aggregate-mold-data`):**
  - Khi user nhấn "Cập nhật tổng hợp số liệu", Node API chạy 4 câu lệnh SQL lớn (GROUP BY, SUM, MAX, MIN) để gộp số liệu từ hàng vạn dòng của `nhatky_khuon`.
  - Đẩy kết quả tính toán vào bảng `tonghop_phoi` (lượt chạy, hq, min, max kg, ngày cuối...).
  - Tự động dò tìm các bản ghi có tình trạng chứa từ "hỏng" đẩy vào `khuon_hong`.
  - Đồng bộ trạng thái thanh lý.

## 5. Luồng Dữ Liệu Chi Tiết (Data Flow)
1. **Khởi động:** Chạy `KHOI_DONG.bat` -> Docker Compose dựng DB (chạy file dump SQL) -> Nginx bật UI -> Trình duyệt mở `localhost:3000`.
2. **Login:** User điền form -> `api_v2.js` POST lên `localhost:8080/auth/login` (Directus) -> Nhận JWT Access Token + Fetch Role Name lưu vào `localStorage`.
3. **Mở Bảng (Routing ngầm):** User click "Bảng tổng khuôn" trên menu chính (Switchboard) -> Chuyển active class DOM sang màn hình Grid -> Gọi hàm `openGrid('tong_khuon')` trong `access_grid.js`.
4. **Truy vấn Dữ liệu (Query):** 
   - `access_grid.js` cấu hình query parameter (limit, offset, filters JSON) gọi HTTP GET lên `localhost:3001/api/query/tong_khuon`.
   - Backend `server.js` map thành SQL Query (`SELECT * FROM tong_khuon WHERE... LIMIT OFFSET`).
   - Node API trả về JSON chứa `list` và `pageInfo`.
   - `access_grid.js` render HTML các dòng của bảng (Table Row).

## 6. Hướng Dẫn Mở Rộng Dành Cho AI (Dev Notes)
- Để thêm một tính năng xem/sửa một bảng mới: Chỉ việc thêm config vào đối tượng `TABLES` trong `js/access_grid.js` (không cần viết API nếu chỉ là CRUD thường).
- Để chỉnh sửa Backend Logic phức tạp: Sửa trong `dashboard/server.js` (không nên nhét logic vào file Frontend).
- Các API endpoints tự build trên Nodejs (`/api/query`) nhằm thay thế Directus API vì cần hiệu suất query SQL trực tiếp cực cao và phân trang nhẹ hơn so với việc xài ORM.
- Hỗ trợ mạng LAN: Sử dụng `MO_PORT_LAN.bat` sẽ tự lấy IPv4 (vd: 192.168.1.xxx) tạo QR code, ai kết nối chung Wifi quét là xài được Frontend. Cần đảm bảo các biến `window.location.hostname` trong file JS được giữ nguyên để gọi đúng IP động thay vì `localhost`.

## 7. Cập Nhật 07/2026 (đợt sửa lỗi + bổ sung tính năng)
- **Khóa chính CRUD:** `server.js` có map `TABLE_PK` — `tong_khuon`→`ten_khuon`, `nhan_khuon`→`dot_khuon`, còn lại `id`. Frontend dùng `getPk()` + `row[pk]`, không hardcode `row.id` nữa.
- **Bảo mật API:** `server.js` có `ALLOWED_TABLES` (whitelist bảng nghiệp vụ, chặn `directus_*`) và whitelist `sort` bằng regex. Port 5432 KHÔNG publish ra host nữa (chỉ nội bộ Docker network).
- **Tài khoản admin thật:** `admin@khuon.com` / `AdminKM2100x` (ENV trong compose bị bỏ qua vì DB seed từ dump).
- **Endpoint nghiệp vụ mới (`server.js`):**
  - `POST /api/liquidation/move-damaged` — chuyển khuôn hỏng (có cờ TLY) sang `thanh_ly`.
  - `POST /api/liquidation/archive` — lưu `thanh_ly`→`lich_su_thanh_ly` + nhật ký→`nhatky_khuon_thanh_ly` (transaction, idempotent).
  - `POST /api/liquidation/soft-delete` — XÓA MỀM: đánh dấu `tong_khuon.tly='x'` cho khuôn đã thanh lý (không xóa hẳn).
  - `GET /api/report/production?by=month|year` — báo cáo sản phẩm theo tháng/năm.
- **Frontend mới (`access_grid.js`):** `openGrid(table, presetFilters)` mở bảng kèm lọc sẵn; `timKhuon()` tìm khuôn; `openProductionReport('month'|'year')` màn báo cáo có biểu đồ cột SVG thuần (offline); các hàm `moveDamagedToLiquidation/archiveLiquidation/softDeleteLiquidation`. Config bảng `dat_khuon` đã thêm.
- **Còn khóa (chờ quyết định nghiệp vụ):** 3 nút nhóm nghiệm thu — "Cập nhật số liệu nghiệm thu", "Lưu khuôn nghiệm thu", "Áp đợt khuôn nghiệm thu" — vì chúng cần rebuild/ghi đè bảng `nghiem_thu` (3061 dòng lịch sử) theo luồng make-table `10T_*` của Access, chưa có quyết định về schema (views→tables).
