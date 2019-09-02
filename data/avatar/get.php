<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /data/avatar/get.php                                                                         |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php"; define("STOP_OUTPUT", "errorpage");
    header("Cache-Control: no-cache, no-store, must-revalidate", true);
    
    chdir(__DIR__);
    
    function showAvatar(string $path) {
        contentType(pathinfo($path, PATHINFO_EXTENSION))
            ?: contentType("jpg");
            
        header("Content-length: ". filesize($path));
        readfile($path);
        stop(0, "Success", 200);
    }

    if (!isset($_GET["u"]) || empty($_GET["u"]))
        showAvatar("avt.default");

    $username = preg_replace("/[.\/\\\\]/m", "", trim($_GET["u"]));
    $files = glob($username .".{jpg,png,gif,webp}", GLOB_BRACE);

    if (count($files) > 0)
        showAvatar($files[0]);
    else
        showAvatar("avt.default");
?>