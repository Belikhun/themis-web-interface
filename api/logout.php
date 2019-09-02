<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/logout.php                                                                              |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    
    if (!isLogedIn())
        stop(11, "Bạn chưa đăng nhập!", 403);

    checkToken();

    // Unset all of the session variables
    $_SESSION = array();
    $_SESSION["username"] = null;
    session_destroy();

    stop(0, "Đăng xuất thành công.", 200);

?>