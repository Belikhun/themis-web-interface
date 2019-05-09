<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/viewlog.php                                                                        |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if ($config["viewlog"] === false)
        stop(23, "Xem nhật ký đã bị tắt!", 403);

    $file = reqquery("f");
    $file = str_replace("\"", "", $file);
    $file = str_replace("/", "", $file);

    $lf = $config["logdir"] ."/". $file .".log";

    if (!file_exists($lf))
        stop(44, "Không tìm thấy tệp nhật kí ". $file, 404);

    $username = $_SESSION["username"];

    if (!(strpos($file, "[". $username ."]") > 0) && $config["viewlogother"] == false)
        stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);

    $line = Array();
    $logf = fopen($lf, "r");
    while (($l = fgets($logf)) !== false)
        array_push($line, str_replace(PHP_EOL, "", $l));

    stop(0, "Thành công!", 200, $line);
?>