<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/login.php                                                                               |
    //? |                                                                                               |
    //? |  Copyright (c) 2018 Belikhun. All right reserved                                              |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";

    if (islogedin())
        stop(12, "Đã đăng nhập bằng username: ". $_SESSION["username"], 403);
    
    $username = reqform("u");
    $password = reqform("p");
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";

    $res = simplelogin($username, $password);
    if ($res == LOGIN_SUCCESS) {
        $udata = getuserdata($username);
        $_SESSION["username"] = $username;
        $_SESSION["id"] = $udata["id"];
        $_SESSION["name"] = $udata["name"];
        $_SESSION["api_token"] = bin2hex(random_bytes(64));
        session_regenerate_id();
        stop(0, "Đăng nhập thành công.", 200, Array(
            "token" => $_SESSION["api_token"],
            "sessid" => session_id(),
            "redirect" => "/"
        ));
    }
    else if ($res == LOGIN_WRONGPASSWORD)
        stop(14, "Sai mật khẩu!", 403);
    else if ($res == LOGIN_USERNAMENOTFOUND)
        stop(13, "Sai tên đăng nhập!", 403);
    else
        stop(-1, "Lỗi không rõ.", 500);

?>