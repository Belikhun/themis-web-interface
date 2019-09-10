<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/rawlog.php                                                                         |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "NORMAL");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

    if ($config["viewLog"] === false && $_SESSION["id"] !== "admin")
        stop(23, "Xem nhật ký đã bị tắt!", 403);

    contest_timeRequire([CONTEST_STARTED], false);
    
    $file = preg_replace("/[\/\\\\]/m", "", reqQuery("f"));
    $logPath = $config["logDir"] ."/". $file .".log";
    
    if (!file_exists($logPath))
        stop(44, "Không tìm thấy tệp nhật kí ". $file, 404);

    if (!(strpos($file, "[". $_SESSION["username"] ."]") > 0) && $config["viewLogOther"] !== true)
        stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);
    
    contentType("txt");
    header("Content-Length: ". filesize($logPath));
    header("Content-Disposition: filename=". pathinfo($logPath, PATHINFO_FILENAME));
    readfile($logPath);

    stop(0, "Thành công!", 200);