<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/attachment.php                                                         |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php"; define("STOP_OUTPUT", "errorpage");
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    
    $id = reqQuery("id");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
    contest_timeRequire([CONTEST_STARTED], false, false);

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";

    if (problemGetAttachment($id) === PROBLEM_OKAY)
        writeLog("INFO", "Đã tải tệp đính kèm của bài \"". $_GET["id"] ."\"");
    else
        stop(44, "Không tìm thấy tệp đính kèm", 404);