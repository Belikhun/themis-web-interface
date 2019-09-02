<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/contest/problems/add.php                                                                |
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
    
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/problems/problem.php";

    $id = preg_replace("/[.\/\\\\]/m", "", reqForm("id"));
    
    $name = reqForm("name");
    $point = reqForm("point");
    if (!is_numeric($point))
        stop(3, "Loại biến không khớp! Yêu cầu form point là number", 400);
    $point = (float)$point;
    $time = getform("time", 1);
    if (!is_numeric($time))
        stop(3, "Loại biến không khớp! Yêu cầu form time là number", 400);
    $time = (float)$time;
    $inptype = getform("inptype", "Bàn Phím");
    $outtype = getform("outtype", "Màn Hình");
    $accept = isset($_POST["acpt"]) ? json_decode($_POST["acpt"], true) : Array("pas", "cpp", "c", "pp", "exe", "class", "py", "java");
    $image = isset($_FILES["img"]) ? $_FILES["img"] : null;
    $attachment = isset($_FILES["attm"]) ? $_FILES["attm"] : null;
    $description = reqForm("desc");
    $test = isset($_POST["test"]) ? json_decode($_POST["test"], true) : Array();

    $code = problemAdd($id, Array(
        "name" => $name,
        "point" => $point,
        "time" => $time,
        "type" => Array(
            "inp" => $inptype,
            "out" => $outtype
        ),
        "accept" => $accept,
        "description" => $description,
        "test" => $test,
    ), $image, $attachment);

    switch ($code) {
        case PROBLEM_OKAY:
            writeLog("OKAY", "Đã thêm đề \"$id\"");
            stop(0, "Success!", 200);
            break;
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Đã có đề với id này!", 400);
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