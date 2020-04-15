<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/logs.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";

    // SET PAGE TYPE
    if (getQuery("output") == "text")
        define("PAGE_TYPE", "NORMAL");
    else
        define("PAGE_TYPE", "API");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

    if (!isLoggedIn())
        stop(11, "Bạn chưa đăng nhập!", 401);

    if ($_SESSION["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    if (getQuery("output") == "text") {
        contentType("log");
        print(readLog("text", true));
        stop(0, "Success!", 200);
    }

    checkToken();

    if (getForm("clear", "false") === "true")
        clearLog();

    $logs = readLog("json");
    $logsTotal = count($logs);
    $showCount = (int) getForm("show", $logsTotal);
    $maxPage = (int) floor($logsTotal / $showCount) + (($logsTotal % $showCount === 0) ? 0 : 1);
    $pageNth = (int) getForm("page", 1);
    $from = ($pageNth - 1) * $showCount;
    $to = $pageNth * $showCount - 1;

    if ($pageNth < 1 || $pageNth > $maxPage)
        stop(6, "Trang bạn yêu cầu không nằm trong khoảng thỏa mãn", 400, Array(
            "total" => $logsTotal,
            "maxPage" => $maxPage
        ));

    $slicedLogs = array_slice(array_reverse($logs), $from, $to - $from + 1);

    stop(0, "Success", 200, Array(
        "total" => $logsTotal,
        "perPage" => $showCount,
        "maxPage" => $maxPage,
        "pageNth" => $pageNth,
        "from" => $from + 1,
        "to" => $to + 1,
        "logs" => $slicedLogs
    ), true);