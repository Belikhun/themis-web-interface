<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/rawlog.php                                                                         |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php"; define("STOP_OUTPUT", "errorpage");
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if ($config["viewLog"] === false)
        stop(23, "Xem nhật ký đã bị tắt!", 403);
    
    $file = reqQuery("f");
    $file = preg_replace("/[\/\\\\]/m", "", $file);
    $logPath = $config["logDir"] ."/". $file .".log";
    
    if (!file_exists($logPath))
        stop(44, "Không tìm thấy tệp nhật kí ". $file, 404);

    if (!(strpos($file, "[". $_SESSION["username"] ."]") > 0) && $config["viewLogOther"] !== true)
        stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);
    
    contentType("txt");
    header("Content-Length: ". filesize($logPath));
    header("Content-Disposition: filename=". pathinfo($logPath, PATHINFO_FILENAME));
    print readfile($logPath);

    stop(0, "Thành công!", 200);