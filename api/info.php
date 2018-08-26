<?php
    // |====================================================|
    // |                      info.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";

    if (!isset($_GET["u"]))
        stop(1, "Missing GET Parameter u.");

    $username = trim($_GET["u"]);
    require_once "xmldb/account.php";

    echo htmlspecialchars(getuserdata($username)["name"], ENT_QUOTES, "UTF-8");

?>