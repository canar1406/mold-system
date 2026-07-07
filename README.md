# HỆ THỐNG QUẢN LÝ KHUÔN ĐÚC (KM21.00)

Hệ thống quản lý khuôn đúc phiên bản Web hiện đại, được chuyển đổi từ Microsoft Access cũ sang nền tảng công nghệ mới nhất. Hệ thống có khả năng xử lý hàng vạn dòng dữ liệu siêu tốc, bảo mật phân quyền tuyệt đối và đi kèm biểu đồ thống kê trực quan.

---

## 🛠 GIỚI THIỆU CÔNG NGHỆ (Technology Stack)

Hệ thống được xây dựng bằng các công nghệ mã nguồn mở (Open-source) hàng đầu hiện nay:

1. **Cơ Sở Dữ Liệu (PostgreSQL):**
   - Thay thế hoàn toàn MS Access cũ. PostgreSQL là hệ quản trị cơ sở dữ liệu siêu mạnh, an toàn, không bao giờ lo bị "phình to" hay "chậm lag" khi dữ liệu lên tới hàng triệu dòng.
2. **Hệ Quản Trị & ERP (Directus):**
   - Bộ não chính của hệ thống. Directus cung cấp giao diện quản lý dữ liệu chuyên nghiệp, trực quan hệt như Excel nhưng mạnh mẽ hơn nhiều. Nó cũng đảm nhiệm vai trò **Phân Quyền Bảo Mật (RBAC)** cực kỳ khắt khe.
3. **Máy Chủ Thống Kê (Node.js + Express):**
   - Một "vệ tinh" nhỏ được viết riêng để chuyên tính toán các dữ liệu thống kê nặng (như tính thời gian khuôn chạy, tổng số lượng kg sản phẩm, v.v.) rồi trả về cho bảng điều khiển với tốc độ tính bằng mili-giây.
4. **Bảng Điều Khiển (HTML, CSS, JavaScript, Chart.js):**
   - Trang Dashboard được code thuần (không dùng thư viện cồng kềnh), giúp giao diện siêu nhẹ, siêu mượt. Tích hợp thư viện Chart.js để vẽ biểu đồ tuyệt đẹp.
5. **Đóng Gói (Docker & Docker Compose):**
   - Toàn bộ 4 thành phần trên được "đóng gói" kín vào một khối (Docker). Nhờ vậy, máy tính của bạn không cần cài đặt lắt nhắt từng phần mềm, chỉ việc chạy 1 cú click chuột là toàn bộ hệ thống tự động bung ra hoàn chỉnh.

---

## 📖 HƯỚNG DẪN SỬ DỤNG (DÀNH CHO NGƯỜI KHÔNG BIẾT CODE)

Phần này sẽ hướng dẫn bạn cách bật hệ thống và sử dụng một cách đơn giản nhất. Bạn không cần biết một chút kiến thức lập trình nào.

### Bước 1: Khởi động hệ thống (Chỉ cần 1 cú click)
- Vào thư mục `mold-system`.
- Tìm file có tên là `KHOI_DONG.bat`.
- **Nháy chuột phải** vào file này, chọn **Run as Administrator** (Chạy với quyền Quản trị).
- Một màn hình đen (chữ xanh) sẽ hiện lên. Bạn chỉ cần **ngồi uống cà phê và chờ đợi**. Nếu máy bạn chưa có Docker, công cụ sẽ tự động tải về và cài đặt giúp bạn.
- Khi màn hình báo chữ xanh lá cây **"TAT CA DA XONG!"**, trình duyệt web của bạn sẽ tự động bật lên.

### Bước 2: Truy cập vào Hệ thống

Hệ thống có 2 trang web khác nhau:
1. **Trang Biểu Đồ (Dashboard):** Truy cập `http://localhost:3000`
2. **Trang Quản Lý Dữ Liệu (Directus):** Truy cập `http://localhost:8080`

### Bước 3: Đăng nhập
Khi vào bất kỳ trang nào, hệ thống sẽ yêu cầu tài khoản.
- Tài khoản cao nhất (Toàn quyền): `admin@khuon.com`
- Mật khẩu: `AdminKM2100x`

*(Bạn có thể dùng tài khoản này để đăng nhập vào cả Dashboard lẫn Directus)*

### Bước 4: Thêm, Sửa, Xóa Dữ Liệu (Dùng Directus - Cổng 8080)
Để thao tác với dữ liệu:
1. Mở trang quản lý `http://localhost:8080`
2. Đăng nhập bằng tài khoản Admin.
3. Nhìn sang cột bên trái (Menu), bạn sẽ thấy danh sách tất cả các bảng (Khuôn, Đơn Hàng, Nhật Ký, v.v.).
4. Bấm vào một bảng bất kỳ, bạn sẽ thấy giao diện giống hệt Excel.
5. Ở góc trên bên phải có dấu **(+)** để tạo mới dữ liệu. Bấm vào bất kỳ ô nào để sửa dữ liệu, y hệt Excel!

