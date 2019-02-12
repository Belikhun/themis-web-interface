<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/ecatch.php                                                                              |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Error catching
    function errorthrow($errnum, $errstr, $errfile, $errline, $errcode = 500) {
        $customerr = true;

        if (!is_numeric($errcode)) {
            $customerr = false;
            $errcode = 500;
        }

        $err = array(
            "num" => $errnum,
            "str" => $errstr,
            "file" => basename($errfile),
            "line" => $errline,
            "errcode" => $errcode
        );
        $_SESSION["errordata_array"] = $err;
        http_response_code($errcode);
        
        if ($customerr) {
            echo "<iframe src=\"/lib/error.php\" style=\"position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: unset; overflow: hidden;\"></iframe>";
        } else {
            require $_SERVER["DOCUMENT_ROOT"]."/lib/error.php";
        }

        die();
    }

    set_error_handler("errorthrow", E_ALL);
    
?>