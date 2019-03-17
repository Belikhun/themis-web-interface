<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/api_ecatch.php                                                                          |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/logs.php";

    if (session_status() === PHP_SESSION_NONE)
        session_start();
    
    if (!defined("ERROR_HANDLING"))
        define("ERROR_HANDLING", "API");

    if (ERROR_HANDLING === "API") {
        function api_ethrow($errnum, $errstr, $errfile, $errline) {

            writeLog("ERRR", "[$errnum] $errstr tại ". basename($errfile) .":$errline");

            $err = Array(
                "num" => $errnum,
                "str" => $errstr,
                "file" => basename($errfile),
                "line" => $errline,
            );

            stop($errnum, "Error Occurred: ". $errstr, 500, $err);
        }

        set_error_handler("api_ethrow", E_ALL);
    }
    
?>