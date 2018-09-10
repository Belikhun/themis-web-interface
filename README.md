# Themis Web Interface

<p align="center">
  <img src="https://lh3.googleusercontent.com/Kq44rw8L_8-4NbWNAektkXXMnh_6nl57w1dTpms74HlvdHtSIbvXKgiApsoE3RcapN6-tERQ9kZQMPSMg1LkvwMP4TaMS86-UOnyGI1-kG8NfrbvqHzndP5mYylqSJ6Vb941CdXHZw=w2400">
</p>

Được viết bằng HTML, CSS, PHP và JavaScript. Dự án không sử dụng library khác như jQuery, Bootstrap,...

- [Demo](#demo)
- [Yêu cầu](#yêu-cầu)
- [Tính năng](#yính-năng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
  - [config.php](#config.php)
  - [Tài khoản](#tài-khoản)
- [Cập nhật v0.3.0](#thay-đổi-trong-v030)
- [Cập nhật v0.2.0](#thay-đổi-trong-v020)
  - [Cập nhật v0.2.1](#thay-đổi-trong-v021)
  - [Cập nhật v0.2.2](#thay-đổi-trong-v022)
  - [Cập nhật v0.2.3](#thay-đổi-trong-v023)
- [API Document](#api-document)
- [Ảnh chụp màn hình](#screenshot)

## Demo
* Link: [000webhost](https://tweb-demo.000webhostapp.com/)
* Tài khoản:

| id    | username | password |
|-------|----------|----------|
| admin | admin    |   admin  |
| 1     | user1    | 123456   |
| 2     | user2    | 123456   |

* Lưu ý:
  - Chức năng thay đổi mật khẩu và thay đổi thư mục upload đã tắt.
  - Bài nộp lên sẽ không được Themis chấm.

## Yêu cầu
- PHP/7 trở lên
- Apache/2 trở lên

## Tính năng
* Nộp nhiều bài cùng lúc với 1 lần kéo thả tệp

<p align="center"><img src="https://lh3.googleusercontent.com/K4qASNz9XrcPx6LvGQzoKzq5ypenBTL9LmhKvENALO08O3t1XyNrvo4DT5W1iBzQAEi1mtkn6g9JrgADa12aw2DTMY5a_2989wNrq0D37s6BsEI5GwR8QBZ_N_Y91rgzx1VYYFQbTg=w2400" width="600px"></p>

* Hiện thời gian làm bài của kỳ thi

<p align="center"><img src="https://lh3.googleusercontent.com/nWQj7AcZSnGXrquFEPTgtDDaylu70aRXy_hrcIv1WUtjDvUlpI7BVDibCTbJ4gktebBoKA5uulDjYW_Jn3HQ1sP6l8tc4KpL0cBGpN5wy4KLN8kqYgyeLZPRanOWIt5chfrLWqDuWw=w2400" width="600px"></p>

* Nhật ký nộp bài hiển thị tình trạng nộp bài và kết quả sau khi chấm

<p align="center"><img src="https://lh3.googleusercontent.com/l_W7bR4g31DmM38foYihj7UfgGJ0dquxveTO2DDKDT4E3SROfM4ZnAjKQgw50bX51yxGJQijH4aEYowxMDjZOUoKxC5dgDEyWNoyUuiQUjhYOX5FnC1fonDM_xHBHCOO8N3RuLxCAQ=w2400" width="400px"></p>

* Bảng xếp hạng được cập nhật tự động và sắp xếp thí sinh theo tổng số điểm tất cả bài thi

<p align="center"><img src="https://lh3.googleusercontent.com/6pyA8354I1jpCOXyreTGZ_-CFna3AOeI6Ar7E11EhpatMUCX85aZkJtIqhF3NN6mTctImoeYdjXhCAkEWOWRTTfy44emkHtyCbzMFVKecdqjaaKkdR92NSaIP-boE-eoasKhdgVx5w=w2400" width="600px"></p>

* Xem trực tiếp tệp nhật kí

<p align="center"><img width="600px" src="https://lh3.googleusercontent.com/QQhIMvi7V8PTzXz_C-r6TZ21LgK73hTVUtX9VXgCoqWXkSZJVPRbJJPHug24Fce9nHY_a7ZXBpglli4cOdnlJ2vHKdwvNllMoHIDd-ZcwDaWR6PMCjjVewON1oqPt9CSlPgf1__joQ=w2400"></p>

* Người dùng có thể thay đổi ảnh đại diện, tên và mật khẩu

* Mobile Responsive

## Cài đặt
Bạn có thể tải trực tiếp phiên bản tích hợp sẵn UniServer tại [đây](https://github.com/belivipro9x99/themis-webinterface/releases/) hoặc ```git clone``` repository này và thiết lập máy chủ riêng.

Apache config:
```
ErrorDocument 400 /lib/error.php
ErrorDocument 401 /lib/error.php
ErrorDocument 403 /lib/error.php
ErrorDocument 404 /lib/error.php
ErrorDocument 405 /lib/error.php
ErrorDocument 406 /lib/error.php
ErrorDocument 408 /lib/error.php
ErrorDocument 414 /lib/error.php
ErrorDocument 500 /lib/error.php
ErrorDocument 502 /lib/error.php

<Directory "(apache2 document root)/api">
  Options +FollowSymLinks -Indexes
  AllowOverride All
  Order allow,deny
  Allow from all
  Require all granted

  # Rewrite url
  RewriteEngine on
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^([^\.]+)$ $1.php [NC,L]
</Directory>

<Directory "(apache2 document root)/api/xmldb">
  Options -Indexes
  Deny from all
</Directory>

<IfModule mod_reqtimeout.c>
  RequestReadTimeout header=20-40,MinRate=500 body=20,MinRate=500
</IfModule>
```

## Cấu hình

### Trực tiếp bằng bảng cài đặt

Bạn có thể thay đổi cấu hình trực tiếp trong bảng cài đặt dành cho admin

<p align="center"><img width="600px" src="https://lh3.googleusercontent.com/V7p7mqyv0MBoG72XGJ4kXJ9qjP6-3jagKmyaP1frz0I-f6BnNdBOeD-B9Se5dpj9Rwe_YqAE1XhHP7tcalAymVPq7dhr_MQvWgTMnlc9PcSwsxASSj2DvyqMcZEjmTRsR7CjKDIZ_A=w2400"></p>

* Yêu cầu: ID của tài khoản (không phải username) là ```admin```, nếu không sẽ không có quyền truy cập.

### data/config.json

Hầu hết cấu hình đều có ở trong tệp ```data/config.json``` , bao gồm:
* Tên kì thi
* Mô tả kì thi
* Thư mục lưu bài
* Thời gian bắt đầu kì thi
* Thời gian làm bài
* Thời gian bù
* Công bố kết quả sau khi chấm
* Cho phép nộp bài
* Cho phép thay đổi thông tin
* Cho phép xem nhật ký chấm

### Tài khoản

Tài khoản được lưu trong tệp ```api/xmldb/account.xml``` và có thể chỉnh sửa bằng excel.

## Thay đổi trong v0.3.0

* Chuyển định dạng tệp config thành json.
* Thêm bảng cài đặt dành cho admin.
* Sửa một số lỗi.

## Thay đổi trong v0.2.0

* Cho phép tải nhiều bài cùng lúc và hiện các bài đang trong hàng chờ
* Hiển thị tình trạng hiện tại của bài đã nộp
* Xem tệp nhật kí trực tiếp trên trang mà không cần tải về
* Vá các lỗ hổng bảo mật:
  * XSS
  * LFI/RFI
  * Slowloris DoS

### Thay đổi trong v0.2.1

* API now require a token
* Vá các lỗ hổng bảo mật:
  * CSRF

### Thay đổi trong v0.2.2

* Sửa lỗi hiển thị tình trạng bài nộp không chính xác.

### Thay đổi trong v0.2.3

* Sửa một số lỗi.

## API Document

Coming soon...

## Screenshot

<p align="center"><img src="https://lh3.googleusercontent.com/T2LPaA2KKX_P2BbDFOqz6MRgXDi6xll12Hqnq9yXngdlNjRPH81_1QVrc0dO3PZ2Qidq5-AVnWMpTR5M8nKnLc92x398vjutnDaM0IM7UhgXJWsgUIbdmqW3reKcQVMLg92N3wmopw=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/BeZ5x6wXr4mNsujNBAWZtR8Tpigv7pDhtJd8GDbKiO7M2eZjWMn07QWMJkN5_RlEuc2iGNOEQHFSYa34fXhsZZpx8CkbatRBFBvvwldR-06x307lTnT-4_vsIHDRcYkUI1Ynfn3acQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/V01itVgLIwZ5G3rm4LIMq806p-saWwyaBKXY74kbTNOqW3txo4K1hZ1klPSysCFqWm7xch7_hfvZCk6PiHx8NREytyb9Q51hFSSSR26dX0AqjOgleRs56iJ5eT52Q25NwC-j3h8wsw=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/i_cf0jGmO3j3t2jMpADWwJ9l7bJvHHkWyGsFRfu2Dm5WVTi9JSADlMSySGfgpEOK1GP_yV8C1z-2_CTxVGx4-73hunPmdIEa5j79_zBlgM2hj5kKEE1RnHzUi4q5qyo3IBJcScKNGw=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/P0eY3CqreDbQCZTwofOG45FvG0U5fuZmnHWeXfeJnGXloHwnGeg2WTwSl00OOdhVOszs6cgxbLAwUBuLLTHau4cYoFlocUk17qAo2J8WP3uKNJqvfHDopY56Yqs-nHPCrwCGsyz-WQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/EVndQX11gR5D7v1pAcOFDXLDixPevqahUBCYsi3DwDqGU4xNQ0O7PZN1vkuHbk31XpxVEdlsyGV1Tvxr3DMKCwLG5HebbJmagP9G2mNDWUd_rNIVw9aMvPpagTWZTFoJ1TLq5ecOAQ=w2400"></p>

## Todo

- [ ] Clean code
- [ ] Tìm và vá các lỗ hổng bào mật (?)
