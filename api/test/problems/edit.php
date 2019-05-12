<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/test/problems/edit.php                                                                  |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";
    
    if (!isLogedIn())
    stop(11, "Bạn chưa đăng nhập.", 403);
    
    checkToken();
    
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    $id = reqform("id");
    $name = getform("name");
    $description = getform("desc");
    $point = getform("point");
    if (isset($point) && !is_numeric($point))
        $point = null;
    $accept = json_decode(getform("acpt", Array()), true);
    $test = json_decode(getform("test", Array()), true);
    $image = isset($_FILES["img"]) ? $_FILES["img"] : null;
    $attachment = isset($_FILES["attm"]) ? $_FILES["attm"] : null;

    $code = problem_edit($id, Array(
        "name" => $name,
        "description" => $description,
        "point" => $point,
        "accept" => $accept,
        "test" => $test,
    ), $image, $attachment);

    switch ($code) {
        case PROBLEM_OKAY:
            writeLog("OKAY", "Đã chỉnh sửa đề \"$id\"");
            stop(0, "Success!", 200);
            break;
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Không tìm thấy đề của id đã cho!", 404);
            break;
        case PROBLEM_ERROR_FILEREJECT:
            stop(43, "Không chấp nhận loại tệp!", 400);
            break;
        case PROBLEM_ERROR_FILETOOLARGE:
            stop(42, "Tệp quá lớn!", 400);
            break;
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }