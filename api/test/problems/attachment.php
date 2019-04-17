<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/problems/image.php                                                                 |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php"; define("STOP_OUTPUT", "header");
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    contest_timeRequire([CONTEST_STARTED], false, true, 403);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    
    $id = reqquery("id");

    if (problem_getAttachment($id) === PROBLEM_OKAY)
        writeLog("INFO", "Đã tải tệp đính kèm của bài \"". $_GET["id"] ."\"");
    else
        stop(44, "File not found", 404);