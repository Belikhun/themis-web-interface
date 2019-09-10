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

    if ($_SESSION["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    if (getForm("clear", "false") === "true")
        clearLog();

    $logs = readLog("json");
    $logsTotal = max(count($logs) - 1, 0);
    $showCount = (int) getForm("show", $logsTotal);
    $maxPage = (int) $showCount === 0 ? 1 : floor(($logsTotal + 1) / $showCount);
    $pageNth = (int) getForm("page", 0);
    $from = max($logsTotal - ($pageNth + 1) * $showCount + 1, 1);
    $to = $logsTotal - ($pageNth) * $showCount;

    $slicedLogs = array_reverse(array_slice($logs, $from - 1, $to - $from + 1));

    stop(0, "Success", 200, Array(
        "total" => $logsTotal,
        "perPage" => $showCount,
        "maxPage" => $maxPage,
        "pageNth" => $pageNth,
        "from" => $from,
        "to" => $to,
        "logs" => $slicedLogs
    ), true);