### Bước 5: Cấp tài khoản cho nhân viên (Phân quyền)
Hệ thống đã được thiết lập sẵn cơ chế Phân Quyền Bảo Mật (RBAC) khắt khe chuẩn ERP. Dưới đây là danh sách các quyền đã được cấu hình sẵn:

| Tên Quyền | Bảng được xem | Bảng được sửa/nhập liệu |
|---|---|---|
| **Administrator (Admin)** | TẤT CẢ (Không giới hạn) | TẤT CẢ (Không giới hạn) |
| **PKT (Phòng Kỹ Thuật)** | Đơn hàng, Khuôn mẫu | Chỉ nhập liệu **Đơn hàng** (`don_hang`, `dat_khuon`) |
| **PXCE (Phân Xưởng)** | Khuôn mẫu, Khuôn hỏng, Thanh lý | Toàn bộ khu vực **Khuôn mẫu** (Nhật ký, sửa chữa, v.v.) |
| **Phong Ban (Các phòng khác)**| Tài liệu | CHỈ ĐỌC / Tải xuống (Không được sửa/xóa) |

**Cách gán quyền cho nhân viên mới:**
1. Đăng nhập vào trang Quản Lý (`http://localhost:8080`) bằng tài khoản Admin.
2. Bấm vào biểu tượng **Bánh răng (Settings)** ở góc dưới cùng bên trái.
3. Chọn **Users Directory** (Người dùng).
4. Bấm dấu **(+)** để tạo nhân viên mới: Nhập Tên, Email, Mật khẩu. 
5. Quan trọng nhất: Ở mục **Role**, hãy chọn quyền tương ứng trong bảng trên cho nhân viên đó.
6. Gửi Email và Mật khẩu đó cho nhân viên. Khi nhân viên đăng nhập, họ sẽ chỉ nhìn thấy những gì được phép!

### Lưu ý quan trọng
- Khi dùng xong vào cuối ngày, bạn **không cần phải tắt** hệ thống, cứ tắt trình duyệt đi là được. Nó chạy ngầm rất nhẹ.
- Lần sau mở máy tính lên, bạn lại bấm vào file `KHOI_DONG.bat` để bật lại hệ thống lên là xong.

---

## 🌐 HƯỚNG DẪN TRUY CẬP TỪ MÁY KHÁC TRONG XƯỞNG (LAN / WIFI)

Hệ thống được thiết kế để tất cả các máy tính, điện thoại, máy tính bảng dùng chung mạng Wifi/LAN trong xưởng đều có thể truy cập được, không cần cài đặt thêm gì trên các máy con này.

### Bước 1: Lấy địa chỉ IP của máy chủ
1. Trên máy chủ đang chạy hệ thống (máy bạn vừa click file `KHOI_DONG.bat`), bấm nút Windows, gõ `cmd` và ấn Enter.
2. Gõ lệnh `ipconfig` và ấn Enter.
3. Tìm dòng **IPv4 Address** (Ví dụ: `192.168.1.114`). Đây chính là địa chỉ của máy chủ.

### Bước 2: Truy cập từ máy khác (Điện thoại, Laptop)
Mở trình duyệt web (Chrome/Safari) trên máy khác và gõ:
- Để xem Dashboard: `http://192.168.1.114:3000`
- Để vào trang Quản lý (Directus): `http://192.168.1.114:8080`

### 🛡 Lưu ý Quan Trọng Về Tường Lửa (Windows Firewall)
Nếu các máy khác trong xưởng gõ địa chỉ IP như trên mà trình duyệt cứ xoay vòng tròn mãi không vào được, nghĩa là tường lửa của máy chủ đã chặn kết nối. Bạn cần mở cửa (Open Port) trên máy chủ:
1. Bấm nút Windows, gõ `Windows Defender Firewall` -> Chọn **Advanced Settings**.
2. Ở cột bên trái, chọn **Inbound Rules** -> Ở cột bên phải chọn **New Rule...**
3. Chọn **Port** -> Chọn TCP -> Ở ô *Specific local ports* nhập vào: `3000, 3001, 8080, 5432`
4. Bấm Next -> Chọn **Allow the connection** -> Bấm Next liên tục.
5. Ở phần Name, đặt tên là "KM2100 System" -> Finish. 

Bây giờ tất cả điện thoại và máy tính trong xưởng đã có thể truy cập và nhập liệu đồng thời siêu tốc!

---
*Phát triển bởi đội ngũ KM21.00 - Năm 2026*
