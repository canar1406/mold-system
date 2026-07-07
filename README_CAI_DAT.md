# 🚀 Hướng Dẫn Cài Đặt Hệ Thống Lên Máy Chủ Khách Hàng

Toàn bộ hệ thống quản lý khuôn đúc KM21.00 (bao gồm cả dữ liệu lịch sử) đã được đóng gói hoàn chỉnh thành một khối độc lập (Portable). Bạn chỉ cần thực hiện 3 bước đơn giản dưới đây trên máy tính của khách hàng.

## Bước 1: Copy Toàn Bộ Dự Án
- Copy thư mục `mold-system` (đang chứa file này) vào một ổ đĩa trên máy tính của khách hàng (ví dụ `D:\mold-system`).
- Lưu ý: Dữ liệu hơn 228.000 dòng đã được nén sẵn bên trong thư mục `init-scripts/04_data_dump.sql`, **không cần** phải chạy lại mã Python hay cần file Access gốc nữa!

## Bước 2: Cài Đặt Docker Desktop (Nếu máy khách chưa có)
Hệ thống chạy trên nền tảng ảo hóa Docker siêu nhẹ, đảm bảo không bao giờ xung đột phần mềm với máy khách.
1. Tải và cài đặt **Docker Desktop** cho Windows từ trang chủ: `https://www.docker.com/products/docker-desktop/`
2. Khởi động Docker Desktop (Cần khởi động lại máy tính nếu được yêu cầu).

## Bước 3: Khởi Động Hệ Thống
1. Mở **PowerShell** hoặc **Command Prompt (CMD)**.
2. Di chuyển vào thư mục dự án bằng lệnh:
   ```cmd
   cd D:\mold-system
   ```
3. Chạy lệnh ma thuật sau để hệ thống tự động bung toàn bộ ra:
   ```cmd
   docker-compose up -d
   ```
*(Lưu ý: Lần chạy đầu tiên sẽ mất khoảng 1-2 phút để tải file cài đặt và bung 42MB dữ liệu lịch sử vào Database)*.

---

## 🎯 Hoàn Tất! Các Link Truy Cập
Khi câu lệnh báo `Done`, hệ thống đã sẵn sàng.

* **💻 Truy cập từ chính máy chủ này:**
  - Nhập liệu (NocoDB): `http://localhost:8080` (Mật khẩu admin: `Admin@KM2100!`)
  - Xem Dashboard: `http://localhost:3000`

* **📱 Truy cập từ các máy/điện thoại khác trong xưởng:**
  - Lấy IP của máy chủ (Mở CMD gõ `ipconfig`, tìm dòng IPv4 Address, ví dụ `192.168.1.114`).
  - Nhập liệu (NocoDB): `http://192.168.1.114:8080`
  - Xem Dashboard: `http://192.168.1.114:3000`

---
> **Lưu ý Quan Trọng Về Tường Lửa (Windows Firewall)**
> Nếu các máy khác trong xưởng không truy cập được (bị xoay vòng xoay mãi), bạn cần mở cổng (Open Port) trên máy chủ:
> 1. Bấm nút Windows, gõ `Windows Defender Firewall` -> Advanced Settings.
> 2. Chọn **Inbound Rules** -> **New Rule**.
> 3. Chọn **Port** -> TCP -> Nhập vào các số: `3000, 3001, 8080, 5432` -> Allow the connection -> Đặt tên là "KM2100 System" -> Finish.
