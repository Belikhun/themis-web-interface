<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/edit.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập!", 403);

    $username = $_SESSION["username"];
    checkToken();

    $change = Array();

    if (isset($_POST["n"])) {
        if ($config["edit"]["name"] === false && $_SESSION["id"] !== "admin")
            stop(21, "Thay đổi tên đã bị tắt!", 403);

        $change["name"] = htmlspecialchars(trim($_POST["n"]));
        if (strlen($change["name"]) > 34)
            stop(16, "Tên người dùng không được vượt quá 34 kí tự", 400);
    }

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    $userdata = getUserData($username);

    if (isset($_POST["p"])) {
        if ($config["edit"]["password"] === false && $_SESSION["id"] !== "admin")
            stop(21, "Thay đổi mật khẩu đã bị tắt!", 403);

        $oldpass = $_POST["p"];

        if (($resp = simpleLogin($username, $oldpass)) === LOGIN_WRONGPASSWORD)
            stop(14, "Sai mật khẩu!", 403);
        elseif ($resp !== LOGIN_SUCCESS)
            stop(-1, "Sth went soooo wrong.", 500);

        $newpass = reqForm("np");
        $renewpass = reqForm("rnp");

        if ($newpass !== $renewpass)
            stop(15, "Mật khẩu mới không khớp!", 400);

        $change["password"] = password_hash($newpass, PASSWORD_DEFAULT);
        $change["repass"] = $userdata["repass"] + 1;
    }

    if (empty($change))
        stop(102, "No action taken.", 200);

    $res = editUser($username, $change);

    switch ($res) {
        case USER_EDIT_SUCCESS:
            writeLog("INFO", "Đã thay đổi ". (isset($change["name"]) ? "tên thành \"". $change["name"] ."\"" : "") . ((isset($change["name"]) && isset($change["password"])) ? " và " : "") . (isset($change["password"]) ? "mật khẩu" : ""));
            stop(0, "Thay đổi thông tin thành công!", 200, $change);
            break;
        case USER_EDIT_WRONGUSERNAME:
            stop(13, "Không tìm thấy tài khoản \"$username\"!", 400, Array( "username" => $username ));
            break;
        case USER_EDIT_ERROR:
            writeLog("ERRR", "Lỗi khi lưu thông tin tài khoản [$id] \"$username\"");
            stop(-1, "Lỗi không rõ.", 500);
            break;
    }