<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/image.php                                                                 |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php"; define("STOP_OUTPUT", "errorpage");
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    function showimg(string $path) {
        contentType(pathinfo($path, PATHINFO_EXTENSION));
        header("Content-length: ". filesize($path));
        readfile($path);
        stop(0, "Success", 200);
    }

    $id = reqQuery("id");
    contest_timeRequire([CONTEST_STARTED], false, false);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";

    if (!isset($problemList[$id]))
        showimg(PROBLEM_DIR ."/image.default");

    if (isset($problemList[$id]["image"])) {
        $i = $problemList[$id]["image"];
        $f = PROBLEM_DIR."/".$id."/".$i;
        showimg($f);
    }

    showimg(PROBLEM_DIR ."/image.default");