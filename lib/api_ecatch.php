<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/api_ecatch.php                                                                          |
    //? |                                                                                               |
    //? |  Copyright (c) 2019 Belikhun. All right reserved                                              |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

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