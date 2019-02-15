<p align="center">
  <img src="https://lh3.googleusercontent.com/UJ9p8wcOqInslW4xWpJ6ZQ55Lx6DXN85MJvGoLl0G3WroDqQExDdovbLXuD1rg8C3mGxyyRkheWK4t2soF9HcWsxNXgO0lK_iq_iqvwvXz2Bu5JWmPHhbiesqYziSVitpkWSo7P51A=w2400">
</p>

<p align="center">
	<a href="https://github.com/belivipro9x99/themis-webinterface/releases/"><img src="https://img.shields.io/badge/release-v0.3.7-brightgreen.svg?longCache=true&style=popout-square"></a>
	<img src="https://img.shields.io/badge/license-MIT-orange.svg?longCache=true&style=popout-square">
	<img src="https://img.shields.io/badge/status-not tested-blue.svg?longCache=true&style=popout-square">
  <a href="https://www.codefactor.io/repository/github/belivipro9x99/themis-web-interface"><img src="https://www.codefactor.io/repository/github/belivipro9x99/themis-web-interface/badge"/></a>
</p>

---

**Themis Web Interface** là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập và tổ chức kì thi trở nên dễ dàng hơn.

**Themis Web Interface** giúp học sinh nộp bài tới phần mềm chấm điểm **[Themis](https://dsapblog.wordpress.com)** và theo dõi kết quả chấm điểm qua LAN hoặc WAN.

**Themis Web Interface** được viết bằng các ngôn ngữ **HTML, CSS, PHP và JavaScript**. Dự án không sử dụng các library khác như **jQuery, Bootstrap, React, ...**

> Phiên bản hiện tại là 0.4.0-beta

- [Demo](#demo)
- [Yêu cầu](#yêu-cầu)
- [Tính năng](#tính-năng)
- [Cài đặt và hướng dẫn sử dụng](#cài-đặt-và-hướng-dẫn-sử-dụng)
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

## Cài đặt và hướng dẫn sử dụng

Hướng dẫn cài đặt, sử dụng và nâng cấp hiện có trong [Wiki](https://github.com/belivipro9x99/themis-web-interface/wiki/installation-and-config) của dự án.

## API Document

**API** giúp bạn có thể giao tiếp với hệ thống mà không cần phải sử dụng trang web nộp bài. Do đó bạn có thể viết một chương trình chạy phía client trong trường hợp trang web nộp bài không hoạt động.

Toàn bộ **Document** đều có ở trong [Wiki:API](https://github.com/belivipro9x99/themis-web-interface-reloaded/wiki/Getting-Started-with-API) của dự án.

## Screenshot

<p align="center"><img src="https://lh3.googleusercontent.com/hwayDiWGzXbgufohz2bY7bPkuwV5G87peF_8F6nNM3wyXFxep4_z0riHqzOPKB4gwsvWhCFtIxEjLkkMvAn-X8zCj5Uv3A9Dc5Sh3ZVNFylCgGlpAvXjFX4twrKmnRY9oRkioHkjbQ=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/ji5o8WyPb3_QrWNbJO8rMDM2SNxRr8ta9QnpGAMD5tiKYf28lQ6fvtbRfS06rElMBW2DwLTw-AwQKyIj_BCodlXPeXG0UoWG7_sDFnxijxg3QoxKELFlo7xfel1Wn4ESR-PSHNDjIQ=w2400"></p>

<p align="center"><img src="https://lh3.googleusercontent.com/UGaJOI_NQuFkzxbGKbOM18UEvzfioakd1SNHfc-VsbOzIVH_a2EMUUxN1LbtSZkmRiITuJklnmaw2J_Me-mMr8Hn3OTd92LBDn3pBjHs24UDbTnEseb6_VLGU60FwPLdHu0QOQgrUQ=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/ay2242TlEQqIJJ8m7Oy_E8R4QeOEo9US_im_4sfjhIoIll3CtTbIvPAG5mnwZZNRqFXWCmWIa9zuSMITrvTPIyn2wVLhpTcbH75g-KLRLA3vrEZZLYGTGDALlLPNbeGi58_TTUpxdg=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/JoE-vCwvcYzK1RfENe1x6A3U2o8IAvet6W23ZPNerY2LWw7ZC1ch4Ahsm8s5PFSupWnyMmRpf9QIJ1v-MEu7fXh_0CjGo0BpLxOZtE4eerVkACU3nvJ6j1TLqPE-FAuocqsQ5c6yow=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/mkP4cd5RY7rlNZks9pESf93_pnbDmtkpXHTDXQ8TtYIc0SjZy-2-PRYM8vNdNSB4ArPS7TB3-U6LIScCEg6cuzlGGXDFPnV-yZ4ECSoEUzzYjr9zl-Ldmnzt9Sv9c3Um82ocV59KoA=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/uz8FEL_1nHxlKR9SVRpGDt-dx1OhQgrkh5h5FfV-bo-DtCbHbPNq61E4AAKknBAMHVGGUGQhjffiPgNqspXGlTqjlMIovER5HMQSF-C7qIPGDTH3-SG4dE9sC2q70M04uWle2QOsOw=w2400"></p>

<p align="center"><img  src="https://lh3.googleusercontent.com/t55Oq4K9wOwT7WM_jPWlFoERbonMWNNGeXHHqq7sTh7Mkd6t4YLAvV9rODTsBIJvCC1n7e1Cf8IcBl6rodWvuq6pVteklGCLroxgCl7TPyjt0rXWIjHgkWeH6yGvQ_Fu90hrhk0zww=w2400"></p>

## Contributor

Many thank to ```namkojj```, aka [Nam](https://www.facebook.com/profile.php?id=100008107446343) for helping me translating, hunting bug and testing this project.