<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  config.php                                                                                   |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|
    
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";

?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cài đặt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/statusbar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/scrollbar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/material-font.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/fontawesome.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/calibri.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/input.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/switch.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/config.css" />
</head>

<body id="container">

    <div class="wrapper">
        <form id="form-container" action="javascript:void(0);">
            <div class="group home">
                <t class="title big">Admin Control Panel</t>
                <t class="title small">Thay đổi cài đặt hệ thống</t>

                <div class="space"></div>
            </div>

            <div class="group file">
                <t class="title">Kì thi</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="contest-name" type="text" class="formfield" autocomplete="off" placeholder="Tên kì thi" required>
                        <label for="contest-name" class="formlabel">Tên kì thi</label>
                    </div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="contest-description" type="text" class="formfield" autocomplete="off" placeholder="Mô tả kì thi" required>
                        <label for="contest-description" class="formlabel">Mô tả kì thi</label>
                    </div>
                </div>

            </div>

            <div class="group folder">
                <t class="title">Thư mục</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="uploaddir" type="text" class="formfield" autocomplete="off" placeholder="Thư mục lưu bài làm" required>
                        <label for="uploaddir" class="formlabel">Thư mục lưu bài làm</label>
                    </div>
                </div>
            </div>

            <div class="group clock">
                <t class="title">Thời gian</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time-zone" type="text" class="formfield" autocomplete="off" placeholder="Khu vực" required>
                        <label for="time-zone" class="formlabel">Khu vực</label>
                    </div>
                </div>
                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time-begindate" type="date" class="formfield" autocomplete="off" placeholder="Ngày bắt đầu kì thi" required>
                        <label for="time-begindate" class="formlabel">Ngày bắt đầu kì thi</label>
                    </div>
                </div>
                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time-begintime" type="time" step="1" class="formfield" autocomplete="off" placeholder="Thời gian bắt đầu kì thi" required>
                        <label for="time-begintime" class="formlabel">Thời gian bắt đầu kì thi</label>
                    </div>
                </div>
                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time-during" type="number" class="formfield" autocomplete="off" placeholder="Thời gian làm bài" required>
                        <label for="time-during" class="formlabel">Thời gian làm bài (phút)</label>
                    </div>
                </div>
                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="time-offset" type="number" class="formfield" autocomplete="off" placeholder="Thời gian bù" required>
                        <label for="time-offset" class="formlabel">Thời gian bù (giây)</label>
                    </div>
                </div>
            </div>

            <div class="group star">
                <t class="title">Khác</t>

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
                    <t class="left">Cho phép thay đổi thông tin</t>
                    <label class="sq-checkbox right">
                        <input id="editinfo" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Cho phép xem tệp nhật ký</t>
                    <label class="sq-checkbox right">
                        <input id="viewlog" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
                <div class="item lr sound" data-soundhoversoft>
                    <t class="left">Cho phép xem tệp nhật ký của người khác</t>
                    <label class="sq-checkbox right">
                        <input id="viewlog-other" type="checkbox" class="sound" data-soundcheck>
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>

            <div class="group clock">
                <t class="title">RateLimit</t>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="ratelimit-maxrequest" type="number" class="formfield" autocomplete="off" placeholder="Số yêu cầu tối đa" required>
                        <label for="ratelimit-maxrequest" class="formlabel">Số yêu cầu tối đa</label>
                    </div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="ratelimit-time" type="number" class="formfield" autocomplete="off" placeholder="Thời gian (giây)" required>
                        <label for="ratelimit-time" class="formlabel">Thời gian tối đa thực hiện yêu cầu (giây)</label>
                    </div>
                </div>

                <div class="item sound" data-soundhoversoft>
                    <div class="formgroup blue sound" data-soundselectsoft>
                        <input id="ratelimit-bantime" type="number" class="formfield" autocomplete="off" placeholder="Thời gian cấm yêu cầu (giây)" required>
                        <label for="ratelimit-bantime" class="formlabel">Thời gian cấm yêu cầu (giây)</label>
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
    <script src="data/js/belibrary.js"></script>
    <script src="data/js/statusbar.js"></script>
    <script src="data/js/config.js"></script>

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