<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  index.php                                                                                    |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|


    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    header("Cache-Control: max-age=0, must-revalidate", true);

    $loggedin = false;
    $username = null;
    $userdata = null;
    $name = null;
    $id = null;
    $sessdata = Array(
        "SERVER_SOFTWARE" => $_SERVER["SERVER_SOFTWARE"],
        "SERVER_ADDR" => $_SERVER["SERVER_ADDR"],
        "SERVER_PROTOCOL" => $_SERVER["SERVER_PROTOCOL"],
        "HTTP_USER_AGENT" => $_SERVER["HTTP_USER_AGENT"],
        "REMOTE_ADDR" => $_SERVER["REMOTE_ADDR"],
        "username" => null,
    );

    if (islogedin()) {
        require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
        $loggedin = true;
        $sessdata["username"] = $username = $_SESSION["username"];
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

        <title><?php print APPNAME ." v". VERSION; ?></title>

        <!-- Library First -->
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/splash.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/input.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/switch.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/slider.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/navbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/usersetting.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/spinner.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/statusbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/scrollbar.css" />
        <!-- Page Style -->
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/core.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/css/dark.css" />
        <!-- Fonts -->
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/calibri.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/material-font.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/consolas.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/fontawesome.css" />
    </head>

    <body class="<?php print ($loggedin ? ($id === "admin" ? "admin" : "user") : "guest"); ?>">

        <!-- Init Library and Splash First -->
        <script src="/data/js/belibrary.js" type="text/javascript"></script>
        <script type="text/javascript" src="/data/js/splash.js"></script>
        <script type="text/javascript">
            var mainSplash = new splash(document.body, "<?php print APPNAME; ?>", "<?php print VERSION ."-". VERSION_STATE; ?>", "/data/img/icon.webp");

            mainSplash.init = async (set) => {
                set(0, "Initializing core.js");
                await core.init(set);
            }

            mainSplash.postInit = async (set) => {
                set(50, "Đang kiểm tra phiên bản mới...");
                await core.checkUpdateAsync();

                set(95, "Sending Analytics Data...");
                gtag("event", "pageView", {
                    "version": window.serverStatus.version
                });
            }
        </script>

        <!-- Main Content -->

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
            <span id="usett_toggler" class="rnav">
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
                <?php } ?>
                <span class="icon-menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </span>
        </div>

        <span id="user_settings" data-soundtoggle="show" class="sound">

            <div class="main">
                <div class="container">

                    <div class="group home">
                        <t class="title big center">Cài Đặt</t>
                        <t class="title small center">Thay đổi thiết đặt chung tại đây</t>

                        <div class="space"></div>
                    </div>

                    <?php if (!$loggedin) { ?>
                        <div class="group user">
                            <t class="title">Đăng Nhập</t>
                            <div class="item form">
                                <button class="sq-btn yellow sound" style="width: 100%;" data-soundhover data-soundselect onclick="window.location.href='/login.php'">Đăng nhập</button>
                            </div>
                        </div>
                    <?php } ?>

                    <div id="usett_userPanel" class="group user">
                        <t class="title">Tài Khoản</t>
                        <t class="title small">Thông tin</t>

                        <div class="item avatar sound" data-soundhoversoft>
                            <div class="avatar sound" data-soundhover title="Thả ảnh vào đây để thay đổi ảnh đại diện">
                                <img id="usett_avt" class="avatar" src="<?php print $loggedin ? "/api/avt/get?u=".$username : ""; ?>" />
                                <div id="usett_avtw" class="wrapper">
                                    <i class="pencil"></i>
                                    <i class="drag"></i>
                                    <div class="material-spinner">
                                        <svg><circle cx="50%" cy="50%" r="20" fill="none"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div class="info">
                                <t class="left">Tên thí sinh</t>
                                <t id="usett_name" class="right"><?php print htmlspecialchars($name); ?></t>
                            </div>

                            <div class="info">
                                <t class="left">Tên tài khoản</t>
                                <t class="right"><?php print $username; ?></t>
                            </div>

                            <div class="info">
                                <t class="left">Mã số (ID)</t>
                                <t class="right"><?php print $id; ?></t>
                            </div>
                        </div>

                        <t class="title small">Đổi tên</t>

                        <div class="item form sound" data-soundhoversoft>
                            <form id="usett_edit_name_form" autocomplete="off" action="javascript:void(0);">
                                <div class="formgroup blue sound" data-soundselectsoft>
                                    <input id="usett_edit_name" type="text" class="formfield" placeholder="Tên" required>
                                    <label for="usett_edit_name" class="formlabel">Tên</label>
                                </div>
                                <button type="submit" class="sq-btn sound" data-soundhover data-soundselect>Gửi</button>
                            </form>
                        </div>

                        <t class="title small">Đổi mật khẩu</t>

                        <div class="item form sound" data-soundhoversoft>
                            <form id="usett_edit_pass_form" autocomplete="off" action="javascript:void(0);">
                                <div class="formgroup blue sound" data-soundselectsoft>
                                    <input id="usett_edit_pass" type="password" class="formfield" placeholder="Mật khẩu" required>
                                    <label for="usett_edit_pass" class="formlabel">Mật khẩu</label>
                                </div>
                                <div class="formgroup blue sound" data-soundselectsoft>
                                    <input id="usett_edit_npass" type="password" class="formfield" placeholder="Mật khẩu mới" required>
                                    <label for="usett_edit_npass" class="formlabel">Mật khẩu mới</label>
                                </div>
                                <div class="formgroup blue sound" data-soundselectsoft>
                                    <input id="usett_edit_renpass" type="password" class="formfield" placeholder="Nhập lại mật khẩu mới" required>
                                    <label for="usett_edit_renpass" class="formlabel">Nhập lại mật khẩu mới</label>
                                </div>
                                <button type="submit" class="sq-btn sound" data-soundhover data-soundselect>Gửi</button>
                            </form>
                        </div>

                        <t class="title small">Đăng xuất</t>

                        <div class="item logout">
                            <button id="usett_logout" class="sq-btn pink sound" data-soundhover data-soundselect>Đăng Xuất</button>
                        </div>

                    </div>

                    <div class="group tools">
                        <t class="title">Cài Đặt</t>

                        <t class="title small">Âm Thanh</t>
                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Bật âm thanh</t>
                            <label class="sq-checkbox pink right">
                                <input id="usett_btn_sound_toggle" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Mouse Hover Sound</t>
                            <label class="sq-checkbox right">
                                <input id="usett_btn_sound_mouse_hover" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Button Click/Toggle Sound</t>
                            <label class="sq-checkbox right">
                                <input id="usett_btn_sound_button_click" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Panel Show/Hide Sound</t>
                            <label class="sq-checkbox right">
                                <input id="usett_btn_sound_panel_toggle" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Others</t>
                            <label class="sq-checkbox right">
                                <input id="usett_btn_sound_others" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Notification Sound</t>
                            <label class="sq-checkbox right">
                                <input id="usett_btn_sound_notification" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item lr warning sound" data-soundhoversoft>
                            <t class="left">Sounds by ppy Pty Ltd. Licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/legalcode" target="_blank" rel="noopener">CC-BY-NC 4.0</a>. See <a href="/data/sounds/LICENSE.md" target="_blank" rel="noopener">LICENSE.md</a> for more information.</t>
                            <div class="right"></div>
                        </div>

                        <t class="title small">Hiển thị</t>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Chế độ ban đêm</t>
                            <label class="sq-checkbox pink right">
                                <input id="usett_nightMode" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Thông báo</t>
                            <label class="sq-checkbox pink right">
                                <input type="checkbox" class="sound" data-soundcheck disabled>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                    </div>

                    <div id="usett_adminConfig" class="group config">
                        <t class="title">Cài Đặt Hệ Thống</t>

                        <div id="settings_cpanelToggler" class="item arr sound" data-soundhover>Admin Control Panel</div>
                        <div id="settings_problemToggler" class="item arr sound" data-soundhover>Chỉnh Sửa Test</div>
                    </div>

                    <div class="group link">
                        <t class="title">Liên Kết Ngoài</t>
                        <a class="item sound" data-soundhover data-soundselect href="https://github.com/belivipro9x99/themis-web-interface/issues" target="_blank" rel="noopener">Báo lỗi</a>
                        <a class="item sound" data-soundhover data-soundselect href="https://github.com/belivipro9x99/themis-web-interface/wiki" target="_blank" rel="noopener">Wiki</a>
                        <a class="item sound" data-soundhover data-soundselect href="https://github.com/belivipro9x99/themis-web-interface" target="_blank" rel="noopener">Source Code</a>
                    </div>

                    <div class="group info">
                        <t class="title">Thông tin Dự án</t>
                        <div id="usett_aboutToggler" class="item arr sound" data-soundhover>Thông tin</div>
                        <div id="usett_licenseToggler" class="item arr sound" data-soundhover>LICENSE</div>

                        <div class="space"></div>
                        <t class="title small">Copyright © 2018-2019 <a href="https://www.facebook.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>. This project is licensed under the MIT License. See <a href="/LICENSE" target="_blank" rel="noopener">LICENSE</a> for more information.</t>
                    </div>

                </div>
                
            </div>
            
            <div id="usett_panelContainer" class="sub">
            
                <div id="settings_problem" data-soundtoggle="show" class="panel sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="sound" data-soundhover data-soundselect></span>
                        </div>

                        <div class="main problem-settings">
                            <div class="problem-header">
                                <div class="left">
                                    <span id="problem_edit_btn_back" class="back sound" data-soundhover></span>
                                </div>
                                <t id="problem_edit_title" class="title">Danh sách</t>
                                <div class="right">
                                    <span id="problem_edit_btn_add" class="add sound" data-soundhover></span>
                                    <span id="problem_edit_btn_check" class="check sound" data-soundhover></span>
                                </div>
                            </div>
                            <div class="problem-container">
                                <ul id="problem_edit_list" class="problem-list sound" data-soundtoggle="hide"></ul>
                                <form id="problem_edit_form" class="problem" action="javascript:void(0);" autocomplete="off">
                                    <div class="formgroup blue">
                                        <input id="problem_edit_id" type="text" class="formfield sound" placeholder="Tên Tệp" data-soundselectsoft required>
                                        <label for="problem_edit_id" class="formlabel">Tên Tệp</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_name" type="text" class="formfield sound" placeholder="Tên Bài" data-soundselectsoft required>
                                        <label for="problem_edit_name" class="formlabel">Tên Bài</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_point" type="number" class="formfield sound" placeholder="Điểm" data-soundselectsoft required>
                                        <label for="problem_edit_point" class="formlabel">Điểm</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_time" type="number" class="formfield sound" placeholder="Thời gian chạy" value="1" data-soundselectsoft required>
                                        <label for="problem_edit_time" class="formlabel">Thời gian chạy</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_inptype" type="text" class="formfield sound" placeholder="Dữ liệu vào" value="Bàn Phím" data-soundselectsoft required>
                                        <label for="problem_edit_inptype" class="formlabel">Dữ liệu vào</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_outtype" type="text" class="formfield sound" placeholder="Dữ liệu ra" value="Màn Hình" data-soundselectsoft required>
                                        <label for="problem_edit_outtype" class="formlabel">Dữ liệu ra</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_accept" type="text" class="formfield sound" placeholder="Đuôi tệp" value="pas|py|cpp|java" data-soundselectsoft required>
                                        <label for="problem_edit_accept" class="formlabel">Đuôi tệp (dùng | để ngăn cách)</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problem_edit_image" type="file" class="formfield sound" accept="image/*" placeholder="Ảnh" data-soundselectsoft>
                                        <label for="problem_edit_image" class="formlabel">Ảnh (không yêu cầu)</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <textarea id="problem_edit_desc" class="formfield sound" placeholder="Nội dung" data-soundselectsoft required></textarea>
                                        <label for="problem_edit_desc" class="formlabel">Nội dung</label>
                                    </div>
                                    <div class="test-container sound" data-soundhoversoft data-soundselectsoft>
                                        <t class="test">Test ví dụ</t>
                                        <div class="test-list" id="problem_edit_test_list"></div>
                                        <span class="test-add" id="problem_edit_test_add"></span>
                                    </div>
                                    <button id="problem_edit_submit" type="submit"></button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="settings_controlPanel" data-soundtoggle="show" class="panel large sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <iframe class="cpanel-container" src=""></iframe>
                        </div>
                    </div>
                </div>

                <div id="usett_aboutPanel" data-soundtoggle="show" class="panel sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <footer>
                                <div class="header">
                                    <div class="logo"></div>
                                    <t class="title"><?php print APPNAME; ?></t>
                                    <t class="version">v<?php print VERSION."-".VERSION_STATE; ?></t>
                                    <t class="subtitle">Made from scratch, crafted with <font color="red">❤</font> by Belikhun</t>
                                    <div class="button">
                                        <button class="sq-btn green sound" data-soundhover data-soundselect onclick="this.innerText = randBetween(1, 1000)">Click Me!</button>
                                        <button class="sq-btn pink sound" data-soundhover data-soundselect>(╯°□°）╯︵ ┻━┻</button>
                                    </div>
                                </div>

                                <div class="badge">
                                    <a href="https://github.com/belivipro9x99/themis-webinterface/releases/" target="_blank" rel="noopener"><img src="/tool/badge?su=<?php print VERSION_STATE; ?>&st=v<?php print VERSION; ?>&c=brightgreen"></a>
                                    <img src="/tool/badge?su=license&st=MIT&c=orange">
                                    <img src="/tool/badge?su=status&st=not tested&c=blue">
                                    <img src="/tool/badge?su=author&st=Đỗ Mạnh Hà&c=red">
                                    <a href="http://thptlaclongquan.hoabinh.edu.vn" target="_blank" rel="noopener"><img src="/tool/badge?su=school&st=Lac Long Quan High School, Hoa Binh&c=yellow"></a>
                                </div>
                                
                                <t class="description"><b><?php print APPNAME; ?></b> là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập tin học và tổ chức kì thi trở nên dễ dàng hơn.</t>
                                
                                <t class="contact">Liên hệ:</t>
                                <ul class="contact">
                                    <li class="tel">03668275002</li>
                                    <li class="email">belivipro9x99@gmail.com</li>
                                    <li class="facebook">
                                        <a href="https://www.facebook.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>
                                    </li>
                                    <li class="github">
                                        <a href="https://github.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>
                                    </li>
                                </ul>
                            </footer>
                        </div>
                    </div>
                </div>

                <div id="usett_licensePanel" data-soundtoggle="show" class="panel large sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <iframe class="cpanel-container" src="/LICENSE"></iframe>
                        </div>
                    </div>
                </div>

            </div>

        </span>

        <div id="wrapper">
            <panel id="wrapp">
                <div class="head">
                    <t class="le"></t>
                    <span class="ri">
                        <i class="material-icons ref sound" data-soundhover data-soundselect>refresh</i>
                        <i class="material-icons clo sound" data-soundhover data-soundselect>close</i>
                    </span>
                </div>
                <div class="main">
                </div>
            </panel>
        </div>

        <div id="container">

            <panel id="uploadp">
                <div class="head">
                    <t class="le">Nộp bài</t>
                    <span class="ri">
                        <i class="material-icons ref sound" data-soundhover data-soundselect>refresh</i>
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
                        <i class="material-icons bak sound" data-soundhover>keyboard_arrow_left</i>
                        <i class="material-icons ref sound" data-soundhover data-soundselect>refresh</i>
                    </span>
                </div>
                <div class="main problem-container">
                    <ul class="problem-list sound" data-soundtoggle="hide" id="problem_list">
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
                        <i class="material-icons ref sound" data-soundhover data-soundselect>refresh</i>
                        <i class="material-icons clo sound" data-soundhover data-soundselect>close</i>
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
                        <i class="material-icons ref sound" data-soundhover data-soundselect>refresh</i>
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
                        <i class="material-icons ref sound" data-soundhover data-soundselect>refresh</i>
                    </span>
                </div>
                <div class="main ranking-container">
                </div>
            </panel>

        </div>

        <!-- Session Data -->
        <script>
            const IS_ADMIN = `<?php print ($id === "admin" ? "true" : "false"); ?>` === "true";
            const LOGGED_IN = `<?php print ($loggedin === true ? "true" : "false"); ?>` === "true";
            const API_TOKEN = `<?php print isset($_SESSION["api_token"]) ? $_SESSION["api_token"] : null; ?>`;
            const SESSION = JSON.parse(`<?php print json_encode($sessdata); ?>`);
        </script>

        <script src="/data/js/statusbar.js" type="text/javascript"></script>
        <script type="text/javascript">
            const sbar = new statusbar(document.body);
            sbar.__item = new Array();

            document.__onclog = (type, ts, msg) => {
                type = type.toLowerCase();
                const typelist = ["okay", "warn", "errr", "crit", "lcnt"]
                if (typelist.indexOf(type) === -1)
                    return false;

                if (type === "errr")
                    sbar.__item.errr.change(parseInt(sbar.__item.errr.get()) + 1);
                else if (type === "warn")
                    sbar.__item.warn.change(parseInt(sbar.__item.warn.get()) + 1);

                sbar.msg(type, msg, {time: ts, lock: (type === "crit" || type === "lcnt") ? true : false});
            }

            sbar.__item.warn = sbar.additem("0", "warning", {space: false});
            sbar.__item.errr = sbar.additem("0", "error");
            sbar.additem(SESSION.SERVER_SOFTWARE, "server");
            sbar.additem(SESSION.SERVER_ADDR, "globe");
            sbar.additem(SESSION.username ? SESSION.username : "Chưa đăng nhập", "account", {aligin: "right"});
            sbar.additem(SESSION.REMOTE_ADDR, "desktop", {aligin: "right"});
        </script>

        <!-- Core script -->
        <script src="/data/js/core.js" type="text/javascript"></script>
        
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());

            gtag("config", "UA-124598427-1", {
                "custom_map": {
                    "dimension1": "version"
                }
            });
        </script>

    </body>

    </html>