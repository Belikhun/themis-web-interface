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
        stop(9, "Bạn chưa đăng nhập.", 403);

    if ($config["viewlog"] == false)
        stop(25, "Xem nhật ký đã bị vô hiệu hóa!", 403);

    if (!isset($_GET["f"]))
        stop(21, "Undefined GET parameter f.", 400);

    $file = $_GET["f"];
    $file = str_replace("\"", "", $file);
    $file = str_replace("/", "", $file);

    $username = $_SESSION["username"];

    if (!(strpos($file, "[". $username ."]") > 0))
        stop(8, "Lỗi không xác định...", 400);

    $line = Array();
    
    $logf = fopen($config["logdir"] ."/". $file, "r");
    while (($l = fgets($logf)) !== false)
        array_push($line, str_replace(PHP_EOL, "", $l));

    stop(0, "Success!", 200, $line);
?>