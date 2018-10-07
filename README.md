<p align="center">
  <img src="https://lh3.googleusercontent.com/Kq44rw8L_8-4NbWNAektkXXMnh_6nl57w1dTpms74HlvdHtSIbvXKgiApsoE3RcapN6-tERQ9kZQMPSMg1LkvwMP4TaMS86-UOnyGI1-kG8NfrbvqHzndP5mYylqSJ6Vb941CdXHZw=w2400">
</p>

Themis Web Interface là giải pháp tổ chức và quản lí kì thi tin học giúp thí sinh có thể nộp bài, theo dõi kết quả qua LAN hoặc WAN.

Dự án sử dụng các ngôn ngữ HTML, CSS, PHP và JavaScript, không sử dụng các library khác như jQuery, Bootstrap, React,...

- [Demo](#demo)
- [Yêu cầu](#yêu-cầu)
- [Tính năng](#yính-năng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
  - [config.php](#config.php)
  - [Tài khoản](#tài-khoản)
- [API Document](#api-document)
- [Ảnh chụp màn hình](#screenshot)
- [Cập nhật v0.3.3](#thay-đổi-trong-v033)
  - [Cập nhật v0.3.2](#thay-đổi-trong-v032)
  - [Cập nhật v0.3.1](#thay-đổi-trong-v031)
  - [Cập nhật v0.3.0](#thay-đổi-trong-v030)
  - [Cập nhật v0.2.3](#thay-đổi-trong-v023)
  - [Cập nhật v0.2.2](#thay-đổi-trong-v022)
  - [Cập nhật v0.2.1](#thay-đổi-trong-v021)
  - [Cập nhật v0.2.0](#thay-đổi-trong-v020)
- [Contributor](#contributor)

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
  - php_xml (```apt install php-xml```)
- Apache/2 trở lên

## Tính năng
* Nộp nhiều bài cùng lúc với 1 lần kéo thả tệp

<p align="center"><img src="https://lh3.googleusercontent.com/K4qASNz9XrcPx6LvGQzoKzq5ypenBTL9LmhKvENALO08O3t1XyNrvo4DT5W1iBzQAEi1mtkn6g9JrgADa12aw2DTMY5a_2989wNrq0D37s6BsEI5GwR8QBZ_N_Y91rgzx1VYYFQbTg=w2400" width="600px"></p>

* Danh sách đề bài được liệt kê trực tiếp

<p align="center"><img src="https://lh3.googleusercontent.com/R2lFhbW5KwjzQjQqJ-pdpBJRFn3_6agAxf5bSNgB0dq-EJwlSilVfXnmHreAbBlNQk96EkHKJN9qYC-mlh0L3yAGcsuUoeE5OVUSXe7CucjwmpX_CJtbhz42nJM8t30WnA8rtfstxg=w2400" width="400px"></p>
<p align="center"><img src="https://lh3.googleusercontent.com/gDQ_bUkUE2Jc-DEN0TQy6ER8X5Au6LB2s1myw48f2inzX35tudsIDbZcBBcfF7Mvyru275hd6uUmq-l3wJKmMj9DLVriES9hJc6I0VgeOct94QXpXQJFs9AXWkFPdY2zHJe_AExKyQ=w2400" width="400px"></p>

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

## Tải về & Cài đặt
Bạn có thể tải trực tiếp phiên bản tích hợp sẵn UniServer ở phần [releases](https://github.com/belivipro9x99/themis-webinterface/releases/), sau đó giải nén tệp zip vừa tải về. Để khởi động máy chủ chạy tệp UniController.exe sau đó nhấn Start Apache.

Hoặc ```git clone``` repository này và thiết lập máy chủ riêng.

Apache configuration:
```
<VirtualHost *:80>
  ServerAdmin someone@localhost
  ServerName localhost
  ServerAlias themisweb.lan
  DocumentRoot (document root)

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

  <Directory "(document root)">
    Options -Indexes
    AllowOverride All
    Order allow,deny
    Allow from all
    Require all granted
  </Directory>

  <Directory "(document root)/api">
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

  <Directory "(document root)/data/xmldb">
    Options -Indexes
    Deny from all
  </Directory>

  <IfModule mod_reqtimeout.c>
    RequestReadTimeout header=20-40,MinRate=500 body=20,MinRate=500
  </IfModule>

  ErrorLog ${APACHE_LOG_DIR}/error.log
  CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```
**Trong đó**: ```(document root)``` là thư mục chứa toàn bộ tệp tin của dự án.

## Cấu hình

### Trực tiếp bằng bảng cài đặt

Bạn có thể thay đổi cấu hình trực tiếp trong bảng cài đặt dành cho admin

<p align="center"><img width="600px" src="https://lh3.googleusercontent.com/V7p7mqyv0MBoG72XGJ4kXJ9qjP6-3jagKmyaP1frz0I-f6BnNdBOeD-B9Se5dpj9Rwe_YqAE1XhHP7tcalAymVPq7dhr_MQvWgTMnlc9PcSwsxASSj2DvyqMcZEjmTRsR7CjKDIZ_A=w2400"></p>

* Yêu cầu: ID của tài khoản (không phải username) là ```admin```, nếu không sẽ không có quyền truy cập.

### config.json

Cấu hình được lưu tại tệp ```data/config.json```, bao gồm:
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

Dữ liệu tài khoản được lưu tại ```data/xmldb/account.xml```. Có thể sử dụng các trình soạn thảo như Excel để chỉnh sửa.

## API Document

API giúp bạn có thể giao tiếp với hệ thống mà không cần phải sử dụng trang web nộp bài. Do đó bạn có thể viết một chương trình chạy phía client trong trường hợp trang web nộp bài không hoạt động.

Toàn bộ Document đều có ở trong [wiki](https://github.com/belivipro9x99/themis-web-interface-reloaded/wiki) của dự án.

## Screenshot

<p align="center"><img src="https://lh3.googleusercontent.com/6oJb7OJ3Ess9PhQzbKF1hNyt2Pf1gftCo2NEC-WG4qQFpVDno2oPP_druUg73IPZCKQ6ZS21PkF2rrcgC-78LIpzcwQDmO37e4fyT1FUAMiufRbUIRkpYEyoGc0s4OeijZzUhFkA-A=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/0qI_1fJ24CgWRDGC9nHKBCZZQG5PjekiYWf95DK5O_goP1vy-RVUk5AH48ORMYBEs7F62R4nlyatDlBx7a5p5u2ioCIAQQu7mtGhmlLNRTmn9ziPCdkNQdF8NuzAzhlj9a3WO8oUcQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/V01itVgLIwZ5G3rm4LIMq806p-saWwyaBKXY74kbTNOqW3txo4K1hZ1klPSysCFqWm7xch7_hfvZCk6PiHx8NREytyb9Q51hFSSSR26dX0AqjOgleRs56iJ5eT52Q25NwC-j3h8wsw=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/_QIWVoc3GY1M-ZgXO-FFgUo0RKwEtMkYP8syCKJzJvVjkygWgfLSMlm2OrhRXN9hNJmfJdezU8Kb2xOgiu99LLu5ohH7fb7ZltjnBsCSG5yz8QrCxMr6S6dwCNtYuUZVLHXaIWMhtA=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/mjse5RHXz8G5GLPA-zIKY1WUSq5PuEXj0vnozRFFzvktMn8ziky--FJf4Kk0dLrbIVdb711kye7yDcwcCsofZxG9LWJ3EIssdJ8zSoqVgkrtSjx3VUNDWxfJN4JhtHxPXOrTYz8MDA=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/P0eY3CqreDbQCZTwofOG45FvG0U5fuZmnHWeXfeJnGXloHwnGeg2WTwSl00OOdhVOszs6cgxbLAwUBuLLTHau4cYoFlocUk17qAo2J8WP3uKNJqvfHDopY56Yqs-nHPCrwCGsyz-WQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/EVndQX11gR5D7v1pAcOFDXLDixPevqahUBCYsi3DwDqGU4xNQ0O7PZN1vkuHbk31XpxVEdlsyGV1Tvxr3DMKCwLG5HebbJmagP9G2mNDWUd_rNIVw9aMvPpagTWZTFoJ1TLq5ecOAQ=w2400"></p>

## Thay đổi trong v0.3.3

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

## Contributor

Many thanks to ```namkojj```, aka [Nam](https://www.facebook.com/profile.php?id=100008107446343) for helping me translating, hunting bug and testing this project.