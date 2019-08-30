<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/viewlog.php                                                                        |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if ($config["viewLog"] === false)
        stop(23, "Xem nhật ký đã bị tắt!", 403);

    $file = reqQuery("f");
    $file = str_replace("\"", "", $file);
    $file = str_replace("/", "", $file);

    $logPath = $config["logDir"] ."/". $file .".log";

    if (!file_exists($logPath))
        stop(44, "Không tìm thấy tệp nhật kí ". $file, 404);

    $username = $_SESSION["username"];
    if (!(strpos($file, "[". $username ."]") > 0) && $config["viewLogOther"] == false)
        stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logParser.php";

    $logParsed = (new logParser($logPath, LOGPARSER_MODE_FULL)) -> parse();
    $logParsed["header"]["name"] = getUserData($logParsed["header"]["user"])["name"] ?: null;

    stop(0, "Thành công!", 200, $logParsed);
?>