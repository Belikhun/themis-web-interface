<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/edit.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2019 Belikhun. All right reserved                                              |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!islogedin())
        stop(11, "Bạn chưa đăng nhập!", 403);
    $username = $_SESSION["username"];

    checktoken();

    if ($config["editinfo"] == false)
        stop(21, "Thay đổi thông tin đã bị tắt!", 403);

    $change = Array();

    if (isset($_POST["n"]))
        $change["name"] = htmlspecialchars(trim($_POST["n"]));

    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";
    $userdata = getuserdata($username);

    if (isset($_POST["p"])) {
        $oldpass = $_POST["p"];
        if ($oldpass != $userdata["password"] && md5($oldpass) != $userdata["password"])
            stop(14, "Sai mật khẩu!", 403);

        $newpass = reqform("np");
        $renewpass = reqform("rnp");

        if ($newpass != $renewpass)
            stop(15, "Mật khẩu mới không khớp!", 400);

        $change["password"] = md5($newpass);
        $change["repass"] = $userdata["repass"] + 1;
    }

    if (!isset($change["name"]) && !isset($change["password"]))
        stop(102, "No action taken.", 200);

    if (edituser($username, $change) == USER_EDIT_SUCCESS)
        stop(0, "Thay đổi thông tin thành công!", 200, $change);
    else
        stop(6, "Thay đổi thông tin thất bại.", 500);