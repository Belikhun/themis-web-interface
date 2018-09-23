<?php
    // |====================================================|
    // |                      info.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";

    if (!isset($_GET["u"]))
        stop(1, "Undefined query: u", 400);

    $username = trim($_GET["u"]);
    require_once "xmldb/account.php";

    $data = getuserdata($username);
    unset($data["password"]);
    unset($data["repass"]);

    stop(0, "Thành công!", 200, $data);

?>