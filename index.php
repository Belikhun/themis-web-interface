<?php
    //|====================================================|
    //|                     index.php                      |
    //|            Copyright (c) 2018 Belikhun.            |
    //|      This file is licensed under MIT license.      |
    //|====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/api/xmldb/account.php";
    header("Cache-Control: max-age=0, must-revalidate", true);
    define("VERSION", "0.3.1");

    if (!islogedin()) {
        require "login.php";
        die();
    }

    $username = $_SESSION["username"];
    $userdata = getuserdata($username);
    $name = $userdata["name"];
    $id = $userdata["id"];

?>

    <!DOCTYPE html>
    <html lang="vi-VN">

    <head>

        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Themis Web Interface v<?php print VERSION; ?></title>

        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/loader.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/navbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/userprofile.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/input.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/spinner.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/statbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/scrollbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/core.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/calibri.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/material-font.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/consolas.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/fontawesome.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="https://fonts.googleapis.com/css?family=Open+Sans" />

    </head>

    <body onload="core.init();">

        <div class="loader" id="loader">
            <div class="spinner"></div>
        </div>

        <div class="nav">
            <span class="lnav">
                <img class="icon" src="/data/img/icon.png" />
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
                <ul class="info">
                    <li class="tag">
                        <?php print $username ."#". $id; ?>
                    </li>
                    <li id="user_name" class="name">
                        <?php print htmlspecialchars($name); ?>
                    </li>
                </ul>
                <img id="user_avt" class="avatar" src="/api/avt/get?u=<?php echo $username; ?>" />
                <img class="arrow" src="/data/img/arr.png" />
            </span>
        </div>

        <div id="status">
            <span class="simple-spinner"></span>
            <t class="text"></t>
            <i class="material-icons close">close</i>
        </div>

        <span id="user_profile">
            <div class="header">
                <div class="avatar" title="Thả ảnh vào đây để thay đổi ảnh đại diện">
                    <img id="userp_avt" class="avatar" src="/api/avt/get?u=<?php echo $username; ?>" />
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
                    <li id="userp_edit_name_toggler" class="item name arr">Đổi tên người dùng</li>
                    <li id="userp_edit_pass_toggler" class="item pass arr">Đổi mật khẩu</li>
                    <li class="line"></li>
                    <?php if(getuserdata($_SESSION["username"])["id"] == "admin") { ?>
                        <li id="userp_edit_name_toggler" class="item config" onclick="core.showcp();">Cài đặt</li>
                    <?php } ?>
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
                        <i class="material-icons set">settings</i>
                        <i class="material-icons clo">close</i>
                    </span>
                </div>
                <div class="main">
                </div>
            </panel>
        </div>

        <div id="container">
            <div class="content">
                <panel id="uploadp">
                    <div class="head">
                        <t class="le">Nộp bài</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                            <i class="material-icons set">settings</i>
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

                <panel id="timep">
                    <div class="head">
                        <t class="le">Thời gian</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                            <i class="material-icons set">settings</i>
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
                            <i class="material-icons set">settings</i>
                        </span>
                    </div>
                    <div class="main">
                    </div>
                </panel>

                <panel id="rankp">
                    <div class="head">
                        <t class="le">Xếp hạng</t>
                        <span class="ri">
                            <i class="material-icons ref">refresh</i>
                            <i class="material-icons set">settings</i>
                        </span>
                    </div>
                    <div class="main ranking-container">
                    </div>
                </panel>
            </div>

            <footer>
                <ul class="left">
                    <li class="title">HỆ THỐNG NỘP BÀI TRỰC TUYẾN v<?php print VERSION; ?></li>
                    <li class="author">
                        <ul class="container">
                            <li class="name">Tác giả:
                                <t>Đỗ Mạnh Hà</t>
                            </li>
                            <li class="info">Trường THPT Lạc Long Quân, Hòa Bình.</li>
                        </ul>
                    </li>
                </ul>
                <ul class="right">
                    <li class="title">Liên Hệ</t>
                    </li>
                    <li class="tel">01668275002</li>
                    <li class="email">belivipro9x99@gmail.com</li>
                    <li class="facebook">
                        <a href="https://www.facebook.com/belivipro9x99">belivipro9x99</a>
                    </li>
                    <li class="github">
                        <a href="https://github.com/belivipro9x99">belivipro9x99</a>
                    </li>
                </ul>
                <ul class="bottom">
                    <li>Copyright © 2018 Belikhun. This project is copyrighted under MIT license</li>
                </ul>
            </footer>

        </div>

        <script src="/data/js/statbar.js" type="text/javascript"></script>
        <script src="/data/js/belibrary.js" type="text/javascript"></script>
        <script src="/data/js/core.js" type="text/javascript"></script>

        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-124598427-1');
        </script>

        <script>
            const API_TOKEN = "<?php print $_SESSION["api_token"]; ?>";
        </script>

    </body>

    </html>