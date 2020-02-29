<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/viewlog.php                                                                     |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

    if ($config["viewLog"] === false && $_SESSION["id"] !== "admin")
        stop(23, "Xem nhật ký đã bị tắt!", 403);

    contest_timeRequire([CONTEST_STARTED], false);

    $file = preg_replace("/[\/\\\\]/m", "", reqQuery("f"));
    $logPath = $config["logDir"] ."/". $file .".log";

    if (!file_exists($logPath))
        stop(44, "Không tìm thấy tệp nhật kí ". $file, 404);

    $username = $_SESSION["username"];
    if (!(strpos($file, "[". $username ."]") > 0) && $config["viewLogOther"] == false && $_SESSION["id"] !== "admin")
        stop(31, "Không cho phép xem tệp nhật kí của người khác!", 403);

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logParser.php";

    $logParsed = (new logParser($logPath, LOGPARSER_MODE_FULL)) -> parse();
    $userData = getUserData($logParsed["header"]["user"]);
    $logParsed["header"]["name"] = ($userData && isset($userData["name"])) ? $userData["name"] : null;

    stop(0, "Thành công!", 200, $logParsed);
?>