<?php
	// |====================================================|
    // |                       add.php                      |
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
    $id = str_replace("\"", "", $id);
    $id = str_replace("/", "", $id);
    $id = str_replace(".", "", $id);
    
    $name = reqform("name");
    $description = reqform("desc");
    $accept = isset($_POST["acpt"]) ? json_decode($_POST["acpt"], true) : Array();
    $test = isset($_POST["test"]) ? json_decode($_POST["test"], true) : Array();
    $image = isset($_FILES["img"]) ? $_FILES["img"] : null;

    $code = problem_add($id, Array(
        "name" => $name,
        "description" => $description,
        "accept" => $accept,
        "test" => $test,
    ), $image);

    switch ($code) {
        case PROBLEM_OKAY:
            stop(0, "Success!", 200);
        case PROBLEM_ERROR_IDREJECT:
            stop(45, "Đã có đề với id này!", 400);
        case PROBLEM_ERROR_FILEREJECT:
            stop(43, "Không chấp nhận loại tệp!", 400);
        case PROBLEM_ERROR_FILETOOLARGE:
            stop(42, "Tệp quá lớn!", 400);
        case PROBLEM_ERROR:
            stop(-1, "Lỗi không rõ.", 500);
    }