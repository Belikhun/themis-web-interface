# Themis Web Interface

<p align="center">
  <img src="https://lh3.googleusercontent.com/GGuTHy37pp8qJTtirJQL-jQw4GHlsKfCTAt8_NHsmy3jTquS3AYcODCvEXvYH1hBz6Wm43NV__l6zTsAX9izIeiOe_aysK-LKYBtHZce5j5mkMp-yqfm270_NEmVLqoZLmn7pbpCPw=w2400">
</p>

Được viết bằng PHP và JavaScript. Dự án không sử dụng library khác như jQuery, Bootstrap,...

- [Yêu cầu](##Yêu-cầu)
- [Tính năng](##Tính-năng)
- [Cài đặt](##Cài-đặt)
- [Cấu hình](##Cấu-hình)
  - [config.php](###config.php)
  - [Tài khoản](###Tài-khoản)
- [Cập nhật 0.0.2](###Thay-đổi-trong-0.0.2)

## Yêu cầu
- PHP/7 trở lên
- Apache/2 trở lên

## Tính năng
### Nộp nhiều bài cùng lúc với 1 lần kéo thả tệp

<p align="center"><img src="https://lh3.googleusercontent.com/K4qASNz9XrcPx6LvGQzoKzq5ypenBTL9LmhKvENALO08O3t1XyNrvo4DT5W1iBzQAEi1mtkn6g9JrgADa12aw2DTMY5a_2989wNrq0D37s6BsEI5GwR8QBZ_N_Y91rgzx1VYYFQbTg=w2400"></p>

### Hiện thời gian làm bài của kỳ thi

<p align="center"><img src="https://lh3.googleusercontent.com/nWQj7AcZSnGXrquFEPTgtDDaylu70aRXy_hrcIv1WUtjDvUlpI7BVDibCTbJ4gktebBoKA5uulDjYW_Jn3HQ1sP6l8tc4KpL0cBGpN5wy4KLN8kqYgyeLZPRanOWIt5chfrLWqDuWw=w2400"></p>

### Nhật ký nộp bài hiển thị tình trạng nộp bài và kết quả sau khi chấm

<p align="center"><img src="https://lh3.googleusercontent.com/l_W7bR4g31DmM38foYihj7UfgGJ0dquxveTO2DDKDT4E3SROfM4ZnAjKQgw50bX51yxGJQijH4aEYowxMDjZOUoKxC5dgDEyWNoyUuiQUjhYOX5FnC1fonDM_xHBHCOO8N3RuLxCAQ=w2400">

### Bảng xếp hạng được cập nhật tự động và sắp xếp thí sinh theo tổng số điểm tất cả bài thi

<p align="center"><img src="https://lh3.googleusercontent.com/6pyA8354I1jpCOXyreTGZ_-CFna3AOeI6Ar7E11EhpatMUCX85aZkJtIqhF3NN6mTctImoeYdjXhCAkEWOWRTTfy44emkHtyCbzMFVKecdqjaaKkdR92NSaIP-boE-eoasKhdgVx5w=w2400">

### Người dùng có thể thay đổi ảnh đại diện, tên và mật khẩu (có thể tắt trong file config)

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

### config.php

Hầu hết cấu hình đều có ở trong tệp ```config.php``` , bao gồm:
* Tên kì thi
* Mô tả kì thi
* Thư mục lưu bài
* Thư mục log của themis
* Thời gian bắt đầu kì thi
* Thời gian làm bài
* Thời gian bù
* Ẩn kết quả sau khi chấm
* Cho phép thay đổi thông tin

### Tài khoản

Tài khoản được lưu trong tệp ```api/xmldb/account.xml``` và có thể chỉnh sửa bằng excel.

## Thay đổi trong 0.0.2

* Cho phép tải nhiều bài cùng lúc và hiện các bài đang trong hàng chờ
* Hiển thị tình trạng hiện tại của bài đã nộp
* Xem tệp nhật kí trực tiếp trên trang mà không cần tải về

<p align="center"><img width="500px" src="https://lh3.googleusercontent.com/QQhIMvi7V8PTzXz_C-r6TZ21LgK73hTVUtX9VXgCoqWXkSZJVPRbJJPHug24Fce9nHY_a7ZXBpglli4cOdnlJ2vHKdwvNllMoHIDd-ZcwDaWR6PMCjjVewON1oqPt9CSlPgf1__joQ=w2400">

* Vá các lỗ hổng bảo mật:
  * XSS
  * LFI/RFI
  * Slowloris DoS

## Todo

- [ ] Clean code
- [ ] Tìm và vá các lỗ hổng bào mật
