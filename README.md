<p align="center">
  <img src="https://lh3.googleusercontent.com/BzHUxZCQ6_pIxYvI-Lh0Mi5ydeZkgH7vzeh27x8d8n4f89J3pQnKlkaTGwUVjPtm5NCnQCYCfRPJmwUUVLb1mNLC3nsTMrougqTBScEbVNZpE6s8ZDBoUW1ZfABER1cK36H2dqUvrQ=w2400">
</p>

<p align="center">
	<a href="https://github.com/belivipro9x99/themis-webinterface/releases/"><img src="https://img.shields.io/badge/release-v0.3.5-brightgreen.svg?longCache=true&style=popout-square"></a>
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
* **000webhost**: [https://tweb-demo.000webhostapp.com/](https://tweb-demo.000webhostapp.com/)
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

<p align="center"><img src="https://lh3.googleusercontent.com/K4qASNz9XrcPx6LvGQzoKzq5ypenBTL9LmhKvENALO08O3t1XyNrvo4DT5W1iBzQAEi1mtkn6g9JrgADa12aw2DTMY5a_2989wNrq0D37s6BsEI5GwR8QBZ_N_Y91rgzx1VYYFQbTg=w2400" width="600px"></p>

* Xem đề bài trên trang

<p align="center"><img src="https://lh3.googleusercontent.com/R2lFhbW5KwjzQjQqJ-pdpBJRFn3_6agAxf5bSNgB0dq-EJwlSilVfXnmHreAbBlNQk96EkHKJN9qYC-mlh0L3yAGcsuUoeE5OVUSXe7CucjwmpX_CJtbhz42nJM8t30WnA8rtfstxg=w2400" width="400px"></p>
<p align="center"><img src="https://lh3.googleusercontent.com/gDQ_bUkUE2Jc-DEN0TQy6ER8X5Au6LB2s1myw48f2inzX35tudsIDbZcBBcfF7Mvyru275hd6uUmq-l3wJKmMj9DLVriES9hJc6I0VgeOct94QXpXQJFs9AXWkFPdY2zHJe_AExKyQ=w2400" width="400px"></p>

* Hiện thời gian làm bài của kỳ thi

<p align="center"><img src="https://lh3.googleusercontent.com/nWQj7AcZSnGXrquFEPTgtDDaylu70aRXy_hrcIv1WUtjDvUlpI7BVDibCTbJ4gktebBoKA5uulDjYW_Jn3HQ1sP6l8tc4KpL0cBGpN5wy4KLN8kqYgyeLZPRanOWIt5chfrLWqDuWw=w2400" width="600px"></p>

* Nhật ký nộp bài hiển thị tình trạng bài nộp và kết quả của bài sau khi chấm

<p align="center"><img src="https://lh3.googleusercontent.com/l_W7bR4g31DmM38foYihj7UfgGJ0dquxveTO2DDKDT4E3SROfM4ZnAjKQgw50bX51yxGJQijH4aEYowxMDjZOUoKxC5dgDEyWNoyUuiQUjhYOX5FnC1fonDM_xHBHCOO8N3RuLxCAQ=w2400" width="400px"></p>

* Bảng xếp hạng được cập nhật tự động và sắp xếp thí sinh theo tổng số điểm tất cả bài thi

<p align="center"><img src="https://lh3.googleusercontent.com/6pyA8354I1jpCOXyreTGZ_-CFna3AOeI6Ar7E11EhpatMUCX85aZkJtIqhF3NN6mTctImoeYdjXhCAkEWOWRTTfy44emkHtyCbzMFVKecdqjaaKkdR92NSaIP-boE-eoasKhdgVx5w=w2400" width="600px"></p>

* Xem trực tiếp tệp nhật kí

<p align="center"><img width="600px" src="https://lh3.googleusercontent.com/QQhIMvi7V8PTzXz_C-r6TZ21LgK73hTVUtX9VXgCoqWXkSZJVPRbJJPHug24Fce9nHY_a7ZXBpglli4cOdnlJ2vHKdwvNllMoHIDd-ZcwDaWR6PMCjjVewON1oqPt9CSlPgf1__joQ=w2400"></p>

* Người dùng có thể thay đổi ảnh đại diện, tên và mật khẩu

* Mobile Responsive

<p align="center"><img width="400px" src="https://lh3.googleusercontent.com/x_2wAcs9pIjAUWi2a7zqb_6LduR1djjwgLXWBwvAV5VimvYEBhD4IgnLjShFfGNwQBFBvp59xL4aJmChjQYz2A92HjRG7UFfc8tRx9S068VuM5cMF_jgLbyHUstwnjE8TlGGQlyN5Q=w2400"></p>

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

Bạn có thể thay đổi cấu hình, chỉnh sửa đề bài tại tab cài đặt dành cho admin

<p align="center"><img  src="https://lh3.googleusercontent.com/EKXQjUtlEVxwny6EWCSs4672aoC18SUUSDT0GO2Y0Nhyl8lqVj7jm479cyMSwPzD4m1mBxXyTITrQUXN1Vsn9EijvDF-2rrifN9PYpR8U9L_-svZ_VYHihivmCWb0muzslRF_y6dbw=w2400"></p>

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

<p align="center"><img src="https://lh3.googleusercontent.com/zOS2k_0pz15Q5uVOraYYsJayZEG43TT2tQdNMMGQo4FBZdscZJZOiH3ZGMEflNVCI2zkpe5Ljt0F7vTsosygiTh4u-ZSfccpFX_ra-5Yuk8GCt3JkLihTm7GIWC8a_Dto_7gnhQ33g=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/6oJb7OJ3Ess9PhQzbKF1hNyt2Pf1gftCo2NEC-WG4qQFpVDno2oPP_druUg73IPZCKQ6ZS21PkF2rrcgC-78LIpzcwQDmO37e4fyT1FUAMiufRbUIRkpYEyoGc0s4OeijZzUhFkA-A=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/0qI_1fJ24CgWRDGC9nHKBCZZQG5PjekiYWf95DK5O_goP1vy-RVUk5AH48ORMYBEs7F62R4nlyatDlBx7a5p5u2ioCIAQQu7mtGhmlLNRTmn9ziPCdkNQdF8NuzAzhlj9a3WO8oUcQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/fyfLgY269ZggaQup47CMjen2V7mbXVaIgCG3JBKHbTiIYsngnhLQOcKQvLfU-76OTFFdAGKP7jY4wRyqgAbivyyLTI1AU3alXnsUkayoa7cB_3uzpCwQ1hEYnC8g3YV6hb5V16Q7_A=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/UUE806R7OClaYnEdNlHtW5lG29Pjy5zHhFq2uons61p0e85OR9e2cS7VMw8umS6BwABQbk1hqBOGbUQ-2VHa3Vh4B4rHRxJO_ZqBCCBaUTc2LhSGyXArsnCH5qWq8r5oDS8ZwgKCmw=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/mjse5RHXz8G5GLPA-zIKY1WUSq5PuEXj0vnozRFFzvktMn8ziky--FJf4Kk0dLrbIVdb711kye7yDcwcCsofZxG9LWJ3EIssdJ8zSoqVgkrtSjx3VUNDWxfJN4JhtHxPXOrTYz8MDA=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/9Ox6KmuN930I08fZHBijO27lRvtZLB5TknOo8y-_5yK-E0UPfDyWPXlhskWmPqzCN5tJJUvPTX6Bi74w0KyCft6o1J1QPtOeesbVuBEXuFabFGMUpxAjtf_UUisZOFXx1ejURuEosw=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/8zv18Zl9nEZtjXv8dUTohaa6PeVfr1eb8lenfQ4jpVnwptkSQZqUzfr1YJhhaLG9GWm5KyW3iNoayQxipCNBFyGNKDXSCgqVhZpjEfKeAzoJy9e2CTsGWCwuT_MOjzDnLZLMP7ybrQ=w2400"></p>

## Contributor

Many thanks to ```namkojj```, aka [Nam](https://www.facebook.com/profile.php?id=100008107446343) for helping me translating, hunting bug and testing this project.