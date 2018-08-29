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

    if (!isset($_GET["t"]))
        stop(14, "Undefined GET parameter t.");
    if ($_GET["t"] !== $_SESSION["api_token"])
        stop(27, "Wrong token!");

    if ($allowEditInfo == false)
        stop(25, "Editing info is not allowed!", 403);

    $change = Array();

    if (isset($_POST["n"]))
        $change["name"] = trim($_POST["n"]);

    require_once "xmldb/account.php";
    $userdata = getuserdata($username);

    if (isset($_POST["p"])) {
        $oldpass = $_POST["p"];
        if ($oldpass != $userdata["password"] && md5($oldpass) != $userdata["password"])
            stop(4, "Wrong Password!", 403);

        if (!isset($_POST["np"]))
            stop(23, "Undefined GET parameter np.", 400);
        $newpass = trim($_POST["np"]);

        if (!isset($_POST["rnp"]))
            stop(23, "Undefined GET parameter rnp.", 400);
        $renewpass = trim($_POST["rnp"]);

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