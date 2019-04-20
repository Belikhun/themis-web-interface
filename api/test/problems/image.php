<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/problems/image.php                                                                 |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php"; define("STOP_OUTPUT", "errorpage");
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    $id = reqquery("id");
    contest_timeRequire([CONTEST_STARTED], false, false);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    
    if (problem_getImage($id) === PROBLEM_ERROR_IDREJECT)
        stop(44, "Image not found", 404);
    
    stop(0, "Success", 200);