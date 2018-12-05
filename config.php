<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  config.php                                                                                   |
    //? |                                                                                               |
    //? |  Copyright (c) 2018 Belikhun. All right reserved                                              |
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
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/input.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/switch.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/config.css" />
</head>

<body id="container">

    <form id="form-container" action="javascript:void(0);">
        <ul class="contest">
            <li class="title">Kì thi</li>
            <li class="name">
                <div class="formgroup blue">
                    <input id="contest-name" type="text" class="formfield" autocomplete="off" placeholder="Tên kì thi" required>
                    <label for="contest-name" class="formlabel">Tên kì thi</label>
                </div>
            </li>
            <li class="description">
                <div class="formgroup blue">
                    <input id="contest-description" type="text" class="formfield" autocomplete="off" placeholder="Mô tả kì thi" required>
                    <label for="contest-description" class="formlabel">Mô tả kì thi</label>
                </div>
            </li>
        </ul>

        <ul class="dir">
            <li class="title">Thư mục</li>
            <li class="upload">
                <div class="formgroup blue">
                    <input id="uploaddir" type="text" class="formfield" autocomplete="off" placeholder="Thư mục lưu bài làm" required>
                    <label for="uploaddir" class="formlabel">Thư mục lưu bài làm</label>
                </div>
            </li>
        </ul>

        <ul class="time">
            <li class="title">Thời gian</li>
            <li class="zone">
                <div class="formgroup blue">
                    <input id="time-zone" type="text" class="formfield" autocomplete="off" placeholder="Khu vực" required>
                    <label for="time-zone" class="formlabel">Khu vực</label>
                </div>
            </li>
            <li class="begindate">
                <div class="formgroup blue">
                    <input id="time-begindate" type="date" class="formfield" autocomplete="off" placeholder="Ngày bắt đầu kì thi" required>
                    <label for="time-begindate" class="formlabel">Ngày bắt đầu kì thi</label>
                </div>
            </li>
            <li class="begintime">
                <div class="formgroup blue">
                    <input id="time-begintime" type="time" step="1" class="formfield" autocomplete="off" placeholder="Thời gian bắt đầu kì thi" required>
                    <label for="time-begintime" class="formlabel">Thời gian bắt đầu kì thi</label>
                </div>
            </li>
            <li class="during">
                <div class="formgroup blue">
                    <input id="time-during" type="number" class="formfield" autocomplete="off" placeholder="Thời gian làm bài" required>
                    <label for="time-during" class="formlabel">Thời gian làm bài</label>
                </div>
            </li>
            <li class="offset">
                <div class="formgroup blue">
                    <input id="time-offset" type="number" class="formfield" autocomplete="off" placeholder="Thời gian bù" required>
                    <label for="time-offset" class="formlabel">Thời gian bù</label>
                </div>
            </li>
        </ul>

        <ul class="other">
            <li class="title">Khác</li>
            <li class="publish">
                <t class="left">Công bố kết quả</t>
                <label class="material-switch right">
                    <input id="publish" type="checkbox">
                    <span class="track"></span>
                </label>
            </li>
            <li class="submit">
                <t class="left">Cho phép nộp bài</t>
                <label class="material-switch right">
                    <input id="submit" type="checkbox">
                    <span class="track"></span>
                </label>
            </li>
            <li class="editinfo">
                <t class="left">Cho phép thay đổi thông tin</t>
                <label class="material-switch right">
                    <input id="editinfo" type="checkbox">
                    <span class="track"></span>
                </label>
            </li>
            <li class="viewlog">
                <t class="left">Cho phép xem tệp nhật ký</t>
                <label class="material-switch right">
                    <input id="viewlog" type="checkbox">
                    <span class="track"></span>
                </label>
            </li>
        </ul>

        <div class="footer">
            <button type="submit" class="btn blue">Lưu thay đổi</button>
        </div>
    </form>

    <script>
        const API_TOKEN = "<?php print isset($_SESSION["api_token"]) ? $_SESSION["api_token"] : null; ?>";
        const USERNAME = "<?php print $_SESSION["username"]; ?>";
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