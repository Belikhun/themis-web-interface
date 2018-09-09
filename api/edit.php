<?php
    // |====================================================|
    // |                      edit.php                      |
    // |            Copyright (c) 2018 Belikhun.            |
    // |      This file is licensed under MIT license.      |
    // |====================================================|

    // Include config file
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/api_ecatch.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/ratelimit.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/lib/belibrary.php";
    require_once $_SERVER["DOCUMENT_ROOT"]."/data/config.php";

    if (!islogedin())
        stop(9, "You are not logged in!", 403);
    $username = $_SESSION["username"];

    if (!isset($_POST["t"]))
        stop(14, "Token required.", 400);
    if ($_POST["t"] !== $_SESSION["api_token"])
        stop(27, "Wrong token!", 403);

    if ($config["editinfo"] == false)
        stop(25, "Thay đổi thông tin đã bị vô hiệu hóa!", 403);

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
            stop(23, "Undefined POST parameter np.", 400);
        $newpass = trim($_POST["np"]);

        if (!isset($_POST["rnp"]))
            stop(23, "Undefined POST parameter rnp.", 400);
        $renewpass = trim($_POST["rnp"]);

        if ($newpass != $renewpass)
            stop(24, "np and rnp does not match.", 400);

        $change["password"] = md5($newpass);
        $change["repass"] = $userdata["repass"] + 1;
    }

    if (!isset($change["name"]) && !isset($change["password"]))
        stop(30, "No Action Taken.", 200);

    if (edituser($username, $change) == USER_EDIT_SUCCESS)
        stop(0, "Success!", 200, $change);
    else
        stop(12, "Edit Failed.", 500);