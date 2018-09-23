<?php
    // |====================================================|
    // |                     logout.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|
    

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    
    if (!islogedin())
        stop(11, "Bạn chưa đăng nhập!", 403);

    if (!isset($_POST["token"]))
        stop(4, "Token please!", 400);
    if ($_POST["token"] !== $_SESSION["api_token"])
        stop(5, "Wrong token!", 403);

    // Unset all of the session variables
    $_SESSION = array();
    $_SESSION["username"] = null;

    stop(0, "Đăng xuất thành công.", 200);

?>