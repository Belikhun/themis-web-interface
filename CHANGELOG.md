# Change Logs

- [Thay đổi trong v0.4.6](#thay-đổi-trong-v046)
	- [Thay đổi trong v0.4.5](#thay-đổi-trong-v045)
	- [Thay đổi trong v0.4.4](#thay-đổi-trong-v044)
	- [Thay đổi trong v0.4.3](#thay-đổi-trong-v043)
	- [Thay đổi trong v0.4.2](#thay-đổi-trong-v040)
	- [Thay đổi trong v0.4.1](#thay-đổi-trong-v040)
	- [Thay đổi trong v0.4.0](#thay-đổi-trong-v040)
	- [Thay đổi trong v0.4.0-prerelease](#thay-đổi-trong-v040-prerelease)
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

## Thay đổi trong v0.4.6

* **Bug:** Tăng thêm điểm cho cùng một bài bằng cách nộp với nhiều kiểu tệp
* **Bug:** Lỗi `TypeError: Cannot read property 'contentWindow' of null` khi kì thi đang diễn ra
* **Bug:** Đọc nội dung tệp bị cấm bằng api `/avt/get` và `/avt/change` (RFI)
* **Bug:** Lỗi khi đọc tệp nhật ký với số điểm không có phần thập phân
* **Thêm:** Thêm meta tag vào trang web
* **Thêm:** Lazyload image
* **Thêm:** Giới hạn tên không được vượt quá 34 kí tự
* **Thêm:** Trang riêng cho phần `license`
* **Chỉnh sửa:** Hiển thị thông tin kì thi ở màn hình tải thay vì thông tin dự án
* **Chỉnh sửa:** Chỉnh sửa nút xem nhật ký tại bảng nhật ký
* **Chỉnh sửa:** Hiển thị đúng những dòng chữ bị tràn
* **Chỉnh sửa:** Tăng tốc độ kiểm tra thay đổi ở `rank` và `log`
* **Chỉnh sửa:** Thay đổi thiết kế bảng xếp hạng
* Sửa một số bug, lỗi hiển thị và thêm một số chức năng nhỏ khác~!

### Thay đổi trong v0.4.5

* **Bug:** Trang lỗi hiển thị ở api thay vì hiển thị đoạn json chứa thông tin lỗi
* **Bug:** Lỗi `Undefined Variable: lastmtime` tại `/api/test/logs` khi tắt cài đặt `Cho phép xem nhật ký`
* **Chỉnh sửa:** Chỉnh sửa màu tại bảng rank cho các bài chính xác`
* **Chỉnh sửa:** Chỉnh sửa nút xem nhật ký tại bảng nhật ký`
* Sửa một số bug, lỗi hiển thị và thêm một số chức năng nhỏ

### Thay đổi trong v0.4.4

* **Bug:** Web dừng tải ở một số trình duyệt khác
* **Bug:** Avatar sẽ không bị kéo dãn khi sử dụng hình không phải hình vuông
* **Thêm:** Bật tắt hiển thị `mili giây` trong bảng thời gian
* **Thêm:** Thêm tên cho một số ngôn ngữ
* **Chỉnh sửa:** Thiết kế lại `hamburger icon`
* **Chỉnh sửa:** Thiết kế lại `syslogs viewer`
* **Chỉnh sửa:** Thời gian thay đổi theo thời gian hệ thống thay vì sử dụng `interval`
* **Chỉnh sửa:** `main-panel` giờ không còn thay đổi kích cỡ cùng với `btn-group`
* **Chỉnh sửa API:** API is now `Cross-Origin Resource Sharing`
* **Thêm:** Hiển thị tips và thông tin lỗi khi đang tải

### Thay đổi trong v0.4.3

* **Bug:** Một số lỗi hiển thị ở cửa sổ *xem nhật ký*
* **Bug:** Loại bỏ khoảng trống không mong muốn khi thay đổi kích thước của trình duyệt
* **Thêm:** Mở rộng ô xem đề bài thay vì chỉ mở rộng ảnh đính kèm
* **Thêm:** Cài đặt **Hiệu ứng**, dùng để bật/tắt hiệu ứng trong trang
* **Chỉnh sửa API:** Thay đổi một số biến của test/rank và test/viewlog
* **Chỉnh sửa:** Bảng tải lên sẽ hiển thị tiến trình tải lên của toàn bộ tệp thay vì hiển thị của từng tệp một
* **Chỉnh sửa:** Thay thế tiến trình theo % ở bảng thời gian thành `(thời gian bắt đầu) tới (thời gian kết thúc)`
* **Chỉnh sửa:** Thay đổi màu của một số phần tử
* **Chỉnh sửa:** Thay đổi hiệu ứng của bảng cài đặt
* **Chỉnh sửa:** Loại bỏ scrollbar trong bảng cài đặt
* **Chỉnh sửa:** Viết lại một số đoạn code cũ
* Sửa một số bug, lỗi hiển thị và thêm một số chức năng nhỏ

### Thay đổi trong v0.4.2

* **Bug:** Sửa các lỗi #6 #7 #8 
* **Bug:** Kiểm tra phiên bản mới lỗi khiến code dừng chạy
* **Thêm:** Thông tin địa chỉ máy chủ ở mục Admin
* **Chỉnh sửa:** Viết lại một số đoạn code cũ
* Sửa một số bug khác và thêm một số chức năng nhỏ

### Thay đổi trong v0.4.1

* **Thêm:** Add dark color scheme in login page
* **Thêm:** Now parse the log file to get data instead of showing the raw log file
* **Thêm:** Nhấn vào ảnh đính kèm trong đề bài để xem ảnh với kích cỡ to hơn
* **Thêm cài đặt:** Tiêu đề trang
* **Bug:** Danh sách file public của các đề không hiển thị khi giới hạn thời gian bị tắt
* **Chỉnh sửa:** Viết lại một số đoạn code cũ
* Sửa một số bug khác và thêm một số chức năng nhỏ

## Thay đổi trong v0.4.0 🎉🎉

* Fixed a bug where public file size does not show correctly
* Fixed a bug where `viewLogOther` setting does not updated correctly
* Redesigned error page
* *và các thay đổi ở phiên bản `v0.4.0-prerelease`...*

### Thay đổi trong v0.4.0-prerelease

* Added sounds
* Better disconnected/ratelimited handling (ajax request will wait until we out of ratelimit and then send it again)
* Separated `splash` into a submodule
* Improved version checking
* Improved disconnection handling
* Improved ratelimited handling
* Improved splashscreed
* Added Dark Mode
* Added 3 Settings:
	* Bài nộp lên phải có trong danh dách đề bài
	* Cho phép xem tệp nhật ký của người khác
	* Rate Limit
* Added Logging user event
* Public file browser/download
* Added file attachment in problem
* Fixed a `serious bug` where user can view problem directly

### Thay đổi trong v0.3.7

* Thiết kế lại user_settings
* Chuyển hai bảng cài đặt cho admin vào user_settings
* Sửa lỗi không xem được nhật kí khi chưa đăng nhập
* Xóa bỏ một số tệp không cần thiết
* Thêm kiểm tra phiên bản

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
