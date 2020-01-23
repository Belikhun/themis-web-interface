<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/info.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2020 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // SET PAGE TYPE
    define("PAGE_TYPE", "API");
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/logs.php";

    $username = reqQuery("u");
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";

    if (!$data = getUserData($username))
        stop(13, "Không tìm thấy tên người dùng \"$username\"!", 404, Array( "username" => $username ));

    $data = getUserData($username);
    unset($data["password"]);
    unset($data["repass"]);

    stop(0, "Thành công!", 200, $data);
?>