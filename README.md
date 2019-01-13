<p align="center">
  <img src="https://lh3.googleusercontent.com/UJ9p8wcOqInslW4xWpJ6ZQ55Lx6DXN85MJvGoLl0G3WroDqQExDdovbLXuD1rg8C3mGxyyRkheWK4t2soF9HcWsxNXgO0lK_iq_iqvwvXz2Bu5JWmPHhbiesqYziSVitpkWSo7P51A=w2400">
</p>

<p align="center">
	<a href="https://github.com/belivipro9x99/themis-webinterface/releases/"><img src="https://img.shields.io/badge/release-v0.3.6-brightgreen.svg?longCache=true&style=popout-square"></a>
	<img src="https://img.shields.io/badge/license-MIT-orange.svg?longCache=true&style=popout-square">
	<img src="https://img.shields.io/badge/status-not tested-blue.svg?longCache=true&style=popout-square">
</p>

---

**Themis Web Interface** là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập và tổ chức kì thi trở nên dễ dàng hơn.

**Themis Web Interface** giúp học sinh nộp bài tới phần mềm chấm điểm **[Themis](https://dsapblog.wordpress.com)** và theo dõi kết quả chấm điểm qua LAN hoặc WAN.

**Themis Web Interface** được viết bằng các ngôn ngữ **HTML, CSS, PHP và JavaScript**. Dự án không sử dụng các library khác như **jQuery, Bootstrap, React, ...**

- [Demo](#demo)
- [Yêu cầu](#yêu-cầu)
- [Tính năng](#tính-năng)
- [Tải về & Cài đặt](#tải-về--cài-đặt)
- [Cấu hình](#cấu-hình)
  - [Trực tiếp bằng bảng cài đặt](#trực-tiếp-bằng-bảng-cài-đặt)
  - [config.json](#configjson)
  - [Tài khoản](#tài-khoản)
- [API Document](#api-document)
- [Screenshot](#screenshot)
- [Contributor](#contributor)

## Demo
* **000webhost**: <a href="https://tweb-demo.000webhostapp.com/" target="_blank">https://tweb-demo.000webhostapp.com/</a>

### Tài khoản:

| id    | username | password |
|:------|:---------|:---------|
| admin | admin    | admin    |
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

<p align="center"><img src="https://lh3.googleusercontent.com/9eyH0aAXjGL8m5CekX37uohwQl2FR7cp5YM_Uc12P8DZ0Q9ZeeDyrTg0GI8ljJ25bdqhzrjtb1POQ_jyAYY8OCGKXTyMmRARVlU60RcXOMacrgF0MzGB4hTT3wsTI8Bpmi9J6epiCA=w2400" width="600px"></p>

* Xem đề bài trên trang

<p align="center"><img src="https://lh3.googleusercontent.com/YZoLxC4bvE3ms_nzwLQr8-R59iaifNwSyo_ksgoSJn7j80g_MoIgD58XwIvlKsLTqMF_lLHd_cI0trg9todblm8llQNlmFlHUy6Gb3T_ZDzVLEcILzXQHSViblV-ZqciNRwfGK5D2Q=w2400" width="400px"></p>
<p align="center"><img src="https://lh3.googleusercontent.com/bF3iW95rYuVGlCpMeJ2GIQBUCcgeOcV0IRx6bc4I9j4vgQxw46CsBzD7Sh5sqtYLkCW1wuAHyhMzG78b6AHfJTV3HkEeJu2VscXkG6yHd2rFwBeep22tonfVbSxPn4tC_8jvaB2nHQ=w2400" width="400px"></p>

* Hiện thời gian làm bài của kỳ thi

<p align="center"><img src="https://lh3.googleusercontent.com/BRwXRY6fNVzA3yo0ursanE0bduT2OKu0TnLxFUriSefxhRvLv2ZI9TN-FcRK6Y79F0FlMcpnky4XPnDJmKUETu2QdwGpGg0IAio1hBi0TV0du4dePXmqIkubtUgm0nUN80qDJ0CfNw=w2400" width="600px"></p>

* Nhật ký nộp bài hiển thị tình trạng bài nộp và kết quả của bài sau khi chấm

<p align="center"><img src="https://lh3.googleusercontent.com/MTPWJ_0RX-Vq50VUjqPklyPAfgxgMla2hyh3z_3KxAiIiKj5JQvZS1zl7b4Sa2ui5YLvKGbuQoXQgBhhbZAZE5l6ePLg_TDReFJ1mUpBtEzeaSC2hfRxd-e5fdULnbaXEt32SERXaw=w2400" width="600px"></p>

* Bảng xếp hạng được cập nhật tự động và sắp xếp thí sinh theo tổng số điểm tất cả bài thi

<p align="center"><img src="https://lh3.googleusercontent.com/sj05mS7rHhDeRmbe45-HquUKnrLmrDvu2lU2RV61FYfV5Ze5r60RkOi9Rxz_MxcUl77KUTfREAHUu1XcBQ6QdK-fbHYhDWiCA0-8NeUhskkqzD__quBv7yvdogtmhj9HjBH4aoWg4w=w2400" width="600px"></p>

* Xem trực tiếp tệp nhật kí

<p align="center"><img width="600px" src="https://lh3.googleusercontent.com/t55Oq4K9wOwT7WM_jPWlFoERbonMWNNGeXHHqq7sTh7Mkd6t4YLAvV9rODTsBIJvCC1n7e1Cf8IcBl6rodWvuq6pVteklGCLroxgCl7TPyjt0rXWIjHgkWeH6yGvQ_Fu90hrhk0zww=w2400"></p>

* Người dùng có thể thay đổi ảnh đại diện, tên và mật khẩu

* Mobile Responsive

<p align="center"><img width="400px" src="https://lh3.googleusercontent.com/pZl6Q-RuM9Z84OIAwSHj_LqBGOUK4nCgSFfZg4VakZuaX7rDxKRuWwsAvW_a2Mos5b6kYLJW_LLpNKSa7f-XoNwY2FNAuvlmjSlwFEkaSXfYHky4qoHp5h7o20AZ8Nir97N5PSawqw=w2400"></p>

## Tải về & Cài đặt
Bạn có thể tải trực tiếp phiên bản tích hợp sẵn UniServer ở phần [releases](https://github.com/belivipro9x99/themis-webinterface/releases/), sau đó giải nén tệp zip vừa tải về. Để khởi động máy chủ chạy tệp UniController.exe sau đó nhấn Start Apache.

Nếu khởi động UniServer gặp lỗi vui lòng cài [Microsoft Visual C++ 2015 Redistributable](https://www.microsoft.com/en-us/download/details.aspx?id=52685)

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

Bạn có thể thay đổi cấu hình, chỉnh sửa đề bài tại tab cài đặt dành cho admin

<p align="center"><img  src="https://lh3.googleusercontent.com/SwNsmYDSPXzolROfxn_bHN3C8x1WrFBsTV6zJVNp_jMaHatnpymnHF4N5BXHgFK40qD7yI1342SLfpnMIzBAMiQGBV6sXinaJdS16rdYqq4sUmXawR2wtpDDFV-J4d8o4bOSGaGy8w=w2400"></p>

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

**API** giúp bạn có thể giao tiếp với hệ thống mà không cần phải sử dụng trang web nộp bài. Do đó bạn có thể viết một chương trình chạy phía client trong trường hợp trang web nộp bài không hoạt động.

Toàn bộ **Document** đều có ở trong [wiki](https://github.com/belivipro9x99/themis-web-interface-reloaded/wiki) của dự án.

## Screenshot

<p align="center"><img src="https://lh3.googleusercontent.com/7L7D4QCntNFQk7SLhyxZ-14VYt0tliFVHTq0jtQLHKLFQ488jwSyl2PBebqTzVXnY1vD6LVEaVPrs8AAET_9hGR8VvlFgwXnidU9Li0HBC5BZpwgQOCrk3VI5XTjQrpOVAKU_a98sw=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/cti2fwOlrs165tpV9_TsXf0NXrsfQBLN93_j4QIrixJUKsv8PeK3F7tz9Avn7M4TC4GpUto0ucv9s3PYGEacjo3skhsPxwxCsXoq8c5j5XLPHvJJc46ZRUvWQGXYgLHHGt6zpAy1Mw=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/ITxtWrNyPTITIax-1t09E86ddizm2KlXatGOilkNjJxaTT3Oi3nLkfOcY4sN1-mBfBuqoiUNW7GbAxF9_SQj3JZyF2WZjJzn8RsQRanfcyWwptbIAeI7yy6H1xZR1b7lvN_C9_j17Q=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/ay2242TlEQqIJJ8m7Oy_E8R4QeOEo9US_im_4sfjhIoIll3CtTbIvPAG5mnwZZNRqFXWCmWIa9zuSMITrvTPIyn2wVLhpTcbH75g-KLRLA3vrEZZLYGTGDALlLPNbeGi58_TTUpxdg=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/O057HImNuPHG6Bel_yY5RiX55wYR8Gy6QWCwNdJe4hnSe4vxdXgvNlCCSZSp6SpYum90LqRUH8Tlv9rF-6M5jPTkqEzV0PhFHBlGJaFO8IrVNU8bL3St8LGGWA_SqiDTZ6PsV0c2SQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/t55Oq4K9wOwT7WM_jPWlFoERbonMWNNGeXHHqq7sTh7Mkd6t4YLAvV9rODTsBIJvCC1n7e1Cf8IcBl6rodWvuq6pVteklGCLroxgCl7TPyjt0rXWIjHgkWeH6yGvQ_Fu90hrhk0zww=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/CbCJ7KBpFP4crCDpTcO3pIfRTenidYMjEh7S2tzyqeECBotCyoxVx_mf4vMIh6O3X0FWkkWZsNQCrr_IulQO_l57Go17bzAi8fNY44arMSd6-pwAk70ZIPDaAtKfY1_DhW22fELjzg=w2400"></p>

## Contributor

Many thank to ```namkojj```, aka [Nam](https://www.facebook.com/profile.php?id=100008107446343) for helping me translating, hunting bug and testing this project.