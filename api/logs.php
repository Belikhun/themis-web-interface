<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/logs.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập!", 403);

    checkToken();

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    if (getForm("clear", "false") === "true") {
        clearLog();
        stop(0, "Xóa nhật ký thành công!", 200);
    }

    $logs = array_reverse(readLog("json"));
    $logsTotal = max(count($logs), 1);
    $showCount = (int) getForm("show", $logsTotal);
    $maxPage = (int) floor($logsTotal / $showCount);
    $pageNth = (int) getForm("page", 0);
    $from = ($pageNth) * $showCount;
    $to = min(($pageNth + 1) * $showCount, $logsTotal);

    $slicedLogs = array_slice($logs, $from, $to - $from);

    stop(0, "Success", 200, Array(
        "total" => $logsTotal,
        "perPage" => $showCount,
        "maxPage" => $maxPage,
        "pageNth" => $pageNth,
        "from" => $from,
        "to" => $to,
        "logs" => $slicedLogs
    ), true);