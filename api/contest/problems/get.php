<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/get.php                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    
    $id = reqQuery("id");

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
    contest_timeRequire([CONTEST_STARTED], false);

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";
    $data = problemGet($id, $_SESSION["id"] === "admin");

    switch ($data) {
        case PROBLEM_ERROR_IDREJECT:
            stop(44, "Không tìm thấy để của id đã cho!", 404, Array( "id" => $id ));
            break;

        case PROBLEM_ERROR_DISABLED:
            stop(25, "Đề $id đã bị tắt", 403, Array( "id" => $id ));
            break;
    }

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
            "embed" => in_array(strtolower(pathinfo($data["attachment"], PATHINFO_EXTENSION)), ["pdf"])
        );
    } else
        $data["attachment"] = Array(
            "file" => null,
            "size" => 0,
            "url" => null,
            "embed" => false
        );

    stop(0, "Success!", 200, $data);