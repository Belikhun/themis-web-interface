<?php
    // |====================================================|
    // |                    getlog.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

    if (!islogedin())
        stop(9, "Bạn chưa đăng nhập.", 403);

    if (!isset($_GET["t"]))
        stop(14, "Undefined GET parameter t.");
    if ($_GET["t"] !== $_SESSION["api_token"])
        stop(27, "Wrong token!");

    if (!isset($_GET["f"]))
        stop(21, "Undefined GET parameter f.", 400);

    $file = $_GET["f"];
    $file = str_replace("\"", "", $file);
    $file = str_replace("/", "", $file);

    $username = $_SESSION["username"];

    if (!(strpos($file, "[". $username ."]") > 0) || $publish == false)
        stop(8, "Lỗi không xác định...", 400);

    $line = Array();
    
    $logf = fopen($logsDir ."/". $file, "r");
    while (($l = fgets($logf)) !== false)
        array_push($line, str_replace(PHP_EOL, "", $l));

    stop(0, "Success!", 200, $line);
?>