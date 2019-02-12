<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /api/avt/get.php                                                                             |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    header("Cache-Control: no-cache, no-store, must-revalidate", true);
    
    function showimg(string $path) {
        contenttype(pathinfo($path, PATHINFO_EXTENSION));
        header("Content-length: ". filesize($path));
        readfile($path);
        exit();
    }

    if (!isset($_GET["u"]) || empty($_GET["u"]))
        showimg("avt.default");

    $username = trim($_GET["u"]);
    $username = str_replace("\"", "", $username);
    $username = str_replace("/", "", $username);
    $username = str_replace(".", "", $username);

    $files = glob($username .".*");

    if (count($files) > 0)
        showimg($files[0]);
    else
        showimg("avt.default");
?>