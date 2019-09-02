<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/info.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

    $username = reqQuery("u");
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";

    $data = getUserData($username);
    unset($data["password"]);
    unset($data["repass"]);

    writeLog("INFO", "Xem thông tin người dùng \"$username\"");
    stop(0, "Thành công!", 200, $data);

?>