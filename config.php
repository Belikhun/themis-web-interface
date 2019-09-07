<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  config.php                                                                                   |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/info.php";

?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cài đặt | <?php print APPNAME ." v". VERSION; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//default.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//statusbar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//scrollbar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/material-font.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//input.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//switch.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//button.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//menu.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css//config.css" />
</head>

<body id="container">

    <div class="wrapper">
        <form id="formContainer" class="menu" action="javascript:void(0);">
            <div class="group home">
                <t class="title big">Admin Control Panel</t>
                <t class="title small">Thay đổi cài đặt hệ thống</t>

                <div class="space"></div>

                <div class="item lr info sound" data-soundhoversoft>
                    <div class="left">
                        <t>Danh sách các biến có sẵn</t>
                        <ul class="text" style="user-select: text">
                            <li><b>%name%</b>: Tên dự án</li>
                            <li><b>%version%</b>: Phiên bản</li>
                            <li><b>%author%</b>: Tên tác giả</li>
                            <li><b>%contestName%</b>: Tên kì thi</li>
                        </ul>
                    </div>
                    <div class="right"></div>
                </div>
            </div>

            <div class="group file">
                <t class="title">Kì thi</t>
                
                <div class="item lr warning sound" data-soundhoversoft>
                    <t class="left"><b>Lưu ý:</b> Tên kì thi, Mô tả kì thi chấp nhận mã HTML. Hãy cẩn thận khi chèn mã HTML vào những trường này.</t>
                    <div class="right"></div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="contest_name" type="text" class="formfield" autocomplete="off" placeholder="Tên kì thi" required>
                        <label for="contest_name" class="formlabel">Tên kì thi</label>
                    </div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="contest_description" type="text" class="formfield" autocomplete="off" placeholder="Mô tả kì thi" required>
                        <label for="contest_description" class="formlabel">Mô tả kì thi</label>
                    </div>
                </div>
                
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Công bố kết quả</t>
                    <label class="sq-checkbox pink right">
                        <input id="publish" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Cho phép nộp bài</t>
                    <label class="sq-checkbox right">
                        <input id="submit" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Các bài nộp lên phải có trong danh sách đề</t>
                    <label class="sq-checkbox right">
                        <input id="submitInProblems" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>

                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Bật bảng Xếp Hạng</t>
                    <label class="sq-checkbox pink right">
                        <input id="viewRank" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Hiển thị điểm các bài làm trong bảng Xếp Hạng</t>
                    <label class="sq-checkbox right">
                        <input id="viewRankTask" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Cho phép xem tệp nhật ký</t>
                    <label class="sq-checkbox pink right">
                        <input id="viewLog" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Cho phép xem tệp nhật ký của người khác</t>
                    <label class="sq-checkbox right">
                        <input id="viewLogOther" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>

            </div>

            <div class="group folder">
                <t class="title">Thư mục</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="uploadDir" type="text" class="formfield" autocomplete="off" placeholder="Thư mục lưu bài làm" required>
                        <label for="uploadDir" class="formlabel">Thư mục lưu bài làm</label>
                    </div>
                </div>
            </div>

            <div class="group clock">
                <t class="title">Thời gian</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time_zone" type="text" class="formfield" autocomplete="off" placeholder="Khu vực" required>
                        <label for="time_zone" class="formlabel">Khu vực</label>
                    </div>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <div class="left formgroup blue sound" data-soundselectsoft>
                        <input id="time_beginDate" type="date" class="formfield" autocomplete="off" placeholder="Ngày bắt đầu kì thi" required>
                        <label for="time_beginDate" class="formlabel">Ngày bắt đầu kì thi</label>
                    </div>
                    <div class="middle formgroup blue sound" data-soundselectsoft>
                        <input id="time_beginTime" type="time" step="1" class="formfield" autocomplete="off" placeholder="Thời gian bắt đầu kì thi" required>
                        <label for="time_beginTime" class="formlabel">Thời gian bắt đầu kì thi</label>
                    </div>
                    <button type="button" id="setTimeToNow" class="right sq-btn blue sound" data-soundhover data-soundselect>Hiện tại</button>
                </div>
                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time_during" type="number" class="formfield" autocomplete="off" placeholder="Thời gian làm bài" required>
                        <label for="time_during" class="formlabel">Thời gian làm bài (phút)</label>
                    </div>
                </div>
                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time_offset" type="number" class="formfield" autocomplete="off" placeholder="Thời gian bù" required>
                        <label for="time_offset" class="formlabel">Thời gian bù (giây)</label>
                    </div>
                </div>
            </div>

            <div class="group star">
                <t class="title">Khác</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="pageTitle" type="text" class="formfield" autocomplete="off" placeholder="Tiêu đề trang" required>
                        <label for="pageTitle" class="formlabel">Tiêu đề trang</label>
                    </div>
                </div>

                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Cho phép thay đổi thông tin</t>
                    <label class="sq-checkbox right">
                        <input id="editInfo" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>

            <div class="group clock">
                <t class="title">RateLimit</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="ratelimit_maxRequest" type="number" class="formfield" autocomplete="off" placeholder="Số yêu cầu tối đa" required>
                        <label for="ratelimit_maxRequest" class="formlabel">Số yêu cầu tối đa</label>
                    </div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="ratelimit_time" type="number" class="formfield" autocomplete="off" placeholder="Thời gian (giây)" required>
                        <label for="ratelimit_time" class="formlabel">Thời gian tối đa thực hiện yêu cầu (giây)</label>
                    </div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="ratelimit_banTime" type="number" class="formfield" autocomplete="off" placeholder="Thời gian cấm yêu cầu (giây)" required>
                        <label for="ratelimit_banTime" class="formlabel">Thời gian cấm yêu cầu (giây)</label>
                    </div>
                </div>

            </div>

            <div class="footer">
                <button type="submit" class="sq-btn green sound" data-soundhover data-soundselect>Lưu thay đổi</button>
            </div>

        </form>
    </div>

    <script>
        const API_TOKEN = `<?php print isset($_SESSION["api_token"]) ? $_SESSION["api_token"] : null; ?>`;
        const USERNAME = `<?php print $_SESSION["username"]; ?>`;
    </script>
    <script src="assets/js/belibrary.js"></script>
    <script src="assets/js/statusbar.js"></script>
    <script src="assets/js/sounds.js"></script>
    <script src="assets/js/config.js"></script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments) }
        gtag("js", new Date());

        gtag("config", "UA-124598427-1");
    </script>
</body>

</html>