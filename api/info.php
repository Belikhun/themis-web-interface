<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/info.php                                                                                |
    //? |                                                                                               |
    //? |  Copyright (c) 2018 Belikhun. All right reserved                                              |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";

    $username = reqquery("u");
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/xmldb/account.php";

    $data = getuserdata($username);
    unset($data["password"]);
    unset($data["repass"]);

    stop(0, "Thành công!", 200, $data);

?>