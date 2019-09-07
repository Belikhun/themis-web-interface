<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  account.php                                                                                  |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|
    
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/config.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/data/xmldb/account.php";

    if (getUserData($_SESSION["username"])["id"] !== "admin")
        stop(31, "Xin lỗi! Bạn không có quyền để xem trang này.", 403);
?>