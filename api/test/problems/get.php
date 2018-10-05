<?php
	// |====================================================|
    // |                       get.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";

    if (!isset($_GET["id"]))
        stop(1, "Undefined query: id", 400);

    if (($data = problem_get($_GET["id"])) == PROBLEM_ERROR_IDREJECT)
        stop(44, "Không tìm thấy để của id đã cho!", 404);
    else
        stop(0, "Success!", 200, $data);