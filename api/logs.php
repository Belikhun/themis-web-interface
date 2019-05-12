<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/logs.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập!", 403);

    checkToken();

    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";
    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Access Denied!", 403);

    if (getform("clear", "false") === "true") {
        clearLog();
        stop(0, "Success", 200);
    }

    stop(0, "Success", 200, readLog("json"));