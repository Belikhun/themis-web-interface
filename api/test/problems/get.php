<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/problems/get.php                                                                   |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";
    contest_timecheck([CONTEST_STARTED]);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    $id = reqquery("id");
    $data = problem_get($id);

    if (isset($data["image"]))
        $data["image"] = "/api/test/problems/image?id=". $id;
    else
        $data["image"] = null;

    if (isset($data["attachment"]))
        $data["attachment"] = Array(
            "file" => $data["attachment"],
            "url" => "/api/test/problems/attachment?id=". $id,
        );
    else
        $data["attachment"] = Array(
            "file" => null,
            "url" => null
        );

    if ($data === PROBLEM_ERROR_IDREJECT)
        stop(44, "Không tìm thấy để của id đã cho!", 404);
    else
        stop(0, "Success!", 200, $data);