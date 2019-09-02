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

    //? Try to get server WAN address
    set_error_handler(null, E_ALL);
    $wArr = file_get_contents("http://bot.whatismyipaddress.com", false, null, 0, 36);
    restore_error_handler();

    define("LAN_ADDR", getHostByName(getHostName()));
    define("WAN_ADDR", $wArr);

    $loggedIn = false;
    $username = null;
    $userdata = null;
    $name = null;
    $id = null;
    $sessionData = Array(
        "SERVER_SOFTWARE" => $_SERVER["SERVER_SOFTWARE"],
        "SERVER_ADDR" => $_SERVER["SERVER_ADDR"],
        "SERVER_PROTOCOL" => $_SERVER["SERVER_PROTOCOL"],
        "HTTP_USER_AGENT" => $_SERVER["HTTP_USER_AGENT"],
        "REMOTE_ADDR" => $_SERVER["REMOTE_ADDR"],
        "username" => null,
    );

    if (isLogedIn()) {
        require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
        $loggedIn = true;
        $sessionData["username"] = $username = $_SESSION["username"];
        $userdata = getUserData($username);
        $name = $userdata["name"];
        $id = $userdata["id"];
    }

    $stripedContestDescription = strip_tags($config["contest"]["description"]);
?>

    <!DOCTYPE html>
    <html lang="vi-VN">

    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!-- Thay đổi tiêu đề trang hiện đã có trong phần Admin Control Panel -->
        <title><?php print $config["pageTitle"]; ?> | <?php print APPNAME ." v". VERSION; ?></title>

        <!-- Primary Meta Tags -->
        <meta name="title" content="<?php print $config["contest"]["name"]; ?>">
        <meta name="description" content="<?php print $stripedContestDescription; ?>">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="<?php print $config["contest"]["name"]; ?>">
        <meta property="og:description" content="<?php print $stripedContestDescription; ?>">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:title" content="<?php print $config["contest"]["name"]; ?>">
        <meta property="twitter:description" content="<?php print $stripedContestDescription; ?>">

        <!-- Load Library First -->
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/splash.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/progressbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/textview.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/table.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/switch.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/slider.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/navbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/usersetting.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/statusbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollbar.css" />
        <!-- Page Style -->
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/core.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/dark.css" />
        <!-- Fonts -->
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/material-font.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome.css" />
    </head>

    <body class="<?php print ($loggedIn ? ($id === 'admin' ? 'admin' : 'user') : 'guest'); ?>">

        <!-- Init Library and Splash First -->
        <script src="/assets/js/belibrary.js" type="text/javascript"></script>
        <script type="text/javascript" src="/assets/js/splash.js"></script>
        <script type="text/javascript">
            var mainSplash = new splash(document.body, `<?php print $config["contest"]["name"]; ?>`, `<?php print $stripedContestDescription; ?>`, "/assets/img/icon.webp");

            mainSplash.init = async set => {
                set(0, "Initializing core.js");
                await core.init(set);
            }

            mainSplash.postInit = async set => {
                set(50, "Đang kiểm tra phiên bản mới...");
                await core.checkUpdateAsync(IS_ADMIN);

                set(95, "Sending Analytics Data...");
                gtag("event", "pageView", {
                    version: window.serverStatus.version,
                    hostname: location.hostname,
                    loadtime: ((new Date()).getTime() - window.performance.timing.navigationStart) / 1000,
                    downlink: (navigator) ? navigator.connection.downlink : 0,
                    versiontag: window.serverStatus.versionTag,
                    contestname: window.serverStatus.contestName,
                    platform: (navigator) ? navigator.platform : null,
                    darkmode: cookie.get("__darkMode"),

                    event_category: "load",
                    event_label: "scriptInitialized",
                    send_to: "default",
                    event_callback: () => clog("INFO", "Analytics data sent!")
                });
            }

            mainSplash.onErrored = async (error, e, d) => {
                if (cookie.get("splashInitSuccess", true) === "false")
                    if (core.dialog.initialized) {
                        let errorDetail = document.createElement("ul");
                        let errorDetailHtml = "";
                        
                        errorDetailHtml = error.stack
                            ? error.stack
                                .split("\n")
                                .map(i => `<li>${i}</li>`)
                                .join("")
                            : `<li>${e} >>> ${d}</li>`;
                        
                        errorDetail.classList.add("textview", "small", "noBreakLine");
                        errorDetail.style.flexDirection = "column";
                        errorDetail.innerHTML = errorDetailHtml;

                        $("#dialogWrapper").style.zIndex = 999;
                        let action = await core.dialog.show({
                            panelTitle: "Lỗi",
                            title: "Oops",
                            description: "Có vẻ như lỗi vẫn đang tiếp diễn!<br>Hãy thử <b>tải lại</b> trang hoặc sử dụng thông tin dưới đây để gửi một báo cáo lỗi:",
                            level: "error",
                            additionalNode: errorDetail,
                            buttonList: {
                                report: {
                                    text: "Báo lỗi",
                                    color: "pink",
                                    resolve: false,
                                    onClick: () => window.open("<?php print REPORT_ERROR; ?>", "_blank")
                                },
                                reload: { text: "Tải lại", color: "blue" },
                                close: { text: "Đóng", color: "dark" }
                            }
                        })

                        switch (action) {
                            case "reload":
                                location.reload();
                                break;
                        }
                        
                    } else
                        alert(error);
            }
        </script>

        <!-- Main Content -->

        <div class="nav">
            <span class="lnav">
                <img class="icon" src="/assets/img/icon.webp" />
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
                <?php if ($loggedIn) { ?>
                    <ul class="info">
                        <li class="tag text-overflow">
                            <?php print $username ."#". $id; ?>
                        </li>
                        <li id="user_name" class="name text-overflow">
                            <?php print htmlspecialchars($name); ?>
                        </li>
                    </ul>
                    <img id="user_avt" class="avatar" src="/api/avatar?u=<?php print $username; ?>" />
                <?php } ?>
                <span class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </span>
        </div>

        <span id="user_settings" data-soundtoggle="show" class="sound">

            <div class="main">
                <div class="container menu">

                    <div class="group home">
                        <t class="title big center">Cài Đặt</t>
                        <t class="title small center">Thay đổi thiết đặt chung tại đây</t>

                        <div class="space"></div>
                    </div>

                    <div class="group file">
                        <t class="title">Tải về</t>

                        <div id="settings_publicFilesToggler" class="item arr sound" data-soundhover>Các tệp công khai</div>
                    </div>

                    <?php if (!$loggedIn) { ?>
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
                            <input id="usett_avtinp" type="file">
                            <label for="usett_avtinp" class="avatar sound" data-soundhover data-soundselect title="Nhấn hoặc thả ảnh vào đây để thay đổi ảnh đại diện">
                                <img id="usett_avt" class="avatar" src="<?php print $loggedIn ? '/api/avatar?u='. $username : ''; ?>" />
                                <div id="usett_avtw" class="wrapper">
                                    <i class="pencil"></i>
                                    <i class="drag"></i>
                                    <div class="material-spinner">
                                        <svg><circle cx="50%" cy="50%" r="20" fill="none"/></svg>
                                    </div>
                                </div>
                            </label>

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

                        <div class="item lr info sound" data-soundhoversoft>
                            <t class="left">Tên được phép sử dụng tất cả các kí tự và có độ dài không vượt quá <b>34 kí tự</b></t>
                            <div class="right"></div>
                        </div>

                        <div class="item form sound" data-soundhoversoft>
                            <form id="usett_edit_name_form" autocomplete="off" action="javascript:void(0);">
                                <div class="formgroup blue sound" data-soundselectsoft>
                                    <input id="usett_edit_name" type="text" class="formfield" placeholder="Tên" maxlength="34" required>
                                    <label for="usett_edit_name" class="formlabel">Tên</label>
                                </div>
                                <button type="submit" class="sq-btn sound" data-soundhover data-soundselect>Thay đổi</button>
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
                                <button type="submit" class="sq-btn sound" data-soundhover data-soundselect>Thay đổi</button>
                            </form>
                        </div>

                        <t class="title small">Đăng xuất</t>

                        <div class="item logout">
                            <button id="usett_logout" class="sq-btn pink sound" data-soundhover data-soundselect>Đăng Xuất</button>
                        </div>

                    </div>

                    <div class="group tools">
                        <t class="title">Cài Đặt</t>

                        <t class="title small">Hiển thị</t>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Chế độ ban đêm</t>
                            <label class="sq-checkbox pink right">
                                <input id="usett_nightMode" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Hoạt ảnh</t>
                            <label class="sq-checkbox blue right">
                                <input id="usett_transition" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>
                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Hiện millisecond</t>
                            <label class="sq-checkbox blue right">
                                <input id="usett_millisecond" type="checkbox" class="sound" data-soundcheck>
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

                        <div class="space"></div>

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

                        <div class="space"></div>
                        
                        <t class="title small">Khác</t>

                        <div class="item lr sound" data-soundhoversoft>
                            <t class="left">Mở Đề Bài trong hộp thoại</t>
                            <label class="sq-checkbox blue right">
                                <input id="usett_dialogProblem" type="checkbox" class="sound" data-soundcheck>
                                <span class="checkmark"></span>
                            </label>
                        </div>

                        <div class="item sound" data-soundhoversoft>
                            <div class="lr">
                                <t class="left">Thời gian làm mới</t>
                                <t id="usett_udelay_text" class="right">0000 ms/request</t>
                            </div>
                            <input type="range" id="usett_udelay_slider" class="sq-slider blue sound" data-soundselectsoft data-soundchange min="500" max="10000" step="100">
                        </div>
                        <t class="item lr warning sound" data-soundhoversoft>
                            <t class="left"><b>Lưu Ý: </b>Đặt thời gian làm mới quá nhỏ sẽ khiến bạn dễ dàng bị phạt <i>(cụ thể là bị ratelimited)</i> trong một khoảng thời gian nhất định.</t>
                            <div class="right"></div>
                        </t>

                        <div class="space"></div>
                    </div>

                    <div id="usett_adminConfig" class="group config">
                        <t class="title">Admin</t>

                        <t class="title small">Địa chỉ máy chủ</t>
                        <div class="item lr">
                            <t class="left">Mạng cục bộ (LAN):</t>
                            <t class="right" style="user-select: text;"><?php print LAN_ADDR; ?></t>
                        </div>
                        <div class="item lr">
                            <t class="left">Mạng diện rộng (WAN):</t>
                            <t class="right" style="user-select: text;"><?php print WAN_ADDR ?: "Không rõ"; ?></t>
                        </div>

                        <t class="title small">Cài đặt</t>
                        <div id="settings_cPanelToggler" class="item arr sound" data-soundhover>Admin Control Panel</div>
                        <div id="settings_problemToggler" class="item arr sound" data-soundhover>Chỉnh Sửa Test</div>
                        <div id="settings_syslogsToggler" class="item arr sound" data-soundhover>Nhật Ký Hệ Thống</div>
                    </div>

                    <div class="group link">
                        <t class="title">Liên Kết Ngoài</t>
                        <a class="item sound" data-soundhover data-soundselect href="<?php print REPORT_ERROR; ?>" target="_blank" rel="noopener">Báo lỗi</a>
                        <a class="item sound" data-soundhover data-soundselect href="<?php print REPO_ADDRESS; ?>/wiki" target="_blank" rel="noopener">Wiki</a>
                        <a class="item sound" data-soundhover data-soundselect href="<?php print REPO_ADDRESS; ?>" target="_blank" rel="noopener">Source Code</a>
                    </div>

                    <div class="group info">
                        <t class="title">Thông tin Dự án</t>
                        <div id="usett_aboutToggler" class="item arr sound" data-soundhover>Thông tin</div>
                        <div id="usett_licenseToggler" class="item arr sound" data-soundhover>LICENSE</div>

                        <div class="space"></div>
                        <t class="title small">Copyright © 2018-2019 <a href="https://github.com/belivipro9x99" target="_blank" rel="noopener">Belikhun</a>. This project is licensed under the MIT License. See <a href="/LICENSE" target="_blank" rel="noopener">LICENSE</a> for more information.</t>
                    </div>

                </div>
                
            </div>
            
            <div id="usett_panelContainer" class="sub">
            
                <div id="usett_publicFilesPanel" data-soundtoggle="show" class="panel large sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <iframe class="publicFiles-container" src="/public"></iframe>
                        </div>
                    </div>
                </div>

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
                                    <span id="problemEdit_btn_back" class="back sound" data-soundhover></span>
                                </div>
                                <t id="problemEdit_title" class="title">Danh sách</t>
                                <div class="right">
                                    <span id="problemEdit_btn_add" class="add sound" data-soundhover></span>
                                    <span id="problemEdit_btn_check" class="check sound" data-soundhover></span>
                                </div>
                            </div>
                            <div class="problem-container">
                                <ul id="problemEdit_list" class="problem-list sound" data-soundtoggle="hide"></ul>
                                <form id="problemEdit_form" class="problem" action="javascript:void(0);" autocomplete="off">
                                    <div class="formgroup blue">
                                        <input id="problemEdit_id" type="text" class="formfield sound" placeholder="Tên Tệp" data-soundselectsoft required>
                                        <label for="problemEdit_id" class="formlabel">Tên Tệp</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_name" type="text" class="formfield sound" placeholder="Tên Bài" data-soundselectsoft required>
                                        <label for="problemEdit_name" class="formlabel">Tên Bài</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_point" type="number" class="formfield sound" placeholder="Điểm" data-soundselectsoft required>
                                        <label for="problemEdit_point" class="formlabel">Điểm</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_time" type="number" class="formfield sound" placeholder="Thời gian chạy" value="1" data-soundselectsoft required>
                                        <label for="problemEdit_time" class="formlabel">Thời gian chạy</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_inptype" type="text" class="formfield sound" placeholder="Dữ liệu vào" value="Bàn Phím" data-soundselectsoft required>
                                        <label for="problemEdit_inptype" class="formlabel">Dữ liệu vào</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_outtype" type="text" class="formfield sound" placeholder="Dữ liệu ra" value="Màn Hình" data-soundselectsoft required>
                                        <label for="problemEdit_outtype" class="formlabel">Dữ liệu ra</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_accept" type="text" class="formfield sound" placeholder="Đuôi tệp" value="pas|py|cpp|java" data-soundselectsoft required>
                                        <label for="problemEdit_accept" class="formlabel">Đuôi tệp (dùng | để ngăn cách)</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_image" type="file" class="formfield sound" accept="image/*" placeholder="Ảnh" data-soundselectsoft>
                                        <label for="problemEdit_image" class="formlabel">Ảnh (không yêu cầu)</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <textarea id="problemEdit_desc" class="formfield sound" placeholder="Nội dung" data-soundselectsoft required></textarea>
                                        <label for="problemEdit_desc" class="formlabel">Nội dung</label>
                                    </div>
                                    <div class="formgroup blue">
                                        <input id="problemEdit_attachment" type="file" class="formfield sound" placeholder="Tệp tin" data-soundselectsoft>
                                        <label for="problemEdit_attachment" class="formlabel">Tệp đính kèm (không yêu cầu)</label>
                                    </div>
                                    <div class="test-container sound" data-soundhoversoft data-soundselectsoft>
                                        <t class="test">Test ví dụ</t>
                                        <div class="test-list" id="problemEdit_test_list"></div>
                                        <span class="test-add" id="problemEdit_test_add"></span>
                                    </div>
                                    <button id="problemEdit_submit" type="submit"></button>
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
                            <span class="custom sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <iframe class="cpanel-container" src=""></iframe>
                        </div>
                    </div>
                </div>

                <div id="settings_syslogs" data-soundtoggle="show" class="panel large sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="custom delete sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main syslogs-settings">
                        </div>
                    </div>
                </div>

                <div id="usett_aboutPanel" data-soundtoggle="show" class="panel sound">
                    <div class="container">
                        <div class="btn-group">
                            <span class="reload sound" data-soundhover data-soundselect></span>
                            <span class="close sound" data-soundhover></span>
                            <span class="custom sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <footer>
                                <div class="header">
                                    <div class="logo"></div>
                                    <t class="title"><?php print APPNAME; ?></t>
                                    <t class="version">v<?php print VERSION."-".VERSION_TAG; ?></t>
                                    <t class="subtitle">Made from scratch, crafted with <font color="red">❤</font> by Belikhun</t>

                                    <div class="button">
                                        <button class="sq-btn green sound" data-soundhover data-soundselect onclick="this.innerText = randBetween(1, 1000)">Click Me!</button>
                                        <button class="sq-btn pink sound" data-soundhover data-soundselect>(╯°□°）╯︵ ┻━┻</button>
                                    </div>
                                </div>

                                <table class="simple-table">
                                    <tbody>
                                        <tr>
                                            <th>Local</th>
                                            <th>Github</th>
                                        </tr>
                                        <tr>
                                            <td id="about_localVersion">0.0.0</td>
                                            <td id="about_githubVersion">0.0.0</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div class="badge">
                                    <a href="<?php print REPO_ADDRESS; ?>/releases/" target="_blank" rel="noopener"><img src="/tool/badge?su=<?php print VERSION_TAG; ?>&st=v<?php print VERSION; ?>&c=brightgreen"></a>
                                    <img src="/tool/badge?su=license&st=MIT&c=orange">
                                    <img src="/tool/badge?su=status&st=may contain bugs&c=blue">
                                    <img src="/tool/badge?su=author&st=Đỗ Mạnh Hà&c=red">
                                    <a href="http://thptlaclongquan.hoabinh.edu.vn" target="_blank" rel="noopener"><img src="/tool/badge?su=school&st=Lac Long Quan High School, Hoa Binh&c=yellow"></a>
                                </div>
                                
                                <t class="description"><b><?php print APPNAME; ?></b> là một dự án mã nguồn mở, phi lợi nhuận với mục đích chính nhằm biến việc quản lí và tổ chức các buổi học lập trình, ôn tập tin học và tổ chức kì thi trở nên dễ dàng hơn.</t>
                                
                                <t class="contact">Liên hệ:</t>
                                <ul class="contact">
                                    <li class="tel">0368275002</li>
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
                            <span class="custom sound" data-soundhover data-soundselect></span>
                        </div>
                        <div class="main">
                            <iframe class="cpanel-container" src="/license.php"></iframe>
                        </div>
                    </div>
                </div>

            </div>

        </span>

        <div id="wrapper">
            <panel id="wrapperPanel">
                <div class="head">
                    <t class="le"></t>
                    <span class="ri">
                        <i class="material-icons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
                        <i class="material-icons clo sound" title="Đóng" data-soundhover data-soundselect>close</i>
                    </span>
                </div>
                <div class="main">
                </div>
            </panel>
        </div>

        <div id="dialogWrapper">
            <panel id="dialogPanel">
                <div class="head">
                    <t class="le"></t>
                    <span class="ri">
                        <i class="material-icons clo sound" title="Đóng" data-soundhover data-soundselect>close</i>
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
                        <i class="material-icons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
                    </span>
                </div>
                <div class="main fileupload-container">
                    <div id="submitDropzone">
                        <input type="file" id="submitInput" multiple>
                        <t class="title">Thả tệp tại đây</t>
                        <t class="sub">hoặc</t>
                        <label for="submitInput" class="sq-btn dark sound" data-soundhover data-soundselect>Chọn tệp</label>
                    </div>
                    <div class="info">
                        <t id="submitStatus">null</t>
                        <t id="submitFileName">null</t>
                        <div class="progressBar">
                            <div class="bar" id="submitProgressBar"></div>
                            <t class="left" id="submitInfoProgress">0%</t>
                            <t class="right" id="submitInfoSize">00/00</t>
                        </div>
                    </div>
                </div>
            </panel>

            <panel id="timep">
                <div class="head">
                    <t class="le">Thời gian</t>
                    <span class="ri">
                        <i class="material-icons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
                        <i class="material-icons clo sound" title="Đóng" data-soundhover data-soundselect>close</i>
                    </span>
                </div>
                <div class="main time-container">
                    <t id="timeState">---</t>

                    <div class="time">
                        <t id="timeClock">--:--</t>
                        <t id="timeClockMs">--</t>
                    </div>
                    
                    <div class="progressBar">
                        <div class="bar" id="timeProgress"></div>
                        <t class="left" id="timeStart">--:--</t>
                        <t class="right" id="timeEnd">--:--</t>
                    </div>
                </div>
            </panel>

            <panel id="problemp">
                <div class="head">
                    <t class="le">Đề bài</t>
                    <span class="ri">
                        <i class="material-icons bak sound" title="Quay lại" data-soundhover>keyboard_arrow_left</i>
                        <i class="material-icons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
                        <i class="material-icons clo sound" title="Đóng" data-soundhover data-soundselect>close</i>
                    </span>
                </div>
                <div class="main problem-container">
                    <ul class="problem-list sound" data-soundtoggle="hide" id="problemList">
                    </ul>
                    <div class="problem">
                        <t class="name" id="problem_name"></t>
                        <t class="point" id="problem_point"></t>
                        <span class="enlarge" id="problem_enlarge" title="Phóng to"></span>
                        
                        <div class="simple-table-wrapper">
                            <table class="simple-table type">
                                <tr class="filename">
                                    <td>Tên tệp</td>
                                    <td id="problem_type_filename"></td>
                                </tr>
                                <tr class="lang">
                                    <td>Loại tệp</td>
                                    <td id="problem_type_lang"></td>
                                </tr>
                                <tr class="time">
                                    <td>Thời gian chạy</td>
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
                        </div>

                        <t class="description" id="problem_description"></t>
                        <div class="lazyload image" id="problem_image"></div>

                        <div id="problem_attachment" class="attachment">
                            <a id="problem_attachment_link" class="link" href=""></a>
                        </div>

                        <div class="simple-table-wrapper">
                            <table class="simple-table test" id="problem_test"></table>
                        </div>
                    </div>
                </div>
            </panel>

            <panel id="rankp">
                <div class="head">
                    <t class="le">Xếp hạng</t>
                    <span class="ri">
                        <i class="material-icons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
                    </span>
                </div>
                <div class="main ranking-container">
                </div>
            </panel>

            <panel id="logp">
                <div class="head">
                    <t class="le">Nhật ký</t>
                    <span class="ri">
                        <i class="material-icons cus sound" title="Xóa danh sách đang chấm" data-soundhover data-soundselect>gavel</i>
                        <i class="material-icons ref sound" title="Làm mới" data-soundhover data-soundselect>refresh</i>
                    </span>
                </div>
                <div class="main">
                    <ul class="log-item-container">
                    </ul>
                </div>
            </panel>
        </div>

        <!-- Session Data -->
        <script>
            const IS_ADMIN = `<?php print ($id === "admin" ? "true" : "false"); ?>` === "true";
            const LOGGED_IN = `<?php print ($loggedIn === true ? "true" : "false"); ?>` === "true";
            const API_TOKEN = `<?php print isset($_SESSION["api_token"]) ? $_SESSION["api_token"] : null; ?>`;
            const SESSION = <?php print json_encode($sessionData); ?>
        </script>

        <script src="/assets/js/statusbar.js" type="text/javascript"></script>
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
        <script src="/assets/js/core.js" type="text/javascript"></script>
        
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments) }
            gtag("js", new Date());

            gtag("config", "UA-124598427-1", {
                groups: "default",
                custom_map: {
                    dimension1: "version",
                    dimension2: "hostname",
                    dimension3: "versiontag",
                    dimension4: "contestname",
                    dimension5: "platform",
                    dimension6: "darkmode",
                    metric1: "loadtime",
                    metric2: "downlink"
                }
            });
        </script>

    </body>

    </html>