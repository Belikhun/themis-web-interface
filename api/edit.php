<?php
    // |====================================================|
    // |                      edit.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!islogedin())
        stop(9, "Bạn chưa đăng nhập!", 403);
    $username = $_SESSION["username"];

    if (!isset($_POST["t"]))
        stop(14, "Yêu cầu token.", 400);
    if ($_POST["t"] !== $_SESSION["api_token"])
        stop(27, "Sai token!", 403);

    if ($config["editinfo"] == false)
        stop(25, "Thay đổi thông tin đã bị vô hiệu hóa!", 403);

    $change = Array();

    if (isset($_POST["n"]))
        $change["name"] = trim($_POST["n"]);

    require_once "xmldb/account.php";
    $userdata = getuserdata($username);

    if (isset($_POST["p"])) {
        $oldpass = $_POST["p"];
        if ($oldpass != $userdata["password"] && md5($oldpass) != $userdata["password"])
            stop(4, "Sai mật khẩu!", 403);

        if (!isset($_POST["np"]))
            stop(23, "Chưa xác định giá trị np.", 400);
        $newpass = trim($_POST["np"]);

        if (!isset($_POST["rnp"]))
            stop(23, "Chưa xác định giá trị rnp.", 400);
        $renewpass = trim($_POST["rnp"]);

        if ($newpass != $renewpass)
            stop(24, "Mật khẩu không trùng khớp!", 400);

        $change["password"] = md5($newpass);
        $change["repass"] = $userdata["repass"] + 1;
    }

    if (!isset($change["name"]) && !isset($change["password"]))
        stop(30, "Không hành động nào được thực hiện.", 200);

    if (edituser($username, $change) == USER_EDIT_SUCCESS)
        stop(0, "Thành công!", 200, $change);
    else
        stop(12, "Chỉnh sửa thất bại.", 500);