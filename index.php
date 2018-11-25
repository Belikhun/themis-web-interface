<?php
    //|====================================================|
    //|                     index.php                      |
    //|            Copyright (c) 2018 Belikhun.            |
    //|      This file is licensed under MIT license.      |
    //|====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    header("Cache-Control: max-age=0, must-revalidate", true);

    $loggedin = false;
    $username = null;
    $userdata = null;
    $name = null;
    $id = null;

    if (islogedin()) {
        require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
        $loggedin = true;
        $username = $_SESSION["username"];
        $userdata = getuserdata($username);
        $name = $userdata["name"];
        $id = $userdata["id"];
    }
?>

    <!DOCTYPE html>
    <html lang="vi-VN">

    <head>

        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Themis Web Interface v<?php print VERSION; ?></title>

        <!-- Library First -->
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/splash.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/navbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/userprofile.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/input.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/spinner.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/statbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/scrollbar.css" />
        <!-- Page Style Core -->
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/core.css" />
        <!-- Fonts -->
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/calibri.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/material-font.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/consolas.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/fontawesome.css" />
    </head>

    <body class="<?php print ($loggedin ? ($id == "admin" ? "admin" : "user") : "guest"); ?>">
        <div id="splash_screen">
            <div class="mid">
                <div class="logo"></div>
                <div class="appname">Themis Web Interface v<?php print VERSION; ?></div>
                <div class="progress">
                    <div id="splash_bar" class="inner"></div>
                </div>
            </div>
            <div class="foot">
                <div class="icon">
                    <img src="data/img/chrome-icon.webp">
                    <img src="data/img/coccoc-icon.webp">
                </div>
                <t class="text">
                    Trang web hoạt động tốt nhất trên trình duyệt chrome và coccoc.
                </t>
            </div>
        </div>

        <script type="text/javascript">

            splash = {
                container: document.getElementById("splash_screen"),
                bar: document.getElementById("splash_bar"),
                onload: fullloaded => {},

                init() {
                    this.bar.dataset.slow = true;
                    setTimeout(e => {
                        this.bar.style.width = "90%";
                    }, 600);
                    document.body.onload = e => {
                        this.loaded();
                    };
                },

                loaded() {
                    this.bar.dataset.slow = false;
                    this.bar.style.width = "95%";
                    this.onload(() => {
                        this.bar.style.width = "100%";
                        setTimeout(e => {
                            this.container.classList.add("done");
                        }, 600);
                    });
                }
            }

            splash.onload = fullloaded => {
                core.init();
                fullloaded();
            }

            splash.init();
        </script>

        <div class="nav">
            <span class="lnav">
                <img class="icon" src="/data/img/icon.webp" />
                <ul class="title">
                    <li class="main text-overflow">
                        <?php print $config["contest"]["name"]; ?>
                    </li>
                    <li class="sub text-overflow">
                        <?php print $config["contest"]["description"]; ?>
                    </li>
                </ul>
            </span>
            <span id="upanel_toggler" class="rnav">
                <?php if ($loggedin) { ?>
                    <ul class="info">
                        <li class="tag text-overflow">
                            <?php print $username ."#". $id; ?>
                        </li>
                        <li id="user_name" class="name text-overflow">
                            <?php print htmlspecialchars($name); ?>
                        </li>
                    </ul>
                    <img id="user_avt" class="avatar" src="/api/avt/get?u=<?php print $username; ?>" />
                    <img class="arrow" src="/data/img/arr.webp" />
                <?php } else { ?>
                    <button class="login ms-btn" onclick="window.location.href='/login.php'">Đăng nhập</button>
                <?php } ?>
            </span>
            <?php if ($id == "admin") { ?>
                <div id="nav_list" class="mnav">
                    <span data-showid="container_content" data-default="true" class="item">Home</span>
                    <span data-showid="container_settings" class="item">Cài đặt</span>
                    <div class="separator"></div>
                </div>
            <?php } ?>
        </div>

        <div id="status">
            <span class="simple-spinner"></span>
            <t class="text"></t>
            <i class="material-icons close">close</i>
        </div>

        <span id="user_profile">
            <div class="header">
                <div class="avatar" title="Thả ảnh vào đây để thay đổi ảnh đại diện">
                    <img id="userp_avt" class="avatar" src="<?php print $loggedin ? "/api/avt/get?u=".$username : ""; ?>" />
                    <div id="userp_avtw" class="wrapper">
                        <i class="pencil"></i>
                        <i class="drag"></i>
                        <div class="material-spinner">
                            <svg><circle cx="50%" cy="50%" r="20" fill="none"/></svg>
                        </div>
                    </div>
                </div>
                <t id="userp_name" class="name text-overflow"><?php print htmlspecialchars($name); ?></t>
                <t id="userp_tag" class="tag"><?php print $username ."#". $id; ?></t>
            </div>
            <div class="body">
                <ul id="userp_left_panel" class="left">
                    <?php if ($id == "admin") { ?>
                        <li id="nav_list_home" class="item home active navlink">Trang chủ</li>
                        <li id="nav_list_sett" class="item config navlink">Cài đặt</li>
                        <li class="line navlink"></li>
                    <?php } ?>
                    <li id="userp_edit_name_toggler" class="item name arr">Đổi tên người dùng</li>
                    <li id="userp_edit_pass_toggler" class="item pass arr">Đổi mật khẩu</li>
                    <li class="line"></li>
                    <a href="https://github.com/belivipro9x99/themis-web-interface/issues" target="_blank"><li class="item report">Báo lỗi</li></a>
                    <a href="https://github.com/belivipro9x99/themis-web-interface/wiki" target="_blank"><li class="item wiki">Wiki</li></a>
                    <a href="https://github.com/belivipro9x99/themis-web-interface" target="_blank"><li class="item repo">Github Repository</li></a>
                    <li class="line"></li>
                    <li id="userp_logout" class="item logout">Đăng xuất</li>
                </ul>
                <div id="userp_right_panel" class="right">
                    <div id="userp_edit_name_panel" class="panel">
                        <div class="title">Đổi Tên</div>
                        <form class="root" id="userp_edit_name_form" autocomplete="off" action="javascript:void(0);">
                            <div class="formgroup">
                                <input id="userp_edit_name" type="text" class="formfield" placeholder="Tên" required>
                                <label for="userp_edit_name" class="formlabel">Tên</label>
                            </div>
                            <button type="submit" class="btn green">Gửi</button>
                        </form>
                    </div>
                    <div id="userp_edit_pass_panel" class="panel">
                        <div class="title">Đổi Mật Khẩu</div>
                        <form class="root" id="userp_edit_pass_form" autocomplete="off" action="javascript:void(0);">
                            <div class="formgroup">
                                <input id="userp_edit_pass" type="password" class="formfield" placeholder="Mật khẩu" required>
                                <label for="userp_edit_pass" class="formlabel">Mật khẩu</label>
                            </div>
                            <div class="formgroup">
                                <input id="userp_edit_npass" type="password" class="formfield" placeholder="Mật khẩu mới" required>
                                <label for="userp_edit_npass" class="formlabel">Mật khẩu mới</label>
                            </div>
                            <div class="formgroup">
                                <input id="userp_edit_renpass" type="password" class="formfield" placeholder="Nhập lại mật khẩu mới" required>
                                <label for="userp_edit_renpass" class="formlabel">Nhập lại mật khẩu mới</label>
                            </div>
                            <button type="submit" class="btn red">Gửi</button>
                        </form>
                    </div>
                </div>
            </div>
        </span>

        <div id="wrapper">
            <panel id="wrapp">
                <div class="head">
                    <t class="le"></t>
                    <span class="ri">
                        <i class="material-icons ref">refresh</i>
                        <i class="material-icons clo">close</i>
                    </span>
                </div>
                <div class="main">
                </div>
            </panel>
        </div>

        <div id="container">
            <div id="container_content" class="content">
                <panel id="uploadp">
                    <div class="head">
                        <t class="le">Nộp bài</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                        </span>
                    </div>
                    <div class="main fileupload-container">
                        <div id="file_dropzone">Thả tệp tại đây</div>
                        <div class="info">
                            <t id="file_upstate">null</t>
                            <t id="file_name">null</t>
                            <div class="bar">
                                <div id="file_bar"></div>
                                <t id="file_perc">0%</t>
                                <t id="file_size">00/00</t>
                            </div>
                        </div>
                    </div>
                </panel>

                <panel id="problemp">
                    <div class="head">
                        <t class="le">Đề bài</t>
                        <span class="ri">
                            <i class="material-icons bak">keyboard_arrow_left</i>
                            <i class="material-icons ref">refresh</i>
                        </span>
                    </div>
                    <div class="main problem-container">
                        <ul class="problem-list" id="problem_list">
                        </ul>
                        <div class="problem">
                            <t class="name" id="problem_name"></t>
                            <t class="point" id="problem_point"></t>
                            <table class="type">
                                <tr class="filename">
                                    <td>Tên tệp</td>
                                    <td id="problem_type_filename"></td>
                                </tr>
                                <tr class="ext">
                                    <td>Đuôi tệp</td>
                                    <td id="problem_type_ext"></td>
                                </tr>
                                <tr class="time">
                                    <td>Thời gian</td>
                                    <td id="problem_type_time"></td>
                                </tr>
                                <tr class="inp">
                                    <td>Dữ liệu vào</td>
                                    <td id="problem_type_inp"></td>
                                </tr>
                                <tr class="out">
                                    <td>Dữ liệu ra</td>
                                    <td id="problem_type_out"></td>
                                </tr>
                            </table>
                            <img class="image" id="problem_image" src="">
                            <t class="description" id="problem_description"></t>
                            <table class="test" id="problem_test">
                            </table>
                        </div>
                    </div>
                </panel>

                <panel id="timep">
                    <div class="head">
                        <t class="le">Thời gian</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                            <i class="material-icons clo">close</i>
                        </span>
                    </div>
                    <div class="main time-container">
                        <t id="time_state">---</t>
                        <t id="time_time">--:--</t>
                        <div class="bar">
                            <div id="time_bar"></div>
                            <t id="time_start">--:--</t>
                            <t id="time_end">--:--</t>
                        </div>
                    </div>
                </panel>

                <panel id="logp">
                    <div class="head">
                        <t class="le">Nhật ký</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                        </span>
                    </div>
                    <div class="main">
                        <ul class="log-item-container">
                        </ul>
                    </div>
                </panel>

                <panel id="rankp">
                    <div class="head">
                        <t class="le">Xếp hạng</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                        </span>
                    </div>
                    <div class="main ranking-container">
                    </div>
                </panel>
            </div>

            <div id="container_settings" class="settings">
                <panel id="settings_cpanel">
                    <div class="head">
                        <t class="le">Admin CPanel</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                        </span>
                    </div>
                    <div class="main">
                        <iframe class="cpanel-container" src="config.php"></iframe>
                    </div>
                </panel>

                <panel id="settings_problem">
                    <div class="head">
                        <t class="le">Đề bài</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                        </span>
                    </div>
                    <div class="main problem-settings">
                        <div class="header">
                            <div class="left">
                                <span id="problem_edit_btn_back" class="back"></span>
                            </div>
                            <t id="problem_edit_title" class="title">Danh sách</t>
                            <div class="right">
                                <span id="problem_edit_btn_add" class="add"></span>
                                <span id="problem_edit_btn_check" class="check"></span>
                            </div>
                        </div>
                        <div class="container">
                            <ul id="problem_edit_list" class="problem-list"></ul>
                            <form id="problem_edit_form" class="problem" action="javascript:void(0);" autocomplete="off">
                                <div class="formgroup blue">
                                    <input id="problem_edit_id" type="text" class="formfield" placeholder="Tên Tệp" required>
                                    <label for="problem_edit_id" class="formlabel">Tên Tệp</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_name" type="text" class="formfield" placeholder="Tên Bài" required>
                                    <label for="problem_edit_name" class="formlabel">Tên Bài</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_point" type="number" class="formfield" placeholder="Điểm" required>
                                    <label for="problem_edit_point" class="formlabel">Điểm</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_time" type="number" class="formfield" placeholder="Thời gian chạy" value="1" required>
                                    <label for="problem_edit_time" class="formlabel">Thời gian chạy</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_inptype" type="text" class="formfield" placeholder="Dữ liệu vào" value="Bàn Phím" required>
                                    <label for="problem_edit_inptype" class="formlabel">Dữ liệu vào</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_outtype" type="text" class="formfield" placeholder="Dữ liệu ra" value="Màn Hình" required>
                                    <label for="problem_edit_outtype" class="formlabel">Dữ liệu ra</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_accept" type="text" class="formfield" placeholder="Đuôi tệp" value="pas|py|cpp|java" required>
                                    <label for="problem_edit_accept" class="formlabel">Đuôi tệp (dùng | để ngăn cách)</label>
                                </div>
                                <div class="formgroup blue">
                                    <input id="problem_edit_image" type="file" class="formfield" accept="image/*" placeholder="Ảnh">
                                    <label for="problem_edit_image" class="formlabel">Ảnh (không yêu cầu)</label>
                                </div>
                                <div class="formgroup blue">
                                    <textarea id="problem_edit_desc" class="formfield" placeholder="Nội dung" required></textarea>
                                    <label for="problem_edit_desc" class="formlabel">Nội dung</label>
                                </div>
                                <div class="test-container">
                                    <t class="test">Test ví dụ</t>
                                    <div class="test-list" id="problem_edit_test_list"></div>
                                    <span class="test-add" id="problem_edit_test_add"></span>
                                </div>
                                <button id="problem_edit_submit" type="submit"></button>
                            </form>
                        </div>
                    </div>
                </panel>
            </div>

            <footer>
                <span class="left">
                    <div class="title">HỆ THỐNG NỘP BÀI TRỰC TUYẾN</div>
                    <div class="info">
                        <div class="badge">
                            <a href="https://github.com/belivipro9x99/themis-webinterface/releases/"><img src="/tool/badge?su=release&st=v<?php print VERSION; ?>&c=brightgreen"></a>
                            <img src="/tool/badge?su=license&st=MIT&c=orange">
                            <img src="/tool/badge?su=status&st=not tested&c=blue">
                            <img src="/tool/badge?su=author&st=Đỗ Mạnh Hà&c=red">
                            <img src="/tool/badge?su=school&st=THPT Lạc Long Quân, Hòa Bình&c=yellow">
                        </div>
                        <t><b>Themis Web Interface</b> là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập và tổ chức kì thi trở nên dễ dàng hơn.</t>
                    </div>
                </span>
                <ul class="right">
                    <li class="title">Liên Hệ</textarea>
                    </li>
                    <li class="tel">03668275002</li>
                    <li class="email">belivipro9x99@gmail.com</li>
                    <li class="facebook">
                        <a href="https://www.facebook.com/belivipro9x99">Belikhun</a>
                    </li>
                    <li class="github">
                        <a href="https://github.com/belivipro9x99">Belikhun</a>
                    </li>
                </ul>
                <ul class="bottom">
                    <li>Copyright © 2018 Belikhun. This project is copyrighted under MIT license</li>
                </ul>
            </footer>

        </div>

        <!-- Session Data -->
        <script>
            const IS_ADMIN = <?php print ($id == "admin" ? "true" : "false"); ?>;
            const LOGGED_IN = <?php print ($loggedin == true ? "true" : "false"); ?>;
            const API_TOKEN = "<?php print isset($_SESSION["api_token"]) ? $_SESSION["api_token"] : null; ?>";
        </script>

        <!-- Library First -->
        <script src="/data/js/belibrary.js" type="text/javascript"></script>
        <script src="/data/js/statbar.js" type="text/javascript"></script>
        <!-- Core script -->
        <script src="/data/js/core.js" type="text/javascript"></script>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-124598427-1');
        </script>

    </body>

    </html>