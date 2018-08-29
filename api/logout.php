<?php
    // |====================================================|
    // |                     logout.php                     |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|
    

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
    
    if (!islogedin())
        stop(10, "You Are Not Logged In!", 403);

    if (!isset($_GET["t"]))
        stop(14, "Undefined GET parameter t.");
    if ($_GET["t"] !== $_SESSION["api_token"])
        stop(27, "Wrong token!");

    // Unset all of the session variables
    $_SESSION = array();
    $_SESSION["username"] = null;

    stop(0, "Logout Successfully!", 200);

?>