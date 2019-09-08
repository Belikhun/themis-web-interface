<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  account.php                                                                                  |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";

    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Xin lỗi! Bạn không có quyền để xem trang này.", 403);
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Quản lý tài khoản | <?php print APPNAME ." v". VERSION; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/default.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/statusBar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollbar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/material-font.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/input.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/switch.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/spinner.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/assets/css/accountPage.css" />
</head>

<body id="container">
    <div class="wrapper menu">
        <div class="group home">
            <t class="title big">Quản lý tài khoản</t>
            <t class="title small">Thêm, chỉnh sửa hoặc xóa tài khoản</t>

            <div class="space"></div>
        </div>

        <div id="accountContainer">
        </div>
    </div>

    <script>
        const API_TOKEN = `<?php print isset($_SESSION["api_token"]) ? $_SESSION["api_token"] : null; ?>`;
        const USERNAME = `<?php print $_SESSION["username"]; ?>`;
    </script>
    <script src="assets/js/belibrary.js"></script>
    <script src="assets/js/statusBar.js"></script>
    <script src="assets/js/sounds.js"></script>
    <script src="assets/js/account.js"></script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-124598427-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments) }
        gtag("js", new Date());

        gtag("config", "UA-124598427-1");
    </script>
</body>