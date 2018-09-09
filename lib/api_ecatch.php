<?php
    //|====================================================|
    //|                   api_ecatch.php                   |
    //|            Copyright (c) 2018 Belikhun.            |
    //|      This file is licensed under MIT license.      |
    //|====================================================|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    // Error catching
    function api_ethrow($errnum, $errstr, $errfile, $errline) {

        $err = Array(
            "num" => $errnum,
            "str" => $errstr,
            "file" => basename($errfile),
            "line" => $errline,
        );

        stop($errnum, "Error Occurred: ". $errstr, 500, $err);
    }

    set_error_handler("api_ethrow", E_ALL);
    
?>