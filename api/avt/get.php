<?php
    // |====================================================|
    // |                      get.php                       |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    header("Cache-Control: no-cache, no-store, must-revalidate", true);
    
    if (!isset($_GET["u"]) || empty($_GET["u"])) {
        contenttype("jpg");
        header("Content-length: ". filesize("avt.default"));
        readfile("avt.default");
        exit();
    }

    $username = trim($_GET["u"]);
    $username = str_replace("\"", "", $username);
    $username = str_replace("/", "", $username);
    $username = str_replace(".", "", $username);

    $files = glob($username .".*");

    if (count($files) > 0) {
        $ext = pathinfo($files[0], PATHINFO_EXTENSION);
        contenttype($ext);
        header("Content-length: ". filesize($username. "." .$ext));
        readfile($username. "." .$ext);
    } else {
        contenttype("jpg");
        header("Content-length: ". filesize("avt.default"));
        readfile("avt.default");
    }

    exit();
?>