# Change Logs

- [Thay đổi trong v0.3.7](#thay-đổi-trong-v037)
  - [Thay đổi trong v0.3.6](#thay-đổi-trong-v036)
  - [Thay đổi trong v0.3.5](#thay-đổi-trong-v035)
  - [Thay đổi trong v0.3.4](#thay-đổi-trong-v034)
  - [Thay đổi trong v0.3.3](#thay-đổi-trong-v033)
  - [Thay đổi trong v0.3.2](#thay-đổi-trong-v032)
  - [Thay đổi trong v0.3.1](#thay-đổi-trong-v031)
  - [Thay đổi trong v0.3.0](#thay-đổi-trong-v030)
  - [Thay đổi trong v0.2.3](#thay-đổi-trong-v023)
  - [Thay đổi trong v0.2.2](#thay-đổi-trong-v022)
  - [Thay đổi trong v0.2.1](#thay-đổi-trong-v021)
  - [Thay đổi trong v0.2.0](#thay-đổi-trong-v020)

---

### Thay đổi trong v0.3.7

* Thiết kế lại user_settings
* Chuyển hai bảng cài đặt cho admin vào user_settings
* Sửa lỗi không xem được nhật kí khi chưa đăng nhập
* Xóa bỏ một số tệp không cần thiết

### Thay đổi trong v0.3.6

* Thiết kế lại một số thành phần của trang web
* Sửa một số lỗi
* Cho phép xem tệp nhật kí của người khác

### Thay đổi trong v0.3.5

* Ẩn danh sách đề bài trước khi kì thi bắt đầu.
* Chuyển đổi toàn bộ ảnh về định dạng webp.

### Thay đổi trong v0.3.4

* Cho phép xem thời gian và xếp hạng mà không cần đăng nhập
* Tách riêng trang chủ và bảng điều khiển cho admin
* Sửa lỗi tài khoản khác mất điểm sau khi nộp bài
* Chỉnh sửa màu

### Thay đổi trong v0.3.3

* Sửa lỗi hiển thị thanh quá trình tải lên
* Thêm bảng đề bài
* Thêm problems API
* Sửa một số bug

### Thay đổi trong v0.3.2

* Một số chỉnh sửa cho API
* Thay đổi ảnh nền footer và errorpage
* Thêm apiexample
* Thên API Document trong Wiki

### Thay đổi trong v0.3.1

* Thiết kế lại user profile
* Sửa lỗi hiển thị sai thời gian khi số giây vượt quá 86400
* Sửa lại hiệu ứng trang đăng nhập
* Sửa lỗi hiển thị trang chính và trang đăng nhập trên điện thoại

### Thay đổi trong v0.3.0

* Chuyển định dạng tệp config thành json.
* Thêm bảng cài đặt dành cho admin.
* Sửa một số lỗi.

### Thay đổi trong v0.2.3

* Sửa một số lỗi.

### Thay đổi trong v0.2.2

* Sửa lỗi hiển thị tình trạng bài nộp không chính xác.

### Thay đổi trong v0.2.1

* API now require a token
* Vá các lỗ hổng bảo mật:
  * CSRF

### Thay đổi trong v0.2.0

* Cho phép tải nhiều bài cùng lúc và hiện các bài đang trong hàng chờ
* Hiển thị tình trạng hiện tại của bài đã nộp
* Xem tệp nhật kí trực tiếp trên trang mà không cần tải về
* Vá các lỗ hổng bảo mật:
  * XSS
  * LFI/RFI
  * Slowloris DoS
