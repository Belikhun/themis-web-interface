<?php
	// |====================================================|
    // |                      edit.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

	require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";

    if (!islogedin())
        stop(11, "Bạn chưa đăng nhập.", 403);

    checktoken();

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    if (getuserdata($_SESSION["username"])["id"] != "admin")
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

    $code = problem_edit($id, Array(
        "name" => $name,
        "description" => $description,
        "point" => $point,
        "accept" => $accept,
        "test" => $test,
    ), $image);

    switch ($code) {
        case PROBLEM_OKAY:
            stop(0, "Success!", 200);
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Không tìm thấy đề của id đã cho!", 404);
        case PROBLEM_ERROR_FILEREJECT:
            stop(43, "Không chấp nhận loại tệp!", 400);
        case PROBLEM_ERROR_FILETOOLARGE:
            stop(42, "Tệp quá lớn!", 400);
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500);
    }