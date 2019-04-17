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

    contest_timeRequire([CONTEST_STARTED], false, true);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    
    $id = reqquery("id");
    
    if (problem_getImage($id) !== PROBLEM_OKAY)
        stop(44, "Image not found", 404);
    
    stop(0, "Success", 200);