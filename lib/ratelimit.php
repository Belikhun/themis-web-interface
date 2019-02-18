<?php
    //? |-----------------------------------------------------------------------------------------------|
    //? |  /lib/ratelimit.php                                                                           |
    //? |                                                                                               |
    //? |  Copyright (c) 2018-2019 Belikhun. All right reserved                                         |
    //? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
    //? |-----------------------------------------------------------------------------------------------|

    require_once $_SERVER["DOCUMENT_ROOT"] ."/lib/belibrary.php";

    $maxrequest = 60;
    $perseconds = 10;
    $bantime = 15;

    if (!isset($_SESSION["firstrequest"]))
        $_SESSION["firstrequest"] = time();
    if (!isset($_SESSION["requestcount"]))
        $_SESSION["requestcount"] = 0;
    if (!isset($_SESSION["banned"]))
        $_SESSION["banned"] = false;
    if (!isset($_SESSION["unban"]))
        $_SESSION["unban"] = 0;

    $first = $_SESSION["firstrequest"];
    $now = time();

    if ($_SESSION["banned"] && $_SESSION["unban"] <= $now) {
        //unban
        $_SESSION["banned"] = false;
        $_SESSION["firstrequest"] = $now;
        $_SESSION["requestcount"] = 0;
    } else {
        if (($now - $first) < $perseconds && !$_SESSION["banned"]) {
            //count
            $_SESSION["requestcount"]++;
            if ($_SESSION["requestcount"] > $maxrequest) {
                //ban
                $_SESSION["banned"] = true;
                $_SESSION["unban"] = $now + $bantime;
                printbanmsg();
            }
        } else if($_SESSION["banned"]) {
            printbanmsg();
        } else {
            $_SESSION["requestcount"] = 0;
            $_SESSION["firstrequest"] = $now;
        }
    }

    function printbanmsg() {
        global $bantime;
        global $now;
        $time = $_SESSION["unban"] - $now;
        stop(
            32,
            "NO SPAMMING IN THE HALL! ". $time ." seconds detention for you! You should know better.",
            429,
            Array(
                "reset" => $time,
                "start" => $_SESSION["unban"] - $bantime,
                "end" => $_SESSION["unban"]
            )
        );
    }

?>