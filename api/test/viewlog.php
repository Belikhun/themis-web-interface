<?php
    // |====================================================|
    // |                    getlog.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!islogedin())
        stop(11, "Bạn chưa đăng nhập.", 403);

    if ($config["viewlog"] == false)
        stop(23, "Xem nhật ký đã bị tắt!", 403);

    $file = reqquery("f");
    $file = str_replace("\"", "", $file);
    $file = str_replace("/", "", $file);

    $username = $_SESSION["username"];

    if (!(strpos($file, "[". $username ."]") > 0))
        stop(44, "Không tìm thấy!", 404);

    $line = Array();
    
    $logf = fopen($config["logdir"] ."/". $file, "r");
    while (($l = fgets($logf)) !== false)
        array_push($line, str_replace(PHP_EOL, "", $l));

    stop(0, "Thành công!", 200, $line);
?>