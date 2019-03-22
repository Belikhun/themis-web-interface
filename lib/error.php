<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/error.php                                                                               |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

    if (isset($_GET["c"]) && is_numeric($_GET["c"])) {
        http_response_code($_GET["c"]);
        $_SERVER["REDIRECT_STATUS"] = $_GET["c"];
    }

    $sv = $_SERVER["SERVER_SOFTWARE"];
    $sv_ip = $_SERVER["SERVER_ADDR"];
    $sv_pr = $_SERVER["SERVER_PROTOCOL"];
    $uri = $_SERVER["REQUEST_URI"];
    $cl_ip = $_SERVER["REMOTE_ADDR"];
    $cl = $_SERVER["HTTP_USER_AGENT"];
    if (isset($_SERVER["REDIRECT_STATUS"]))
        $errCode = $_SERVER["REDIRECT_STATUS"];
    elseif (isset($_GET["code"]))
        $errCode = trim($_GET["code"]);
    else
        $errCode = null;
    
    $errDetail = null;

    if (isset($_SESSION["lastError"])) {
        $err = $_SESSION["lastError"];
        $_SESSION["lastError"] = null;

        $errCode = $err["errcode"];
        http_response_code($errCode);
        $errDetail = "<b>Lỗi[".$err["num"]."]:</b> <i>" . $err["str"] . "</i> tại <i>" . $err["file"] . "</i> dòng " . $err["line"];
    }

    switch ($errCode) {
        case 200:
            $name = "This is not a error";
            $desc = "Who take you here?";
            break;
        case 400:
            $name = "Bad Request";
            $desc = "The request cannot be fulfilled due to bad syntax.";
            break;
        case 401:
            $name = "Unauthorized";
            $desc = "Authentication is required and has failed or has not yet been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the requested resource.";
            break;
        case 403:
            $name = "Forbidden";
            $desc = "Hey, Thats illegal! You are not allowed to access $sv_ip$uri. Or iS iT ?";
            break;
        case 404:
            $name = "Not Found";
            $desc = "Không thể tìm thấy $sv_ip$uri trên máy chủ.";
            break;
        case 405:
            $name = "Method Not Allowed";
            $desc = "A request method is not supposed for the requested resource.";
            break;
        case 406:
            $name = "Not Acceptable";
            $desc = "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.";
            break;
        case 408:
            $name = "Request Timeout";
            $desc = "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time.";
            break;
        case 414:
            $name = "URI Too Long";
            $desc = "The URI provided was too long for the server to process.";
            break;
        case 500:
            $name = "Internal Server Error";
            $desc = "the server did an oopsie";
            break;
        case 502:
            $name = "Bad Gateway";
            $desc = "The server received an invalid response while trying to carry out the request.";
            break;
        default:
            $name = "Sample Text";
            $desc = "Much strangery page, Such magically error, wow";
            break;
    }

    writeLog("WARN", "Got statuscode \"". $errCode ." ". $name ."\" when trying to access: ". $uri);
?>

<!DOCTYPE html>
<html lang="vi-VN">

<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title><?php print $errCode ." ". $name; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/error.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/scrollbar.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/css/button.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="/data/fonts/calibri.css" />
</head>

<body>
    <div class="background"></div>

    <div class="main-container">

        <p class="code">
            <span class="protocol"><?php print $sv_pr; ?></span>
            <?php print $errCode; ?>
        </p>
        <p class="name"><?php print $name; ?></p>
        <p class="desc"><?php print $desc; ?></p>
        <p class="detail"><?php print $errDetail; ?></p>
        <p class="info">
            Client: <?php print $cl; ?><br>
            Server: <?php print $sv . " PHP/" . phpversion(); ?><br>
            Your IP: <?php print $cl_ip; ?><br>
        </p>

        <button class="sq-btn" onclick="location.href = '/'">Về Trang Chủ</button>

    </div>

    <div class="footer">
        <img src="/data/img/icon.webp" class="icon">
        <p><?php print APPNAME; ?>. Copyright (c) 2018-2019 Belikhun. This project is licensed under the MIT License.</p>
    </div>

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