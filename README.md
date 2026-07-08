# HỆ THỐNG QUẢN LÝ KHUÔN ĐÚC (KM21.00)

Hệ thống quản lý khuôn đúc phiên bản Web hiện đại, được chuyển đổi từ Microsoft Access cũ sang nền tảng công nghệ mới nhất. Hệ thống có khả năng xử lý hàng vạn dòng dữ liệu siêu tốc, bảo mật phân quyền tuyệt đối và đi kèm biểu đồ thống kê trực quan.

---

## 🎉 CÁC TÍNH NĂNG MỚI NHẤT VỪA CẬP NHẬT
- **Giao diện đẳng cấp (Logo & Bố cục):** Đã bổ sung Logo công ty với hiệu ứng bóng mờ nổi bật ở chính giữa. Thanh cuộn (scrollbar) được dời ra sát lề phải màn hình giúp thao tác cuộn chuột mượt mà và trực quan hơn.
- **Bảng con thông minh (Subdatasheet):** Khắc phục triệt để lỗi "sổ ra 1 đống" khi tải dữ liệu lịch sử. Bảng con nay có thanh cuộn riêng, giới hạn chiều cao tối đa 250px và tự động đóng bảng cũ khi mở bảng mới.
- **Khóa an toàn thông minh (Auto-Lock):** Các tính năng/bảng số liệu chưa được nâng cấp dữ liệu sẽ tự động chuyển thành hình Ổ khóa màu xám và vô hiệu hóa. Các nút thao tác phần Thanh Lý được khóa mờ màu vàng chuyên nghiệp theo đúng yêu cầu bảo mật.
- **Lọc dữ liệu chính xác tuyệt đối:** Khi tìm kiếm mã khuôn cụ thể, hệ thống giờ đây trả về kết quả chính xác 100%, khắc phục tình trạng truy vấn dư thừa.

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

## 🌐 HƯỚNG DẪN TRUY CẬP TỪ ĐIỆN THOẠI / MÁY KHÁC (LAN / WIFI)

Hệ thống được thiết kế để tất cả các máy tính, điện thoại, máy tính bảng dùng chung mạng Wifi/LAN trong xưởng đều có thể truy cập được siêu tốc!

Để mở khóa truy cập cho các máy khác, bạn **không cần làm thủ công**, chỉ cần làm 2 bước sau:

**Bước 1: Chạy công cụ tự động**
- Vào thư mục `mold-system`.
- Nháy chuột phải vào file **`MO_PORT_LAN.bat`** -> Chọn **Run as Administrator**.
- Công cụ sẽ tự động mở khóa Tường lửa (Firewall) và dò tìm địa chỉ IP của máy bạn.

**Bước 2: Quét mã QR Code**
- Ngay sau đó, một bức ảnh **mã QR Code** sẽ tự động bật lên giữa màn hình máy tính của bạn.
- Bạn (hoặc nhân viên) chỉ cần lấy điện thoại (nhớ kết nối chung Wifi với máy tính), mở Camera lên và **quét mã QR này**.
- Điện thoại sẽ tự động mở trang Dashboard! 

*(Nếu không quét được QR, màn hình đen của công cụ cũng có in sẵn đường link (Ví dụ: `http://192.168.1.114:3000`) để bạn gõ tay vào trình duyệt máy tính/điện thoại khác).*

Bây giờ tất cả điện thoại và máy tính trong xưởng đã có thể truy cập và nhập liệu đồng thời!

---
*Phát triển bởi đội ngũ KM21.00 - Năm 2026*
