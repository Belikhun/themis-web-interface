<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/get.php                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    
    $id = reqQuery("id");

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    contest_timeRequire([CONTEST_STARTED], false);

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";
    $data = problemGet($id);

    if (isset($data["image"]))
        $data["image"] = "/api/contest/problems/image?id=". $id;
    else
        $data["image"] = null;

    if (isset($data["attachment"])) {
        $f = PROBLEM_DIR ."/". $id ."/". $data["attachment"];

        $data["attachment"] = Array(
            "file" => $data["attachment"],
            "size" => filesize($f),
            "url" => "/api/contest/problems/attachment?id=". $id,
        );
    } else
        $data["attachment"] = Array(
            "file" => null,
            "size" => 0,
            "url" => null
        );

    if ($data === PROBLEM_ERROR_IDREJECT)
        stop(44, "Không tìm thấy để của id đã cho!", 404);
    else
        stop(0, "Success!", 200, $data);