<?php
    // |====================================================|
    // |                      edit.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belipack.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/config.php";

    if (!islogedin())
        stop(9, "You are not logged in!", 403);
    $username = $_SESSION["username"];

    if ($allowEditInfo == false)
        stop(25, "Editing info is not allowed!", 403);

    $change = Array();

    if (isset($_GET["n"]))
        $change["name"] = trim($_GET["n"]);

    require_once "xmldb/account.php";
    $userdata = getuserdata($username);

    if (isset($_GET["p"])) {
        $oldpass = $_GET["p"];
        if ($oldpass != $userdata["password"] && md5($oldpass) != $userdata["password"])
            stop(4, "Wrong Password!", 403);

        if (!isset($_GET["np"]))
            stop(23, "Missing GET parameter np.", 400);
        $newpass = trim($_GET["np"]);

        if (!isset($_GET["rnp"]))
            stop(23, "Missing GET parameter rnp.", 400);
        $renewpass = trim($_GET["rnp"]);

        if ($newpass != $renewpass)
            stop(24, "Parameter np and rnp must have the same value.", 400);

        $change["password"] = md5($newpass);
        $change["repass"] = $userdata["repass"] + 1;
    }

    if (!isset($change["name"]) && !isset($change["password"]))
        stop(0, "No Action Taken.", 200);

    if (edituser($username, $change) == USER_EDIT_SUCCESS)
        stop(0, "Success!", 200, $change);
    else
        stop(0, "Edit Failed.", 500);