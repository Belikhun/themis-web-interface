<?php
    // |====================================================|
    // |                   download.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

    if (!islogedin())
        stop(9, "Bạn chưa đăng nhập.", 403);

    if (!isset($_GET["f"]))
        stop(21, "Missing GET parameter f.", 400);

    $file = $_GET["f"];
    $file = str_replace("\"", "", $file);
    $file = str_replace("/", "", $file);

    $username = $_SESSION["username"];

    if ((strpos($file, "[". $username ."]") > 0) && ($publish == 1)) {
        header("Content-type: text/plain");
        header("Content-Disposition: attachment; filename=\"". $file ."\"");
        readfile($logsDir ."\\". $file);
        die();
    } else
        stop(8, "Lỗi không xác định...", 500);
?>
