<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/edit.php                                                               |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    
    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập.", 403);
    
    checkToken();
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/problems/problem.php";

    $id = preg_replace("/[.\/\\\\]/m", "", reqForm("id"));

    $name = getForm("name");
    $description = getForm("desc");
    $point = getForm("point");
    if (isset($point) && !is_numeric($point))
        $point = null;
    $accept = json_decode(getForm("acpt", Array()), true);
    $test = json_decode(getForm("test", Array()), true);
    $image = isset($_FILES["img"]) ? $_FILES["img"] : null;
    $attachment = isset($_FILES["attm"]) ? $_FILES["attm"] : null;

    $code = problemEdit($id, Array(
        "name" => $name,
        "description" => $description,
        "point" => $point,
        "accept" => $accept,
        "test" => $test,
    ), $image, $attachment);

    switch ($code) {
        case PROBLEM_OKAY:
            writeLog("OKAY", "Đã chỉnh sửa đề \"$id\"");
            stop(0, "Chỉnh sửa đề thành công!", 200, Array( "id" => $id ));
            break;
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Không tìm thấy đề của id đã cho!", 404, Array( "id" => $id ));
            break;
        case PROBLEM_ERROR_FILEREJECT:
            stop(43, "Không chấp nhận loại tệp!", 400, Array( "id" => $id, "allow" => IMAGE_ALLOW ));
            break;
        case PROBLEM_ERROR_FILETOOLARGE:
            stop(42, "Tệp quá lớn!", 400, Array( "id" => $id, "image" => MAX_IMAGE_SIZE, "attachment" => MAX_ATTACHMENT_SIZE ));
            break;
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500, Array( "id" => $id ));
            break;
    }