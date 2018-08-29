<?php
    // |====================================================|
    // |                     login.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";

    if (islogedin())
        stop(9, "You are already logged in!", 403);

    if (!isset($_GET["u"]))
        stop(1, "Undefined GET parameter u.", 400);

    if (!isset($_GET["p"]))
        stop(2, "Undefined GET parameter p.", 400);
    
    $username = trim($_GET["u"]);
    $password = trim($_GET["p"]);
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
        stop(0, "Login Successfully.", 200, Array(
            "token" => $_SESSION["api_token"],
            "redirect" => "/"
        ));
    }
    else if ($res == LOGIN_WRONGPASSWORD)
        stop(4, "Wrong Password!", 403);
    else if ($res == LOGIN_USERNAMENOTFOUND)
        stop(3, "Wrong Username!", 403);
    else
        stop(8, "Unknown Error.", 500);

?>