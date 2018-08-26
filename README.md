# Themis Web Interface

<p align="center">
  <img src="https://lh3.googleusercontent.com/MSVW2BqWe44tFatuXLEB6h09rRmJoyLHHTnkXk5sdShgmyaYTuXmuUbx1gMROmKBMrVr59D82mTR514gxR5I5Z9L8qy60OVbtQ3PWy7ip2GvWrYBRYrDOfUsxzkfzCuggMmT4T5Y3g=w2400">
</p>

Được viết bằng PHP và JavaScript. Dự án không sử dụng library khác như jQuery, Bootstrap, etc...

- [Yêu cầu](##Yêu-cầu)
- [Tính năng](##Tính-năng)
- [Cài đặt](##Cài-đặt)
- [Cấu hình](##Cấu-hình)
  - [config.php](###config.php)
  - [Tài khoản](###Tài-khoản)

## Yêu cầu
- PHP/7 trở lên
- Apache/2 trở lên

## Tính năng
### Nộp bài làm bằng cách kéo-thả tệp

<p align="center"><img src="https://lh3.googleusercontent.com/eq1Abpp_hyOW9zYVYyeAkXfb-xA01JWuZ7lXoTHujMA4YqcAkv0PWRSjQXyrCwkdLjrV4pKkHCe6jmIYjAdKPk-1ys8xqZzSoGExIX2rK8-wCRAR5lw0VDr94LR-4lKKUwOpFwULyQ=w2400"></p>

### Hiện thời gian làm bài của kỳ thi

<p align="center"><img src="https://lh3.googleusercontent.com/nWQj7AcZSnGXrquFEPTgtDDaylu70aRXy_hrcIv1WUtjDvUlpI7BVDibCTbJ4gktebBoKA5uulDjYW_Jn3HQ1sP6l8tc4KpL0cBGpN5wy4KLN8kqYgyeLZPRanOWIt5chfrLWqDuWw=w2400"></p>

### Nhật ký nộp bài và bảng xếp hạng được cập nhật tự động

<p align="center"><img src="https://lh3.googleusercontent.com/3441RgXTaNUqoi7gx0StDhhl9ODaQ1vPZuO4S5Cbj0MQs3LHPzMLDXHkhUpds_v2goUOf1NtOUSPjZ-6FunuteHBrH2rDIPEFCincv9z-QaebQPiPgQS2aHjA5HPJkO_oGezdD3Rnw=w2400">
<p align="center"><img src="https://lh3.googleusercontent.com/6pyA8354I1jpCOXyreTGZ_-CFna3AOeI6Ar7E11EhpatMUCX85aZkJtIqhF3NN6mTctImoeYdjXhCAkEWOWRTTfy44emkHtyCbzMFVKecdqjaaKkdR92NSaIP-boE-eoasKhdgVx5w=w2400">

### Người dùng có thể thay đổi ảnh đại diện, tên và mật khẩu (có thể tắt trong file config)

## Cài đặt
Bạn có thể tải trực tiếp phiên bản tích hợp sẵn UniServer tại [đây](http://www.mediafire.com/file/vzcc6c865rzf1g7/themis-interface%20v0.0.1%20unstable.zip) hoặc ```git clone``` repositories này và thiết lập máy chủ riêng.

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
```

## Cấu hình

### config.php

Hầu hết cấu hình đều có ở trong tệp ```config.php``` , trong tệp bao gồm:
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
