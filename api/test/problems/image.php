<?php
	// |====================================================|
    // |                     image.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    contest_timecheck([CONTEST_STARTED], true);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    
    if (!isset($_GET["id"])) {
        http_response_code(400);
        die();
    }

    if (problem_getimage($_GET["id"]) != PROBLEM_OKAY)
        http_response_code(404);