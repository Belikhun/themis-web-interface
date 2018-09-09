<?php
    // |====================================================|
    // |                     login.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";

    if (islogedin())
        stop(9, "Bạn đã đăng nhập bằng một tài khoản khác!", 403);

    if (!isset($_POST["u"]))
        stop(1, "Undefined POST parameter u.", 400);

    if (!isset($_POST["p"]))
        stop(2, "Undefined POST parameter p.", 400);
    
    $username = trim($_POST["u"]);
    $password = trim($_POST["p"]);
    require_once "xmldb/account.php";

    $res = simplelogin($username, $password);
    if ($res == LOGIN_SUCCESS) {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        $udata = getuserdata($username);
        $_SESSION["username"] = $username;
        $_SESSION["id"] = $udata["id"];
        $_SESSION["name"] = $udata["name"];
        $_SESSION["api_token"] = bin2hex(random_bytes(64));
        stop(0, "Đăng nhập thành công.", 200, Array(
            "token" => $_SESSION["api_token"],
            "redirect" => "/"
        ));
    }
    else if ($res == LOGIN_WRONGPASSWORD)
        stop(4, "Sai mật khẩu!", 403);
    else if ($res == LOGIN_USERNAMENOTFOUND)
        stop(3, "Sai tên đăng nhập!", 403);
    else
        stop(8, "Lỗi không rõ.", 500);

?>